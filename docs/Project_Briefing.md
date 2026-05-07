# Actually Useful — Project Briefing
*"Actually Useful: Amazon but better."*
*Current version: v0.6.1.62 (overall) · v0.6.1 (manifest) · v0.6.1.62 (search.js) · v0.6.1.53 (core.js) · v0.6.1.30 (compare.html) · v0.6.1.16 (background.js)*
*Updated May 7, 2026 (Chat 54 — price slider, UI polish, Apps Script header fix)*

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

**The two-stage story:** Actually Useful expands first (load up to 7 pages), then helps you narrow (filter, sort, shortlist), then decides (compare side by side). Most tools only narrow — AU expands AND narrows.

**Feature-to-pillar mapping (internal reference):**

*Find the best value:* PPU calculation and display, Fix 1/Fix 2/solid override, best value star, SNAP EBT, FSA/HSA, Subscribe & Save, coupon display, ppuNote transparency, compare PPU column

*See only what you searched for:* keyword filter, source filter, sponsored button, price range filter, badge filters, brand filter, delivery filter, compare filter bar

*Cut through the noise:* delivery sorting, Prime filter, rating filter, pages slider, Re-sync, compare delivery column, column hide toggles

*Decide with confidence:* shortlist, per-item notes, compare button, compare page (side-by-side, sortable, shareable, action bar)

---

## 3. The Data Spine: The Persistent Shortlist

The **persistent shortlist** is the user's active research file. Currently session-scoped (clears on browser close); cross-session persistence via `chrome.storage.local` is post-alpha.

**Shortlist item object shape sent to compare.html (current — v0.6.1.62):**
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

## 4. Monetization Model

Free always. Revenue from Amazon Associates affiliate commissions + Ko-fi tips. No paywalls ever.

**Affiliate link policy:** Tags on website only — never in the extension.

**Affiliate disclosure:** Every page must display: *"This site contains affiliate links. If you click through and make a purchase, I may earn a commission at no additional cost to you."*

---

## 5. Version Numbering

- **Overall / canonical version:** v0.6.1.62 (search.js number — the main file)
- **Per-file versions:** search.js v0.6.1.62 · core.js v0.6.1.53 · compare.html v0.6.1.30 · background.js v0.6.1.16 · manifest v0.6.1
- Per-file versions differ intentionally — files change at different rates
- Web Store public launch = **v1.0**
- Chrome manifests support three-part version numbers only; internal version carries a fourth segment

---

## 6. Website Architecture

**Platform:** GitHub Pages (static) + Supabase (free tier).

**Pages:**
- `index.html` — marketing/landing page ✅ live — fully overhauled Chat 42
- `privacy.html` — privacy policy ✅ live
- `compare.html` — Actually Useful Comparisons ✅ live — loads via ?id= (Supabase); ?data= fallback for old links
- `search.html` — Actually Useful Searches (post-alpha)

**Sample comparisons (for landing page demo links):**
- id=72 — googly eyes, 369 results ✅ live on landing page
- id=73 — laundry pods ⏸ held until unit display verified
- id=74 — laptops ⏸ held until unit display verified

**Kill switch:** `killswitch.json` in repo root → served at `https://actuallyuseful.net/killswitch.json`. Extension fetches this on every load (cache: no-store). Set `"disabled": true` to halt the extension for all users instantly; set a `"message"` to display a reason. Fail-open: if fetch fails or times out (3s), extension runs normally. Currently: `disabled: false`.

**Supabase:**
- Table: `comparisons` — id (int8), created_at (timestamptz), data (text), RLS disabled
- Publishable key and project URL in compare.html config constants
- Secret key: never goes in browser code

**Feedback form:**
- URL: https://forms.gle/XU8RpYM3cGFTwQQ86
- Entry IDs: version = entry.1362282898 · browser = entry.1312500883
- Must use full viewform URL — forms.gle shortlinks don't support pre-fill

---

## 7. Extension File Structure

