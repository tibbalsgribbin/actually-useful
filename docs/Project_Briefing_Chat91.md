# Project Briefing — Chat 91

*Updated after Chat 91 design session. Option 1 architecture decided (Architecture A: content script + postMessage bridge). Corrected implementation spec produced. Ready for Sonnet implementation next session.*

*May 19, 2026*

---

## What is Actually Useful

A free Chrome extension that improves Amazon search. Shows price-per-unit, filters, sorts, brand controls, notes, and a side-by-side comparison table. Open source. No ads. No data sales.

---

## Current version

`v0.6.1` (manifest). Do not bump until CWS push.

---

## Active phase status

**Phase 8B — Notes implementation.** Not closed. The Chat 89 product decision (compare.html is primarily a private workspace) is locked. The Chat 90 scope and storage-shape decisions are locked. **The Chat 91 architectural decision (Architecture A) is locked.** The corrected implementation spec is locked. Next session is Sonnet implementation.

Phase 8B remaining failures still resolve through:

1. **Compare Persistence Option 1 implementation** — resolves Tests 3, 4, 6 (the storage half). Spec ready (`Option1_Implementation_Spec_Chat91.md`). Next session implements.
2. **Share Redesign** — resolves Tests 2, 5, 6 (the sharing half). Includes the always-latest vs. frozen-snapshot sharing-model decision, deferred from Chat 89.
3. **Test 1 (panel textarea)** — independent investigation.

---

## Architectural foundation (decided Chat 91)

**compare.html cannot access `chrome.storage` from its inline page script.** The page is in the page's own JavaScript world; `chrome.storage` is only available to content scripts in the extension's isolated world. The two cannot share globals directly.

**Solution (Architecture A, Chat 91):** A small content-script bridge.

- New file `content/page/compare-bridge.js` lives in the isolated world. It owns all `chrome.storage` access.
- compare.html's inline script talks to the bridge via `window.postMessage` for reads, writes, and change notifications.
- One round-trip at init (`getState`) hydrates notes, columns, filters, and sort in a single call.
- Bridge pushes `chrome.storage.onChanged` events back to the page for cross-tab sync.
- 1000ms ping at init detects bridge presence; non-extension viewers fall back to no-persistence with the same observable behavior as today.

**Why not B (externally_connectable + background broker):** Requires the page to know the extension ID. Hardcoding breaks dev workflow; dynamic discovery brings content scripts back, making A simpler.

**Why not C (move compare.html into extension):** Non-starter (Chat 90). Breaks shared links for recipients without the extension installed.

**Secondary architectural fact (carried from Chat 90):** compare.html is served from `https://actuallyuseful.net/compare.html`, not from github.io directly. The github.io URL redirects via a GitHub Pages custom domain. `actuallyuseful.net` is already in the manifest's `host_permissions`.

A second, smaller bug from Chat 88 still stands: `rerenderTableOnly()` (compare.html line 1966) doesn't merge `localNotes` into `currentItems`. Folded into the Option 1 implementation spec (§8.6).

---

## Compare Persistence — current state

**What compare.html is (Chat 89, locked):** primarily a private workspace — a larger, more legible extension of the panel with sort, filter, and column tools for narrowing a search from broad to narrow. Sharing is an extension of that purpose, not the primary purpose.

**Path direction (Chat 89, refined Chat 90, mechanism locked Chat 91):** Option 1 — local persistence via `chrome.storage.local`, reached from compare.html through a content-script bridge.

**What's locked from Chat 90:**

| Decision | Resolution |
|---|---|
| Scope of Option 1 first pass | Notes + filters + sort + column visibility |
| Notes keying | Global by ASIN (existing key `au_item_notes`) |
| Column visibility keying | Global (display preference) — new key `au_col_visibility` |
| Filters keying | Per-search — new key `au_search_state` |
| Sort keying | Per-search — new key `au_search_state` (same key as filters) |
| searchId for per-search state | The Supabase `id` from `?id=` URL param. Universal. The `?data=` legacy path is dead in practice. |
| Storage hygiene | No pruning yet. Per-search entries accumulate; revisit if quota approaches. |
| Write timing | Mirror existing rerender debounce: text inputs 250ms, others immediate |
| rerenderTableOnly merge gap | Folded into Option 1 (spec §8.6) |

**What's locked from Chat 91 (delivery mechanism):**

| Decision | Resolution |
|---|---|
| Delivery mechanism | Architecture A — content script bridge + page-side postMessage client |
| New file | `content/page/compare-bridge.js` (~100 lines) |
| Bridge detection timeout | 1000ms ping at init; cached |
| Non-extension viewer UX | Inputs visible, writes silently no-op (same as today) |
| Permission surface change | None. `actuallyuseful.net` already in `host_permissions`; `storage` already granted. |

