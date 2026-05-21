# Phase 2 — Collision Taxonomy

*Chat 98 · May 21, 2026 · Opus*

*Groups the verified and case-table-covered collisions from `Unit_Catalog_Phase1.md` by **detection signature** — what the title structurally looks like — with **posture** as a secondary axis. The taxonomy is input to Phase 3 (detection rules), not a spec itself. Builds on the four trust postures established in `Override_Principle.md` and the catalog tagging completed in Phase 1.5 (Chat 97).*

---

## Scope

In scope:

- **8 VERIFIED collision entries** from `Unit_Catalog_Phase1.md` (the 13 VERIFIED entries minus 5 tagged `Posture: N/A` — those are bugs and detection carve-outs, not collisions).
- **7 SPECULATIVE entries** covered by the `Override_Principle.md` case table and carrying `Posture-hypothesis` tags in the catalog.

15 entries total.

Out of scope (deferred to a Phase 3-prep verification queue at the end of this doc):

- Genuinely-speculative entries the case table doesn't cover (mug capacity, glove weight class, syringe ml, body weight ranges, jewelry weight, focal length, etc.).
- The 5 N/A catalog entries (parse bugs, arithmetic bug, formatting issue, detection carve-outs).

---

## How "shape" is defined

A **shape** is a class of title-structures that share enough of a detection signature for one detector (or a small family of detectors) to handle. Two cases share a shape when:

1. They appear in titles with structurally similar surrounding context, AND
2. The diagnostic rule for "this number isn't a buyable quantity" is similar across them.

Shape is orthogonal to posture. A single shape can take more than one posture if the choice depends on whether Amazon got the number right or whether a replacement unit is in the title.

---

## Shape inventory

Eight shapes cover the 15 in-scope entries.

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

The N=1 shapes are not weak. Phase 1 verification has been narrow; the verification queue will populate them.

---

## Shape A — Spec-rating-as-quantity

**Definition.** Title carries a unit-number pair, but the number describes a property of the product (its grade, rating, capacity class, or dimension) rather than how much of it is being sold.

**Detection signature.** A unit token (`lb`, `inch`, `L`, `count`) appears in proximity to a category keyword or noun that marks the number as a rating rather than a quantity:

- `lb` adjacent to paper-grade words (`cover`, `bond`, `text`, `index`, `cardstock`, `bristol`, `vellum`) — existing `isPaperWeightLb()` handles this.
- `lb` adjacent to `test` (fishing line strength).
- `lb` adjacent to dumbbell/kettlebell category context.
- `inch` adjacent to screen-context nouns (TV, monitor, tablet, laptop).
- `L` / `liter` adjacent to tank/aquarium context.
- `count` adjacent to fabric mesh terms (Aida, linen, Zweigart, evenweave) or `thread count` collocation.

Each sub-pattern needs its own detector in Phase 3; they share a shape because they all want the same action.

**Posture.** Override-suppress.

The diagnostic: no useful replacement unit lives in the title. A 14-count Aida cloth has no buyable-piece-count in the title. A 55-inch TV has no other quantity to fall back to. A 10-lb dumbbell isn't sold by weight in any comparison-meaningful way.

**In-scope entries:**

| Entry | Catalog tag | Detection sub-pattern |
|---|---|---|
| Paper grade lb ("65 lb cover") | VERIFIED | lb + paper-grade word |
| Dumbbells/kettlebells lb ("10 lb dumbbell") | VERIFIED | lb + equipment context |
| Fishing line "20 lb test braided" | SPECULATIVE | lb + `test` |
| Screen size "55 inch TV" | SPECULATIVE | inch + screen-noun |
| Aquarium "20 L tank" | SPECULATIVE | L + tank-noun |
| Cross-stitch "14 count Aida" | SPECULATIVE | count + fabric-mesh term |
| Bedding "400 thread count" | SPECULATIVE | `thread count` collocation |

