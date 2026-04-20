# Actually Useful — Roadmap

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## Current version: v0.6.1.4

---

## Known issues / needs testing

- Shortlist bar show/hide of "Show selected only" and "Clear selection" is slightly jarring — noted, not worth fixing before website integration rethinks the whole bar
- Ko-fi link in nudge (`ko-fi.com/tibbalsgribbin`) may differ from footer link (`ko-fi.com/butactuallyuseful`) — verify which is correct

---

## Working rules

**Script delivery:** targeted `str_replace` edits on existing file — not full rewrites. Once edits have started, always work from `/mnt/user-data/outputs/` — never re-copy from project files mid-session.

**Confirm before coding.** Always align with Melissa on what we're building before touching any files.

**One decision surface per session.** Polish items together = one surface. Architecture change = one surface. Mixing them is where sessions go wrong.

**Context rot warning.** Long sessions degrade quality. Stop and wrap up rather than pushing through.

**Always include context/token status** when asking "continue or wrap up?" — added Chat 13.

**Code files — new protocol (from Chat 7):**
- Code files are NOT stored in the Claude Project
- At the start of each session, Melissa uploads the current versions fresh from GitHub
- Claude works only from those uploaded files
- This eliminates the stale-file problem that caused two reverts

**Stale file prevention — start of every session:**
1. Melissa uploads current code files from GitHub
2. Claude confirms version string (core.js AU_VERSION, search.js header comment)
3. Only then do edits begin

**File attachment rule (added Chat 9):**
If files come through as document blocks rather than actual file uploads, stop and ask Melissa to re-attach as uploads. Never reconstruct or infer from document blocks.

**CSS/JS consistency rule (added Chat 8):**
When removing JS visibility toggling from an element, always check and update the CSS baseline too. If JS was controlling `display`, the CSS default is probably `display:none` and needs to change.

**Confirm before committing (added Chat 11):**
Pause between "files produced" and "push to GitHub." Test first, commit after. Catches bugs before they live on main.

**Version numbering (decided Chat 10):**
- Current: v0.6.1 (manifest) / v0.6.1.4 (internal AU_VERSION)
- Increments normally through v0.7, v0.8, v0.9
- v1.0 = Web Store public launch — something to earn, not arbitrarily assign
- Chrome manifests support three-part version numbers only; internal AU_VERSION can carry a fourth segment

**Project documents (from Chat 12):**
- All project documents now live in `docs/` folder in GitHub repo
- After each session, download updated docs and put them in `docs/` before committing
- Also update the Claude Project files (upload new versions) so Claude reads current docs

**How to know this session is going wrong:**
- Melissa is being asked to hold multiple things in her head at once
- Same ground is being covered twice
- Changes are landing without a version bump
- The handover is getting very long
Two of these = stop and wrap up.

**End of every session:**
1. Present all changed files for download
2. Give Melissa a suggested GitHub commit message
3. Remind Melissa to push to GitHub (pull → stage → commit → push)
4. Update project documents (Briefing, Changelog, Roadmap, Handover) — download and put in `docs/`
5. Remind Melissa to update project files in Claude after the push

---

## Next session priorities (in order)

1. **Frequently Returned badge — make it red** (bold done Chat 7, red still needed)
2. **Page-fetch throttling** — 500ms delay between fetches (bot-detection risk)
3. **Move `auSendLog` to background.js** (CSP reliability)
4. **Telemetry opt-out toggle** (required before public release)
5. **Fix Ko-fi link inconsistency** — verify correct URL (nudge vs footer)

---

## Release plan

### v0.6.1.x — in progress

- [x] Regression fixes (Chat 4)
- [x] Collapsible Sort/Filters dividers, footer repositioned, keyword hint text (Chat 5)
- [x] Polish items: font stack, debouncing, empty state, FR badge bold, hint text size (Chat 7)
- [x] Shortlist bar visibility fix (Chat 7)
- [x] Select-all simple toggle, no confirm dialog (Chat 8)
- [x] Shortlist bar always visible (Chat 8)
- [x] Panel height resize via bottom edge handle (Chat 9)
- [x] Persistent filter settings per search term (Chat 9)
- [x] Refresh → Re-scan page (Chat 9)
- [x] Collapse/minimize bug fixed — inline height styles cleared on collapse (Chat 12)
- [x] Version strings aligned to sub-1.0 across all four files (Chat 12)
- [x] docs/ folder created in GitHub — all project documents moved there (Chat 12)
- [x] Minimum rating filter fixed — `parseRating()` + `r.rating` in `scrapeCard()` (Chat 13)
- [x] product.js disabled in manifest — moved to `_content_scripts_product_disabled` (Chat 13)
- [x] `AU_AFFILIATE_TAG` and `auTagUrl` removed from `core.js` (Chat 13)
- [x] Show Selected / Clear Selection moved to shortlist bar, wording reworked (Chat 13)
- [ ] Frequently Returned badge — make it red (bold done Chat 7, red still needed)
- [ ] Fix Ko-fi link inconsistency (nudge vs footer) — verify correct URL
- [ ] Amazon unit price flagging — deferred, needs diagnostic first

### Gemini near-term list — remaining
- [ ] Page-fetch throttling — 500ms–1000ms delay between fetches (bot-detection risk)
- [ ] Move `auSendLog` to background.js (reliability + CSP safety)
- [ ] Telemetry opt-out toggle in popup (required before public release)
- [ ] Badge text on toolbar icon — shortlist count via `chrome.action.setBadgeText`

