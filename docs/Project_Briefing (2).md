# Actually Useful — Project Briefing
*"Actually Useful: Amazon but better."*
*Current version: v0.6.1.45 (Modular) · Updated May 3, 2026*

---

## 1. Project Overview

Actually Useful began as a Tampermonkey userscript. As of April 2026, it has pivoted to a **Chrome/Edge browser extension** (Manifest V3) with a significantly expanded scope: a **persistent shopping research companion** that travels with the user across the entire Amazon experience.

Actually Useful has transitioned to a **Modular Architecture** to improve maintainability and AI context management.

**Owner:** Melissa, retired, Seattle. Uses Microsoft Edge for primary testing. Has fibromyalgia causing brain fog and reduced memory — patience, thoroughness, and clear step-by-step instructions are essential.

| | |
|---|---|
| Brand | Actually Useful |
| Tagline | Actually Useful: Amazon but better. |
| Domain | actuallyuseful.net (Namecheap) — pointed at GitHub Pages; HTTPS enforcement active |
| GitHub | github.com/tibbalsgribbin/actually-useful (public) |
| GitHub Pages | tibbalsgribbal.github.io/actually-useful/ (live) |
| Ko-fi | ko-fi.com/butactuallyuseful |
| Email | butactuallyuseful@gmail.com |
| Google account | butactuallyuseful@gmail.com (InPrivate Edge only) |
| Feedback form | https://forms.gle/XU8RpYM3cGFTwQQ86 |
| Supabase | Actually Useful / actually-useful project, free tier |
| Chrome Web Store | Published unlisted — approved April 2026 |

---

## 2. Positioning — Public Facing

**Core positioning:** Amazon is built to sell what *they* want. Actually Useful is built to help you buy what *you* want.

**The two-stage story:** Actually Useful expands first (load up to 7 pages), then helps you narrow (filter, sort, shortlist), then decides (compare side by side). Most tools only narrow — AU expands AND narrows.

---

## 3. The Data Spine: The Persistent Shortlist

The **persistent shortlist** is the user's active research file. Currently session-scoped (clears on browser close); cross-session persistence via `chrome.storage.local` is post-alpha.

**Shortlist item object shape sent to compare.html (v0.6.1.30):**
`{ asin, title, price, listPrice, ppu, ppuUnit, isPrime, isSponsored, hasCoupon, couponPillOnly, sns, savings, freeDate, fastDate, freeDateTs, fastDateTs, freeWindowMinutes, freeWindowEnd, freeQualifier, fastCutoff, paidDate, paidCutoff, paidPrice, retailerKey, rating, reviewCount, note, ppuNote, imgUrl, isSnap, isFsaHsa, isClimatePledge, isSmallBusiness }`

---

## 4. Monetization Model

Free always. Revenue from Amazon Associates affiliate commissions + Ko-fi tips. No paywalls ever.
**Affiliate link policy:** Tags on website only — never in the extension.
**Affiliate disclosure:** Every page must display the standard disclaimer.

---

## 5. Version Numbering

- Current: **v0.6.1** (manifest) / **v0.6.1.45** (Modular)
- Web Store public launch = **v1.0**

---

## 6. Website Architecture

**Platform:** GitHub Pages (static) + Supabase (free tier).
**Kill switch:** `killswitch.json` in repo root. Extension fetches this at `actuallyuseful.net/killswitch.json` on every load.

---

## 7. Extension File Structure

The project utilizes a modular, segmented architecture to ensure resiliency and efficient context management during AI-assisted development.

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (MV3); loads modular scripts in order. |
| `background.js` | Service worker; handles context relay and usage logging. |
| `content/config.js` | **Resiliency Center**: Centralized CSS selectors, brand lists, and API keys. |
| `content/scraper.js` | **The Engine**: All PPU math, extraction logic (Fix 1, Fix 2), and solid product overrides. |
| `content/ui.js` | **The Interface**: Panel UI, Indigo palette, and event listeners. |
| `content/shared/core.js` | Shared constants and shortlist storage. |
| `content/shared/styles.css` | Global Indigo palette and UI styling. |

---

## 8. Palette — Monochromatic Indigo

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

---

## 9. Key Features

- **Price-per-unit (PPU):** Comprehensive scraping and recalculation logic (Fix 1/Fix 2) with solid product overrides.
- **Pages Slider:** Load 1-7 pages with throttled fetching.
- **Keyword Filtering:** inclusions, exclusions (-), and OR syntax.
- **Sponsored Ads:** Cycle between Move to End, Hide, or Show.
- **Shortlist:** Session-scoped checklist with per-item notes.
- **Comparison Page:** Side-by-side, sortable, shareable comparison table powered by Supabase.
- **Retailer Filtering:** Supports Amazon, Fresh, Whole Foods, and partners.
- **Badges:** Detection and filtering for SNAP EBT, FSA/HSA, Climate Pledge, and Small Business.
- **Kill Switch:** Remote emergency disable mechanism via JSON fetch.

---

## 13. Working With Melissa

- **Persona:** Melissa is the PM; Claude is the Senior Dev. Melissa does not write syntax.
- **Modular Protocol:** Use complete files for copy-pasting. No snippets or placeholders.
- **Sequential Updates:** For multi-file changes, establish a "Contract" first, then update files one-by-one.
- **Clean Room:** Each session starts with fresh file uploads from the local repository.
- **Selectable Text:** All text in the extension interface must be selectable (`user-select:text; cursor:text`).
- **Commit Messages:** Always provide a suggested commit message when a push is required.

---

## 14. Working Rules (Standing)

- **Script delivery:** Entire file overrides only. Working file at `/tmp/search_new.js`.
- **Template literals:** Use string concatenation (`+`) in `compare.html` to avoid heredoc escaping issues.
- **Rollback:** 3 failed fix attempts = revert to last stable commit.