**What's deferred (Chat 89, unchanged):** the sharing-model question (always-latest vs. frozen-snapshot). Leaning during Chat 89 discussion was frozen-snapshot variant 1a (live local workspace; clicking Share freezes a snapshot to Supabase). One-to-many sharing was identified as the design-pressure case that breaks always-latest. Resolves in Share Redesign.

**Options not chosen (Chat 89, unchanged):**

- Option 2 (postMessage bridge as product strategy) — ruled out Chat 88. Note: Architecture A's postMessage bridge is a delivery mechanism for Option 1, not Option 2's product strategy. Different scope, different intent.
- Option 3 (server-side persistence) — wrong model for a private workspace.
- Option 4 (accept that notes don't persist) — incompatible with serving the user well.
- Option 5 (turn-based collaboration) — parked. Possible future extension. Snapshot primitive sits naturally on top of Option 1 if needed.

**Supabase cost was not a factor.** Free tier holds ~17,000 records and ~170,000 link-opens/month at Actually Useful's scale.

---

## Locked decisions (standing, not revisited)

| Decision | Chosen |
|---|---|
| **Compare Persistence — what compare.html is** | **Primarily a private workspace. Sharing is secondary. (Chat 89)** |
| **Compare Persistence — what state persists locally** | **Notes + filters + sort + column visibility. (Chat 90)** |
| **Compare Persistence — storage shape** | **`au_item_notes` (existing), `au_col_visibility` (new), `au_search_state` (new, per-search keyed by Supabase id). (Chat 90)** |
| **Compare Persistence — delivery mechanism** | **Architecture A: content script bridge + postMessage. (Chat 91)** |
| **Compare Persistence — implementation spec** | **`Option1_Implementation_Spec_Chat91.md` is locked. (Chat 91)** |
| Notes persistence | C — chrome.storage.local + clear-all in Settings |
| Notes sharing default | Off — recipient does not see notes unless sender opts in |
| Notes edit-back | C — storage-as-bus (chrome.storage.onChanged). Bus will exist after Option 1 ships. |
| Note-sharing checkbox label (current) | "Include my notes in the shared link" — may change in Share Redesign |
| Checkbox placement (compare.html) | Currently action bar — may be replaced or removed in Share Redesign |
| Panel-to-compare notes flow | Notes always travel; privacy gate is at the share step on compare.html |
| Share-time prompt approach (Chat 87) | Approach 4 — no persistent checkbox; ask at share time when notes exist. Still stands. |
| privacy.html notes copy | Option 1 — new Notes section, existing copy unchanged |
| Error reporting destination | Separate endpoint, independent of telemetry opt-out, diagnostic-only payloads |
| Browser detection in error reports | `navigator.userAgent` check for `Edg/` token |

---

## Open design questions (carried forward)

| Question | Resolves in |
|---|---|
| Privacy.html update for compare.html bridge injection (small note; no new data category, no new external surface) | Pre-CWS-push polish pass |
| Sharing model: always-latest vs. frozen-snapshot (leaning frozen 1a per Chat 89 discussion) | Share Redesign |
| Number of share buttons; share scopes (all / filtered / checked) | Share Redesign |
| Where include-notes choice lives (if it still exists after Share Redesign) | Share Redesign |
| Non-extension viewer messaging ("install the extension to save notes…" hint) | Possible future polish; not in Option 1 |

---

## Files — current state

Unchanged from end of Chat 86. Chats 87, 88, 89, 90, and 91 made no permanent changes.

| File | Version | Notes |
|---|---|---|
| `manifest.json` | v0.6.1 | `default_icon` added to action block (Chat 86). Will bump to v0.6.2 during Option 1 implementation. |
| `background.js` | v0.6.1.19 | AU_ERROR handler + Fix B + dead AU_UPDATE_NOTE handler removed (Chat 86). |
| `core.js` | v0.6.1.54 | auReportError + auSendMessage added (Chat 86). |
| `search.js` | v0.6.2.1 | Two sendMessage sites use auSendMessage (Chat 86). |
| `compare.html` | compare-v1.0.0 | Phase 8B push from Chat 86. Will bump to compare-v1.1.0 during Option 1 implementation. |
| `privacy.html` | Phase 8B | Pushed (Chat 85). Pre-CWS small bridge-injection note pending. |
| `styles.css` | — | Unchanged. |

**Files to be created during Option 1 implementation:**
- `content/page/compare-bridge.js` — new content script bridge file.

---

## Infrastructure — current state

| System | Purpose | Notes |
|---|---|---|
| Telemetry Apps Script + sheet | Search usage logging | Gated by user telemetry toggle (default on). |
| AU Error Log Apps Script + sheet | Diagnostic error reporting | Added Chat 86. Independent of telemetry opt-out. |
| Supabase | Compare-page sharing | Stored row data includes notes only when `includeNotes` is true at save time. Role unchanged — Option 1 uses chrome.storage.local for personal state, Supabase remains the sharing transport. |

---

## Standing process rules

1. **Sonnet never makes design/color decisions.** Every brief includes exact hex, font size, placement.
2. **Testing instructions every time, plain language, numbered steps.** Don't assume Melissa remembers prior tests.
3. **Commit summary at end of every session.** Also any time a file in the GitHub root folder changes mid-session.
4. **Opus owns version number decisions.** Melissa never decides versions.
5. **(Chat 87) Diagnose before fixing.** When a bug report comes in, confirm root cause before writing code. Mirror-the-working-path moves are not diagnoses.
6. **(Chat 87) Revert cleanly when a fix doesn't work.** Don't leave partial fixes in the codebase.
7. **(Chat 88) Read the actual current code from GitHub uploads, not from handover summaries.** Theorizing from prose alone can miss structural facts.
8. **(Chat 88) Stop the session when findings reframe roadmap items.** Don't push for decisions in the same session that surfaced the new shape.
9. **(Chat 90) Name and verify load-bearing technical assumptions before building on them.** When a spec depends on a specific API behavior or platform constraint, surface the assumption explicitly and verify it (docs, smoke test, or focused web check) before building 600 lines on top of it. Extended thinking is a good tool for this kind of pre-flight check.
10. **(Chat 90) Stop also when self-review surfaces a load-bearing flaw, not just when external findings do.** The Chat 88 stop-and-reframe rule applies to internal review findings too.
11. **(Chat 91) Architecture before spec, spec before code.** When a delivery mechanism is open, settle it first. Don't write implementation detail on top of an unsettled mechanism.

---

## Standing deferred items (pre-8B, unchanged)

- SUGGESTED COPY review — welcome.html flagged blocks, review before CWS push
- Banner text in search.js — `// <!-- SUGGESTED COPY -->` in `enterReportMode()`, review before CWS push
- Panel_Redesign_Spec.md — §8.3 and §5.7 stale; separate careful pass
- Pattern A+B (`(?)` icons + Help drawer) — Pattern_AB_Note.md; future phase
- "Always hide" semantics — demotes instead of hides; UX question pending
- Keyword filter hint verbosity — deferred, design conversation required
- Impossible Burger math — deferred, investigation session required
- Prime scraping selector change — deferred
- Coral vs Amazon orange — verify #f25d4e doesn't clash with #ff9900 on live page
- Text-size observation session — no design until observed
- Per-note X delete button — deferred from Notes_Design.md §7
- Purge existing Supabase rows with notes — one-time data cleanup, Melissa decision

---

## Deferred items from Phase 8B testing

- compare.html filters and sorts don't survive page refresh → **folded into Compare Persistence Option 1 (spec Chat 91, locked)**
- Minimum price filter on compare.html doesn't work
- No link to privacy.html from compare.html footer
- privacy.html header hierarchy needs audit
- Bug report overlay appears below triggering listing instead of near button
- Image and product name mushed together in compare.html unless columns removed
- PPU math wrong on gram-weight items (Thai soup paste 200g $29.99 → $0.15/oz, should be ~$4.25/oz)

---

## Deferred (Chat 87, still standing)

- **"+ Add a note…" always visible (panel)** — UX request from Test 1 retest.
- **AU favicon on AU webpages** — compare.html, privacy.html, welcome.html don't show extension icon in browser tabs.
- **Test 1 regression investigation** — panel textarea closing prematurely came back during Chat 87 after initially passing.

---

## Deferred from Chat 86 (still standing)

- **Silent-catch sweep across the codebase.** Roughly 40 `catch(e) {}` patterns in search.js, plus more in compare.html and background.js. Demo conversion done. Full sweep deferred.

---

## Deferred from Chat 90

- **Remove the dead `?data=` fallback path in compare.html (lines 2578-2607).** No current flow produces a `?data=` URL. Could be cleaned up in a future maintenance pass; not urgent.

---

## Deferred from Chat 91

- **Privacy.html bridge-injection note.** When Option 1 ships, privacy.html should mention that the extension injects a small bridge script into compare.html on actuallyuseful.net for local persistence. No new data category; small wording update. Pre-CWS-push polish pass.
- **Bridge ping timeout tuning.** Spec uses 1000ms. May be tunable down (500ms or less) if the no-extension delay is noticeable in practice. Watch during testing.

---

## What's next

1. **Next session (Sonnet implementation) — Option 1 implementation from `Option1_Implementation_Spec_Chat91.md`.** Spec is self-contained and gated by smoke tests at each step. Manifest + bridge file first, then compare.html changes in the order specified by spec §17.
2. **Then — Share Redesign kickoff brief.** Includes the sharing-model decision (always-latest vs. frozen-snapshot).
3. **Test 1 investigation** — independent; pick up in any session.
4. **Phase 9 (Opus brief) — Brand detection overhaul.** Held until Phase 8B residue clears.
