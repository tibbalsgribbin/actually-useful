# Handover — Chat 99 → Chat 100

*May 21, 2026 · Opus*

*Phase 3-prep verification round 1 complete. Two Shape A speculative entries verified via live Amazon searches; both disconfirmed the predicted Override-suppress failure mode and surfaced two new "non-failure outcome patterns" (N1, N2). `Unit_Catalog_Phase1.md` and `Phase2_Taxonomy.md` updated. No code changes. No new design questions surfaced — but a doc-status question about N1/N2 is sitting in the open-questions table.*

---

## What's done now

Two Amazon search verifications run against the Shape A speculative entries from `Phase2_Taxonomy.md`'s Phase 3-prep verification queue. AU extension off; scraped via Melissa's existing extension.

| Search | Entry verified | Result |
|---|---|---|
| `fishing sinkers` (60 listings) | Sinkers oz | Amazon omits PPU on all listings. Predicted $/oz collision did not occur. Pattern N1. |
| `braided fishing line` (~57 listings) | Fishing line lb test | Amazon computes $/foot from spool length, ignoring lb test rating. Predicted $/lb collision did not occur. Pattern N2. |

Two-for-two on "predicted Override-suppress failure mode absent."

**Doc updates:**

- `Unit_Catalog_Phase1.md` — verification notes added to the `oz` "Fishing weights/sinkers" entry and the `lb` "Fishing line test strength" entry. Status remains SPECULATIVE.
- `Phase2_Taxonomy.md` — Shape A section gains a "Verification findings" subsection. Cross-shape patterns gains a "Non-failure outcome patterns (N1, N2)" working note. Verification queue Shape A line updated to mark the two entries as done.

No new docs created.

---

## What Chat 100 should do

### Path A — Phase 3-prep verification round 2 (recommended)

Two follow-ups in one session if energy permits:

**1. One more Shape A subtype (different category).** Confirm whether N1/N2 patterns extend beyond the fishing category, or whether fishing was just a quirky pair.

- **Best candidate: boxing gloves oz.** Different mechanic (gloves come in standard sizes, often a single oz weight class displayed per listing). If Amazon also omits PPU or recategorizes, that's three-for-three and N1/N2 may warrant promotion.
- **Backup: weighted vest lb.** Close to the VERIFIED dumbbell collision, which is interesting because dumbbells DO get $/lb. If weighted vests also get $/lb, that suggests "weight class as buyable" varies by category in ways the verification queue should track.

**2. First Shape F verification.** Confirm page-internal-interchangeable-units behavior.

- **Best candidates: deodorant or lotion.** Semi-solid personal care, the canonical Shape F prediction. The right question is "do all listings on the page use the same convention (fl oz, oz) so $/oz comparison still works even though it's technically imprecise?"

**Mode:** observational and interactive, same as Chat 99. Melissa drives Amazon; Claude interprets.

**Model recommendation:** Opus for the third Shape A verification (still interpretive — boxing gloves outcome may surface a new pattern not anticipated by N1/N2). Sonnet may suffice for Shape F if the interpretation feels mechanical by then.

**Energy budget:** Chat 99 ran ~four substantive interpretive exchanges. Round 2 may be similar if both verifications happen in one session, or shorter if just one.

### Path B — Promote N1/N2 to formal catalog status

If the round 2 verification surfaces N1 or N2 a third time, consider:

- Adding "VERIFIED non-collision (N1)" and "VERIFIED non-collision (N2)" as catalog status tags separate from VERIFIED (collision exists) and SPECULATIVE.
- Migrating the sinkers and fishing line catalog entries to one of these new statuses.
- Updating the verification queue presentation in `Phase2_Taxonomy.md` to track collisions vs. non-collisions explicitly.

This is a doc-design decision, not a framework decision. Hold for after round 2.

### Path C — Phase 3 directly

Skip further verification, start Phase 3 (detection rules).

Risk: round 1 actually showed that Phase 3 detector design needs to recognize that some Shape A sub-patterns won't need detectors at all. Without Shape F verification, Phase 3 detectors for defer-category listings may misfire.

Lean against unless Path A really stalls. Chat 99 sharpened the inputs but didn't complete them.

### Track 1 alternative — Phase 8B residue

Standing reminder from Chats 92–99. Sonnet/Haiku territory once design questions are settled. Pick this if design-track energy is low.

---

## State of the project

| File | Version | Status |
|---|---|---|
| `manifest.json` | v0.6.2 | Unchanged since Chat 92 |
| `background.js` | v0.6.1.19 | Unchanged |
| `core.js` | v0.6.1.54 | Unchanged |
| `search.js` | v0.6.2.1 | Unchanged. `isServingWeight()` verified Chat 96. |
| `compare.html` | compare-v1.1.0 | Unchanged |
| `content/page/compare-bridge.js` | bridge-v1.0.0 | Unchanged |

No code touched in Chats 93–99.

### Design docs

| Doc | Status |
|---|---|
| `Override_Principle.md` | Locked Chat 96. |
| `Servings_Design.md` | Locked Chat 96. |
| `Demotion_Display.md` | Locked Chat 96. |
| `Design_System.md` | Partial, Chat 96. Extend in dedicated design sessions only. |
| `Unit_Catalog_Phase1.md` | **Updated Chat 99** (verification notes on two entries). |
| `Phase2_Taxonomy.md` | **Updated Chat 99** (Shape A verification findings; Cross-shape N1/N2 note; queue updated). |
| `bug-test.md` | Updated Chat 97. Toothpaste verdict reconciled. |
| `Panel_Redesign_Spec.md` | §3 palette canonical. §5.7, §8.3 stale. |

