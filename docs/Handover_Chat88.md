# Handover — Chat 88 → Chat 89

*May 19, 2026*

*Opus session. Test 4 root-cause investigation, per Chat 87 handover. Investigation complete. No code changes. Significant architectural finding that changes the shape of Compare Persistence and reframes several Phase 8B failures.*

---

## What happened this session

Picked up Chat 87's plan: investigate Test 4 root cause before writing any fix. Read search.js (5009 lines) and compare.html (2803 lines) — the actual current GitHub versions, uploaded fresh. Confirmed three diagnostic questions. The answers reframe Phase 8B significantly.

No code was written. No code was committed. The session ended cleanly with the design question elevated to the user for a separate decision-making session.

---

## Diagnostic findings

### Q1 — What URL does the panel's "Compare" button actually produce?

**Answer:** `?id=` only. The panel POSTs the payload to Supabase and opens `compare.html?id=<id>`. The `?data=` path in compare.html's `init()` is a **legacy fallback for old shared links**, not the active path.

**Implication:** Chat 87's hypothesis — that Test 4 was caused by a missing notes-load on `?data=` — was based on a wrong model. The mirroring fix that was attempted and reverted would never have run for current users. (search.js line 3535: `window.open('...compare.html?id='+id,'_blank')`.)

### Q2 — Does the `?id=` path actually preserve notes across refresh?

**Answer:** No, and not for the reason previously suspected. **The architectural reason is bigger.**

Compare.html is served from `tibbalsgribbin.github.io/actually-useful/compare.html`. The manifest's `content_scripts` array declares scripts for `https://www.amazon.com/s*` and `https://actuallyuseful.net/welcome*` — **but not for the github.io domain.** That means compare.html runs as a plain web page with no extension content script injected. `window.chrome.storage` is `undefined` on that page.

The notes-write code on compare.html (`scheduleNoteWrite`) has a guard:

```js
if (!window.chrome || !chrome.storage || !chrome.storage.local) return;
```

This guard silently short-circuits on every keystroke. **Notes typed on compare.html have never been written anywhere, since the feature shipped.** The same applies to the init-time `chrome.storage.local.get('au_item_notes')` call — its callback never fires, `localNotes` stays `{}`, and the merge that was supposed to restore notes on refresh never happens.

The behavior Melissa reported confirms this exactly:
- Notes typed on the panel **with include-notes checked** survive refresh — because they travel inside the Supabase payload (search.js line 3497) and come back in `parsed.items` from `loadComparison()`.
- Notes typed on the panel **without include-notes checked** never reach compare.html.
- Notes typed **on compare.html** are not visible to the panel (live or after refresh) — confirming the write never lands in chrome.storage.local.

**There is no "storage-as-bus" between panel and compare.html. The bus does not exist.** The Chat 85/86 architecture assumed compare.html had storage access. It does not.

### Q3 — Why did mirroring the `?id=` listener onto `?data=` break Test 3?

**Answer:** Real second bug, downstream of Q2. `rerenderTableOnly()` (compare.html line 1966) does **not** merge `localNotes` into `currentItems` before rendering. `rerender()` (line 1785) does (lines 1786-1791). The storage `onChanged` listener calls `rerenderTableOnly()`, so even on a hypothetical version where storage worked, panel→compare live edits wouldn't reach the textareas.

This bug is real but masked by Q2 — it wouldn't fire in production because the storage write doesn't happen anyway. If Compare Persistence eventually gives compare.html storage access, this merge gap needs fixing too.

---

## What this means for Phase 8B

Several Phase 8B failures are not patchable bugs. They're consequences of an architectural gap:

