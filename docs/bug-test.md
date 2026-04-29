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
| | | | | | | | |

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

### 5. Personal care — small sizes
- "travel size shampoo"
- "lip balm"
- "razor blade refills"
- "contact lens solution"

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
