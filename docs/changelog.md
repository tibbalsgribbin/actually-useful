# Actually Useful — Changelog

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## **v0.6.1.10 — April 20, 2026 (Chat 19)**

### Feedback form pre-fill (search.js, compare.html)
- New feedback form URL: https://forms.gle/XU8RpYM3cGFTwQQ86
- Two fields added to form: "Extension version" (entry.1362282898) and "Browser" (entry.1312500883)
- search.js: `auFeedbackUrl()` function added at top of file — detects AU_VERSION and browser (Edge/Chrome/Firefox/Safari/Other), builds pre-filled viewform URL
- compare.html: inline script sets feedback link href dynamically on page load — pre-fills browser + "website" for version
- Full `docs.google.com/forms/.../viewform` URL required — `forms.gle` shortlinks do not support pre-fill parameters

### Affiliate note (compare.html)
- Share button and affiliate note reordered — Share button now above note
- Affiliate note wording updated to: "This post contains affiliate links. If you click through and make a purchase, I may earn a commission at no additional cost to you."

---

## **v0.6.1.9 — April 20, 2026 (Chat 18)**

### Supabase shareable links (compare.html)
- Supabase project created (Actually Useful / actually-useful), free tier
- `comparisons` table: `id` (int8), `created_at` (timestamptz), `data` (text)
- `saveComparison()`, `loadComparison()`, share button in meta bar and below table
- First click saves and copies; subsequent clicks reuse id
- Duplicate event listener bug fixed via `data-share-attached`

### Best-value tie handling (compare.html)
- `findBestPpuIndex` → `findBestPpuIndices` returning a Set
- Floating-point safe (rounds to 6dp); all tied items show ★

---

## **v0.6.1.8 — April 20, 2026 (Chat 17)**

### Compare button (search.js)
- Replaces "Open in new tabs"; hidden until ≥1 item checked; encodes shortlist as Base64 JSON

### Gmail-style select-all dropdown (search.js, styles.css)
- Visual checkbox span + `▾` dropdown (All/None); checkbox reflects state

### Shortlist bar visual hierarchy (styles.css)
- Hint text dominant; select-all secondary; all buttons use `.ppu-btn`

### compare.html price/PPU NaN fix (search.js, compare.html)
- search.js now sends raw floats; compare.html has null/NaN guard

---

## **v0.6.1.7 — April 20, 2026 (Chat 16)**

### compare.html — phase 1
- Comparison table, sortable columns, best-value star, affiliate disclaimer

---

## **v0.6.1.6 — April 20, 2026 (Chat 15)**

### Manifest warning fixed · Landing page live · Feedback form verified

---

## **v0.6.1.5 — April 19, 2026 (Chat 14)**

### Ko-fi link fixed · Page-fetch throttling · auSendLog → background.js · Telemetry opt-out

---

## **v0.6.1.4 — April 19, 2026 (Chat 13)**

### Rating filter fixed · product.js disabled · Affiliate tag machinery removed · Show Selected rework

---

## **v0.6.1.3 — April 19, 2026 (Chat 12)**

### Collapse bug fix · Version strings aligned · docs/ folder added

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
