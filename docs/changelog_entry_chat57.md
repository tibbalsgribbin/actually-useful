# Changelog — Chat 57 (May 8, 2026)

## Files changed
- search.js: v0.6.1.63 → v0.6.1.64
- compare.html: updated Chat 57

---

## search.js changes

### scrapeBrand() Strategy 2 fix (v0.6.1.63)
Added `bought` and `sold` to the Strategy 2 exclusion regex. Strategy 2 was returning "6K+ bought in past month" as the brand for electronics cards because "bought" was not in the exclusion list. Fix: `!/deliver|rating|review|result|star|bought|sold/i.test(t2)`. Strategy 3 (first word of title) now correctly fires for electronics as the fallback.

Tested via console on keyboards and headphones searches. Confirmed Strategy 2 skips purchase metadata; Strategy 3 correctly returns brand name.

### Delivery scraper fix — combined free+fastest div (v0.6.1.63 → v0.6.1.64)
Amazon's delivery div for many items contains both free and fastest delivery text in a single node with two bold elements (e.g. "FREE delivery Wed, May 13Or fastest delivery Tomorrow, May 9"). The old scraper called `querySelector('.a-text-bold')` which returns only the first bold element, so `fastDate` received the same date as `freeDate`.

Fix: when a div contains both "free" and "fastest", use `boldEls[0]` for freeDate and `boldEls[1]` for fastDate. Single-date divs continue to use the original logic.

### High-noise banner — dismissible X (v0.6.1.64)
Added X dismiss button to the high-noise banner ("There is a lot of noise in these results..."). Button positioned absolute, upper right. Matches existing PPU interpretation banner pattern.

### PPU interpretation banner — X moved to upper right (v0.6.1.64)
The existing X dismiss on the PPU interpretation banner was not in the upper right. Changed banner layout from flex to position:relative with the X button absolutely positioned at top:5px, right:6px. Matches noise banner layout.

### Re-sync prompt — reload pages after re-sync (v0.6.1.64)
When Re-sync fires and the user had more than 1 page loaded, a prompt bar now appears directly below the pages/Re-sync row: "You had X pages loaded — reload all?" with Yes and No buttons. Yes triggers sequential page reloading using the same loadNext pattern as the pages slider. No dismisses the bar. Bar inserts into ppu-sort-collapsible after ppu-pages-row using a polling approach (checks every 100ms, up to 20 attempts) to wait for buildPanel() to complete.

---

## compare.html changes

### Delivery column split into Free delivery + Fastest delivery
The single "Delivery" column has been replaced with two separate columns: "Free delivery" and "Fastest delivery". Each column:
- Shows only its own date (no more combined FREE:/Fastest: display)
- Sorts on its own timestamp independently (nulls last)
- Is toggleable via Show Columns

Sort keys: `freeDelivery` (sorts on freeDateTs) and `fastDelivery` (sorts on fastDateTs).

### Hide slow shipping — filters on earliest date
Updated filter logic from `freeDateTs || fastDateTs` to `Math.min(freeDateTs, fastDateTs)` — uses whichever date is earlier (free or paid). Items with neither date remain exempt.