**Phase 3 implications.** One posture, multiple detectors. The shape's value is naming the kind of intervention; the detectors are independent design problems. Some (paper grade) are already implemented; others (fishing line, screen size) need new keyword lists and proximity rules.

**Open question.** How wide should each detector's keyword list be? Erring narrow risks misses; erring wide risks false suppressions. Phase 3 work.

---

## Shape B — Set composition

**Definition.** Title says "N piece set" (or "N-piece set," "N pcs set"), where N is the number of components in the set and the buyable unit is the set itself.

**Detection signature.** `\b\d+\s*(?:piece|pieces|pcs|pc)[\s-]+(?:set|setting|collection)\b` or close variant. The "set"/"setting"/"collection" anchor is what distinguishes set composition from genuine piece-counted buyables.

**Posture.** Override-suppress.

$/piece for a 10-piece cookware set is misleading (the pieces aren't independently meaningful as a unit). $/set is trivially the listing price — recategorizing would add no signal. Suppress.

**In-scope entries:**

| Entry | Catalog tag |
|---|---|
| Cookware "10 piece pots and pans set" | SPECULATIVE |

**Phase 3 implications.** Detection is a relatively clean lexical pattern. The harder question is reach: should the same shape catch "7-piece luggage set," "1000-piece jigsaw puzzle," "500-piece Lego"? Probably yes for luggage and dinnerware (same shape); puzzles and Lego are a judgment call (the piece count is a *spec* of the product but users may still meaningfully compare $/piece across similar-sized puzzles). Phase 3 verification work.

**Open question.** Does the detector use a fixed list of set-nouns (cookware, dinnerware, luggage, knife block) or a generic "N piece(s) + set/collection/setting" pattern? Lean: generic pattern with optional category-noun confirmation.

---

## Shape C — Container capacity as quantity

**Definition.** Title contains a volume unit that describes the container's *capacity*, paired with a *separate* count that describes how many containers are being sold. Amazon's PPU divided by the capacity number; the meaningful divisor is the container count.

**Detection signature.** Two-number title. Volume-family unit + container-noun (`bag`, `bottle`, `jar`, `pitcher`) + separate count elsewhere in the title.

**Posture.** Override-recategorize.

The replacement unit is in the title. Recategorize to $/container ($/bag, $/bottle).

**In-scope entries:**

| Entry | Catalog tag |
|---|---|
| Trash bag "13 gallon, 80 count" | SPECULATIVE |

**Phase 3 implications.** Detection has two parts: (a) recognize that the volume number is capacity-of-container, not buyable volume; (b) extract the container count for the replacement. Part (a) overlaps with Shape A in spirit — both flag a number as a spec — but the action differs (recategorize vs. suppress) because part (b) succeeds here.

**Open question.** When does the same title structure produce no replacement count? Example: "13 gallon trash can" (singular, no count). Lean: detection fires on the capacity recognition; if no count is found, fall back to Override-suppress. This is the same fallback pattern as Shape G.

**Cross-shape note.** "Capacity-of-container without separate count" is structurally Shape A. The split between A and C depends entirely on whether the buyable count is in the title.

---

## Shape D — Per-serving / per-use

**Definition.** Title carries a unit-number pair that describes a per-serving or per-dose amount, not a per-package amount. This is the shape where Amazon's PPU is most often *correct* (it scraped the package weight separately) but where the title's serving data also enables a more useful pill.

**Detection signature.** "Per serving" keyword OR category context (supplements, coffee, pet food, drink mix) combined with serving-count regex (`\d+\s*servings?`, `\d+\s*meals?`, `makes \d+ cups?`).

**Posture — splits by what Amazon did.**

- **Defer + Add-pill (category-level).** When Amazon has a valid product weight, $/g (or $/oz, $/lb) is meaningful and defers. The title supports an additional $/serving pill. Add-pill plurality applies for multi-packs: $/tub + $/serving both surfaced. Canonical case: `Servings_Design.md`.
- **Override-suppress (handler edge).** When Amazon scraped a per-serving gram value *as if it were product weight* (the case `isServingWeight()` defends against), AU suppresses the bogus $/g. If serving data is also in the title, the $/serving add-pill stacks on top of the suppression and becomes the only pill.

Same detection signature, two postures, choice depends on Amazon's output. This is the cleanest case in the taxonomy of a shape that doesn't reduce to one posture.

**In-scope entries:**

| Entry | Catalog tag | Posture path |
|---|---|---|
| Per-serving supplement g (handler) | VERIFIED | Override-suppress |
| Per-serving more broadly (category) | VERIFIED | Defer + Add-pill |

**Phase 3 implications.** Two code paths, one detection family. The add-pill code path is the main work (extract serving count from title, render the pill). The handler code path already exists (`isServingWeight`) and stays as-is per `Servings_Design.md`.

**Open question.** Title patterns beyond `\d+\s*servings?` — `30-day supply`, `makes 60 cups`, `approximately 30 meals` — vary by category. Phase 3 needs a per-category recognition list.

---

## Shape E — Consumption-unit equivalence

**Definition.** A search page contains listings whose title units differ as *physical forms* but describe the *same underlying consumption unit*. Detergent example: sheet, pod, tab, pac, fling, strip, load — all map to one "per wash." The user is sorting on cost-per-wash, not cost-per-physical-form.

**Detection signature.** Page-level pattern, not per-listing. Multiple title units within one search collapse to a single sort key. Currently implemented in search.js as the existing "per item" pill, which uses each listing's per-count value as the sort key regardless of its title's specific count unit.

**Posture.** Defer + Add-pill, with the add-pill being a *single collapsed* pill across the equivalence class — not one pill per physical form.

**In-scope entries:**

| Entry | Catalog tag |
|---|---|
| Solid-product override gap (sheets/pods/etc. showing $/lb instead of $/load) | VERIFIED |

**Phase 3 implications.** Two-level design: (1) define the equivalence classes (laundry → wash; dishwasher → wash; coffee → cup; pet food → meal); (2) implement the collapse so different title units sort under one pill. The "per item" pill in search.js is the existing precedent; Phase 3 generalizes.

**Open questions.**

- How are equivalence classes recognized? Category keyword on the search query? Per-listing category inference? Lean: query-level category inference is the cleanest hook, but Phase 3 may need both.
- Does each listing display its own physical-form unit on the card while sorting under the collapsed pill? Probably yes (matches the existing "per item" pill behavior). `Demotion_Display.md` handles the display layer.

**Distinction from Shape D.** Per-serving (D) adds a pill that didn't previously exist. Consumption-unit equivalence (E) collapses several existing pills into one for sorting purposes. The shapes look similar (both about cost-per-use) but the mechanism differs.

---

## Shape F — Page-internal interchangeable units

**Definition.** Amazon's reported PPU uses a unit that is technically imprecise (e.g. fl oz for a semi-solid weighed product) but every product on the search page uses the same convention, so comparison still works. The fix would be worse than the problem.

**Detection signature.** Category-keyword-based. Hard to detect from a single title without category context.

**Posture.** Defer.

Test for fit (from `Override_Principle.md`): would a user comparing products on this page get a useful answer from Amazon's PPU? For toothpaste, yes — every product reports fl oz and the densities are close enough.

**In-scope entries:**

| Entry | Catalog tag |
|---|---|
| Toothpaste (oz/fl oz) | VERIFIED |

**Phase 3 implications.** Defer is the base case — strictly speaking it needs no detection, since defer is what happens when no other posture fires. But Phase 3 may want explicit category lists for two reasons: (a) to suppress *other* detectors that would misfire on this category, (b) to mark categories as "verified defer" so future ambiguity-note work doesn't flag them spuriously.

**Open question.** Which other categories behave like toothpaste? `Override_Principle.md` lists likely candidates (semi-solid personal care, pourable foods, canned goods, pressurized cans) but flags them as needing verification. This is the bulk of the SPECULATIVE-remainder verification work for Phase 3 prep.

---

## Shape G — Whole-package $/ct

**Definition.** Amazon reports a per-ct value where `ct` refers to the entire package (1 ct = whole package), not the buyable component count. Detected by Amazon's PPU agreeing suspiciously closely with the listing price.

**Detection signature.** This is a check on Amazon's *output*, not on the title's structure. Compare Amazon-supplied $/ct to listing price; if they agree (or differ only by small Amazon rounding), the $/ct is suspect.

**Posture.** Override-recategorize when the title carries a component count; fallback to Override-suppress when it doesn't.

**In-scope entries:**

| Entry | Catalog tag |
|---|---|
| Whole-package $/ct | VERIFIED |

**Phase 3 implications.** Unusual detection mechanism — looks at the *result* AU receives from Amazon and flags a self-consistency check rather than parsing the title alone. May want a tolerance threshold (within 1% of price → suspect).

**Open question.** False-positive risk on actual 1-ct items (genuinely a 1-pack of something where $/ct = price legitimately). Phase 3 needs a guard: only fire when the title carries a count > 1 elsewhere, or when the title carries a count-suggesting word (`bottles`, `tablets`, `wipes`).

**Cross-shape note.** Same recategorize-or-fallback-to-suppress structure as Shape C. The two could share scaffolding in Phase 3 even though the detection mechanisms differ.

---

## Shape H — Contested unit needing user judgment

**Definition.** Title contains a unit whose meaning depends on how the rest of the page is priced — AU can't unilaterally decide. The classic case: "pair" titles, where Amazon may report $/pair or $/item and other listings on the page may use either convention.

**Detection signature.** Keyword pattern (`pair`, `pairs`). `applyPairsNote()` currently uses `\bpairs?\b` — too broad (catches "pair of" descriptive phrases). Phase 4 redesigns the detection.

**Posture.** Defer + Note.

AU keeps Amazon's PPU and surfaces an ambiguity note. Note posture is the right call when the unit is contested but AU lacks the data to decide for the user.

**In-scope entries:**

| Entry | Catalog tag |
|---|---|
| Pair $/pair vs $/item | VERIFIED |

**Phase 3 implications.** The detection and copy redesign is `Phase 4` scope (see `Unit_Catalog_Phase1.md` last section), not Phase 3. Phase 3 may still need a generic Note rendering primitive that Phase 4 then applies — this is the shape that Phase 4 builds the unified ambiguity-note pattern around.

**Open question.** Are there other Note-posture cases not yet identified? `Override_Principle.md` flags variety-pack as a possible candidate (mixed-flavor matters to some users but not others — defer + note). Verification work.

---

## Cross-shape patterns

A few observations worth carrying into Phase 3.

**The recategorize-or-suppress pattern.** Shapes C and G both have a primary action (recategorize using a replacement unit from the title) with a fallback (suppress when no replacement is available). Phase 3 may want to factor this as a shared scaffolding: a "try recategorize, else suppress" combinator parameterized by detection and extraction logic.

**The shape/posture orthogonality.** Shape D is the only shape whose in-scope entries actually exercise two different postures — the split there is principled (driven by Amazon's output, not by the title). Shapes C and G both *spec* a fallback posture (suppress) but no in-scope entry exercises it. All other shapes take exactly one posture. This pattern may not hold once the verification queue populates — Shape A in particular might split if some sub-patterns turn out to have replacement units in the title.

**Phase 3 detector count.** Eight shapes; many more than eight detectors. Shape A alone has seven sub-patterns each needing their own keyword list and proximity rules. A rough estimate: Phase 3 designs ~12-15 detectors across the in-scope shapes, plus whatever the verification queue adds.

---

## Adjacent — not shapes

These are the 5 N/A entries from the catalog, flagged here so Phase 3 doesn't lose track. They live in the same code paths as the collision detectors but are bugs or carve-outs, not collisions.

| Entry | Nature | Notes |
|---|---|---|
| Stray paren fl oz "Vista Clean 12 fl oz (12)" | Parse bug | `(12)` scraped as volume. Extraction fix, not a collision. |
| Pack/item ct "500 per Pack - 2 Pack → 2 ct" | Arithmetic bug | Multiplication failure. Should be 1000 ct. |
| Sub-penny PPU on cotton swabs/pills | Formatting | $0.001/ct displays as $0.00/ct. Not a collision. |
| `extractCount` min-5ft guard | Detection carve-out | Existing guard rejecting "Nft"/"N feet" < 5 from acting as count. |
| `'in'` preposition risk | Detection risk | Literal `'in'` in LENGTH_UNITS could match prepositions. |

These need Phase 3 attention (the extraction layer needs hardening alongside the collision-detector layer) but aren't part of the taxonomy.

---

## Phase 3-prep verification queue

The catalog's SPECULATIVE entries not covered by the `Override_Principle.md` case table need verification searches before they can be assigned to shapes. Listed in rough priority order — entries likely to populate existing shapes first, then entries that might surface new shapes.

**Likely to populate existing shapes:**

- **Shape A candidates** (spec-rating-as-quantity): glove weight class oz, fishing weights/sinkers oz, body weight ranges (kg, lb), kg load capacity, empty product weight kg, focal length mm, screen size variants (wheels, garment length, hardware tool spec).
- **Shape B candidates** (set composition): puzzle pieces, Lego pieces, dinnerware set, luggage set, sheet set, bed sheet set.
- **Shape C candidates** (container capacity + count): empty Mason jar capacity + pack count, ml-pipette capacity + count, cosmetics jar ml + pack count, mug oz capacity + count, water bottle oz + count.
- **Shape D candidates** (per-serving / per-use): coffee dosage g, pre-workout dosage g, jewelry weight g (different sub-case).
- **Shape E candidates** (consumption-unit equivalence): dishwasher detergent (pods/tablets/gel), coffee (pods/K-cups/ground), pet food (kibble cups/wet cans/meal estimates), paper goods (sheets/rolls/mega-rolls).
- **Shape F candidates** (page-internal interchangeable units): most semi-solid personal care, pourable foods, semi-solid foods, canned goods, pressurized cans.

**Possible new shapes (no clear existing fit):**

- **Variable-yield consumables** ("30 day supply" of skincare). Catalog flags as "PPU itself doesn't apply." Could be a new shape (Override-suppress with a different rationale) or could fold into Shape A.
- **Subscription / service products.** Same question.
- **Variable-density solids** (coffee grounds vs. whole bean). May fold into Shape F.
- **Concentrates** ("makes 50 cups" vs "makes 200 cups" laundry detergent). Could be Shape E variant or could need its own shape.
- **Coverage-spec items** ("covers 200 sq ft"). Two units in one title (paint gallon + sq ft coverage). Shape C-adjacent but coverage isn't typically the buyable.
- **Mechanical part names** (sewing machine feet, brake pads, bike tubes). Words that look like units but name the product. May need a shape of its own — the action is similar to A (suppress) but the detection signature is different (the "unit" word *is* the product noun).

**Detection-risk entries (not shapes, but Phase 3 needs them):**

- "in" preposition false matches.
- "M" as size letter (size M shirt).
- "yard" as outdoor space (yard hose, yard tools).
- "tablet" as device (10 inch tablet).
- "bar" as equipment (resistance bar).
- "pack" as backpack noun.

---

## Phase 3 entry conditions

Phase 3 is ready to start when:

1. The 8 shapes here are stable (no major regrouping pending).
2. Shape D's two-posture split is treated as the framework's intended behavior, not a problem.
3. The verification queue has been narrowed by at least one round of Amazon searches against the highest-priority Shape A and Shape F candidates.

Item 3 is the bridge from Phase 2 to Phase 3. A single verification session probably suffices.

---

*End of Phase 2 taxonomy. Working document — shapes may merge, split, or gain members as verification surfaces new VERIFIED entries.*
