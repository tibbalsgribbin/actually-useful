# Actually Useful — Project Briefing
*"Actually Useful: Amazon but better."*
*Current version: v0.6.1.3 (extension) · Userscript frozen at v5.19.0 · Updated April 19, 2026 (Chat 12)*

---

## 1. Project Overview

Actually Useful began as a Tampermonkey userscript. As of April 2026, it has pivoted to a **Chrome/Edge browser extension** (Manifest V3) with a significantly expanded scope: a **persistent shopping research companion** that travels with the user across the entire Amazon experience.

**Owner:** Melissa, retired, Seattle. Uses Microsoft Edge for primary testing. Has fibromyalgia causing brain fog and reduced memory — patience, thoroughness, and clear step-by-step instructions are essential.

| | |
|---|---|
| Brand | Actually Useful |
| Tagline | Actually Useful: Amazon but better. |
| Domain | actuallyuseful.net (Namecheap) |
| GitHub | github.com/tibbalsgribbin/actually-useful (public) |
| Ko-fi | ko-fi.com/butactuallyuseful |
| Email | amazon.butactuallyuseful@gmail.com |
| Google account | butactuallyuseful@gmail.com (InPrivate Edge only) |
| Feedback form | https://forms.gle/J3AECVTDHWKDZZKE7 |

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

Each shortlisted item captures: title, ASIN, price at capture, PPU, ships from/sold by, return policy, Prime eligibility, delivery date, rating and review count, coupon/promotion, user note, timestamp, search term, affiliate-tagged link.

---

## 4. Monetization Model

Free always. Revenue from Amazon Associates affiliate commissions + Ko-fi tips. No paywalls ever.

**Affiliate link policy:** Affiliate tags are applied on the website only — never in the extension. The `AU_AFFILIATE_TAG` constant and `auTagUrl` function in `core.js` must be removed before any public release. Amazon's policy explicitly forbids affiliate tags in browser extensions.

