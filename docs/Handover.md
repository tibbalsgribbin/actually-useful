# Session Handover — April 21, 2026 (Chat 23)

## What we did this session (Chat 22)

Coding session. Two files changed.

**search.js — payload expanded:**
- Added `isPrime` (detected from result card DOM at click time)
- Added `isSponsored` (already detected, promoted to payload)
- Split coupon fields: `hasCoupon`, `couponPillOnly`, `sns`, `savings` (previously one collapsed string)
- Split delivery fields: `freeDate`, `fastDate`, `freeQualifier` (previously one formatted string)
- Added `retailerKey`

**compare.html — table + filter bar:**
- Removed three permanently-blank columns: Sold by, Ships from, Returns
- Added Source column (retailer pill for non-standard; plain "Amazon" for standard)
- Prime, coupon, delivery columns now use the new payload fields correctly
- Sponsored items show "Ad" badge in title cell
- Filter bar added above table — collapsible, expanded by default — keyword, min reviews, source/retailer dropdown, hide sponsored toggle, clear button
- Column sort via header clicks still works and respects active filters

**Bug during session:** First compare.html delivery had a syntax error (`Missing } in template expression`) caused by Python heredoc escaping producing `\'` sequences in JS. Fixed by rewriting the affected block using string concatenation instead of template literals. Added a working rule to Roadmap to prevent recurrence.

---

## ⚠️ Start of next session (Chat 23)

1. Melissa shares her Chat 22 testing observations — do this before anything else
2. Melissa uploads fresh search.js and compare.html from GitHub as actual file uploads
3. Claude confirms version strings: manifest `0.6.1` · search.js `0.6.1.13` · compare.html `0.6.1.13`
4. Confirm scope before touching any files

---

## Known issues / bugs

- **Palette not working well on actual extension** — needs redesign session using Claude Design tool before screenshots can be taken
- **Laundry pods show wrong unit ($/lb instead of $/ct)** — ongoing
- **Mixed units in results** — cross-family sort may be occurring
- **Testing observations from Chat 22** — Melissa has observations to share; may reveal new bugs

---

## Next session agenda (Chat 23)

1. Hear and triage Melissa's testing observations
2. Fix anything that came up in testing
3. Palette redesign (Claude Design tool) — blocked on this before screenshots
4. If palette is done: screenshots
5. If all above done: persistent research session on compare.html (localStorage, inline notes, tab messaging, Save & share)

---

## Progress snapshot

### ✅ Recently done
- Compare payload expanded — all panel data now survives the trip to compare.html (Chat 22)
- Compare table updated — new columns, blank columns removed (Chat 22)
- Filter bar on compare.html (Chat 22)
- Supabase compare — no item limit (Chat 21)
- Lavender Fields palette applied (Chat 21) — needs redesign

### 🔜 Next up — Chat 23
1. Triage testing observations
2. Palette redesign (Claude Design tool)
3. Screenshots — blocked on palette
4. Chrome Web Store submission — blocked on screenshots

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
- Version: manifest `0.6.1` · search.js `0.6.1.13` · compare.html `0.6.1.13`
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

---

## End-of-session checklist
- [x] Handover.md — written (this file)
- [x] Roadmap.md — updated
- [x] Changelog.md — updated
- [x] Project_Briefing.md — updated
- [x] Changed code files presented (search.js v0.6.1.13, compare.html v0.6.1.13)
- [ ] Melissa puts updated docs in `docs/` folder in GitHub
- [ ] Melissa commits and pushes via GitHub Desktop (pull → stage → commit → push)
- [ ] Melissa updates project files in Claude Project (upload new versions)
