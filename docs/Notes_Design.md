# Notes — Design Document

*Chat 82 · May 16, 2026 · Opus*

*Design document for the per-item notes feature. Covers current state, open questions, recommendations, and rough implementation sketches. Not a kickoff brief — decisions still pending in §3.*

---

## 1. Purpose

Per-item notes let the user attach a free-text comment to any product card they check. The feature exists today but has gaps: notes don't persist, they leak to Supabase on every share, and one piece of edit-back code is silently dead. This document maps what's actually there, then proposes target behavior for each gap.

---

## 2. Current state

### 2.1 Where notes live

**Single source of truth: `itemNotes` in search.js (line 1428).**

```js
var itemNotes = {};   // asin → note string
```

It's a plain JS object in panel memory. Not persisted. Not shared between Amazon tabs. Wiped when:

- the panel is closed
- the Amazon search page is refreshed or navigated away from
- the browser is restarted

`core.js` has no notes logic. Notes don't touch `chrome.storage.local` at all.

### 2.2 The two "note" fields

There are two distinct fields that both use the word "note." They are not user-facing names — they only appear in code — but they cause friction when reading the codebase.

| Field | What it is | Who writes it | Who shows it |
|---|---|---|---|
| `note` (on payload to compare) | User-typed note | The human | Panel widget, compare table "Notes" column |
| `ppuNote` (on payload to compare) | System explanation of PPU calculation | `analysePPU()` and helpers in search.js | Below PPU value in compare table |

Inside search.js the system explanation is called `r.note` on the raw row object. It gets **renamed to `ppuNote`** at the moment of payload construction (search.js:3463-3464):

```js
note:    itemNotes[r.asin] || '',   // user note
ppuNote: r.note || '',              // system PPU explanation
```

So `note` means two different things depending on which side of that boundary you're on. See §6 for what to do about this.

### 2.3 Panel-side note widget (search.js)

**Anatomy.** A `.ppu-note-widget` div is injected into the row's `.ppu-row-content` when the checkbox is checked (search.js:2942-2944). The widget has two visual states:

- **Empty state.** Shows the link `＋ Add a note…` (`.ppu-note-add-link`).
- **Filled state.** Shows the note text (truncated to 80 chars + ellipsis) and an `Edit` link (`.ppu-note-edit-link`).

Clicking either link calls `auShowNoteTextarea()` (search.js:2497-2513), which replaces the widget's contents with a `<textarea>`. On `blur`, the textarea's value is written to `itemNotes[asin]` and the widget refreshes back to filled state.

**Visibility tied to checkbox.** The widget is only injected when the item is checked. Unchecking removes the textarea from the DOM but preserves the value in `itemNotes` first (search.js:2946-2948):

```js
// Preserve note before removing textarea
var ta = row.querySelector('.ppu-item-note');
if (ta) { itemNotes[asin] = ta.value; ta.parentNode.removeChild(ta); }
```

So the data survives a check/uncheck cycle within a session — but the widget isn't visible while unchecked. There's no way to add a note without first checking the item.

**Re-render path.** On a full render (e.g. sort change, filter change), the note field is built directly into the row HTML using `escapeHtml()` (search.js:2871-2879), and the add/edit links are re-wired by explicit `querySelectorAll().forEach()` listeners (search.js:3132-3148).

### 2.4 Compare-side note column (compare.html)

When the user clicks Compare, the payload is POSTed to Supabase. The compare page is opened with `?id=...` and pulls the data back. Each item carries its `note` field (which is `itemNotes[asin]` on the panel side).

**Compare table column.** There's a "Notes" column (compare.html:1288) rendered as a `<textarea>` (compare.html:1390-1391), pre-filled with `item.note`. Always visible — not gated on checkbox state like the panel.

**Sort.** Notes column sortable: checked-items-first, then alphabetical by note text (compare.html:919-925).

