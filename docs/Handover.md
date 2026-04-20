# Session Handover — April 20, 2026 (Chat 15)

## What we did this session

1. **Feedback form verified** — all three required questions confirmed present. Done.

2. **Manifest warning fixed (manifest.json)** — deleted `_content_scripts_product_disabled` block entirely. Edge warning is gone. Extension loads cleanly.

3. **Landing page built and deployed (index.html)** — full `index.html` created and pushed to repo root. GitHub Pages deployed automatically. Live at `https://tibbalsgribbin.github.io/actually-useful/`. Design: cream/navy/teal palette, DM Serif Display + DM Sans, four pillars, Why it exists section, feature grid, Ko-fi support section, footer.

4. **Task Overview updated** — all completed items struck through, manifest warning added and struck, FR badge correctly noted as deferred (not done), new items current as of this session.

5. **Committed and pushed as v0.6.1.6.**

---

## ⚠️ Start of next session

1. Melissa uploads fresh files from GitHub as actual file uploads
2. Claude confirms version strings: `0.6.1` (manifest) / `0.6.1.5` (core.js, search.js)
3. Confirm scope before touching any files
4. Ask Melissa if she has fresh testing observations

---

## Progress snapshot

### ✅ Recently done
- Ko-fi link fixed in nudge (Chat 14)
- Page-fetch throttling — 750ms between sequential fetches (Chat 14)
- auSendLog moved to background.js (Chat 14)
- Telemetry opt-out toggle + popup (Chat 14)
- Feedback form verified — all three questions present (Chat 15)
- Manifest warning fixed — `_content_scripts_product_disabled` block deleted (Chat 15)
- Landing page live at tibbalsgribbin.github.io/actually-useful/ (Chat 15)
- Task Overview updated and current (Chat 15)

### 🔜 Next up — Chat 16
1. Build `compare.html` — Actually Useful Comparisons page (phase 1)
   - Basic comparison table structure
   - Decode shortlist data from URL parameter
   - Affiliate tag application
   - Must work for users who arrive via shared link without the extension
   - No Supabase yet — URL bridge only for phase 1

### 🔭 Further out (pre-alpha)
- "Compare side by side (N)" button in shortlist bar → opens Comparisons page (Chat 17)
- Supabase setup + shareable links (Chat 17)
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
- Version: manifest uses three-part `0.6.1`; AU_VERSION in core.js is `0.6.1.5`; landing page does not carry a version string
- Always provide a suggested GitHub commit message at end of session
- Always include context/token status when asking "continue or wrap up?"
- Bundle small changes together rather than shipping each one separately
- Always include Project_Briefing.md in end-of-session documents — do not skip it
- Project documents now live in `docs/` folder in GitHub — update them there after each session
- Shortlist bar show/hide jank is known and noted — not worth fixing before website integration rethinks the whole bar
- Affiliate tags go on the website only — never in the extension
- The Comparisons page must work for users who arrive via shared link without the extension installed — don't strangle that growth vector
- actuallyuseful.net is not yet pointed at GitHub Pages — still resolving to tibbalsgribbin.github.io/actually-useful/

---

## Suggested commit message
*(Already committed this session as: `v0.6.1.6 — fix manifest warning, add landing page`)*

## End-of-session checklist
- [x] Handover.md — written
- [x] Changelog.md — updated
- [x] Roadmap.md — updated
- [x] Project_Briefing.md — updated
- [x] manifest.json — downloaded and placed
- [x] index.html — downloaded and placed
- [x] Committed and pushed via GitHub Desktop
- [ ] Melissa downloads all four docs and puts them in `docs/` in GitHub
- [ ] Melissa updates project files in Claude Project (upload new versions)
