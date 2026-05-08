# Actually Useful — Project Briefing
*"Actually Useful: Amazon but better."*
*Current version: v0.6.1.64 (overall) · v0.6.1 (manifest) · v0.6.1.64 (search.js) · v0.6.1.53 (core.js) · compare.html updated Chat 57 · v0.6.1.16 (background.js)*
*Updated May 8, 2026 (Chat 57 — scrapeBrand fix; delivery column split; banner dismisses; re-sync prompt)*

---

## 1. Project Overview

Actually Useful began as a Tampermonkey userscript. As of April 2026, it has pivoted to a **Chrome/Edge browser extension** (Manifest V3) with a significantly expanded scope: a **persistent shopping research companion** that travels with the user across the entire Amazon experience.

**Owner:** Melissa, retired, Seattle. Uses Edge (butactuallyuseful profile) for primary testing. Has fibromyalgia causing brain fog and reduced memory — patience, thoroughness, and clear step-by-step instructions are essential. Produces complete updated document files at end of every session — no merge instructions, no snippets.

| | |
|---|---|
| Brand | Actually Useful |
| Tagline | Actually Useful: Amazon but better. |
| Domain | actuallyuseful.net (Namecheap) — pointed at GitHub Pages ✅; HTTPS enforcement active ✅ |
| GitHub | github.com/tibbalsgribbin/actually-useful (public) |
| GitHub Pages | tibbalsgribbin.github.io/actually-useful/ (live) |
| Ko-fi | ko-fi.com/butactuallyuseful |
| Email | butactuallyuseful@gmail.com |
| Google account | butactuallyuseful@gmail.com — use dedicated Chrome profile (butactuallyuseful) |
| Feedback form | https://forms.gle/XU8RpYM3cGFTwQQ86 |
| Supabase | Actually Useful / actually-useful project, free tier |
| Chrome Web Store | Published unlisted — approved April 2026 |

---

## 2. Positioning — Public Facing

The four-pillar framework is retained as an **internal reference only**. Public-facing copy uses this positioning instead:

**Core positioning:** Amazon is built to sell what *they* want. Actually Useful is built to help you buy what *you* want.

**The extension-to-website arc:** The extension is the data bridge — it travels with the user on Amazon, captures what Amazon buries, and sends the user's research to the website. The website is where Actually Useful is fully realized: room to breathe, tools Amazon would never build, and the place where affiliate links can do their job. A user who never leaves the extension gets real value. A user who follows the research to the website gets everything.

**The two-stage story:** Actually Useful expands first (load up to 7 pages), then helps you narrow (filter, sort, shortlist), then decides (compare side by side). Most tools only narrow — AU expands AND narrows.

**Intended compare.html workflow:** Load maximum pages (up to 7), apply a few panel filters, send hundreds of items to compare.html for second-stage refinement. compare.html is a full research surface, not just a final-3-items view.

**Feature-to-pillar mapping (internal reference):**

*Find the best value:* PPU calculation and display, Fix 1/Fix 2/solid override, best value star, SNAP EBT, FSA/HSA, Subscribe & Save, coupon display, ppuNote transparency, compare PPU column

*See only what you searched for:* keyword filter, source filter, sponsored button, price range filter, badge filters, brand filter, delivery filter, compare filter bar

*Cut through the noise:* delivery sorting, Prime filter, rating filter, pages slider, Re-sync, compare delivery columns, column hide toggles

*Decide with confidence:* shortlist, per-item notes, compare button, compare page (side-by-side, sortable, shareable, action bar, resizable columns, sticky header)

---

## 3. Website Strategy (internal)

The website is the long-term product. The extension is the bridge that gets Amazon's data out — but actuallyuseful.net is where Actually Useful becomes a full shopping research platform, not dependent on being on Amazon at all.

**Current state:** compare.html is the website, for all practical purposes. It's a full research surface: filter, sort, compare side by side, share, take notes.

**Long-term vision:** Expand to cover every major part of the Amazon shopping experience — and eventually operate as a standalone research tool that doesn't require Amazon at all.

