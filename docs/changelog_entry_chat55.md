## Chat 55 — May 7, 2026

*compare.html sync session. No extension file changes. compare.html updated with brand column, brand/delivery filters, resizable columns, sticky header, sticky scrollbar, cell wrapping, reduced padding. Website data/ folder added.*

### compare.html — brand column
Brand name added as a toggleable table column (Show Columns). Displays `item.brand` from the payload, filtered through `isBrandNoise()` to reject scraping artifacts (purchase metadata, "List:", strings over 40 chars or 5+ words). Shows dash when brand is null or noisy.

### compare.html — brand filters
Two new filter bar checkboxes: "Hide unrecognized brands" (heuristic detector ported from search.js) and "Hide Amazon brands" (checks against fetched amazon_brands.txt). Both use `effectiveBrand` — brand strings that pass `isBrandNoise()` only. Clear filters resets both.

### compare.html — brand list fetching
`fetchBrandList()` fetches `brand_blocklist.txt` and `amazon_brands.txt` from `actuallyuseful.net/data/` at init. Parallel fetch, fail-open — page renders regardless of fetch result.

### compare.html — delivery window filter
"Hide slow shipping" checkbox + day presets (2/3/5/7/10/14/21d), default 7. Hide-only. Items with no delivery date are exempt. Clear filters resets. Same pattern as search.js panel.

### compare.html — resizable columns
Drag handle on right edge of each column header. Cursor changes on hover. Min width 40px. Works in all columns.

### compare.html — cell text wrapping
`td` gains `overflow-wrap: break-word`, `word-break: break-word`, `max-width: 0`. Removes `white-space: nowrap` from col-price, col-ppu, col-reviews, col-brand. col-rating retains nowrap. Fixes content preventing column resize.

### compare.html — sticky header
`.table-wrapper` gains `overflow-y: auto` and `max-height: 80vh`. thead `position: sticky; top: 0` now works correctly within the scroll container.

### compare.html — sticky horizontal scrollbar
Mirror div (`#scroll-mirror-wrapper`) sits below the table wrapper, `position: sticky; bottom: 0`. Syncs bidirectionally with table scroll. Always visible regardless of scroll position. Present in both `renderTable` and `rerenderTableOnly`.

### compare.html — reduced padding + wider max-width
`main` padding reduced from `2rem 1.5rem` to `1.25rem 0.5rem`. max-width widened from 1400px to 1600px.

### Website — data/ folder
`data/brand_blocklist.txt` and `data/amazon_brands.txt` added to repo root. Mirror extension/data/ copies exactly. **Standing rule: both copies must be updated concurrently.**

### Known issue surfaced
Brand column blank for electronics/keyboards — search.js scrapeBrand() first-word fallback grabs purchase metadata when no brand byline exists on card. isBrandNoise() correctly rejects these, leaving column blank. Root fix deferred to search.js session.