### Alpha release — blockers
- [ ] Feedback form verified — these three questions must be present:
  - "What is one thing that confused you?"
  - "What is one feature you wish it had?"
  - "Did it break anything on the page?"
- [ ] GitHub Pages live (actuallyuseful.net)
- [ ] Marketing/landing page published
- [ ] Actually Useful Comparisons page with shareable links working
- [ ] "Compare side by side (N)" button in shortlist bar → opens Comparisons page
- [ ] Telemetry opt-out toggle in popup
- [ ] Decide: Chrome Web Store submission before or after alpha?
- [ ] Test extension on a different setup (Mac, or Chrome vs Edge) via a tester

### Infrastructure — pending
- [x] docs/ folder in GitHub repo — done Chat 12
- [ ] GitHub Pages enabled on existing repo
- [ ] Supabase account + one table set up (shareable comparison links)
- [ ] Create Amazon account (prerequisite for Associates)
- [ ] Apply for Amazon Associates
- [ ] Create Chrome Web Store developer account ($5)

### Post-alpha (v0.7+)

**Extension**
- [ ] Product page re-enabled (tested against current Amazon first)
- [ ] Cross-page shortlist state persistence (chrome.storage.local)
- [ ] "Compare side by side (N)" button → Actually Useful Comparisons page
- [ ] Two-way extension ↔ website connection (refined shortlist back to extension)
- [ ] Shortlist bar rethought for website integration — "Open in new tabs" → "Compare on website"
- [ ] Derive per-item price from total ÷ count when Amazon reports wrong unit
- [ ] Keyword length expression normalization ("6ft" vs "6 feet")
- [ ] Exclusion possessives (`-men` not matching "men's")
- [ ] Fix nudge firing on hyphenated keywords (e.g. "t-shirt")
- [ ] "Start over" button — reset `selectedUnit` and `showCheckedOnly`
- [ ] Re-scan: preserve shortlist on same-term re-scans
- [ ] Contribution nudge (30-day floor, usage trigger, permanent dismiss)
- [ ] Walmart version (prioritized among future platforms)
- [ ] Settings/onboarding page
- [ ] IIFE wrapping of scripts (pre-Web Store submission)
- [ ] Replace `.innerHTML` row template with `document.createElement` (pre-Web Store submission)

**Website — Actually Useful Comparisons**
- [ ] Comparison table: title, price, PPU, delivery, rating, sold by, ships from, coupon — side by side
- [ ] Re-sort by any column
- [ ] Per-item notes persisted to URL
- [ ] Shareable permanent links via Supabase (`actuallyuseful.net/c/x7k2m`)
- [ ] Affiliate tags applied on this page only
- [ ] Works for users who arrive via shared link without the extension installed
- [ ] Keepa price history link per item

**Website — Actually Useful Searches**
- [ ] Build forms for queries Amazon makes hard: discount range, condition + department, Small Business + high rating, multi-merchant
- [ ] Search URL state preserved — queries bookmarkable and shareable
- [ ] Standalone search third in sequencing — validate with real users before committing

---

## Website — architecture (decided Chat 10, updated Chat 11)

**Platform:** GitHub Pages (static, free, uses existing repo) + Supabase (free database tier).

**Three website components:**
- `index.html` — marketing/landing page
- `compare.html` — **Actually Useful Comparisons** — receives shortlisted items from extension, renders side-by-side comparison table, applies affiliate tags, supports shareable permanent links via Supabase. Must work for users who arrive via shared link without the extension.
- `search.html` — **Actually Useful Searches** — standalone advanced search tool; builds queries Amazon makes hard; bookmarkable/shareable URLs.

**Sequencing:**
1. Comparisons page first — closes monetization loop, gives shortlist a destination, drives share-induced installs
2. Supabase shareable links second
3. Searches page third — validate which queries users actually want before building

**Key decisions:**
- Shareable links essential — `actuallyuseful.net/c/x7k2m` via Supabase
- Price history → Keepa links per item (not CamelCamelCamel — they inject their own affiliate tags)
- Website cannot fetch Amazon results independently — extension is the Amazon-facing piece
- Two-way extension ↔ website connection is post-alpha
- Affiliate tags on website only — never in extension

---

## Post-alpha feature batch: hidden data capture

Fields present in Amazon card HTML but not yet captured. To be added in one code session.

- [ ] SNAP eligible flag
- [ ] Small Business badge
- [ ] Condition (New / Used / Renewed)
- [ ] "Amazon's Choice" label — with transparency note (paid placement, not editorial)
- [ ] Best Seller badge + category

---

## Post-alpha feature batch: review integrity + price history

- [ ] Mild caution signal for statistically improbable ratings (high stars, very low review count)
- [ ] Contextual nudge to Fakespot / ReviewMeta on flagged items
- [ ] "📈 Price history" link per card → Keepa (`keepa.com/product/[ASIN]`)
- *Note: building our own price history is not viable — Keepa has years of data we can't replicate*

---

## Design principles

- Fill gaps in Amazon's interface — don't duplicate what Amazon already does well
- Don't duplicate what established tools do well — surface them instead
- Wrong numbers are worse than no numbers
- Never drop results — sort what is rendered
- User intent matters more than physical precision
- One continuous app — state flows naturally between pages
- Consistent UI chrome — same header on every panel
- Use Melissa's exact wording for UI copy
- Copy tone: warm, direct, personal. "doesn't" not "won't"
- The website must work for users who arrive without the extension — don't strangle that growth vector
