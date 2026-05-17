# Phase 8B — Kickoff Brief

*Notes implementation — persistence, sharing, edit-back, privacy*

*Author: Opus, Chat 85. Executor: Sonnet, next session.*

*Date: May 17, 2026*

---

## 0. Read this first

You are Sonnet. You are executing Phase 8B.

**Before reading this brief, read:**
1. `Handover_Chat83.md`
2. `changelog_entry_chat83.md`
3. Then `Notes_Design.md`

The reading order matters. §3.2 of Notes_Design.md recommends Option C (always strip; notes device-local only). **That recommendation is stale.** Melissa chose **Option A** — opt-in checkbox at Compare time, default off. The doc has not been updated. Do not design around Option C for §3.2.

**Locked decisions (non-negotiable):**

| Decision | Chosen option |
|---|---|
| §3.1 Persistence | **C** — persist to `chrome.storage.local` + clear-all in Settings |
| §3.2 Sharing | **A** — opt-in checkbox, default off (NOT C — see above) |
| §3.3 Edit-back | **C** — storage-as-bus |

**Rules of engagement:**

- Melissa does not write code. You do.
- Stop and confirm before changing anything you're not sure about. Stop especially before any decision marked **CONFIRM** in this brief.
- Use Melissa's exact wording for user-facing copy. Suggestions welcome — flag them and let her decide.
- Skip sycophancy. Direct criticism welcome.
- One Sonnet session. **End-of-session: produce all four bundle-close documents** — Handover, Changelog, updated Roadmap, updated Briefing. Phase 8B is the bundle close.
- Do not bump `manifest.json` version. That's for CWS push, which happens separately.

**Pre-session checklist for Melissa:**

1. Upload fresh from GitHub: `search.js`, `compare.html`, `core.js`, `privacy.html`. All four will be touched.

(Settings is embedded in `search.js` as `openSettings()` at lines 4015-4404. No separate file to upload.)

---

## 1. Scope summary

Phase 8B implements the three locked decisions from Notes_Design.md §3, plus the required privacy.html update.

**Files touched in 8B:**

- `core.js` — new storage key + helper functions
- `search.js` — persistence wiring, share-checkbox gating, clear-all wiring, storage-as-bus listener
- `compare.html` — storage-as-bus write, storage init on load, note-share checkbox on share buttons, remove dead `AU_UPDATE_NOTE` sendMessage call
- `privacy.html` — copy update for opt-in sharing model

**Files NOT touched in 8B:**

- `styles.css` — no visual changes expected
- `background.js` — storage-as-bus doesn't need a relay; no messaging
- `manifest.json` — no version bump
- `welcome.html`, `index.html` — out of scope

**Out of scope for 8B** (per Notes_Design.md §7):

- Rich text, note search/filtering, export, per-note X delete button (defer)
- Purging existing Supabase rows that contain notes from before this change — one-time data-cleanup decision; Melissa to decide separately

---

## 2. Implementation plan — four workstreams

### 2.1 §3.1 — Persistence (core.js + search.js)

**What changes:**

Add a notes storage key and three helpers to `core.js`. Wire them into search.js's init, write paths, and clear-all.

**core.js — add constants and helpers.** Match the existing `AU_SHORTLIST_KEY` / `auShortlistGet` / `auShortlistSet` pattern (lines 9, 14-22 in core.js). Use `const`, not `var`, and a computed-key set:

```js
const AU_ITEM_NOTES_KEY = 'au_item_notes';

function auNotesGet(callback) {
  chrome.storage.local.get(AU_ITEM_NOTES_KEY, function (result) {
    callback(result[AU_ITEM_NOTES_KEY] || {});
  });
}

function auNotesSet(notes, callback) {
  chrome.storage.local.set({ [AU_ITEM_NOTES_KEY]: notes }, callback || function () {});
}

function auNotesClearAll(callback) {
  chrome.storage.local.remove(AU_ITEM_NOTES_KEY, callback || function () {});
}
```

Place these alongside the shortlist helpers in the "Storage keys" / "Shortlist Management" sections.

**search.js — init:** Replace `var itemNotes = {};` (line 1428) with:

```js
var itemNotes = {};
auNotesGet(function(loaded) { itemNotes = loaded; });
```

**search.js — write paths:** Wherever `itemNotes[asin] = value` is assigned (textarea `input`, `blur`, uncheck preservation at line 2946-2948), follow with `auNotesSet(itemNotes)`. Debounce the `input` write — the handler fires per-keystroke. A 300ms debounce is fine.

**Race condition:** `auNotesGet` is async. First paint may render the panel before notes load. Show the panel without notes and patch them in on load — notes are not essential to first paint. No blocking.

**Settings — clear-all button:** Add a "Clear all notes" button to the §7.4 Privacy section of the Settings panel (search.js:4199-4210, alongside the existing telemetry toggle). On confirmed click: call `auNotesClearAll()`, reset `itemNotes = {}`, re-render the panel.

