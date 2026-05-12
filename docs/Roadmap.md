# Actually Useful — Roadmap

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## Current version: v0.6.1.72 (overall) · v0.6.1 (manifest) · v0.6.1.72 (search.js) · v0.6.1.53 (core.js) · compare.html updated Chat 61 · v0.6.1.17 (background.js) · styles.css updated Chat 60 · welcome.html created Chat 59

---

## Known issues / needs testing

- **Multi-pack weight PPU wrong** — Amazon reports $/oz per item in a multi-pack, not per total package weight. Needs design session before any fix attempt.
- **Contact lens solution — Amazon-reported $/fl oz unreliable** — stray numbers in title cause wrong unit price; needs recalculate-and-compare check
- **Cotton swabs — extractCount grabbing pack count instead of swab count** — "500 per Pack - 2 Pack" → shows 2 ct instead of 1000 ct
- **Razor blade $0.1/ct outlier** — one item still showing one decimal despite zero-pad fix
- **Pairs ambiguity** — socks/gloves sold in pairs AND multiples; uncertainty note added as interim
- **FSA/HSA, Climate Pledge Friendly, Small Business badge detection** — not yet verified on live Amazon searches
- **Blue/indigo palette inconsistency** — extension panel is blue; website is indigo. Full unification post-alpha.
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
- **welcome.html screenshot** — current screenshot is old search; needs replacement with laundry pods screenshot, keyword filter active, annotated callout design
- **Cardstock $/lb PPU — parseTitleWeightQty guard insufficient.** Cardstock items with paper-weight specs ("65 lb Cover Weight", "110 lb Index Weight") still showing $/lb PPU via a different code path than parseTitleWeightQty. Needs a design session. "cardstock" may need to be added to SOLID_KEYWORDS. Do not attempt a quick fix — this touches weight unit logic.
- **Prime scraping — possible Amazon selector change.** Two searches in Chat 61 showed no Prime badges detected. Amazon may have changed from a "Prime" filter to "Free Shipping by Amazon." Needs investigation.
- **scrapeBrand Strategy 3 (first-word fallback) unreliable** — returns "Premium" instead of "Astrobrights." First word of title is not reliably a brand name. Needs design session; Melissa has scraper data that may help.
- **Amazon Basics brand column shows — on compare.html** — needs investigation.

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
- Overall / canonical: v0.6.1.72 (search.js number)
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

## Next session priorities (in order)

