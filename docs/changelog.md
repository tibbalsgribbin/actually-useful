# Actually Useful — Changelog

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## **v0.6.1.5 — April 19, 2026 (Chat 14)**

### Ko-fi link fixed (search.js)
- Nudge was pointing to `ko-fi.com/tibbalsgribbin`; corrected to `ko-fi.com/butactuallyuseful`
- Footer link was already correct; only the nudge was wrong

### Page-fetch throttling (search.js)
- Added 750ms delay between sequential page fetches in the pages slider `loadNext` loop
- Reduces risk of Amazon rate-limiting rapid credentialed requests
- Single-page load-more button unaffected (one request per click, no sequential chain)

### `auSendLog` moved to background.js (core.js, background.js, search.js)
- `AU_LOG_URL` and `auSendLog()` removed from `core.js`; replaced with explanatory comment
- `sendLog()` in `search.js` now assembles the payload and sends via `chrome.runtime.sendMessage({ type: 'AU_LOG', payload })`
- `background.js` handles `AU_LOG` messages and fires the fetch from the service worker context, bypassing Amazon's CSP

### Telemetry opt-out toggle (popup.html, popup.js, background.js, manifest.json)
- New `popup.html` and `popup.js` — extension icon is now clickable
- Popup contains: telemetry toggle (default on), Give feedback link, Buy me a coffee link, version number
- Toggle persists preference to `chrome.storage.local` under key `au_telemetry_enabled`
- `AU_LOG` handler in `background.js` checks preference before firing fetch; `false` = skip, anything else (including unset) = send
- `manifest.json` updated with `"action": { "default_popup": "popup.html", "default_title": "Actually Useful" }`

### Frequently Returned badge — deferred indefinitely
- Confirmed badge only appears in the product page panel (product.js disabled during alpha)
- Removed from next-up list; no action needed until product.js is re-enabled

### Known manifest warning (pre-existing)
- `_content_scripts_product_disabled` key causes a cosmetic "Unrecognized manifest key" warning in Edge
- Pre-existing from Chat 13, harmless — extension loads and works correctly
- Fix before Web Store submission by deleting the block entirely

---

## **v0.6.1.4 — April 19, 2026 (Chat 13)**

### Minimum rating filter fixed (search.js)
- `r.rating` was never set in `scrapeCard()` — the slider existed and the filter logic existed, but no data flowed through
- Added `parseRating(el)` — scrapes `aria-label="X out of 5 stars"` from the card element
- Added `var rating=parseRating(el)` call in `scrapeCard()`, and `rating` added to the `base` object so all return paths carry it
- Rating filter now works correctly; info bar correctly reports "N below min rating"

### product.js disabled in manifest (manifest.json)
- Second `content_scripts` entry (matching `/dp/*`) moved to `_content_scripts_product_disabled`
- Browser ignores unknown manifest keys — product.js no longer runs on product pages
- Entry preserved (not deleted) for easy restoration when product page work resumes

### Affiliate tag machinery removed (core.js)
- `AU_AFFILIATE_TAG` constant and `auTagUrl()` function removed entirely
- No callers existed; removal eliminates the policy-violation risk before any public release
- Affiliate tags will be applied on the website only

### Show Selected / Clear Selection rework (search.js)
- Both buttons moved from Sort section to shortlist bar
- Shortlist bar order: Select all · Show selected only (N) · Clear selection · Open in new tabs (N)
- Both new buttons hidden by default; appear as soon as any item is checked
- "Show selected only (N)" → filters list to checked items, label becomes "Show all"
- "Show all" → returns to full list
- "Clear selection" → unchecks all, exits filtered view, buttons hide
- Known: show/hide of buttons is slightly jarring — noted, not worth fixing before shortlist bar gets rethought for website integration

---

## **v0.6.1.3 — April 19, 2026 (Chat 12)**

### Collapse/minimize bug fix (search.js)
- When the panel had been resized via the drag handle, clicking ⇕ was toggling between the resized height and whatever the CSS could manage — never collapsing to just the header
- Root cause: `applyPosition()` sets inline `style.height` and `style.maxHeight` when restoring a saved size; inline styles override CSS class rules, so the `.collapsed` rule (`max-height: 41px`) was losing
- Fix: collapse button now clears both inline height properties when collapsing, so the CSS rule takes effect; restores them from `au_search_panel_pos` in storage when expanding

### Version strings aligned (all four files)
- All version strings brought to the new sub-1.0 numbering scheme
- `manifest.json`: `6.1.2` → `0.6.1`
- `core.js` AU_VERSION: `6.1.2` → `0.6.1.3`
- `search.js` header comment: `v6.1.3` → `v0.6.1.3`
- `styles.css` header comment: `v6.1.0` → `v0.6.1.3`

