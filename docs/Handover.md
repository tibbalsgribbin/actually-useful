# Session Handover — April 19, 2026 (Chat 13)

## What we did this session

1. **Minimum rating filter fixed (search.js)** — `r.rating` was never being set. Added `parseRating(el)` (scrapes `aria-label="X out of 5 stars"`) and wired it into `scrapeCard()`. Slider now filters correctly; tested and confirmed working.

2. **product.js disabled in manifest (manifest.json)** — Second `content_scripts` entry moved to `_content_scripts_product_disabled`. Product page no longer runs on `/dp/*` visits.

3. **Affiliate tag machinery removed (core.js)** — `AU_AFFILIATE_TAG` and `auTagUrl()` removed entirely. No callers existed. Policy-violation risk eliminated.

4. **Show Selected / Clear Selection reworked (search.js)** — Both buttons moved from Sort section to shortlist bar. New bar order: Select all · Show selected only (N) · Clear selection · Open in new tabs (N). Two-state label: "Show selected only (N)" / "Show all". Buttons hidden when nothing is checked.

5. **Process improvement** — Melissa asked for context/token status to be included whenever the "continue or wrap up?" question is asked. Done from this session forward.

---

## ⚠️ Start of next session

1. Melissa uploads `search.js`, `core.js`, `manifest.json` fresh from GitHub as actual file uploads
2. Claude confirms version strings: `0.6.1` (manifest) / `0.6.1.4` (core.js, search.js) before any edits
3. Confirm scope before touching any files
4. Ask Melissa if she has any fresh testing observations

---

## Progress snapshot

### ✅ Recently done
- Panel height resize via bottom drag handle
- Persistent filter settings per search term (sessionStorage)
- Refresh → Re-scan page (label + all messages)
- Select-all simple toggle, no confirm dialog
- Shortlist bar always visible
- System font stack
- Keyword debouncing (250ms)
- Empty state message when filters clear everything
- Frequently Returned badge — bold (red still needed)
- Collapse/minimize bug fixed (Chat 12)
- Version strings aligned to sub-1.0 numbering (Chat 12)
- docs/ folder created in GitHub (Chat 12)
- Minimum rating filter fixed — parseRating() + r.rating (Chat 13) ✅ was red flag
- product.js disabled in manifest (Chat 13) ✅ was red flag
- Affiliate tag machinery removed from core.js (Chat 13) ✅ was must-do
- Show Selected / Clear Selection reworked — moved to shortlist bar (Chat 13)

### 🔜 Next up (short term) — in order
1. Frequently Returned badge — make it red (bold done, red still needed)
2. Page-fetch throttling (500ms delay between fetches)
3. Move `auSendLog` to background.js
4. Telemetry opt-out toggle
5. Fix Ko-fi link inconsistency (nudge vs footer) — verify correct URL

### 🔭 Further out (post-alpha)
- GitHub Pages setup (actuallyuseful.net)
- Supabase setup (shareable links)
- Marketing/landing page built and published
- Comparison page with sort/filter + shareable links — "Open in new tabs" becomes "Compare on website"
- Power search form (Jungle Search model)
- "Export to website" button in shortlist bar
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
- Version: manifest uses three-part `0.6.1`; AU_VERSION in core.js is `0.6.1.4`
- Always provide a suggested GitHub commit message at end of session
- Always include context/token status when asking "continue or wrap up?"
- Bundle small changes together rather than shipping each one separately
- Always include Project_Briefing.md in end-of-session documents — do not skip it
- Project documents now live in `docs/` folder in GitHub — update them there after each session
- Shortlist bar show/hide jank is known and noted — not worth fixing before website integration rethinks the whole bar

---

## Suggested commit message
`v0.6.1.4 — fix rating filter, disable product.js, remove affiliate tag, rework Show Selected`

## End-of-session checklist
- [x] Handover.md — written
- [x] Changelog.md — updated
- [x] Roadmap.md — updated
- [x] Project_Briefing.md — updated
- [ ] Melissa downloads all four documents and puts them in `docs/` in GitHub
- [ ] Melissa downloads search.js, core.js, manifest.json and replaces files in extension folder
- [ ] Melissa commits and pushes via GitHub Desktop
- [ ] Melissa updates project files in Claude Project (upload new versions)
