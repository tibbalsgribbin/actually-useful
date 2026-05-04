# Actually Useful — Roadmap

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## Current version: v0.6.1.48 (overall) · v0.6.1 (manifest) · v0.6.1.48 (search.js) · v0.6.1.46 (core.js) · v0.6.1.30 (compare.html) · v0.6.1.16 (background.js)

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
- **Brand filter mixed-case invented names** — Floerns, Verdusa, Wenrine, Annebouti, Fisoew score 0 on heuristics; accepted gap, covered partially by bundled blocklist

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
- Overall / canonical: v0.6.1.48 (search.js number)
- Per-file versions differ intentionally — files change at different rates
- v1.0 = Web Store public launch

**Affiliate tags:** Website only — never in the extension.

**Affiliate disclosure:** Every page. Standing rule.

**All text in the extension interface must be selectable.** user-select:text; cursor:text on every visible text element.

**Commit message rule:** Always provide a commit message when a GitHub push is needed.

**Don't touch weight unit logic without a design session first.**

**Rollback rule:** 3 failed fix attempts = stop, revert to last stable commit.

**search.js stays as one file** until selector resilience is properly designed.

**End of every session:**
1. Produce complete updated Project_Briefing.md, Roadmap.md, Changelog entry, and Handover.md as downloadable files — complete documents, not snippets or merge instructions
2. Give Melissa a suggested GitHub commit message
3. Remind Melissa to push to GitHub
4. Remind Melissa to update project files in Claude after the push

---

## Next session priorities (in order)

1. **Brand filter — Session 2: brand filter UI + hide/demote toggle** — add brand filter on/off toggle to panel, hide/demote two-button pill, results summary line, expand-to-view footer with "below the line" divider, demote rendering logic, persist state in chrome.storage.local, add logging fields to doLog(), update Apps Script + sheet header row. Files: search.js, styles.css. See Brand_Filter_Design.md Session 2 scope.
2. **compare.html logging** — direct fetch to Google Sheets endpoint; deferred from Chat 46
3. **Welcome page on install** — chrome.runtime.onInstalled opens onboarding tab
4. **Fix extractCount "1 Pack (250 Sheets)"** — pack/count ordering fix
5. **Verify auto-resort fires on Re-sync page-add** — investigate and fix if needed

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
- [x] Rating filter (Chat 31)
- [x] Keyword filter (Chat 32)
- [x] Sponsored filter (Chat 33)
- [x] Source filter (Chat 33)
- [x] Price range filter (Chat 34)
- [x] Re-sync button (Chat 35)
- [x] Pages slider (Chat 35)
- [x] Reddit feedback received (Chat 38)
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

### Chrome Web Store stats (as of May 2, 2026)
- 15 total installs · 8 weekly active users · 0 uninstalls
- 87% US · 7% Italy · 6% Canada (installs)
- 82% Windows · 14% Mac · 4% ChromeOS (weekly users)
- All installs began Apr 22 (Reddit post date)

---

## Pre-public-CWS-listing checklist

- [x] SNAP EBT verified working ✅
- [x] index.html copy and CTA overhauled ✅
- [x] Kill switch in place ✅
- [x] Logging audit session ✅ (Chat 46)
- [ ] Brand filter feature suite (designed Chat 47, Session 1 complete Chat 48 — see v0.7 section)
- [ ] Welcome page on install
- [ ] Selector resilience refactor — CSS selectors into named constants object; multi-strategy fallbacks
- [ ] Self-test mode — on a known search, verify N results have prices/units; surface degradation banner
- [ ] Anomaly/transparency banner audit pass
- [ ] Demo video recorded and embedded on landing page
- [ ] Bug-test spreadsheet — at least 5 categories passing
- [ ] Public-facing roadmap — GitHub Issues with roadmap label
- [ ] CWS listing description updated

---

## v0.7 — Brand filter feature suite (designed Chat 47)

Full design in Brand_Filter_Design.md.

- [x] Session 1: brand text scraping + heuristic detector (no UI) ✅ Chat 48
- [ ] Session 2: brand filter UI + hide/demote toggle
- [ ] Session 3: allowlist + bundled blocklist wire-up + personal blocklist
- [ ] Session 4: delivery window filter
- [ ] Session 5: Amazon-brands demote toggle + polish
- [ ] Session 6 (optional): compare.html integration

---

## Post-alpha (v0.8+)

- Lazy product-page fetch architecture (Frequently Returned, variations, Sold by — progressive enrichment)
- Cross-session shortlist persistence
- "Hide this seller forever"
- "Cheaper at Whole Foods/Fresh" cross-source alerts
- Selector resilience refactor (if not completed pre-public)
- Walmart version

### Website (post-alpha)
- [ ] "For nerds" transparency doc — explains every filter, signal, and assumption AU makes. Destination TBD (FAQ page or linked from onboarding). Drafting can begin before public launch. Post-alpha placement, but early drafting encouraged.
- [ ] Demo video recorded and embedded
- [ ] Search.html page

---

## Deferred / deprioritized

- product.js — disabled during alpha; re-enable post-alpha
- Per-item "Frequently Returned" badge — requires product page fetch (post-alpha)
- Variation pricing warnings — requires product page fetch (post-alpha)
- Amazon Associates — apply when 50+ weekly active installs + 500 monthly site visitors
- Show HN / Product Hunt launch — coordinate with public CWS listing
- r/InternetIsBeautiful — after polish pass
- Cross-device blocklist sync — post-alpha (chrome.storage.sync, 100KB cap)
