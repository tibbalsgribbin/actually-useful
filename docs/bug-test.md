# Actually Useful — Bug Test Log

*One row per search. Run one category per test session. Goal: verify PPU, unit display, and sort behavior across a wide range of product types.*

---

## How to use this

1. Pick one category from the list below.
2. Run 6–10 searches within that category.
3. Fill in Expected, Actual, and Status for each.
4. Note the extension version (shown in the panel footer or popup).
5. If something's wrong, open a GitHub Issue referencing the search term and version.

**Status values:** ✅ Pass · ❌ Fail · ⚠️ Partial · 🔍 Needs investigation

---

## Log

| Date | Version | Category | Search term | Expected | Actual | Status | Notes |
|---|---|---|---|---|---|---|---|
| Apr 29 | v0.6.1.35 | Personal care | travel size shampoo | $/oz | $/oz | ✅ | Correct. Mixed $/oz and $/ml across results — both reasonable |
| Apr 29 | v0.6.1.35 | Personal care | travel size conditioner | $/oz | $/oz | ✅ | Correct |
| Apr 29 | v0.6.1.35 | Personal care | lip balm | $/ct or $/oz | $/ct or $/oz (mixed) | ⚠️ | Can't show both; cosmetics $/oz reveals extreme price differences (one item: $191/oz). Showing both units is a post-alpha feature |
| Apr 29 | v0.6.1.35 | Personal care | razor blade refills | $/ct | $/ct | ✅ | Correct. $0.1/ct formatting bug noted (should be $0.10/ct) |
| Apr 29 | v0.6.1.35 | Personal care | disposable razors | $/ct | $/ct | ✅ | Correct |
| Apr 29 | v0.6.1.35 | Personal care | contact lens solution | $/fl oz or $/ct | $/fl oz wrong on many | ❌ | Amazon's reported $/fl oz is wrong when title has stray number e.g. "(12)". Vista Clean 12 fl oz: shows $6.76/oz, should be $1.92/oz. Needs liquid PPU sanity check |
| Apr 29 | v0.6.1.35 | Personal care | travel size toothpaste | $/oz or $/ct | $/ct or $/fl oz (wrong) | ⚠️ | "3 Ounce" word-form not matched — Tom's showing $/ct instead of $/oz. Toothpaste treated as liquid (Amazon reports fl oz). Needs SOLID_KEYWORDS entry. **Update May 20, 2026 (Chat 96/97):** the "needs solid override" framing is superseded. Per `Override_Principle.md`, toothpaste posture is now **Defer** — Amazon's $/fl oz enables in-category comparison (page-internal consistency, densities close enough). The remaining issue here is the "3 Ounce" word-form parse failure, not the fl-oz-vs-oz unit choice. |
| Apr 29 | v0.6.1.35 | Personal care | cotton swabs | $/ct (sub-penny) | $/ct but wrong counts | ❌ | Pack count grabbed instead of item count ("500 per Pack - 2 Pack" → 2 ct, not 1000). One item: count found (500) but PPU shows price/1. Sub-penny items need 3 decimal places |

---

## Categories to test (work through these over time)

### 1. Consumables / laundry (core PPU — already partially tested)
- "laundry pods 96 count"
- "laundry detergent liquid"
- "dishwasher pods"
- "paper towels 6 pack"
- "toilet paper 24 rolls"
- "trash bags 13 gallon 80 count"

### 2. Pet supplies
- "dog food 30 lb bag"
- "cat litter clumping 20 lb"
- "dog treats training 16 oz"
- "pee pads 100 count"
- "fish tank filter cartridges"

### 3. Tools & hardware (length/weight units)
- "extension cord 25 ft"
- "rope 50 feet"
- "drill bit set"
- "sandpaper assorted grit"
- "screws #8 1 inch"

### 4. Crafts & office (count + dimension chaos)
- "cardstock 100 sheets"
- "envelopes #10"
- "binder clips assorted"
- "thread spools"

### 5. Personal care — small sizes ⚠️ partially tested Apr 29
- ~~"travel size shampoo"~~ ✅
- ~~"travel size conditioner"~~ ✅
- ~~"lip balm"~~ ⚠️
- ~~"razor blade refills"~~ ✅
- ~~"disposable razors"~~ ✅
- ~~"contact lens solution"~~ ❌ known bug
- ~~"travel size toothpaste"~~ ⚠️ known bug
- ~~"cotton swabs"~~ ❌ known bug
- Remaining: "dental floss", "deodorant travel size"

### 6. Baby & kids (high purchase volume)
- "baby wipes 720 count"
- "diapers newborn"
- "kids vitamins gummies 60 count"

### 7. Health / medical (different unit logic)
- "bandages assorted sizes"
- "compression socks"
- "reading glasses +2.00"
- "blood pressure monitor" (single unit — expect no PPU)

### 8. Single-unit items (graceful no-PPU handling)
- "yoga mat"
- "office chair"
- "bedside lamp"

### 9. International / metric-heavy
- "olive oil imported 500ml"
- "tea loose leaf 100g"
- "honey raw 16 oz"

### 10. Title-is-a-mess (multiple numbers, multiple units)
- "pots and pans set 10 piece"
- "underwear men 6 pack"
- "socks crew 20 pair"
- "Christmas lights 100 ft 300 led"

### 11. SNAP EBT eligible (requires grocery search)
- "rice 20 lb"
- "frozen vegetables"
- "baby formula similac"
- "dried beans"

---

## Known tricky cases to watch for

- **Solid product override triggered** — pods/sheets showing $/load instead of $/lb. Should show $/load.
- **Liquid-dominant inference** — search with mostly liquid items. Should show $/fl oz, not $/lb.
- **Whole-package $/ct** — Amazon reports "($0.23/ct)" for a 100-count item where ct = the full package. Should recalculate from price/count.
- **Mixed unit families** — $/lb and $/ct appearing in same sorted results. Note which items and what units.
- **No PPU available** — single-item categories should show price but no PPU, and not sort erroneously.
- **SNAP EBT detection** — grocery items should show green "SNAP EBT eligible" note when eligible.
- **Word-form weights** — "3 Ounce", "18 Pound", "0.85 OZ" not matched by Fix 2 regex — item may show $/ct instead of $/oz or $/lb.
- **Toothpaste as liquid** — Amazon reports fl oz; AU inherits it. ~~Should be solid override.~~ **Updated May 20, 2026:** per `Override_Principle.md`, posture is **Defer**. Amazon's $/fl oz enables in-category comparison (every toothpaste listing shows it the same way; densities close enough). No override needed. Remaining issue is the "3 Ounce" word-form parse failure for $/oz solid items, which is a separate bug from the unit-choice question.
- **Sub-penny PPU** — high-count items (cotton swabs, bandages, pills) need 3 decimal places. $0.01/ct is meaningless at scale.
- **Pack count vs item count** — "500 per Pack - 2 Pack" should yield 1000 ct, not 2 ct.
- **Amazon liquid PPU sanity** — when title has explicit volume, check Amazon's figure against price ÷ volume. Flag if they diverge significantly.
