# Handover — May 7, 2026 (Chat 55)

## Session type
compare.html sync session. No search.js changes. compare.html updated with brand column, brand filters, delivery filter, resizable columns, sticky scrollbar, sticky header, reduced padding, and brand noise filtering. No version bump to search.js or other extension files.

## Current versions
- manifest: 0.6.1 (unchanged)
- search.js: v0.6.1.62 (unchanged)
- core.js: v0.6.1.53 (unchanged)
- compare.html: updated this session (no internal version string — track by Chat 55)
- background.js: v0.6.1.16 (unchanged)
- styles.css: unchanged
- index.html: unchanged
- killswitch.json: disabled:false

---

## What this session covered

### compare.html — brand column + brand filters
- `brand` field (already in payload since v0.6.1.48) now displayed as a table column
- Column togglable via Show Columns button
- `isBrandNoise()` helper rejects scraping artifacts: strings containing "bought", "month", "List:", starting with digits, over 40 chars, or 5+ words
- `detectGibberishBrand()` ported from search.js — runs heuristics client-side
- `isAmazonBrand()` added — checks against fetched amazon_brands.txt
- Both bundled lists fetched at init from `actuallyuseful.net/data/` (parallel, fail-open)
- Filter bar: "Hide unrecognized brands" checkbox, "Hide Amazon brands" checkbox
- Clear filters resets both

### compare.html — delivery window filter
- "Hide slow shipping" checkbox + day presets (2/3/5/7/10/14/21), default 7
- Same pattern as search.js panel
- Clear filters resets delivery filter too

### compare.html — resizable columns
- Drag handle on each column header right edge
- Cursor changes on hover; columns can be dragged to any width (min 40px)
- Works correctly now that cell wrapping is enforced

### compare.html — cell text wrapping
- `td` gains `overflow-wrap: break-word`, `word-break: break-word`, `max-width: 0`
- `white-space: nowrap` removed from col-price, col-ppu, col-reviews, col-brand
- col-rating keeps nowrap (star characters)
- Fixes: content no longer prevents column resize

### compare.html — sticky header
- `.table-wrapper` gains `overflow-y: auto` and `max-height: 80vh`
- `thead { position: sticky; top: 0 }` now works correctly because scroll context is the wrapper

### compare.html — sticky horizontal scrollbar
- Mirror div below table wrapper; syncs scroll bidirectionally
- Sits at bottom of viewport (`position: sticky; bottom: 0`) — always visible
- Updated in both `renderTable` and `rerenderTableOnly`

### compare.html — reduced padding + wider max-width
- `main` padding: `2rem 1.5rem` → `1.25rem 0.5rem`
- max-width: `1400px` → `1600px`

### Website data files
- `data/brand_blocklist.txt` and `data/amazon_brands.txt` added to repo root `data/` folder
- These mirror `extension/data/` copies exactly
- **Working rule added:** both copies must be updated concurrently whenever lists change

---

## Known issue surfaced this session
- **Brand column blank for electronics/keyboards** — search.js `scrapeBrand()` first-word-of-title fallback is grabbing purchase metadata ("50+ bought in past month", "List:") instead of the brand name when no explicit brand byline exists on the card. compare.html's `isBrandNoise()` correctly rejects these, leaving the column blank. Root fix is in search.js — tighten the fallback scraper. Deferred to a future session.

---

## Files produced this session
- compare.html — place at repo root
- data/brand_blocklist.txt — place at `data/brand_blocklist.txt` in repo root (new folder)
- data/amazon_brands.txt — place at `data/amazon_brands.txt` in repo root (new folder)

Note: brand_blocklist.txt and amazon_brands.txt are identical to the copies in extension/data/. Create the repo root data/ folder and copy them in.

---

## Known issues (carried forward)
1. Multi-pack weight PPU wrong — needs design session
2. Contact lens solution liquid PPU unreliable
3. Cotton swabs extractCount grabbing pack count
4. Razor blade $0.1/ct outlier
5. Cardstock "1 Pack (250 Sheets)" extractCount ordering
6. Pairs ambiguity — interim note only
7. FSA/HSA, Climate Pledge, Small Business — not yet verified on live searches
8. Auto-resort on Re-sync page-add — not verified
9. Blue/indigo palette inconsistency — post-alpha
10. No selector resilience — broader codebase still fragile
11. No self-test mode
12. No welcome page on install
13. compare.html logging — not yet implemented (priority #1 next session)
14. Brand filter mixed-case invented names — accepted gap
15. Duplicate "Pages slider" comment in search.js — cosmetic only
16. Outlier PPU units (lb, ft) sorting to top as best value — needs design session
17. Brand column blank for electronics — search.js scrapeBrand() fallback grabbing purchase metadata; needs search.js fix

---

## Next session priorities (in order)

1. **compare.html logging** — direct fetch to Google Sheets endpoint
2. **search.js scrapeBrand() fix** — first-word fallback grabbing purchase metadata instead of brand name for electronics categories
3. **Welcome page on install** — chrome.runtime.onInstalled
4. **Fix extractCount "1 Pack (250 Sheets)"**
5. **Verify auto-resort fires on Re-sync page-add**

---

## Key reminders
- Code files NOT in Claude Project — upload fresh from GitHub each coding session
- Files must be actual uploads, not document blocks
- compare.html JS uses string concatenation, not template literals
- core.js uses callback pattern, not Promises
- Affiliate tags on website only — never in extension
- search.js sends raw numbers to compare.html — compare.html handles formatting
- note = user note; ppuNote = AU inference note — never conflated
- All Google tasks: butactuallyuseful Chrome profile
- Confirm scope before touching any files
- Use AskUserQuestion widget
- All extension text must be selectable
- Rollback rule: 3 failed attempts = stop, revert
- Always provide commit message with GitHub push
- Don't touch weight unit logic without design session
- One agent at a time — Claude only
- Produce complete document files at end of session — not snippets
- brand_blocklist.txt and amazon_brands.txt must be updated concurrently in extension/data/ AND repo root data/

---

## Start of next session
1. Confirm what Melissa wants to work on
2. If compare.html work: upload compare.html fresh from GitHub
3. If search.js work: upload search.js v0.6.1.62 fresh from GitHub
4. Confirm scope before touching any files
