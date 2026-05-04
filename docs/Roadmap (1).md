# Actually Useful — Roadmap

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## Current version: v0.6.1.45 (overall) · v0.6.1 (manifest) · v0.6.1.45 (search.js) · v0.6.1.30 (compare.html)

---

## Known issues / needs testing

- **Multi-pack weight PPU wrong** — Amazon reports $/oz per item in a multi-pack, not per total package weight (e.g. Hello toothpaste 3×5oz shows $3.59/oz; correct is ~$1.20/oz). Needs design session before any fix attempt.
- **Contact lens solution — Amazon-reported $/fl oz unreliable:** when title contains volume + count (or stray number like "(12)"), Amazon calculates wrong unit price and AU displays it uncritically. Needs a liquid recalculation check.
- **Cotton swabs — extractCount grabbing pack count instead of swab count:** "500 per Pack - 2 Pack" → shows 2 ct instead of 1000 ct. Also one case where count found (500) but PPU calculates as price/1 — count stored but not used
- **Razor blade $0.1/ct outlier** — one item ($9.96/100ct) still showing one decimal despite zero-pad fix; source unclear
- **Rice solid product override edge case** — "15 lbs (Pack of 2)" triggering solid override incorrectly; some rice edge cases may still be wrong
- **Cardstock "1 Pack (250 Sheets)":** `extractCount` picks up 1 from "1 Pack" before 250 from "Sheets" — wrong PPU
- **Pairs ambiguity:** items sold in pairs AND multiples (socks, gloves) — pairs uncertainty note added as interim; full fix deferred
- **FSA/HSA, Climate Pledge Friendly, Small Business badge detection** — not yet verified on live Amazon searches
- **Auto-resort on Re-sync page-add** — not yet verified; may not fire when adding a single additional page
- **"Amazon search" link in compare.html** — only works for comparisons created after v0.6.1.14
- **Delivery time on compare.html** — only correct for comparisons created after v0.6.1.17
- **Thumbnails on compare.html** — only populated for comparisons created after v0.6.1.16
- **Paid delivery on compare.html** — only available for comparisons created after v0.6.1.27
- **isSnap on compare.html** — only available for comparisons created after v0.6.1.28
- **ppuNote on compare.html** — only available for comparisons created after v0.6.1.29
- **isFsaHsa/isClimatePledge/isSmallBusiness on compare.html** — only available for comparisons created after v0.6.1.34
- **Collapsible animation gone** — snap only; post-alpha
- **Other discount types not captured** — buy-multiple deals, vague "save X%" promos not yet shown in coupon column; flagged for later

---

## Working rules

**Script delivery:** targeted `str_replace` edits on existing file — not full rewrites. Working file at `/tmp/search_new.js`. Copy to `/home/runner/workspace/search.js` for packaging. Always package as `.tar.gz`. When multiple files ship together (e.g. manifest.json + search.js + killswitch.json), include all in one tar.gz.

**Confirm before coding.** Always align with Melissa on what we're building before touching any files.

**One decision surface per session.**

**Context rot warning.** Long sessions degrade quality. Stop and wrap up rather than pushing through.

**Always include context/token status** when asking "continue or wrap up?"

**Code files — new protocol (from Chat 7):**
- Code files are NOT stored in the Claude Project
- At the start of each session, Melissa uploads the current versions fresh from GitHub
- Claude works only from those uploaded files

**Stale file prevention — start of every session:**
1. Melissa uploads current code files from GitHub
2. Claude confirms version string (search.js header comment)
3. Only then do edits begin

**File attachment rule:** If files come through as document blocks rather than actual file uploads, stop and ask Melissa to re-attach as uploads.

**CSS/JS consistency rule:** When removing JS visibility toggling from an element, always check and update the CSS baseline too.

**Confirm before committing:** Pause between "files produced" and "push to GitHub." Test first, commit after.

