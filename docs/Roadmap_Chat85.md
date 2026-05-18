# Roadmap — Chat 85

*Bundle close. Updated end of Phase 8B.*

*May 18, 2026*

---

## Immediate — Phase 8B cleanup (next Sonnet session)

Retest before pushing or moving on:

- [ ] Textarea closes prematurely (panel) — second-pass fix not yet tested
- [ ] Include-notes checkbox styling (panel) — coral palette fix not yet tested visually
- [ ] Storage-as-bus live sync (panel ↔ compare.html) — fix not yet tested
- [ ] Note added on compare.html not surviving refresh — fix not yet tested
- [ ] Note in shared link not visible to recipient — may be resolved, needs fresh test
- [ ] Include-notes checkbox on compare.html for notes typed directly there — not explicitly tested

If all pass: push search.js and compare.html, then hand to Opus for Phase 9.

---

## Phase 9 — Brand detection overhaul

Opus kickoff brief. Read Brand_Detection_Research.md. Design and implementation.

---

## Known bugs — pre-existing (not Phase 8B regressions)

Surfaced during Phase 8B testing. For Phase 9 brief or standalone fix sessions:

| Bug | Surface | Priority |
|---|---|---|
| Filters and sorts don't survive page refresh | compare.html | High |
| Minimum price filter doesn't work | compare.html | High |
| PPU math wrong on gram-weight items (e.g. Thai paste 200g $29.99 → $0.15/oz, should be ~$4.25/oz) | Panel + compare.html | High |
| Bug report overlay appears below triggering listing, on top of the one below | compare.html | Medium |
| Image and product name mushed together unless columns removed | compare.html | Medium |
| No link to privacy.html from compare.html footer | compare.html | Low |
| privacy.html header hierarchy wacky | privacy.html | Low |

---

## Standing deferred items

| Item | Notes |
|---|---|
| SUGGESTED COPY review (welcome.html) | Review before CWS push |
| Banner text in search.js (`enterReportMode`) | Review before CWS push |
| Panel_Redesign_Spec.md §8.3 + §5.7 | Stale — needs careful pass |
| Pattern A+B (`(?)` icons + Help drawer) | Pattern_AB_Note.md; future phase |
| "Always hide" semantics | Demotes not hides — UX question open |
| Keyword filter hint verbosity | Design conversation required |
| Impossible Burger math | Investigation session required |
| Prime scraping selector change | Deferred |
| Coral vs Amazon orange | Verify #f25d4e vs #ff9900 on live page |
| Text-size observation session | No design until observed |
| Per-note X delete button | Deferred from Notes_Design.md §7 |
| Purge existing Supabase rows with notes | One-time data cleanup — Melissa decision |

---

## Post-Phase-9 horizon

- compare.html filters/sorts persist across refresh (if not fixed in Phase 9 bugs pass)
- Phase 10 — TBD (Panel Redesign Spec? Onboarding?)
- CWS public listing prep (SUGGESTED COPY review, demo video, Associates application)

---

*End of roadmap.*
