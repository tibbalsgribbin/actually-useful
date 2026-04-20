# Actually Useful — Changelog

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## **v0.6.1.8 — April 20, 2026 (Chat 17)**

### Compare button (search.js)
- Added "Compare selected items in new tab" button to shortlist bar
- Replaces "Open in new tabs" entirely — compare page is the better version of that feature
- Hidden until ≥1 item is checked; encodes shortlist as Base64 JSON and opens compare.html
- Item object sent: `{ asin, title, price (raw number), ppu (raw number), ppuUnit, delivery, rating, reviewCount, coupon }`
- Coupon field: "Coupon" / "Coupon (check Amazon)" / "Subscribe & Save" / savings string

### Gmail-style select-all dropdown (search.js, styles.css)
- Replaced checkbox + "Select all" label with visual checkbox span + `▾` dropdown arrow
- Dropdown options: All · None
- Checkbox reflects state: empty / `–` indeterminate / `✓` filled orange
- Clicking the box: none→all, any→none
- "Clear selection" button removed — "None" in dropdown replaces it
- "Show selected only" button removed — Compare page replaces that workflow
- `showCheckedOnly` variable and all dependent logic removed

### Shortlist bar visual hierarchy (styles.css)
- "Select items to compare them." hint: 13px, black, bold — dominant element
- Select-all control: smaller, grey — secondary
- All action buttons use base `.ppu-btn` — consistent plain appearance
- Removed custom `#ppu-btn-compare` ID style (redundant with `.ppu-btn`)

### compare.html price/PPU NaN fix (search.js, compare.html)
- Root cause: search.js was sending pre-formatted strings ("$12.99"); compare.html expected raw numbers
- Fix: search.js now sends raw floats; compare.html has null/NaN guard on price cell
- PPU formatting in compare.html now matches extension precision (3 decimal places for values < $0.10)

---

## **v0.6.1.7 — April 20, 2026 (Chat 16)**

### compare.html — Actually Useful Comparisons page (phase 1)
- New file, placed in repo root alongside index.html
- Reads shortlist data from `?data=` URL parameter (Base64-encoded JSON)
- Accepts `{ items: [...], searchTerm: "..." }` or a bare array
- Columns: Product · Price · Per unit · Delivery · Rating · Reviews · Prime · Coupon/promo · Sold by · Ships from · Returns · Your note
- Best-value star (★) on lowest PPU item, matching extension behaviour
- Every column header sortable ascending/descending
- Each product title links to `amazon.com/dp/[ASIN]?tag=PLACEHOLDER-20`
- Empty/error state (no data, bad data, or empty array): friendly explanation with links to landing page and GitHub
- Matches landing page style: cream/navy/teal palette, DM Serif Display + DM Sans
- Affiliate disclaimer: "As an Amazon Associate I earn from qualifying purchases. Links on this page support Actually Useful — and don't cost you anything extra."

### Affiliate disclaimer wording
- Corrected from informal copy to required Amazon Associates Operating Agreement wording
- Standing rule established: this disclaimer goes on every page going forward

---

## **v0.6.1.6 — April 20, 2026 (Chat 15)**

### Manifest warning fixed (manifest.json)
- Deleted `_content_scripts_product_disabled` block entirely
- Eliminates the "Unrecognized manifest key" warning in Edge
- product.js remains disabled — the entry is simply gone rather than renamed

### Landing page (index.html)
- Full landing page built and deployed to GitHub Pages
- Live at `https://tibbalsgribbin.github.io/actually-useful/`
- Sections: hero, four pillars, Why it exists, feature grid (9 features), Ko-fi support, footer
- Design: cream/navy/teal palette, DM Serif Display + DM Sans, responsive down to mobile
- Nav links: How it works, Support, GitHub
- Footer links: GitHub, Give feedback, Ko-fi
- Copy uses Melissa's exact wording for the four pillars and tagline
- "Currently in alpha testing." note in hero

### Feedback form verified
- All three required alpha questions confirmed present

---

## **v0.6.1.5 — April 19, 2026 (Chat 14)**

### Ko-fi link fixed (search.js)
### Page-fetch throttling (search.js)
### `auSendLog` moved to background.js (core.js, background.js, search.js)
### Telemetry opt-out toggle (popup.html, popup.js, background.js, manifest.json)
### Frequently Returned badge — deferred indefinitely

---

## **v0.6.1.4 — April 19, 2026 (Chat 13)**

### Minimum rating filter fixed (search.js)
### product.js disabled in manifest (manifest.json)
### Affiliate tag machinery removed (core.js)
### Show Selected / Clear Selection rework (search.js)

---

## **v0.6.1.3 — April 19, 2026 (Chat 12)**

### Collapse/minimize bug fix (search.js)
### Version strings aligned across all four files
### docs/ folder added to GitHub

---

## **v6.1.3 — April 18, 2026 (Chat 9)**
### Panel height resize, persistent filter settings, Re-scan page

## **v6.1.2 — April 18, 2026 (Chats 7–8)**
### Select-all rework, shortlist bar always visible, system font, debouncing, empty state

## **v6.1.1 — April 17, 2026 (Chat 5)**
### Collapsible sections, footer repositioned, keyword hint text

## **v6.1.1 — April 16, 2026 (Chat 4)**
### Panel layout restructured, collapsible filters, shortlist bar

## **v6.1.0 — April 14, 2026**
### Full visual redesign, sliders, sponsored button, footer, logging, error panel

## **v6.0.x — March/April 2026**
*(Full history in archive-roadmap-history.md)*
