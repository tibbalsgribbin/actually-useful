# Changelog — Chat 90

*May 19, 2026*

*Opus session. Option 1 implementation spec attempted. Critical architectural flaw caught in self-review before any code was written. No code shipped.*

---

## Delivered

**No code changes.** Design session only.

Produced one spec document, then marked it flawed and stopped the session.

---

## Spec produced (flawed — do not implement)

`Option1_Implementation_Spec_Chat90.md` — full implementation spec for workspace persistence on compare.html (notes + filters + sort + column visibility). Includes manifest diff, storage schema, function-by-function code changes, test plan, and rollout order.

**The spec is flawed in its core mechanism.** It assumes that adding compare.html's domain to `content_scripts` in manifest.json gives the page's inline JavaScript access to `chrome.storage`. This is wrong: content scripts run in an isolated world, separate from the page's own scripts. The page's inline script cannot reach `chrome.storage` regardless of what content scripts are injected alongside it.

The spec's architectural decisions, storage schemas, and scope are correct. The delivery mechanism is wrong.

---

## What was decided (still valid)

| Question | Resolution |
|---|---|
| Scope of Option 1 | Notes + filters + sort + column visibility |
| Notes keying | Global by ASIN (existing) |
| Column visibility keying | Global (display preference) |
| Filters keying | Per-search |
| Sort keying | Per-search |
| searchId | The Supabase `id` from `?id=` URL param. Universal — every compare.html URL has it. |
| Storage hygiene | No pruning yet |
| Write timing | Mirror existing rerender debounce: text inputs 250ms, others immediate |
| rerenderTableOnly merge gap | Must be folded into Option 1 |

---

## What was newly confirmed

1. **compare.html lives at `actuallyuseful.net/compare.html`,** not at `tibbalsgribbin.github.io/...`. The github.io URL redirects to actuallyuseful.net via a GitHub Pages custom domain. The Chat 89 handover was wrong on this fact. `actuallyuseful.net` is already in the manifest's `host_permissions`.

2. **search.js line 3535 opens compare.html via the github.io URL,** which then redirects. The browser always lands on actuallyuseful.net.

3. **The `?data=` legacy fallback path in compare.html is dead in practice.** Every compare.html load is `?id=`. The dead path can be ignored for state-keying decisions; could be removed in a future cleanup pass.

4. **compare.html's existing notes code is dead, not buggy.** `scheduleNoteWrite`, the `chrome.storage.onChanged` listener, and the `localNotes` merge in `rerender()` — all written correctly. None of it has ever executed in production because `window.chrome.storage` is undefined on the actuallyuseful.net page.

---

## Architectural options surfaced (for next session)

Three candidate architectures identified at end-of-session:

- **A: content_scripts + postMessage bridge.** Awkward bidirectional async messaging.
- **B: externally_connectable + background broker.** Standard Chrome pattern. Page sends messages to extension via `chrome.runtime.sendMessage(EXTENSION_ID, ...)`; background script brokers all storage access.
- **C: Move compare.html into the extension.** Non-starter — breaks shared links for recipients without the extension installed.

In-session lean was B, but next session should re-examine all options with fresh eyes (and consider whether there's a fourth I missed).

---

## What this means for Phase 8B test outlook

| Test | Status after Chat 90 |
|---|---|
| 1. Textarea closes prematurely (panel) | Unchanged. Independent investigation. |
| 2. Include-notes checkbox styling | Unchanged. Share Redesign. |
| 3. Storage-as-bus live sync | Will become testable once whichever-architecture-wins ships. |
| 4. Note added on compare.html not surviving refresh | Will be fixed by Option 1 implementation, once the architecture is settled. |
| 5. Note in shared link not visible to recipient | Unchanged. Share Redesign. |
| 6. Compare.html include-notes for notes typed there | Will become testable once Option 1 ships + Share Redesign decides if checkbox still exists. |

---

## Process notes

- **Self-review caught the flaw before code was written.** The spec's own smoke test #2 (typing `chrome.storage.local.get('au_item_notes', console.log)` in devtools on compare.html) would have exposed the flaw in the first 30 seconds of next session. Surfacing it during spec review instead saved a full Sonnet coding session.
- **Stopped the session rather than patching.** Per the Chat 88 rule about not pushing for decisions in the same session that surfaced a new shape. The architecture question deserves a fresh-eyes look, not a same-session pivot.
- **Extended thinking suggested for next session start.** This kind of load-bearing technical assumption is exactly what extended thinking is for. Should have been on this session.
- **Two surprises from Melissa's responses** materially changed the spec mid-session: the actuallyuseful.net URL (not github.io) and the universal `?id=` framing. Handover summaries can be stale or wrong about specific facts. Verify against current code and current observed behavior.

---

## Files changed

None.

## Files unchanged

All. `manifest.json`, `background.js`, `core.js`, `search.js`, `compare.html`, `privacy.html`, `styles.css` — identical to end of Chat 89 (which was identical to end of Chat 88, which was identical to end of Chat 87, which was identical to end of Chat 86).

---

*End of Chat 90 changelog.*
