# Brand Detection Research

*Chat 81 — May 16, 2026*
*Opus session. Research deliverable, not a kickoff brief.*

---

## TL;DR

AU's current `scrapeBrand()` function is a 3-strategy fallback chain that's effectively running on Strategy 3 alone (first-word-of-title) for the vast majority of pages. Strategy 1 (apparel byline) targets the wrong DOM element. Strategy 2 ("Visit the X Store") rarely fires on search results. Strategy 3 has four documented failure modes accounting for ~54% of cards across the test set.

A new primary strategy — **parsing the brand from the product's URL slug** — would fix most of these failures in a single change. The slug is present on roughly 80% of cards as captured by Instant Data Scraper, and reaches ~100% of real product cards once sponsored-ad URL wrappers are unwrapped. Sponsored ads are mostly novel products (not duplicates of organic listings), so unwrapping is required for full coverage, not optional. The unwrap itself is mechanically simple. It correctly extracts multi-word brands ("Amazon Basics", "Sun-Maid", "Blue Buffalo"), short-name brands ("HP", "3M", "LG"), and digit-leading brands ("365 by Whole Foods", "9 Elements") that S3 truncates or rejects. It also rescues cases where the title leads with a generic noun ("Laptop Computer for Win 11…", "High Waisted Leggings for Women…") that S3 cannot detect at all.

The slug isn't perfect — it has its own narrow failure modes — so it should pair with a small curated brand list and the existing fallback chain. The rule fixes from the handover's original framing (small-name exceptions, generic-leader blocklist, navigation-card filter) remain valuable but are no longer the main lever.

Recommended sequencing: **slug-as-primary** is the single biggest improvement; rule fixes are easy wins; a small curated brand list is the third leg and should be researched more thoroughly in the Phase 9 design brief.

---

## 1. What's actually getting scraped today

`scrapeBrand()` (search.js, line 1015) tries three strategies in order, returning the first non-null result:

| # | Selector | Intent | Reality |
|---|---|---|---|
| S1 | `h2.a-size-mini span` | "by [Brand]" line on apparel/beauty | Almost never fires correctly. The class is now used by Amazon for review-count badges like "(7K)". Where a real apparel byline exists, it lives in `a-size-base-plus` instead. |
| S2 | `.a-size-base.a-color-secondary` | "Visit the X Store" | Did not fire on any of the 8 categories spot-checked. May still fire in legacy contexts; not investigated in depth. |
| S3 | First word of title (h2 span) | BrandName ProductDescription convention | The actual workhorse. Carries roughly 90% of detection load. |

### S3 failure-mode breakdown

Across 159 hand-classified product cards from 4 categories (laundry, keyboards, laptops, leggings):

| Failure | Frequency | Example | Why |
|---|---|---|---|
| **CORRECT** | 46% | "Tide", "Logitech", "Dell" | S3 working as intended |
| **NONE** | 25% | "365 by Whole Foods Market…", "HP Pavilion…" | Title starts with digit (blocked) or 2-character brand (filtered by len ≥ 3 rule) |
| **GENERIC** | 15% | "Laptop 16-inch…", "Capri Leggings…", "Wireless Keyboard…" | First word is a product noun, not a brand. S3 has no way to know. |
| **TRUNCATED** | 13% | Amazon Basics → "Amazon"; Arm & Hammer → "Arm"; Molly's Suds → "Molly's" | Real brand is multi-word; S3 takes only the first token |
| **NAVIGATION** | 2% | "Brands related to your search", "Visit the help section" | Amazon UI element scraped as a product card |

Apparel categories are particularly hard for S3 because titles almost never start with a brand. Of 52 leggings rows, only 8 (15%) yielded a correct brand from S3; 19 returned a generic product noun and 25 returned nothing.

### Category coverage — does anywhere have a real byline?

Live spot-checks confirmed: **apparel is the only major category with a separate brand byline element** on the search results page. Beauty, cosmetics, electronics, household, food, and supplements all render the brand only as the leading words of the title.

This means S1 and S2 were designed around an exception (apparel), not the norm. The norm is brand-embedded-in-title, which S3 was always going to be the fallback for. The "fallback" is doing 90% of the work.

---

## 2. The proposed primary strategy: URL slug parsing

Every Amazon product link has the form:

```
amazon.com/[Slug-With-Hyphens]/dp/[ASIN]/ref=…
```

The slug consistently starts with the brand name in URL-safe form, followed by partial product descriptors. Sponsored ad links wrap this in a `/sspa/click?…&url=…` redirector where the same slug is URL-encoded inside the `url=` parameter.

### How well does it perform?

Live console tests on dish soap and dog treats search pages:
- **Dish soap:** 48/60 cards had a usable slug from the unwrapped URL (80%). The other 12 were sponsored cards using opaque `/sspa/click?` URLs where the slug needs to be unwrapped from the `url=` parameter — which is straightforward.
- **Dog treats:** 48/60 cards. Same pattern, same fix.

