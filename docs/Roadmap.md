# Actually Useful — Roadmap

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## Current version: v0.6.1.46 (overall) · v0.6.1 (manifest) · v0.6.1.46 (search.js) · v0.6.1.46 (core.js) · v0.6.1.30 (compare.html) · v0.6.1.16 (background.js)

---

## Known issues / needs testing

- **Multi-pack weight PPU wrong** — Amazon reports $/oz per item in a multi-pack, not per total package weight (e.g. Hello toothpaste 3×5oz shows $3.59/oz; correct is ~$1.20/oz). Needs design session before any fix attempt.
- **Contact lens solution — Amazon-reported $/fl oz unreliable** — when title contains stray numbers, Amazon calculates wrong unit price; needs recalculate-and-compare check against title volume
- **Cotton swabs — extractCount grabbing pack count instead of swab count** — "500 per Pack - 2 Pack" → shows 2 ct instead of 1000 ct
- **Razor blade $0.1/ct outlier** — one item still showing one decimal despite zero-pad fix; source unclear
- **Cardstock "1 Pack (250 Sheets)"** — extractCount picks up 1 from "1 Pack" before 250 from "Sheets" — wrong PPU
- **Pairs ambiguity** — socks/gloves sold in pairs AND multiples; uncertainty note added as interim; full fix deferred
- **FSA/HSA, Climate Pledge Friendly, Small Business badge detection** — not yet verified on live Amazon searches
- **Auto-resort on Re-sync page-add** — not yet verified; may not fire when adding a single additional page
- **Blue/indigo palette inconsistency** — extension panel is blue (styles.css); website is indigo. Full unification post-alpha.
- **"Amazon search" link in compare.html** — only works for comparisons created after v0.6.1.14
- **Delivery time on compare.html** — only correct after v0.6.1.17
- **Thumbnails on compare.html** — only populated after v0.6.1.16
- **Paid delivery on compare.html** — only available after v0.6.1.27
- **isSnap on compare.html** — only available after v0.6.1.28
- **ppuNote on compare.html** — only available after v0.6.1.29
- **isFsaHsa/isClimatePledge/isSmallBusiness on compare.html** — only available after v0.6.1.34
- **Collapsible animation gone** — snap only; post-alpha
- **Other discount types not captured** — buy-multiple deals, vague "save X%" promos; post-alpha
- **compare.html logging** — no logging on compare page yet

---

## Working rules

**Single agent.** Claude only. No Replit, Gemini, Figma, or other tools touching code files directly. Design exploration happens in Claude Design and produces a reference doc — it does not touch files.

**Script delivery:** targeted str_replace edits on existing file — not full rewrites. Working file lives at `/mnt/user-data/outputs/`. Never re-copy from project files mid-session.

**Confirm before coding.** Always align with Melissa on what we're building before touching any files.

**One decision surface per session.**

**Context rot warning.** Long sessions degrade quality. Stop and wrap up rather than pushing through.

**Always include context/token status** when asking "continue or wrap up?"

**Clean room protocol:** Code files are NOT stored in the Claude Project. At the start of each coding session, Melissa uploads current versions fresh from GitHub. Claude confirms version string before editing.

**File attachment rule:** If files come through as document blocks rather than actual file uploads, stop and ask Melissa to re-attach as uploads.

**CSS/JS consistency rule:** When removing JS visibility toggling from an element, always check and update the CSS baseline too.

**Template literal rule:** Never use Python heredoc string escaping for JavaScript template literals in compare.html. Use string concatenation (+).

**Version numbering:**
- Overall / canonical: v0.6.1.46 (search.js number)
- Per-file versions differ intentionally — files change at different rates
- v1.0 = Web Store public launch

**Affiliate tags:** Website only — never in the extension.

**Affiliate disclosure:** Every page. Standing rule.

**All text in the extension interface must be selectable.** user-select:text; cursor:text on every visible text element.

**Commit message rule:** Always provide a commit message when a GitHub push is needed.

**Don't touch weight unit logic without a design session first.**

**Rollback rule:** 3 failed fix attempts = stop, revert to last stable commit.

**search.js stays as one file** until selector resilience is properly designed. The modular refactor (config.js / scraper.js / ui.js) was abandoned — stubs only, not functional.

**End of every session:**
1. Produce complete updated Project_Briefing.md, Roadmap.md, Changelog.md, Handover.md as downloadable files
2. Give Melissa a suggested GitHub commit message
3. Remind Melissa to push to GitHub
4. Remind Melissa to update project files in Claude after the push

---

## Next session priorities (in order)

