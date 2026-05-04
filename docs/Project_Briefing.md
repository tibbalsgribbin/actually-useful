# Actually Useful — Project Briefing
*"Actually Useful: Amazon but better."*
*Current version: v0.6.1.45 (overall) · v0.6.1 (manifest) · v0.6.1.45 (search.js) · v0.6.1.30 (compare.html) · v0.6.1.16 (background.js)*
*Updated May 3, 2026 (Chat 45)*

---

## 1. Project Overview

Actually Useful began as a Tampermonkey userscript. As of April 2026, it has pivoted to a **Chrome/Edge browser extension** (Manifest V3) with a significantly expanded scope: a **persistent shopping research companion** that travels with the user across the entire Amazon experience.

**Owner:** Melissa, retired, Seattle. Uses Microsoft Edge for primary testing. Has fibromyalgia causing brain fog and reduced memory — patience, thoroughness, and clear step-by-step instructions are essential.

| | |
|---|---|
| Brand | Actually Useful |
| Tagline | Actually Useful: Amazon but better. |
| Domain | actuallyuseful.net (Namecheap) — pointed at GitHub Pages ✅; HTTPS enforcement active ✅ |
| GitHub | github.com/tibbalsgribbin/actually-useful (public) |
| GitHub Pages | tibbalsgribbin.github.io/actually-useful/ (live) |
| Ko-fi | ko-fi.com/butactuallyuseful |
| Email | butactuallyuseful@gmail.com |
| Google account | butactuallyuseful@gmail.com (InPrivate Edge only) |
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

*See only what you searched for:* keyword filter, source filter, sponsored button, price range filter, badge filters, compare filter bar

*Cut through the noise:* delivery sorting, Prime filter, rating filter, pages slider, Re-sync, compare delivery column, column hide toggles

*Decide with confidence:* shortlist, per-item notes, compare button, compare page (side-by-side, sortable, shareable, action bar)

---

## 3. The Data Spine: The Persistent Shortlist

The **persistent shortlist** is the user's active research file. Currently session-scoped (clears on browser close); cross-session persistence via `chrome.storage.local` is post-alpha.

**Shortlist item object shape sent to compare.html (current — v0.6.1.45):**
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

- **Overall / canonical version:** v0.6.1.45 (search.js number — the main file)
- **Per-file versions:** search.js v0.6.1.45 · compare.html v0.6.1.30 · background.js v0.6.1.16 · manifest v0.6.1
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
| `manifest.json` | Extension manifest (MV3) — host_permissions includes actuallyuseful.net for kill switch |
| `background.js` | Service worker — search context relay + usage logging (v0.6.1.16) |
| `popup.html` | Extension popup — telemetry toggle + links |
| `popup.js` | Popup logic |
| `content/search.js` | Search results page panel (v0.6.1.45) — single file, all logic |
| `content/product.js` | Product page panel (disabled during alpha) |
| `content/shared/core.js` | Shared: shortlist, nudge, shared constants |
| `content/shared/styles.css` | Shared styles — blue palette (redesigned Chat 45) |

**Repo root:**

| File | Purpose |
|---|---|
| `killswitch.json` | Kill switch config — served via GitHub Pages |

`core.js` uses a **callback pattern** (not Promises).

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

## 9. Key Features (confirmed in search.js v0.6.1.45)

### Price-per-unit (PPU)
- Scraped from Amazon's reported unit price; calculated from price ÷ count when not available
- **ITEM_UNITS** contains count-type units only — weight/liquid units intentionally excluded so they fall through to Fix 2
- **Fix 1:** When Amazon's $/ct equals full item price and count > 1, recalculates from count
- **Fix 2:** Suppresses PPU when Amazon reports weight/liquid unit but title has no weight quantity; if footage (≥5ft) found instead, calculates $/ft; if no footage either, falls back to price/1 ct with note
- **Solid product override:** when title contains pod/sheet/strip/load/pac/fling/tab/toothpaste/tooth paste keywords and Amazon reports a weight unit or whole-package $/ct, calculates price/count instead. Uses fuzzy 1% comparison to catch edge cases.
- **solidUnitIsWrong also covers liquid units** — fixes Tide Pods showing $/fl oz
- **Weight-from-title fallback:** when ap=null and count=null, parses oz/lb/g/kg from title and computes $/unit directly
- **Weight sanity check:** if Amazon's $/unit × weight-in-title ≠ price by >10%, recalculates
- **Weight unit normalization:** inferWeightDominant() detects oz/lb mix; unit pills for display; normalizePPUForSort() normalizes for sorting; status message when active
- **Footage support:** "25ft", "50 FT" extracted from titles; $/ft calculated and displayed
- **normalizeUnit** strips leading numbers and "X per Y" suffixes
- **Pairs uncertainty note:** when title has "pair/pairs", shows note; unit set to "pair"
- **Mixed-units transparency banner:** fires when any item was overridden or recalculated; dismissible
- **ppuNote** field in compare payload carries AU inference notes (separate from user note)
- **PPU formatting:** $0.10+ shows 2 decimal places; below $0.10 shows 3 decimal places
- Liquid-dominant inference; best value star on all tied items

### Pages to load
Slider (1–7); always visible; 750ms throttle between fetches; "No more pages available" when exhausted. Re-sync button lives in this row.

### Keyword filtering
Inclusion, exclusion (hyphen/minus), OR branches. 250ms debounce; mismatches dimmed, never hidden. X button clears keywords only; Clear all clears everything.

### Sponsored button — three-state cycle
Move ads to end → Hide ads → Show ads