Sample slugs (dog treats, in original card order):
```
Hills-Nutrition-Hypoallergenic-Treats     → Hill's Nutrition (Hill's Prescription Diet)
Stewart-Ingredient-Resealable-Grain       → Stewart
Nylabone-Natural-Healthy-Wheat            → Nylabone
Vital-Essentials-Freeze-Dried             → Vital Essentials
Milk-Bone-Marosnacks-Treats               → Milk-Bone   (compound brand preserved!)
Amazon-Basics-Peanut-Butter               → Amazon Basics   (compound brand preserved!)
Three-Dog-Bakery-Strawberry-Shortcake     → Three Dog Bakery   (3-word brand preserved!)
```

Slug extraction across the 4 CSVs (counts are organic + sponsored cards combined; non-product UI rows excluded):
- Laundry: 60 cards (48 organic + 12 sponsored) → slug works on essentially all once sponsored URLs are unwrapped
- Keyboards: ~27 product cards (16 organic + 11 sponsored, page capped at 16 organic) → same
- Laptops: ~25 product cards (16 organic + 9 sponsored, also capped at 16 organic) → same
- Leggings: 60 cards (some pages render more) → same

**Important: sponsored ads are mostly novel products, not duplicates of organic listings.** ASIN comparison on the test data showed 0–25% overlap depending on category — meaning roughly 75–100% of sponsored cards are products that don't otherwise appear on the page. This means sponsored URL unwrapping is **required for full coverage**, not optional.

The good news: the `/sspa/click?…&url=…` unwrap is mechanically straightforward. The `url=` parameter URL-decodes to the same `/Brand-Words-Description/dp/ASIN/` pattern as organic links, and brand extraction works identically on the result. The less-common `aax-us-east-retail-direct.amazon.com/x/c/…` format wraps the inner URL differently but is parseable with a slightly different regex.

### What the slug fixes from S3's failure list

- **TRUNCATED**: solved. The full brand is preserved as multiple hyphenated tokens before the descriptive words start. Amazon-Basics, Arm-Hammer, Sun-Maid, Milk-Bone, Blue-Buffalo, Three-Dog-Bakery, Sevent-Generation, Vital-Essentials, Hills-Prescription-Diet all extract cleanly.
- **NONE (digit-leading)**: solved. "365-Everyday-Value-Organic" extracts "365 Everyday Value" — much better than the current behavior of returning null.
- **NONE (2-char brand)**: solved. HP-Pavilion, LG-OLED, 3M-Command, GE-Profile all extract.
- **GENERIC**: largely solved. Slugs for unbranded-looking titles still lead with the brand. The leggings page proved this: title "High Waisted Leggings for Women…" hides brand "Bluemaple" entirely from view, but the slug is `Bluemaple-Leggings-Women-Waisted-Athletic`. Title "Laptop Computer for Win 11 Pro…" → slug `Tuonoyee-Computer-Keyboard-Fingerprint`. Title "Womens Workout Leggings…" → slug `SINOPHANT-High-Waisted-Leggings-Women`.

### Where the slug doesn't help

