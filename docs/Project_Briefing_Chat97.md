# Project Briefing — Chat 97

*Updated end of Chat 97 Opus session. Phase 1.5 catalog posture tagging executed; bug-test.md toothpaste verdict reconciled. No code changes.*

*Two parallel work streams active: Phase 8B residue (unchanged since Chat 92 — no testing or code work in Chats 93–97) and the unit-collision design track (Phase 1 catalog tagged with postures as of this session).*

*May 20, 2026*

---

## What is Actually Useful

A free Chrome extension that improves Amazon search. Shows price-per-unit, filters, sorts, brand controls, notes, and a side-by-side comparison table. Open source. No ads. No data sales.

---

## Current version

`manifest.json` → `0.6.2`. `compare.html` → `compare-v1.1.0`. `compare-bridge.js` → `bridge-v1.0.0`. No code changes since Chat 92.

---

## Active work streams

Two parallel tracks. Sessions pick the track based on what's queued and what energy is available; they don't block each other.

### Track 1 — Phase 8B residue (gated on energy)

Carried forward from Chat 92. Option 1 workspace persistence shipped to compare.html in Chat 92. Tests 5–8 passing. Tests 9–17, cross-tab sync, merge-gap fix, no-bridge fallback all pending. Test 1 (panel textarea closing prematurely) still ongoing. Panel note area purple/indigo styling still pending investigation.

No Phase 8B work in Chats 93–97 (design-track sessions).

### Track 2 — Unit-collision design (active)

Phase 1 catalog (`Unit_Catalog_Phase1.md`) completed Chat 93. Trust posture framework discussed and drafted in Chat 94, audited in Chat 95, consolidated in Chat 96. Phase 1.5 catalog tagging done Chat 97 — 13 firm posture tags on VERIFIED entries, 7 hypothesis tags on SPECULATIVE entries the Override_Principle case table covers.

Three canonical design docs form the framework:

- `Override_Principle.md` — the design spine; four trust postures and the decision tree.
- `Servings_Design.md` — canonical worked example of the add-pill posture.
- `Demotion_Display.md` — visual layer of the trust postures.

Next phases: Phase 2 (taxonomy), Phase 3 (detection rules), Phase 4 (ambiguity-note redesign).

---

## Trust posture framework — locked Chat 96

The framework that emerged across Chats 93–96 and was locked in Chat 96 consolidation:

| Decision | Resolved |
|---|---|
| **Four trust postures** | defer, override, add-pill, note |
| **Defer is the base case** | Add-pill and note stack on top; override replaces |
| **Override sub-postures, mutually exclusive** | Recategorize (replace Amazon's PPU) vs suppress (show no PPU) |
| **Add-pill and recategorize, mutually exclusive** | Trigger: "is Amazon's PPU meaningful to keep available?" Yes → defer (plus add-pill if applicable); no → recategorize (if replacement) or suppress (if not) |
| **Add-pill is plural by default** | Surface every meaningful comparison unit the title supports |
| **Consumption-unit equivalence** | Multiple title units describing the same consumption unit collapse to one pill (laundry sheet/pod/tab/load → one "per wash" pill) |
| **Demote trigger** | A listing demotes when it can't supply the currently-sorted unit (not when its preferred unit doesn't match the sort) |
| **Demotion tier** | Determined by what the listing supplies, not by its posture. Normal = supplies the sorted unit. Soft = supplies some other meaningful PPU. Hard = supplies no meaningful PPU on this page. |

---

## Phase 1.5 outputs (Chat 97)

Every VERIFIED entry in `Unit_Catalog_Phase1.md` now carries an inline `**Posture:** ...` line.

**Eight category-level postures** (firm):

| Collision | Posture |
|---|---|
| Toothpaste (oz/fl oz) | Defer |
| Paper grade (lb) | Override (suppress) |
| Dumbbells/kettlebells (lb) | Override (suppress) |
| Per-serving nutrition supplements (g) | Override (suppress) at handler; Defer + Add-pill at category |
| Per-serving more broadly (g) | Defer + Add-pill (when generalized beyond supplements) |
| Whole-package $/ct | Override (recategorize); fallback to Override (suppress) |
| Pair $/pair vs $/item | Defer + Note |
| Solid-product override gap (load) | Defer + Add-pill (consumption-unit equivalence) |

**Five N/A entries** (not category collisions, tagged for completeness): stray paren fl oz (parse bug), pack-vs-item ct (arithmetic bug), sub-penny PPU (formatting), min-5ft `extractCount` guard (detection carve-out), `'in'` preposition risk (detection-risk note).

**Seven SPECULATIVE bookkeeping tags** (hypothesis, from Override_Principle case table): cross-stitch, bedding thread count, fishing line lb test, screen size, aquarium L, trash bag gallons, cookware piece sets.

