# Actually Useful — Changelog

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

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
- All three required alpha questions confirmed present:
  - "Was anything in the panel confusing or unclear?"
  - "What would you like to see added or changed?"
  - Third question added this session with text field for explanation

---

## **v0.6.1.5 — April 19, 2026 (Chat 14)**

### Ko-fi link fixed (search.js)
- Nudge was pointing to `ko-fi.com/tibbalsgribbin`; corrected to `ko-fi.com/butactuallyuseful`
- Footer link was already correct; only the nudge was wrong

### Page-fetch throttling (search.js)
- Added 750ms delay between sequential page fetches in the pages slider `loadNext` loop
- Reduces risk of Amazon rate-limiting rapid credentialed requests
- Single-page load-more button unaffected

### `auSendLog` moved to background.js (core.js, background.js, search.js)
- `AU_LOG_URL` and `auSendLog()` removed from `core.js`; replaced with explanatory comment
- `sendLog()` in `search.js` now assembles the payload and sends via `chrome.runtime.sendMessage({ type: 'AU_LOG', payload })`
- `background.js` handles `AU_LOG` messages and fires the fetch from the service worker context, bypassing Amazon's CSP

### Telemetry opt-out toggle (popup.html, popup.js, background.js, manifest.json)
- New `popup.html` and `popup.js` — extension icon is now clickable
- Popup contains: telemetry toggle (default on), Give feedback link, Buy me a coffee link, version number
- Toggle persists preference to `chrome.storage.local` under key `au_telemetry_enabled`
- `AU_LOG` handler in `background.js` checks preference before firing fetch
- `manifest.json` updated with `"action": { "default_popup": "popup.html", "default_title": "Actually Useful" }`

### Frequently Returned badge — deferred indefinitely
- Badge only appears in the product page panel (product.js disabled during alpha)
- Moved to post-alpha list; no action needed until product.js is re-enabled

---

## **v0.6.1.4 — April 19, 2026 (Chat 13)**

### Minimum rating filter fixed (search.js)
- Added `parseRating(el)` and `r.rating` in `scrapeCard()` — rating filter now works correctly

### product.js disabled in manifest (manifest.json)
- Second `content_scripts` entry moved to `_content_scripts_product_disabled` (now deleted in v0.6.1.6)

### Affiliate tag machinery removed (core.js)
- `AU_AFFILIATE_TAG` and `auTagUrl()` removed entirely — no callers, eliminates policy-violation risk

### Show Selected / Clear Selection rework (search.js)
- Both buttons moved to shortlist bar; wording and behavior reworked

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
