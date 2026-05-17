# Changelog — Chat 81

*May 16, 2026*

*Opus session. Brand detection research. No code changes.*

---

## Delivered

- **Brand_Detection_Research.md** — research document analyzing current `scrapeBrand()` failure modes and proposing a new strategy. Lands as input to Phase 9 design brief.

## Key findings

- Current 3-strategy fallback chain (`scrapeBrand()` in search.js) is effectively running on Strategy 3 (first-word-of-title) alone. S1's selector targets review-count badges, not brand bylines. S2's selector rarely fires on search results.
- Across 159 hand-classified product cards from 4 categories: S3 correctly detects brand 46% of the time. The other 54% breaks down into TRUNCATED (13%), GENERIC (15%), NONE (25%), and NAVIGATION (2%) failures.
- Apparel is the only major category with a separate brand byline element. Beauty/cosmetics, electronics, household, food, supplements all rely on brand-embedded-in-title.

## Key recommendation

- New primary strategy: **parse brand from the product URL slug** (`amazon.com/[Slug-With-Hyphens]/dp/[ASIN]/…`). Solves compound-brand truncation (Amazon Basics, Arm & Hammer), short-name brands (HP, LG, 3M), digit-leading brands (365, 9 Elements), and rescues GENERIC cases where the title hides the brand.
- Sponsored URL unwrapping is required (not optional) — sponsored ads are mostly novel products (0–25% overlap with organic results in the test data), so the brand needs to be extracted from `/sspa/click?…&url=…` redirects.
- External brand-list integration is no longer recommended for Phase 9. The slug approach handles the cases the external list was meant to solve.

## Supporting fixes (still useful, lower priority)

- Short-name brand exception list (HP, LG, 3M, JBL, GE, BIC, DKNY)
- Expanded generic-leader blocklist (wireless, laptop, capri, womens, etc.)
- Bundled compound-brand allowlist (~30 entries seeded in the research doc)
- Navigation-card filter (reject cards titled "Brands related to your search", "Visit the help section", etc.)

## Files unchanged

- search.js — no edits this session
- All other code files — no edits
- manifest.json — no version bump

## Sequencing

Brand research lands. Next session (Opus, fresh chat): **Notes design**. After that: **Phase 8 kickoff brief** (compare.html structural pass). Brand work itself lands as **Phase 9** after Phase 8 completes.

---

*End of Chat 81 changelog.*
