## Chat 52 — May 7, 2026

*Brand filter Session 4 — delivery window filter. Two search.js versions shipped (v0.6.1.54 → v0.6.1.55). styles.css updated. core.js AU_VERSION bumped to 0.6.1.53.*

### AU_VERSION bumped in core.js (v0.6.1.53)

Was stale at 0.6.1.46 since Chat 46.

### Delivery window filter — implemented (v0.6.1.54)

"Hide slow shipping" checkbox in Filters collapsible, below the brand filter row. When checked, a row of preset day buttons appears (2 / 3 / 5 / 7 / 10 / 14 / 21; default 7). Active preset is highlighted. Label reads "Arriving within N days" and updates as presets are clicked.

Filter uses `r.freeDate || r.fastDate` (Date objects on allData items). Items with no delivery date are exempt — they pass through unchanged. Hide-only: no demote option. Filtered items get `delivery-hidden` class (`display:none!important`).

Info line shows "N slow-shipping hidden" when active. Best-value star excludes delivery-hidden items. Reset Filters clears the delivery filter. State persists in sessionStorage per search term.

Three logging fields added to doLog(): `deliveryFilterActive`, `deliveryFilterMaxDays`, `deliveryCountFiltered`. Sheet column count is now 61 actual (header row update still pending).

### Bug fix — delivery filter not hiding anything (v0.6.1.55)

Initial build read `r.freeDateTs` / `r.fastDateTs`, which only exist on the compare payload object, not on allData items. allData items carry `r.freeDate` / `r.fastDate` as Date objects. Fixed in all three places: `deliveryHiddenCt` calculation, per-item `deliveryHid` flag, and doLog count.

### Brand row copy fix (v0.6.1.55)

"Always show or hide listings from this brand:" label removed from the per-card brand action row. Row now reads: "[BrandName]: [Always show] [Always hide]" — brand name is self-explanatory.
