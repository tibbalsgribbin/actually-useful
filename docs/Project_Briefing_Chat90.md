# Project Briefing — Chat 90

*Updated after Chat 90 design session. Option 1 implementation spec attempted, found flawed in self-review. Architecture question reopened. Next session redesigns from a corrected technical foundation.*

*May 19, 2026*

---

## What is Actually Useful

A free Chrome extension that improves Amazon search. Shows price-per-unit, filters, sorts, brand controls, notes, and a side-by-side comparison table. Open source. No ads. No data sales.

---

## Current version

`v0.6.1` (manifest). Do not bump until CWS push.

---

## Active phase status

**Phase 8B — Notes implementation.** Not closed. The Chat 89 product decision (compare.html is primarily a private workspace) is locked. The Chat 90 scope and storage-shape decisions are locked. **The implementation architecture is open again** — see "Architectural finding (Chat 90)" below.

Phase 8B remaining failures still resolve through:

1. **Compare Persistence Option 1 design + implementation** — resolves Tests 3, 4, 6 (the storage half). Next session redesigns the architecture, then writes a corrected spec.
2. **Share Redesign** — resolves Tests 2, 5, 6 (the sharing half). Includes the always-latest vs. frozen-snapshot sharing-model decision, which was deferred from Chat 89.
3. **Test 1 (panel textarea)** — independent investigation.

---

## Architectural finding (Chat 88, updated by Chat 90)

**compare.html cannot access `chrome.storage` from its inline page script** — but for a different reason than Chat 88 framed it.

The Chat 88 finding was: the manifest doesn't declare compare.html's domain, so the page is outside the extension's content script scope. That's accurate.

The Chat 90 finding extends this: **even if the manifest declares the domain as a `content_scripts` match, the page's inline `<script>` block still cannot access `chrome.storage`.** Content scripts run in an isolated world, separate from the page's own scripts. Adding a content_script entry would give the injected script access to `chrome.storage`, but the existing inline code in compare.html lives in the page's own JavaScript context, which is a separate isolated world. The two cannot share state directly.

This invalidates the Chat 89 conclusion that "the manifest change alone makes the existing code work." It doesn't. The existing code is dead because the page itself can never reach `chrome.storage`, regardless of what content scripts are alongside it.

**Three architectural options to reach storage from compare.html** (next session decides which):

- **A: content_scripts + postMessage bridge.** Inject content script alongside the page; bridge state via DOM-level postMessage. Awkward async pattern; two layers to keep in sync.
- **B: externally_connectable + background broker.** Page sends messages to the extension's background script via `chrome.runtime.sendMessage(EXTENSION_ID, ...)`; background brokers all storage access. Standard Chrome pattern.
- **C: Move compare.html into the extension as an extension page.** Cleanest code; non-starter because it breaks shared links for recipients without the extension installed.

**Secondary architectural fact (corrected from Chat 89 handover):** compare.html is served from `https://actuallyuseful.net/compare.html`, not from github.io directly. The github.io URL exists but redirects via a GitHub Pages custom domain. `actuallyuseful.net` is already in the manifest's `host_permissions`. search.js opens the github.io URL, which redirects to actuallyuseful.net before the page loads.

A second, smaller bug from Chat 88 still stands: `rerenderTableOnly()` (compare.html line 1966) doesn't merge `localNotes` into `currentItems`. `rerender()` (line 1785) does. Masked in production by the bigger problem. **Both will need addressing during Option 1 implementation, regardless of which architecture is chosen.**

---

## Compare Persistence — current state

**What compare.html is (Chat 89, locked):** primarily a private workspace — a larger, more legible extension of the panel with sort, filter, and column tools for narrowing a search from broad to narrow. Sharing is an extension of that purpose, not the primary purpose.

**Path direction (Chat 89, partially valid):** Option 1 — local persistence via `chrome.storage.local`. The *intent* is correct: notes, filters, sort, and column visibility persist locally on the user's machine. **The specific mechanism** ("manifest content script for compare.html") was wrong (Chat 90).

**What's locked from Chat 90:**

| Decision | Resolution |
|---|---|
| Scope of Option 1 first pass | Notes + filters + sort + column visibility |
| Notes keying | Global by ASIN (existing key `au_item_notes`) |
| Column visibility keying | Global (display preference) — new key `au_col_visibility` |
| Filters keying | Per-search — new key `au_search_state` |
| Sort keying | Per-search — new key `au_search_state` (same key as filters) |
| searchId for per-search state | The Supabase `id` from `?id=` URL param. Universal — every compare.html URL has it. The `?data=` legacy path is dead in practice. |
| Storage hygiene | No pruning yet. Per-search entries accumulate; revisit if quota approaches. |
| Write timing | Mirror existing rerender debounce: text inputs 250ms, others immediate |
| rerenderTableOnly merge gap | Must be folded into Option 1 |

