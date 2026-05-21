# Handover — Chat 98 → Chat 99

*May 21, 2026 · Opus*

*Phase 2 taxonomy complete. New doc `Phase2_Taxonomy.md` groups 15 in-scope catalog collisions into 8 shapes organized by detection signature; Phase 3-prep verification queue established. No code changes. No new design questions surfaced.*

---

## What's done now

`Phase2_Taxonomy.md` exists. Eight shapes (A–H) defined, each with: definition, detection signature, posture(s) and rationale, in-scope catalog entries, Phase 3 implications, open questions.

Shape inventory:

| Shape | Posture(s) | In-scope entries |
|---|---|---|
| A — Spec-rating-as-quantity | Override-suppress | 7 |
| B — Set composition | Override-suppress | 1 |
| C — Container capacity as quantity | Override-recategorize | 1 |
| D — Per-serving / per-use | Defer + Add-pill (category); Override-suppress (handler edge) | 2 |
| E — Consumption-unit equivalence | Defer + Add-pill (collapsed pill) | 1 |
| F — Page-internal interchangeable units | Defer | 1 |
| G — Whole-package $/ct | Override-recategorize; fallback Override-suppress | 1 |
| H — Contested unit needing user judgment | Defer + Note | 1 |

The doc has a cross-shape patterns section flagging the C/G recategorize-or-suppress combinator and the principled posture split in Shape D, an adjacent-not-shapes section carrying the 5 N/A catalog entries forward, and a Phase 3-prep verification queue at the end.

---

## What Chat 99 should do

### Path A — Phase 3-prep verification (recommended)

Run Amazon searches against the highest-priority entries in the verification queue. Two priority targets:

- **Shape A candidates** — confirm spec-rating-as-quantity behavior. Most useful: glove weight class oz, fishing weights/sinkers oz, body weight ranges (kg, lb), screen size variants (wheels, garment length, hardware tool spec).
- **Shape F candidates** — confirm page-internal-interchangeable-units behavior. Most useful: a representative semi-solid personal-care search (deodorant, lotion, sunscreen) and a representative pourable-foods or canned-goods search.

Lower priority for the same session if energy permits: Shape B (set composition real searches), Shape C (container capacity + count titles), Shape E (consumption-unit equivalence in detergent/coffee/pet food).

**Mode is observational and interactive — Melissa drives Amazon, Claude interprets.** Different energy profile from Phase 2 synthesis. Likely shorter session.

**Model recommendation:** Opus for the first verification session; the interpretation calls may be subtle (does this Amazon PPU agree with neighbors? does the category have internal-consistency?). Subsequent verification sessions may downshift to Sonnet once the verification pattern is established.

### Path B — Phase 3 directly

Skip verification, start Phase 3 (detection rules) with what the catalog already provides as VERIFIED.

Risk: Phase 3 detection rules built on too few examples will need rewriting once verification surfaces what the title patterns actually look like at scale. Verification is cheap; rule-rewriting isn't.

Lean against unless Path A really stalls.

### Track 1 alternative — Phase 8B residue

If energy is low for design work: Option 1 test suite (Tests 9–17, cross-tab sync, merge-gap, no-bridge fallback), Test 1 regression, panel purple styling. All Sonnet/Haiku territory once design questions are settled. Standing reminder from Chats 92–97.

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

No code touched in Chats 93–98. Code work resumes when Phase 8B testing or Phase 3 implementation kicks off.

### Design docs

| Doc | Status |
|---|---|
| `Override_Principle.md` | Locked Chat 96. |
| `Servings_Design.md` | Locked Chat 96. |
| `Demotion_Display.md` | Locked Chat 96. |
| `Design_System.md` | Partial, Chat 96. Extend in future design sessions only. |
| `Unit_Catalog_Phase1.md` | Updated Chat 97. Posture tags applied. |
| `Phase2_Taxonomy.md` | **New Chat 98.** |
| `bug-test.md` | Updated Chat 97. Toothpaste verdict reconciled. |
| `Panel_Redesign_Spec.md` | §3 palette canonical. §5.7, §8.3 stale. |

---

## Process notes for Chat 99

