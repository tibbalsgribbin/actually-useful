# Actually Useful — Project Briefing
*"Actually Useful: Amazon but better."*

*Stable core last touched: Chat 75 (welcome.html section updated — Phase 6 complete)*
*Volatile state last updated: Chat 75 (Phase 6 onboarding — end of Phase 6 bundle) — see PART TWO for current versions*

---

## How this document is organized

This file has two parts:

- **PART ONE — STABLE CORE** (§1–§13, §20). Standing facts and rules about the project. Changes rarely. When a section here changes, it means a standing project rule or fact has changed — flag the change explicitly in the Changelog.
- **PART TWO — VOLATILE STATE** (§14–§19). Current code state, current version numbers, phase-specific implementation notes. Rewritten at the end of each phase bundle.

---

# PART ONE — STABLE CORE

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

**The four-step shopping flow (new — Chat 65):** Amazon's own sidebar filters (department, brand, price range, Prime, "ships from Amazon") are Step 0 — the more focused the input list, the more powerful AU's contribution becomes. The three AU power features then carry the rest of the flow: **Expand** (load up to 7 pages), **Narrow** (keyword filter, brand filter, badges, etc.), **Decide** (shortlist and send to comparison workspace). The framing is cooperative with Amazon's UI, not replacing it.

**The extension-to-website arc:** The extension is the data bridge — it travels with the user on Amazon, captures what Amazon buries, and sends the user's research to the website. The website is where Actually Useful is fully realized: room to breathe, tools Amazon would never build, and the place where affiliate links can do their job. A user who never leaves the extension gets real value. A user who follows the research to the website gets everything.

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
- `search.html` — post-alpha — standalone search results page; AU features without being on Amazon
- Product pages — post-alpha — per-product research surface (price history, reviews, variants, return rate)
- Gift lists, carts, saved-for-later — post-alpha

**Affiliate tags:** Every outbound Amazon link from the website carries the Associates tag. The website is where monetization happens. The extension never carries tags — this is a firm standing rule.

**Telemetry:** compare.html can't read the user's telemetry opt-out from `chrome.storage.local`. For now, compare.html logging is deferred. Revisit when the website has more surfaces.

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

## 6. Version Numbering — rules

- **Overall / canonical version** = search.js version number (the main file).
- **Per-file versions** are tracked independently. Files change at different rates; their per-file versions differ intentionally.
- Web Store public launch = **v1.0**.
- Chrome manifests support three-part version numbers only; internal version carries a fourth segment.

*Current version numbers live in PART TWO §14.*

---

## 7. Website Architecture

**Platform:** GitHub Pages (static) + Supabase (free tier).

**Pages:**
- `index.html` — marketing/landing page ✅ live
- `privacy.html` — privacy policy ✅ live
- `welcome.html` — onboarding page (opens on fresh install via background.js `onInstalled`). Full rewrite Chat 75 — see §21.
- `compare.html` — Actually Useful Comparisons ✅ live — loads via ?id= (Supabase); ?data= fallback for old links

*Current palette state and recent changes per page live in PART TWO §15.*

---

## 8. Extension Architecture

**Files:**
- `manifest.json` — content scripts declared here
- `background.js` — onInstalled listener (opens welcome.html on fresh install); toolbar-icon restore listener; search context relay
- `content/core.js` — shortlist storage, nudge state, shared constants. Loaded first.
- `content/search.js` — all panel logic. One large file by design (selector resilience refactor post-alpha).
- `content/styles.css` — all panel styles
- `content/welcome-bridge.js` — content script on actuallyuseful.net/welcome*. Bridges wizard CustomEvents to chrome.storage.local. New Chat 75.
- `content/product.js` — disabled during alpha (manifest commented out)

**Data files:**
- `data/amazon_brands.txt` — bundled Amazon brand list
- `data/brand_blocklist.txt` — bundled unrecognized brand blocklist
- Both files must be updated concurrently in `extension/data/` AND repo root `data/`

*Current version numbers per file live in PART TWO §14.*

---

## 9. Telemetry / Logging

`chrome.storage.local` key `au_telemetry_enabled`. Default: opted in (`true`). User can opt out via the Settings page (§7.4) or via the welcome page privacy toggle. background.js checks this key before forwarding log payloads.

Logging fires on panel render with a 63-column payload to a Google Sheet via Google Apps Script webhook. Key fields: version, session ID, search term, result count, filter states, sort, pages loaded, unit types, source mix, delivery data quality.

No PII. No product titles, ASINs, or prices logged.

---

## 10. Brand Filter

Heuristic scoring system. Each brand gets a score based on: review count signal, title-brand match, known-brand list membership, blocklist membership. Brands scoring above threshold get demoted to end of results when "Move unrecognized brands to end" is checked.

