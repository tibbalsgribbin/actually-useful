# Session Handover — April 20, 2026 (Chat 16)

## What we did this session

1. **compare.html built** — Actually Useful Comparisons page, phase 1. Full comparison table with all shortlist fields. Sortable columns. Best-value star on lowest PPU. Affiliate links with correct Amazon Associates disclosure. Empty/error state. Matches landing page style. No Supabase yet — URL bridge only.

2. **Affiliate disclaimer updated** — changed from informal copy to the required Amazon Associates wording: "As an Amazon Associate I earn from qualifying purchases. Links on this page support Actually Useful — and don't cost you anything extra."

3. **Standing rule established** — the Amazon Associates disclaimer goes on the bottom of every page going forward, whether or not there are live affiliate links at the time.

4. **Committed and pushed as v0.6.1.7.**

---

## ⚠️ Start of next session

1. Melissa uploads fresh code files from GitHub as actual file uploads
2. Claude confirms version strings: `0.6.1` (manifest) / `0.6.1.5` (core.js, search.js)
3. Confirm scope before touching any files
4. Ask Melissa if she has fresh testing observations

---

## Progress snapshot

### ✅ Recently done
- Feedback form verified (Chat 15)
- Manifest warning fixed (Chat 15)
- Landing page live at tibbalsgribbin.github.io/actually-useful/ (Chat 15)
- compare.html built and pushed (Chat 16)
- Affiliate disclaimer corrected to required Amazon Associates wording (Chat 16)

### 🔜 Next up — Chat 17
1. Add "Compare side by side (N)" button to shortlist bar in search.js
   - Encodes shortlist as Base64 JSON: `{ items: [...], searchTerm: "..." }`
   - Opens `https://tibbalsgribbin.github.io/actually-useful/compare.html?data=[encoded]`
   - Button only visible when ≥1 item is shortlisted
   - Each item object shape (confirmed this session):
     ```
     { asin, title, price, ppu, ppuUnit, delivery, rating, reviewCount,
       prime, coupon, soldBy, shipsFrom, returnPolicy, note }
     ```
2. Supabase setup + shareable links (may be a separate session)

### 🔭 Further out (pre-alpha)
- Test extension on a different setup (Mac or Chrome vs Edge)
- Decide: Chrome Web Store submission before or after alpha?
- Alpha tester recruitment

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
- CSS/JS rule: removing JS visibility toggle → check and fix CSS baseline too
- Version: manifest uses three-part `0.6.1`; AU_VERSION in core.js is `0.6.1.5`
- Always provide a suggested GitHub commit message at end of session
- Always include context/token status when asking "continue or wrap up?"
- Bundle small changes together rather than shipping each one separately
- Always include Project_Briefing.md in end-of-session documents — do not skip it
- Project documents now live in `docs/` folder in GitHub — update them there after each session
- Shortlist bar show/hide jank is known and noted — not worth fixing before website integration rethinks the whole bar
- Affiliate tags go on the website only — never in the extension
- The Comparisons page must work for users who arrive via shared link without the extension installed
- actuallyuseful.net is not yet pointed at GitHub Pages — still resolving to tibbalsgribbin.github.io/actually-useful/
- Amazon Associates disclaimer ("As an Amazon Associate I earn from qualifying purchases...") goes on every page — standing rule from Chat 16

---

## Suggested commit message
`v0.6.1.7 — add compare.html, fix affiliate disclaimer`

## End-of-session checklist
- [x] Handover.md — written
- [x] Changelog.md — updated
- [x] Roadmap.md — updated
- [x] Project_Briefing.md — updated
- [x] compare.html — downloaded and placed in repo root
- [ ] Melissa puts updated docs in `docs/` folder in GitHub
- [ ] Melissa commits and pushes via GitHub Desktop (pull → stage → commit → push)
- [ ] Melissa updates project files in Claude Project (upload new versions)