**Use the existing two-click-confirm pattern** from the Reset button at search.js:4355-4403:
- First click → button text changes to "Click again to confirm", 3-second revert timer starts
- Second click within 3 seconds → destructive action fires
- Timeout → button reverts to original text

Match this pattern exactly. Don't invent a new confirmation UX.

---

### 2.2 §3.2 — Sharing (search.js + compare.html)

**What changes:**

Notes are stripped from the Supabase payload by default. An opt-in checkbox lets the user include them. This affects two Supabase write paths (one in search.js, one in compare.html).

**The two write paths:**

- **Path A — Compare button on panel.** `search.js` Compare-button POST at lines 3484-3502. Currently sends `note: itemNotes[r.asin] || ''` at line 3463.
- **Path B — Share buttons on compare.html.** Both share flows funnel through `saveComparison(items, searchTerm)` at compare.html:2366. The two entry points:
  - "Share checked items" handler — compare.html:1912-1932 (`shareCheckedBtn`)
  - "Share this comparison" handler — compare.html:2402-2436 (`attachShareHandler`, applied to `top-share-btn` and `bottom-share-btn`)

**Architectural implication:** Path B has one chokepoint (`saveComparison`) but Path A doesn't go through a shared helper. The opt-in checkbox gate should be implemented as:
- **Path A:** inline at the payload-construction site in search.js (line 3463 — read the checkbox state, gate `itemNotes[r.asin]` accordingly).
- **Path B:** inside `saveComparison()` itself — read checkbox state once, strip notes from `items` before POST. Both share buttons pick up the gate for free.

**Default behavior — strip notes from both paths:**

Path A (search.js:3463): change `note: itemNotes[r.asin] || ''` to gate on the checkbox state — empty string when unchecked, current value when checked.

Path B (compare.html:2366, inside `saveComparison`): before the POST, if the checkbox is unchecked, map `items` to a copy with `note: ''` on each entry.

