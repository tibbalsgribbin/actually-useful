# Actually Useful — Project Briefing
*"Actually Useful: Amazon but better."*
*Current version: v0.6.1.10 (overall) · v0.6.1 (manifest) · v0.6.1.8 (search.js) · v0.6.1.10 (compare.html) · Updated April 20, 2026 (Chat 19)*

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
| Email | amazon.butactuallyuseful@gmail.com |
| Google account | butactuallyuseful@gmail.com (InPrivate Edge only) |
| Feedback form | https://forms.gle/XU8RpYM3cGFTwQQ86 |
| Supabase | Actually Useful / actually-useful project, free tier |

---

## 2. Value Proposition — Four Pillars

These four pillars inform all copy, UX decisions, and feature prioritization. The problem is never named explicitly — only the benefit.

**Find the best value** — Sort by real price-per-unit across all results, not just total price. Stop doing the math yourself.

**See only what you searched for** — Filter results to exactly the product you asked for. No more irrelevant listings burying what you actually want.

**Cut through the noise** — Hide sellers you don't want, sort by delivery date, and build a shortlist as you browse. Shop on your terms, not Amazon's.

**Decide with confidence** — Everything in one clean panel, organized the way you actually think. Less clutter, less scrolling, less second-guessing.

Pillar four is the most distinctive and most personal. Never name the problem — only the benefit.

**Key differentiators:**
- Sorts results already rendered on the page — Amazon's "sort by price" drops results that lack a canonical price; Actually Useful never drops results
- Loads multiple pages and sorts/filters across all of them at once

---

## 3. The Data Spine: The Persistent Shortlist

Everything in the companion connects through the **persistent shortlist** — the user's active research file. Currently session-scoped (clears on browser close); cross-session persistence via `chrome.storage.local` is post-alpha.

**Shortlist item object shape sent to compare.html:**
```
{ asin, title, price (raw float), ppu (raw float), ppuUnit,
  delivery, rating, reviewCount, coupon }
```
Note: price and ppu are raw numbers — compare.html handles all formatting. soldBy, shipsFrom, returnPolicy, prime are not yet available from the search results page (product.js deferred).

---

## 4. Monetization Model

Free always. Revenue from Amazon Associates affiliate commissions + Ko-fi tips. No paywalls ever.

**Affiliate link policy:** Affiliate tags are applied on the website only — never in the extension. Amazon's policy explicitly forbids affiliate tags in browser extensions.

**Affiliate disclosure:** Every page must display: *"This post contains affiliate links. If you click through and make a purchase, I may earn a commission at no additional cost to you."* Standing rule: this disclaimer goes on every page, whether or not affiliate links are live.

Associates application deferred until real user base established.

---

## 5. Version Numbering

- Current: **v0.6.1** (manifest) / **v0.6.1.8** (search.js) / **v0.6.1.10** (compare.html)
- Increments normally: v0.6.2, v0.7, etc.
- Web Store public launch = **v1.0**
- Chrome manifests support three-part version numbers only; internal version can carry a fourth segment

---

## 6. Website Architecture

**Platform:** GitHub Pages (static, free, uses existing repo) + Supabase (free tier).

**Pages:**
- `index.html` — marketing/landing page ✅ live
- `compare.html` — Actually Useful Comparisons ✅ live — comparison table, sortable columns, shareable links via Supabase (`?id=xxx`)
- `search.html` — Actually Useful Searches (post-alpha)

**Supabase:**
- Project: Actually Useful / actually-useful, free tier
- Table: `comparisons` — id (int8), created_at (timestamptz), data (text), RLS disabled
- Publishable key and project URL stored in compare.html config constants
- Secret key: never goes in browser code

**Feedback form:**
- URL: https://forms.gle/XU8RpYM3cGFTwQQ86
- Pre-fill entry IDs: version = entry.1362282898 · browser = entry.1312500883
- Must use full viewform URL for pre-fill — forms.gle shortlinks don't support it
- search.js: `auFeedbackUrl()` pre-fills AU_VERSION + detected browser
- compare.html: inline script pre-fills "website" + detected browser

**Key decisions:**
- The Comparisons page must work for users who arrive via shared link without the extension
- Two-way extension ↔ website connection is post-alpha
- Affiliate tags on website only — never in extension

---

## 7. Extension File Structure

