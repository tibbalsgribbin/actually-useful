# Actually Useful — Project Briefing
*"Actually Useful: Amazon but better."*
*Current version: v0.6.1.15 (overall) · v0.6.1 (manifest) · v0.6.1.15 (search.js) · v0.6.1.15 (compare.html) · Updated April 21, 2026 (Chat 25)*

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
| Chrome Web Store | Developer account created (Chat 20) — unlisted submission pending |

---

## 2. Value Proposition — Four Pillars

**Find the best value** — Sort by real price-per-unit across all results, not just total price.

**See only what you searched for** — Filter results to exactly the product you asked for.

**Cut through the noise** — Hide sellers you don't want, sort by delivery date, build a shortlist.

**Decide with confidence** — Everything in one clean panel, organized the way you actually think.

---

## 3. The Data Spine: The Persistent Shortlist

The **persistent shortlist** is the user's active research file. Currently session-scoped (clears on browser close); cross-session persistence via `chrome.storage.local` is post-alpha.

**Shortlist item object shape sent to compare.html (current — v0.6.1.15):**
```
{ asin, title, price (raw float), listPrice (raw float), ppu (raw float), ppuUnit,
  isPrime (bool), isSponsored (bool),
  hasCoupon (bool), couponPillOnly (bool), sns (string), savings (string),
  freeDate (formatted string), fastDate (formatted string),
  freeDateTs (epoch ms), fastDateTs (epoch ms), freeQualifier (string),
  retailerKey (string), rating, reviewCount, note (string) }
```
Payload also includes: `searchTerm` (string), `searchUrl` (string).

---

## 4. Monetization Model

Free always. Revenue from Amazon Associates affiliate commissions + Ko-fi tips. No paywalls ever.

**Affiliate link policy:** Tags on website only — never in the extension.

**Affiliate disclosure:** Every page must display: *"This post contains affiliate links. If you click through and make a purchase, I may earn a commission at no additional cost to you."*

---

## 5. Version Numbering

- Current: **v0.6.1** (manifest) / **v0.6.1.13** (search.js) / **v0.6.1.13** (compare.html)
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
| `content/shared/styles.css` | Shared styles — Lavender Fields palette (needs redesign) |

`core.js` uses a **callback pattern** (not Promises).

**Code files are NOT stored in the Claude Project.** Melissa uploads them fresh from GitHub at the start of each session.

---

## 8. Palette — Lavender Fields (applied v0.6.1.12, needs redesign)

| Role | Colour | Hex |
|---|---|---|
| Header, nav | Orchid | #CF6DFC |
| Shortlist bar, footer bar, dividers | Gold | #BDB96A |
| Page/panel background | White | #FFFFFF |
| Cards, rows, control areas | Pale Yellow | #FDFBD4 |
| Best value row | Vivid Yellow | #f5eda0 |
| Text inputs, dropdowns | White only | #FFFFFF |
| Unchecked checkboxes | White | #FFFFFF |
| Checked checkboxes | Orchid | #CF6DFC |
| Feature cards (website) | Periwinkle | #C1BFFF |
| Comparison table cells | White | #FFFFFF |
| Primary text | Eggplant | #351E45 |
| Muted text (dimmed/inactive only) | Muted purple | #877891 |

Note: Live result was not satisfactory. Palette redesign needed before screenshots. Use Claude Design tool for iterative visual work.

---

## 9. Key Features

### Price-per-unit (PPU)
- Scraped from Amazon's reported unit price; calculated from price ÷ count when not available
- Liquid-dominant inference; best value star on all tied items

### Keyword filtering
- Inclusion, exclusion (`-word`), OR branches
- 250ms debounce; mismatches dimmed, never hidden

### Sponsored button — three-state cycle
Move ads to end → Hide ads → Show ads

### Source filtering
Amazon, Fresh, Whole Foods, Pharmacy, partner retailers

### Pages to load
Slider (1–10); 750ms throttle between fetches

### Shortlist (session-scoped)
Checkbox per row. Compare button POSTs to Supabase, opens compare.html?id=xxx. No item limit.

### Delivery sorting
Parses free/fastest delivery, windows, cutoff times

### Telemetry
Sent via background.js. User can opt out via popup.

### Comparison page
- Loads from Supabase by ?id= (primary) or ?data= Base64 (legacy fallback)
- Sortable columns, best-value star, shareable links
- Filter bar: keyword, min reviews, source/retailer, hide sponsored — collapsible, expanded by default
- Columns: Product, Price, Per unit, Delivery, Rating, Reviews, Prime, Coupon/promo, Source
- Sponsored items show "Ad" badge in title cell

---

## 10. Known Issues / Deferred

- **Palette redesign needed** — live result unsatisfactory; use Claude Design for iteration
- **Product page panel** — disabled in manifest, deferred until post-alpha
- **Laundry pods show wrong unit ($/lb)** — fix before public launch
- **Mixed units in same search** — investigate
- **actuallyuseful.net** — not yet pointed at GitHub Pages
- **compare.html soldBy/shipsFrom/returnPolicy** — blank until product.js re-enabled
- **"Amazon search" link** — only works for comparisons created after v0.6.1.14; old Supabase rows lack `searchUrl`

---

## 11. Infrastructure

| Item | Detail |
|---|---|
| GitHub | github.com/tibbalsgribbin/actually-useful |
| GitHub Pages | tibbalsgribbin.github.io/actually-useful/ (live) |
| Project docs | `docs/` folder in GitHub repo |
| Supabase | Actually Useful / actually-useful, free tier |
| Chrome Web Store | Developer account created; unlisted submission pending |
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
- **End-of-session checklist:**
  1. Project_Briefing.md updated
  2. Changelog.md appended
  3. Roadmap.md updated
  4. Handover.md written
  5. All changed code files presented
  6. GitHub push reminder given
  7. Remind Melissa to update Project files in Claude after the push