**Template literal rule:** Never use Python heredoc string escaping for JavaScript template literals in compare.html. Use string concatenation (`+`).

**Version numbering:**
- Current: v0.6.1 (manifest) / v0.6.1.45 (search.js) / v0.6.1.30 (compare.html)
- v1.0 = Web Store public launch

**Affiliate tags:** Website only — never in the extension.

**Amazon Associates disclaimer:** Every page gets the disclaimer. Standing rule.

**All text in the extension interface must be selectable.** `user-select:text; cursor:text`.

**Commit message rule:** Always provide a commit message when a GitHub push is needed.

**Don't conflate "small code change" with "well-understood problem."** Weight unit bugs proved complexity hides in Amazon's data, not just the code. Don't touch weight unit logic without a design session first.

**Rollback rule:** If three attempts at fixing a bug fail in one session, stop. Roll back to last stable commit.

**End of every session:**
1. Present all changed files for download
2. Give Melissa a suggested GitHub commit message
3. Remind Melissa to push to GitHub
4. Update Project_Briefing.md and Roadmap.md
5. Remind Melissa to update project files in Claude after the push

---

## Next session priorities (in order)

1. **Welcome page on install** — `chrome.runtime.onInstalled` opens a one-tab page explaining the workflow; first impression for every new user; currently there's silence on install
2. **Fix extractCount "1 Pack (250 Sheets)"** — pack/count ordering fix
3. **Verify auto-resort fires on Re-sync page-add** — investigate and fix if needed
4. **Add laundry pods (id=73) and laptop (id=74) sample links to index.html** — now that weight unit display is improved
5. **Selector resilience refactor** — pull all CSS selectors into a named object; add multi-strategy fallbacks per field

---

## Release plan

### v0.6.1.x — in progress