| Test | Previous framing | Actual cause |
|---|---|---|
| Test 3 (live sync) | Listener regression from a fix attempt | Storage-as-bus never worked. Test 3's earlier "pass" was likely an artifact of the include-notes path masking the absence. |
| Test 4 (note doesn't survive refresh) | Missing notes-load on `?data=` | compare.html has no storage access at all. |
| Test 6 (compare.html include-notes for notes typed there) | Untested feature | Cannot work — notes typed there don't exist anywhere to include. |

Tests 1 (panel textarea), 2 (checkbox readability), and 5 (checkbox wired to wrong button) are unaffected by this finding. Tests 2 and 5 remain absorbed into Share Redesign. Test 1 remains its own investigation.

The "Compare Persistence" item is now confirmed as a real architectural decision, not a small fix. **The notes problem is one slice of it. Filters, sort, column visibility, etc. face the same wall.**

---

## Design options surfaced (handed to next session)

Four real options for how compare.html could persist state. Numbered to match the discussion in this session so future references stay clear. **Option 2 ruled out by Melissa during the session** — leaving the original numbers intact rather than renumbering.

### Option 1 — Add content script for compare.html in manifest

Smallest code change. Manifest gets a `content_scripts` entry for the github.io path. core.js injects. Existing compare.html storage code starts working as written. Notes stay client-side, tied to browser profile. Permission surface widens to include the github.io domain.

### Option 2 — postMessage bridge via the panel  *(ruled out)*

Compare.html messages the panel tab; the panel writes on its behalf. Ruled out because the panel tab is routinely closed, which would silently break persistence.

### Option 3 — Server-side persistence in Supabase

Compare.html writes state back to the Supabase record. Works across devices and shared-link recipients. Privacy model changes — personal notes live on a server. Conflict policy needed. Bigger scope.

### Option 4 — Accept compare.html notes don't persist

Document the limitation. Possibly disable note editing on compare.html or warn that edits won't save. Zero new code. Doesn't address the rest of Compare Persistence.

### Option 5 — Turn-based collaboration (raised by Melissa)

Each shared link is a frozen snapshot. Recipient can add their own notes (visually distinct) but can't edit the original notes. Recipient creates a new Supabase record when they "send back." Each round of conversation is a new immutable record. No auth needed; anyone with a link can fork. Doesn't solve personal persistence — only collaboration.

### Supabase cost picture (confirmed this session)

Web-searched current Supabase pricing. Free tier: 500 MB database, 5 GB monthly egress, 7-day pause for inactivity. At Actually Useful's scale, free tier holds ~17,000 comparison records and ~170,000 link-opens/month. Pro is $25/month if needed. **Cost is not a blocker for Option 3 or Option 5.**

---

## Why the session ended here

Melissa raised Option 5 mid-discussion as a different vision of what compare.html could be. The four options aren't comparable on the same axis — they make different assumptions about whether compare.html is a private workspace, a shared document, or a collaborative thread. **Picking the right option requires deciding what compare.html *is* first.** That's a product question, not a technical one, and benefits from a fresh session.

Melissa was on a fuzzy-brain day and chose to end the session cleanly rather than push for a decision under that constraint.

---

## Files state

Nothing changed. Repo identical to start of session.

| File | Version | Status |
|---|---|---|
| `manifest.json` | v0.6.1 | Unchanged |
| `background.js` | v0.6.1.19 | Unchanged |
| `core.js` | v0.6.1.54 | Unchanged |
| `search.js` | v0.6.2.1 | Unchanged |
| `compare.html` | compare-v1.0.0 | Unchanged |
| `privacy.html` | Phase 8B | Unchanged |
| `styles.css` | — | Unchanged |

---

## Notes for next-session Opus brief

**Next session's job: decide what compare.html is.** That's the gating product question. The five options each carry a different answer to that question. The session should:

1. Pick the primary use case — private workspace, shared document, or turn-based dialog.
2. Choose one option (or a combination — e.g. Option 1 for personal state + Option 5 for sharing rounds).
3. Hand the answer to a separate design session for the chosen path.

**Do not** start implementation in that session. The decision itself is the deliverable.

**Things the next session should remember:**

- Option 2 is out. Don't re-present it.
- Personal persistence and collaborative persistence are separate problems. A clean answer may combine two options.
- The include-notes UX (Approach 4 from Chat 87) is downstream of this decision. If Option 5 is chosen, the include-notes concept becomes obsolete entirely (notes always travel with snapshots in that model).
- Share Redesign sits behind whatever is decided. It can't proceed until the compare.html question lands.

**Test 1 investigation** (panel textarea regression) is independent of this. Can be picked up in any future session.

---

## Process notes for next session

- The "diagnose before fixing" rule from Chat 87 paid off this session. The Chat 87 plan was to investigate, and that investigation revealed the architectural gap. If a fix had been written first, it would have shipped over a broken foundation.
- Reading the actual code on disk (uploaded fresh from GitHub) was the right move. Earlier theorizing from the handover alone would not have revealed Q2.
- When a finding reframes multiple existing roadmap items at once, that's a signal to stop and update the docs rather than continue.

---

*End of handover.*