1. **Cardstock PPU design session** — add "cardstock" to SOLID_KEYWORDS? Exclude paper-weight lb from weight-from-title path? Don't touch without scoping first.
2. **scrapeBrand Strategy 3 design** — remove or tighten first-word fallback; use Melissa's scraper data to inform better detection
3. **Prime scraping investigation** — check selectors against current Amazon HTML
4. **welcome.html screenshot** — laundry pods, annotated callout design
5. **CWS push + Reddit posts** — held pending above

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
- [x] Keyword filter (Chat 32)
- [x] Sponsored filter (Chat 33)
- [x] Source filter (Chat 33)
- [x] Price range filter (Chat 34)
- [x] Re-sync button (Chat 35)
- [x] Pages slider (Chat 35)
- [x] PPU Fix 1 — recalculate when Amazon's $/ct equals full item price (Chat 38)
- [x] PPU Fix 2 — suppress / calculate $/ft from footage (Chat 38)
- [x] Pairs uncertainty note + mixed-units transparency banner (Chat 38)
- [x] ppuNote field added to compare payload (Chat 38)
- [x] FSA/HSA, Climate Pledge, Small Business badges (Chat 39)
- [x] Badge filters — vertical stack, results summary updates (Chat 40/44)
- [x] SOLID_KEYWORDS gains toothpaste/tooth paste (Chat 41)
- [x] Fix 2 weight regex extended — word-form weights (Chat 41)
- [x] PPU formatting — zero-pad + sub-penny 3 decimal places (Chat 41)
- [x] index.html — complete copy and layout overhaul (Chat 42)
- [x] actuallyuseful.net → GitHub Pages + HTTPS enforcement active ✅ (Chats 42–44)
- [x] solidUnitIsWrong — fuzzy 1% comparison (Chat 44)
- [x] normalizeUnit gains "X per Y" suffix strip (Chat 44)
- [x] parseTitleWeightQty + weight sanity check (Chat 44)
- [x] formatPPU threshold raised to ppu < 0.10 (Chat 44)
- [x] extractCount gains "N Adj Tubes/Sticks/Bottles/Jars" patterns (Chat 44)
- [x] solidUnitIsWrong covers liquid units (Chat 44)
- [x] Weight-from-title fallback calc (Chat 44)
- [x] Weight unit normalization — inferWeightDominant(), unit pills, status message (Chat 44)
- [x] Kill switch — killswitch.json fetch at load; disabled:true halts extension (Chat 44)
- [x] manifest.json host_permissions gains actuallyuseful.net (Chat 44)
- [x] killswitch.json added to repo root (Chat 44)
- [x] Slider max = 7 ✅ (Chat 44)
- [x] Extension panel redesigned to blue palette — styles.css (Chat 45)
- [x] Project documents consolidated and cleaned (Chat 45)
- [x] Logging audit — 10 new fields added to doLog() payload (Chat 46)
- [x] Apps Script updated to Version 2; sheet ID corrected (Chat 46)
- [x] Google Sheet header row updated to 46 columns (Chat 46)
- [x] AU_VERSION bumped to 0.6.1.46 in core.js and search.js (Chat 46)
- [x] China/origin filter — research and design (Chat 47, see Brand_Filter_Design.md)
- [x] Brand filter Session 1 — scrapeBrand(), detectGibberishBrand(), 5 signals, brand field in item object + compare payload (Chat 48)
- [x] brand_blocklist.txt created — 70 starter brands, extension/data/ (Chat 48)
- [x] Brand filter Session 2 — UI, hide/demote toggle, below-the-line divider, high-noise banner (Chat 49)
- [x] 10 brand filter fields added to doLog(); sheet goes to 56 columns (Chat 49)
- [x] Brand filter Session 3 — bundled blocklist wired up, personal blocklist, [•••] per-card menu, management view (Chat 50)
- [x] High-noise banner text updated — Amazon brand filter + sponsored nudge added (Chat 50)
- [x] 2 personal blocklist fields added to doLog(); sheet goes to 58 columns (Chat 50)
- [x] manifest.json web_accessible_resources — data/brand_blocklist.txt (Chat 50)
- [x] Brand filter Session 3 retrofit — brand row UI rework, personal allowlist, bug fixes (Chat 51)
- [x] Brand row: always-visible "Always show / Always hide" replaces [•••] dropdown (Chat 51)
- [x] Personal allowlist (auAllowlistBrands) — implemented and wired into detectGibberishBrand (Chat 51)
- [x] "My brand rules" management view — two sections, remove without closing overlay (Chat 51)
- [x] AU_VERSION bumped in core.js to 0.6.1.53 (Chat 52)
- [x] Brand filter Session 4 — delivery window filter (Chat 52)
- [x] Delivery filter: "Hide slow shipping" checkbox + day presets (2/3/5/7/10/14/21), hide-only, exempt items with no date (Chat 52)
- [x] 3 delivery filter fields added to doLog(); sheet goes to 61 columns actual (Chat 52)
- [x] Brand row copy: shows "[BrandName]: [Always show] [Always hide]" (Chat 52)
- [x] Brand filter Session 5 — Amazon-brands demote toggle + filter UI polish + copy fixes (Chat 53)
- [x] amazon_brands.txt created, wired up (Chat 53)
- [x] Both brand filters now demote-only; pill toggle removed (Chat 53)
- [x] Divider labels updated: amber pill for unrecognized brands, blue pill for Amazon brands (Chat 53 design, Chat 54 CSS)
- [x] 2 Amazon brands fields added to doLog(); sheet goes to 63 columns actual (Chat 53)
- [x] manifest.json web_accessible_resources — data/amazon_brands.txt (Chat 53)
- [x] Price range filter replaced with dual-handle slider — bounds from live data (Chat 54)
- [x] 7-page warning removed (Chat 54)
- [x] Active-filters dec-bar hides when Filters section is collapsed (Chat 54)
- [x] Apps Script updated to Version 3 — all 63 fields (Chat 54)
- [x] Google Sheet header row updated to 63 columns (Chat 54)
- [x] compare.html sync — brand column, brand filters, delivery filter, resizable columns, sticky header, sticky scrollbar, cell wrapping, reduced padding (Chat 55)
- [x] Website data/ folder — brand_blocklist.txt and amazon_brands.txt added (Chat 55)
- [x] Website strategy framing added to Project Briefing (Chat 56)
- [x] compare.html logging — deferred (Chat 56, see Section 10 of Briefing)
- [x] scrapeBrand() Strategy 2 fix — "bought in past month" excluded from brand scraping (Chat 57)
- [x] Delivery scraper fix — combined free+fastest div now correctly captures both dates using two bold elements (Chat 57)
- [x] compare.html delivery column split into Free delivery + Fastest delivery — independent sort (Chat 57)
- [x] compare.html Hide slow shipping — now filters on Math.min(freeDateTs, fastDateTs) (Chat 57)
- [x] High-noise banner — dismissible X added, upper right (Chat 57)
- [x] PPU interpretation banner — X moved to upper right (Chat 57)
- [x] Re-sync prompt — "You had X pages loaded — reload all?" with Yes/No (Chat 57)
- [x] Filter layout jank fixed — three checkbox rows unified (styles.css, Chat 58)
- [x] Keyword input background — white (#ffffff), was grey (#f9f9fc) (styles.css, Chat 58)
- [x] Sort and Filters sections remember collapsed state — localStorage, first-time default expanded (search.js, Chat 58)
- [x] Sort chip ("Best value ↑") — hidden when Sort expanded, visible when collapsed (search.js, Chat 58)
- [x] Welcome page on install — chrome.runtime.onInstalled (Chat 59)
- [x] welcome.html created — onboarding page at actuallyuseful.net/welcome (Chat 59)
- [x] background.js onInstalled listener — opens welcome on fresh install (Chat 59)
- [x] Note click fix — querySelectorAll wiring for innerHTML-rendered note spans (Chat 59)
- [x] Pages slider fill fix — updatePagesSliderFill max corrected from 10 to 7 (Chat 59)
- [x] Keyword smart quote fix — parseKeywords strips curly/straight quotes (Chat 59)
- [x] Compare subtext inline color removed; CSS rules added (Chat 59)
- [x] Sponsored button active color — coral → indigo (Chat 59)
- [x] Dec-bar hidden — display:none (Chat 59)
- [x] Footer text smaller and tighter (Chat 59)
- [x] Keyword highlight yellow background (Chat 59)
- [x] Keyword filter — full parser rewrite: AND-group boolean model (Chat 60)
- [x] Keyword filter — quoted phrase support, strict adjacency (Chat 60)
- [x] Keyword filter — wildcard anywhere in word, pa*s matches pacs/paks/packs (Chat 60)
- [x] Keyword filter — AND as top-level group separator; OR/space/| as alternatives within group (Chat 60)
- [x] Keyword filter — NOT, +, AND as explicit operators (Chat 60)
- [x] Keyword filter — punctuation stripping fix for wildcard word matching (Chat 60)
- [x] Keyword filter UI — persistent label outside input, 3-line hint block, updated placeholder (Chat 60)
- [x] styles.css — ppu-kw-wrap column flex, new label/input-row/hint classes, filter-row align-items flex-start (Chat 60)
- [x] extractCount — pack/pk patterns moved to end; "1 Pack (250 Sheets)" returns 250 not 1 (Chat 61)
- [x] Keyword hint — hidden by default, shown on first keypress, × dismiss resets flag (Chat 61)
- [x] scrapeBrand — whitespace normalization via cleanBrand() helper (Chat 61)
- [x] parseTitleWeightQty — paper-weight lb guard (cover/bond/text/index/weight/cardstock/gsm/basis) — NOTE: insufficient, cardstock still shows $/lb via different path (Chat 61)
- [x] compare.html — boolean keyword parser ported (auParseKeywords/auReadToken/auTokenMatches) (Chat 61)
- [x] compare.html — Include filter hint text and placeholder updated (Chat 61)
- [x] compare.html — keyword highlight in title column via highlightTitle() (Chat 61)
- [ ] Cardstock PPU — design session required
- [ ] scrapeBrand Strategy 3 — design session required
- [ ] Prime scraping — investigate selector change
- [ ] welcome.html screenshot — laundry pods, annotated callout design
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

- [ ] Selector resilience refactor
- [ ] Self-test mode
- [ ] Anomaly/transparency banner audit pass
- [ ] Demo video recorded and embedded on landing page
- [ ] Bug-test spreadsheet — at least 5 categories passing
- [ ] Public-facing roadmap — GitHub Issues with roadmap label
- [ ] CWS listing description updated

---

## v0.7 — Brand filter feature suite (designed Chat 47)

Full design in Brand_Filter_Design.md.

- [x] Session 1: brand text scraping + heuristic detector (no UI) ✅ Chat 48
- [x] Session 2: brand filter UI + hide/demote toggle + high-noise banner ✅ Chat 49
- [x] Session 3: bundled blocklist wire-up + personal blocklist + [•••] menu + management view ✅ Chat 50
- [x] Session 3 retrofit: brand row UI rework + personal allowlist + bug fixes ✅ Chat 51
- [x] Session 4: delivery window filter ✅ Chat 52
- [x] Session 5: Amazon-brands demote toggle + polish ✅ Chat 53
- [x] Session 6: compare.html integration ✅ Chat 55

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

---

## Brand filter tuning — categories to test

- "floral summer dress" ✅ tested Chat 49 — 187/380 flagged, banner fires, working
- "yoga pants" — added Chat 49, not yet tested
- "home décor" — high junk likelihood
- "phone case" — high junk likelihood
- "dog treats" — lower junk likelihood, good false-positive check
- "paper towels" — should be near-zero noise, good false-positive check
- "laundry detergent" — same
