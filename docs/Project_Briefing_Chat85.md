# Project Briefing — Chat 85

*Bundle close. Updated from Phase 8B kickoff brief.*

*May 18, 2026*

---

## What is Actually Useful

A free Chrome extension that improves Amazon search. Shows price-per-unit, filters, sorts, brand controls, notes, and a side-by-side comparison table. Open source. No ads. No data sales.

---

## Current version

`v0.6.1` (manifest). Do not bump until CWS push.

---

## Active phase status

**Phase 8B — Notes implementation.** Executed. Partially tested. Several items need retest next session before the phase is clean. See Handover_Chat85.md for the full list.

**Phase 8B is not fully closed.** Next session starts with retesting, not new work.

---

## Locked decisions (standing, not revisited)

| Decision | Chosen |
|---|---|
| Notes persistence | C — chrome.storage.local + clear-all in Settings |
| Notes sharing | A — opt-in checkbox, default off |
| Notes edit-back | C — storage-as-bus (chrome.storage.onChanged) |
| Note-sharing checkbox label | "Include my notes in the shared link" |
| Checkbox placement (compare.html) | Action bar, near "Share checked items" |
| privacy.html notes copy | Option 1 — new Notes section, existing copy unchanged |

---

## Files — current state

| File | Version | Notes |
|---|---|---|
| `search.js` | v0.6.2.0 | Phase 8B second pass — downloaded, not yet pushed |
| `core.js` | v0.6.1.53 | Phase 8B first pass — pushed |
| `compare.html` | Phase 8B | Second pass — downloaded, not yet pushed |
| `privacy.html` | Phase 8B | First pass — pushed |
| `background.js` | v0.6.1.18 | Unchanged |
| `styles.css` | — | Unchanged |
| `manifest.json` | v0.6.1 | Do not bump |

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

---

## New deferred items (surfaced in Phase 8B testing)

All flagged as pre-existing, not Phase 8B regressions. For Phase 9 brief:

- compare.html filters and sorts don't survive page refresh
- Minimum price filter on compare.html doesn't work
- No link to privacy.html from compare.html footer
- privacy.html header hierarchy needs audit
- Bug report overlay appears below triggering listing instead of near button
- Image and product name mushed together in compare.html unless columns removed
- PPU math wrong on gram-weight items (Thai soup paste example: 200g at $29.99 showed $0.15/oz, should be ~$4.25/oz) — likely unit conversion or weight parsing error

---

## What's next

1. **Next session (Sonnet):** Retest Phase 8B unresolved items. If clean, push search.js and compare.html. Then hand off to Opus for Phase 9 kickoff brief.
2. **Phase 9 (Opus brief):** Brand detection overhaul per Brand_Detection_Research.md.

---

*End of briefing.*
