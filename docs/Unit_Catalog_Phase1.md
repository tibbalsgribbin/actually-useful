# Unit Catalog — Phase 1

*Chat 93 · May 20, 2026 · Opus*

*First phase of the unit-collision design work. Catalogs every unit-word AU currently recognizes (from search.js v0.6.2.1) plus collision cases where the same word in a title means something other than a quantity to divide price by. Phases 2 (taxonomy), 3 (rules), and 4 (ambiguity-note redesign) remain. This document is a working artifact, not a spec — collisions are tagged VERIFIED or SPECULATIVE and the catalog is expected to evolve as test searches confirm or refute entries.*

---

## Confidence tags

- **VERIFIED** — collision is documented in code (existing handler, comment, or guard), in bug-test.md, in a project doc, or in a screenshot/log Melissa has provided this session.
- **SPECULATIVE** — collision was proposed by Opus without confirmation from real Amazon results. Likely-looking but unverified. Needs a search to confirm before it becomes the basis for a rule.

The goal across sessions is to drive SPECULATIVE entries to VERIFIED (confirming the collision exists) or to remove them (confirming it's a non-issue), and to add new VERIFIED entries from real search results that no one thought to look for.

---

## How the code currently handles unit-vs.-spec collisions

Four patterns already exist, added one at a time as bugs surfaced. The Phase 3 ruleset should generalize these. Documented here so the design doesn't reinvent them.

1. **`isPaperWeightLb(title)`** — suppresses lb-PPU when "65 lb cover" / "90 lb index" appears with a paper-grade word within 40 chars after the lb match. Words checked: cover, bond, text, index, weight, cardstock, gsm, basis, bristol, vellum.
2. **`isMultiPackWeight(title)`** — guards whether a detected weight can be multiplied by pack count. Fires when a container word (bag, box, pouch, can, canister, jug, bottle, carton, tub, pail) appears within 25 chars after the weight, OR a strong substance word (rice, flour, sugar, oats, oatmeal, coffee, beans, lentils, pasta, kibble, food, feed, seed, seeds, salt, powder, protein, formula, detergent, softener) appears anywhere in the title.
3. **`isServingWeight(title, gQty)`** — suppresses small gram values (<100g) when supplement keywords are present (whey, isolate, casein, collagen, creatine, bcaa, amino, pre-workout, mass gainer, greens, protein, serving, servings).
4. **`applyPairsNote(result, title)`** — when title contains "pair"/"pairs" and Amazon supplied the PPU, adds an ambiguity note and (if unit is ct or empty) renames the unit to "pair." Detection is intentionally broad. *Note: this handler has its own design problems documented separately in Phase 4 scope below.*

Additional carve-outs in extraction logic:
- `extractCount()` requires `fn >= 5` before treating "Nft"/"N feet" as a count, blocking small length values from acting as quantity.
- `extractCount()` uses `(?<![\d\/])(\d+)\s*(?:ft|feet)` to reject fractions like "5/8 inch" before ft.
- `ITEM_UNITS` deliberately excludes weight and liquid units so they fall through to a weight-context check rather than being accepted blindly.

The pattern is consistent: **a token that looks like a unit gets disqualified by surrounding context.** What's missing is a unified framework — each fix is bolted on. Phase 3 will design that framework.

---

## The unit families AU currently recognizes

From `LIQUID_UNITS`, `WEIGHT_UNITS`, `CONTAINER_UNITS`, `LENGTH_UNITS`, `ITEM_UNITS`, plus regex tokens inside `guessCountUnit()` and `extractCount()`.

---

## Family 1: Weight units

### `oz`, `ounce`, `ounces`

**PPU meaning:** weight (avoirdupois ounce, ~28g). Sortable in weight family. Convertible to/from g, kg, lb.

**Collisions:**
- **VERIFIED — Toothpaste treated as liquid.** Amazon reports toothpaste oz as fl oz; AU inherits it. Logged in bug-test.md. Needs solid override.
- **SPECULATIVE — Container capacity (mugs, tumblers, water bottles).** "16 oz mug" — number is container volume, not contents. Likely fl oz under the hood but commonly written "oz" in titles.
- **SPECULATIVE — Spray-can coverage.** "8 oz spray can covers 50 sq ft." Weight refers to product but buyable quantity may be the can.
- **SPECULATIVE — Boxing/MMA glove weight class.** "16 oz gloves." Spec of the glove, not quantity.
- **SPECULATIVE — Fishing weights/sinkers.** "1 oz lead sinker." Spec. *Verification note (Chat 99, May 21 2026): single search for "fishing sinkers" (60 listings) showed Amazon reports NO PPU for any sinker listing. Predicted Override-suppress failure mode did not occur. Status remains SPECULATIVE pending broader confirmation, but the hypothesis to verify is now "Amazon already handles this acceptably (by omitting PPU)" rather than "Amazon mis-applies $/oz."*
- **SPECULATIVE — Precious metals.** "1 oz silver coin." PPU as $/oz of metal is technically correct but spot-price-sensitive.

### `lb`, `lbs`, `pound`, `pounds`

**PPU meaning:** weight (~454g). Sortable in weight family.

**Collisions:**
- **VERIFIED — Paper grade.** "65 lb cover," "90 lb index," "110 lb cardstock." Handled by `isPaperWeightLb()`.
- **VERIFIED — Dumbbells/kettlebells partial guard.** `isMultiPackWeight()` blocks pack-multiplication but doesn't suppress per-pound calculation. "10 lb dumbbell" still gets $/lb.
- **SPECULATIVE — Fishing line test strength.** "20 lb test braided line." Spec. *Verification note (Chat 99, May 21 2026): single search for "braided fishing line" showed Amazon does NOT compute $/lb; it computes $/foot using the spool length. Predicted Override-suppress failure mode did not occur. Status remains SPECULATIVE pending broader confirmation, but the hypothesis to verify is now "Amazon already handles this acceptably" rather than "Amazon mis-applies $/lb."*
- **SPECULATIVE — Load/tow/capacity ratings.** "500 lb capacity dolly," "1000 lb winch." Spec.
- **SPECULATIVE — Body weight ranges.** "for dogs 25-50 lbs," "harness for cats 5-15 lb." Intended-user spec.

### `g`, `gram`, `grams`

**PPU meaning:** weight (~0.035oz). Sortable in weight family.

**Collisions:**
- **VERIFIED — Per-serving nutrition (supplements).** "30g protein per serving." Handled partially by `isServingWeight()` for supplement keywords.
- **VERIFIED — Per-serving more broadly possible.** Coffee bean dosage, pre-workout doses. Current handler is supplement-keyword-gated; may miss other categories.
- **SPECULATIVE — Jewelry weight specs.** "5g gold ring." Spec, but for precious metals could be the buyable quantity.

### `kg`, `kilogram`, `kilograms`

**PPU meaning:** weight. Sortable in weight family.

**Collisions:**
- **SPECULATIVE — Body weight ranges.** "for adults 50–90 kg." Intended-user spec.
- **SPECULATIVE — Capacity/load ratings.** "20 kg max load." Spec.
- **SPECULATIVE — Empty product weight specs.** "1.5 kg lightweight carry-on." Spec of the bag, not buyable.

---

## Family 2: Liquid units

### `fl oz`, `fluid ounce`, `fluid ounces`

**PPU meaning:** volume (~29.6 ml). Sortable in liquid family.

**Collisions:**
- **VERIFIED — Stray parenthesized numbers.** Contact lens solution: "Vista Clean 12 fl oz (12)" — the (12) was scraped as volume, breaking PPU. Logged in bug-test.md.
- **SPECULATIVE — Container capacity for empty-jar/bottle products.** "16 fl oz Mason jars (12 pack)" — capacity, not product.

### `ml`, `milliliter`, `milliliters`

**PPU meaning:** volume. Sortable in liquid family.

**Collisions:**
- **SPECULATIVE — Syringe/pipette/dropper capacity.** "10ml syringes, 100 count." Capacity is a per-item spec; buyable is count.
- **SPECULATIVE — Empty cosmetics jar capacity.** "30ml glass jars 24 pack." Capacity, not product.

### `l`, `liter`, `liters`

**PPU meaning:** volume. Sortable in liquid family.

**Collisions:**
- **SPECULATIVE — Container capacity.** "2 liter pitcher," "1L water bottle." Empty vessel capacity.
- **SPECULATIVE — Aquarium size.** "20 liter fish tank." Spec.
- **SPECULATIVE — Lung capacity / medical device spec.** "3L oxygen concentrator." Spec.

---

## Family 3: Count-type units

### `count`, `ct`

**PPU meaning:** discrete countable items. The most generic count unit.

**Collisions:**
- **VERIFIED — Pack count vs. item count confusion.** "500 per Pack - 2 Pack" yields 2 ct instead of 1000 ct. Logged in bug-test.md.
- **VERIFIED — Whole-package $/ct.** Amazon reports "($0.23/ct)" for a 100-count item where ct = full package. Logged in bug-test.md.
- **SPECULATIVE — Fabric mesh density (cross-stitch, needlepoint).** "14 count Aida cloth," "18 count linen," "Zweigart 25 count." Count = threads per linear inch, not items. This is the case Melissa flagged as the original motivation for this session. *Needs verification search.*
- **SPECULATIVE — Bedding thread count.** "400 count Egyptian cotton sheets," "1000-count microfiber." Threads per square inch, not items.
- **SPECULATIVE — Knife block "count."** "15 count knife block set." Buyable is the set.

### `bag`, `bags`

**PPU meaning:** multi-bag buyable count.

**Collisions:**
- **SPECULATIVE — Trash bag gallons.** "13 gallon trash bags 80 count" — gallon describes bag capacity, count describes bag quantity. Two-number title.
- **SPECULATIVE — Sleeping bag temperature rating.** "0° sleeping bag." Spec.
- **SPECULATIVE — Tea bag count ambiguity.** "tea (16 bags)" — usually correct but worth confirming.

### `piece`, `pieces`, `pcs`, `pc`

**PPU meaning:** discrete items.

**Collisions:**
- **SPECULATIVE — Set-of-pieces.** "10 piece pots and pans set," "7 piece dinnerware set," "5 piece luggage set." Piece count is set composition; buyable is the set. Title-is-a-mess category in bug-test.md flags this for "pots and pans set 10 piece."
- **SPECULATIVE — Puzzle piece count.** "1000 piece jigsaw puzzle." Buyable is the puzzle.
- **SPECULATIVE — Construction set piece count.** "Lego Star Wars 500 pieces." Buyable is the set.

### `pack`, `packs`, `pk`

**PPU meaning:** the pack is the buyable unit when multi-pack.

**Collisions:**
- **SPECULATIVE — "Six pack abs" descriptive use.** Workout/fitness products may have "pack" without it being a count.
- **SPECULATIVE — "Pack" as backpack/daypack noun.** "tactical pack," "hydration pack." Usually no leading count.

### `bar`, `bars`

**PPU meaning:** food/soap/snack bars.

**Collisions:**
- **SPECULATIVE — Exercise/fitness "bar" equipment.** "20 lb resistance bar." Mixed unit and equipment word.
- **SPECULATIVE — Other "bar" senses.** Curtain bar, salad bar, etc. — usually no leading count.

### `roll`, `rolls`

**PPU meaning:** rolled paper/film/tape products.

**Collisions:** none identified as likely. Worth scanning real data.

### `pad`, `pads`

**PPU meaning:** stacked/sheet-form items.

**Collisions:**
- **SPECULATIVE — Brake pads.** "ceramic brake pads 4 pack" — count usually safe (4 = 4 pads). Probably non-issue.

### `sheet`, `sheets`

**PPU meaning:** flat individual items (paper, dryer sheets, fabric softener sheets).

**Collisions:**
- **SPECULATIVE — Bed sheet set.** "queen size sheet set 4 piece." Buyable is the set; sheets are components.

### `wipe`, `wipes`

**PPU meaning:** disposable individual wipes.

**Collisions:** none identified as likely.

### `tablet`, `tablets`, `pill`, `pills`, `capsule`, `capsules`

**PPU meaning:** individual medication/supplement units.

**Collisions:**
- **VERIFIED — Sub-penny PPU on high-count items.** Cotton swabs, bandages, pills. Logged in bug-test.md as a formatting issue, not a collision per se, but related to count handling.
- **SPECULATIVE — "Tablet" as iPad/Android device.** "10 inch tablet" — completely different sense of the word. Risk is low because of the count regex requiring `\d.*tablet`, but worth scanning.
- **SPECULATIVE — Pill organizer / pill case.** "weekly pill organizer 7 day." Holds pills; not a pill count.
- **SPECULATIVE — Capsule wardrobe / capsule collection.** Marketing-jargon descriptor.

### `each`, `unit`, `units`

**PPU meaning:** generic count.

**Collisions:**
- **SPECULATIVE — HVAC/AC "unit."** "5000 BTU window AC unit." The unit is the appliance.
- **SPECULATIVE — Storage unit, housing unit, etc.** Descriptive.

### `pair`, `pairs`

**PPU meaning:** items sold by the pair.

**Collisions:**
- **VERIFIED — Amazon $/pair vs. $/item ambiguity.** Already handled by `applyPairsNote()`. Note copy and detection scope have design problems documented in Phase 4 scope below.
- **SPECULATIVE — "Pair of" as descriptive phrase.** "scissors with pair of replacement blades." No leading count.

### `strip`, `strips`

**PPU meaning:** breath strips, test strips, light strips.

**Collisions:** none identified as likely.

### `load`, `loads`

**PPU meaning:** laundry/dishwasher loads computed from product yield.

**Collisions:**
- **VERIFIED — Solid-product override gap.** "Pods/sheets showing $/load instead of $/lb. Should show $/load." Logged in bug-test.md.
- **SPECULATIVE — Washer load capacity spec.** "8 lb load capacity." Spec, different context entirely.

---

## Family 4: Length units

### `ft`, `feet`, `foot`

**PPU meaning:** linear length (rope, cord, hose, lights).

**Collisions:**
- **VERIFIED — Min-5ft guard exists.** `extractCount` rejects short footage values. Doesn't help when a count regex matches first.
- **SPECULATIVE — Sewing machine feet.** "embroidery foot," "walking foot," "12 piece sewing machine feet set." Original case Melissa flagged. Probably defeated by "12 piece" matching count first, but worth confirming.
- **SPECULATIVE — Coverage spec.** "covers 200 sq ft." Coverage, not buyable length.
- **SPECULATIVE — Tripod/camera "foot" replacement.** "rubber foot replacement."
- **SPECULATIVE — Foot body part.** "foot massager," "diabetic foot cream." Descriptive.
- **SPECULATIVE — Ceiling height descriptor.** "for 10 ft ceilings." Intended-use spec.

### `inch`, `inches`, `in`

**PPU meaning:** rarely a PPU unit on its own. Usually a spec.

**Collisions:**
- **SPECULATIVE — Screen size.** "55 inch TV," "27 in monitor," "10 inch tablet." Spec.
- **SPECULATIVE — Wheel/tire/bike size.** "16 inch wheels," "26 inch bike." Spec.
- **SPECULATIVE — Garment length.** "30 inch inseam," "20 inch handbag strap." Spec.
- **SPECULATIVE — Hardware tool spec.** "1/2 inch drill bit." Spec.
- **VERIFIED — "in" as preposition risk.** Literal token `'in'` in `LENGTH_UNITS` is risky for false matches in titles like "best laptops in 2026." No specific bug logged but the risk is plain.

### `yard`, `yards`

**PPU meaning:** linear length (fabric, ribbon, rope).

**Collisions:**
- **SPECULATIVE — Lawn/garden "yard."** "yard tools," "yard hose." Different sense, usually no number.

### `meter`, `meters`, `m`, `cm`

**PPU meaning:** metric length.

**Collisions:**
- **SPECULATIVE — "M" as size letter.** "size M shirt." Risky token.
- **SPECULATIVE — Camera lens focal length.** "50mm lens." Spec.

### `sq ft`, `square feet`, `sq m`

**PPU meaning:** area coverage (paint, flooring).

**Collisions:**
- **SPECULATIVE — Coverage vs. purchasable area.** "5 gallons covers 1500 sq ft" — coverage and buyable are different units in the same title.

---

## Family 5: Container units

### `box`, `boxes`

**PPU meaning:** multi-box buyable count.

**Collisions:**
- **SPECULATIVE — "Box" as product.** "tool box," "lunch box." Box is the product.
- **SPECULATIVE — Box size descriptor.** "12 inch box." Size, not count.

### `pouch`, `pouches`

**PPU meaning:** multi-pouch buyable count.

**Collisions:** none identified as likely.

### `tube`, `tubes`

**PPU meaning:** tubes of paste/cream/caulk.

**Collisions:**
- **SPECULATIVE — Test tubes.** "test tube rack 12 tube." Components of a rack.
- **SPECULATIVE — Bike inner tube.** "bike inner tube 26 inch." The tube is the product.
- **SPECULATIVE — Tube TV / vacuum tube / amplifier tube.** Niche.

### `package`, `packages`

**PPU meaning:** multi-package buyable count.

**Collisions:**
- **SPECULATIVE — "Care package" gift baskets.** Single buyable unit.

---

## Items where any per-unit PPU is misleading (separate from collisions)

A category worth flagging because it isn't a collision — it's that PPU itself doesn't apply.

- **SPECULATIVE — Variable-yield consumables.** "30 day supply" of skincare depends on application amount.
- **SPECULATIVE — Subscription boxes.** Variable contents per box.
- **SPECULATIVE — Service/membership products.** "1 year subscription," "12 month membership."
- **SPECULATIVE — Variable-density solids.** Coffee grounds vs. whole bean.
- **SPECULATIVE — Concentrates.** "makes 50 cups" vs. "makes 200 cups" laundry detergent — yield matters, not bottle.

---

## Likely gaps in AU's unit vocabulary

Words AU doesn't currently recognize that probably matter. **None of these are verified yet** — Melissa noted she'd need to run test searches to know which gaps are real.

- **`gallon`, `gallons`, `gal`** — US liquid gallon. Used in fuel additives, paint, large beverage containers. Also collides heavily with trash-bag/aquarium/water-heater capacity specs.
- **`quart`, `pint`** — smaller US liquid volumes.
- **`cup`, `cups`** — recipe measurement, drinking-cup product, K-cup pods, bra cup size — collision-heavy.
- **`dozen`** — 12 of something.
- **`yard` of fabric** — already in LENGTH_UNITS as a length, but the PPU users want for yarn is $/yard and the current panel doesn't surface it. *Surfaced from Melissa's yarn screenshot — pills offered were oz/lb/g/kg/per item/As listed, no yardage option.*

The yarn finding is the most concrete: even when a length unit is recognized, the panel isn't offering it as a comparison pill in weight-dominant searches. That's a panel-presentation gap, not a recognition gap.

---

## Phase 4 scope — pairs note redesign (NOT this phase, but documenting now so it isn't lost)

The existing `applyPairsNote()` handler has five problems documented in Chat 93 that should be addressed when Phase 4 (ambiguity notes — detection, copy, and display) runs:

1. **Detection too broad.** `\bpairs?\b` fires on "pair of" descriptive phrases. Needs context-window pattern (number-precedes-pair).
2. **Condition logic is suspect.** Only fires when unit is `ct` or empty, meaning a possibly-wrong $/oz from Amazon goes un-flagged.
3. **Copy uses internal vocabulary.** "PPU is Amazon's figure…" exposes the "PPU" abbreviation to users.
4. **Display weight too heavy.** Renders as a multi-sentence `<div class="ppu-note">` block under the PPU pill — clashes with dense panel layout.
5. **Pattern needs to generalize.** Every collision rule in Phase 3 may want to produce a similar user-facing ambiguity note. Need a unified display pattern, not bespoke copy per case.

---

## What goes into Phases 2–4

- **Phase 2 — Collision taxonomy.** Group the verified collisions into shared shapes. Initial candidates from this catalog: spec rating, capacity (empty container), per-unit density (mesh, thread count, grit), mechanical part name, per-serving, component-in-set, pair ambiguity, stray-number-in-parens. Each shape gets a name and a detection signature.
- **Phase 3 — Design rules.** For each shape: detection mechanism (context window? category keyword? both?), action (suppress, recategorize, add note, no-PPU), and user-facing copy if applicable. Spec for Sonnet to implement.
- **Phase 4 — Ambiguity note redesign.** Detection scope, copy guidelines, display pattern (panel and compare). Fixes pairs and sets the framework for future notes.

---

*End of Phase 1 catalog. Working document — entries should change as verification searches confirm or refute SPECULATIVE collisions and as test searches surface new VERIFIED ones.*