---

## Process notes for Chat 100

- **Verification mode persists.** Chat 99 established a working pattern: scrape → interpret → catalog/taxonomy note → stop when enough signal accumulates. Chat 100 should follow the same rhythm. Resist the urge to synthesize from a single result.
- **N1/N2 are working notes, not framework.** The promotion question (Path B above) waits for more data. Don't promote them in `Override_Principle.md` or anywhere else without round 2 confirmation.
- **Memory guard #18 (Chat 99): partner with Melissa on decisions, don't make them for her.** When offering choices, lay out the options in plain language, recommend one, explain why. Then wait for her call. She may ask for more information, override, or defer — all three are normal. Don't decide on her behalf even on questions that feel outside her expertise. The goal is informed partnership.
- **Memory guard #19 (Chat 99): single-search results yield verification notes, not status changes.** SPECULATIVE → VERIFIED requires confirmation across reasonable variation, not one search. Verification notes capture the finding without overstating its strength.
- **Memory guards #4–#9 remain in force.** Chat 99 exercised #4 (cross-doc consistency between catalog and taxonomy) and #5 (announced doc names before writing). Continue.
- **Phase 3 hold pattern.** Phase 3 is still gated on verification narrowing. Chat 99 made progress but didn't complete round 1 (Shape F not verified). At minimum, one Shape F verification needs to happen before Phase 3 starts.

---

## Known issues to keep in mind (unchanged)

- Compare.html Option 1 test suite incomplete — separate session, Sonnet or Haiku.
- Panel note area purple/indigo styling — separate session.
- Panel textarea closes prematurely (Test 1) — separate session.

---

## GitHub commit message

```
Chat 99: Phase 3-prep verification round 1 — Shape A 2x disconfirmed

Two Shape A speculative entries verified against live Amazon searches.
Both disconfirmed the predicted Override-suppress failure mode and
surfaced two new "non-failure outcome patterns."

Verifications:
- Fishing sinkers (oz spec): 60 listings, Amazon omits PPU. Pattern N1.
- Fishing line (lb test spec): ~57 listings, Amazon computes $/foot
  from spool length, not $/lb. Pattern N2.

Updates to Unit_Catalog_Phase1.md:
- oz "Fishing weights/sinkers" entry: verification note added.
- lb "Fishing line test strength" entry: verification note added.
- Both stay SPECULATIVE pending broader confirmation per the rule
  that VERIFIED requires confirmation across reasonable variation.

Updates to Phase2_Taxonomy.md:
- Shape A section: new "Verification findings" subsection summarizing
  the 2/2 disconfirmation result and pointing to the N1/N2 note.
- Cross-shape patterns: new "Non-failure outcome patterns" note
  describing N1 (Amazon omits PPU) and N2 (Amazon recategorizes from
  title) as outcome classes the verification queue may keep surfacing.
  Working note, not framework-level.
- Phase 3-prep verification queue: Shape A line updated to mark
  sinkers and fishing line as verified, with N1/N2 annotation.

Implication for Phase 3: detector design should not assume "speculative
Shape A entry = needs detector." Some sub-patterns won't need detectors
because Amazon already handles them. The verification queue's job is
partly to distinguish "needs a detector" from "Amazon already handles
it" — a distinction the original taxonomy did not anticipate.

VERIFIED Shape A entries (paper grade lb, dumbbells lb) unaffected.

No code changes.
```

---

## Push reminder

After committing and pushing:
- Update project knowledge with the updated `Unit_Catalog_Phase1.md` and `Phase2_Taxonomy.md`.
- Update project knowledge with the new Briefing (`Project_Briefing_Chat99.md`), Roadmap (`Roadmap_Chat99.md`), Changelog (`changelog_entry_chat99.md`), and Handover (`Handover_Chat99.md`).

---

## A note to Melissa

This session pivoted faster than expected. The plan was to verify several Shape A entries; after two, the pattern was clear enough — and surprising enough — that continuing would have produced more confusion than clarity. Stopping at two and integrating the findings was the better call.

The interesting result isn't that Shape A was "wrong" — the VERIFIED Shape A entries (paper grade, dumbbells) remain real collisions. It's that the speculative Shape A list may be systematically over-broad. Some of those speculative entries are categories where Amazon has already chosen to either omit PPU or pick a different meaningful unit, which means no detector work is needed for them at all. The verification queue is doing useful work by surfacing that distinction.

N1 and N2 are working notes for now. Two data points are enough to name them but not enough to formalize them. If round 2 verification surfaces the same patterns again, that's the point to promote them — probably to formal catalog status tags. Until then, they live in the taxonomy's cross-shape section, where they're easy to find and easy to amend.

Two process changes adopted mid-session worth keeping:

1. **Recommendations with justifications** when offering choices. Not just "here are the options."
2. **Partner on decisions, don't delegate them.** Lay out options in plain language, recommend one with reasoning, then wait. Even on questions that feel outside Melissa's expertise, she wants to be involved — not have decisions made on her behalf.

Both are now in the briefing as memory guard #18.

---

*End of handover.*
