# Changelog — Chat 58 (May 8, 2026)

## Files changed
- search.js: v0.6.1.64 → v0.6.1.65
- styles.css: updated Chat 58

---

## search.js changes

### Sort and Filters sections — remember collapsed state (v0.6.1.65)
`sortOpen` and `filtersOpen` now read from `localStorage` (`au-sort-open`, `au-filters-open`) on panel build. Default is expanded (`true`) when key is absent — first-time users see everything. On toggle click, new state is persisted to localStorage.

Collapsed divider labels:
- Sort collapsed: "Click to sort and load more pages"
- Sort expanded: "Sort" (unchanged)
- Filters collapsed: "Click to filter by price, delivery, brand, and more"
- Filters expanded: "Filters" (unchanged)

Initial chevron rotation and `.collapsed` class now applied on render when a section starts in the closed state.

### Sort chip — only shows when section is collapsed (v0.6.1.65)
The "Best value ↑" sort chip on the Sort divider previously showed at all times. Now hidden when Sort is expanded, visible when collapsed. Updates live when the section is toggled.

---

## styles.css changes

### Filter layout jank fix
`#ppu-amazon-brands-row`, `#ppu-brand-filter-row`, and `#ppu-delivery-filter-row` now share a consistent layout: `flex-direction:column`, uniform `14px` horizontal padding, tidy top/bottom spacing. Previously each was an independent `div` with inconsistent padding producing visual jank.

Delivery slider wrap no longer duplicates `flex-direction:column` (inherited from parent).

### Keyword input background
`#ppu-keyword` background changed from `#f9f9fc` to `#ffffff`. The grey background made the field look inactive/disabled.
