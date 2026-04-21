# Session Handover — April 20, 2026 (Chat 19)

## What we did this session

1. **Affiliate note reordered and reworded (compare.html)**
   - Share button now above affiliate note (was below)
   - New wording: "This post contains affiliate links. If you click through and make a purchase, I may earn a commission at no additional cost to you."

2. **Feedback form pre-fill (search.js, compare.html)**
   - New form URL: https://forms.gle/XU8RpYM3cGFTwQQ86
   - Two new fields added to form: "Extension version" (entry.1362282898) and "Browser" (entry.1312500883)
   - search.js: `auFeedbackUrl()` function added — detects AU_VERSION + browser (Edge/Chrome/Firefox/Safari/Other), builds pre-filled viewform URL
   - compare.html: inline script sets feedback link href dynamically — pre-fills browser + "website" for version
   - Full viewform URL used (not forms.gle shortlink) — required for pre-fill to work
   - compare.html feedback link also updated to new form URL

3. **Committed and pushed as v0.6.1.10**

---

## ⚠️ Start of next session

1. Melissa uploads fresh code files from GitHub as actual file uploads
2. Claude confirms version strings: `0.6.1` (manifest) · `0.6.1.8` (search.js header) · `0.6.1.10` (compare.html — check for `auFeedbackUrl` inline script)
3. Confirm scope before touching any files
4. Ask Melissa if she has fresh testing observations

---

## Known issues to address

- **Page limit** — does Amazon cap at 7 pages? Varies by category? Research before committing to higher UI cap.
- **Best-value star ties** — appears to be working; keep an eye on with more varied PPU data.

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
- Affiliate note reordered + reworded (Chat 19)
- Feedback form pre-fill — extension + comparison page (Chat 19)

### 🔜 Next up — Chat 20
1. Alpha tester recruitment — decide timing and approach
2. Test extension on a different setup (Mac or Chrome vs Edge)
3. Decide: Chrome Web Store submission before or after alpha?

### 🔭 Further out (pre-alpha)
- Research page limit (7 pages confirmed in practice, not definitively)

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
- Version: manifest `0.6.1` · search.js header `0.6.1.8` · compare.html `0.6.1.10`
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
- Feedback form pre-fill uses full viewform URL, not forms.gle shortlink
- Feedback form entry IDs: version = entry.1362282898 · browser = entry.1312500883

---

## Suggested commit message
`v0.6.1.10 — feedback form pre-fill, affiliate note reorder and rewording`

## End-of-session checklist
- [x] Handover.md — written
- [x] Changelog.md — updated
- [x] Roadmap.md — updated
- [x] Project_Briefing.md — updated
- [ ] Melissa puts updated docs in `docs/` folder in GitHub
- [ ] Melissa commits and pushes via GitHub Desktop (pull → stage → commit → push)
- [ ] Melissa updates project files in Claude Project (upload new versions)