---

## Architectural foundation (decided Chat 91, unchanged)

**compare.html cannot access `chrome.storage` from its inline page script.** Content scripts live in an isolated world; the page's own scripts cannot reach `chrome.storage` directly.

**Solution (Architecture A, Chat 91):** A content-script bridge.

- `content/page/compare-bridge.js` runs in the isolated world and owns all `chrome.storage` access.
- compare.html's inline script talks to it via `window.postMessage`.
- One `getState` round-trip at init hydrates notes, columns, filters, and sort.
- Bridge pushes `chrome.storage.onChanged` events back to the page for cross-tab sync.
- 1000ms ping detects bridge presence; non-extension viewers fall back gracefully.

**Secondary architectural fact:** compare.html is served from `https://actuallyuseful.net/compare.html`. The github.io URL redirects via a GitHub Pages custom domain. `actuallyuseful.net` is already in the manifest's `host_permissions`.

---

## Compare Persistence — current state

**Shipped (Chat 92):** Notes persistence on compare.html. Tests 5–8 passing (note survives refresh; note appears in second tab; note appears from panel; deleted note stays gone).

**Not yet tested:** columns, filters, sort, cross-tab sync, merge-gap fix, no-bridge fallback. No testing in Chats 93–97.

**Storage schema (locked Chat 90, unchanged):**

| Key | Scope | Purpose |
|---|---|---|
| `au_item_notes` | Global, keyed by ASIN | Note text per product |
| `au_col_visibility` | Global | Column show/hide state |
| `au_search_state` | Per-search, keyed by Supabase `id` | Filters + sort per comparison |

**What's deferred (unchanged from Chat 91):** sharing-model question (always-latest vs. frozen-snapshot). Leaning frozen-snapshot variant 1a. Resolves in Share Redesign.

---

## Locked decisions (standing, not revisited)

| Decision | Chosen |
|---|---|
| **Compare Persistence — what compare.html is** | **Primarily a private workspace. Sharing is secondary. (Chat 89)** |
| **Compare Persistence — what state persists locally** | **Notes + filters + sort + column visibility. (Chat 90)** |
| **Compare Persistence — storage shape** | **`au_item_notes` (existing), `au_col_visibility` (new), `au_search_state` (new, per-search keyed by Supabase id). (Chat 90)** |
| **Compare Persistence — delivery mechanism** | **Architecture A: content script bridge + postMessage. (Chat 91)** |
| **Compare Persistence — implementation spec** | **`Option1_Implementation_Spec_Chat91.md` is locked. (Chat 91)** |
| **Trust posture framework** | **`Override_Principle.md`, `Servings_Design.md`, `Demotion_Display.md` (Chat 96). See section above.** |
| Notes persistence | C — chrome.storage.local + clear-all in Settings |
| Notes sharing default | Off — recipient does not see notes unless sender opts in |
| Notes edit-back | C — storage-as-bus (chrome.storage.onChanged). Now live after Option 1. |
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
| Full Design System consolidation (spacing, button states, form inputs, etc.) | Future design session — partial consolidation in `Design_System.md` Chat 96 |
| Which categories actually behave like toothpaste (defer posture verification) | Phase 2 / Phase 3 verification searches |
| Whether SPECULATIVE entries with `posture-hypothesis` tags hold up under verification | Phase 2 / Phase 3 verification searches |

---

## Files — current state (code)

| File | Version | Notes |
|---|---|---|
| `manifest.json` | v0.6.2 | Added content_scripts entry for compare-bridge.js (Chat 92) |
| `background.js` | v0.6.1.19 | Unchanged |
| `core.js` | v0.6.1.54 | Unchanged |
| `search.js` | v0.6.2.1 | Unchanged. `isServingWeight()` verified Chat 96 (lines 974–977). |
| `compare.html` | compare-v1.1.0 | Option 1 persistence + focus-loss fix (Chat 92) |
| `content/page/compare-bridge.js` | bridge-v1.0.0 | New file (Chat 92) |
| `privacy.html` | Phase 8B | Pre-CWS bridge-injection note pending |
| `styles.css` | — | Unchanged |

---

## Design docs — current state

