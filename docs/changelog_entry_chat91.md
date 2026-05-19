# Changelog — Chat 91

*May 19, 2026*

*Opus session. Option 1 implementation spec redesigned from a corrected architectural foundation. Spec is locked and ready to code from. No code shipped.*

---

## Delivered

**No code changes.** Design session only.

Produced one spec document: `Option1_Implementation_Spec_Chat91.md`. Self-contained. 915 lines. Replaces the flawed Chat 90 spec.

---

## Architecture decided: A (content script + postMessage bridge)

Three candidates were weighed (plus a check for a possible fourth):

| Option | Verdict |
|---|---|
| **A: content_scripts + postMessage bridge** | **Chosen.** Tiny bridge content script owns all `chrome.storage` access. Page talks to it via `window.postMessage`. No new permissions, no extension ID coupling. |
| B: externally_connectable + background broker | Rejected. Requires the page to know the extension ID. Hardcoding breaks dev workflow; dynamic discovery brings content scripts back, at which point A is simpler. |
| C: Move compare.html into the extension | Already a non-starter (Chat 90). Breaks shared links for non-extension recipients. |
| Possible fourth (move all compare.html logic into a content script) | Rejected. Breaks non-extension viewers of shared links — same fatal flaw as C, different mechanism. |

---

## What the spec covers

- **New file: `content/page/compare-bridge.js`.** ~100 lines. Content script that listens for `postMessage` requests from the page and routes them to `chrome.storage.local`, plus pushes `chrome.storage.onChanged` events back to the page.
- **Page-side bridge client in compare.html.** ~80 lines. Promise-based wrappers around postMessage. Caches bridge presence after a 1000ms ping at init.
- **Storage schema unchanged from Chat 90.** `au_item_notes` (existing), `au_col_visibility` (new global), `au_search_state` (new per-search, keyed by Supabase id).
- **Init changes, push handler, four save-site wires.** Notes, columns, filters, sort. All four storage paths come alive together.
- **`rerenderTableOnly` merge fix** (Chat 88 finding) folded in.
- **Non-extension viewer handling.** Inputs remain visible, writes silently no-op — same observable behavior as today, with the 1000ms detection delay as the only added UX cost.
- **Implementation order with 13 gated steps.** Manifest + bridge file first, smoke-tested, before any compare.html changes.

---

## Self-review catch

During self-review, found a small race-condition ordering bug in the init flow: `bridgeOnPush(handleStoragePush)` was wired *after* `bridgeGetState()`. If a `chrome.storage.onChanged` event fired during the getState round-trip (e.g., from the panel or another tab), the bridge's push notification would be dropped because the page hadn't registered a handler yet. Moved `bridgeOnPush` to fire *before* `bridgeGetState` so any concurrent changes get processed instead of lost.

Caught before any code was written. Worth recording as a process win: the Chat 90 lesson about naming load-bearing assumptions and self-reviewing them held this session.

---

## What was decided (still valid, carried from Chat 90)

| Question | Resolution |
|---|---|
| Scope of Option 1 | Notes + filters + sort + column visibility |
| Notes keying | Global by ASIN (existing) |
| Column visibility keying | Global (display preference) |
| Filters keying | Per-search |
| Sort keying | Per-search |
| searchId | The Supabase `id` from `?id=` URL param. Universal. |
| Storage hygiene | No pruning yet |
| Write timing | Mirror existing rerender debounce: text inputs 250ms, others immediate |
| rerenderTableOnly merge gap | Folded into Option 1 |

## What was decided this session (new)

| Question | Resolution |
|---|---|
| Delivery mechanism | Architecture A (content script + postMessage bridge) |
| Bridge detection timeout | 1000ms ping at init; cached for the rest of the session |
| Non-extension viewer UX | Inputs visible, writes silently no-op. Same observable behavior as today. |
| Bridge file location | `content/page/compare-bridge.js` (new path) |

---

## What this means for Phase 8B test outlook

| Test | Status after Chat 91 |
|---|---|
| 1. Textarea closes prematurely (panel) | Unchanged. Independent investigation. |
| 2. Include-notes checkbox styling | Unchanged. Share Redesign. |
| 3. Storage-as-bus live sync | Will be testable after Option 1 ships. |
| 4. Note added on compare.html not surviving refresh | Will be fixed by Option 1 implementation. Spec ready to code from. |
| 5. Note in shared link not visible to recipient | Unchanged. Share Redesign. |
| 6. Compare.html include-notes for notes typed there | Will be testable after Option 1 ships + Share Redesign decides if checkbox still exists. |

---

## Process notes

- **Extended thinking was on this session, per Chat 90's recommendation.** It helped on the architecture choice in particular: catching B's extension-ID problem and the rejected fourth option needed careful reasoning. Confirms the Chat 90 rule about naming load-bearing assumptions and using extended thinking to verify them.
- **Self-review caught the bridgeOnPush ordering issue before finalizing.** Reinforces the Chat 90 process addition: stop and fix when self-review surfaces a load-bearing issue, not just when external findings do.
- **The decision-making went architecture → spec, not spec → spec-fix.** Per the Chat 90 handover's guidance, the architecture choice was settled before any spec text was written. Good shape.

---

## Files changed

None. (Spec output is a project doc, not a code file.)

## Files unchanged

All. `manifest.json`, `background.js`, `core.js`, `search.js`, `compare.html`, `privacy.html`, `styles.css` — identical to end of Chat 90 (and 89, 88, 87, 86).

---

*End of Chat 91 changelog.*
