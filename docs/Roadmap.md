# Actually Useful — Roadmap

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## Current version: v0.6.1.12

---

## Known issues / needs testing

- **Palette redesign needed** — Lavender Fields applied but live result unsatisfactory. Use Claude Design tool for iteration before taking screenshots.
- **Compare table blank columns** — Prime, full coupon detail, delivery range, retailer tag — fix scoped for Chat 22
- **Laundry pods show wrong unit ($/lb instead of $/ct)** — fix before public launch
- **Mixed units in results** — `/lb` and `/ct` appearing together; cross-family sort may be occurring
- **Page limit** — 7 pages confirmed in practice but not definitively researched
- actuallyuseful.net not yet pointed at GitHub Pages

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

**Version numbering (decided Chat 10):**
- Current: v0.6.1 (manifest) / v0.6.1.12 (search.js) / v0.6.1.12 (compare.html)
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

**Supabase (from Chat 18, updated Chat 21):**
- Table: `comparisons` — id (int8), created_at (timestamptz), data (text), RLS disabled
- compare.html loads via ?id= (primary); ?data= Base64 kept as fallback for old links
- Extension POSTs shortlist to Supabase on Compare click — no item limit
- Never use the secret key in browser code

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

1. **Compare table payload fixes** (search.js) — isPrime, full coupon fields, delivery range, retailerKey
2. **Compare table rendering** (compare.html) — display the new fields
3. **Palette redesign** — use Claude Design tool, then apply to CSS
4. **Screenshots** — blocked on palette
5. **Chrome Web Store submission** — blocked on screenshots

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
- [x] Lavender Fields palette applied (Chat 21) — needs redesign

### Alpha release — blockers
- [ ] Palette redesign (Claude Design tool)
- [ ] Screenshots (5)
- [ ] Chrome Web Store submission (unlisted)
- [ ] Test on a different setup (Mac or Chrome vs Edge)

### Infrastructure — pending
- [x] docs/ folder in GitHub repo
- [x] GitHub Pages enabled
- [x] Landing page live
- [x] compare.html live
- [x] privacy.html live
- [x] Supabase account + comparisons table
- [x] Chrome Web Store developer account ($5 paid)
- [ ] actuallyuseful.net pointed at GitHub Pages
- [ ] Create Amazon account (prerequisite for Associates)
- [ ] Apply for Amazon Associates (after real user base established)

### Compare table — Chat 22
- [ ] isPrime field in payload + rendering
- [ ] Full coupon/savings fields in payload + rendering
- [ ] Delivery range (freeDate + fastDate + qualifier) in payload + rendering
- [ ] Retailer/source tag in payload + rendering

### Persistent research session — Chat 22/23
- [ ] localStorage for working comparison state on compare.html
- [ ] Inline notes editing on compare.html
- [ ] Tab messaging: extension appends items to open compare tab
- [ ] "Save & share" button → Supabase → permanent link

### Post-alpha (v0.7+)

**Extension**
- [ ] Laundry pods / wrong unit bug
- [ ] Mixed unit cross-family sort investigation
- [ ] Product page re-enabled
- [ ] Cross-page shortlist persistence (chrome.storage.local)
- [ ] Two-way extension ↔ website connection
- [ ] Frequently Returned badge — red (deferred until product.js re-enabled)
- [ ] Contribution nudge
- [ ] Walmart version
- [ ] Settings/onboarding page
- [ ] IIFE wrapping (pre-Web Store)
- [ ] Replace .innerHTML with createElement (pre-Web Store)
- [ ] Badge text on toolbar icon

**Website**
- [ ] Per-item notes persisted to URL / localStorage
- [ ] Keepa price history link per item
- [ ] soldBy / shipsFrom / returnPolicy — populate when product.js re-enabled
- [ ] Power search form (Jungle Search model)

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
- Claude Design tool is the right place for iterative visual/palette work