| Doc | Status | Notes |
|---|---|---|
| `Override_Principle.md` | Locked Chat 96 | Design spine for the trust posture framework |
| `Servings_Design.md` | Locked Chat 96 | Canonical add-pill worked example |
| `Demotion_Display.md` | Locked Chat 96 | Visual layer for the trust postures |
| `Design_System.md` | Partial, Chat 96 | Palette, fonts, opacity, `(?)` icon. Spacing/buttons/etc. TBD. |
| `Unit_Catalog_Phase1.md` | **Updated Chat 97** | Phase 1.5 inline posture tags applied to 13 VERIFIED + 7 SPECULATIVE entries |
| `bug-test.md` | **Updated Chat 97** | Toothpaste verdict reconciled in two locations (log row + known-tricky-cases) |
| `Panel_Redesign_Spec.md` | Mixed | §3 palette is canonical (referenced by Design_System). §5.7, §8.3 stale per Roadmap. |
| `Pattern_AB_Note.md` | Locked | `(?)` icon canonical spec |
| `Brand_Detection_Research.md` | Locked | Phase 9 reference |
| `Notes_Design.md` | Locked | Notes feature spec |
| `Option1_Implementation_Spec_Chat91.md` | Locked | Compare persistence spec |

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
3. **Commit summary at end of every session, and any time a file needs to be pushed to the server mid-session.** Also: if testing requires a file to be live on the server, tell Melissa to commit and push BEFORE giving test instructions.
4. **Opus owns version number decisions.** Melissa never decides versions.
5. **(Chat 87) Diagnose before fixing.** When a bug report comes in, confirm root cause before writing code. Mirror-the-working-path moves are not diagnoses.
6. **(Chat 87) Revert cleanly when a fix doesn't work.** Don't leave partial fixes in the codebase.
7. **(Chat 88) Read the actual current code from GitHub uploads, not from handover summaries.** Theorizing from prose alone can miss structural facts.
8. **(Chat 88) Stop the session when findings reframe roadmap items.** Don't push for decisions in the same session that surfaced the new shape.
9. **(Chat 90) Name and verify load-bearing technical assumptions before building on them.**
10. **(Chat 90) Stop also when self-review surfaces a load-bearing flaw.**
11. **(Chat 91) Architecture before spec, spec before code.**
12. **(Chat 95) Unfamiliar files: read before claiming provenance.** Never assert "probably stale from earlier session" without checking. Memory guard #4.
13. **(Chat 95) Announce doc creation in chat by name** before or during the write. Makes outputs auditable from the transcript. Memory guard #5.
14. **(Chat 95) Cross-check related docs while writing them.** Re-read earlier docs explicitly when writing later ones. Memory guard #6.
15. **(Chat 95) Verify "clean mapping" claims** ("1:1," "exactly one") against the doc's own enumerated cases. Memory guard #7.
16. **(Chat 95) Don't state current code behavior without checking the code** in the current session. Memory guard #8.
17. **(Chat 95) Pin terminology once per session and reuse exactly.** No drift mid-session. Memory guard #9.

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

- compare.html filters and sorts don't survive page refresh → **fixed by Option 1 (Chat 92); not yet tested**
- Minimum price filter on compare.html doesn't work
- No link to privacy.html from compare.html footer
- privacy.html header hierarchy needs audit
- Bug report overlay appears below triggering listing instead of near button
- Image and product name mushed together in compare.html unless columns removed
- PPU math wrong on gram-weight items (Thai soup paste 200g $29.99 → $0.15/oz, should be ~$4.25/oz)

---

## Deferred from Chat 87 (still standing)

- **"+ Add a note…" always visible (panel)** — UX request from Test 1 retest.
- **AU favicon on AU webpages** — compare.html, privacy.html, welcome.html don't show extension icon in browser tabs.
- **Test 1 regression investigation** — panel textarea closing prematurely.

---

## Deferred from Chat 86 (still standing)

- **Silent-catch sweep across the codebase.** Roughly 40 `catch(e) {}` patterns in search.js, plus more in compare.html and background.js. Demo conversion done. Full sweep deferred.

---

## Deferred from Chat 90

- **Remove the dead `?data=` fallback path in compare.html.** Not urgent.

---

## Deferred from Chat 91 / Chat 92

- **Privacy.html bridge-injection note.** Pre-CWS-push polish pass.
- **Bridge ping timeout tuning.** Spec uses 1000ms. May be tunable to 500ms. Watch during testing.
- **Panel note area purple/indigo styling.** "Add a note" hover turns purple; textarea border is purple. CSS conflict. Investigate next code session alongside Test 1.

---

## Deferred from Chat 96

- **Full Design System consolidation.** `Design_System.md` from Chat 96 captures palette, fonts, opacity, and the `(?)` icon. Spacing, button states, form inputs, transitions, icons beyond `(?)`, shadows, and badge sizing are explicitly TBD. Each would need a design session.

---

## What's next

1. **Track 2 (design) — Chat 98**: Phase 2 taxonomy kickoff (recommended), or SPECULATIVE entry verification as a Phase 2 prep step.
2. **Track 1 (8B residue) — when energy permits**: complete Option 1 test suite (Tests 9–17, cross-tab sync, merge-gap, no-bridge fallback); investigate panel note area purple styling + Test 1.
3. **Then — Share Redesign kickoff brief.**
4. **Phase 9 (Opus brief) — Brand detection overhaul.** Held until Phase 8B residue clears.
