# Actually Useful — Project Briefing
*"Actually Useful: Amazon but better."*
*Current version: v0.6.1.35 (overall) · v0.6.1 (manifest) · v0.6.1.35 (search.js) · v0.6.1.30 (compare.html) · Updated April 29, 2026 (Chat 40)*

---

## 1. Project Overview

Actually Useful began as a Tampermonkey userscript. As of April 2026, it has pivoted to a **Chrome/Edge browser extension** (Manifest V3) with a significantly expanded scope: a **persistent shopping research companion** that travels with the user across the entire Amazon experience.

**Owner:** Melissa, retired, Seattle. Uses Microsoft Edge for primary testing. Has fibromyalgia causing brain fog and reduced memory — patience, thoroughness, and clear step-by-step instructions are essential.

| | |
|---|---|
| Brand | Actually Useful |
| Tagline | Actually Useful: Amazon but better. |
| Domain | actuallyuseful.net (Namecheap) — not yet pointed at GitHub Pages |
| GitHub | github.com/tibbalsgribbin/actually-useful (public) |
| GitHub Pages | tibbalsgribbin.github.io/actually-useful/ (live) |
| Ko-fi | ko-fi.com/butactuallyuseful |
| Email | butactuallyuseful@gmail.com |
| Google account | butactuallyuseful@gmail.com (InPrivate Edge only) |
| Feedback form | https://forms.gle/XU8RpYM3cGFTwQQ86 |
| Supabase | Actually Useful / actually-useful project, free tier |
| Chrome Web Store | Published unlisted — approved April 2026 |

---

## 2. Value Proposition — Four Pillars

**Find the best value** — Sort by real price-per-unit across all results, not just total price.

**See only what you searched for** — Filter results to exactly the product you asked for.

**Cut through the noise** — Hide sellers you don't want, sort by delivery date, build a shortlist.

**Decide with confidence** — Everything in one clean panel, organized the way you actually think.

---

## 3. The Data Spine: The Persistent Shortlist

The **persistent shortlist** is the user's active research file. Currently session-scoped (clears on browser close); cross-session persistence via `chrome.storage.local` is post-alpha.

**Shortlist item object shape sent to compare.html (current — v0.6.1.35):**
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
  isSnap (bool), isFsaHsa (bool), isClimatePledge (bool), isSmallBusiness (bool) }
