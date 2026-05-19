# Changelog — Chat 87

*May 19, 2026*

*Opus session. Phase 8B retest. One fix attempted and reverted. No code shipped. Significant scope discoveries.*

---

## Delivered

**No code changes.** The one in-session edit was reverted before end of session.

---

## Attempted and reverted

### compare.html (`?data=` notes-load mirror)

Mirrored the `?id=` path's notes-load + storage-onChanged listener onto the `?data=` path in `init()`. Hypothesis: Test 4 (note doesn't survive refresh) was caused by `au_item_notes` not being loaded before render on the `?data=` path.

**Result on retest:** Test 4 still failed. Test 3 (storage-as-bus live sync) regressed from passing to failing.

**Reverted.** compare.html restored to GitHub `main` (compare-v1.0.0). COMPARE_VERSION not bumped.

**Likely real causes (deferred to next session for proper diagnosis):**

1. Panel's "Compare" button may not use `?data=` at all — needs URL trace in search.js.
2. `?id=` path's notes-load may not actually work in production — needs real-world confirmation, not just code review.
3. `rerenderTableOnly()` (used by the onChanged listener) and `rerender()` (used on initial load) may merge `localNotes` into `currentItems` differently. compare.html has two render functions at lines 1526 and 1994.

---

## Phase 8B retest results

| Test | Status |
|---|---|
| 1. Textarea closes prematurely (panel) | Initially ✅, regressed to ❌ later in session |
| 2. Include-notes checkbox styling (panel) | ❌ — coral text on coral background, unreadable |
| 3. Storage-as-bus live sync (panel ↔ compare) | ✅ pre-revert |
| 4. Note added on compare.html not surviving refresh | ❌ |
| 5. Note in shared link not visible to recipient | ❌ — checkbox wired to wrong button, structural issue |
| 6. Compare.html include-notes for notes typed there | ⏸ Not tested (held for Test 5 resolution) |

Plus side observation: AU webpages don't show the AU favicon in browser tabs.

---

## Major discovery — compare.html persistence

Surfaced by Melissa: *"there is a larger problem on the compare page that when I reload the page, it doesn't save ANYTHING — filters, keywords, notes, etc."*

Compare.html derives its entire state from URL parameters on each load. No persistence layer in chrome.storage.local, sessionStorage, or localStorage for that page. Affects filters, keyword filter, sort, column visibility, show-checked-only, checked items, and notes typed directly on compare.html.

Reframed: the "filters don't survive refresh" bug from Chat 86 is one symptom of a missing feature, not a small fix. Renamed to **Compare Persistence** design item on the roadmap.

---

## Decisions captured

### Share Redesign — added as a deferred design item

Came out of working through Tests 2 and 5. Current share flow has two share buttons with two scopes plus a misplaced include-notes checkbox. **Decision: defer the include-notes UX fix and the share-flow fix together as a Share Redesign.**

Selected approach for include-notes UX (to be implemented inside the Share Redesign): **Approach 4 — no persistent checkbox; ask at share time if any notes exist.** Default to "share without notes." Prompt style (inline popover vs small modal) to be decided at design time.

Notes always travel from panel to compare.html (no panel-side privacy gate). The privacy gate is at the share step.

### Process rules (new, Chat 87)

5. **Diagnose before fixing.** Mirror-the-working-path moves are not diagnoses. If the working path's behavior in production hasn't been confirmed, copying its code can spread the bug rather than fix it.
6. **Revert cleanly when a fix doesn't work.** Don't leave partial fixes in the codebase to patch later.

---

## Files changed

None.

## Files unchanged

All. `manifest.json`, `background.js`, `core.js`, `search.js`, `compare.html`, `privacy.html`, `styles.css` — all identical to end of Chat 86.

---

*End of Chat 87 changelog.*