**Extension folder:** `C:\Users\tibba\GitHub\actually-useful\extension\`

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (MV3) |
| `background.js` | Service worker — search context relay + usage logging |
| `popup.html` | Extension popup — telemetry toggle + links |
| `popup.js` | Popup logic — loads/saves telemetry preference, shows version |
| `content/search.js` | Search results page panel |
| `content/product.js` | Product page panel (disabled during alpha) |
| `content/shared/core.js` | Shared: shortlist, nudge, shared constants |
| `content/shared/styles.css` | Shared styles for all panels |

`core.js` uses a **callback pattern** (not Promises).

**Code files are NOT stored in the Claude Project.** Melissa uploads them fresh from GitHub at the start of each session.

---

## 8. Panel Structure (search page)

Top to bottom:
1. **Header** — "Actually Useful" + help (?), collapse (⇕), close (×)
2. **Keyword row** — input + clear button + Start over button
3. **Keyword hint**
4. **Display as pills** — unit conversion (when applicable)
5. **Sort divider** *(collapsible)* — sort dropdown, Re-scan, Re-sort, Move ads, pages slider
6. **Filters divider** *(collapsible)* — min reviews + min rating sliders, source pills
7. **Scroll area** — shortlist bar (always visible) + result rows + load more
8. **Footer** *(always visible)* — sort note, info bar, feedback + Ko-fi links

**Shortlist bar:** Gmail-style `☐ ▾` dropdown (All/None) · *Select items to compare them.* → **Compare selected items in new tab**

---

## 9. Key Features

### Price-per-unit (PPU)
- Scraped from Amazon's reported unit price; calculated from price ÷ count when not available
- Liquid-dominant inference: oz treated as fl oz in liquid categories
- Best value star (★) on all items sharing the lowest PPU (floating-point safe, rounds to 6dp)
- Unit conversion via pills (fl oz, ml, oz weight, g, per item)

### Keyword filtering
- Inclusion, exclusion (`-word`), OR branches (`word1 OR word2` or `|`)
- Mismatches dimmed to bottom — never hidden
- 250ms debounce

### Sponsored button — three-state cycle
Move ads to end → Hide ads → Show ads

### Source filtering
Detects Amazon, Fresh, Whole Foods, Pharmacy, partner retailers. Toggle pills per source.

### Pages to load
Slider (1–10); 750ms throttle between fetches. Practical limit ~7 pages.

### Shortlist (session-scoped)
Checkbox per row. Shortlist bar always visible. Compare button opens compare.html.

### Delivery sorting
Parses free/fastest delivery, windows, cutoff times. WF free delivery excluded from soonest-free sort.

### Telemetry
Sent via background.js (bypasses CSP). User can opt out via popup. Default on.

### Shareable comparison links
- Share button above affiliate note
- First click: saves to Supabase, updates URL to `?id=xxx`, copies link
- Subsequent clicks: reuses existing id, re-copies
- Works for users arriving without the extension

---

## 10. Known Issues / Deferred

- **Product page panel** — disabled in manifest, deferred until post-alpha
- **Best-value star ties** — appears to be working; keep an eye on with varied PPU data
- **Page limit** — 7 pages in practice; not definitively researched
- **Thumbnail images on load-more pages** — not available via fetch()
- **Scrollbar track** — scroll wheel works; click/drag doesn't. Minor, deferred.
- **Amazon unit price math unreliable** for multi-pack listings — needs diagnostic-prices.js data first
- **Frequently Returned badge** — bold only; red deferred until product.js re-enabled
- **actuallyuseful.net** — not yet pointed at GitHub Pages
- **compare.html soldBy/shipsFrom/returnPolicy/prime** — blank until product.js re-enabled

---

## 11. Infrastructure

| Item | Detail |
|---|---|
| GitHub | github.com/tibbalsgribbin/actually-useful |
| GitHub Pages | tibbalsgribbin.github.io/actually-useful/ (live) |
| Project docs | `docs/` folder in GitHub repo |
| Supabase | Actually Useful / actually-useful, free tier |
| Greasy Fork | v5.19.0 — frozen, no further updates |
| Usage log | Google Sheet — payload relayed via background.js |
| Feedback form | https://forms.gle/XU8RpYM3cGFTwQQ86 |
| Ko-fi | ko-fi.com/butactuallyuseful |
| Contact | amazon.butactuallyuseful@gmail.com |

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

---

## 13. Working With Melissa

- Always confirm before executing any file changes
- Use targeted `str_replace` edits — not full rewrites unless unavoidable
- Code files are NOT in the Claude Project — upload fresh from GitHub each session
- Project documents live in `docs/` folder in GitHub
- Use the AskUserQuestion widget for clarifying questions — Melissa strongly prefers it
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
