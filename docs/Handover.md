# Session Handover — April 21, 2026 (Chat 24)

## What we did this session (Chat 23)

Coding session. Two files changed. All five issues from Melissa's Chat 22 testing addressed.

**search.js (v0.6.1.14):**
- Added `freeDateTs` and `fastDateTs` (epoch ms from Date objects) to compare payload — enables time-precise delivery sort
- Added `searchUrl: window.location.href` to compare payload — enables clickable Amazon link in compare.html

**compare.html (v0.6.1.14):**
- Coupon sort fixed — was alphabetizing strings; now boolean sort on any promo presence; couponed items sort to top
- Delivery sort fixed — now uses `freeDateTs`/`fastDateTs` timestamps; items with no delivery date go last
- Search term badge — now reads "Amazon search: [clickable link to Amazon results]"; only works for new comparisons
- Keyword focus fixed — keyword input now calls `rerenderTableOnly()` which replaces only `#meta-and-table`, leaving filter bar DOM (and the input) untouched
- Price range filter added — Min price / Max price number inputs in filter bar; applied in `applyFilters()`; cleared by Clear filters

---

## ⚠️ Start of next session (Chat 24)

1. Melissa uploads fresh search.js and compare.html from GitHub as actual file uploads
2. Claude confirms version strings: manifest `0.6.1` · search.js `0.6.1.14` · compare.html `0.6.1.14`
3. Confirm scope before touching any files

---

## Known issues / bugs

- **Palette not working well on actual extension** — needs redesign session using Claude Design tool before screenshots can be taken
- **Laundry pods show wrong unit ($/lb instead of $/ct)** — ongoing
- **Mixed units in results** — cross-family sort may be occurring
- **"Amazon search" link** — only works for comparisons created after v0.6.1.14; old Supabase rows lack `searchUrl`

---

## Next session agenda (Chat 24)

1. Palette redesign (Claude Design tool) — this is the blocker for everything below
2. Screenshots (5) — blocked on palette
3. Chrome Web Store submission — blocked on screenshots
4. If all above done: persistent research session on compare.html (localStorage, inline notes, tab messaging, Save & share)

---

## Progress snapshot

### ✅ Recently done
- All five Chat 22 testing issues fixed (Chat 23)
- Compare payload expanded — searchUrl, freeDateTs, fastDateTs (Chat 23)
- Coupon/delivery sort fixed, keyword focus fixed, price range filter added (Chat 23)
- Compare payload expanded — all panel data survives trip to compare.html (Chat 22)
- Compare table updated — new columns, blank columns removed (Chat 22)
- Filter bar on compare.html (Chat 22)
- Supabase compare — no item limit (Chat 21)

### 🔜 Next up — Chat 24
1. Palette redesign (Claude Design tool)
2. Screenshots — blocked on palette
3. Chrome Web Store submission — blocked on screenshots

### 🔭 Further out
- Persistent research session (compare.html)
- Power search form
- Product page re-enabled
- Cross-page shortlist persistence
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
- Version: manifest `0.6.1` · search.js `0.6.1.14` · compare.html `0.6.1.14`
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
- compare.html loads via ?id= (Supabase) by default; ?data= fallback kept for old links
- compare.html JS must use string concatenation, not template literals — Python escaping breaks template literals in .html files
- All data that appears in the extension panel listing should be in the compare.html payload — no exceptions
- rerenderTableOnly() leaves filter bar DOM untouched — keyword input uses this to avoid focus loss
- #meta-and-table is the stable wrapper div for the meta bar + table (does not include filter bar)

---

## End-of-session checklist
- [x] Handover.md — written (this file)
- [x] Roadmap.md — updated
- [x] Changelog.md — updated
- [x] Project_Briefing.md — updated
- [x] Changed code files presented (search.js v0.6.1.14, compare.html v0.6.1.14)
- [ ] Melissa puts updated docs in `docs/` folder in GitHub
- [ ] Melissa commits and pushes via GitHub Desktop (pull → stage → commit → push)
- [ ] Melissa updates project files in Claude Project (upload new versions)
