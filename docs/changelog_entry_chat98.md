# Changelog — Chat 98

*May 21, 2026*

*Opus session. Phase 2 taxonomy kickoff complete. New doc `Phase2_Taxonomy.md` groups the 15 in-scope catalog collisions (8 VERIFIED + 7 case-table SPECULATIVE) into 8 shapes organized by detection signature, with posture as a secondary axis. Phase 3-prep verification queue established at the end of the doc. No code changes.*

---

## Delivered

### `Phase2_Taxonomy.md` — new doc

Eight shapes covering all 15 in-scope catalog entries:

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

Each shape has: definition, detection signature, posture(s) with rationale, in-scope entries table, Phase 3 implications, and open questions.

### Cross-shape patterns identified

Three patterns flagged for Phase 3:

- **Recategorize-or-suppress combinator** — Shapes C and G both spec a primary recategorize action with fallback suppress. Could share scaffolding in Phase 3.
- **Shape/posture orthogonality** — Shape D is the only shape whose in-scope entries actually exercise two postures. The split is principled (driven by Amazon's output, not by the title).
- **Detector count estimate** — Phase 3 likely needs 12–15 detectors across the in-scope shapes, plus whatever the verification queue adds. Shape A alone has 7 sub-patterns.

### Adjacent — not shapes

The 5 N/A catalog entries (parse bugs, arithmetic bug, formatting issue, detection carve-outs) carried forward in a separate section so Phase 3 doesn't lose them. They live in the same code paths as the collision detectors but aren't collisions themselves.

### Phase 3-prep verification queue

Genuinely-speculative catalog entries grouped by likely shape membership:

- Shape A candidates (glove weight class, fishing weights/sinkers, body weight ranges, kg load capacity, focal length, screen size variants)
- Shape B candidates (puzzle pieces, Lego, dinnerware/luggage/sheet sets)
- Shape C candidates (Mason jar + pack, ml-pipette + count, mug oz + count, water bottle + count)
- Shape D candidates (coffee/pre-workout dosage, jewelry weight)
- Shape E candidates (dishwasher detergent, coffee, pet food, paper goods)
- Shape F candidates (most semi-solid personal care, pourable foods, canned goods, pressurized cans)

Plus a "possible new shapes" sub-list (variable-yield consumables, subscriptions, variable-density solids, concentrates, coverage-spec items, mechanical part names) and a "detection-risk entries" sub-list (`in`, `M`, `yard`, `tablet`, `bar`, `pack` false-match risks).

### Phase 3 entry conditions

Three conditions named: shapes stable, Shape D's split accepted as framework behavior, verification queue narrowed by at least one round of Amazon searches.

---

## Not changed

No code changes. `manifest.json`, `background.js`, `core.js`, `search.js`, `styles.css`, `compare.html`, `privacy.html`, `content/page/compare-bridge.js` — all unchanged.

Locked design docs (`Override_Principle.md`, `Servings_Design.md`, `Demotion_Display.md`, `Design_System.md`) — all unchanged from Chat 96 versions.

`Unit_Catalog_Phase1.md` and `bug-test.md` — unchanged from Chat 97 versions.

`Panel_Redesign_Spec.md` — unchanged (§5.7, §8.3 still stale).

---

## New issues surfaced this session

None. Phase 2 was synthesis work against the Chat 96 framework and the Chat 97 catalog tagging. No new design questions surfaced.

The only judgment calls worth flagging:

- **Shape A as one shape with seven sub-detectors, rather than seven separate shapes.** The seven cases (paper grade, dumbbells, fishing line test, screen size, aquarium L, cross-stitch count, bedding thread count) share a posture and a diagnostic principle but not a detection regex. Grouping them as one shape keeps the taxonomy at the right level of abstraction — shapes name *kinds of intervention*, not specific regex patterns.
- **Shape D treated as one shape with two postures, rather than two shapes.** The detection signature is shared; the posture split is principled and driven by Amazon's output. Splitting into two shapes would have hidden the relationship between the handler-level and category-level work.

---

## What's next

Phase 3-prep verification queue work, or Phase 3 directly if the verification work feels premature. The bridge work between Phase 2 and Phase 3 is described in the new doc's "Phase 3 entry conditions" section.

---

*End of Chat 98 changelog.*