### Source filtering
Amazon, Fresh, Whole Foods, Pharmacy, partner retailers

### Results summary line
Shows active filter counts including "N hidden by badge filter" when badge filters active.

### SNAP EBT
detectSnap(); panel note; isSnap in compare payload; conditional filter. Verified working ✅

### FSA/HSA, Climate Pledge Friendly, Small Business badges
detectFsaHsa(), detectClimatePledge(), detectSmallBusiness(); panel notes; compare pills; conditional filters. Not yet verified on live searches.

### Badge filters
Vertical stack below price range row. Results summary line updates when active.

### Kill switch
Fetches actuallyuseful.net/killswitch.json on every load. disabled:true shows red banner and halts. Fail-open on network error.

### Active state indicators
Sort label shows current sort mode. Filter count badge shows number of active filters.

### Telemetry
Sent via background.js. User can opt out via popup.

### Workflow banner
Dismissible; resets on Clear all. Text is selectable.

### Comparison page (compare.html v0.6.1.30)
- Loads from Supabase by ?id= (primary) or ?data= Base64 (legacy fallback)
- Sortable columns; defaults to PPU ascending on load; best-value star; shareable links
- PPU inference notes shown below PPU value
- Filter bar: keyword, min reviews, min rating, min/max price, source/retailer, hide sponsored, Prime only, SNAP EBT only, FSA/HSA only, Climate Pledge only, Small Business only (all conditional)
- Column hide toggles: Price, Per unit, Delivery, Rating, Reviews, Prime, Coupon/promo, Source, Notes
- Liquid unit toggle when liquid items present
- Action bar when rows checked: Open in tabs, Show checked only, Share checked items, Deselect all

---

## 10. Known Issues / Deferred

- **Multi-pack weight PPU wrong** — Amazon reports $/oz per item in a multi-pack, not per total package weight. Needs design session before any fix attempt.
- **Contact lens solution liquid PPU unreliable** — Amazon's $/fl oz wrong when title has stray numbers; needs recalculate-and-compare check
- **Cotton swabs extractCount** — grabs pack count instead of item count ("500 per Pack - 2 Pack" → 2 ct)
- **Razor blade $0.1/ct outlier** — one item still showing one decimal despite zero-pad fix; source unclear
- **Cardstock "1 Pack (250 Sheets)"** — extractCount picks up 1 from "1 Pack" before 250 from "Sheets"
- **Pairs ambiguity** — interim note only; full fix deferred
- **FSA/HSA, Climate Pledge, Small Business detection** — not yet verified on live Amazon searches
- **Auto-resort on Re-sync page-add** — not yet verified; may not fire
- **Blue/indigo palette inconsistency** — extension panel is blue (styles.css); website is indigo. Full palette unification is post-alpha.
- **Laundry sheets edge cases** — some $/ct = whole-package price slipping through; post-alpha
- **compare.html soldBy/shipsFrom/returnPolicy** — blank until product.js re-enabled
- **No selector resilience** — single-string CSS selectors throughout; Amazon changes break silently
- **No self-test mode** — extension cannot detect its own breakage
- **No welcome page on install** — chrome.runtime.onInstalled not yet wired

---

## 11. Infrastructure

| Item | Detail |
|---|---|
| GitHub | github.com/tibbalsgribbin/actually-useful |
| GitHub Pages | tibbalsgribbin.github.io/actually-useful/ (live) |
| Custom domain | actuallyuseful.net → GitHub Pages ✅; HTTPS enforcement active ✅ |
| Kill switch | actuallyuseful.net/killswitch.json — currently disabled:false |
| Project docs | docs/ folder in GitHub repo |
| Supabase | Actually Useful / actually-useful, free tier |
| Chrome Web Store | Published unlisted — approved April 2026 |
| Usage log | Google Sheet (single merged sheet) — extension + userscript data combined |
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
- Permanently visible UI elements are preferred — conditional visibility only when there's a clear reason
- The comparison page is the destination — the extension is the on-ramp
- All text in the extension interface must be selectable (user-select:text; cursor:text)
- **Fail loud at the system level, fail quiet per item.**
- **Show our work.** When AU interprets data, surface that as a brief, dismissible note. Transparency is an accessibility feature.
- **Sustainability features are features.** Selector resilience, self-test mode, and a kill switch belong in the pre-public-listing checklist.
- **search.js stays as one file** until selector resilience is properly designed and implemented.

---

## 13. Working With Melissa

- Always confirm before executing any file changes
- Use targeted str_replace edits — not full rewrites unless unavoidable
- Code files are NOT in the Claude Project — upload fresh from GitHub each session
- Use the AskUserQuestion widget for clarifying questions
- Has fibromyalgia — never ask her to hold multiple things in her head at once
- Many Google accounts — InPrivate Edge + butactuallyuseful@gmail.com only
- Always include context/token status when asking "continue or wrap up?"
- Bundle small changes — don't ship a one-line fix alone
- **Always provide a commit message when a GitHub push is needed**
- **Don't conflate "small code change" with "well-understood problem"**
- **One agent at a time.** No Replit, Gemini, Figma, or other tools touching code files in parallel with Claude sessions. Design exploration happens in Claude Design only and produces a reference doc — it does not touch files directly.
- **End-of-session checklist:**
  1. Project_Briefing.md updated
  2. Changelog.md appended
  3. Roadmap.md updated
  4. Handover.md written
  5. bug-test.md updated if applicable
  6. All changed code/website files presented
  7. If code changed: GitHub push reminder given + commit message provided
  8. Remind Melissa to update Project files in Claude after the push