**Extension folder:** `C:\Users\tibba\GitHub\actually-useful\extension\`

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (MV3) — host_permissions includes actuallyuseful.net for kill switch; web_accessible_resources includes data/brand_blocklist.txt and data/amazon_brands.txt |
| `background.js` | Service worker — search context relay + usage logging (v0.6.1.16) |
| `popup.html` | Extension popup — telemetry toggle + links |
| `popup.js` | Popup logic |
| `content/search.js` | Search results page panel (v0.6.1.62) — single file, all logic |
| `content/product.js` | Product page panel (disabled during alpha) |
| `content/shared/core.js` | Shared: shortlist, nudge, shared constants, AU_VERSION (v0.6.1.53) |
| `content/shared/styles.css` | Shared styles — blue palette; brand + delivery filter styles; pill dividers |
| `data/brand_blocklist.txt` | Bundled list of known-bad brands (70 entries, Chat 48) — wired up Chat 50 |
| `data/amazon_brands.txt` | Bundled list of Amazon house brands — wired up Chat 53 |

**Repo root:**

| File | Purpose |
|---|---|
| `killswitch.json` | Kill switch config — served via GitHub Pages |

`core.js` uses a **callback pattern** (not Promises).
`compare.html` JS uses **string concatenation** (not template literals).

**Note on architecture:** search.js intentionally remains a single file. The modular refactor (config.js / scraper.js / ui.js) was attempted by an external agent and abandoned — the stub files were not functional. Single-file architecture is the correct choice until selector resilience is properly implemented.

**Code files are NOT stored in the Claude Project.** Melissa uploads them fresh from GitHub at the start of each session.

---

## 8. Palette — Blue (redesigned Chat 45)

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

## 9. Logging — Google Sheets

**Background.js** fires a POST to the Apps Script endpoint on every panel load. Sheet has 63 columns — header row updated Chat 54. Apps Script updated to Version 3 (Chat 54) to include all 63 fields.

**Apps Script endpoint:** stored in background.js as LOG_URL constant.
**Sheet:** "Actually Useful Usage Log" in butactuallyuseful Google account.

**Column count: 63 (fully in sync as of Chat 54)**

---

## 10. Brand Filter — architecture summary (v0.7, complete)

Full design in Brand_Filter_Design.md. Sessions 1–5 complete.

**Detection layers (priority order):**
1. Personal allowlist (`chrome.storage.local` → `auAllowlistBrands`) — user-curated, always passes. Implemented Chat 51.
2. Bundled blocklist (`extension/data/brand_blocklist.txt`) — known junk, always flagged. Wired up Chat 50.
3. Personal blocklist (`chrome.storage.local` → `auBlocklistBrands`) — user-curated, always flagged. Implemented Chat 50.
4. Heuristic detector (`detectGibberishBrand`) — 5 signals. signalFakeMashup and signalAllCapsInvented flag alone; others require score ≥ 2.
5. Bundled allowlist — deferred until telemetry shows false positives worth addressing.

**UI (as of v0.6.1.62):**
- "Move Amazon brands to end" checkbox — above unrecognized brands filter, off by default
- "Move unrecognized brands to end" checkbox — off by default; demote-only (no hide option)
- Demote dividers: amber pill for unrecognized brands, blue pill for Amazon brands
- High-noise banner (orange): fires at ≥25% flagged
- Banner text: "There is a lot of noise in these results. Try using Amazon's filters on the far left of the webpage first, and then Actually Useful's filters above."
- Each card with a detected brand shows: "[BrandName]: [Always show] [Always hide]"
- "My brand rules (N)" footer link — management overlay with two sections

**Console logging:** removed in v0.6.1.49.

**brand and brandFlagged** are on every scraped item object. **brandDetection** (with signals array) also stored. **brand** is in the compare payload (forward-compat; compare.html ignores it for now).

---

## 11. Delivery Window Filter — architecture summary (v0.7, Session 4)

Added Chat 52. Lives in search.js and styles.css.

**Filter logic:** Uses `r.freeDate || r.fastDate` (Date objects on allData items). Items with neither date are exempt. Hides items whose earliest date exceeds `Date.now() + (deliveryFilterDays × 86400000)`.

**UI:**
- Checkbox "Hide slow shipping" in Filters collapsible, below brand filter rows, off by default
- When checked: row of preset buttons appears — 2 / 3 / 5 / 7 / 10 / 14 / 21 days; default 7
- Label: "Arriving within N days" — updates when preset changes
- Hide-only. No demote option.
- Info line: "N slow-shipping hidden" when active
- Best-value star excludes delivery-hidden items
- State persists in sessionStorage per search term; resets on new search term
- Reset Filters clears delivery filter

**Logging:** `deliveryFilterActive` (bool), `deliveryFilterMaxDays` (int), `deliveryCountFiltered` (int)

---

## 12. Price Range Filter — dual-handle slider (v0.6.1.61)

Replaced two input boxes with a dual-handle range slider.

**Behavior:** Bounds set dynamically from cheapest/most expensive item in current results. Low handle sets minPrice floor, high handle sets maxPrice ceiling. Dragging past the other handle clamps. When full range selected (no filter), label is blank. When narrowed, label shows e.g. `$12–$45`. Items with no price are exempt.

**Persistence:** minPrice/maxPrice stored as strings in sessionStorage alongside other filters. Empty string = no filter active.

---

## 13. Working Rules (standing)

- **Single agent.** Claude only. No Replit, Gemini, Figma, or other tools touching code files directly.
- **Confirm before coding.** Always align on scope before touching files.
- **Use AskUserQuestion widget** for all clarifying questions — options over open-ended prose.
- **Melissa's wording is Melissa's wording.** For UI copy and user-facing text, use exact wording. Flag suggestions, let her decide.
- **Complete documents at end of every session.** No merge instructions, no snippets.
- **Rollback rule:** 3 failed fix attempts = stop, revert to last stable commit.
- **Don't touch weight unit logic** without a design session first.
- **search.js stays as one file** until selector resilience is properly designed.
- **Affiliate tags on website only** — never in the extension.
- **All extension text must be selectable.**
- **note = user note; ppuNote = AU inference note** — never conflated.
- **search.js sends raw numbers to compare.html** — compare.html handles all formatting.
- **Template literal rule:** compare.html JS uses string concatenation, not template literals.
- **core.js uses callback pattern**, not Promises.
