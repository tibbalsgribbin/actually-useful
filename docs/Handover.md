# Session Handover — April 21, 2026 (Chat 21)

## What we did this session

1. **Palette pivot — Lavender Fields design system**
   - Melissa found a new colour scheme and wanted to try it before taking screenshots
   - Built an HTML preview artifact (extension panel mock + website strip) and iterated on it through several rounds of feedback
   - Final palette decisions:
     - Header (panel + website nav): Orchid (#CF6DFC)
     - Shortlist bar + footer bar + section dividers: Gold (#BDB96A)
     - Panel/page background: White (#FFFFFF)
     - Cards, rows, control areas: Pale Yellow (#FDFBD4)
     - Best value row: More vivid yellow (#f5eda0)
     - White used ONLY for text inputs, dropdowns, and checkboxes (unchecked)
     - Checked checkboxes: Orchid
     - Feature cards on website: Periwinkle (#C1BFFF)
     - Comparison table cells: White (intentional)
   - Applied to styles.css, index.html, compare.html
   - Note: Melissa was not satisfied with the result on the actual extension ("lmao. that's something. Not something good.") — will revisit with Claude Design tool

2. **Supabase compare — removed URL length limit**
   - Old approach: Base64 encoded items into ?data= URL parameter — broke at ~6 items
   - New approach: POST shortlist to Supabase on Compare click, open compare.html?id=xxx
   - Tested with 50 items — worked perfectly
   - Button shows "Opening…" while POST is in flight
   - On Supabase failure: error message in shortlist bar for 4 seconds, then resets
   - Old ?data= fallback preserved in compare.html for existing shared links
   - renderError() split into two states: "nothing to compare" vs "couldn't load"

3. **Scoped next major feature: persistent research session**
   - Melissa identified that the comparison table is a dead end — no way to add items from a new search, no notes input, several columns blank
   - Blank columns diagnosed:
     - Prime: scraped into cardText only, not as a boolean field — needs promoting
     - Coupon/savings detail: collapsed into one string in payload — needs sending separately
     - Delivery: only freeDate sent, not fastDate or qualifier — needs full range
     - Source/retailer: not in payload — needs adding
     - Sold by / Ships from / Returns: genuinely require product page — deferred
   - Decision: build Option C (localStorage working session + explicit Supabase share)
   - Tab messaging (extension → open compare tab to append items) identified as the hard piece
   - Session ended before implementation began — this is Chat 22's main task

---

## ⚠️ Start of next session

1. Melissa uploads fresh search.js and compare.html from GitHub as actual file uploads
2. Claude confirms version strings: manifest `0.6.1` · search.js `0.6.1.12` · compare.html `0.6.1.12` (both bumped this session)
3. Confirm scope before touching any files
4. Ask Melissa if she has fresh testing observations

---

## Known issues / bugs

- **Palette not working well on actual extension** — preview looked one way, live extension looked bad. Needs redesign session using Claude Design tool before screenshots can be taken.
- **Laundry pods show wrong unit ($/lb instead of $/ct)** — ongoing
- **Mixed units in results** — cross-family sort may be occurring
- **Compare table blank columns** — Prime, full coupon detail, delivery range, retailer source — fix is scoped, not yet built

---

## Next session agenda (Chat 22)

**Main task: compare table payload + persistent research session**

Phase 1 — payload fixes (search.js):
1. Add `isPrime` boolean field to data object (already detected in scrapeCardText, just needs promoting)
2. Send coupon fields separately: `hasCoupon`, `couponPillOnly`, `sns`, `savings` (not collapsed)
3. Send full delivery: `freeDate`, `fastDate`, `freeQualifier` — not just one formatted string
4. Send `retailerKey` (retailer.key) for source tag display

Phase 2 — compare.html rendering:
5. Render Prime pill from `isPrime`
6. Render full coupon/savings detail
7. Render delivery range (free + fast if both present)
8. Render source tag (WF, Fresh, Pharmacy, etc.)

Phase 3 — persistent session (bigger work, may be Chat 23):
9. localStorage for working comparison state
10. Inline notes editing on compare.html
11. Tab messaging so extension can append to open compare tab
12. Explicit "Save & share" button → Supabase → permanent link

---

## Progress snapshot

### ✅ Recently done
- Supabase compare — no item limit (Chat 21)
- renderError split into two states (Chat 21)
- Lavender Fields palette applied to styles.css, index.html, compare.html (Chat 21) — needs redesign
- Keyword filter bug fixed (Chat 20)
- privacy.html built (Chat 20)
- Developer account created (Chat 20)

### 🔜 Next up — Chat 22
1. Compare table payload fixes (Prime, coupon detail, delivery range, retailer)
2. Compare table rendering updates
3. Begin persistent research session architecture

### 🔭 Further out (pre-alpha)
- Screenshots (5) — blocked on palette redesign
- Chrome Web Store submission — blocked on screenshots
- Palette redesign using Claude Design tool
- Research page limit

### 🔭 Further out (post-alpha)
- Power search form
- Product page re-enabled
- Cross-page shortlist persistence
- Two-way extension ↔ website connection
- Hidden data capture batch
- Review integrity signals + Keepa links
- Sold by / Ships from in compare table (requires product page)
- Walmart version

---

## Key reminders

- `core.js` uses callback pattern, not Promises
- Always confirm scope with Melissa before touching any files
- Code files are NOT in the Claude Project — upload fresh from GitHub each session
- Files must be actual file uploads, not document blocks
- Use AskUserQuestion widget for clarifying questions
- All Google tasks: InPrivate Edge + butactuallyuseful@gmail.com
- Context rot: stop and wrap up rather than pushing through
- Version: manifest `0.6.1` · search.js `0.6.1.12` · compare.html `0.6.1.12`
- Always provide a suggested GitHub commit message at end of session
- Always include context/token status when asking "continue or wrap up?"
- Bundle small changes together rather than shipping each one separately
- Always include Project_Briefing.md in end-of-session documents — do not skip it
- Project documents now live in `docs/` folder in GitHub — update them there after each session
- Affiliate tags go on the website only — never in the extension
- The Comparisons page must work for users who arrive via shared link without the extension
- actuallyuseful.net is not yet pointed at GitHub Pages
- Amazon Associates disclaimer goes on every page — standing rule from Chat 16
- compare.html is in the repo root
- privacy.html is in the repo root
- search.js sends raw numbers to compare.html — compare.html handles all formatting
- Supabase secret key never goes in browser code — publishable key only
- Feedback form pre-fill uses full viewform URL, not forms.gle shortlink
- Feedback form entry IDs: version = entry.1362282898 · browser = entry.1312500883
- Screenshot method: DevTools → device emulator → 1280×800 → Ctrl+Shift+P → "Capture screenshot"
- Do NOT use laundry pods for unit price screenshot (wrong units bug)
- Claude Design tool is the right place for iterative visual/palette work — doesn't count against message limits
- compare.html now loads via ?id= (Supabase) by default; ?data= fallback kept for old links

---

## Suggested commit message
`v0.6.1.12 — Supabase compare (no item limit), Lavender Fields palette, error states`

## End-of-session checklist
- [ ] Handover.md — written
- [ ] Changelog.md — updated
- [ ] Roadmap.md — updated
- [ ] Project_Briefing.md — updated
- [ ] Melissa puts updated docs in `docs/` folder in GitHub
- [ ] Melissa commits and pushes via GitHub Desktop (pull → stage → commit → push)
- [ ] Melissa updates project files in Claude Project (upload new versions)
