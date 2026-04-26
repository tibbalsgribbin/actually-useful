# Actually Useful — Roadmap

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## Current version: v0.6.1.29

---

## Known issues / needs testing

- **Palette redesign needed** — submitted with monochromatic indigo palette; redesign still wanted for future store update
- **Laundry sheets — some edge cases still wrong** — items where Amazon's $/ct equals full package price still slipping through in some titles; deferred
- **Mixed units in results** — `/lb` and `/ct` appearing together; cross-family sort may be occurring
- **Page limit** — 7 pages confirmed in practice but not definitively researched
- actuallyuseful.net not yet pointed at GitHub Pages
- **"Amazon search" link in compare.html** — only works for comparisons created after v0.6.1.14; old Supabase rows have no `searchUrl`
- **Delivery time on compare.html** — only correct for comparisons created after v0.6.1.17; old Supabase rows lack `freeWindowMinutes`
- **Thumbnails on compare.html** — only populated for comparisons created after v0.6.1.16; old Supabase rows lack `imgUrl`
- **Paid delivery on compare.html** — only available for comparisons created after v0.6.1.27; old rows lack `paidDate`/`paidCutoff`/`paidPrice`
- **Collapsible animation gone** — sections now snap open/closed; smooth animation deferred to post-alpha
- **Other discount types not captured** — buy-multiple deals, vague "save X%" promos not yet shown in coupon column; flagged for later
- **SNAP EBT not yet captured** — search.js + compare.html; scheduled for next session

---

## Working rules

**Script delivery:** targeted `str_replace` edits on existing file — not full rewrites. Once edits have started, always work from `/mnt/user-data/outputs/` — never re-copy from project files mid-session.

**Confirm before coding.** Always align with Melissa on what we're building before touching any files.

**One decision surface per session.** Polish items together = one surface. Architecture change = one surface. Mixing them is where sessions go wrong.

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

**File attachment rule (added Chat 9):**
If files come through as document blocks rather than actual file uploads, stop and ask Melissa to re-attach as uploads. Never reconstruct or infer from document blocks.

**CSS/JS consistency rule (added Chat 8):**
When removing JS visibility toggling from an element, always check and update the CSS baseline too.

**Confirm before committing (added Chat 11):**
Pause between "files produced" and "push to GitHub." Test first, commit after.

**Template literal rule (learned Chat 22):**
Never use Python heredoc string escaping to write JavaScript template literals — it produces `\'` sequences that are invalid in .html files. Use string concatenation (`+`) for all HTML-building JS in compare.html.

**Version numbering (decided Chat 10):**
- Current: v0.6.1 (manifest) / v0.6.1.27 (search.js) / v0.6.1.29 (compare.html)
- Increments normally through v0.7, v0.8, v0.9
- v1.0 = Web Store public launch
- Chrome manifests support three-part version numbers only; internal version can carry a fourth segment

**Project documents (from Chat 12):**
- All project documents now live in `docs/` folder in GitHub repo
- After each session, download updated docs and put them in `docs/` before committing
- Also update the Claude Project files (upload new versions)

**Affiliate tags:** Website only — never in the extension.

**Amazon Associates disclaimer (from Chat 16):** Every page gets the disclaimer. Standing rule.

**Data format between extension and compare.html:**
- search.js sends raw numbers for price and ppu — compare.html handles all formatting
- All data visible in the extension panel listing must be in the payload — no exceptions

**Supabase (from Chat 18, updated Chat 21):**
- Table: `comparisons` — id (int8), created_at (timestamptz), data (text), RLS disabled
- compare.html loads via ?id= (primary); ?data= Base64 kept as fallback for old links
- Extension POSTs shortlist to Supabase on Compare click — no item limit
- Never use the secret key in browser code

**All text in the extension interface must be selectable.** Every visible text element must have `user-select:text; cursor:text`. This is a standing design rule — apply it to all new text elements without being asked.

**Claude Design tool:** Use for iterative visual/palette work — doesn't count against message limits.

**How to know this session is going wrong:**
- Melissa is being asked to hold multiple things in her head at once
- Same ground is being covered twice
- Changes are landing without a version bump
- The handover is getting very long
Two of these = stop and wrap up.