- [x] All regression fixes and polish (Chats 4–9)
- [x] Minimum rating filter fixed (Chat 13)
- [x] product.js disabled in manifest (Chat 13)
- [x] Affiliate tag machinery removed from core.js (Chat 13)
- [x] Ko-fi link fixed (Chat 14)
- [x] Page-fetch throttling (Chat 14)
- [x] auSendLog moved to background.js (Chat 14)
- [x] Telemetry opt-out toggle + popup (Chat 14)
- [x] Feedback form verified (Chat 15)
- [x] Landing page live (Chat 15)
- [x] compare.html built (Chat 16)
- [x] Compare button + Gmail select-all (Chat 17)
- [x] Supabase shareable links (Chat 18)
- [x] Feedback form pre-fill (Chat 19)
- [x] Keyword filter bug fixed (Chat 20)
- [x] privacy.html built (Chat 20)
- [x] Supabase compare — no item limit (Chat 21)
- [x] renderError split into two states (Chat 21)
- [x] Lavender Fields palette applied (Chat 21) — redesigned to monochromatic indigo (Chat 27 pre-session)
- [x] Compare payload expanded — isPrime, isSponsored, full coupon/delivery/retailer fields (Chat 22)
- [x] Compare table updated — new columns, removed blank columns (Chat 22)
- [x] Filter bar on compare.html — keyword, min reviews, source, hide sponsored (Chat 22)
- [x] Coupon/promo sort fixed (Chat 23)
- [x] Delivery sort fixed (Chat 23)
- [x] Search term badge (Chat 23)
- [x] Keyword focus fixed (Chat 23)
- [x] Price range filter (Chat 23)
- [x] searchUrl + freeDateTs/fastDateTs added to compare payload (Chat 23)
- [x] Notes field per item in extension panel (Chat 25)
- [x] Notes in compare payload (Chat 25)
- [x] listPrice in compare payload (Chat 25)
- [x] Price range filter in extension panel (Chat 25)
- [x] Coupon display on compare.html (Chat 25)
- [x] Delivery times on compare.html (Chat 25)
- [x] Liquid unit toggle on compare.html (Chat 25)
- [x] Notes column on compare.html (Chat 25)
- [x] imgUrl added to compare payload (Chat 26)
- [x] Notes field reworked — link/preview pattern (Chat 26)
- [x] Delivery time fixed on compare.html (Chat 26)
- [x] index.html shortlist blurb rewritten (Chat 27)
- [x] index.html affiliate disclaimer added (Chat 27)
- [x] index.html feedback form URL corrected (Chat 27)
- [x] Pages slider always visible (Chat 27)
- [x] Pages slider clipping fixed (Chat 30)
- [x] Ko-fi nudge removed (Chat 30)
- [x] Rating/review count restored to extension panel row display (Chat 30)
- [x] Font sizes bumped across panel UI (Chat 31)
- [x] Workflow banner added — dismissible, selectable, resets on Clear all (Chat 31)
- [x] Old keyword hint removed (Chat 31)
- [x] Buttons renamed: Start over → Clear all, Re-scan page → Re-sync (Chat 31)
- [x] Re-sync moved to Pages section (Chat 31)
- [x] Re-sort button removed — auto re-sort on page load (Chat 31)
- [x] Clear all fixed — actually clears everything, drops sessionStorage (Chat 31)
- [x] Solid product unit override — pods/sheets/strips no longer show $/lb (Chat 32)
- [x] extractCount gains loads/sheets/strips patterns (Chat 32)
- [x] normalizeUnit handles compound laundry units (Chat 32)
- [x] SOLID_KEYWORDS gains sheet/sheets/strip/strips (Chat 32)
- [x] Paid express delivery scraped, displayed, factored into sort (Chat 32)
- [x] Free delivery shows full window range (5 PM–10 PM) (Chat 32)
- [x] Compare payload gains paidDate/paidCutoff/paidPrice/freeWindowEnd/fastCutoff (Chat 32)
- [x] styles.css — `.ppu-delivery.paid` color rule (Chat 33)
- [x] compare.html — delivery column shows full window range + paid delivery (Chat 33)
- [x] compare.html — coupon column uses full renderCouponCell; Prime only filter added (Chat 33)
- [x] compare.html — coupon column simplified: "Coupon" pill only, no price duplication (Chat 34)
- [x] compare.html — column hide toggles added (Chat 34)
- [x] SNAP EBT — detectSnap(), isSnap on item + payload, panel note, conditional filter in price row (Chat 36)
- [x] compare.html — SNAP EBT pill in Coupon/promo column; conditional SNAP EBT only filter (Chat 36)
- [x] compare.html — default sort changed to PPU ascending (Chat 36)
- [x] SNAP EBT verified working on real grocery searches (Chat 38) ✅
- [x] PPU Fix 1 — recalculate when Amazon's $/ct equals full item price (Chat 38)
- [x] PPU Fix 2 — suppress weight/liquid PPU when no weight context in title (Chat 38)
- [x] PPU Fix 2 upgraded — calculate $/ft from footage instead of suppressing (Chat 38)
- [x] Pairs uncertainty note + unit label fix (Chat 38)
- [x] applyPairsNote() helper added (Chat 38)
- [x] Mixed-units transparency banner (Chat 38)
- [x] ppuNote field added to compare payload; shown in Per unit column (Chat 38)
- [x] ITEM_UNITS cleaned — weight/liquid units removed (Chat 38)
- [x] normalizeUnit strips leading numbers ("100 sheets" → "sheet") (Chat 38)
- [x] LENGTH_UNITS gains sq ft/square feet/square foot/square meter variants (Chat 38)
- [x] extractCount gains footage extraction (≥5ft, skips fractions) (Chat 38)
- [x] guessCountUnit returns 'ft' for footage titles (Chat 38)
- [x] BP monitor no-unit fallback — price/1 ct instead of "no unit data" (Chat 39)
- [x] FSA/HSA eligible badge — detectFsaHsa(), panel note, conditional filter, compare pill (Chat 39)
- [x] Climate Pledge Friendly badge — detectClimatePledge(), panel note, conditional filter, compare pill (Chat 39)
- [x] Small Business badge — detectSmallBusiness(), panel note, conditional filter, compare pill (Chat 39)
- [x] Badge filters moved to vertical stack below price range row; regular weight text (Chat 40)
- [x] SOLID_KEYWORDS gains toothpaste/tooth paste (Chat 41)
- [x] Fix 2 weight regex extended — word-form weights: pound/pounds/ounce/ounces, hyphenated (5-Pound), period-abbreviated (15 lb.) (Chat 41)
- [x] PPU formatting zero-pad — $0.1/ct → $0.10/ct (Chat 41)
- [x] PPU display sub-penny — 3 decimal places when PPU ≤ $0.01 (Chat 41)
- [x] index.html — complete copy and layout overhaul (Chat 42)
- [x] actuallyuseful.net pointed at GitHub Pages — DNS configured in Namecheap (Chat 42)
- [x] actuallyuseful.net HTTPS enforcement active ✅ (confirmed Chat 44)
- [x] Slider max → 7 ✅ (confirmed Chat 44)
- [x] solidUnitIsWrong — fuzzy 1% comparison instead of exact === (Chat 44 / v0.6.1.39)
- [x] normalizeUnit gains "X per Y" suffix strip — fixes OxiClean "pack per load" (Chat 44 / v0.6.1.40)
- [x] parseTitleWeightQty + weight sanity check — fixes sushi rice $5.00/oz, dog food $79.92/lb (Chat 44 / v0.6.1.40)
- [x] formatPPU threshold raised to ppu < 0.10 for 3 decimal places (Chat 44 / v0.6.1.41)
- [x] extractCount gains "N Adj Tubes/Sticks/Bottles/Jars" patterns with decimal lookbehind (Chat 44 / v0.6.1.41)
- [x] solidUnitIsWrong covers liquid units — fixes Tide Pods showing $/fl oz (Chat 44 / v0.6.1.42)
- [x] Weight-from-title fallback calc — when ap=null and count=null, parses oz/lb/g/kg from title (Chat 44 / v0.6.1.42)
- [x] Weight unit normalization — inferWeightDominant(), lb/kg pills in generateUnitPills, status message (Chat 44 / v0.6.1.43)
- [x] Results summary line updates for badge filters — "N hidden by badge filter" (Chat 44 / v0.6.1.44)
- [x] Kill switch — fetch actuallyuseful.net/killswitch.json at load; disabled:true shows red banner and halts (Chat 44 / v0.6.1.45)
- [x] manifest.json host_permissions gains actuallyuseful.net (Chat 44 / v0.6.1.45)
- [x] killswitch.json added to repo root (Chat 44 / v0.6.1.45)
- [ ] Fix extractCount "1 Pack (250 Sheets)" ordering issue
- [ ] Verify auto-resort fires on Re-sync page-add
- [ ] Welcome page on install — chrome.runtime.onInstalled opens onboarding tab
- [ ] Add laundry pods (id=73) and laptop (id=74) sample links to index.html