**Personal brand rules:** Per-session allowlist (`auAllowlistBrands`) and blocklist (`auBlocklistBrands`) stored in `chrome.storage.local`. Managed via the per-card ⋯ menu on each card's brand row and the "My brand rules" overlay at the bottom of the panel.

---

## 11. Delivery Filter

"Hide slow shipping" checkbox + day presets (3/5/7/10/14 days). Hide-only. No demote option.

---

## 12. Price Range Filter — dual-handle slider (search.js v0.6.1.61)

search.js panel uses a dual-handle range slider. compare.html retains number inputs — appropriate for a fixed loaded dataset where dynamic bounds don't apply.

---

## 13. Keyword Filter — boolean search model (search.js v0.6.1.70, Chat 60; hint UI updated Chat 61)

Full boolean search model with the following operators:

| Operator | Meaning |
|---|---|
| `AND` | Top-level group separator — all groups must match |
| `OR` / `\|` / space | Alternatives within a group — any one matches |
| `"exact phrase"` | Strict adjacency match |
| `term*` / `t*m` | Wildcard anywhere in the word |
| `-term` / `NOT term` | Global exclusion — always applied first |
| `+term` | Same as bare required term |

**Example:** `unscented OR "fragrance-free" AND pods OR pa*s -sheet*`

**Implementation:** 3-pass parser in `parseKeywords`. `readToken` shared tokenizer. `tokenMatches` handles phrase/wildcard/word types. Ported to compare.html as `auParseKeywords` / `auReadToken` / `auTokenMatches` (Chat 61).

**UI (search.js):** Persistent label outside input. Hint block hidden by default — appears on first keypress, stays visible. × dismiss button resets flag so hint reappears on next first use. `localStorage` key: `au-kw-hint-seen`.

**UI (compare.html):** Include field hint updated to `(AND · OR · −exclude · "phrase" · wild*)`.

---

## 20. Working Rules (standing)

- **Single agent.** Claude only. No Replit, Gemini, Figma, or other tools touching code files directly.
- **Confirm before coding.** Always align on scope before touching files. Do not code without explicit approval.
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
- **Context rot warning:** long sessions degrade quality. Stop and wrap up rather than pushing through.

---

---
---

# PART TWO — VOLATILE STATE

*Everything below this line is current-snapshot information. Rewritten at end of each phase bundle.*

*Phase 6 bundle (close button + onboarding) complete as of Chat 75.*

---

## 14. Current versions (as of Chat 75)

- **Overall / canonical version:** v0.6.1.85 (search.js)
- **manifest:** v0.6.1
- **search.js:** v0.6.1.85
- **core.js:** v0.6.1.53
- **background.js:** v0.6.1.18
- **styles.css:** updated Chat 75
- **welcome.html:** rewritten Chat 75
- **welcome-bridge.js:** new Chat 75
- **compare.html:** updated Chat 66
- **index.html:** updated Chat 66
- **privacy.html:** updated Chat 66

---

## 15. Website pages — current state (as of Chat 75)

- `index.html` — fully overhauled Chat 42; palette migrated to coral+slate Chat 66
- `privacy.html` — palette migrated to coral+slate Chat 66
- `compare.html` — palette migrated to coral+slate Chat 66
- `welcome.html` — **full rewrite Chat 75** — see §21 below

---

## 16. compare.html — current feature state (as of Chat 66)

Palette migrated to coral+slate. All functionality unchanged from Chat 61.

**Filter bar:** include/exclude text (boolean parser), min reviews, min rating, min/max price, source, hide sponsored, Prime, SNAP, FSA/HSA, Climate Pledge, Small Business, hide unrecognized brands, hide Amazon brands, hide slow shipping + day presets.

**Table columns (all toggleable):** checkbox, thumbnail, product, price, per unit, free delivery, fastest delivery, rating, reviews, Prime, coupon/promo, source, brand, notes.

**Table UX:** resizable columns, sticky header, sticky horizontal scrollbar, cell text wrapping.

**Keyword highlight:** matching Include filter terms highlighted yellow in title column.

**Other:** liquid unit toggle, action bar (open tabs, show checked only, share checked, deselect all), share button (Supabase), editable notes, sort by any column.

**Not yet on compare.html:** logging (deferred — see §9).

---

## 17. Sort & Filters — layout (Phase 1, Chat 66; Phase 2, Chat 67)

Sort and Pages are **always-visible standalone rows** (`#ppu-sort-row`, `#ppu-pages-standalone-row`).

**Phase 2 (Chat 67):** Filters collapsible replaced with trigger row + slide-down overlay (`#ppu-filters-overlay`). Five mini-sections: Quality, Price, Sources, Badges, Brand & delivery.