```
Payload also includes: `searchTerm` (string), `searchUrl` (string).

---

## 4. Monetization Model

Free always. Revenue from Amazon Associates affiliate commissions + Ko-fi tips. No paywalls ever.

**Affiliate link policy:** Tags on website only — never in the extension.

**Affiliate disclosure:** Every page must display: *"This site contains affiliate links. If you click through and make a purchase, I may earn a commission at no additional cost to you."*

---

## 5. Version Numbering

- Current: **v0.6.1** (manifest) / **v0.6.1.35** (search.js) / **v0.6.1.30** (compare.html)
- Web Store public launch = **v1.0**
- Chrome manifests support three-part version numbers only; internal version carries a fourth segment

---

## 6. Website Architecture

**Platform:** GitHub Pages (static) + Supabase (free tier).

**Pages:**
- `index.html` — marketing/landing page ✅ live
- `privacy.html` — privacy policy ✅ live
- `compare.html` — Actually Useful Comparisons ✅ live — loads via ?id= (Supabase); ?data= fallback for old links
- `search.html` — Actually Useful Searches (post-alpha)

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
| `manifest.json` | Extension manifest (MV3) |
| `background.js` | Service worker — search context relay + usage logging |
| `popup.html` | Extension popup — telemetry toggle + links |
| `popup.js` | Popup logic |
| `content/search.js` | Search results page panel |
| `content/product.js` | Product page panel (disabled during alpha) |
| `content/shared/core.js` | Shared: shortlist, nudge, shared constants |
| `content/shared/styles.css` | Shared styles — monochromatic indigo palette |

`core.js` uses a **callback pattern** (not Promises).

**Code files are NOT stored in the Claude Project.** Melissa uploads them fresh from GitHub at the start of each session.

---

## 8. Palette — Monochromatic Indigo (applied Chat 27 pre-session)

| Role | Colour | Hex |
|---|---|---|
| Brand primary | Deep indigo | #512bd3 |
| Links | Medium indigo | #5d49da |
| Hover | Lighter indigo | #7b76e5 |
| Backgrounds | Lightest indigo | #eaecfd |
| Surface hover | Light indigo | #d6d8fa |
| Primary text | Near-black indigo | #1A1035 |
| Muted text | Muted indigo | #6B5FA0 |
| Borders | Indigo border | #afb2f4 |

Note: Palette redesign still wanted for future store update. Use Claude Design tool for iterative visual work.

---

## 9. Key Features

### Price-per-unit (PPU)
- Scraped from Amazon's reported unit price; calculated from price ÷ count when not available
- **ITEM_UNITS** contains count-type units only — weight/liquid units intentionally excluded so they fall through to Fix 2
- **Fix 1:** When Amazon's $/ct equals full item price and count > 1, recalculates from count (fixes cardstock, bandages, binder clips, etc.)
- **Fix 2:** Suppresses PPU when Amazon reports weight/liquid unit but title has no weight quantity; if footage (≥5ft) found instead, calculates $/ft; if no footage either, falls back to price/1 ct with note
- **Solid product override:** when title contains pod/sheet/strip/load/pac/fling/tab keywords and Amazon reports a weight unit or whole-package $/ct, calculates price/count instead
- **Footage support:** "25ft", "50 FT" extracted from titles; $/ft calculated and displayed
- **normalizeUnit** strips leading numbers: "100 sheets" → "sheet", "50 count" → "ct"
- **Pairs uncertainty note:** when title has "pair/pairs" and source is amazon, shows note; unit set to "pair"
- **Mixed-units transparency banner:** fires when any item was overridden or recalculated; dismissible
- **ppuNote** field in compare payload carries AU inference notes (separate from user note)
- Liquid-dominant inference; best value star on all tied items

### Keyword filtering
- Inclusion, exclusion (`-word`), OR branches
- 250ms debounce; mismatches dimmed, never hidden
- X button clears keywords only; Clear all clears everything

### Sponsored button — three-state cycle
Move ads to end → Hide ads → Show ads

### Source filtering
Amazon, Fresh, Whole Foods, Pharmacy, partner retailers

### Pages to load
Slider (1–10); always visible; 750ms throttle between fetches; "No more pages available" when exhausted. Re-sync button lives in this row.

### Re-sync
Reloads results from Amazon's current page. Extra pages loaded will be lost.

### Clear all
Nuclear reset — clears all AU filters, sort, keywords, sliders, price range, source filters, sponsored mode, SNAP/FSA/badge filters; returns to page 1. Always active. Clears sessionStorage so settings don't restore on rebuild.

### Shortlist (session-scoped)
Checkbox per row. Per-item notes (link/preview pattern). Compare button POSTs to Supabase, opens compare.html?id=xxx. No item limit.

### Delivery sorting
- Parses free delivery, fastest delivery, and paid express delivery
- Free delivery shows full window range: e.g. `5 PM–10 PM`
- Paid delivery displayed in row: e.g. `$4.99: in 3 hrs`
- "Soonest ANY delivery" sort factors in free, fastest, and paid dates

### Rating/review display
Rating (stars) and review count shown in each panel row, below delivery info.

### SNAP EBT
- `detectSnap()` checks aria-label and leaf text for "SNAP EBT" on each card
- "SNAP EBT eligible" note line shown in panel row (green text)
- `isSnap` included in compare payload; green SNAP EBT pill shown in Coupon/promo column on compare.html
- "SNAP EBT only" filter on compare.html — only shown when at least one item in the comparison is SNAP-eligible
- Verified working on real grocery searches (Chat 38) ✅

### FSA/HSA, Climate Pledge Friendly, Small Business badges
- `detectFsaHsa()`, `detectClimatePledge()`, `detectSmallBusiness()` — same aria-label + leaf text scan pattern as SNAP EBT
- Panel note lines per item when detected: "FSA or HSA eligible" (blue), "Climate Pledge Friendly" (dark green), "Small Business" (orange)
- All three included in compare payload; pills shown in Coupon/promo column; conditional filters in compare filter bar
- Not yet verified on live Amazon searches (Chat 39)

### Badge filters (v0.6.1.35)
- All four badge filter checkboxes (SNAP EBT, FSA/HSA, Climate Pledge, Small Business) render as a vertical stack in `#ppu-badge-filter-row` below the price range row
- One per line, regular weight text, consistent left alignment
- Whole block only appears when at least one qualifying result is present

