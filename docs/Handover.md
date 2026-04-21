# Session Handover — April 21, 2026 (Chat 20)

## What we did this session

1. **Chrome Web Store strategy decided**
   - Going with unlisted Store listing (not sideloaded alpha)
   - Unlisted = goes through review, not publicly discoverable, share direct link with testers
   - Auto-updates are a key advantage over sideloading
   - Edge users covered automatically — Chrome Web Store extensions install on Edge natively
   - Affiliate links: can't apply for Associates yet; add tag to compare.html after approval, don't block on it

2. **Developer account created**
   - butactuallyuseful@gmail.com, $5 fee paid, InPrivate Edge

3. **Privacy policy written and published (privacy.html — new file)**
   - Matches index.html styling exactly (same fonts, colors, nav, footer)
   - Covers: telemetry collection and opt-out, comparison page data, affiliate links, contact
   - Contact email: butactuallyuseful@gmail.com
   - Goes in repo root alongside index.html and compare.html

4. **index.html updated**
   - Privacy link added to footer

5. **Store descriptions written**
   - Short (107 chars): "Sort Amazon by unit price, filter results, shortlist products, and shop on your terms. Free, always."
   - Long description: written this session — saved in session notes, not in a file. Claude can regenerate from Handover if needed.

6. **Screenshots planned (5, not yet taken)**
   - Method: DevTools device emulator → 1280×800 → Ctrl+Shift+P → "Capture screenshot" → saves to Downloads as PNG, no browser chrome
   - Lineup: (1) unit price sort, (2) keyword filter active, (3) shortlist with Compare button, (4) comparison table on website, (5) multi-page + source filter
   - Do NOT use laundry pods for unit price screenshot — bug present (wrong units shown)
   - Olive oil or paper towels recommended for unit price shot

7. **Keyword filter bug fixed (search.js → v0.6.1.11)**
   - `kwDebounceTimer` was never declared — render() wasn't firing on keystrokes
   - Fix: `var kwDebounceTimer = null;` added to state block
   - Confirmed working by Melissa

---

## ⚠️ Start of next session

1. Melissa uploads fresh code files from GitHub as actual file uploads: search.js, index.html, compare.html
2. Claude confirms version strings: `0.6.1` (manifest) · `0.6.1.11` (search.js header) · `0.6.1.10` (compare.html)
3. Confirm scope before touching any files
4. Ask Melissa if she has fresh testing observations

---

## Known issues / bugs noted this session

- **Laundry pods show wrong unit ($/lb instead of $/ct)** — Amazon reports weight-based unit price on these listings; AU accepts it rather than calculating from count. Log for pre-launch fixing.
- **Mixed units in results** — `/lb` and `/ct` appearing together in same search suggests cross-family sorting may be happening. Investigate when next in code.

---

## Next session agenda (Chat 21)

1. Take 5 screenshots using DevTools capture method
2. Submit extension to Chrome Web Store as unlisted listing
3. Write Store listing copy into the dashboard

---

## Store submission checklist (for reference)

- [x] Developer account created
- [x] Privacy policy at a URL (privacy.html live after this push)
- [x] Short description written
- [x] Long description written
- [x] Icon 128×128px PNG (already in extension)
- [x] Category: Shopping
- [ ] Screenshots (5) — next session
- [ ] Submit as Unlisted
- [ ] Create Amazon account (prerequisite for Associates)
- [ ] Apply for Amazon Associates (after real user base established)

---

## Progress snapshot

### ✅ Recently done
- Keyword filter bug fixed (Chat 20)
- privacy.html built (Chat 20)
- index.html Privacy footer link added (Chat 20)
- Store descriptions written (Chat 20)
- Developer account created (Chat 20)
- Feedback form pre-fill — extension + comparison page (Chat 19)
- Affiliate note reordered + reworded (Chat 19)
- Supabase shareable links (Chat 18)
- Best-value tie handling fixed (Chat 18)

### 🔜 Next up — Chat 21
1. Screenshots (5) — DevTools capture method
2. Chrome Web Store submission (unlisted)

### 🔭 Further out (pre-alpha)
- Research page limit (7 pages confirmed in practice, not definitively)
- Laundry pods / wrong unit bug
- Mixed unit cross-family sort investigation

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
- Version: manifest `0.6.1` · search.js header `0.6.1.11` · compare.html `0.6.1.10`
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
- privacy.html is in the repo root
- search.js sends raw numbers to compare.html (not formatted strings)
- Supabase secret key never goes in browser code — publishable key only
- Feedback form pre-fill uses full viewform URL, not forms.gle shortlink
- Feedback form entry IDs: version = entry.1362282898 · browser = entry.1312500883
- Screenshot method: DevTools → device emulator → 1280×800 → Ctrl+Shift+P → "Capture screenshot"
- Do NOT use laundry pods for unit price screenshot (wrong units bug)

---

## Suggested commit message
`v0.6.1.11 — keyword filter bug fixed, privacy.html added, index.html footer updated`

## End-of-session checklist
- [x] Handover.md — written
- [x] Changelog.md — updated
- [x] Roadmap.md — updated
- [x] Project_Briefing.md — updated
- [ ] Melissa puts updated docs in `docs/` folder in GitHub
- [ ] Melissa commits and pushes via GitHub Desktop (pull → stage → commit → push)
- [ ] Melissa updates project files in Claude Project (upload new versions)
