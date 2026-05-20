# Handover — Chat 93 → Chat 94

*May 20, 2026*

*Opus analysis + design session. No code touched. Two deliverables: a process-and-model retrospective on Chat 92, and Phase 1 of the unit-collision design work (the Unit Catalog).*

---

## What happened this session

**Process retrospective on Chat 92.** Read the full transcript and the handover. Identified the deployment-gap problem (compare.html had to be live on actuallyuseful.net before testing, which wasn't communicated to Melissa before tests were given) and the debugging-pattern problem (Sonnet theorized about why the bridge wasn't responding instead of doing the simplest diagnostic first). Memory rule #3 was added at the end of Chat 92 to cover the deployment case. Established that Opus should suggest the right model at session-start going forward.

**Model guidance.** Discussed when Haiku is appropriate (mechanical execution, lookups, test running, single-file CSS fixes) vs. Sonnet (implementation with unknowns) vs. Opus (design, synthesis across files, decisions where the right answer isn't yet known). Rule of thumb captured: Haiku is for "I know what needs to happen, I just need someone to do it"; Sonnet for "I know what we're building, but the implementation has unknowns"; Opus for "I don't know yet what the right answer is."

**Phase 1 of the unit-collision design.** Catalogued every unit-word in `LIQUID_UNITS`, `WEIGHT_UNITS`, `CONTAINER_UNITS`, `LENGTH_UNITS`, `ITEM_UNITS`, plus tokens inside `guessCountUnit()` and `extractCount()`. For each: PPU meaning and known/suspected collision cases. Each collision tagged VERIFIED (from code, bug-test.md, or Melissa's session input) or SPECULATIVE (Opus-proposed, needs search confirmation). Documented the four existing collision-handling patterns in code (`isPaperWeightLb`, `isMultiPackWeight`, `isServingWeight`, `applyPairsNote`) so Phase 3 doesn't reinvent them.

**Yarn surfaced as a real gap.** Melissa's screenshot of the unit pills for "yarn" showed `oz / lb / g / kg / per item / As listed` — no yardage. Yarn is the canonical case where weight is a misleading proxy and length is what users actually need. Filed as a panel-presentation gap (the length unit exists in code, just isn't offered as a pill in weight-dominant searches).

**Pairs note flagged for redesign.** Reviewed `applyPairsNote()` and identified five problems (detection too broad, condition logic suspect, copy uses internal vocabulary, display weight too heavy, pattern needs to generalize). Filed as Phase 4 scope rather than addressing in Phase 1.

---

## Files state

| File | Version | Status |
|---|---|---|
| `manifest.json` | v0.6.2 | Unchanged |
| `background.js` | v0.6.1.19 | Unchanged |
| `core.js` | v0.6.1.54 | Unchanged |
| `search.js` | v0.6.2.1 | Unchanged |
| `compare.html` | compare-v1.1.0 | Unchanged |
| `content/page/compare-bridge.js` | bridge-v1.0.0 | Unchanged |
| `Unit_Catalog_Phase1.md` | new | New project doc (Chat 93) |
| `Handover_Chat93.md` | new | New project doc (Chat 93) |

No code changed. Only project documents.

---

## What Melissa is doing between sessions

**Verification searches** against the SPECULATIVE collisions listed in `Unit_Catalog_Phase1.md`. Priority cases to confirm or refute:

- "14 count Aida cloth" / "18 count linen" / "cross stitch fabric" — fabric mesh density collision (original motivation for this session)
- "sewing machine feet" / "sewing machine foot" — mechanical part name collision
- "yarn" (already partially surfaced from the screenshot) — confirm the length-unit gap and any other yarn-specific issues
- "400 thread count sheets" / "1000 count sheets" — bedding thread count collision
- "dumbbells" / "kettlebells" — equipment spec posing as weight
- "55 inch TV" / "27 inch monitor" — screen size posing as length
- "10 piece pots and pans set" / "7 piece cookware" — set composition vs. items
- "1000 piece puzzle" — same family as above
- "13 gallon trash bags" — capacity-vs-quantity in container units
- "10 gallon aquarium" / "5 gallon bucket" — gallon capacity collision
- "drill bit set" / "screws" / "sandpaper" — tool category collision

She does not need to log results in bug-test.md format. Sharing search URLs, screenshots, or scraped CSVs is fine.

---

## What to do next session

### Priority 1: Fold Melissa's verification results into the catalog

Promote SPECULATIVE entries to VERIFIED where confirmed. Remove SPECULATIVE entries shown to be non-issues. Add new VERIFIED entries from any collisions her searches surface that weren't anticipated. The catalog is explicitly a working document — expect change.

### Priority 2: Decide whether to continue Phase 1 (C and A) or move to Phase 2

After B (targeted searches) is folded in, Melissa's stated preference is to do C (review usage log for collision patterns in real user searches) and then A (work through remaining bug-test.md categories) before declaring Phase 1 complete. Confirm at session start that this is still the plan.

### Priority 3: Move to Phase 2 — collision taxonomy

Group verified collisions into shared shapes. Initial candidate shapes proposed in the catalog:
- Spec rating (paper weight, lens strength, fishing line test, dumbbells, etc.)
- Capacity (empty container vs. contents)
- Per-unit density (mesh count, thread count, grit)
- Mechanical part name (sewing feet, etc.)
- Per-serving (already handled for grams in supplements)
- Component-in-set (puzzles, cookware sets)
- Pair ambiguity (already handled with caveats)
- Stray number in parens (contact lens bug)

Each shape gets a name and a detection signature. Phase 2 is the bridge between cataloging cases and writing rules.

### Priority 4 (do NOT skip ahead to): Phase 3 design rules and Phase 4 ambiguity-note redesign

Phase 3 produces the spec Sonnet implements against. Phase 4 redesigns the pairs note and establishes the pattern for all future ambiguity notes (detection, copy, display in panel and compare). Both are downstream of Phase 2.

---

## Process notes for Chat 94

- **At session start, suggest the appropriate model for the work on deck.** This was established as a standing expectation in Chat 93. Examples: testing → Haiku or Sonnet, single-file CSS bug → Sonnet, design work like Phase 2/3 → Opus.

- **When offering Melissa options, mark the recommendation and explain why.** This was raised by Melissa in Chat 93. Default behavior going forward.

- **Memory rule #3 (server-deployment commit before testing) is active.** Any test that requires a file to be live on actuallyuseful.net needs commit-and-push instructions and a commit message *before* the test instructions.

- **Pairs note redesign is Phase 4, not now.** Five problems documented in the catalog. Don't get distracted by it during Phase 2/3 work.

---

## Known issues to keep in mind (unchanged from Chat 92 handover)

- Compare.html Option 1 test suite incomplete — filter/sort/column/cross-tab/merge-gap/no-bridge tests still pending. This is separate from the unit-collision design work and should be picked up in a different session (Sonnet or Haiku territory).
- Panel note area purple/indigo styling — Chat 92 issue, separate session.
- Panel textarea closes prematurely (Test 1) — Chat 92 issue, separate session.

---

## GitHub commit message

```
Add Unit Catalog Phase 1 and Chat 93 handover

Project docs only, no code changes.

- Unit_Catalog_Phase1.md: catalogs every unit-word AU recognizes
  plus collision cases (verified and speculative)
- Handover_Chat93.md: session-end notes and next-session plan
```

Push reminder: after the commit, update the project documents in Claude so the next session sees the new catalog and handover.

---

*End of handover.*
