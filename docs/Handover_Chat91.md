# Handover — Chat 91 → Chat 92

*May 19, 2026*

*Opus session. Option 1 architecture decided (Architecture A). Corrected implementation spec produced and locked. Ready for Sonnet implementation next session.*

---

## What happened this session

Picked up Chat 90's job: redesign Option 1 from a corrected technical foundation. Architecture A (content script + postMessage bridge) selected after weighing all three candidates from the Chat 90 handover. Wrote a full, self-contained implementation spec — `Option1_Implementation_Spec_Chat91.md` (915 lines). Self-reviewed and fixed a small race-condition ordering issue in init before finalizing. Melissa signed off; spec is locked.

No code was written. No files in the repo changed.

---

## The architecture decision

**Chose Architecture A.** Reasoning:

- **A: content_scripts + postMessage bridge.** Tiny bridge content script owns all `chrome.storage` access. Page talks to it via `window.postMessage`. No new permissions, no extension ID coupling, well-documented Chrome pattern.
- **B: externally_connectable + background broker.** Rejected. The page needs to know the extension ID to call `chrome.runtime.sendMessage(EXTENSION_ID, ...)`. IDs differ between unpacked dev installs and Chrome Web Store installs. Hardcoding breaks dev workflow; dynamic discovery brings content scripts back, making A simpler. The Chat 90 in-session lean toward B was the anchoring effect the Chat 90 handover warned about.
- **C: Move compare.html into the extension.** Non-starter (Chat 90). Breaks shared compare links for non-extension recipients.
- **Possible fourth — move all compare.html logic into a content script.** Rejected. Same fatal flaw as C, different mechanism: breaks non-extension viewers of shared links.

---

## The spec

`Option1_Implementation_Spec_Chat91.md` — 915 lines, self-contained, ready to code from.

**What it covers:**

- New file: `content/page/compare-bridge.js`. ~100 lines. Listens for postMessage requests from the page, routes them to chrome.storage.local. Pushes chrome.storage.onChanged events back to the page.
- Page-side bridge client in compare.html. ~80 lines. Promise-based wrappers around postMessage. 1000ms ping at init detects bridge presence; result cached.
- Storage schema unchanged from Chat 90 (au_item_notes, au_col_visibility, au_search_state).
- Init changes, push handler, four save-site wires (notes, columns, filters, sort), `rerenderTableOnly` merge fix.
- Non-extension viewer handling: inputs visible, writes silently no-op. Same observable behavior as today.
- 13-step implementation order, each step gated by a smoke test.
- Test plan with 24 tests covering smoke, all four state types, cross-tab sync, merge-gap fix, no-bridge fallback, and message-protocol security.

**What it does NOT change vs. Chat 90 spec:**

- Architectural decisions (scope, keying, debounce timings) carry forward verbatim.
- Storage schema is byte-identical.
- `rerenderTableOnly` merge fix is the same.
- Migration table for existing Supabase shares is the same.
- Test plan is mostly the same, with bridge-specific additions.

---

## The self-review catch

During self-review of the init flow, found that `bridgeOnPush(handleStoragePush)` was wired *after* `bridgeGetState()`. If a `chrome.storage.onChanged` event fired during the getState round-trip (e.g., notes typed on the panel, or a change from another tab), the bridge's push notification would arrive at the page before the page registered a handler — the message would be dropped silently.

Fixed by moving `bridgeOnPush` to fire *before* `bridgeGetState`. The push handler can safely re-apply state on top of either the default or the just-hydrated values. See spec §8.3.

Caught before the spec was finalized. Worth recording as a small process win for the Chat 90 self-review-catches-load-bearing-issues rule.

---

## What was newly confirmed this session

- **Bridge file path: `content/page/compare-bridge.js`.** New directory `content/page/` separates page-bridge scripts from Amazon-page scripts. Specific to this delivery mechanism; not a generic pattern (yet).
- **1000ms is the bridge detection timeout.** Tunable down (probably to 500ms or less) if it's noticeable in non-extension shared-link viewing. Watch during testing.
- **The `?id=` URL parameter is the universal anchor** for per-search state. Confirmed Chat 90, reconfirmed during spec writing.
- **`actuallyuseful.net` is the only host that matters** for the manifest match pattern. `actuallyuseful.net/compare.html*` covers any query string. The github.io URL redirects before content scripts run.
- **`document_start` is the right `run_at`** for the bridge content script. The page's first ping must find the bridge's listener already attached. document_start guarantees the bridge loads before any page script.

