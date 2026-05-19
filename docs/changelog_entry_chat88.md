# Changelog — Chat 88

*May 19, 2026*

*Opus session. Test 4 root-cause investigation per Chat 87 plan. Investigation complete. No code shipped. Architectural finding reframes Compare Persistence and several Phase 8B tests.*

---

## Delivered

**No code changes.** Diagnostic session only.

---

## Diagnostic findings (Test 4 + Test 3 + Test 6)

### Q1 — Panel "Compare" button URL

Confirmed: panel POSTs to Supabase and opens `compare.html?id=<id>` (search.js line 3535). The `?data=` path in compare.html is a legacy fallback, not the active path. Chat 87's mirroring hypothesis was based on a wrong model.

### Q2 — Why notes don't survive refresh on compare.html

**Root cause: compare.html has no access to `chrome.storage.local`.** The manifest declares content scripts for `https://www.amazon.com/s*` and `https://actuallyuseful.net/welcome*`, but not for the `tibbalsgribbin.github.io/actually-useful/*` path where compare.html is served. Compare.html runs as a plain web page; `window.chrome.storage` is `undefined`.

The notes-write code's guard (`if (!window.chrome || !chrome.storage || !chrome.storage.local) return;`) silently short-circuits on every keystroke. **Notes typed on compare.html have never been saved anywhere since the feature shipped.** The init-time read fails the same way.

Notes that appear to survive refresh on compare.html are the ones the panel embedded directly into the Supabase payload (search.js line 3497) when include-notes was checked at send time. Those travel in `parsed.items` from `loadComparison()` — independent of any storage mechanism.

### Q3 — `rerenderTableOnly()` vs `rerender()`

Confirmed: `rerenderTableOnly()` (compare.html line 1966) does not merge `localNotes` into `currentItems` before rendering. `rerender()` (line 1785) does. The storage `onChanged` listener calls `rerenderTableOnly()`. Real second bug, but masked in production by Q2 — wouldn't fire because the storage write doesn't happen anyway.

---

## Phase 8B test reclassification

| Test | Previous status | New understanding |
|---|---|---|
| 3. Storage-as-bus live sync | Was passing pre-revert in Chat 87 | The bus does not exist. Earlier "pass" likely an artifact of the include-notes path masking the absence. |
| 4. Note added on compare.html not surviving refresh | Failed | Never could have worked. compare.html has no storage access. |
| 6. Compare.html include-notes for notes typed there | Not tested | Cannot work — notes typed on compare.html don't reach any storage to include. |

Tests 1, 2, 5 unaffected by this finding. Tests 2 and 5 remain absorbed into Share Redesign. Test 1 remains its own investigation.

---

## Design options surfaced (numbered for future reference)

Discussed five options for compare.html state persistence. Recorded in handover. Option 2 (postMessage bridge) **ruled out** by Melissa during the session — silent failure mode when panel tab is closed. Other four remain on the table for the next session's decision.

- **Option 1** — Add content script for compare.html in manifest
- **Option 2** — postMessage bridge *(ruled out)*
- **Option 3** — Server-side persistence in Supabase
- **Option 4** — Accept that compare.html notes don't persist
- **Option 5** — Turn-based collaboration (snapshots per share round)

Supabase pricing confirmed not a blocker at Actually Useful's scale: free tier holds ~17,000 records and ~170,000 link-opens/month before hitting limits.

---

## Decisions captured

### Compare Persistence is a product question, not a technical fix

The decision of which option to pursue depends on what compare.html is *for*. Different options assume different things: private workspace, shared document, collaborative thread. **Cannot be decided as a technical refactor — needs a separate product-design session.**

### Personal persistence and collaborative persistence are separate problems

A complete answer may combine two options (e.g. Option 1 for personal state + Option 5 for sharing rounds). Future sessions should treat them as independent decisions.

### Include-notes UX (Approach 4) is downstream of the compare.html decision

If Option 5 is chosen, the include-notes concept becomes obsolete (notes always travel with snapshots in that model). The Chat 87 Approach 4 decision should be re-examined in light of whichever option lands.

### Share Redesign is gated on the Compare Persistence decision

It cannot proceed until the compare.html question lands. Moved later in the sequence.

---

## Process notes

- **Diagnose-before-fixing (rule 5 from Chat 87) confirmed valuable.** Investigation surfaced an architectural gap that a fix-first approach would have papered over.
- **Reading actual current code (uploaded fresh from GitHub) was essential.** Theorizing from handover summaries alone would not have caught the missing manifest entry.
- **Stopping when findings reframe roadmap items** is the right move. A long session that pushes for decisions under fuzzy-brain conditions degrades the decisions.

---

## Files changed

None.

## Files unchanged

All. `manifest.json`, `background.js`, `core.js`, `search.js`, `compare.html`, `privacy.html`, `styles.css` — identical to end of Chat 87 (which was identical to end of Chat 86).

---

*End of Chat 88 changelog.*