Planned surfaces (in rough priority order):
- `compare.html` — live ✅ — shortlist research, side-by-side comparison, sharing
- `search.html` — post-alpha — standalone search results page; AU features without being on Amazon; clean, ad-free alternative to tools like jungle-search.com
- Product pages — post-alpha — per-product research surface (price history, reviews, variants, return rate)
- Gift lists, carts, saved-for-later — post-alpha — AU features across the full Amazon experience

**Affiliate tags:** Every outbound Amazon link from the website carries the Associates tag. The website is where monetization happens. The extension never carries tags — this is a firm standing rule.

**Telemetry:** compare.html can't read the user's telemetry opt-out from `chrome.storage.local` (website can't access extension storage). For now, compare.html logging is deferred — search.js logging captures the signal that matters most. Revisit when the website has more surfaces.

---

## 4. The Data Spine: The Persistent Shortlist

The **persistent shortlist** is the user's active research file. Currently session-scoped (clears on browser close); cross-session persistence via `chrome.storage.local` is post-alpha.

**Shortlist item object shape sent to compare.html (current — Chat 55):**
```
{ asin, title, price (raw float), listPrice (raw float), ppu (raw float), ppuUnit,
  isPrime (bool), isSponsored (bool),
  hasCoupon (bool), couponPillOnly (bool), sns (string), savings (string),
  freeDate (formatted string), fastDate (formatted string),
  freeDateTs (epoch ms), fastDateTs (epoch ms),
  freeWindowMinutes (int minutes-since-midnight, or null),
  freeWindowEnd (int minutes-since-midnight, or null),
  freeQualifier (string), fastCutoff (string),
  paidDate (formatted string), paidCutoff (string), paidPrice (string),
  retailerKey (string), rating, reviewCount,
  note (string — user's note), ppuNote (string — AU inference note), imgUrl (string),
  isSnap (bool), isFsaHsa (bool), isClimatePledge (bool), isSmallBusiness (bool),
  brand (string | null) }
```
Payload also includes: `searchTerm` (string), `searchUrl` (string).

---

## 5. Monetization Model

Free always. Revenue from Amazon Associates affiliate commissions + Ko-fi tips. No paywalls ever.

**Affiliate link policy:** Tags on website only — never in the extension. Every outbound Amazon link from the website carries the Associates tag.

**Affiliate disclosure:** Every page must display: *"This site contains affiliate links. If you click through and make a purchase, I may earn a commission at no additional cost to you."*

---

## 6. Version Numbering

- **Overall / canonical version:** v0.6.1.64 (search.js number — the main file)
- **Per-file versions:** search.js v0.6.1.64 · core.js v0.6.1.53 · compare.html updated Chat 57 · background.js v0.6.1.16 · manifest v0.6.1
- Per-file versions differ intentionally — files change at different rates
- Web Store public launch = **v1.0**
- Chrome manifests support three-part version numbers only; internal version carries a fourth segment

---

## 7. Website Architecture

**Platform:** GitHub Pages (static) + Supabase (free tier).

**Pages:**
- `index.html` — marketing/landing page ✅ live — fully overhauled Chat 42
- `privacy.html` — privacy policy ✅ live
- `compare.html` — Actually Useful Comparisons ✅ live — loads via ?id= (Supabase); ?data= fallback for old links
- `search.html` — Actually Useful Searches (post-alpha) — standalone search results page; AU features without being on Amazon; clean alternative to ad-heavy tools like jungle-search.com

**Website data files (repo root data/ folder):**
- `data/brand_blocklist.txt` — fetched by compare.html for brand filter. Must match extension/data/ copy.
- `data/amazon_brands.txt` — fetched by compare.html for Amazon brand filter. Must match extension/data/ copy.
- **Standing rule:** update both copies concurrently whenever lists change.

**Sample comparisons (for landing page demo links):**
- id=72 — googly eyes, 369 results ✅ live on landing page
- id=73 — laundry pods ⏸ held until unit display verified
- id=74 — laptops ⏸ held until unit display verified

---

## 8. Technical Architecture

**Extension files:**
- `manifest.json` — v0.6.1 (three-part)
- `background.js` — v0.6.1.16 — service worker; logging relay; kill switch fetch
- `content/search.js` — v0.6.1.64 — main content script; all scraping, PPU, panel UI
- `content/core.js` — v0.6.1.53 — shortlist state; compare relay
- `content/styles.css` — panel styles (blue palette, Chat 45)
- `popup/` — popup UI
- `data/brand_blocklist.txt` — bundled blocklist
- `data/amazon_brands.txt` — Amazon house brands list

**Key architectural rules:**
- `core.js` uses a **callback pattern** (not Promises).
- `compare.html` JS uses **string concatenation** (not template literals).

**Note on architecture:** search.js intentionally remains a single file. The modular refactor (config.js / scraper.js / ui.js) was attempted by an external agent and abandoned — the stub files were not functional. Single-file architecture is the correct choice until selector resilience is properly implemented.

**Code files are NOT stored in the Claude Project.** Melissa uploads them fresh from GitHub at the start of each session.

---

## 9. Palette — Blue (redesigned Chat 45)

The extension panel (styles.css) now uses a blue palette. The website (compare.html, index.html) retains the original monochromatic indigo palette. A full cross-product palette redesign is post-alpha.

**Extension panel (styles.css):**

| Role | Hex |
|---|---|
| Header / primary | #4f46e5 (indigo-600) |
| Active states | #6366f1 (indigo-500) |
| Links / accents | #4338ca (indigo-700) |
| Hover | #c7d2fe (indigo-200) |
| Backgrounds | #eef2ff (indigo-50) |
| Primary text | #111827 (gray-900) |
| Muted text | #6b7280 (gray-500) |
| Borders | #d1d5db (gray-300) |

**Website (compare.html, index.html) — unchanged indigo:**

| Role | Hex |
|---|---|
| Brand primary | #512bd3 |
| Links | #5d49da |
| Backgrounds | #eaecfd |
| Primary text | #1A1035 |
| Muted text | #6B5FA0 |
| Borders | #afb2f4 |

---

## 10. Logging — Google Sheets

**Background.js** fires a POST to the Apps Script endpoint on every panel load. Sheet has 63 columns — header row updated Chat 54. Apps Script updated to Version 3 (Chat 54) to include all 63 fields.

**compare.html logging:** Deferred. compare.html can't read the user's telemetry opt-out from `chrome.storage.local` (website/extension storage boundary). Search.js logging captures the most important signal for now. Revisit when the website has more surfaces.

**Apps Script endpoint:** stored in background.js as LOG_URL constant.
**Sheet:** "Actually Useful Usage Log" in butactuallyuseful Google account.

**Column count: 63 (fully in sync as of Chat 54)**

---

## 11. Brand Filter — architecture summary (v0.7, complete)

Full design in Brand_Filter_Design.md. Sessions 1–5 complete. compare.html integration complete (Chat 55).

**Detection layers (priority order):**
1. Personal allowlist (`chrome.storage.local` → `auAllowlistBrands`) — user-curated, always passes. Implemented Chat 51. Extension only.
2. Bundled blocklist (`extension/data/brand_blocklist.txt`) — known junk, always flagged. Wired up Chat 50. Also fetched from website data/ by compare.html.
3. Personal blocklist (`chrome.storage.local` → `auBlocklistBrands`) — user-curated, always flagged. Implemented Chat 50. Extension only.
4. Heuristic detector (`detectGibberishBrand`) — 5 signals. signalFakeMashup and signalAllCapsInvented flag alone; others require score ≥ 2.
5. Bundled allowlist — deferred until telemetry shows false positives worth addressing.

**compare.html brand handling:**
- `isBrandNoise()` rejects scraping artifacts before any detection logic runs
- Personal allowlist/blocklist not available (website can't access chrome.storage.local)
- Bundled lists fetched from actuallyuseful.net/data/ at init, fail-open
- Brand column toggleable via Show Columns

**UI (search.js panel, as of v0.6.1.64):**
- "Move Amazon brands to end" checkbox — above unrecognized brands filter, off by default
- "Move unrecognized brands to end" checkbox — off by default; demote-only (no hide option)
- Demote dividers: amber pill for unrecognized brands, blue pill for Amazon brands
- High-noise banner (orange): fires at ≥25% flagged — dismissible (X, upper right)
- Each card with a detected brand shows: "[BrandName]: [Always show] [Always hide]"
- "My brand rules (N)" footer link — management overlay with two sections

**UI (compare.html, as of Chat 57):**
- "Hide unrecognized brands" checkbox — hides items with flagged brands
- "Hide Amazon brands" checkbox — hides Amazon house brand items
- Brand column in table — toggleable, shows detected brand or dash

---

## 12. Delivery Window Filter — architecture summary (v0.7, Session 4)

Added Chat 52 to search.js. Added Chat 55 to compare.html.

**search.js filter logic:** Uses `r.freeDate || r.fastDate` (Date objects on allData items). Items with neither date are exempt. Hides items whose earliest date exceeds `Date.now() + (deliveryFilterDays × 86400000)`.

**compare.html filter logic (updated Chat 57):** Uses `Math.min(freeDateTs, fastDateTs)` — whichever is earlier. Same exemption and threshold logic.

**UI (both):**
- Checkbox "Hide slow shipping" — off by default
- When checked: row of preset buttons — 2 / 3 / 5 / 7 / 10 / 14 / 21 days; default 7
- Hide-only. No demote option.

---

## 13. compare.html — current feature state (as of Chat 57)

**Filter bar:** include/exclude text, min reviews, min rating, min/max price (number inputs), source, hide sponsored, Prime, SNAP, FSA/HSA, Climate Pledge, Small Business, hide unrecognized brands, hide Amazon brands, hide slow shipping + day presets. Hide slow shipping now filters on earliest of free/fastest delivery.

**Table columns (all toggleable):** checkbox, thumbnail, product, price, per unit, free delivery, fastest delivery, rating, reviews, Prime, coupon/promo, source, brand, notes. Delivery is now two separate columns — Free delivery and Fastest delivery — each independently sortable.

**Table UX:** resizable columns (drag header edge), sticky header (80vh scroll container), sticky horizontal scrollbar (mirror div, always visible at viewport bottom), cell text wrapping.

**Other:** liquid unit toggle, action bar (open tabs, show checked only, share checked, deselect all), share button (Supabase), editable notes, sort by any column.

**Not yet on compare.html:** logging (deferred — see Section 10).

---

## 14. Price Range Filter — dual-handle slider (search.js v0.6.1.61)

search.js panel uses a dual-handle range slider. compare.html retains number inputs — appropriate for a fixed loaded dataset where dynamic bounds don't apply.

---

## 15. Working Rules (standing)

- **Single agent.** Claude only. No Replit, Gemini, Figma, or other tools touching code files directly.
- **Confirm before coding.** Always align on scope before touching files.
- **Use AskUserQuestion widget** for all clarifying questions — options over open-ended prose.
- **Melissa's wording is Melissa's wording.** For UI copy and user-facing text, use exact wording. Flag suggestions, let her decide.
- **Complete documents at end of every session.** No merge instructions, no snippets.
- **Rollback rule:** 3 failed fix attempts = stop, revert to last stable commit.
- **Don't touch weight unit logic** without a design session first.
- **search.js stays as one file** until selector resilience is properly designed.
- **Affiliate tags on website only** — never in the extension. Every outbound Amazon link from the website carries the Associates tag.
- **All extension text must be selectable.**
- **note = user note; ppuNote = AU inference note** — never conflated.
- **search.js sends raw numbers to compare.html** — compare.html handles all formatting.
- **Template literal rule:** compare.html JS uses string concatenation, not template literals.
- **core.js uses callback pattern**, not Promises.
- **Brand list sync rule:** brand_blocklist.txt and amazon_brands.txt must be updated concurrently in extension/data/ AND repo root data/. Both copies must always match.