Associates application deferred until real user base established. Melissa needs her own Amazon account (separate from family member's) for Associates eligibility.

---

## 5. Version Numbering

**Decided Chat 10:** Version numbers shifted to sub-1.0 to reflect that the product is not yet at full public release. History is preserved in the numbers.

- Current: **v0.6.1** (manifest) / **v0.6.1.3** (internal AU_VERSION)
- Increments normally: v0.6.2, v0.7, etc.
- A polished, stable product earns **v0.9**
- Web Store public launch = **v1.0**

Chrome manifests support three-part version numbers only — manifest uses `0.6.1`, internal AU_VERSION can carry the fourth segment.

---

## 6. Website Architecture

**Platform:** GitHub Pages (static, free, uses existing repo) + Supabase (free database for shareable links). Visitors never interact with GitHub — the website looks and works like any normal site.

**Pages planned:**
- `index.html` — marketing/landing page
- `compare.html` — comparison table; receives shortlist data from extension, renders results, applies affiliate tags to all outbound Amazon links, supports shareable permanent links
- `search.html` — power search form (Jungle Search model); constructs advanced Amazon search URL with affiliate tag

**Key decisions:**
- Shareable links are essential — implemented via Supabase (`actuallyuseful.net/compare?id=x7k2m`)
- Price history: link to Keepa per item (`keepa.com/product/[ASIN]`) — Keepa doesn't inject affiliate tags; CamelCamelCamel does and would redirect commissions away from AU
- Website cannot fetch Amazon results independently — Amazon blocks external scrapers; extension remains the Amazon-facing piece
- Two-way extension ↔ website connection (send refined shortlist back to extension) is post-alpha

---

## 7. Extension File Structure

**Extension folder:** `C:\Users\tibba\GitHub\actually-useful\extension\`
*(Note: a second folder `GitHub actually-useful` with a space existed previously — it is no longer used. GitHub Desktop and Edge now both point at the no-space folder.)*

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (MV3) |
| `background.js` | Service worker — search context relay |
| `content/search.js` | Search results page panel |
| `content/product.js` | Product page panel (disabled during alpha) |
| `content/shared/core.js` | Shared: shortlist, nudge, affiliate tag, version |
| `content/shared/styles.css` | Shared styles for all panels |

`core.js` uses a **callback pattern** (not Promises).

**Code files are NOT stored in the Claude Project.** Melissa uploads them fresh from GitHub at the start of each session.

---

## 8. Panel Structure (search page)

Top to bottom:
1. **Header** — "Actually Useful" + help (?), collapse (⇕), close (×)
2. **Keyword row** — input + clear button + Start over button
3. **Keyword hint** — "Actually Useful works best in conjunction with Amazon's existing filters…"
4. **Display as pills** — unit conversion (when applicable)
5. **Sort divider** *(clickable — collapses/expands Sort section)*
   - Sort dropdown, Re-scan page, Re-sort, Move ads button, Show selected, Clear selection
   - Pages to load slider (when next page exists)
6. **Filters divider** *(clickable — collapses/expands Filters section)*
   - Minimum reviews + Minimum rating sliders (side by side)
   - Source pills (when non-standard retailers detected)
7. **Scroll area**
   - Shortlist bar *(always visible, sticky at top)* — Select all checkbox + Open in tabs button
   - Result rows + load more
8. **Footer** *(always visible, pinned at bottom)*
   - Sort note (sparse data warning, when active)
   - Info bar (result count, active filters summary)
   - Give feedback · Buy me a coffee

---

## 9. Key Features

### Price-per-unit (PPU)
- Scraped from Amazon's reported unit price when available; calculated from price ÷ count when not
- Liquid-dominant inference: in liquid categories, oz treated as fl oz for sorting
- Best value star (★) on lowest PPU item among visible, comparable results
- Conversion between units via unit pills (fl oz, ml, oz weight, g, per item)

### Keyword filtering
- Supports inclusion terms, exclusion terms (`-word`), OR branches (`word1 OR word2` or `|`)
- Searches title + card text (badges, delivery info, promo text)
- Mismatches dimmed to bottom rather than hidden
- 250ms debounce on input — does not re-render on every keystroke

### Sponsored button — three-state cycle
- Move ads to end of results → ✓ Moved · Hide ads → ✓ Hidden · Show ads

### Source filtering
- Detects Amazon, Fresh, Whole Foods, Amazon Pharmacy, and partner retailers dynamically
- Toggle pills per source; off = hidden

### Pages to load
- Slider (1–10 pages); loads additional pages via `fetch()`
- Warning at ≥7 pages: Amazon sometimes limits results and those pages may be less relevant

### Shortlist (session)
- Checkbox on each row; checked items persist within session
- Shortlist bar always visible at top of scroll area: Select all (simple toggle) + Open in tabs button
- Select all: nothing checked → check all; anything checked → uncheck all. No confirm dialog.
- Show selected / Clear selection buttons in Sort section (rework deferred)

### Delivery sorting
- Parses free delivery date, fastest delivery date, delivery window, cutoff times
- Whole Foods free delivery excluded from "Soonest FREE delivery" sort (not included in Prime)

---

## 10. Known Issues / Deferred

- **Product page panel** — deferred until after alpha launch
- **Thumbnail images on load-more pages** — not available (fetched via `fetch()`, not live DOM)
- **Scrollbar track** — click/drag doesn't work; scroll wheel does. Minor, deferred.
- **Amazon unit price math unreliable** for multi-pack listings — Amazon uses per-unit weight as divisor instead of total weight. Do not attempt to fix without `diagnostic-prices.js` data.
- **Show Selected / Clear Selection buttons** — wording, behavior, and location need rethinking; likely moving to shortlist bar. Deferred.

---

## 11. Infrastructure

| Item | Detail |
|---|---|
| GitHub | github.com/tibbalsgribbin/actually-useful |
| Project docs | `docs/` folder in GitHub repo — Briefing, Changelog, Roadmap, Handover, and all reference documents |
| Greasy Fork | v5.19.0 — frozen, no further updates |
| Usage log | Google Sheet — linked in core.js Apps Script URL |
| Feedback form | https://forms.gle/J3AECVTDHWKDZZKE7 |
| Website | actuallyuseful.net — GitHub Pages + Supabase (setup pending) |
| Ko-fi | ko-fi.com/butactuallyuseful |
| Contact | amazon.butactuallyuseful@gmail.com |

---

## 12. Design Principles

- **Fill gaps in Amazon's interface** — don't duplicate what Amazon already does well
- **Don't duplicate what established tools do well** — surface them instead (Keepa for price history, Fakespot/ReviewMeta for review integrity)
- **Wrong numbers are worse than no numbers** — data integrity over convenience
- **Never drop results** — sort what is rendered
- **User intent matters more than physical precision** — liquid-dominant inference reflects shopper intent
- **Pillar four by design** — features reduce friction and cognitive load; described through benefits only
- **One continuous app** — panel feels seamless across all page types; state flows naturally between pages
- **Consistent UI chrome** — every panel shares the same header; positioning and drag behavior system-wide
- **Use Melissa's exact wording** — for UI messages, disclaimers, and copy; suggestions welcome, changes require conversation
- **Copy and tone** — "doesn't" not "won't"; confrontational framing avoided; voice is warm, direct, personal
- **Disclaimer placement** — global disclaimers at the bottom; row-level disclaimers inline; only when condition is active

---

## 13. Working With Melissa

- **Always confirm with Melissa before executing any file changes**
- Use targeted `str_replace` edits — not full rewrites unless unavoidable
- **Code files are NOT in the Claude Project** — Melissa uploads current versions fresh from GitHub at session start
- **Project documents live in `docs/` folder in GitHub** — download updated docs at end of session, put in `docs/`, commit with the code changes
- Mid-session: work from outputs folder once edits have started — never re-read from Project mid-session
- **Token efficiency rule:** Stop and explain if repeating an operation, producing output longer than the task warrants, or struggling with something normally straightforward
- **Context rot warning:** Long sessions degrade quality. Stop and wrap up rather than pushing through.
- **Session discipline:** One major task per session. Ship, test, document, then start fresh.
- **Bundle small changes** — don't ship a one-line fix alone; hold it for the next logical batch
- Has fibromyalgia causing brain fog and reduced memory — be patient, thorough, never ask her to hold multiple things in her head at once
- Many Google accounts — InPrivate Edge + butactuallyuseful@gmail.com only for all Google tasks
- **Use the AskUserQuestion widget** for clarifying questions — Melissa strongly prefers it over prose questions
- **Melissa handles simple file operations herself** — folder creation, file deletion, clicks
- **CSS/JS rule:** when removing JS visibility toggling, always check and update the CSS baseline too
- **End-of-session checklist — do not present files until all are complete:**
  1. Project_Briefing.md — updated if anything changed
  2. Changelog.md — new session appended
  3. Roadmap.md — version, known issues, next priorities updated
  4. Handover.md — written for next session
  5. All code files that changed
  6. GitHub push reminder given to Melissa
  7. Remind Melissa to update Project files in Claude after the push