---

## Architectural options NOT chosen (recorded for future reference)

For posterity, in case the architecture question is ever reopened:

| Option | Why rejected |
|---|---|
| B (externally_connectable + background broker) | Extension ID coupling. Hardcoding breaks dev. Dynamic discovery requires content scripts anyway. |
| C (move compare.html into extension) | Breaks shared links for non-extension recipients. |
| Hybrid (move all compare.html logic into content script) | Same flaw as C — non-extension viewers see empty page. |
| DOM-based comms (write to attributes, MutationObserver) | Functionally equivalent to postMessage with more overhead. |

---

## Files state

Nothing changed. Repo identical to start of session and to end of Chats 87, 88, 89, 90.

| File | Version | Status |
|---|---|---|
| `manifest.json` | v0.6.1 | Unchanged |
| `background.js` | v0.6.1.19 | Unchanged |
| `core.js` | v0.6.1.54 | Unchanged |
| `search.js` | v0.6.2.1 | Unchanged |
| `compare.html` | compare-v1.0.0 | Unchanged |
| `privacy.html` | Phase 8B | Unchanged |
| `styles.css` | — | Unchanged |

**New file to be created during implementation:** `content/page/compare-bridge.js`.

`Option1_Implementation_Spec_Chat91.md` exists as session output and is **the authoritative implementation spec.** `Option1_Implementation_Spec_Chat90.md` is still in the project but is flawed; ignore it.

---

## Notes for next session

**Next session is a Sonnet implementation session.** Code Option 1 from the Chat 91 spec, in the order specified by spec §17.

**Implementation order (13 steps, each smoke-tested):**

1. Create `content/page/compare-bridge.js` from spec §5.
2. Update `manifest.json` with new content_scripts entry. Reload. Verify Amazon panel still works; verify compare.html opens.
3. Devtools-verify bridge presence on compare.html (the ping snippet, smoke 4).
4. Add bridge client block to compare.html (spec §7.1).
5. Add state-shaping helpers (spec §8.2).
6. Apply `rerenderTableOnly` merge fix (spec §8.6).
7. Replace init storage block; add push handler (spec §8.3, §8.4).
8. Replace `scheduleNoteWrite` (spec §8.5.4). Notes flow now alive.
9. Wire column toggles (spec §8.5.3).
10. Wire filter handlers (spec §8.5.1) — 18 call sites.
11. Wire sort handler (spec §8.5.2).
12. Cross-tab and merge-gap tests (spec §13.6, §13.7).
13. No-bridge fallback verification (spec §13.8).

**Version bumps on success:**
- `manifest.json` → `0.6.2`
- `compare.html` → `compare-v1.1.0`
- `compare-bridge.js` → start at `bridge-v1.0.0`

**Code uploads needed at session start:** `manifest.json`, `compare.html`. (`compare-bridge.js` will be created during the session, not uploaded.)

**Other things to remember:**

- The Chat 88 finding about `rerenderTableOnly` not merging `localNotes` is folded into the spec (§8.6).
- The privacy.html update for the bridge injection note is deferred to a pre-CWS-push polish pass; out of scope for the implementation session.
- Test 1 (panel textarea regression) is still independent.
- Approach 4 (include-notes UX from Chat 87) still stands.
- The dead `?data=` fallback path in compare.html (lines 2578-2607) is still flagged for future cleanup, not part of Option 1.

---

## Process notes for next session

- **Extended thinking helped this session.** Confirmed the Chat 90 recommendation. Architecture choice in particular benefited from carefully reasoning about B's extension-ID problem and the rejected fourth option. Less critical for a coding session, but still worth considering on tricky parts.
- **The architecture-before-spec, spec-before-code sequence worked.** Settling the mechanism first let the spec be coherent and self-contained. Added as standing rule 11 in the briefing.
- **Self-review caught the bridgeOnPush ordering issue.** Reinforces the Chat 90 process addition. Worth continuing the habit during implementation: after writing a block of code, name out the assumptions it makes and verify them before moving on.

---

*End of handover.*