(Keep the `note` field present in both cases — empty string avoids any schema surprise. Don't remove the field entirely.)

**Opt-in mechanism — checkbox:**

The user can opt in to include notes. The checkbox appears in two places:

1. **On the panel, near the Compare button** — read before Path A fires.
2. **On compare.html, near the share buttons** — read by `saveComparison()` before Path B fires.

Checkbox state: **unchecked by default**. Not persisted — each Compare or Share action starts unchecked. (Rationale: opt-in to exposure should be a deliberate per-action decision, not a sticky preference someone forgets they set.)

**CONFIRM:** What is the exact user-facing label for the opt-in checkbox? Suggested copy (flag for Melissa decision): *"Include my notes in the shared link"* — but this is a suggestion. Use Melissa's wording.

**CONFIRM:** On compare.html, the checkbox appears once globally (read by `saveComparison`), not once per share button. Both share buttons share one source of truth. Confirm placement — recommendation is the action bar (where "Share checked items" lives), with the second share button at the top/bottom of the table picking up the same state.

---

### 2.3 §3.3 — Edit-back / storage-as-bus (search.js + compare.html)

**What changes:**

Replace the dead `AU_UPDATE_NOTE` message wire with `chrome.storage.onChanged` listeners on both surfaces. Both surfaces read and write the same `au_item_notes` key. Changes made on one surface propagate to the other automatically via storage events.

**search.js — add storage listener on boot:**

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

**compare.html — init (load notes from storage on page load):**

After the comparison data loads from Supabase, look up local notes by ASIN and patch them into `currentItems`:

```js
chrome.storage.local.get('au_item_notes', function(r) {
  var localNotes = r.au_item_notes || {};
  currentItems.forEach(function(it) {
    if (localNotes[it.asin]) it.note = localNotes[it.asin];
  });
  rerender();
});
```

**compare.html — modify the existing textarea input handler:**

The handler already exists at compare.html:1858-1875. It currently updates `currentItems` / `checkedAsins` in memory, then tries to fire the dead `AU_UPDATE_NOTE` message.

**Remove this dead block at compare.html:1867-1871:**

```js
if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
  try {
    chrome.runtime.sendMessage({ type: 'AU_UPDATE_NOTE', asin: asin, note: note });
  } catch(e) {}
}
```

Don't leave it as a no-op — it's a maintenance trap.

**Replace with a debounced storage write.** Final handler shape:

```js
ta.addEventListener('input', function() {
  var asin = this.getAttribute('data-asin');
  var note = this.value;
  // Update in-memory items so rerenders preserve the note (existing behavior)
  currentItems.forEach(function(it) { if (it.asin === asin) it.note = note; });
  if (checkedAsins[asin]) checkedAsins[asin].note = note;
  // Write to chrome.storage.local (replaces dead AU_UPDATE_NOTE sendMessage)
  scheduleNoteWrite(asin, note);
});
```

Where `scheduleNoteWrite` is a small debouncer that batches per-ASIN writes (~300ms):

```js
var _noteWriteTimers = {};
function scheduleNoteWrite(asin, note) {
  clearTimeout(_noteWriteTimers[asin]);
  _noteWriteTimers[asin] = setTimeout(function() {
    chrome.storage.local.get('au_item_notes', function(r) {
      var notes = r.au_item_notes || {};
      notes[asin] = note;
      chrome.storage.local.set({ au_item_notes: notes });
    });
  }, 300);
}
```

**compare.html — add storage.onChanged listener:**

```js
chrome.storage.onChanged.addListener(function(changes, area) {
  if (area !== 'local' || !changes.au_item_notes) return;
  var localNotes = changes.au_item_notes.newValue || {};
  currentItems.forEach(function(it) {
    it.note = localNotes[it.asin] || it.note;
  });
  rerenderTableOnly();
});
```

**Viewers of shared links:** They won't have the sharer's notes in their own storage. They'll see empty note columns. This is correct — they shouldn't see someone else's private notes.

---

### 2.4 privacy.html — copy update

**What changes:**

The current privacy.html has no mention of notes. Phase 8B ships a notes feature with a specific sharing model: notes are stripped by default and only included when the user opts in. That model needs to be reflected in the privacy page.

**Existing copy — accuracy issue.** The current "The comparison page" section (privacy.html:261-265) says shared comparisons contain *"only product information from Amazon — no personal information."* This has been technically inaccurate since notes shipped — notes can contain personal information and currently always go to Supabase. Phase 8B fixes the underlying behavior (notes stripped by default), but under the opt-in path notes still can go. Two ways to handle this:

- **Option 1 — Add a new "Notes" section beside the existing one.** Leave existing copy alone. New paragraph (Melissa-approved, below) covers the local-by-default + opt-in model. The existing claim becomes effectively true for the default path.
- **Option 2 — Edit the existing paragraph too.** Tighten it to reflect that the opt-in path is the exception, e.g. "...contains product information from Amazon. See below for how notes are handled."

**CONFIRM with Melissa which option** before editing privacy.html. Either is defensible.

**Copy — approved by Melissa. Use verbatim:**

> *Notes you add to items are stored locally on your computer. They are not included in shared comparison links by default. If you choose to include your notes when sharing, they are saved to the comparison database along with product information. Notes included in a shared link are accessible to anyone who has the link.*

Place this either as a new section with `<p class="section-label">Notes</p>` heading (Option 1) or integrated under "The comparison page" section (Option 2).

---

## 3. Open design decisions — CONFIRM before coding

Three items need Melissa's input before implementation. Raise all three at session start.

| # | Decision | Default if no answer |
|---|---|---|
| 1 | Exact label for the opt-in share checkbox (panel + compare.html) | Use suggested copy "Include my notes in the shared link", flagged |
| 2 | Checkbox placement on compare.html: which UI spot (action bar, near share buttons, header?) | In the action bar near "Share checked items"; read globally by `saveComparison()` |
| 3 | privacy.html: add new section beside existing copy, or edit existing copy too? | Option 1 (add new section, leave existing alone) |

---

## 4. Implementation order

Order matters — the persistence helpers in core.js underpin everything else.

1. **core.js** — add `AU_ITEM_NOTES_KEY` and the three helper functions
2. **search.js** — init load + write-path persistence + clear-all wiring + storage listener + share-checkbox UI near Compare button
3. **compare.html** — storage init on load + debounced write + remove dead sendMessage + storage listener + share-checkbox in action bar gating `saveComparison()`
4. **privacy.html** — add Melissa-approved Notes copy (placement option per §3 CONFIRM #3)

Raise all CONFIRMs first. Don't start coding until answers are in.

---

## 5. End-of-session deliverables

Phase 8B closes the bundle. At session end, produce all four documents:

- `Handover_Chat85.md`
- `changelog_entry_chat85.md`
- `Roadmap_Chat85.md` (updated)
- `Project_Briefing_Chat85.md` (updated)

Plus present all changed code files for download: `core.js`, `search.js`, `compare.html`, `privacy.html`.

---

## 6. Version state entering 8B

| File | Version | Last changed |
|---|---|---|
| `search.js` | v0.6.2.0 | Chat 78 |
| `core.js` | v0.6.1.53 | Unchanged |
| `background.js` | v0.6.1.18 | Unchanged |
| `styles.css` | — | Chat 78 |
| `compare.html` | Phase 8A (`compare-v1.0.0`) | Chat 84 |
| `privacy.html` | — | Chat 79 |
| `manifest.json` | v0.6.1 | Unchanged — do not bump |

---

*End of Phase 8B Kickoff Brief.*
