# Changelog — Chat 72 (May 15, 2026)

*Coding session (Sonnet 4.6). Phase 5 — Settings page. End of Phase 4+5 bundle.*

---

## search.js — v0.6.1.82 → v0.6.1.83

### Settings page (Phase 5)

- `userDefaults` module-scope object — holds 10 user-saved defaults with built-in fallbacks
- `loadUserDefaults(cb)` — reads `auDefault*` keys + `au_telemetry_enabled` from `chrome.storage.local`; wired into startup callback chain after `loadPanelMinimized`
- 11 new `chrome.storage.local` keys: `auDefaultSort`, `auDefaultPages`, `auDefaultMoveAdsToEnd`, `auDefaultMinRating`, `auDefaultMinReviews`, `auDefaultMoveAmazonBrands`, `auDefaultMoveUnrecognized`, `auDefaultHideSlowShipping`, `auDefaultSlowShippingDays`, `au_telemetry_enabled` (existing key, now wired to toggle), `auCardDensity` (existing key, now has UI in settings)
- Gear icon (⚙) added to expanded header; excluded from drag/dblclick zones
- "Settings" link added to panel footer
- `openSettings()` — hides content rows below header (not the whole controls-wrap), inserts `#ppu-settings-view`, swaps gear icon to back arrow, widens panel to 580px if narrower
- `closeSettings()` — removes settings view, restores content rows, swaps back to gear icon, re-renders
- Settings state does not persist across page reloads (always opens in results view)
- Four sections wired: §7.1 Defaults (sort, pages, ads-to-end, density), §7.2 Quality (rating, reviews), §7.3 Brand & shipping (Amazon brands, unrecognized, slow shipping + day select), §7.4 Privacy (telemetry)
- All controls: instant save on change; card density and ads-to-end apply to current view immediately
- Reset to defaults: two-click confirmation, 3-second revert, re-opens settings fresh on confirm
- Version display via `chrome.runtime.getManifest().version`
- `updateActiveIndicators()` comparisons swapped from hardcoded built-ins to `userDefaults.*` for: sort, pages, ads-to-end, minRating, minReviews, brandFilterActive, amazonBrandsDemoteActive, deliveryFilterActive

### Fresh search defaults

- Sort, minReviews, minRating, sponsoredMode, brandFilterActive, amazonBrandsDemoteActive, deliveryFilterActive, deliveryFilterDays now initialize from `userDefaults` on every panel load
- Session filter restore now only applies to true per-search overrides (keyword, price range, selectedUnit, srcFilter) — defaults-backed values no longer restored from session storage, so Settings changes apply on next page load or refresh

### Bug fixes

- **Pages not auto-loading:** Slider showed "4" but only page 1 was ever fetched — panel now auto-fetches `userDefaults.pages` pages on build, using same logic as slider change handler. Longstanding bug.
- **Resize pushing panel off-screen:** `fixedRight` clamped to `window.innerWidth - 4` on mousedown; resulting left clamped to `Math.max(0, ...)` — narrowing no longer pushes panel off-screen right edge.
- **Duplicate "Pages slider" comment** — removed.

---

## styles.css — updated Chat 72

- `#ppu-settings-btn`, `#ppu-settings-back` — gear/back button in header
- `#ppu-settings-link` — footer settings link
- `#ppu-settings-view` — settings view container
- `#ppu-settings-header`, `#ppu-settings-title` — settings header bar
- `.ppu-settings-section`, `.ppu-settings-reset-section` — section wrappers
- `.ppu-settings-section-label` — muted uppercase section headers
- `.ppu-settings-row`, `.ppu-settings-row-label`, `.ppu-settings-row-control` — control row grid layout
- `.ppu-settings-hint` — muted copy line below controls
- `.ppu-set-toggle`, `.ppu-set-toggle-knob` — toggle switch
- `.ppu-set-radio-group`, `.ppu-set-radio-label` — density radio buttons
- `.ppu-set-shipping-days-wrap` — shipping days sub-row (hidden when toggle is off)
- `.ppu-set-reset-btn` — reset button
- `.ppu-settings-version` — version string

---

## Files touched this session

- `content/search.js` — v0.6.1.82 → v0.6.1.83
- `content/styles.css` — updated
- All other files unchanged

---

*End of changelog entry.*
