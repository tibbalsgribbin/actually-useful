# Project Briefing — Chat 89

*Updated after Compare Persistence product decision. Option 1 chosen as the foundation. Next session designs the Option 1 implementation.*

*May 19, 2026*

---

## What is Actually Useful

A free Chrome extension that improves Amazon search. Shows price-per-unit, filters, sorts, brand controls, notes, and a side-by-side comparison table. Open source. No ads. No data sales.

---

## Current version

`v0.6.1` (manifest). Do not bump until CWS push.

---

## Active phase status

**Phase 8B — Notes implementation.** Not closed. Chat 88's investigation revealed an architectural gap: compare.html cannot access `chrome.storage.local` because the manifest doesn't declare a content script for the github.io domain. Notes typed on compare.html have never been saved. The Chat 85/86 "storage-as-bus" between panel and compare.html does not exist.

Chat 89 resolved the product question that gates closing Phase 8B: **compare.html is primarily a private workspace; sharing is secondary.** Option 1 (manifest content script + chrome.storage.local) is the foundation. Next session designs the Option 1 implementation.

Phase 8B remaining failures now resolve through:

1. **Compare Persistence Option 1 design + implementation** — resolves Tests 3, 4, 6 (the storage half).
2. **Share Redesign** — resolves Tests 2, 5, 6 (the sharing half). Includes the always-latest vs. frozen-snapshot sharing-model decision, which was deferred from Chat 89.
3. **Test 1 (panel textarea)** — independent investigation.

---

## Architectural finding (Chat 88, still standing)

**compare.html is not in the extension's content script scope.** The manifest declares content scripts for `https://www.amazon.com/s*` and `https://actuallyuseful.net/welcome*` only. Compare.html is served from `https://tibbalsgribbin.github.io/actually-useful/compare.html` and runs as a plain web page.

Consequences:
- `window.chrome.storage` is `undefined` on compare.html.
- The `scheduleNoteWrite` function's guard short-circuits silently. Notes typed on compare.html are not saved anywhere.
- The init-time `chrome.storage.local.get('au_item_notes')` call fails the same way. `localNotes` stays `{}`.
- Notes that appear to survive on compare.html are the ones the panel embedded in the Supabase payload (search.js line 3497) when include-notes was checked.

A second, smaller bug was also found: `rerenderTableOnly()` (compare.html line 1966) doesn't merge `localNotes` into `currentItems`. `rerender()` (line 1785) does. Masked in production by the bigger problem. **Both will need addressing during Option 1 implementation.**

---

## Compare Persistence — decided Chat 89

**What compare.html is:** primarily a private workspace — a larger, more legible extension of the panel with sort, filter, and column tools for narrowing a search from broad to narrow. Sharing is an extension of that purpose, not the primary purpose.

**Path chosen:** Option 1. Add a `content_scripts` entry for `tibbalsgribbin.github.io/actually-useful/*` to the manifest. Compare.html becomes a content-script context with `chrome.storage.local` access. The existing notes-write and notes-read code starts working as written. Filters, sort, and column visibility will also need persistence work (scope of first-pass vs. follow-up to be decided in the design session).

**What's deferred:** the sharing-model question (always-latest vs. frozen-snapshot). Leaning during discussion was frozen-snapshot variant 1a (live local workspace; clicking Share freezes a snapshot to Supabase; user keeps editing). One-to-many sharing was identified as the design-pressure case that breaks always-latest. Resolves in Share Redesign.

**Options not chosen:**
- Option 2 (postMessage bridge) — ruled out Chat 88.
- Option 3 (server-side persistence) — wrong model for a private workspace.
- Option 4 (accept that notes don't persist) — incompatible with serving the user well.
- Option 5 (turn-based collaboration) — parked. Possible future extension. Snapshot primitive sits naturally on top of Option 1 if needed.

**Supabase cost was not a factor.** Free tier holds ~17,000 records and ~170,000 link-opens/month at Actually Useful's scale.

---

## Locked decisions (standing, not revisited)

| Decision | Chosen |
|---|---|
| **Compare Persistence — what compare.html is** | **Primarily a private workspace. Sharing is secondary. (Chat 89)** |
| **Compare Persistence — implementation path** | **Option 1: manifest content script for compare.html + chrome.storage.local. (Chat 89)** |
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
| What state besides notes goes in chrome.storage.local in first-pass Option 1? (Filters, sort, column visibility?) | Option 1 design session |
| Key naming for chrome.storage.local state | Option 1 design session |
| Should `rerenderTableOnly()` merge gap be in Option 1 brief or separate cleanup? | Option 1 design session |
| Permission surface implications of adding github.io to content_scripts (privacy.html note? user-facing mention?) | Option 1 design session |
| Sharing model: always-latest vs. frozen-snapshot (leaning frozen 1a per Chat 89 discussion) | Share Redesign |
| Number of share buttons; share scopes (all / filtered / checked) | Share Redesign |
| Where include-notes choice lives (if it still exists after Share Redesign) | Share Redesign |

---

## Files — current state

Unchanged from end of Chat 86. Chats 87, 88, and 89 made no permanent changes.

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
| Supabase | Compare-page sharing | Stored row data includes notes only when `includeNotes` is true at save time. Role unchanged by Chat 89 decision — Option 1 uses chrome.storage.local for personal state, Supabase remains the sharing transport. |

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

- compare.html filters and sorts don't survive page refresh → **folded into Compare Persistence Option 1 design** (first-pass scope TBD)
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

## What's next

1. **Next session (Opus) — Compare Persistence Option 1 design.** Produces a kickoff brief for Sonnet. Covers manifest change, what state lives in chrome.storage.local, key naming, the `rerenderTableOnly()` merge gap, permission surface, migration. Does **not** make sharing-model decisions.
2. **Then — Sonnet implementation session.** Implements Option 1 from the kickoff brief.
3. **Then — Share Redesign kickoff brief.** Includes the sharing-model decision (always-latest vs. frozen-snapshot).
4. **Test 1 investigation** — independent; pick up in any session.
5. **Phase 9 (Opus brief) — Brand detection overhaul.** Held until Phase 8B residue clears.

---

*End of briefing.*