### Alpha release — status
- [x] Screenshots taken (Chat 27)
- [x] Chrome Web Store submission — unlisted, submitted April 22, 2026 (Chat 27)
- [x] CWS approval confirmed — published unlisted (Chat 29)
- [x] Reddit posts live — r/ClaudeAI, r/chrome_extensions, r/vibecodingcommunity (Chat 29/30)
- [x] Reddit feedback received — shortlist + compare praised; pin/lock feature suggested (Chat 38)
- [ ] r/vibecodedevs post — scheduled Day 5–7
- [ ] Facebook post — whenever
- [ ] Test on a different setup (Mac or Chrome vs Edge)

### Infrastructure — status
- [x] docs/ folder in GitHub repo
- [x] GitHub Pages enabled
- [x] Landing page live
- [x] compare.html live
- [x] privacy.html live
- [x] Supabase account + comparisons table
- [x] Chrome Web Store developer account ($5 paid)
- [x] Chrome Web Store submission — unlisted
- [x] CWS approved — published unlisted
- [x] actuallyuseful.net → GitHub Pages ✅
- [x] actuallyuseful.net HTTPS enforcement active ✅
- [x] killswitch.json in repo root — currently disabled:false
- [ ] Create Amazon account (prerequisite for Associates)
- [ ] Apply for Amazon Associates (after real user base established)

