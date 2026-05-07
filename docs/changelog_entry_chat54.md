## Chat 54 — May 7, 2026

*UI polish session. No new features. Four search.js versions shipped (v0.6.1.60 → v0.6.1.62). styles.css updated. Apps Script updated to Version 3. Google Sheet header row updated to 63 columns.*

### v0.6.1.60 — Price input box sizing fix
Price input boxes reduced: font-size 13px → 11px, padding 3px 6px → 2px 4px, explicit height:22px added, box-sizing:border-box added. Width unchanged at 52px.

### v0.6.1.61 — Price range filter replaced with dual-handle slider
Two number input boxes replaced with a single dual-handle range slider. Bounds set dynamically from cheapest/most expensive item in current results. Low handle sets minPrice floor, high handle sets maxPrice ceiling. Dragging past the other handle clamps. Fill track between handles updates live. Label shows `$lo–$hi` when filter is active; blank when full range selected. minPrice/maxPrice variables unchanged — still stored as strings in sessionStorage. All existing filter logic (priceHid, persistFilters, dec bar, active count) unchanged. Stale ppu-min-price/ppu-max-price DOM references and their event listeners removed.

### v0.6.1.62 — Three UI polish changes
- **7-page warning removed** — "⚠️ Amazon sometimes limits results beyond 7 pages..." message removed from panel HTML and all JS show/hide logic cleaned up.
- **Demote divider labels converted to pills** — "N unrecognized brands moved to end" now renders as an amber pill (`#fef3c7` background, `#92400e` text, bold, rounded). "N Amazon brand items moved to end" renders as a blue pill (`#dbeafe` background, `#1e40af` text). The horizontal rule lines on either side of the old labels are gone. CSS updated in styles.css.
- **Active-filters dec-bar hides when Filters collapsed** — When the Filters section is collapsed, the decisions bar (active filter chips row) hides. It reappears when Filters is expanded. Initial state on panel build also respects the filtersOpen flag.

### Apps Script — updated to Version 3
All 63 fields now present. Two fields added vs Version 2: `amazonBrandsDemoteActive`, `amazonBrandsCountDemoted`. Deployed as new version.

### Google Sheet header row — updated to 63 columns
User Agent and Event columns corrected to their proper positions (after Session Source). All 17 new brand/delivery/Amazon brand columns added from AU onwards. Header row now fully in sync with what background.js logs.
