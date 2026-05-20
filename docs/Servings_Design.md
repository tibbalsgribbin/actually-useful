# Servings as a PPU Unit — Design

*Chat 96 · May 20, 2026 · Opus*

*Proposes adding $/serving as a first-class PPU pill in AU, surfaced whenever a title supplies serving-count data. This is an application of the **add-pill** posture from `Override_Principle.md`. Under the resolved framing, supplements as a category is **defer + add-pill**: Amazon's $/g remains a valid pill, and $/serving is added alongside. The existing `isServingWeight()` handler addresses a different problem (Amazon misparsing a per-serving gram as product weight) and stays as-is for that defensive role; the $/serving pill is a separate code path.*

---

## The argument

PPU exists to enable in-category comparison. For a wide range of consumable products, the natural unit of consumption is the serving — not the gram, not the ounce, not the pound. A user shopping for protein powder is rarely asking "which one is cheapest per pound?" They're asking "which one is cheapest per shake?"

A concrete example. Two whey protein products:

- Product A: 5 lb tub, 25g per serving, $90 → 90 servings, **$1.00/serving**, $18/lb
- Product B: 2 lb tub, 50g per serving, $50 → 18 servings, **$2.78/serving**, $25/lb

The $/lb ordering says A is cheaper by 28%. The $/serving ordering says A is cheaper by 64%. **The two rankings answer different questions, and for many users the serving question is the real one.**

Currently AU offers $/g and $/lb but not $/serving, even though the serving count is right there in the title. We're missing the pill the user most often wants.

---

## Categories where $/serving is the right unit

Strong candidates — serving count almost always in the title, serving is the consumption unit:

- Protein powder (whey, casein, plant-based)
- Pre-workout
- Creatine
- BCAA / amino acids
- Greens powders / superfood blends
- Collagen
- Mass gainer
- Meal replacements (Soylent, Huel, Ka'Chava)
- Electrolyte powders (LMNT, Liquid I.V., Nuun)
- Hydration sticks
- Fiber supplements (Metamucil, Benefiber)

Likely candidates — serving/meal/cup count often in title, consumption unit varies:

- Dry pet food ("makes 40 cups," "approx 30 meals")
- Wet pet food (per-meal pricing)
- Ground coffee ("makes 60 cups")
- Coffee pods (already $/pod via existing count handling)
- Tea bags (already counted)
- Drink mix (Crystal Light, lemonade powder)
- Baby formula (servings per container)
- Oatmeal (servings per box)
- Cereal (servings per box — title-presence varies)

Existing analogous handling worth noting:

- **Loads** (laundry/dishwasher pods): already computed as $/load. This is the same shape — extract yield from title, surface as preferred PPU. Servings is the generalization.

---

## Data sources

Three places serving information appears in Amazon search results:

**1. Title (primary source).** Common patterns:

- "30 servings"
- "60 servings"
- "100 servings per container"
- "30 ct" *(when ct refers to pre-portioned servings like stick packs)*
- "30-day supply" *(servings if dosing is once per day)*
- "Makes X cups" *(coffee, drink mix)*
- "X meals" *(pet food)*

The first two patterns are reliable and high-frequency for supplements. The rest range from reliable (Makes X cups for coffee) to ambiguous (X-day supply, which depends on dosing frequency).

**2. Amazon's reported PPU.** Sometimes Amazon reports "$0.50/serving" or "$0.33/count" where count = serving. When Amazon volunteers this, AU should prefer to surface it directly rather than re-derive.

**3. Subtitle / listing details.** Not currently scraped. Out of scope for this design; mentioned for completeness.

For this design, **title-based extraction is the primary path**, with Amazon-reported $/serving as a confirmation/shortcut where available.

---

## Family placement and pill behavior

Three structural options, briefly evaluated:

**Option A: New `SERVING_UNITS` family.** Clean but creates a family that may only ever contain one unit. Adds family-switching complexity without payoff.

**Option B: Cross-family pill, gated by data presence in title.** When a title contains a parseable serving count, the `$/serving` pill appears alongside the default weight or count pills, regardless of which family the product's primary unit lives in.

**Option C: Category-gated.** Only show `$/serving` for products matching supplement keywords (parallel to how `isServingWeight()` currently works).

**Recommendation: Option B.** Gate by data, not by category.

Reasons:
- Generalizes naturally. Pet food, coffee, drink mix, and supplements all benefit from the same code path.
- Avoids keyword-list maintenance creep. Supplement keyword lists already have known coverage gaps; adding "pet food," "coffee," "drink mix" multiplies the problem.
- Matches the yarn finding from the catalog (length unit recognized in code but not offered as pill where data was present). Same shape, same fix.
- Lets the user decide. If $/serving appears as a pill but the user wants $/lb, the pill is dismissible.

The trust-posture mapping (from `Override_Principle.md`):

- **Defer + Add-pill** when the product's $/g (or $/oz, $/lb) is valid and a parseable serving count is present in the title. Add the $/serving pill alongside Amazon's PPU; Amazon's PPU remains available.
- **Defer alone** when no serving data is in the title — current weight/count PPU stays as is.
- **Override-suppress** when Amazon has scraped a per-serving gram as if it were product weight (the case `isServingWeight()` already defends against). If serving data is also in the title, add the $/serving pill on top of the suppression; the listing then shows $/serving as its only pill.

The first case is the dominant one for supplements with real product weights. The third is the defensive edge handled by the existing handler.

### Add-pill plurality for multi-pack supplements

Single-tub supplements get one extra pill ($/serving). Multi-pack supplements get two extra pills:

| Listing | Pills offered |
|---|---|
| Single-tub supplement | Amazon default ($/g or $/oz) + **$/serving** |
| Multi-pack supplement (e.g. 3-pack whey) | Amazon default + **$/tub** + **$/serving** |

This follows the general add-pill plurality principle from `Override_Principle.md`: each meaningful unit the title supports gets a pill. A multi-pack supplement title typically carries both the per-tub count *and* the per-serving count, so both pills are warranted.

---

## What changes about `isServingWeight()`

The existing handler (search.js lines 974–977, verified Chat 96) does this:

```javascript
function isServingWeight(title, gQty) {
  if (!gQty || gQty >= 100) return false;
  return /\b(?:whey|isolate|casein|collagen|creatine|bcaa|amino|pre-?workout|
    mass\s*gainer|greens|protein|serving|servings)\b/i.test(title);
}
```

It returns true (i.e. suppresses Amazon's gram value) when both conditions hold:
- The gram quantity is non-null and below 100g (`gQty < 100`).
- The title matches a keyword regex.

The regex is worth a closer look. It mixes two kinds of triggers:
- **Category keywords**: `whey`, `isolate`, `casein`, `collagen`, `creatine`, `bcaa`, `amino`, `pre-workout`, `mass gainer`, `greens`, `protein`.
- **Serving-presence keywords**: `serving`, `servings`.

So the gate fires not just for supplement-category titles but also for any title that mentions "serving" or "servings" alongside a sub-100g value. This is broader than a pure category list and catches some non-supplement "X g per serving" patterns incidentally.

Under the new design, the handler stays as-is. Its job — defending against Amazon scraping a per-serving gram value when no real product weight is visible — is still correct. The new $/serving add-pill is a separate code path that runs independently:

- For listings where Amazon supplies a valid product weight (the common case): $/g is offered by Amazon, $/serving is offered by AU's new add-pill logic. Both available.
- For listings where Amazon supplied only a per-serving gram (the case `isServingWeight()` catches): $/g is suppressed, $/serving is offered by add-pill if serving data is in the title.

The two code paths don't conflict. The handler is doing override-suppress on a defensive subset; the add-pill code is doing defer+add-pill on the rest. The trust-posture characterization for the supplement *category* is defer + add-pill; the handler is the override-suppress edge case within that category.

The suppression doesn't need to "shift" or "recast" — it's already doing the right job. The previous Chat 94 framing that called for shifting the handler to add-pill was the same conceptual fuzziness the #9 resolution addressed.

---

## Edge cases and open questions

**"Serving" as a vague term.** Cereal serving sizes are notoriously fudged. A "serving" of cereal is typically 3/4 cup or 30g, which most people exceed. $/serving for cereal may be technically computable but misleadingly low. *Question: do we add the pill anyway and let users interpret, or hold off until per-category trust calibration is done?* Lean: add the pill; the user knows their own portion habits.

**Subscription / variable-yield consumables.** "30 day supply" of skincare is yield-based, not count-based. Already flagged in the catalog under "PPU itself doesn't apply" cases. Don't add a $/day pill for these without separate design — yield estimates are not equivalent to discrete serving counts.

**Servings within a counted item.** A bottle of vitamins might say "60 tablets, 30 servings (2 tablets per serving)." Both $/tablet and $/serving are valid; they differ by a factor of two. Both should be added as pills (per the add-pill plurality principle). User picks which to sort on.

**Pet-food meal estimates.** "Approximate 30 meals based on a 50 lb dog." The meal count is conditional on the dog's size. *Question: do we surface the meal count anyway?* Lean: yes, but the pill label should hedge ("$/meal*" with a footnote that meal count depends on dog size). The hedge mechanic ties into the Note posture from `Override_Principle.md`.

**Coffee "makes X cups."** Cup size varies (4 oz cup in coffee-maker math vs. 12 oz "cup" in user math). The yield is real but the unit isn't standardized. *Question: do we surface $/cup or $/serving for coffee?* Lean: $/cup using the label Amazon supplies, with the same kind of footnote as pet-food meals if the title hedges.

**Compound titles.** "30 servings (60 capsules)" — both pieces of data are present. AU should extract both and offer both pills (add-pill plurality).

---

## What needs to happen before implementation

This is an Opus-flavored design doc, not a Sonnet-flavored implementation spec. Before a Sonnet session picks this up:

1. **Verification searches** to confirm the categories above behave as described. Specifically: are supplement titles reliable enough that simple regex on `\d+\s*servings?\b` catches most of them? Are pet food titles reliable on `meals` and `cups`? Coffee on `cups`?

2. **Decide on default pill ordering.** When $/serving is available alongside $/lb and $/g, which is the headline pill? Lean: $/serving in supplement-keyword categories, $/lb otherwise (and serving available but not default).

3. **Decide on the bug-test.md update.** The existing supplement entry ("$30/30g doesn't tell me anything") was the original motivation for `isServingWeight()` and is implicitly addressed by this design. Re-read in light of the new posture and update the entry accordingly.

4. **Settle the open questions above** to the extent design can settle them without real data. The remaining ones get resolved during implementation.

---

## Relationship to other work

- **`Override_Principle.md`** — this doc is the canonical worked example of the add-pill posture (with multi-pack plurality). Any future add-pill design should reference back to this one for the pattern.
- **`Unit_Catalog_Phase1.md`** — the catalog's serving entries (lines 73–74, the supplement collision) should be re-tagged once this design is approved: posture = `defer + add-pill`. The `isServingWeight()` defensive subset stays tagged `override-suppress` as a sub-case.
- **`Demotion_Display.md`** — supplements with valid $/g render normally in $/g sort (no demote). Supplements *without* serving data demote in $/serving sort. The supplement worked example in that doc was reworked accordingly.
- **Yarn yardage** — same trust posture, different unit. Worth treating yarn and servings as paired implementations of the add-pill posture so the panel logic gets built once.
- **Loads** (already implemented) — closest existing precedent. Whatever pattern was used for loads is the starting point for the implementation sketch.

---

*Working document. Categories list and open questions both expected to evolve with verification searches.*