- **Memory guards #4–#9 remain in force.** Chat 98 was synthesis work; the cross-doc consistency guards (#4, #5, #6, #7) were exercised when writing `Phase2_Taxonomy.md` and held. Continue applying.
- **Verification work is a different mode.** If Path A is chosen, expect short observational exchanges rather than long synthesis blocks. Resist the urge to over-interpret a single Amazon result — verification confirms or disconfirms hypotheses; it doesn't decide shapes.
- **Phase 3 hold pattern.** Phase 3 is gated on verification queue narrowing per `Phase2_Taxonomy.md` "Phase 3 entry conditions." Don't jump to detection-rule design without at least one verification round.
- **Memory rule #3 (server-deployment commit before testing)** remains active for code work but isn't relevant to design-track sessions.

---

## Known issues to keep in mind (unchanged)

- Compare.html Option 1 test suite incomplete — separate session, Sonnet or Haiku.
- Panel note area purple/indigo styling — separate session.
- Panel textarea closes prematurely (Test 1) — separate session.

---

## GitHub commit message

```
Chat 98: Phase 2 taxonomy — 8 shapes, verification queue established

New doc: Phase2_Taxonomy.md.

Groups the 15 in-scope catalog collisions (8 VERIFIED collision
entries + 7 case-table-covered SPECULATIVE entries) into 8 shapes
organized by detection signature, with posture as a secondary axis.

Shapes:
- A. Spec-rating-as-quantity (7 entries, Override-suppress)
- B. Set composition (1, Override-suppress)
- C. Container capacity as quantity (1, Override-recategorize)
- D. Per-serving / per-use (2, splits Defer+Add-pill / Override-
  suppress by Amazon output)
- E. Consumption-unit equivalence (1, Defer+Add-pill collapsed pill)
- F. Page-internal interchangeable units (1, Defer)
- G. Whole-package $/ct (1, Override-recategorize w/ suppress fallback)
- H. Contested unit needing user judgment (1, Defer+Note)

Cross-shape patterns flagged for Phase 3:
- Recategorize-or-suppress combinator (Shapes C and G)
- Shape D as the only principled posture split
- Detector count estimate: 12-15 across in-scope shapes

Adjacent section captures the 5 N/A catalog entries (parse bugs,
arithmetic bug, formatting issue, detection carve-outs) so Phase 3
doesn't lose them.

Phase 3-prep verification queue at end of doc lists genuinely-
speculative catalog entries grouped by likely shape membership,
plus a "possible new shapes" sub-list and a "detection-risk
entries" sub-list.

Phase 3 entry conditions named: shapes stable; Shape D's split
accepted; verification queue narrowed by at least one round of
Amazon searches.

No code changes. No new design questions surfaced.
```

---

## Push reminder

After committing and pushing:
- Update project knowledge with the new `Phase2_Taxonomy.md`.
- Update project knowledge with the new Briefing (`Project_Briefing_Chat98.md`), Roadmap (`Roadmap_Chat98.md`), Changelog (`changelog_entry_chat98.md`), and Handover (`Handover_Chat98.md`).

---

## A note to Melissa

Phase 2 was lighter than Phase 1.5 in some ways — the inputs were already organized, and `Override_Principle.md` did most of the conceptual lifting. The work was packaging: deciding what counts as one shape vs. two, organizing the doc so detection signature led and posture followed, deciding which speculative entries got a verification queue entry vs. were left out.

The judgment calls worth flagging are in the changelog: Shape A as one shape with seven sub-detectors (rather than seven shapes), and Shape D as one shape with two postures (rather than two shapes). Both could be argued the other way. The shape-vs-detector boundary is a documentation choice; the shape/posture split in D is a real framework property and resisting the urge to "fix" it by splitting was the right call.

The verification queue is the bridge to Phase 3. Done well it converts speculative entries into VERIFIED ones (or removes them), and the resulting catalog tells Phase 3 what detectors to design. Done poorly it produces a long list of "looks plausible" notes that don't sharpen anything. The next session's job is to verify, not to interpret. Resist the temptation to synthesize.

---

*End of handover.*
