# Changelog — Chat 63 (May 12, 2026)

## Files changed
- search.js: v0.6.1.74 → v0.6.1.78

---

## search.js changes (v0.6.1.75–v0.6.1.78)

### Multi-pack × weight PPU — design and implementation (v0.6.1.75–v0.6.1.77)

New system for calculating PPU based on total weight when a product has both a physical weight and a pack count.

**New helper: `isMultiPackWeight(title)`**
Returns true when it's safe to multiply a detected weight by a pack count. Two conditions — either is sufficient:
- Condition C: a container word (bag, box, pouch, can, canister, jug, bottle, carton, tub, pail) appears within ~25 chars after the weight match in the title
- Condition B (strong): a substance/food keyword (rice, flour, sugar, oats, coffee, beans, kibble, food, feed, powder, protein, detergent, softener, etc.) appears anywhere in the title

Prevents false multiplication for dumbbells, cast iron skillets, and other items where weight is a product spec rather than a quantity of substance.

**New helper: `isServingWeight(title, gQty)`**
Returns true when a gram value under 100g appears alongside supplement keywords (whey, isolate, casein, protein, serving/servings, creatine, bcaa, etc.). Suppresses per-serving nutrition figures from being used as product weight in PPU calculation.

**Multi-pack × weight logic — two insertion points:**

1. `count&&price` branch: when `isMultiPackWeight` passes and a weight is found in the title, uses weight-based PPU instead of $/ct. If count > 1, multiplies unit weight × count and shows ppuNote ("6 × 20 lb = 120 lb total"). If count = 1, shows $/weight for the single item.

2. Weight-from-title fallback: same multiply logic when Amazon provides no unit price and count > 1.

**`isServingWeight` wired into weight-from-title fallback:** gram matches are nulled when `isServingWeight` fires, preventing protein powder per-serving nutrition figures from becoming $/g PPU.

### Hyphenated unit fix — "72-Ounce", "32-Ounce" etc. (v0.6.1.78)

All three oz extraction regexes changed from `\s*` to `[- ]*` between the number and the unit word:
- `parseTitleWeightQty` ozM
- `count&&price` multi-pack block mwOz
- Weight-from-title fallback ozM2

Previously "72-Ounce Box" failed to extract 72 because the hyphen was not matched by `\s*`. This caused items like Minute Rice (72-Ounce Box, no Amazon unit price) to fall through to $/ct instead of $/oz. Fix covers all hyphenated oz patterns ("32-Ounce", "16-Ounce", etc.).

---

## Known issues identified this session

### $/serving for protein powder — design session needed
Protein powder results across Amazon universally list "N Servings" in the brand row. $/serving alongside $/oz would allow frugal shoppers and bodybuilding communities to compare by serving count as an alternative unit. `altPPU`/`altUnit` fields already exist in the item object. Add to roadmap for a future design session.

### Dumbbells — $/lb is pre-existing known issue
Dumbbells showing $/lb is the existing "outlier PPU units sorting to top" known issue, not introduced by this session. `isMultiPackWeight` correctly returns false for dumbbell titles.