### docs/ folder added to GitHub
- All ten project documents moved into `C:\Users\tibba\GitHub\actually-useful\docs\`
- GitHub is now the single source of truth for project documents

### Process
- Confirmed session rule: confirm scope before coding, not mid-diagnosis

---

## **v0.6.1.3 — April 19, 2026 (Chat 10)** *(planning session — no code changes)*

### Version numbering decision
- All version numbers shifted to sub-1.0 to signal pre-release status while preserving history
- v6.1.3 → **v0.6.1.3** (internal AU_VERSION); manifest uses three-part `0.6.1`
- Roadmap: v0.6.2, v0.7 … v0.9 (polished/stable) … v1.0 (Web Store public launch)

### Website architecture decided
- Platform: **GitHub Pages** (static, free, existing repo) + **Supabase** (free database for shareable links)
- Replaces Carrd plan entirely
- Pages planned: `index.html` (marketing), `compare.html` (comparison table), `search.html` (power search form)
- Shareable links confirmed as essential — implemented via Supabase short IDs
- Affiliate tags applied on website only — never in extension

### Price history approach decided
- Link to Keepa per item (`keepa.com/product/[ASIN]`) rather than CamelCamelCamel
- CamelCamelCamel injects their own affiliate tags — clicks through their site earn them the commission, not AU

### Review integrity approach decided
- Mild caution signal for statistically improbable ratings
- Contextual nudge to Fakespot / ReviewMeta on flagged items

### New feature batches added to roadmap
- **Hidden data capture batch:** SNAP eligible, Small Business badge, Condition, Amazon's Choice, Best Seller badge
- **Review integrity + price history batch:** caution signal, Fakespot nudge, Keepa link per card

---

## **v6.1.3 — April 18, 2026 (Chat 9)** *(panel height resize + persistent filters + Re-scan page)*

### Panel height resize (search.js, styles.css)
- Added bottom edge drag handle — drag anywhere along the bottom of the panel to resize height
- Min height: 200px. Max height: `window.innerHeight - 10px` from panel top
- Height saved to `au_search_panel_pos` alongside position and width

### Persistent filter settings (search.js)
- Filters saved to `sessionStorage` keyed by search term on every render
- Same search term → filters restore automatically on panel rebuild
- Different search term → all filters reset to defaults
- Uses `sessionStorage` (not `chrome.storage.local`) — intentionally session-scoped

### Re-scan page (search.js)
- "↺ Refresh" button renamed to "↺ Re-scan page"
- Loading state reads "Re-scanning…"
- Error fallback messages updated

### Working rule added
- If files come through as document blocks rather than file uploads, stop and ask Melissa to re-attach

---

## **v6.1.2 — April 18, 2026 (Chat 8)** *(select-all rework + shortlist bar always visible)*

### Select-all checkbox rework (search.js)
- Replaced three-branch logic with simple toggle: nothing checked → check all; anything checked → uncheck all
- Removed `confirm()` dialog and `indeterminate` state

### Shortlist bar always visible (search.js, styles.css)
- Shortlist bar now always visible at top of scroll area
- JS: removed show/hide logic; CSS: changed `#ppu-shortlist-bar` baseline from `display:none` to `display:flex`

---

## **v6.1.2 — April 18, 2026 (Chat 7)** *(polish items landed)*

### System font stack (styles.css)
- Replaced all 4 instances of `Arial, sans-serif` with system font stack

### Keyword debouncing (search.js)
- Added 250ms debounce to keyword input listener

### Empty state message (search.js + styles.css)
- When keyword filter matches zero results: *"No results match your keyword(s)"*

### Frequently Returned badge (styles.css)
- `.ppu-product-warning-fr` now has `font-weight:600`

### Shortlist bar visibility fix (search.js)
- Bar now appears immediately when any item is checked

### Project hygiene
- Code files removed from Claude Project; new session protocol: upload fresh from GitHub

---

## **v6.1.1 — April 17, 2026 (Chat 5)** *(UX refinements)*

### Collapsible Sort and Filters dividers (search.js, styles.css)
### Footer repositioned (search.js, styles.css)
### Keyword hint text added (search.js, styles.css)
### Start over button relocated (search.js, styles.css)
### Folder path reconciled

---

## **v6.1.1 — April 16, 2026 (Chat 4)** *(regression fixes + UI restructure)*

### Panel layout restructured
### Collapsible filters
### Dual slider row
### Shortlist bar
### Sponsored button wording updated

---

## **v6.1.0 — April 14, 2026**

- Full visual redesign: dark navy header, tactile buttons, section dividers, sliders
- Min reviews and min rating sliders
- Pages-to-load slider
- Sponsored button three-state mode
- Footer with feedback and Ko-fi links
- Source pills, thumbnails, nudge, usage logging, error panel

---

## **v6.0.x — March/April 2026**

*(Full history in archive-roadmap-history.md)*
