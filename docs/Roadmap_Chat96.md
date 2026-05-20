# Roadmap — Chat 96

*Updated end of Chat 96. Doc consolidation pass complete. Three design docs locked (`Override_Principle.md`, `Servings_Design.md`, `Demotion_Display.md`). `Trust_Postures.md` discarded. New: `Design_System.md` (partial consolidation). No code changes.*

*May 20, 2026*

---

## Active work streams

Two parallel tracks. Sessions pick based on what's queued and what energy is available; they don't block each other.

1. **Phase 8B residue** — Option 1 test suite completion, Share Redesign, panel styling cleanup, Test 1 regression. Sonnet/Haiku territory once design questions are settled.
2. **Unit-collision design** — Phase 1 catalog (done Chat 93), trust posture framework (consolidated Chat 96), Phase 1.5 catalog tagging, Phase 2 taxonomy, Phase 3 detection rules, Phase 4 ambiguity-note redesign. Opus design work; eventual Sonnet implementation.

---

## Immediate — next session (Chat 97)

**Track: unit-collision design.** Two reasonable paths; Melissa picks based on energy:

### Path A — Phase 1.5: catalog posture tagging

Apply the now-locked trust postures to every VERIFIED entry in `Unit_Catalog_Phase1.md`. Tag values: `defer`, `override-suppress`, `override-recategorize`, `add-pill`, `note`, and combinations (e.g. `defer + add-pill`, `defer + note`).

Mechanical work, lower energy cost. Could fold into Chat 97 or be a session of its own.

### Path B — Phase 2 kickoff: taxonomy

Group verified collisions by shape. Each shape maps to one or more postures. This is design-judgment work; Opus session.

If Path A is done first, Path B gets richer input (every entry comes with a posture tag). Recommended ordering: A then B.

---

## Phase 8B residue — gated on energy/availability

Carried forward from Chat 92 Roadmap; not touched in Chats 93–96 (design-track sessions).

### A. Complete Option 1 test suite

Tests 5–8 passed. Remaining:

- [ ] **Tests 9–12** — Filter persistence (spec §13.3).
- [ ] **Tests 13–14** — Sort persistence (spec §13.4).
- [ ] **Tests 15–17** — Column visibility persistence (spec §13.5).
- [ ] **§13.6** — Cross-tab sync.
- [ ] **§13.7** — Merge-gap fix.
- [ ] **§13.8** — No-bridge fallback.

### B. Panel note area purple/indigo styling — investigate

New issue surfaced Chat 92. "Add a note" text turns purple on hover; textarea border is purple. Looks like a CSS conflict bleeding into the panel.

### C. Test 1 regression — panel textarea closes prematurely

Independent of Option 1. Can be picked up any session.

---

## Gated on Option 1 stability

### D. Share Redesign

- [ ] Hold until Option 1 test suite complete and panel note issues resolved.
- [ ] Write kickoff brief covering: number of share buttons, share scopes (all/filtered/checked), where include-notes choice lives, prompt style, **sharing model (always-latest vs. frozen-snapshot — leaning frozen 1a per Chat 89)**.
- [ ] Design pass.
- [ ] Implementation.

### E. Privacy.html small update — pre-CWS-push polish pass

- [ ] Add a brief note that the extension injects a small bridge script into compare.html on actuallyuseful.net for local persistence.

---

## Phase 8B test status — updated Chat 92

| Test | Status | Resolution path |
|---|---|---|
| 1. Textarea closes prematurely (panel) | ❌ Ongoing | Workstream C + purple styling investigation |
| 2. Include-notes checkbox styling (panel) | ❌ Coral on coral | Share Redesign (checkbox may be removed) |
| 3. Storage-as-bus live sync | ✅ Bus now exists | Verify with §13.6 cross-tab test |
| 4. Note added on compare.html not surviving refresh | ✅ Fixed (Chat 92) | Tests 5–8 passing |
| 5. Note in shared link not visible to recipient | ❌ Wired to wrong button | Share Redesign |
| 6. Compare.html include-notes for notes typed there | ⚠️ Storage now exists | Share Redesign decides if checkbox still exists |

---

## Phase 9 — Brand detection overhaul

Opus kickoff brief. Read `Brand_Detection_Research.md`. Held until Phase 8B residue clears (Option 1 full test suite + Share Redesign + Test 1 + panel styling).

---

## Unit-collision design — phase status