**Edit handler.** Every keystroke in a `.note-textarea`:
1. Updates `item.note` in `currentItems` (compare's in-memory state) so re-renders preserve the edit
2. Updates `checkedAsins[asin].note` if checked
3. Sends `chrome.runtime.sendMessage({ type: 'AU_UPDATE_NOTE', asin, note })` to "sync back to extension"

**Problem with step 3.** Nothing listens for `AU_UPDATE_NOTE`. Grep across search.js, compare.html, and core.js returns one hit — the `sendMessage` call itself. No handler. (background.js wasn't uploaded this session; the message channel would need a listener there too, but search.js doesn't register one either.) See §7 for what this means in practice.

### 2.5 Sharing flow

There are two paths that write to Supabase:

**Path A — Compare button on panel (search.js:3483-3502).** Every click. The full item set with all notes is POSTed. The user lands on `compare.html?id=...`. This isn't "sharing" in the user's mental model — it's just opening the compare view. But the data is publicly addressable by anyone who has the URL.

**Path B — "Share checked items" / "Share this comparison" buttons on compare (compare.html:1672-1692, 2156-2200).** Explicit. Re-saves the (possibly edited) checked items as a new Supabase row and copies the new URL to the clipboard.

**No notes/no-notes choice in either path.** Notes always go. There's no UI to strip them.

**Supabase row contents.** A single JSON blob (`data` field) containing the full items array plus `searchTerm`. No auth on read — `?id=eq.${id}` with the anon key returns the row to anyone who asks.

### 2.6 Summary table

| Question | Answer |
|---|---|
| Where do notes live? | `itemNotes` in search.js memory, plus `item.note` on the compare payload |
| Do they persist across panel close? | **No.** |
| Do they persist across page refresh? | **No.** |
| Do they sync from compare back to panel? | **No** (dead message, no listener). |
| Do they go to Supabase on Compare? | **Yes**, always. |
| Are shared notes visible to anyone with the URL? | **Yes.** |
| Can the user clear them? | Implicitly — close the panel. No explicit "clear notes" UI. |

---

## 3. Open questions (deferred decisions)

Three of the four design decisions surfaced this session were deferred for later. This section documents the options for each, with a recommendation and rough implementation sketch.

### 3.1 Persistence — should notes survive panel close?

**Options:**

**Option A — Persist locally (chrome.storage.local).** Notes saved to `chrome.storage.local` keyed by ASIN. Survive panel close, page refresh, browser restart. Same product searched later → old note reappears.

- Pro: matches probable user expectation. Notes feel substantive.
- Pro: makes the dead edit-back wire fixable (§3.3 option A becomes meaningful).
- Con: storage grows unboundedly without cleanup. Notes for products the user never sees again still take space. `chrome.storage.local` quota is ~10MB; not a near-term problem but worth noting.
- Con: same-ASIN-different-search-session re-display might feel surprising the first time it happens. Mitigated by it being the user's own text.

**Option B — Keep ephemeral.** No code change. Design doc and (eventually) UI affordance make the limit explicit so users don't expect persistence.

- Pro: zero implementation cost.
- Pro: storage stays tidy.
- Con: notes feel fragile. User loses work to a refresh.
- Con: if they share a compare link, the only persistent copy of their note lives on Supabase — which is the worst privacy posture combined with the least durable user-side copy.

**Option C — Persist locally + clear-all in Settings.** Same as A, plus a "Clear all my notes" button in Settings (Phase 5 territory). Optionally a per-note clear (X next to each note widget).

- Pro: addresses A's storage-growth concern by giving the user agency.
- Pro: small UX cost — one button in Settings.
- Con: marginal complexity. Need to decide whether clear-all also clears notes embedded in already-shared Supabase rows (it doesn't — those are separate copies on a separate server).

**Recommendation: Option C.** Persistence is the change that makes the feature actually useful. The clear-all button is cheap to add and removes the "but storage will grow forever" objection. The per-note X is optional — defer if it complicates the widget.

**Implementation sketch (Option C):**

1. **New storage key in core.js.** Add `AU_ITEM_NOTES_KEY = 'au_item_notes'` and helpers:
   ```js
   function auNotesGet(callback) {
     chrome.storage.local.get(AU_ITEM_NOTES_KEY, function(r) {
       callback(r[AU_ITEM_NOTES_KEY] || {});
     });
   }
   function auNotesSet(notes, callback) {
     chrome.storage.local.set({ [AU_ITEM_NOTES_KEY]: notes }, callback || function(){});
   }
   function auNotesClearAll(callback) {
     chrome.storage.local.remove(AU_ITEM_NOTES_KEY, callback || function(){});
   }
   ```
2. **search.js init.** Replace `var itemNotes = {};` with a load on panel boot:
   ```js
   var itemNotes = {};
   auNotesGet(function(loaded) { itemNotes = loaded; });
   ```
3. **search.js write path.** Wherever `itemNotes[asin] = value` happens (textarea `input`, `blur`, uncheck preservation), follow it with `auNotesSet(itemNotes)`. Debounce if needed — textarea `input` fires per-keystroke.
4. **Settings (Phase 5 work).** Add a "Clear all notes" button that calls `auNotesClearAll()` then resets `itemNotes = {}` and re-renders.

Race-condition note: `auNotesGet` is async; first-paint may render the panel before notes load. Either show the panel without notes and patch them in on load, or block the first render. Probably the former — notes aren't essential to first paint.

---

### 3.2 Sharing — should notes go to Supabase?

This is the privacy question. See also §4.

**Options:**

**Option A — Strip notes by default; opt-in to include.** Compare button strips notes from the payload before POST. On compare.html, a checkbox like "Include my notes in shareable link" lets the user re-attach them before sharing.

- Pro: privacy-safe default. Sensitive notes (medical, gift-related, personal reactions) never leak by accident.
- Con: compare table shows empty Notes column unless user explicitly opts in. Friction.
- Con: complicates the share button — now there are two share modes (with/without notes).

**Option B — Include notes by default; opt-out per share.** Current behavior plus a "Strip my notes from this share" checkbox on compare.html before the Share button.

- Pro: minimal disruption to current UX. Notes show up on compare like today.
- Con: still leaks on the most common path (clicking Compare without thinking about sharing). The compare URL is publicly addressable whether or not the user shares it.
- Con: depends on the user remembering to tick the box. Easy to forget.

**Option C — Always strip; notes are device-local only.** Notes never leave the user's machine. The compare payload has empty `note` fields. Compare table shows the note from local storage (looked up by ASIN client-side), not from Supabase.

- Pro: cleanest privacy posture. Nothing to leak.
- Pro: simplifies the share button — no toggle needed.
- Con: shared compare links don't carry the sharer's notes. If the user explicitly wants to share notes (e.g. "here's my comparison, with my thoughts"), they can't.
- Con: requires compare.html to read from `chrome.storage.local` for the user's own notes (only works for the original sharer, not viewers of a shared link — which is arguably the point).

**Recommendation: Option C.** Reasoning:
- The current default is the worst case (notes leak silently, no UI hint that they're public). Any of the three options improves it.
- Option A's opt-in friction would suppress the feature for legitimate sharing use cases — but those use cases are rare relative to the "user just clicked Compare to open the view" case.
- Option C makes the privacy story trivial to explain: "Your notes never leave your computer." That's a cleaner public message than "Notes go to Supabase unless you tick a box."
- The genuine "I want to share my notes" use case can be handled later by an explicit "Export comparison with notes" feature that produces a downloadable file the user mails to a friend — different mechanism, different mental model, no public URL.

**Implementation sketch (Option C):**

1. **search.js payload (line 3463).** Change `note: itemNotes[r.asin] || ''` to `note: ''`. (Or remove the field entirely — but keeping it as empty string avoids a schema break with existing compare.html code.)
2. **compare.html init.** After loading the comparison from Supabase, look up local notes by ASIN and patch them into `currentItems`:
   ```js
   chrome.storage.local.get('au_item_notes', function(r) {
     var localNotes = r.au_item_notes || {};
     currentItems.forEach(function(it) {
       if (localNotes[it.asin]) it.note = localNotes[it.asin];
     });
     rerender();
   });
   ```
   This works because compare.html is an extension page with `chrome.storage` access.
3. **For viewers of a shared link.** They won't have the sharer's notes in their own storage. They'll see empty note columns. That's correct — they shouldn't see the sharer's private notes.
4. **Privacy/about copy.** Update privacy.html and any onboarding to state: "Notes stay on your computer. They are never sent to Actually Useful's servers or included in shareable links."

This option depends on §3.1 being **A or C** (persistence). If notes stay ephemeral (§3.1 B), Option C here means notes only appear on the same-session compare view and disappear on any refresh — which is fine but worth being explicit about.

---

### 3.3 Edit-back from compare.html — fix or remove?

**Options:**

**Option A — Fix the dead wire.** Register a `chrome.runtime.onMessage` listener in search.js (or background.js as a relay) that handles `AU_UPDATE_NOTE` and updates `itemNotes[asin]`. Edit on compare → panel notes update.

- Pro: single source of truth. User edits in either place, both stay in sync.
- Pro: matches the apparent original intent of the code.
- Con: requires a panel to be open and listening. If the user opens compare in a tab while the panel is closed on the Amazon search tab, the message goes nowhere. Need to define the "panel not open" case (queue? drop? rely on storage as the bus?).
- Con: only meaningful if §3.1 = A or C (persistence). Without persistence, there's nothing to keep in sync — the panel forgets on refresh anyway.

**Option B — Drop the dead wire.** Remove the `sendMessage` call from compare.html. Accept that compare and panel are separate surfaces. Edits on each side are independent.

- Pro: simpler code. No cross-surface messaging.
- Pro: matches current reality — the wire was already dead, removing it just makes the code honest.
- Con: surprising if user expects edits to propagate. "I edited it on compare, why is the old version showing on the panel?"

**Option C — Use chrome.storage as the bus.** If §3.1 = A or C, both surfaces read/write `chrome.storage.local`. Add a `chrome.storage.onChanged` listener on each side to repaint when the other writes. No direct messaging needed.

- Pro: works whether or not the panel is open.
- Pro: single source of truth without the queue-or-drop problem.
- Pro: composes naturally with persistence (§3.1).
- Con: requires both surfaces to handle storage events. Modest but real.

**Recommendation: Option C**, assuming §3.1 lands on A or C. The storage-as-bus pattern dodges the "panel not open" edge case and makes the sync mechanism the same thing as the persistence mechanism — one design, not two.

If §3.1 lands on B (no persistence), recommend **Option B** here — just remove the dead wire. There's no point fixing a sync mechanism for data that doesn't survive a refresh.

**Implementation sketch (Option C):**

1. **search.js.** On boot, register:
   ```js
   chrome.storage.onChanged.addListener(function(changes, area) {
     if (area !== 'local' || !changes.au_item_notes) return;
     itemNotes = changes.au_item_notes.newValue || {};
     // Re-render visible note widgets without full panel re-render
     document.querySelectorAll('.ppu-note-widget').forEach(function(w) {
       var row = w.closest('.ppu-row');
       var asin = row && row.getAttribute('data-asin');
       if (asin) auRefreshNoteWidget(w, asin);
     });
   });
   ```
2. **compare.html.** On note textarea `input`, write to `chrome.storage.local`:
   ```js
   ta.addEventListener('input', function() {
     var asin = this.getAttribute('data-asin');
     var note = this.value;
     currentItems.forEach(function(it) { if (it.asin === asin) it.note = note; });
     if (checkedAsins[asin]) checkedAsins[asin].note = note;
     // Replace the dead AU_UPDATE_NOTE message with a storage write
     chrome.storage.local.get('au_item_notes', function(r) {
       var notes = r.au_item_notes || {};
       notes[asin] = note;
       chrome.storage.local.set({ au_item_notes: notes });
     });
   });
   ```
   Debounce the write (e.g. 300ms after last keystroke) so we're not hammering storage on every character.
3. **Remove the dead `AU_UPDATE_NOTE` sendMessage call** in compare.html:1629. Or leave it as a no-op and just stop relying on it — but cleaner to remove.

---

## 4. Privacy

Per-item notes are user-generated free text. They can contain anything:

- Personal reactions ("ugly, my mom would hate it")
- Medical context ("for my hip flare")
- Financial details ("under $40 because rent due")
- Gift surprises ("birthday gift for Sam — DON'T LET HIM SEE")
- Health conditions, family member names, identifying details

### 4.1 Current threat model

**What gets transmitted today:** Every Compare click sends the full notes set to Supabase as part of the comparison payload, in a publicly-addressable row keyed by an opaque ID.

**Who can read it:**
- Anyone with the share URL.
- Anyone who guesses or scrapes the ID (depending on how Supabase generates IDs — UUIDs are effectively unguessable, but the row is readable without auth).
- Anthropic's Supabase project admin (Melissa) via the dashboard.
- Anyone who later gains access to the Supabase project (e.g. via a breach or a misconfiguration).

**What the user can do about it today:** Nothing. There's no UI to strip notes before share. There's no warning that notes go to Supabase. The privacy page (privacy.html) would need to be checked to see whether this is even disclosed.

### 4.2 Recommendations (cross-references §3.2)

1. **Option C in §3.2 is the cleanest fix.** Notes never leave the device. Public privacy claim becomes simple and accurate.
2. **If you reject Option C in §3.2**, add a visible affordance on the panel: a small text or icon near the note widget stating notes go to Supabase on Compare. Surfacing the leak is better than burying it.
3. **Update privacy.html** to reflect whichever option is chosen. Don't ship a notes change without the privacy page being current.
4. **Consider whether existing Supabase rows containing notes should be purged.** Current rows from past Compare clicks have notes in them. This is a one-time data-cleanup decision. Probably worth doing if Option C is chosen — sets a clean baseline for any "we don't have your notes" claim.

---

## 5. Naming gotcha — `note` vs `ppuNote`

Per Q4 decision this session: **leave the names alone, document the distinction.**

### The distinction

- `r.note` on a raw row object (inside search.js, after `analysePPU()` runs) is a **system-generated PPU explanation**. Examples: `"Amazon said $0.12/oz; overridden (solid product)"`, `"converted from per-can price"`, `"Sold in pairs — PPU is Amazon's figure and may be per pair or per item."`
- `itemNotes[asin]` in search.js is a **user-typed note**.
- On the compare payload (search.js:3463-3464), these are renamed:
  - User note → `note`
  - System PPU explanation → `ppuNote`
- On compare.html, `item.note` is the user note (editable) and `item.ppuNote` is the system explanation (displayed inline below the PPU value, never editable).

### Why this matters in practice

When reading search.js, `r.note` could mean either thing depending on whether you're upstream or downstream of the payload-rename at line 3463. Two heuristics that hold:

- Anywhere `result.note = ...` is assigned inside `analysePPU()` or its helpers, it's a **system PPU explanation**.
- Anywhere `itemNotes[asin]` is read or written, it's a **user note**.

The rename to `ppuNote` only happens at the payload boundary. There is no other place in the codebase where the two are confused.

### If a future refactor revisits this

Rename `r.note` to `r.ppuExplanation` (or similar) throughout `analysePPU()` and downstream. Touches search.js extensively but is mechanical. Compare.html's `ppuNote` payload field could either rename to match (`ppuExplanation`) or stay as a separate decision. Deferred indefinitely — not blocking anything.

---

## 6. Known issues

Six items, ordered roughly by impact:

1. **Notes go to Supabase silently on every Compare click.** No UI surface, no privacy hint. Resolves with §3.2 decision.

2. **Notes don't persist across panel close or page refresh.** Resolves with §3.1 decision.

3. **`AU_UPDATE_NOTE` message has no listener.** Edit-back from compare.html silently fails. Resolves with §3.3 decision. Currently dead code, no user-visible bug — but a maintenance trap (someone might later assume the sync works).

4. **Widget only visible while item is checked.** No way to add a note without checking. Probably intentional (notes are tied to "items I care enough to compare") but worth documenting. If notes become persistent (§3.1), this constraint feels stranger — a user might want to annotate items they're not currently comparing. Defer; revisit after §3.1 lands.

5. **No per-item or bulk note deletion in the panel UI.** Empty the textarea is the only way today. Clearing all is impossible without `chrome.storage` reset. Resolves with §3.1 Option C.

6. **Note text in renders uses `escapeHtml()` in one path (search.js:2876, the re-render path) and direct `textContent` assignment in another (search.js:2522, the widget refresh).** Both are XSS-safe, but inconsistency is a smell. Low priority, no actual vulnerability.

---

## 7. Out of scope

Explicitly **not** part of this design:

- **Rich text in notes.** Plain text only. No markdown, no formatting, no images.
- **Notes on items not in the search.** Notes are ASIN-scoped; they appear when that ASIN appears in a search. No general note-taking surface.
- **Shared notes / collaborative notes.** No multi-user model.
- **Note search or filtering.** Sort by note presence exists on compare; full-text search of notes does not.
- **Export.** "Export comparison with notes" was floated as an alternative to share-with-notes (§3.2 recommendation). Not designed here. Future phase.
- **Notes on the bug-report flow.** The bug-report textarea uses different code (`#ppu-bug-notes`) and a different concept ("notes about this bug"). Separate feature; not covered.

---

## 8. Decisions needed before kickoff

Three decisions are deferred from §3. Each blocks Phase 9 (or whichever phase implements notes), but they can be made independently of any other work:

| Decision | Recommendation | Blocks |
|---|---|---|
| **§3.1 Persistence** | Option C (persist + clear-all) | §3.3 (edit-back). Implementation order: §3.1 → §3.3. |
| **§3.2 Sharing** | Option C (always strip; local-only) | privacy.html update. |
| **§3.3 Edit-back** | Option C (storage-as-bus), if §3.1 = A or C; otherwise Option B (drop wire) | Nothing downstream. |

A reasonable bundle: §3.1 C + §3.2 C + §3.3 C. All three lean the same direction (local-first, storage as the spine, no cross-surface messaging, no Supabase for notes). Together they make the feature persistent, private, and synced — with one mechanism doing the work of three.

---

*End of design doc.*
