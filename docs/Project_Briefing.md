# Actually Useful — Project Briefing
*"Actually Useful: Amazon but better."*
*Current version: v0.6.1.79 (overall) · v0.6.1 (manifest) · v0.6.1.79 (search.js) · v0.6.1.53 (core.js) · compare.html updated Chat 66 · v0.6.1.17 (background.js)*
*Updated May 14, 2026 (Chat 67 — Phase 2 panel redesign: Filters overlay)*

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

- **Overall / canonical version:** v0.6.1.79 (search.js number — the main file)
- **Per-file versions:** search.js v0.6.1.79 · core.js v0.6.1.53 · compare.html updated Chat 66 · background.js v0.6.1.17 · manifest v0.6.1 · styles.css updated Chat 67 · welcome.html updated Chat 66 · index.html updated Chat 66 · privacy.html updated Chat 66
- Per-file versions differ intentionally — files change at different rates
- Web Store public launch = **v1.0**
- Chrome manifests support three-part version numbers only; internal version carries a fourth segment

---

## 7. Website Architecture

**Platform:** GitHub Pages (static) + Supabase (free tier).

**Pages:**
- `index.html` — marketing/landing page ✅ live — fully overhauled Chat 42; palette migrated to coral+slate Chat 66
- `privacy.html` — privacy policy ✅ live — palette migrated to coral+slate Chat 66
- `compare.html` — Actually Useful Comparisons ✅ live — loads via ?id= (Supabase); ?data= fallback for old links; palette migrated to coral+slate Chat 66
- `welcome.html` — onboarding page (Chat 59) — palette migrated to coral+slate Chat 66; content rewrite scheduled for Phase 6 of redesign

---

## 8. Extension Architecture

**Files:**
- `manifest.json` — v0.6.1; content scripts declared here
- `background.js` — v0.6.1.17; onInstalled listener (opens welcome.html); search context relay
- `content/core.js` — v0.6.1.53; shortlist storage, nudge state, shared constants. Loaded first.
- `content/search.js` — v0.6.1.79; all panel logic. One large file by design (selector resilience refactor post-alpha).
- `content/styles.css` — updated Chat 67; all panel styles
- `content/product.js` — disabled during alpha (manifest commented out)

**Data files:**
- `data/amazon_brands.txt` — bundled Amazon brand list
- `data/brand_blocklist.txt` — bundled unrecognized brand blocklist
- Both files must be updated concurrently in `extension/data/` AND repo root `data/`

---

## 9. Telemetry / Logging

`chrome.storage.local` key `au_telemetry_opted_out`. Default: opted in. User can opt out via the panel footer link.

Logging fires on panel render with a 63-column payload to a Google Sheet via Google Apps Script webhook. Key fields: version, session ID, search term, result count, filter states, sort, pages loaded, unit types, source mix, delivery data quality.

No PII. No product titles, ASINs, or prices logged.

---

## 10. Brand Filter

Heuristic scoring system. Each brand gets a score based on: review count signal, title-brand match, known-brand list membership, blocklist membership. Brands scoring above threshold get demoted to end of results when "Move unrecognized brands to end" is checked.

**Personal brand rules:** Per-session allowlist (`auAllowlistBrands`) and blocklist (`auBlocklistBrands`) stored in `chrome.storage.local`. Managed via "My brand rules" overlay (⋯ per-card menu).

---

## 11. Delivery Filter

"Hide slow shipping" checkbox + day presets (2/3/5/7/10/14/21 days). Hide-only. No demote option.

---

## 12. compare.html — current feature state (as of Chat 66)

Palette migrated to coral+slate. All functionality unchanged from Chat 61.

**Filter bar:** include/exclude text (boolean parser — AND/OR/phrase/wildcard/exclusion), min reviews, min rating, min/max price, source, hide sponsored, Prime, SNAP, FSA/HSA, Climate Pledge, Small Business, hide unrecognized brands, hide Amazon brands, hide slow shipping + day presets.

**Table columns (all toggleable):** checkbox, thumbnail, product, price, per unit, free delivery, fastest delivery, rating, reviews, Prime, coupon/promo, source, brand, notes. Delivery is two separate columns — Free delivery and Fastest delivery — each independently sortable.

**Table UX:** resizable columns, sticky header, sticky horizontal scrollbar, cell text wrapping.

**Keyword highlight:** matching Include filter terms highlighted yellow in title column. Works for word, phrase, and wildcard token types.

**Other:** liquid unit toggle, action bar (open tabs, show checked only, share checked, deselect all), share button (Supabase), editable notes, sort by any column.

**Not yet on compare.html:** logging (deferred — see Section 9).