**What's deferred (Chat 89, unchanged):** the sharing-model question (always-latest vs. frozen-snapshot). Leaning during Chat 89 discussion was frozen-snapshot variant 1a (live local workspace; clicking Share freezes a snapshot to Supabase). One-to-many sharing was identified as the design-pressure case that breaks always-latest. Resolves in Share Redesign.

**Options not chosen (Chat 89, unchanged):**

- Option 2 (postMessage bridge) — ruled out Chat 88. (Note: Architecture A above is similar in mechanism but emerged as a specific delivery option for Option 1, not a competing product strategy. It is not the same as Chat 88's Option 2.)
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
| **Compare Persistence — delivery mechanism** | **REOPENED. Was assumed to be manifest content_scripts (Chat 89); that's wrong (Chat 90). To be decided next session.** |
| Notes persistence | C — chrome.storage.local + clear-all in Settings |
| Notes sharing default | Off — recipient does not see notes unless sender opts in |
| Notes edit-back | C — storage-as-bus (chrome.storage.onChanged). Bus will exist after Option 1 ships. |
| Note-sharing checkbox label (current) | "Include my notes in the shared link" — may change in Share Redesign |
| Checkbox placement (compare.html) | Currently action bar — may be replaced or removed in Share Redesign |
| Panel-to-compare notes flow | Notes always travel; privacy gate is at the share step on compare.html |
| Share-time prompt approach (Chat 87) | Approach 4 — no persistent checkbox; ask at share time when notes exist. Still stands (Option 5 was not chosen). |
| privacy.html notes copy | Option 1 — new Notes section, existing copy unchanged |
| Error reporting destination | Separate endpoint, independent of telemetry opt-out, diagnostic-only payloads |
| Browser detection in error reports | `navigator.userAgent` check for `Edg/` token |

---

## Open design questions (carried forward)

| Question | Resolves in |
|---|---|
| Which delivery architecture for chrome.storage access from compare.html? (A: content_scripts + postMessage bridge / B: externally_connectable + background broker / C: extension page — non-starter / possibly D: something not yet identified) | Next Opus session (Option 1 redesign) |
| Permission surface implications of the chosen architecture (privacy.html note? user-facing mention?) | Option 1 redesign session |
| Sharing model: always-latest vs. frozen-snapshot (leaning frozen 1a per Chat 89 discussion) | Share Redesign |
| Number of share buttons; share scopes (all / filtered / checked) | Share Redesign |
| Where include-notes choice lives (if it still exists after Share Redesign) | Share Redesign |

---

## Files — current state

Unchanged from end of Chat 86. Chats 87, 88, 89, and 90 made no permanent changes.

| File | Version | Notes |
|---|---|---|
| `manifest.json` | v0.6.1 | `default_icon` added to action block (Chat 86). Do not bump. |
| `background.js` | v0.6.1.19 | AU_ERROR handler + Fix B + dead AU_UPDATE_NOTE handler removed (Chat 86). |
| `core.js` | v0.6.1.54 | auReportError + auSendMessage added (Chat 86). |
| `search.js` | v0.6.2.1 | Two sendMessage sites use auSendMessage (Chat 86). |
| `compare.html` | compare-v1.0.0 | Phase 8B push from Chat 86. |
| `privacy.html` | Phase 8B | Pushed (Chat 85). |
| `styles.css` | — | Unchanged. |

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

- compare.html filters and sorts don't survive page refresh → **folded into Compare Persistence Option 1 (scope locked Chat 90)**
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

## What's next

1. **Next session (Opus, extended thinking on) — Option 1 architecture redesign.** Choose between A (content_scripts + postMessage bridge), B (externally_connectable + background broker), or another option. Then write a corrected implementation spec.
2. **Then — Sonnet implementation session.** Implements Option 1 from the corrected brief.
3. **Then — Share Redesign kickoff brief.** Includes the sharing-model decision (always-latest vs. frozen-snapshot).
4. **Test 1 investigation** — independent; pick up in any session.
5. **Phase 9 (Opus brief) — Brand detection overhaul.** Held until Phase 8B residue clears.