**End of every session:**
1. Present all changed files for download
2. Give Melissa a suggested GitHub commit message
3. Remind Melissa to push to GitHub
4. Update project documents — download and put in `docs/`
5. Remind Melissa to update project files in Claude after the push

---

## Next session priorities (in order)

1. **SNAP EBT** — capture in search.js, display in extension panel and compare table (upload search.js + compare.html)
2. **Palette redesign** — use Claude Design tool
3. **Outreach planning** — frugality blogs (after extension and compare page more polished)

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
- [ ] SNAP EBT — capture in search.js + compare.html (next session)

### Alpha release — status
- [x] Screenshots taken (Chat 27)
- [x] Chrome Web Store submission — unlisted, submitted April 22, 2026 (Chat 27)
- [x] CWS approval confirmed — published unlisted (Chat 29)
- [x] Reddit posts live — r/ClaudeAI, r/chrome_extensions, r/vibecodingcommunity (Chat 29/30)
- [ ] r/vibecodedevs post — scheduled Day 5–7
- [ ] Facebook post — whenever
- [ ] Test on a different setup (Mac or Chrome vs Edge)

### Infrastructure — pending
- [x] docs/ folder in GitHub repo
- [x] GitHub Pages enabled
- [x] Landing page live
- [x] compare.html live
- [x] privacy.html live
- [x] Supabase account + comparisons table
- [x] Chrome Web Store developer account ($5 paid)
- [x] Chrome Web Store submission — unlisted
- [x] CWS approved — published unlisted
- [ ] actuallyuseful.net pointed at GitHub Pages
- [ ] Create Amazon account (prerequisite for Associates)
- [ ] Apply for Amazon Associates (after real user base established)

### Alpha — next steps
- [ ] SNAP EBT — search.js + compare.html
- [ ] compare.html strategy — further table refinements
- [ ] Palette redesign (Claude Design tool)
- [ ] Outreach to frugality blogs — after extension and compare page more polished
- [ ] r/vibecodedevs post
- [ ] Facebook post
- [ ] Instructions page on website
- [ ] First-use onboarding flow in the extension
- [ ] Short demo video (platform TBD)
- [ ] Test on a different setup (Mac or Chrome vs Edge)
- [ ] Collect and triage tester feedback

### Persistent research session — post-alpha
- [ ] localStorage for working comparison state on compare.html
- [ ] Inline notes editing directly in compare.html table
- [ ] Tab messaging: extension appends items to open compare tab
- [ ] "Save & share" button → Supabase → permanent link

### Post-alpha (v0.7+)

**Extension**
- [ ] Ko-fi nudge redesign — reconsider when, how, and how often to prompt (removed from alpha; Chat 30)
- [ ] Collapsible animation — restore smooth open/close animation (snapping introduced Chat 30)
- [ ] Laundry sheets — remaining edge cases (some $/ct = whole-package slipping through)
- [ ] Laundry pods / wrong unit bug — remaining cases
- [ ] Mixed unit cross-family sort investigation
- [ ] Other discount types — buy-multiple deals, vague "save X%" promos (flagged Chat 34)
- [ ] Product page re-enabled
- [ ] Cross-page shortlist persistence (chrome.storage.local)
- [ ] Two-way extension ↔ website connection
- [ ] Frequently Returned badge — red (deferred until product.js re-enabled)
- [ ] Contribution nudge
- [ ] Walmart version
- [ ] Settings/onboarding page
- [ ] IIFE wrapping (pre-Web Store public)
- [ ] Replace .innerHTML with createElement (pre-Web Store public)
- [ ] Badge text on toolbar icon
- [ ] OR/| include syntax for extension keyword filter (currently compare.html only)

**Website**
- [ ] soldBy / shipsFrom / returnPolicy in compare table — populate when product.js re-enabled
- [ ] Keepa price history link per item
- [ ] Power search form — shareable permalinks via Supabase; affiliate tag on outbound URLs
- [ ] Shared-link note collaboration
- [ ] actuallyuseful.net pointed at GitHub Pages
- [ ] Instructions/how-to page

**Outreach**
- [ ] Frugality blog outreach — The Non-Consumer Advocate, The Frugal Girl, others TBD
- [ ] Amazon Associates — create Associates Central account
- [ ] Amazon Associates application narrative (draft before applying)

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
- All text in the extension interface must be selectable (user-select:text; cursor:text) — standing rule, apply to all new text elements