**Active count pill (Phase 5, Chat 72):** Comparisons now against `userDefaults.*` (user-saved defaults from `chrome.storage.local`), falling back to built-in defaults.

**Sort options:** Best value ↑, Price low→high, Soonest FREE delivery, Soonest ANY delivery, As Amazon listed.

**Pages default:** `userDefaults.pages` (default 4). Panel auto-fetches this many pages on every build.

**Compare bar copy (Chat 70):**
- Unselected: "Check items below to send to the full comparison table — that's where Actually Useful really earns its name."
- Selected: "Take X items to the full comparison table"
- Sub-line (always visible): "Filter, sort, share, save with Actually Useful's research workspace"

---

## 18. Card layout — Phase 3 (Chat 68)

**Card padding:** dense default `8px 14px`. Comfortable variant `16px 14px`. Density class applied to `#ppu-list` at render time.

**Brand row:** plain text + ⋯ menu button (`.ppu-brand-menu-btn`). Clicking opens popover: "Always show [brand]" / "Always hide [brand]". Row hidden if no brand detected.

**Card density preference:** `auCardDensity` — `'dense'` (default) or `'comfortable'`. Settable via Settings page (Phase 5) and welcome page wizard (Phase 6).

---

## 18b. Panel chrome — Phase 4 (Chat 70)

**Minimize/expand:** `#ppu-minimize` button wired. Double-click title bar also works. Minimized header: logo · title · summary text · expand chevron · close.

**Close button (Chat 74):** `#ppu-close` and `#ppu-close-min` both wired. Click hides panel (`display: none`), DOM preserved. Toolbar icon restores. First-close toast fires once (`auHasSeenCloseToast`).

**Drag:** title bar drag handle. 4px / 200ms disambiguation.

**Resize:** left-edge handle. Width clamped 320–600px.

**Snap-to-edge:** 30px snap zone. Coral indicator stripe during drag. Snaps flush on release.

**Storage keys (Phase 4):**

| Key | Type | Default |
|---|---|---|
| `auPanelPosition` | `{ x, y, width }` | none |
| `auPanelMinimized` | boolean | `false` |
| `auPanelSnapped` | `"left" \| "right" \| null` | `null` |

---

## 18c. Settings page — Phase 5 (Chat 72)

**Access:** gear icon in expanded header, or "Settings" link in panel footer.

**Save behavior:** instant save on every control change. No Save button.

**Four sections:** §7.1 Defaults for every search · §7.2 Quality thresholds · §7.3 Brand & shipping · §7.4 Privacy.

**Reset to defaults:** two-click confirmation, 3-second revert. Clears all `auDefault*` keys plus `auCardDensity` and `au_telemetry_enabled`.

**Storage keys (Phase 5):**

| Key | Type | Default |
|---|---|---|
| `auDefaultSort` | string | `'ppu-asc'` |
| `auDefaultPages` | number | `4` |
| `auDefaultMoveAdsToEnd` | boolean | `true` |
| `auDefaultMinRating` | number | `0` |
| `auDefaultMinReviews` | number | `0` |
| `auDefaultMoveAmazonBrands` | boolean | `false` |
| `auDefaultMoveUnrecognized` | boolean | `true` |
| `auDefaultHideSlowShipping` | boolean | `false` |
| `auDefaultSlowShippingDays` | number | `7` |
| `au_telemetry_enabled` | boolean | `true` (existing key) |
| `auCardDensity` | string | `'dense'` (existing key) |

---

## 18d. Close button — Chat 74

**`background.js` v0.6.1.18:**
- `chrome.action.onClicked` listener → sends `{type: 'ppu-restore-panel'}` to active tab. Requires `default_popup` to be absent from manifest — documented dependency, do not re-add `default_popup` without revisiting this listener.
- `chrome.runtime.onInstalled` listener → opens `https://actuallyuseful.net/welcome` on `install` only.

**`search.js`:**
- `#ppu-close` / `#ppu-close-min` wired — hide panel via `display: none`.
- `ppu-restore-panel` message handler — restores panel.
- First-close toast — fires once, gated by `auHasSeenCloseToast`.

**Storage key:** `auHasSeenCloseToast` (boolean, default false).

---

## 19. Multi-pack × weight PPU — architecture summary (Chat 63)

`isMultiPackWeight(title)` — returns true when safe to multiply detected weight by pack count.

`isServingWeight(title, gQty)` — returns true when a gram value under 100g appears with supplement keywords. Suppresses per-serving nutrition figures from being used as product weight.

**Oz hyphen fix (v0.6.1.78):** All three oz extraction regexes use `[- ]*` instead of `\s*`.

