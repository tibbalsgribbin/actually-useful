# Actually Useful — Changelog

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

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
