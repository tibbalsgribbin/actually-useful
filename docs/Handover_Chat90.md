# Handover — Chat 90 → Chat 91

*May 19, 2026*

*Opus session. Option 1 implementation spec attempted. Critical architectural flaw found in self-review. Spec marked flawed. Next session re-designs from a corrected technical foundation.*

---

## What happened this session

Picked up Chat 89's job: design the Option 1 implementation. Walked through scope decisions with Melissa (notes + filters + sort + column visibility; per-search vs. global keying; debounce timing; rerenderTableOnly merge gap). Wrote a full implementation spec — `Option1_Implementation_Spec_Chat90.md`. Then in self-review, caught a fatal flaw: the entire spec depended on an incorrect assumption about how Chrome content scripts interact with page scripts. Stepping back instead of patching.

No code was written. No code was committed. The Chat 89 decision still holds. The spec document exists but should be treated as flawed reference material, not as a path forward.

---

## The flaw

The Chat 89 plan (and my Chat 90 spec) assumed: add compare.html's domain to `content_scripts` in manifest.json, and compare.html's existing inline storage code starts working.

This is wrong. Content scripts run in an **isolated world** — a separate JavaScript execution context from the page's own scripts. compare.html's inline `<script>` block (where `init()`, `scheduleNoteWrite`, and the rest of the workspace code live) runs in the page's world. Even if we inject `core.js` as a content script, the page's inline script still cannot see `chrome.storage` — the isolation cuts both ways.

The existing defensive guard `if (window.chrome && chrome.storage && chrome.storage.local)` in compare.html will continue to evaluate false on a `actuallyuseful.net` page, regardless of what we add to `content_scripts`.

**Verified against Chrome docs during the session.** This is documented behavior, not a bug or edge case.

---

## What the Chat 90 spec got right (worth keeping)

The architectural-decision portions of the spec are independent of the delivery mechanism and remain valid:

