# Actually Useful — Roadmap

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## Current version: v0.6.1.7

---

## Known issues / needs testing

- Shortlist bar show/hide of "Show selected only" and "Clear selection" is slightly jarring — not worth fixing before website integration rethinks the whole bar
- Verify logging still reaching Google Sheet after background.js move (confirmed working Chat 15)
- actuallyuseful.net not yet pointed at GitHub Pages — currently resolves to tibbalsgribbin.github.io/actually-useful/

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
2. Claude confirms version string (core.js AU_VERSION, search.js header comment)
3. Only then do edits begin

**File attachment rule (added Chat 9):**
If files come through as document blocks rather than actual file uploads, stop and ask Melissa to re-attach as uploads. Never reconstruct or infer from document blocks.

**CSS/JS consistency rule (added Chat 8):**
When removing JS visibility toggling from an element, always check and update the CSS baseline too.

**Confirm before committing (added Chat 11):**
Pause between "files produced" and "push to GitHub." Test first, commit after.

**Version numbering (decided Chat 10):**
- Current: v0.6.1 (manifest) / v0.6.1.5 (internal AU_VERSION) / v0.6.1.7 (overall release including website)
- Increments normally through v0.7, v0.8, v0.9
- v1.0 = Web Store public launch
- Chrome manifests support three-part version numbers only; internal AU_VERSION can carry a fourth segment

**Project documents (from Chat 12):**
- All project documents now live in `docs/` folder in GitHub repo
- After each session, download updated docs and put them in `docs/` before committing
- Also update the Claude Project files (upload new versions)

**Affiliate tags:**
- Website only — never in the extension
- Amazon policy explicitly forbids affiliate tags in browser extensions

**Amazon Associates disclaimer (from Chat 16):**
- Every page gets this disclaimer at the bottom, whether or not affiliate links are live:
- "As an Amazon Associate I earn from qualifying purchases. Links on this page support Actually Useful — and don't cost you anything extra."

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

1. **Add "Compare side by side (N)" button to shortlist bar (search.js)**
   - Encodes shortlist as Base64 JSON: `{ items: [...], searchTerm: "..." }`
   - Opens `https://tibbalsgribbin.github.io/actually-useful/compare.html?data=[encoded]`
   - Button only visible when ≥1 item is shortlisted
   - Each item object: `{ asin, title, price, ppu, ppuUnit, delivery, rating, reviewCount, prime, coupon, soldBy, shipsFrom, returnPolicy, note }`

---

## Release plan

### v0.6.1.x — in progress

- [x] All regression fixes and polish (Chats 4–9)
- [x] Minimum rating filter fixed (Chat 13)
- [x] product.js disabled in manifest (Chat 13)
- [x] Affiliate tag machinery removed from core.js (Chat 13)
- [x] Show Selected / Clear Selection reworked (Chat 13)
- [x] Ko-fi link fixed in nudge (Chat 14)
- [x] Page-fetch throttling (Chat 14)
- [x] auSendLog moved to background.js (Chat 14)
- [x] Telemetry opt-out toggle + popup (Chat 14)
- [x] Feedback form verified (Chat 15)
- [x] Manifest warning fixed (Chat 15)
- [x] Landing page live (Chat 15)
- [x] compare.html built (Chat 16)
- [x] Affiliate disclaimer corrected to Amazon Associates required wording (Chat 16)
- [ ] Amazon unit price flagging — deferred, needs diagnostic first

### Alpha release — blockers
- [ ] "Compare side by side (N)" button in shortlist bar
- [ ] Supabase setup + shareable links
- [ ] Test extension on a different setup (Mac or Chrome vs Edge)
- [ ] Decide: Chrome Web Store submission before or after alpha?
- [ ] Alpha tester recruitment

### Infrastructure — pending
- [x] docs/ folder in GitHub repo
- [x] GitHub Pages enabled
- [x] Landing page live
- [x] compare.html live
- [ ] actuallyuseful.net pointed at GitHub Pages
- [ ] Supabase account + one table (shareable comparison links)
- [ ] Create Amazon account (prerequisite for Associates)
- [ ] Apply for Amazon Associates
- [ ] Create Chrome Web Store developer account ($5)

### Post-alpha (v0.7+)

**Extension**
- [ ] Product page re-enabled (tested against current Amazon first)
- [ ] Cross-page shortlist state persistence (chrome.storage.local)
- [ ] Two-way extension ↔ website connection
- [ ] Shortlist bar rethought for website integration
- [ ] Frequently Returned badge — make it red (deferred until product.js re-enabled)
- [ ] Derive per-item price from total ÷ count when Amazon reports wrong unit
- [ ] Keyword length expression normalization ("6ft" vs "6 feet")
- [ ] Exclusion possessives (`-men` not matching "men's")
- [ ] Fix nudge firing on hyphenated keywords (e.g. "t-shirt")
- [ ] "Start over" button — reset `selectedUnit` and `showCheckedOnly`
- [ ] Re-scan: preserve shortlist on same-term re-scans
- [ ] Contribution nudge (30-day floor, usage trigger, permanent dismiss)
- [ ] Walmart version
- [ ] Settings/onboarding page
- [ ] IIFE wrapping of scripts (pre-Web Store submission)
- [ ] Replace `.innerHTML` row template with `document.createElement` (pre-Web Store submission)
- [ ] Badge text on toolbar icon — shortlist count via `chrome.action.setBadgeText`

**Website — Actually Useful Comparisons**
- [x] Basic comparison table (Chat 16)
- [x] Sortable columns (Chat 16)
- [x] Works for users who arrive via shared link without the extension (Chat 16)
- [ ] Per-item notes persisted to URL
- [ ] Shareable permanent links via Supabase (`actuallyuseful.net/c/x7k2m`)
- [ ] Keepa price history link per item

**Website — Actually Useful Searches**
- [ ] Build forms for queries Amazon makes hard
- [ ] Search URL state preserved — bookmarkable and shareable
- [ ] Validate with real users before committing to build

---

## Post-alpha feature batch: hidden data capture

- [ ] SNAP eligible flag
- [ ] Small Business badge
- [ ] Condition (New / Used / Renewed)
- [ ] "Amazon's Choice" label — with transparency note
- [ ] Best Seller badge + category

---

## Post-alpha feature batch: review integrity + price history

- [ ] Mild caution signal for statistically improbable ratings
- [ ] Contextual nudge to Fakespot / ReviewMeta on flagged items
- [ ] Keepa price history link per card

---

## Website — architecture

**Platform:** GitHub Pages (static, free, uses existing repo) + Supabase (free database tier).

**Three website components:**
- `index.html` — marketing/landing page ✅ live
- `compare.html` — Actually Useful Comparisons ✅ live
- `search.html` — Actually Useful Searches

**Sequencing:**
1. Comparisons page first — closes monetization loop, drives share-induced installs ✅
2. Supabase shareable links second
3. Searches page third — validate with real users before building

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
- The website must work for users who arrive without the extension
- Affiliate tags on website only — never in extension
- Amazon Associates disclaimer on every page — whether or not affiliate links are live
