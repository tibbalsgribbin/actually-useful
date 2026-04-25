# Actually Useful — Changelog

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## **v0.6.1.20 — April 24, 2026 (Chat 30)**

### Pages slider clipping fixed (search.js)
- `setupCollapsible` rewritten to use `maxHeight: none` when open instead of `scrollHeight` measurement
- Previous approach locked `maxHeight` at build-time `scrollHeight`, which was measured before the slider fully rendered — causing the slider row to be clipped after page 2 loaded
- Sections now snap open/closed (no animation) — smooth animation deferred to post-alpha if desired

### Ko-fi nudge removed (search.js)
- All `maybeShowNudge()` call sites removed: checkbox handler, pages slider `loadNext` completion, load-more button completion, keyword input handler
- `maybeShowNudge()` function definition left as dead code — nudge infrastructure in core.js untouched
- Nudge redesign added to roadmap for post-alpha consideration

### Rating/review count restored to row display (search.js)
- Rating and review count were scraped correctly but never rendered in the panel listing
- Now displays below delivery info: e.g. `4.5★ (1,234 reviews)`
- Only renders when at least one of rating/reviewCount is present for a result

---

## **v0.6.1.19 — April 22, 2026 (Chat 27)**

### Pages slider always visible (search.js)
- Pages row now always renders on panel build — no longer conditional on `nextPageUrl` at build time
- When more pages are available: slider enabled, label shows "Pages to load: N"
- When all pages are loaded or only one page exists: slider disabled, label shows "No more pages available"
- `updateLoadMoreRow` updated to manage slider disabled state and label text instead of row visibility
- Fixes intermittent disappearance caused by pagination DOM element not yet present when `buildPanel()` fired

---

## **v0.6.1.18 — April 22, 2026 (Chat 27)**

### Pages slider show/hide fix — partial (search.js)
- `updateLoadMoreRow` updated to control visibility of `ppu-pages-row`
- Superseded by v0.6.1.19 which takes a more complete approach

---

## **index.html — April 22, 2026 (Chat 27)**

### Content updates
- Shortlist feature blurb rewritten — leads with comparison table, sortable/filterable/shareable, collaborative resharing angle ("Add notes, send the link, and the other person can filter and add their own notes and share again")
- Affiliate disclaimer added below footer
- Feedback form URL corrected to forms.gle/XU8RpYM3cGFTwQQ86 (was incorrect URL)

### Chrome Web Store
- Submitted for review — unlisted, US, free, April 22, 2026

---

## **v0.6.1.17 — April 22, 2026 (Chat 26)**

### Delivery time fixed on compare.html (search.js, compare.html)
- `freeWindowMinutes` added to compare payload — carries the "by X PM" time window scraped from Amazon
- `formatDeliveryDate` in compare.html rewritten to use `freeWindowMinutes` directly instead of reading hours from `freeDateTs` (which was always midnight → always showed wrong time)
- Same-day free delivery now shows correctly, e.g. "Apr 22 by 5 PM"
- Fast delivery unchanged — no window to show, displays date only
- Only applies to comparisons created after this version; old Supabase rows show date without time (acceptable)

---

## **v0.6.1.16 — April 22, 2026 (Chat 26)**

### Notes field reworked — link/preview pattern (search.js)
- Replaced always-visible textarea with a compact note widget
- Checked row shows small "＋ Add a note…" link (muted, unobtrusive)
- Clicking link opens textarea, focused and ready to type
- Clicking away collapses: if empty → link again; if text → italic preview (truncated at 80 chars) + "Edit" link
- Clicking "Edit" reopens textarea with full text
- Three helper functions added: `auInjectNoteWidget`, `auRefreshNoteWidget`, `auShowNoteTextarea`
- Unchecking a row removes the widget and preserves the note in memory

### imgUrl added to compare payload (search.js)
- Thumbnails now populate on compare.html for comparisons created after this version

---

## **v0.6.1.15 — April 21, 2026 (Chat 25)**

### Notes field added (search.js)
- Per-item textarea appears when an item is checked in the extension panel
- Notes persist through re-renders and re-sorts (stored in memory by ASIN)
- Clicking inside the textarea does not toggle the checkbox
- Note text travels to compare.html via the compare payload

### Compare payload expanded (search.js)
- `listPrice` (raw float) added — enables two-line coupon display on compare.html
- `note` (string) added — user-entered note per item

### Price range filter added (search.js)
- Min $ / Max $ number inputs in the Filters section
- Items outside the range are hidden (`.price-hidden` class)
- Excluded from best-value calculation
- Count shown in footer: "N outside price range"
- Cleared by Start over button
- Persists within session via `saveFilters` / `loadFilters`
- CSS for new inputs and notes textarea injected inline on panel build

### Compare table updated (compare.html)
- **Notes column** — shows note text in italic; not sortable
- **Coupon display** — two lines when coupon price present: price with coupon, then strikethrough original price
- **Delivery times** — same-day items show time appended to date (e.g. "Apr 21 by 9:00 pm"), derived from `freeDateTs`/`fastDateTs` timestamps
- **Liquid unit toggle** — "Liquid units: As listed / fl oz / ml" appears above table when any item has a liquid unit; toggles re-normalize all liquid PPUs and recalculate best-value star; `findBestPpuIndices` updated to normalize liquids to fl oz for fair comparison regardless of toggle state

---

## **v0.6.1.14 — April 21, 2026 (Chat 23)**

### Compare payload expanded (search.js)
- `freeDateTs` and `fastDateTs` (epoch ms) added — enables time-precise delivery sort on compare.html
- `searchUrl` added — enables clickable "Amazon search" link in compare.html meta bar