### Pre-public-CWS-listing checklist
Everything here should be complete before moving the CWS listing from unlisted to public.

- [x] SNAP EBT verified working on real grocery searches ✅
- [x] index.html copy and CTA overhauled (Chat 42)
- [x] Kill switch in place ✅ (Chat 44 / v0.6.1.45)
- [ ] Welcome page on install — `chrome.runtime.onInstalled` opens a one-tab page
- [ ] Logging audit session
- [ ] Selector resilience refactor — pull all CSS selectors into a named object; add multi-strategy fallbacks
- [ ] Self-test mode — on a known search, verify N results have prices/units; surface degradation banner if not
- [ ] Anomaly/transparency banner audit pass
- [ ] Demo video recorded and embedded on landing page
- [ ] Bug-test spreadsheet — at least 5 categories passing
- [ ] Public-facing roadmap published — GitHub Issues with roadmap label
- [ ] CWS listing description updated to match new positioning

### Post-alpha (v0.7+)

**Extension**
- [ ] Ko-fi nudge redesign
- [ ] Collapsible animation restore
- [ ] Laundry sheets remaining edge cases
- [ ] Other discount types — buy-multiple deals, vague "save X%" promos
- [ ] Product page re-enabled
- [ ] Cross-page shortlist persistence (chrome.storage.local)
- [ ] Two-way extension ↔ website connection
- [ ] Frequently Returned badge — red (deferred until product.js re-enabled)
- [ ] Full in-extension onboarding overlay
- [ ] **"Lock/pin reference items"** — keep selected items pinned while filtering/sorting (from Reddit feedback)
- [ ] Pairs ambiguity full fix
- [ ] Show both weight and count PPU — items with both weight and count (contact lens solution, lip balm) should show e.g. $/oz AND $/ct side by side
- [ ] Liquid PPU sanity check — recalculate when title has explicit volume; compare to Amazon's figure
- [ ] Palette redesign — use Claude Design tool for iteration
- [ ] Walmart version
- [ ] Settings page
- [ ] IIFE wrapping (pre-Web Store public)
- [ ] Replace .innerHTML with createElement (pre-Web Store public)
- [ ] Badge text on toolbar icon
- [ ] OR/| include syntax for keyword filter

**Website**
- [ ] soldBy / shipsFrom / returnPolicy in compare table
- [ ] Keepa price history link per item
- [ ] Power search form
- [ ] Shared-link note collaboration
- [ ] Instructions/how-to page
- [ ] Add laundry pods and laptop sample comparison links to index.html

**Outreach**
- [ ] **"Reddit comparison drops"** — find threads where people ask for help choosing a product; run AU, share comparison table + extension install link
- [ ] Outreach to frugality blogs — The Non-Consumer Advocate, The Frugal Girl
- [ ] r/SideProject post with demo video
- [ ] r/alphaandbetausers + r/betatests + r/TestMyApp
- [ ] Amazon Associates application

---

## Design principles

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
- All text in the extension interface must be selectable (user-select:text; cursor:text) — standing rule
- **Fail loud at the system level, fail quiet per item.**
- **Show our work.** When AU interprets data, surface that interpretation as a brief, dismissible note.
- **Sustainability features are features.** Selector resilience, self-test mode, and a kill switch belong in the pre-public-listing checklist.
