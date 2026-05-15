# Actually Useful — Roadmap

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## Current version: v0.6.1.80 (overall) · v0.6.1 (manifest) · v0.6.1.80 (search.js) · v0.6.1.53 (core.js) · compare.html updated Chat 66 · v0.6.1.17 (background.js) · styles.css updated Chat 68 · welcome.html updated Chat 66 · index.html updated Chat 66 · privacy.html updated Chat 66

---

## Known issues / needs testing

- **Contact lens solution — Amazon-reported $/fl oz unreliable** — stray numbers in title cause wrong unit price; needs recalculate-and-compare check
- **Cotton swabs — extractCount grabbing pack count instead of swab count** — "500 per Pack - 2 Pack" → shows 2 ct instead of 1000 ct
- **Razor blade $0.1/ct outlier** — one item still showing one decimal despite zero-pad fix
- **Pairs ambiguity** — socks/gloves sold in pairs AND multiples; uncertainty note added as interim
- **FSA/HSA, Climate Pledge Friendly, Small Business badge detection** — not yet verified on live Amazon searches
- **"Amazon search" link in compare.html** — only works for comparisons created after v0.6.1.14
- **Delivery time on compare.html** — only correct after v0.6.1.17
- **Thumbnails on compare.html** — only populated after v0.6.1.16
- **Paid delivery on compare.html** — only available after v0.6.1.27
- **isSnap on compare.html** — only available after v0.6.1.28
- **ppuNote on compare.html** — only available after v0.6.1.29
- **isFsaHsa/isClimatePledge/isSmallBusiness on compare.html** — only available after v0.6.1.34
- **Collapsible animation gone** — snap only; post-alpha
- **Other discount types not captured** — buy-multiple deals, vague "save X%" promos; post-alpha
- **compare.html logging** — deferred; compare.html can't read telemetry opt-out from chrome.storage.local; revisit when website has more surfaces
- **Brand filter mixed-case invented names** — Floerns, Verdusa, Wenrine etc. score 0 on heuristics; accepted gap, covered partially by bundled blocklist
- **Brand filter threshold tuning** — 25% high-noise threshold needs real-world calibration
- **Duplicate "Pages slider" comment** — cosmetic only, around line 2808 in search.js; fix opportunistically
- **Outlier PPU units sorting to top** — items with unusual units ($/lb for weighted heating pad, $/ft for a cord) sort to top as "best value" when their raw PPU is small. Needs design session before fix.
- **welcome.html screenshot** — current screenshot is old search; needs replacement with laundry pods screenshot, keyword filter active, annotated callout design. (Phase 6 of redesign supersedes this with full content rewrite.)
- **Prime scraping — possible Amazon selector change.** Two searches in Chat 61 showed no Prime badges detected. Amazon may have changed from a "Prime" filter to "Free Shipping by Amazon." Needs investigation.
- **Amazon Basics brand column shows — on compare.html** — needs investigation.
- **Dumbbells showing $/lb** — pre-existing outlier PPU issue; isMultiPackWeight correctly returns false for dumbbells, but weight-from-title still fires for single items. Needs design session.
- **Coral vs Amazon orange** — verify coral (#f25d4e) doesn't clash with Amazon's orange (#ff9900) on a real search page. Flag and adjust hex if needed (small adjustments acceptable within Phase 1).

---

## Working rules

**Single agent.** Claude only. No Replit, Gemini, Figma, or other tools touching code files directly.

**Confirm before coding.** Always align with Melissa on what we're building before touching any files. Do not code without explicit approval.

**One decision surface per session.**

**Context rot warning.** Long sessions degrade quality. Stop and wrap up rather than pushing through.

**Clean room protocol:** Code files are NOT stored in the Claude Project. At the start of each coding session, Melissa uploads current versions fresh from GitHub. Claude confirms version string before editing.

**File attachment rule:** If files come through as document blocks rather than actual file uploads, stop and ask Melissa to re-attach as uploads.

**CSS/JS consistency rule:** When removing JS visibility toggling from an element, always check and update the CSS baseline too.

**Template literal rule:** Never use Python heredoc string escaping for JavaScript template literals in compare.html. Use string concatenation (+).

**Brand list sync rule:** brand_blocklist.txt and amazon_brands.txt must be updated concurrently in extension/data/ AND repo root data/. Both files must always match.

**Version numbering:**
- Overall / canonical: v0.6.1.80 (search.js number)
- Per-file versions differ intentionally — files change at different rates
- v1.0 = Web Store public launch

**Affiliate tags:** Website only — never in the extension. Every outbound Amazon link from the website carries the Associates tag.

**Affiliate disclosure:** Every page. Standing rule.

**All text in the extension interface must be selectable.**

**Commit message rule:** Always provide a commit message when a GitHub push is needed.

**Don't touch weight unit logic without a design session first.**

**Rollback rule:** 3 failed fix attempts = stop, revert to last stable commit.

**search.js stays as one file** until selector resilience is properly designed.

**End of every session:**
1. Test before producing docs
2. Produce complete updated Project_Briefing.md, Roadmap.md, Changelog entry, and Handover.md as downloadable files — complete documents, not snippets or merge instructions
3. Give Melissa a suggested GitHub commit message
4. Remind Melissa to push to GitHub
5. Remind Melissa to update project files in Claude after the push

---

## Next session priorities

**Phase 4 of panel redesign — Panel chrome (minimize, drag, resize, snap).** Also wire the inert `#ppu-minimize` button. Brief: Panel_Redesign_Spec.md in the Claude Project.

Deferred coding work (returns after redesign complete):
- $/serving for protein powder — design session required
- Prime scraping investigation — check selectors against current Amazon HTML
- CWS push + Reddit posts — held pending redesign progress

---

## Panel Redesign — phase plan

Full spec: Panel_Redesign_Spec.md (in Claude Project).

- [x] Chat 64 — initial spec drafted (compare bar, filters layout, brand row, palette, settings, onboarding outline)
- [x] Chat 65 — all §10 open items locked, Step 0 added to workflow model, welcome page and wizard screen 1 rewritten, Phase 1 brief produced, onboarding mockups built
- [x] **Phase 1 — Palette migration + layout scaffold** (Chat 66) ✅
  - Coral + slate palette applied to styles.css, compare.html, index.html, welcome.html, privacy.html
  - Sort row always-visible (`#ppu-sort-row`), no longer in collapsible
  - Pages row always-visible (`#ppu-pages-standalone-row`), no longer in collapsible
  - Default pages = 4
  - "As Amazon listed" sort option (`amazon-default`)
  - Empty-state compare bar copy per §10.1; active copy per §10.4
  - Minimize button (−) present but inert — wire in Phase 4
  - Compare button disabled state when 0 items — tooltip added in Phase 2
- [x] **Phase 2 — Filters overlay (Option C)** (Chat 67) ✅
  - Filters collapsible replaced with trigger row (`#ppu-filters-trigger`) + slide-down overlay (`#ppu-filters-overlay`)
  - Five mini-sections: Quality, Price, Sources, Badges, Brand & delivery
  - Active count pill (all non-default states; Phase 5-ready structure)
  - Chevron rotation, ESC/tap-outside/×/trigger-row close behavior
  - Brand & delivery inline expansion ("Adjust for this search →")
  - Compare button "Nothing checked yet" tooltip (native title attr; pointer-events:none removed)
  - `au-filters-open` localStorage key no longer used
- [x] **Phase 3 — Card redesign** (Chat 68) ✅
  - Brand row: pill buttons replaced with plain text + ⋯ menu popover
  - Popover actions: "Always show [brand]" / "Always hide [brand]" (same allowlist/blocklist logic as before)
  - Popover close: ESC · click outside · click another card's ⋯ · click same ⋯ again · select an action
  - Card padding updated to spec: dense `8px 14px` (was `6px 10px 6px 8px`); comfortable `16px 14px`
  - Card density preference: storage key `auCardDensity` (`'dense'` | `'comfortable'`, default `'dense'`)
  - Density class applied to `#ppu-list` at render time (`.density-dense` / `.density-comfortable`)
  - Storage plumbed via `loadCardDensity(cb)` in startup chain; no UI to change it yet (Phase 5 / Phase 6)
- [ ] **Phase 4 — Panel chrome (minimize, drag, resize, snap)** — also wire `#ppu-minimize`
- [ ] **Phase 5 — Settings page**
- [ ] **Phase 6 — Onboarding refresh (welcome.html content rewrite, Personalize wizard, first-search brand hint)**
- [ ] **Phase 7 — Remaining website palette work and polish**

---

## v0.6.1.x release plan

- [x] Tampermonkey → Chrome extension (Chat 22)
- [x] Popup + toggle (Chat 22)
- [x] Search context relay via background.js (Chat 22)
- [x] Panel redesign (Chat 22)
- [x] Delivery dates — free and fast (Chat 23)
- [x] Prime filter (Chat 23)
- [x] Shortlist + compare (Chats 24–26)
- [x] Screenshots taken (Chat 27)
- [x] compare.html — full redesign (Chat 28)
- [x] Chrome Web Store — published unlisted (Chat 29)
- [x] Reddit posts live (Chats 29/30)
- [x] Reddit feedback received (Chat 38)
- [x] Rating filter (Chat 31)
- [x] Delivery filter (Chat 32)
- [x] Thumbnail images in panel (Chat 33)
- [x] Paid delivery date (Chat 33)
- [x] Source filter — Amazon / Fresh / Whole Foods pills (Chat 34)
- [x] SNAP EBT badge (Chat 35)
- [x] FSA/HSA badge (Chat 36)
- [x] Climate Pledge Friendly badge (Chat 36)
- [x] Small Business badge (Chat 36)
- [x] compare.html — filter bar (Chat 37)
- [x] compare.html — sortable columns (Chat 38)
- [x] compare.html — share (Supabase) (Chat 39)
- [x] compare.html — notes (Chat 40)
- [x] index.html — full rewrite (Chat 42)
- [x] Metropolitan Market source (Chat 43)
- [x] compare.html — column toggles (Chat 44)
- [x] Logging — 63 columns (Chat 46)
- [x] compare.html — resizable columns (Chat 47)
- [x] compare.html — sticky header + sticky scrollbar (Chat 48)
- [x] Brand filter — heuristic scoring (Chats 49–53)
- [x] compare.html — brand column (Chat 54)
- [x] Shortlist object shape — brand field added (Chat 55)
- [x] Dual-handle price range slider (Chat 56)
- [x] compare.html — hide slow shipping filters on Math.min(freeDateTs, fastDateTs) (Chat 57)
- [x] High-noise banner — dismissible X added (Chat 57)
- [x] PPU interpretation banner — X moved upper right (Chat 57)
- [x] Re-sync prompt — "You had X pages loaded — reload all?" (Chat 57)
- [x] Filter layout jank fixed (Chat 58)
- [x] Sort and Filters sections — localStorage collapsed state (Chat 58)
- [x] Sort chip — hidden when expanded, visible when collapsed (Chat 58)
- [x] Welcome page on install (Chat 59)
- [x] welcome.html created (Chat 59)
- [x] background.js onInstalled listener (Chat 59)
- [x] Keyword filter — full boolean parser rewrite (Chat 60)
- [x] Keyword filter UI — persistent label, hint block, placeholder (Chat 60)
- [x] extractCount — pack/pk patterns moved to end (Chat 61)
- [x] Keyword hint — hidden by default, shown on first keypress (Chat 61)
- [x] compare.html — boolean keyword parser ported (Chat 61)
- [x] isPaperWeightLb() helper (Chat 62)
- [x] isMultiPackWeight() helper (Chat 63)
- [x] isServingWeight() helper (Chat 63)
- [x] Multi-pack × weight PPU (Chat 63)
- [x] Oz hyphen fix (Chat 63)
- [x] Panel redesign — initial spec draft (Chat 64)
- [x] Panel redesign — §10 open items locked; Phase 1 brief; onboarding mockups (Chat 65)
- [x] **Phase 1 — Palette migration + layout scaffold** (Chat 66) ✅
- [x] **Phase 2 — Filters overlay (Option C)** (Chat 67) ✅
- [x] **Phase 3 — Card redesign** (Chat 68) ✅
- [ ] Phase 4 of panel redesign — panel chrome (also: wire `#ppu-minimize`)
- [ ] Phase 5 of panel redesign — settings page
- [ ] Phase 6 of panel redesign — onboarding refresh
- [ ] Phase 7 of panel redesign — website polish
- [ ] $/serving for protein powder — design session required (deferred during redesign)
- [ ] Prime scraping — investigate selector change (deferred during redesign)
- [ ] Add laundry pods (id=73) and laptop (id=74) sample links to index.html

### Alpha release — status
- [x] Screenshots taken (Chat 27)
- [x] Chrome Web Store — published unlisted (Chat 29)
- [x] Reddit posts live (Chats 29/30)
- [x] Reddit feedback received (Chat 38)
- [ ] r/vibecodedevs post
- [ ] Facebook post
- [ ] Test on a different setup (Mac or Chrome vs Edge)

### Infrastructure — status
- [x] GitHub Pages enabled + custom domain + HTTPS ✅
- [x] Kill switch active ✅
- [x] Supabase account + comparisons table
- [x] Chrome Web Store — published unlisted
- [x] Usage log — Google Sheet, 63 columns, fully in sync ✅
- [ ] Create Amazon account (prerequisite for Associates)
- [ ] Apply for Amazon Associates (after real user base)

### Chrome Web Store stats (as of May 11, 2026)
- 28 total installs · 12 weekly active users · 2 uninstalls
- 86% US · 7% Other · Germany and Italy (installs)
- 77% US · 13% Canada · 7% Italy (weekly users)
- 43% ChromeOS · 39% Windows · 18% Mac OS (installs)
- 79% Windows · 16% Mac OS · 5% ChromeOS (weekly users)

---

## Pre-public-CWS-listing checklist

- [x] SNAP EBT verified working ✅
- [x] index.html copy and CTA overhauled ✅
- [x] Kill switch in place ✅
- [x] Logging audit session ✅ (Chat 46)
- [x] Brand filter feature suite (Sessions 1–5 complete) ✅
- [x] Panel redesign spec locked (Chat 65) ✅

- [ ] Panel redesign Phases 1–6 complete
- [ ] Selector resilience refactor
- [ ] Self-test mode
- [ ] Anomaly/transparency banner audit pass
- [ ] Demo video recorded and embedded on landing page
- [ ] Bug-test spreadsheet — at least 5 categories passing
- [ ] Public-facing roadmap — GitHub Issues with roadmap label
- [ ] CWS listing description updated

---

## Post-alpha (v0.8+)

- Lazy product-page fetch architecture (Frequently Returned, variations, Sold by — progressive enrichment)
- Cross-session shortlist persistence
- "Hide this seller forever"
- "Cheaper at Whole Foods/Fresh" cross-source alerts
- Selector resilience refactor (if not completed pre-public)
- Walmart version
- Brand filter allowlist — bundled; add after telemetry shows false positives worth addressing
- compare.html logging — revisit when website has more surfaces

### Website (post-alpha)
- [ ] search.html — standalone search results page; AU features without being on Amazon; clean, ad-free alternative to tools like jungle-search.com
- [ ] Product pages on website — per-product research surface
- [ ] Gift lists, carts, saved-for-later surfaces
- [ ] "For nerds" transparency doc
- [ ] Demo video recorded and embedded
- [ ] Affiliate tags wired into all outbound Amazon links on website

---

## Deferred / deprioritized

- product.js — disabled during alpha; re-enable post-alpha
- Per-item "Frequently Returned" badge — requires product page fetch (post-alpha)
- Variation pricing warnings — requires product page fetch (post-alpha)
- Amazon Associates — apply when 50+ weekly active installs + 500 monthly site visitors
- Show HN / Product Hunt launch — coordinate with public CWS listing
- r/InternetIsBeautiful — after polish pass
- Cross-device blocklist sync — post-alpha (chrome.storage.sync, 100KB cap)