### Telemetry
Sent via background.js. User can opt out via popup.

### Workflow banner
Explains correct workflow sequence. Dismissible; resets on Clear all. Text is selectable.

### Comparison page
- Loads from Supabase by ?id= (primary) or ?data= Base64 (legacy fallback)
- Sortable columns; **defaults to PPU ascending (lowest first)** on load; best-value star; shareable links
- PPU inference notes shown as italic muted text below PPU value (both render paths)
- Filter bar: keyword, min reviews, min rating, min/max price, source/retailer, hide sponsored, Prime only, SNAP EBT only, FSA/HSA only, Climate Pledge only, Small Business only (all conditional)
- Column hide toggles: Price, Per unit, Delivery, Rating, Reviews, Prime, Coupon/promo, Source, Notes (per-session)
- Columns: Product (with thumbnail), Price, Per unit, Delivery, Rating, Reviews, Prime, Coupon/promo, Source, Notes
- Coupon column: pills for Coupon, SNAP EBT, FSA or HSA eligible, Climate Pledge Friendly, Small Business; S&S shows actual discount string
- Liquid unit toggle when liquid items present
- Action bar when rows checked: Open in tabs, Show checked only, Share checked items, Deselect all

---

## 10. Known Issues / Deferred

- **Palette redesign still wanted** — use Claude Design for iteration
- **FSA/HSA, Climate Pledge, Small Business detection** — not yet verified on live Amazon searches
- **Word-form weights not matched** — "5-Pound", "18 Pound", "3 Ounce", "0.85 OZ" not matching Fix 2 regex; affects rice, cat food, toothpaste, personal care
- **Toothpaste classified as liquid** — Amazon reports fl oz; "toothpaste" / "tooth paste" need adding to SOLID_KEYWORDS
- **Contact lens solution liquid PPU unreliable** — Amazon's $/fl oz wrong when title has stray numbers (e.g. "(12)"); needs recalculate-and-compare check against title volume
- **Cotton swabs extractCount** — grabs pack count instead of item count ("500 per Pack - 2 Pack" → 2 ct); one case where count found but PPU calculates price/1
- **PPU formatting — $0.1/ct** — missing zero-pad to two decimal places
- **PPU display — sub-penny items** — need 3 decimal places when PPU ≤ $0.01 (cotton swabs, bandages, pills)
- **Results summary line doesn't update for badge filters** — should reflect filtered count when badge filters active, same as keyword filter
- **Rice / weight-sold-by-pound items:** solid product override firing incorrectly on "15 lbs (Pack of 2)"
- **Cat food single bags:** showing $/ct instead of $/lb — word-form weight not matched
- **Cardstock "1 Pack (250 Sheets)":** extractCount picks up 1 from "1 Pack" before 250 — wrong unit
- **Pairs ambiguity:** socks/gloves sold in pairs AND multiples — unit accuracy uncertain; uncertainty note added as interim
- **Other discount types** — buy-multiple deals, vague "save X%" promos; post-alpha
- **Product page panel** — disabled in manifest, deferred until post-alpha
- **Laundry sheets edge cases** — some $/ct = whole-package price slipping through; post-alpha
- **actuallyuseful.net** — not yet pointed at GitHub Pages
- **compare.html soldBy/shipsFrom/returnPolicy** — blank until product.js re-enabled
- **"Amazon search" link** — only works for comparisons created after v0.6.1.14
- **Thumbnails on compare.html** — only populated for comparisons created after v0.6.1.16
- **Delivery time on compare.html** — only correct for comparisons created after v0.6.1.17
- **Paid delivery on compare.html** — only available for comparisons created after v0.6.1.27
- **isSnap on compare.html** — only available for comparisons created after v0.6.1.28
- **ppuNote on compare.html** — only available for comparisons created after v0.6.1.29
- **isFsaHsa/isClimatePledge/isSmallBusiness on compare.html** — only available for comparisons created after v0.6.1.34
- **Collapsible animation gone** — snap only; post-alpha
- **Ko-fi nudge removed** — redesign post-alpha
- **No selector resilience** — single-string CSS selectors throughout search.js
- **No kill switch** — no mechanism to disable a bad release between CWS reviews
- **No self-test mode** — extension cannot detect its own breakage

