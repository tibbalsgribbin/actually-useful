# Session Handover — April 21, 2026 (Chat 26)

## What we did this session (Chat 25)

Coding session across three chat continuations. Two files changed. Seven features added.

**search.js (v0.6.1.15):**
- Notes field — textarea appears per checked item; persists through re-renders; note saved on uncheck
- Notes travel to compare.html via compare payload
- `listPrice` added to compare payload (needed for two-line coupon display)
- Price range filter — Min $ / Max $ inputs in Filters section; hides rows, excludes from best-value, resets with Start over, persists in session
- CSS for new elements injected inline on panel build (price inputs, notes textarea) — belongs in styles.css long-term
- `minPrice`/`maxPrice` added to `saveFilters`/`loadFilters` and `anyFilterActive` check

**compare.html (v0.6.1.15):**
- Notes column — italic note text, not sortable (cursor:default, click guarded in attachSortHandlers)
- Coupon display — two lines when coupon: "$X.XX with coupon" / ~~was $Y.YY~~
- Delivery times — same-day items show time appended (e.g. "Apr 21 by 9:00 pm"), derived from freeDateTs/fastDateTs
- Liquid unit toggle — "As listed / fl oz / ml" buttons above table when liquid items present; re-normalizes PPUs and recalculates best-value star
- `findBestPpuIndices` updated to normalize liquids to fl oz for fair comparison regardless of toggle state
- `renderCouponCell` and `formatDeliveryDate` extracted as shared helpers (used by both renderTable and rerenderTableOnly)
- `attachLiquidToggleHandlers` added; called after rerender and rerenderTableOnly

---

## ⚠️ Start of next session (Chat 26)

1. Melissa uploads fresh search.js and compare.html from GitHub as actual file uploads
2. Claude confirms version strings: manifest `0.6.1` · search.js `0.6.1.15` · compare.html `0.6.1.15`
3. Confirm scope before touching any files

---

## Known issues / bugs

- **Palette not working well on actual extension** — needs redesign session using Claude Design tool before screenshots can be taken
- **CSS for notes/price inputs is injected inline** — should be moved to styles.css before Web Store submission
- **Laundry pods show wrong unit ($/lb instead of $/ct)** — ongoing
- **Mixed units in results** — cross-family sort may be occurring
- **"Amazon search" link in compare.html** — only works for comparisons created after v0.6.1.14; old Supabase rows lack `searchUrl`

---

## Next session agenda (Chat 26)

1. **Test v0.6.1.15** — notes, price range, coupon display, delivery times, liquid toggle
2. **Palette redesign** (Claude Design tool) — blocker for everything below
3. **Screenshots** (5) — blocked on palette
4. **Chrome Web Store submission** — blocked on screenshots

---

## Progress snapshot

### ✅ Recently done
- Notes field in extension + notes column on compare.html (Chat 25)
- Price range filter in extension (Chat 25)
- Two-line coupon display on compare.html (Chat 25)
- Delivery times for same-day items on compare.html (Chat 25)
- Liquid unit normalization toggle on compare.html (Chat 25)
- All five Chat 22 testing issues fixed (Chat 23)
- Compare payload fully expanded — all panel data survives trip to compare.html (Chats 22–23)
- Filter bar on compare.html (Chat 22)
- Supabase compare — no item limit (Chat 21)

### 🔜 Next up — Chat 26
1. Test v0.6.1.15
2. Palette redesign (Claude Design tool)
3. Screenshots
4. Chrome Web Store submission

### 🔭 Further out
- Move injected CSS to styles.css (pre-Web Store)
- Persistent research session (compare.html) — localStorage, inline notes editing in table, tab messaging, Save & share
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
- Version: manifest `0.6.1` · search.js `0.6.1.15` · compare.html `0.6.1.15`
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
- Notes CSS (ppu-item-note, ppu-price-input, ppu-price-range-row, price-hidden) is currently injected inline — move to styles.css before Web Store submission
- liquid-unit-btn handlers wired by attachLiquidToggleHandlers(), called after rerender and rerenderTableOnly
- Notes column (key: 'note') has nosort:true — sort handler guards against cursor:default headers

---

## End-of-session checklist
- [x] Handover.md — written (this file)
- [x] Roadmap.md — updated
- [x] Changelog.md — updated
- [x] Project_Briefing.md — updated
- [x] Changed code files presented (search.js v0.6.1.15, compare.html v0.6.1.15)
- [ ] Melissa puts updated docs in `docs/` folder in GitHub
- [ ] Melissa commits and pushes via GitHub Desktop (pull → stage → commit → push)
- [ ] Melissa updates project files in Claude Project (upload new versions)