---

## 21. Welcome page & wizard — Phase 6 (Chat 75)

**Auto-open:** `chrome.runtime.onInstalled` in background.js fires on `install` only. Opens `https://actuallyuseful.net/welcome`.

**Bridge mechanism:** `content/welcome-bridge.js` content script injected on `actuallyuseful.net/welcome*`. Listens for `au-wizard-save` CustomEvents from welcome page JS. Writes `key`/`value` from `event.detail` to `chrome.storage.local`. Required because the welcome page is a public website and cannot access `chrome.storage.local` directly.

**manifest.json** has a `content_scripts` entry for `https://actuallyuseful.net/welcome*` running `welcome-bridge.js`. Match pattern agrees with URL opened by `onInstalled`. No new permissions.

**Welcome content sections:**
1. Headline + tagline
2. Step 0 prologue callout (left-border accent)
3. Three feature cards: 01 Expand / 02 Narrow / 03 Decide
4. Brand controls explainer with visual mockup
5. Privacy/telemetry toggle (defaults on; reads/writes `au_telemetry_enabled`)
6. Two CTAs: "Get started" (scrolls to wizard) · "Skip and start shopping" (amazon.com)

**Personalize wizard (4 screens):**
- Screen 1: Loading expectations (informational — explains Step 0 tip and page count concept; no controls)
- Screen 2: Sort (`auDefaultSort`) + pages (`auDefaultPages`, with live time estimate)
- Screen 3: Quality thresholds — min rating (`auDefaultMinRating`) + min reviews (`auDefaultMinReviews`)
- Screen 4: Card density — visual card picker (`auCardDensity`)
- Progress bar, Back/Next/Skip on each screen, done state

Settings write to storage on every input change via `au-wizard-save` CustomEvents.

**Loading banner (replaces workflow banner):**
- `#ppu-loading-banner-slot` sits above `#ppu-filter-row` (old workflow banner slot).
- First time (`!hasSeenLoadingBanner`): amber full banner with spinner.
- Subsequent: thin coral progress strip, fills proportionally as pages load.
- Fades out on completion. Sets `auHasSeenLoadingBanner = true` on first completion.

**First-search brand-controls hint:**
- Fires once after `render()`, gated by `auHasSeenBrandHint`.
- Inline note (`#ppu-brand-hint-inline`) injected at top of `#ppu-list`.
- Tooltip (`#ppu-brand-hint-tooltip`) on first `.ppu-brand-menu-btn` on a card with a detected brand. Button gets `ppu-brand-hint-highlighted` class + pulse animation.
- Edge case: no detected brands → inline note shows alone, tooltip silently skipped.
- Four dismiss paths: Got it, ×, clicking any ⋯ menu, 30-second auto-dismiss. All set `auHasSeenBrandHint = true`.

**Storage keys (Phase 6):**

| Key | Type | Default |
|---|---|---|
| `auHasSeenLoadingBanner` | boolean | `false` |
| `auHasSeenBrandHint` | boolean | `false` |

**Removed:** `#ppu-workflow-banner` — HTML, CSS, dismiss handler, `au-banner-dismissed` localStorage key all removed. `au-banner-dismissed` orphaned in existing users' browsers (no migration).

**Copy status:** All user-facing copy on welcome.html and wizard marked `<!-- SUGGESTED COPY: ... -->`. Loading banner and brand hint text in search.js marked `// <!-- SUGGESTED COPY: ... -->`. Not locked in.

---

## Panel Redesign — phase status (as of Chat 75)

Full spec: Panel_Redesign_Spec.md in the Claude Project.

- [x] Chat 64 — initial spec drafted
- [x] Chat 65 — all §10 open items locked, Step 0 workflow model, Phase 1 brief produced, onboarding mockups built
- [x] **Phase 1 — Palette migration + layout scaffold** (Chat 66) ✅
- [x] **Phase 2 — Filters overlay (Option C)** (Chat 67) ✅
- [x] **Phase 3 — Card redesign** (Chat 68) ✅
- [x] **Phase 4 — Panel chrome** (Chat 70) ✅
- [x] **Phase 5 — Settings page** (Chat 72) ✅
- [x] **Close button (Path C)** (Chat 74) ✅
- [x] **Phase 6 — Onboarding refresh** (Chat 75) ✅
- [ ] **Phase 7 — Website polish** (scope TBD in Opus session)

---

## Document cadence — filename convention (adopted Chat 71)

`Project_Briefing.md` and `Roadmap.md` use the `_Chat[N].md` filename convention. Each version gets a unique filename. Coding files and uniquely-named docs (specs, mockups, briefs) are out of scope for this rule.

---

*End of PART TWO. Update at end of each phase bundle.*