---

## 11. Infrastructure

| Item | Detail |
|---|---|
| GitHub | github.com/tibbalsgribbin/actually-useful |
| GitHub Pages | tibbalsgribbin.github.io/actually-useful/ (live) |
| Project docs | `docs/` folder in GitHub repo |
| Supabase | Actually Useful / actually-useful, free tier |
| Chrome Web Store | Published unlisted — approved April 2026 |
| Usage log | Google Sheet — payload relayed via background.js |
| Feedback form | https://forms.gle/XU8RpYM3cGFTwQQ86 |
| Ko-fi | ko-fi.com/butactuallyuseful |
| Contact | butactuallyuseful@gmail.com |

---

## 12. Design Principles

- Fill gaps in Amazon's interface — don't duplicate what Amazon already does well
- Wrong numbers are worse than no numbers
- Never drop results — sort what is rendered
- User intent matters more than physical precision
- One continuous app — state flows naturally between pages
- Use Melissa's exact wording for UI copy
- Copy tone: warm, direct, personal. "doesn't" not "won't"
- The website must work for users who arrive without the extension
- Affiliate tags on website only — never in extension
- Affiliate disclosure on every page — whether or not affiliate links are live
- search.js sends raw numbers to compare.html — compare.html handles all formatting
- All data that appears in the extension panel listing should be in the compare.html payload — no exceptions
- Claude Design tool is the right place for iterative visual/palette work
- Permanently visible UI elements are preferred — conditional visibility only when there's a clear reason
- The comparison page is the destination — the extension is the on-ramp
- All text in the extension interface must be selectable (user-select:text; cursor:text) — applies to every visible text element
- **Fail loud at the system level, fail quiet per item.** 90% parsing / 10% failing = normal. 90% failing = surface a banner.
- **Show our work.** When AU interprets data — inferring units, applying solid-product override, triggering liquid-dominant inference — surface that interpretation as a brief, dismissible note. Transparency is an accessibility feature.
- **Sustainability features are features.** Selector resilience, self-test mode, and a kill switch belong in the pre-public-listing checklist, not the post-alpha backlog.

---

## 13. Working With Melissa

- Always confirm before executing any file changes
- Use targeted `str_replace` edits — not full rewrites unless unavoidable
- Code files are NOT in the Claude Project — upload fresh from GitHub each session
- Use the AskUserQuestion widget for clarifying questions
- Has fibromyalgia — never ask her to hold multiple things in her head at once
- Many Google accounts — InPrivate Edge + butactuallyuseful@gmail.com only
- Always include context/token status when asking "continue or wrap up?"
- Bundle small changes — don't ship a one-line fix alone
- **Always provide a commit message when a GitHub push is needed** — standing rule added Chat 38
- **End-of-session checklist:**
  1. Project_Briefing.md updated
  2. Changelog.md appended
  3. Roadmap.md updated
  4. Handover.md written
  5. bug-test.md updated
  6. All changed code files presented
  7. If code changed: GitHub push reminder given + commit message provided
  8. Remind Melissa to update Project files in Claude after the push