| Phase | Status | Notes |
|---|---|---|
| Phase 1 — Catalog | Done (Chat 93) | `Unit_Catalog_Phase1.md`. Posture tagging pending. |
| Phase 1.5 — Catalog tagging | Pending | Apply posture tags to every VERIFIED entry. Next session candidate. |
| Phase 2 — Taxonomy | Not started | Group verified collisions by shape. After Phase 1.5. |
| Phase 3 — Detection rules | Not started | Detection-and-action specs per shape. |
| Phase 4 — Ambiguity-note redesign | Not started | `applyPairsNote` rework. |
| Trust posture framework | **Locked Chat 96** | `Override_Principle.md`, `Servings_Design.md`, `Demotion_Display.md`. |

---

## Design System — phase status

| Item | Status | Notes |
|---|---|---|
| Palette consolidation | Done Chat 96 | `Design_System.md` pulls from Panel_Redesign_Spec §3 |
| Opacity floor | Done Chat 96 | From `Demotion_Display.md` |
| `(?)` icon spec | Done Chat 96 | From `Pattern_AB_Note.md` |
| Font verification (mockups vs production CSS) | Pending | Audit session — reconcile "Inter Tight" / "Source Serif 4" choices in mockups against shipped CSS |
| Spacing system | Not started | Future design session |
| Border-radius conventions | Not started | Future design session |
| Button states | Not started | Future design session |
| Form input styling | Not started | Future design session |
| Transition timings | Not started | Future design session |
| Icon system beyond `(?)` | Not started | Future design session |
| Drop shadow conventions | Not started | Future design session |
| Badge sizing for trust-posture demote badges | Not started | Future design session — ties into Phase 3 / 4 |
| Panel_Redesign_Spec.md §5.7 cleanup | Pending | Stale per earlier roadmaps |
| Panel_Redesign_Spec.md §8.3 cleanup | Pending | Stale per earlier roadmaps |

---

## Known bugs — pre-existing

| Bug | Surface | Priority |
|---|---|---|
| Minimum price filter doesn't work | compare.html | High |
| PPU math wrong on gram-weight items (Thai paste 200g $29.99 → $0.15/oz, should be ~$4.25/oz) | Panel + compare.html | High |
| Bug report overlay appears below triggering listing, on top of the one below | compare.html | Medium |
| Image and product name mushed together unless columns removed | compare.html | Medium |
| No link to privacy.html from compare.html footer | compare.html | Low |
| privacy.html header hierarchy wacky | privacy.html | Low |

---

## UX polish — pending

| Item | Surface | Notes |
|---|---|---|
| "+ Add a note…" always visible (not just after checking listing) | Panel | UX request from Test 1 retest (Chat 87) |
| AU favicon on AU webpages (compare, privacy, welcome) | All AU pages | `<link rel="icon">` work |
| Non-extension viewer hint on compare.html | compare.html | Optional future polish; not in Option 1 |
| Bridge ping timeout tuning | compare.html | Watch during testing; tune down from 1000ms if noticeable |

---

## Standing deferred items

| Item | Notes |
|---|---|
| Silent-catch sweep | ~40 `catch(e) {}` patterns remain across search.js, compare.html, background.js. Demo conversion done; full sweep deferred. |
| SUGGESTED COPY review — welcome.html | Flagged blocks, review before CWS push |
| Banner text in search.js | `// <!-- SUGGESTED COPY -->` in `enterReportMode()`, review before CWS push |
| Panel_Redesign_Spec.md | §8.3 and §5.7 stale; separate careful pass |
| Pattern A+B (`(?)` icons + Help drawer) | Pattern_AB_Note.md; future phase |
| "Always hide" semantics | Demotes instead of hides; UX question pending |
| Keyword filter hint verbosity | Deferred, design conversation required |
| Impossible Burger math | Deferred, investigation session required |
| Prime scraping selector change | Deferred |
| Coral vs Amazon orange | Verify #f25d4e doesn't clash with #ff9900 on live page |
| Text-size observation session | No design until observed |
| Per-note X delete button | Deferred from Notes_Design.md §7 |
| Purge existing Supabase rows with notes | One-time data cleanup, Melissa decision |
| Remove dead `?data=` fallback path | compare.html. Not urgent; future maintenance pass. |
| Privacy.html bridge-injection note | Pre-CWS-push polish pass after Option 1 fully tested |

---

*End of roadmap.*