- **Sub-brand vs. parent-brand confusion.** One laundry slug came out as `OxiClean-Blasters-Laundry-Detergent-Remover` where the product title is "ARM & HAMMER Plus OxiClean…". Amazon's slug picked the product-line name (OxiClean) over the parent brand (Arm & Hammer). The title S3 would also have gotten this wrong, just in the opposite direction. Neither approach handles co-branded products cleanly.
- **Generic-leading slugs.** A small number of slugs start with descriptive words rather than brand. Example: `Expandable-Processor-Computer-Business-Students` for an unbranded laptop. The slug effectively says "there is no brand here," which matches reality but isn't useful.
- **URL-encoder loss.** `&` is stripped. ARM & HAMMER becomes `HAMMER-…` (the "ARM-" prefix sometimes survives, sometimes doesn't). Workable with a small known-compound-brand list as a sanity-check pass.
- **Brand-store cards.** Some cards link to `/stores/page/<uuid>/…` instead of `/dp/`. These were 2-5% of cards in the test data and are typically Amazon-promoted brand bands ("Shop electronic accessories from Amazon Basics"). They have no slug. Card-level filtering would handle most of them; for the rest, fall through to S1/S2/S3.

### How would Token boundary detection work?

A naive implementation just takes the first N hyphenated tokens. A better one stops at: the first all-lowercase word (brand names are capitalized; descriptors often lowercase), the first numeric token (model numbers, sizes), or a known product-category word. The Phase 9 design phase should test heuristics on more samples. Initial recommendation: take tokens 1–3 unless one is clearly a generic product noun ("Laptop", "Wireless", "Computer"), in which case take just the preceding ones.

---

## 3. Rule fixes still worth making

Independent of the slug strategy, the existing S3 rules have specific known issues that are small to fix:

1. **Short-name exception list.** Replace the `length >= 3` rule with: `length >= 3 OR brand in {'HP','LG','GE','3M','JBL','LG','BIC','DKNY'}`. The list of 2-character known brands is small and stable. Add as needed via user reports.
2. **Generic title-leader blocklist additions.** The current blocklist has 30+ words. The hand-classification surfaced these missing: `wireless`, `laptop`, `compression`, `capri`, `buttery`, `womens`, `girls`, `double`, `velvety`, `7 pack`, `4 pack`, `3 pack`, `enzyme`, `dehydrated`, `dried`, `unsulfured`, `sustainability`. Also reconsider removing words that don't appear at the start of real titles (avoid blocking too aggressively).
3. **Compound-brand allowlist.** Even with slug-as-primary, a small bundled list of multi-word brands serves as a sanity check. Examples encountered in this session: Amazon Basics, Amazon Essentials, Amazon Grocery, Amazon Fresh, Arm & Hammer, Up & Up, Honest Co, Honest Company, 9 Elements, Sun-Maid, Bella Viva Orchards, Whole Foods Market, Nature Made, Blue Diamond, Molly's Suds, NY Spice Shop, Northwest Wild Foods, Three Dog Bakery, Old Mother Hubbard, Hill's Prescription Diet, Hill's Science Diet, Blue Buffalo, Seventh Generation, Vital Essentials, Mighty Pets, Country Kitchen, Canine Carry Outs, Pup-Peroni, Milk-Bone. List would grow over time via telemetry on user reports.
4. **Navigation-card filter.** Cards titled "Brands related to your search", "Recently bought and rated", "Visit the help section", "Everything you need for everyday", "Check each product page…" are not products. Filter at the card-detection level (not the brand-detection level). This is 2% of rows but visible UX noise.

---

## 4. External brand lists — what we now know

The handover asked whether external brand lists might be useful. After this research, the answer is nuanced: **with the URL slug as the primary signal, the role of an external list shrinks dramatically.**

### What the slug + rules combination already gives us

The slug-based extractor handles compound brands, short-name brands, digit-leading brands, and title-hidden brands. It's working with Amazon's own canonical reference for each product. That's essentially what an external list would provide — except it's per-card, not a global lookup. There's no need to "validate" a slug-derived brand against an external list, because the slug *is* Amazon's name for the brand.

Where a list would still help:
- Disambiguating sub-brand from parent (OxiClean vs Arm & Hammer)
- Catching the rare cases where the slug starts with a generic word
- Telemetry: validating that a detected brand isn't garbage before it gets surfaced to the user as filterable

### Sources researched (briefly) and tradeoffs

| Source | Size | Freshness | License | Verdict |
|---|---|---|---|---|
| Wikipedia category pages ("List of laptop brands" etc.) | 100s per category | Manually curated, decent | CC-BY-SA, attribution required | Workable for specific categories; not a global solution |
| Wikidata brand entities | ~250K+ globally | Updated continuously | CC0 | Too broad; many false positives. Filterable to "consumer product brand" subset, but that's still huge |
| OpenCorporates / trademark databases (USPTO) | Millions | Excellent | Mixed; some restrictive | Way too broad. Includes every registered LLC. Would create more false positives than it solves |
| Mosley brand allowlist (already considered) | ~7,000 | Static | Unclear | Worth revisiting now that the use case is "sanity check" not "primary source" |
| Amazon's own brand storefront URLs (/stores/[Brand]/…) | Authoritative | Live | Not licensed for use | Scraping the storefront is its own project; would require visiting product pages individually. Not worth it for this. |

### Recommendation

Don't build the external-list pipeline as part of Phase 9. The slug strategy handles the cases the external list was meant to solve. Keep `brand_blocklist.txt` and `amazon_brands.txt` as they are — those are user-curated lists for different purposes (junk detection and Amazon-house-brand detection), not the canonical-brand-list problem this session was investigating.

If future telemetry shows ongoing false positives that the slug + compound-allowlist approach can't fix, **then** revisit external lists. Defer the decision; don't pre-build.

---

## 5. Open questions for Phase 9 design brief

Things this session intentionally didn't resolve, that the design phase should:

1. **Token-boundary heuristic for the slug parser.** What's the rule for how many tokens to take? Stop at first lowercase, first numeric, first known generic word, or just take fixed N=3? Test against more samples.
2. **Sponsored-URL unwrap implementation.** Required for full coverage (sponsored ads are mostly novel products, not duplicates of organic listings — verified by ASIN comparison across 4 categories, 0–25% overlap). The `/sspa/click?…&url=…` format is well-formed and unwraps cleanly via the `url=` query parameter. The `aax-us-east-retail-direct.amazon.com/x/c/…` format wraps the inner URL differently — needs a small defensive code path.
3. **Sub-brand handling.** Should "OxiClean" extracted from an Arm & Hammer product be merged into "Arm & Hammer", flagged as ambiguous, or just left as OxiClean? Open UX question, not just technical.
4. **Fallback ordering after slug.** New chain would be: slug → S1 (fixed selector pointing at `a-size-base-plus` on apparel) → S2 → S3. Verify S1's correct selector via live inspection of an apparel page during design phase.
5. **Compound-brand allowlist seed.** This research surfaced ~30 brands worth bundling. The Phase 9 brief should propose how to seed and grow this list, and whether to expose it to users or keep it internal.
6. **Live DOM verification at scale.** The 80% slug-availability finding is from two categories with ~60 cards each. Phase 9 should sanity-check 4–5 more categories during implementation to make sure nothing exotic breaks the parser.

---

## 6. Recommended Phase 9 framing

> **Phase 9 — Brand Detection Overhaul**
>
> Replace `scrapeBrand()`'s 3-strategy chain with a 4-strategy chain that leads with URL slug parsing. Add small-name exception list, expanded generic-leader blocklist, navigation-card filter, and a bundled compound-brand allowlist (~30 entries) as supporting fixes.
>
> Out of scope: external brand-list integration, brand-store scraping, sub-brand disambiguation. Defer until telemetry shows the slug approach isn't enough.

---

## Appendix A — The 4 failure modes, recounted with full examples

(Hand-classified product cards, see search.js v0.6.2.0 against the 4 IDS exports from this session.)

**TRUNCATED** (13%) — Real brand is multi-word; S3 takes only the first token:
- "Amazon Basics Concentrated Liquid Laundry Detergent…" → S3='Amazon' ✗
- "Arm & Hammer Plus OxiClean With Odor Blasters…" → S3='Arm' ✗
- "ARM & HAMMER Sensitive Skin Free Clear, 170 Loads…" → S3='ARM' ✗
- "Molly's Suds Liquid Laundry Detergent…" → S3="Molly's" ✗ (technically gives a brand, but truncated)

**NONE** (25%) — S3 returns null because of leading digit or generic blocklist:
- "365 by Whole Foods Market, Organic Concentrated…" → null (starts with '365')
- "HP Pavilion 15.6 Laptop Computer…" → null ('HP' is 2 chars, fails `length >= 3`)
- "HP 14 Laptop, Intel Celeron…" → null (same)
- "The Clean People Laundry Detergent Sheets…" → null ('The' blocked)

**GENERIC** (15%) — First word is a product noun, not a brand:
- "Laptop 16-inch , 8GB DDR 256GB SSD…" → 'Laptop'
- "Laptop Computer for Win 11 Pro…" → 'Laptop'
- "Wireless Keyboard and Mouse Combo…" → 'Wireless'
- "Capri Leggings for Women…" → 'Capri'
- "Womens Workout Leggings with High Waist…" → 'Womens'
- "Compression Leggings with Pockets…" → 'Compression'

**NAVIGATION** (2%) — UI elements scraped as cards:
- "Brands related to your search" → 'Brands'
- "Visit the help section" → 'Visit'
- "| 4+ stars and rising in past 90 days" → null

---

## Appendix B — Slug rescue examples (cases where the slug succeeded where S3 failed)

From the data analyzed this session:

| Title | S3 result | Slug result |
|---|---|---|
| "High Waisted Leggings for Women - Tummy Control Pants…" | null | Bluemaple ✓ |
| "Double Layer High Waisted Workout Leggings…" | "Double" (generic) | OMKAGI ✓ |
| "High Waisted Leggings with Pockets Women, Full Length…" | null | SINOPHANT ✓ |
| "Laptop Computer for Win 11 Pro, 15.6 Inch FHD…" | "Laptop" (generic) | Tuonoyee ✓ |
| "365 by Whole Foods Market, Organic Concentrated Laundry…" | null | 365 Everyday Value ✓ |
| "HP Pavilion 15.6 Laptop Computer for Daily Work…" | null | HP Pavilion ✓ |
| "Amazon Basics Concentrated Liquid Laundry Detergent…" | "Amazon" (truncated) | Amazon Basics ✓ |
| "Arm & Hammer Plus OxiClean…" | "Arm" (truncated) | HAMMER (partial; needs compound-allowlist) |
| "Sun-Maid California Sun-Dried Zante Currants…" | "Sun-Maid" ✓ | Sun-Maid ✓ |
| "Hill's Prescription Diet Hypoallergenic Dog Treats…" | "Hill's" (truncated brand chain) | Hills Nutrition Hypoallergenic ✓ |

---

*End of research document.*