| Decision | Resolution | Source |
|---|---|---|
| Scope | Notes + filters + sort + column visibility | Melissa, Chat 90 |
| Notes keying | Global, by ASIN (existing) | Melissa, Chat 90 |
| Column visibility keying | Global (display preference) | Recommended, accepted |
| Filters keying | Per-search | Recommended, accepted |
| Sort keying | Per-search | Recommended, accepted |
| searchId | The Supabase `id` from `?id=` URL param. Universal — every compare.html URL has it. | Confirmed Melissa, Chat 90 |
| Storage hygiene | No pruning yet | Melissa, Chat 90 |
| Write timing | Mirror existing rerender debounce: text inputs 250ms, others immediate | Melissa, Chat 90 |
| rerenderTableOnly merge gap | Must be folded into Option 1 (the storage onChanged path calls rerenderTableOnly directly; without the merge, cross-tab notes don't render) | Chat 90 finding |
| Sharing model | Still deferred to Share Redesign | Chat 89, unchanged |

**The full storage schema in the flawed spec (`au_item_notes`, `au_col_visibility`, `au_search_state`) is also correct in shape** — what's in storage doesn't change based on which side of an isolation boundary the storage is accessed from. The shapes carry forward.

---

## What was newly confirmed this session

Two facts worth carrying forward:

1. **compare.html is served from `actuallyuseful.net/compare.html`, not `tibbalsgribbin.github.io/...`.** The github.io URL exists but redirects to actuallyuseful.net via a GitHub Pages custom domain (CNAME). The Chat 89 handover was wrong on this — the browser always lands on actuallyuseful.net. `actuallyuseful.net` is already in the manifest's `host_permissions`.

2. **search.js line 3535 constructs the github.io URL** when opening compare.html from the panel. That URL gets redirected. This means: any future code path that needs to recognize "we're on the compare page" should match on `actuallyuseful.net/compare.html`, not the github.io URL.

3. **The `?data=` legacy fallback path in compare.html (lines 2578-2607) is dead in practice.** No current flow produces a `?data=` URL. Every compare.html load is `?id=`. The dead path can be ignored for any future state-keying decisions (and could be removed in a cleanup pass, but that's separate).

4. **compare.html's existing notes code is dead, not buggy.** The `scheduleNoteWrite`, the `chrome.storage.onChanged` listener at line 2566, the `localNotes` merge in `rerender()` at line 1786 — all written correctly. None of it has ever executed in production because `window.chrome.storage` is undefined on the actuallyuseful.net page. The code is fine. The architecture around it isn't.

---

## Architectural options for the next session to weigh

Three candidate architectures were identified at end-of-session. The next session should think carefully about which is right (and consider if there's a fourth I missed).

### Architecture A: content_scripts + postMessage bridge

- Inject content script into actuallyuseful.net/compare.html.
- Content script reads/writes chrome.storage.
- Communicates with page's inline script via `window.postMessage`.
- **Pros:** Minimal manifest change, no new permissions.
- **Cons:** Bidirectional async messaging is awkward. Two layers of code to keep in sync. The page's existing storage code becomes dead in a different way.

### Architecture B: externally_connectable + background broker

- Add `externally_connectable` to manifest, allowing actuallyuseful.net to send messages to the extension.
- Page's inline script uses `chrome.runtime.sendMessage(EXTENSION_ID, ...)` to talk to background.
- Background script handles all storage reads/writes.
- **Pros:** Standard Chrome pattern for "web page talks to extension." Cleaner separation than A.
- **Cons:** Requires hardcoding the extension ID in compare.html, OR fetching it dynamically. Adds the page to the externally_connectable surface (small additional privacy.html note).

### Architecture C: Move compare.html into the extension

- Make compare.html an *extension page* (served from `chrome-extension://[id]/compare.html`) instead of a web page.
- **Pros:** Cleanest. Existing inline code works as-written. No bridges, no message passing.
- **Cons:** Non-starter. Shared compare links currently go to `actuallyuseful.net/compare.html?id=...`. Moving the page into the extension breaks every shared link for recipients without the extension installed. Defeats the sharing feature entirely.

**My in-session lean was B,** but I'd just realized the A problem and was probably anchoring on the first apparent solution. Next session should re-examine all three (and consider a possible fourth) with fresh eyes.

---

## Files state

Nothing changed. Repo identical to start of session and to end of Chats 87, 88, and 89.

| File | Version | Status |
|---|---|---|
| `manifest.json` | v0.6.1 | Unchanged |
| `background.js` | v0.6.1.19 | Unchanged |
| `core.js` | v0.6.1.54 | Unchanged |
| `search.js` | v0.6.2.1 | Unchanged |
| `compare.html` | compare-v1.0.0 | Unchanged |
| `privacy.html` | Phase 8B | Unchanged |
| `styles.css` | — | Unchanged |

`Option1_Implementation_Spec_Chat90.md` exists as session output but is **flawed** — do not implement from it.

---

## Notes for next-session Opus brief

**Next session's job: redesign Option 1 from a correct technical foundation.** The Chat 89 product decision is locked. The Chat 90 scope and storage-shape decisions are locked. The delivery mechanism is open.

**Turn on extended thinking at the start of the session.** Melissa explicitly suggested this; I agree. The Chat 90 flaw is exactly the kind of load-bearing technical assumption that extended thinking is good for verifying before building on.

**Start with the architectural choice.** Don't write code or specs until the architecture is settled.

**Read the flawed spec for the *decisions* it documents, but treat the implementation guidance as wrong.** Specifically:
- §3 (architectural decisions) — keep, except the `chrome.storage` access mechanism row, which is wrong.
- §4 (storage schema) — keep entirely.
- §5 (manifest change) — wrong; this is the whole problem.
- §6 (code changes to compare.html) — wrong in detail because it assumes the page can call chrome.storage. The *intent* of each change carries forward (add state vars, debounce filter writes, etc.), but the *mechanism* must be redone for whichever architecture is chosen.
- §7 (timing) — depends on architecture.
- §8 (migration) — keep.
- §10 (test plan) — keep mostly; the smoke test #2 was the one that would have caught the flaw, which is reassuring about the test plan even though the spec was wrong.

**Other things to remember:**

- The Chat 88 finding about `rerenderTableOnly` not merging `localNotes` is still real and still needs fixing as part of Option 1.
- The privacy.html implications are still small but different depending on architecture: A and B both add a new bridge surface; the framing changes.
- Test 1 (panel textarea regression) is still independent.
- Approach 4 (include-notes UX from Chat 87) still stands.

---

## Process notes for next session

- **Self-review caught the flaw before code was written.** Worth keeping the habit: when a spec depends on a load-bearing technical assumption, name the assumption out loud and verify it before building on it. The Chat 90 spec's smoke test #2 was the right test — but a test discovered after writing 600 lines of spec is less useful than the same test before. Extended thinking at the start would have surfaced the isolated-worlds question early.
- **The "stop the session when findings reframe the shape" rule (Chat 88) was applied this session.** Realized the flaw, surfaced it to Melissa, stopped rather than patching. Adding to that rule: **stop also when self-review reveals a load-bearing assumption is wrong**, not just when external findings do.
- **Two surprises from Melissa's responses** (`actuallyuseful.net` URL not matching the handover; `?id=` being universal) materially changed the spec. Worth reinforcing: handover summaries can be stale or wrong about specific facts. Verify against current code and current Melissa-observed behavior, not against prior handovers.

---

*End of handover.*