### Compare table and filters fixed (compare.html)
- **Coupon sort fixed** — was alphabetizing strings; now sorts by whether item has any promo (hasCoupon / sns / savings / couponPillOnly); couponed items sort to top on ascending click
- **Delivery sort fixed** — was doing string comparison on formatted dates; now uses `freeDateTs`/`fastDateTs` timestamps for precise date+time sort; items with no delivery date sort last
- **Search term badge updated** — now reads "Amazon search: [term]" with the term as a clickable link back to Amazon results (new comparisons only; old Supabase rows lack `searchUrl`)
- **Keyword focus fixed** — keyword input now calls `rerenderTableOnly()` which replaces only `#meta-and-table`, leaving filter bar DOM untouched; was destroying and recreating the input on every debounce tick, dropping focus mid-type
- **Price range filter added** — Min price ($) and Max price ($) number inputs in filter bar; applied in `applyFilters()`; cleared by Clear filters button

---

## **v0.6.1.13 — April 21, 2026 (Chat 22)**

### Compare payload expanded (search.js)
- `isPrime` boolean added — detected from result card DOM at click time
- `isSponsored` boolean added — already detected, now promoted to payload
- Coupon fields split: `hasCoupon`, `couponPillOnly`, `sns`, `savings` sent separately (previously collapsed into one string)
- Delivery fields split: `freeDate`, `fastDate`, `freeQualifier` sent separately (previously one formatted string)
- `retailerKey` added — retailer key string (e.g. `whole-foods`, `fresh`, `standard`)

### Compare table updated (compare.html)
- Removed three permanently-blank columns: Sold by, Ships from, Returns (product.js still disabled)
- Added Source column — shows retailer pill for non-standard sources; plain "Amazon" for standard
- Prime column now reads `isPrime` correctly
- Coupon column now shows specific detail: coupon with was-price, S&S amount, savings text, or "check Amazon"
- Delivery column now shows both free and fastest dates when both are present, with qualifier
- Sponsored items show an "Ad" badge in the product title cell

### Filter bar added (compare.html)
- Collapsible filter bar above the table, expanded by default
- Keyword filter — include/exclude syntax, 250ms debounce, same as extension
- Min reviews number input
- Source/retailer dropdown — only shown when multiple sources present in loaded data
- Hide sponsored toggle — only shown when sponsored items are present
- Clear filters button — resets all filters and sort
- Column sort via header clicks still works and respects active filters
- Hidden item count shown in meta bar when filters are active

---

## **v0.6.1.12 — April 21, 2026 (Chat 21)**

### Supabase compare — no item limit (search.js, compare.html)
- Compare button now POSTs shortlist to Supabase and opens compare.html?id=xxx
- Removes all URL length constraints — tested successfully with 50 items
- Button shows "Opening…" while POST is in flight
- On Supabase failure: error message in shortlist bar for 4 seconds, then resets
- Old ?data= Base64 URL encoding removed from click handler
- ?data= fallback path preserved in compare.html for existing shared links

### Error states (compare.html)
- renderError() split into two distinct states:
  - No params at all → "Nothing to compare yet" (install/learn more message)
  - Had ?id= or ?data= but load failed → "Couldn't load this comparison" with advice to go back to extension

### Lavender Fields palette (styles.css, index.html, compare.html)
- Full retheme of extension panel and website
- Orchid header, gold shortlist/footer bars, pale yellow backgrounds, white inputs only
- Note: live result on extension was not satisfactory — palette redesign pending

---

## **v0.6.1.11 — April 21, 2026 (Chat 20)**

### Keyword filter bug fixed (search.js)
- `kwDebounceTimer` was used but never declared — render() wasn't firing on keystrokes
- Fix: `var kwDebounceTimer = null;` added to state block

### Chrome Web Store prep (index.html, privacy.html — new file)
- privacy.html created
- index.html footer updated — Privacy link added
- Store descriptions written, developer account created

---

## **v0.6.1.10 — April 20, 2026 (Chat 19)**
### Feedback form pre-fill · Affiliate note reordered

## **v0.6.1.9 — April 20, 2026 (Chat 18)**
### Supabase shareable links · Best-value tie handling

## **v0.6.1.8 — April 20, 2026 (Chat 17)**
### Compare button · Gmail select-all · NaN fix

## **v0.6.1.7 — April 20, 2026 (Chat 16)**
### compare.html phase 1

## **v0.6.1.6 — April 20, 2026 (Chat 15)**
### Manifest warning · Landing page · Feedback form

## **v0.6.1.5 — April 19, 2026 (Chat 14)**
### Ko-fi fix · Page-fetch throttling · auSendLog → background.js · Telemetry opt-out

## **v0.6.1.4 — April 19, 2026 (Chat 13)**
### Rating filter · product.js disabled · Affiliate tag removed · Show Selected rework

## **v0.6.1.3 — April 19, 2026 (Chat 12)**
### Collapse bug · Version strings aligned · docs/ folder

## **v6.1.3 — April 18, 2026 (Chat 9)**
### Panel height resize · Persistent filter settings · Re-scan

## **v6.1.2 — April 18, 2026 (Chats 7–8)**
### Select-all rework · Shortlist bar · System font · Debouncing · Empty state

## **v6.1.1 — April 17, 2026 (Chat 5)**
### Collapsible sections · Footer · Keyword hint

## **v6.1.1 — April 16, 2026 (Chat 4)**
### Panel layout · Collapsible filters · Shortlist bar

## **v6.1.0 — April 14, 2026**
### Full visual redesign · Sliders · Sponsored button · Footer · Logging · Error panel

## **v6.0.x — March/April 2026**
*(Full history in archive-roadmap-history.md)*
