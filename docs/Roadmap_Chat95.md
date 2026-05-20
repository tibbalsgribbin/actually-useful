# Roadmap — Chat 95

*Updated end of Chat 95. Audit of Chat 94 design docs complete; finding #9 resolved; six process guards committed to memory. No code changes. The Roadmap now explicitly tracks two parallel work streams: Phase 8B residue (the existing content) and the unit-collision design track (new section).*

*May 20, 2026*

---

## Active work streams

This project is currently running two parallel tracks:

1. **Phase 8B residue** — Option 1 test suite completion, Share Redesign, panel styling cleanup, Test 1 regression. Sonnet/Haiku territory once design questions are settled.
2. **Unit-collision design** — Phase 1 catalog (done Chat 93), trust posture framework (in progress Chat 94→95→96), Phase 2 taxonomy, Phase 3 detection rules, Phase 4 ambiguity-note redesign. Opus design work; eventual Sonnet implementation.

The two tracks don't block each other. Sessions pick the track based on what's queued and what energy is available.

---

## Immediate — next session (Chat 96)

**Track: unit-collision design. Doc consolidation pass.**

Action plan from `Handover_Chat95.md`:

- [ ] `Trust_Postures.md` → discard. Salvage the "How to choose" decision tree into Override_Principle.
- [ ] `Override_Principle.md` → edit. Add the decision tree, pin the resolved recategorize-vs-add-pill distinction, update the case table (cookware → suppress, add bundle + variety pack), generalize add-pill to plural, standardize on "add-pill" with hyphen.
- [ ] `Servings_Design.md` → edit. Remove "add-pill + override-recategorize" framing (supplements is just add-pill). Verify `isServingWeight()` claim against actual code. Note the add-pill plurality pattern.
- [ ] `Demotion_Display.md` → edit. Remove "exactly one tier" claim. Reverse the demote trigger (demote listings that can't supply the currently-sorted unit). Reconcile the supplement worked example.
- [ ] Optional after consolidation: apply posture tags to `Unit_Catalog_Phase1.md` (Phase 1.5 cleanup). Could be folded into Chat 96 or deferred to Chat 97 based on energy.

After Chat 96, deferred Phase 2 (taxonomy) and Phase 3 (detection rules) work resumes on the design track.

---

## Phase 8B residue — gated on energy/availability

Carried forward from Chat 92 Roadmap; not touched in Chats 93–95 (design-track sessions).

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
| Phase 1.5 — Catalog cleanup | Pending | Cross-family shape tagging, posture tags, hypothesis-vs-observation split. May fold into Chat 96 or be a separate session. |
| Phase 2 — Taxonomy | Not started | Group verified collisions by shape. |
| Phase 3 — Detection rules | Not started | Detection-and-action specs per shape. |
| Phase 4 — Ambiguity-note redesign | Not started | `applyPairsNote` rework. |
| Trust posture framework | Pending consolidation (Chat 96) | Four design docs from Chat 94; consolidation deferred to Chat 96. |

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