1. **China/origin filter research** — research how existing extensions handle country-of-origin and low-quality seller filtering; design AU's approach. Research only — do not build anything until approach is designed.
2. **compare.html logging** — direct fetch to Google Sheets endpoint; planned Chat 46, deferred
3. **Welcome page on install** — chrome.runtime.onInstalled opens a one-tab onboarding page; currently first install is silence
4. **Fix extractCount "1 Pack (250 Sheets)"** — pack/count ordering fix
5. **Verify auto-resort fires on Re-sync page-add** — investigate and fix if needed

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
- [x] Lavender Fields palette → monochromatic indigo (Chat 21/27)
- [x] Compare payload expanded — full coupon/delivery/retailer fields (Chat 22)
- [x] Filter bar on compare.html (Chat 22)
- [x] Delivery sort fixed (Chat 23)
- [x] Price range filter (Chat 23)
- [x] Notes field per item + in compare payload (Chat 25)
- [x] Coupon/delivery/liquid unit toggle on compare.html (Chat 25)
- [x] imgUrl added to compare payload (Chat 26)
- [x] Pages slider always visible (Chat 27)
- [x] Rating/review count in extension panel row (Chat 30)
- [x] Workflow banner — dismissible, selectable, resets on Clear all (Chat 31)
- [x] Buttons renamed: Start over → Clear all, Re-scan page → Re-sync (Chat 31)
- [x] Solid product unit override — pods/sheets/strips (Chat 32)
- [x] Paid express delivery scraped, displayed, factored into sort (Chat 32)
- [x] Free delivery shows full window range (Chat 32)
- [x] compare.html — column hide toggles added (Chat 34)
- [x] SNAP EBT — detectSnap(), panel note, payload, filter (Chat 36)
- [x] compare.html — default sort PPU ascending (Chat 36)
- [x] SNAP EBT verified working on real grocery searches ✅ (Chat 38)
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
- [x] AU_VERSION bumped to 0.6.1.46 in core.js (Chat 46)
- [ ] China/origin filter — research and design
- [ ] compare.html logging
- [ ] Fix extractCount "1 Pack (250 Sheets)" ordering issue
- [ ] Verify auto-resort fires on Re-sync page-add
- [ ] Welcome page on install — chrome.runtime.onInstalled
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
- [x] Usage log — Google Sheet, 46 columns, logging verified ✅
- [ ] Create Amazon account (prerequisite for Associates)
- [ ] Apply for Amazon Associates (after real user base)

### Pre-public-CWS-listing checklist

- [x] SNAP EBT verified working ✅
- [x] index.html copy and CTA overhauled ✅
- [x] Kill switch in place ✅
- [x] Logging audit session ✅ (Chat 46)
- [ ] China/origin filter — research, design, build
- [ ] Welcome page on install
- [ ] Selector resilience refactor — CSS selectors into named constants object; multi-strategy fallbacks
- [ ] Self-test mode — on a known search, verify N results have prices/units; surface degradation banner
- [ ] Anomaly/transparency banner audit pass
- [ ] Demo video recorded and embedded on landing page
- [ ] Bug-test spreadsheet — at least 5 categories passing
- [ ] Public-facing roadmap — GitHub Issues with roadmap label
- [ ] CWS listing description updated

### Post-alpha (v0.7+)

**Extension**
- [ ] Ko-fi nudge redesign
- [ ] Collapsible animation restore
- [ ] Other discount types — buy-multiple deals, vague "save X%" promos
- [ ] Product page re-enabled
- [ ] Cross-page shortlist persistence (chrome.storage.local)
- [ ] Frequently Returned badge (deferred until product.js re-enabled)
- [ ] Full in-extension onboarding overlay
- [ ] "Lock/pin reference items" — from Reddit feedback
- [ ] Pairs ambiguity full fix
- [ ] Show both weight and count PPU side by side
- [ ] Liquid PPU sanity check
- [ ] "Hide this seller forever"
- [ ] hasVariations flag — "⚠ Has size/color variants"
- [ ] Full palette unification (extension blue + website indigo → one consistent system)
- [ ] Wallet version
- [ ] Settings page
- [ ] IIFE wrapping (pre-Web Store public)
- [ ] Replace .innerHTML with createElement (pre-Web Store public)
- [ ] OR/| include syntax for keyword filter

**Website**
- [ ] soldBy / shipsFrom / returnPolicy in compare table
- [ ] Keepa price history link per item
- [ ] Instructions/how-to page
- [ ] Add laundry pods and laptop sample comparison links

**Outreach**
- [ ] "Reddit comparison drops" — find product-question threads, run AU, share real table + install link. Gate: unit consistency reliable first.
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
- Affiliate tags on website only — never in extension
- Affiliate disclosure on every page
- search.js sends raw numbers to compare.html — compare.html handles all formatting
- All data in the extension panel listing must be in the compare.html payload
- The comparison page is the destination — the extension is the on-ramp
- All text in the extension interface must be selectable
- **Fail loud at the system level, fail quiet per item.**
- **Show our work.** Transparency is an accessibility feature.
- **Sustainability features are features.**
- **search.js stays as one file** until selector resilience is properly implemented.