---

## 13. Price Range Filter — dual-handle slider (search.js v0.6.1.61)

search.js panel uses a dual-handle range slider. compare.html retains number inputs — appropriate for a fixed loaded dataset where dynamic bounds don't apply.

---

## 14. Sort & Filters — layout (Phase 1, Chat 66; Phase 2, Chat 67)

Sort and Pages are **always-visible standalone rows** (`#ppu-sort-row`, `#ppu-pages-standalone-row`), no longer inside a collapsible section. The `au-sort-open` localStorage key is no longer used.

**Phase 2 (Chat 67):** The Filters collapsible has been replaced with a trigger row (`#ppu-filters-trigger`) + slide-down overlay (`#ppu-filters-overlay`). The `au-filters-open` localStorage key is no longer used. Overlay always starts closed. Five mini-sections inside: Quality, Price, Sources, Badges, Brand & delivery.

**Active count pill:** Shows count of all non-default filter states. Structured for Phase 5 swap to user-saved defaults (one-line change per field when Settings ships).

**Brand & delivery mini-section:** "Using your default settings. Adjust for this search →" link toggles inline expansion with the three brand/delivery controls. Expansion starts closed each session (no persistence).

**Compare button tooltip:** "Nothing checked yet" via native `title` attribute when button is in `.disabled` state. `pointer-events:none` removed from CSS so the title tooltip fires; click is blocked in JS instead.

**Sort options:** Best value ↑, Price low→high, Soonest FREE delivery, Soonest ANY delivery, As Amazon listed (`amazon-default` value — sorts by `originalIndex`).

**Pages default:** 4 (new installs). Slider resets to this on each fresh search. Stored values not applicable — pages slider is not persisted.

---

## 15. Welcome page (welcome.html, Chat 59; palette Chat 66)

Page at actuallyuseful.net/welcome. Opens on fresh install via chrome.runtime.onInstalled (background.js v0.6.1.17).

**Current state:** Coral+slate palette (Chat 66). Content unchanged from Chat 59.

**Phase 6 of redesign:** Full content rewrite reflecting the four-step shopping flow (Step 0 prologue + Expand/Narrow/Decide cards), brand-controls explainer, optional Personalize wizard link. Onboarding mockups built in Chat 65.

---

## 16. Keyword Filter — boolean search model (search.js v0.6.1.70, Chat 60; hint UI updated Chat 61)

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

**UI (compare.html):** Include field hint updated to `(AND · OR · −exclude · "phrase" · wild*)`. Placeholder matches search.js example.

---

## 17. Multi-pack × weight PPU — architecture summary (Chat 63)

**New helpers in search.js (v0.6.1.75+):**

`isMultiPackWeight(title)` — returns true when it's safe to multiply a detected weight by a pack count. Fires when EITHER: (C) a container word appears adjacent to the weight in the title, OR (B) a strong substance/food keyword appears anywhere in the title. Prevents dumbbells, cookware, and other weight-spec items from being multiplied.

`isServingWeight(title, gQty)` — returns true when a gram value under 100g appears with supplement keywords. Suppresses per-serving nutrition figures (e.g. "30g Protein") from being used as product weight.

**Logic:**
- `count&&price` branch: if `isMultiPackWeight` passes and weight found in title, uses weight-based PPU. count > 1 → multiply and show ppuNote. count = 1 → straight weight PPU.
- Weight-from-title fallback: same multiply logic for count > 1.
- `isServingWeight` nulls out gM2 in weight-from-title fallback.

**Oz hyphen fix (v0.6.1.78):** All three oz extraction regexes use `[- ]*` instead of `\s*`, catching "72-Ounce", "32-Ounce" etc.

---

## 18. Panel Redesign — phase status (as of Chat 67)

Full spec: Panel_Redesign_Spec.md in the Claude Project.

- [x] Chat 64 — initial spec drafted
- [x] Chat 65 — all §10 open items locked, Step 0 workflow model, Phase 1 brief produced, onboarding mockups built
- [x] **Phase 1 — Palette migration + layout scaffold** (Chat 66) ✅
- [x] **Phase 2 — Filters overlay (Option C)** (Chat 67) ✅
- [ ] Phase 3 — Card redesign (brand row → plain text + ⋯ menu, density preference)
- [ ] Phase 4 — Panel chrome (minimize, drag, resize, snap) — also: wire `#ppu-minimize`
- [ ] Phase 5 — Settings page
- [ ] Phase 6 — Onboarding refresh (welcome.html content rewrite, Personalize wizard, first-search brand hint)
- [ ] Phase 7 — Remaining website palette work and polish

---

## 19. Working Rules (standing)

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
