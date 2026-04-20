# Session Handover — April 20, 2026 (Chat 18)

## What we did this session

1. **Supabase setup**
   - Created Supabase account (via GitHub), organisation "Actually Useful", project "actually-useful", free tier
   - Created `comparisons` table: id (int8), created_at (timestamptz), data (text), RLS disabled
   - Obtained publishable key (`sb_publishable_h70-...`) and project URL

2. **Shareable links added to compare.html**
   - `saveComparison()` — POSTs items + searchTerm to Supabase, returns row id
   - `loadComparison()` — fetches by id, returns stored comparison
   - `init()` checks for `?id=` first; falls back to `?data=` decode
   - Share button in meta bar (top) and below affiliate note (bottom)
   - First click: saves, updates URL to `?id=xxx`, copies link
   - Subsequent clicks: reuses existing id, re-copies — no duplicate writes
   - Button resets to "Share this comparison" after 2.5s
   - Duplicate event listener bug fixed via `data-share-attached` attribute
   - `cursor: pointer` and `:active` press effect added to `.btn`

3. **Best-value tie handling fixed (compare.html)**
   - `findBestPpuIndex` → `findBestPpuIndices` returning a Set
   - Floating-point safe: rounds to 6dp before comparison
   - Confirmed working in testing

4. **Committed and pushed as v0.6.1.9**

---

## ⚠️ Start of next session

1. Melissa uploads fresh compare.html from GitHub as actual file upload
2. Claude confirms it contains `findBestPpuIndices` and Supabase config
3. Confirm scope before touching any files
4. Ask Melissa if she has fresh testing observations

---

## Known issues to address

- **Affiliate note position** — currently above the Share button; Melissa wants it below. Minor CSS tweak — bundle with next change rather than shipping alone.
- **Best-value star ties** — appears to be working; keep an eye on with more varied PPU data.
- **Page limit** — does Amazon cap at 7 pages? Varies by category? Research before committing to higher UI cap.
- **Feedback form pre-fill** — browser + version info not yet captured. Pre-fill via query params on form URL (Google Forms supports this natively). On roadmap.

---

## Progress snapshot

### ✅ Recently done
- Landing page live (Chat 15)
- compare.html built (Chat 16)
- Affiliate disclaimer corrected (Chat 16)
- Compare button added, open-in-tabs removed (Chat 17)
- Gmail-style select-all dropdown (Chat 17)
- Price/PPU NaN bug fixed (Chat 17)
- Best-value tie handling fixed (Chat 18)
- Supabase shareable links (Chat 18)

### 🔜 Next up — Chat 19
1. Affiliate note position fix (CSS only — bundle with something else)
2. Feedback form pre-fill with browser/version info
3. Alpha tester recruitment — decide timing and approach

### 🔭 Further out (pre-alpha)
- Research page limit (7 pages confirmed in practice, not definitively)
- Test extension on a different setup (Mac or Chrome vs Edge)
- Decide: Chrome Web Store submission before or after alpha?

### 🔭 Further out (post-alpha)
- Power search form (Jungle Search model)
- Product page re-enabled
- Cross-page shortlist persistence (chrome.storage.local)
- Two-way extension ↔ website connection
- Hidden data capture batch (SNAP, Small Business, Condition, Amazon's Choice, Best Seller)
- Review integrity signals + Keepa price history links
- Badge text on toolbar icon (shortlist count)
- Contribution nudge
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
- Version: manifest `0.6.1` · search.js `0.6.1.8` · compare.html `0.6.1.9`
- Always provide a suggested GitHub commit message at end of session
- Always include context/token status when asking "continue or wrap up?"
- Bundle small changes together rather than shipping each one separately
- Always include Project_Briefing.md in end-of-session documents — do not skip it
- Project documents now live in `docs/` folder in GitHub — update them there after each session
- Affiliate tags go on the website only — never in the extension
- The Comparisons page must work for users who arrive via shared link without the extension
- actuallyuseful.net is not yet pointed at GitHub Pages
- Amazon Associates disclaimer goes on every page — standing rule from Chat 16
- compare.html is in the repo root (not in a subfolder)
- search.js sends raw numbers to compare.html (not formatted strings)
- Supabase secret key never goes in browser code — publishable key only
- compare.html `data-share-attached` attribute prevents duplicate share event listeners

---

## Suggested commit message
`v0.6.1.9 — Supabase shareable links, best-value tie fix`

## End-of-session checklist
- [x] Handover.md — written
- [x] Changelog.md — updated
- [x] Roadmap.md — updated
- [x] Project_Briefing.md — updated
- [ ] Melissa puts updated docs in `docs/` folder in GitHub
- [ ] Melissa commits and pushes via GitHub Desktop (pull → stage → commit → push)
- [ ] Melissa updates project files in Claude Project (upload new versions)
