# Project Briefing — Chat 88

*Updated after Test 4 root-cause investigation. Architectural finding reframes Compare Persistence.*

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

Phase 8B remaining failures now resolve into two product decisions plus one investigation:

1. **Compare Persistence (gating)** — decides whether and how compare.html persists state. Four options on the table (Option 2 ruled out). Resolves Tests 3, 4, 6.
2. **Share Redesign (gated on Compare Persistence)** — resolves Tests 2, 5. Scope depends on which Compare Persistence option lands.
3. **Test 1 (panel textarea)** — independent investigation.

---

## Architectural finding (Chat 88)

**compare.html is not in the extension's content script scope.** The manifest declares content scripts for `https://www.amazon.com/s*` and `https://actuallyuseful.net/welcome*` only. Compare.html is served from `https://tibbalsgribbin.github.io/actually-useful/compare.html` and runs as a plain web page.

Consequences:
- `window.chrome.storage` is `undefined` on compare.html.
- The `scheduleNoteWrite` function's guard short-circuits silently. Notes typed on compare.html are not saved anywhere.
- The init-time `chrome.storage.local.get('au_item_notes')` call fails the same way. `localNotes` stays `{}`.
- Notes that appear to survive on compare.html are the ones the panel embedded in the Supabase payload (search.js line 3497) when include-notes was checked.

A second, smaller bug was also found: `rerenderTableOnly()` (compare.html line 1966) doesn't merge `localNotes` into `currentItems`. `rerender()` (line 1785) does. Masked in production by the bigger problem.

---

## Compare Persistence — options on the table

| | Option 1: Content script | Option 3: Server-side | Option 4: Don't persist | Option 5: Turn-based |
|---|---|---|---|---|
| What it does | Manifest adds github.io path; existing storage code starts working | Compare.html writes state to Supabase against the comparison record | Document the limitation; possibly disable note editing on compare.html | Each share is a frozen snapshot; recipients fork to reply |
| Notes work on | Your browser only | Any device, any browser | Nowhere | Any device, any browser |
| Notes visible to | You only (unless explicit share) | You + anyone with the link | Nobody | You + collaborators, turn-based |
| Privacy | Notes stay local | Notes on a server | Nothing to leak | Each snapshot is a separate record |
| Effort | Small | Large | Tiny | Medium |

Option 2 (postMessage bridge) ruled out in Chat 88 — silent failure when panel tab is closed.

**Supabase cost is not a blocker.** Free tier holds ~17,000 records and ~170,000 link-opens/month at Actually Useful's scale.

**A combined answer is on the table** — e.g. Option 1 for personal state + Option 5 for sharing rounds. Personal persistence and collaborative persistence are separate problems.

---

## Locked decisions (standing, not revisited)

| Decision | Chosen |
|---|---|
| Notes persistence | C — chrome.storage.local + clear-all in Settings |
| Notes sharing default | Off — recipient does not see notes unless sender opts in |
| Notes edit-back | C — storage-as-bus (chrome.storage.onChanged) — *Chat 88 finding: bus doesn't currently exist; depends on Compare Persistence decision* |
| Note-sharing checkbox label (current) | "Include my notes in the shared link" — *will likely change in Share Redesign* |
| Checkbox placement (compare.html) | Currently action bar — *will be replaced or removed in Share Redesign* |
| Panel-to-compare notes flow | Notes always travel; privacy gate is at the share step on compare.html — *if Option 5 is chosen, this model changes* |
| Share-time prompt approach (Chat 87) | Approach 4 — no persistent checkbox; ask at share time when notes exist — *moot if Option 5 chosen* |
| privacy.html notes copy | Option 1 — new Notes section, existing copy unchanged |
| Error reporting destination | Separate endpoint, independent of telemetry opt-out, diagnostic-only payloads |
| Browser detection in error reports | `navigator.userAgent` check for `Edg/` token |

---

## Files — current state

Unchanged from end of Chat 86. Chat 87 and Chat 88 made no permanent changes.

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
| Supabase | Compare-page sharing | Stored row data includes notes only when `includeNotes` is true at save time. May expand role depending on Compare Persistence decision. |

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

- compare.html filters and sorts don't survive page refresh → folded into **Compare Persistence**
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

1. **Next session (Opus) — Compare Persistence product decision.** Decide what compare.html is. Pick from Options 1, 3, 4, 5 (or a combination). Hand the decision to a separate design session for the chosen path. Do not implement in the decision session.
2. **Then — design session for chosen path.** Produces a brief.
3. **Then — Share Redesign kickoff brief.** Now informed by the Compare Persistence decision.
4. **Test 1 investigation** — independent; pick up in any session.
5. **Phase 9 (Opus brief) — Brand detection overhaul.** Held until Phase 8B residue clears.

---

*End of briefing.*
