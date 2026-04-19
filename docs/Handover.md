# Session Handover — April 19, 2026 (Chat 12)

## What we did this session

1. **Collapse/minimize bug fixed** — when the panel had been resized, the ⇕ button was toggling between the resized height and the CSS collapsed height instead of collapsing to just the header. Root cause: inline `style.height` and `style.maxHeight` were overriding the CSS `.collapsed` rule. Fix: collapse button now clears inline height styles when collapsing, and restores them from saved storage when expanding. Change is in `search.js`.

2. **Version strings aligned** — all four files brought to the new sub-1.0 numbering scheme: `manifest.json` → `0.6.1`, `core.js` / `search.js` / `styles.css` → `0.6.1.3`. Done as direct editor changes by Melissa.

3. **`docs/` folder created in GitHub** — all ten project documents moved into `C:\Users\tibba\GitHub\actually-useful\docs\`. GitHub is now the single source of truth for project documents.

4. **Process reminder** — confirmed the rule: confirm scope before coding, not mid-diagnosis.

---

## ⚠️ Start of next session

1. Melissa uploads `search.js`, `core.js`, `manifest.json` fresh from GitHub as actual file uploads (not document blocks)
2. Claude confirms version strings match `0.6.1` (manifest) / `0.6.1.3` (core.js, search.js) before any edits
3. Claude confirms scope of session before touching any files
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

### 🔜 Next up (short term) — in order
1. Fix minimum rating filter — add `parseRating()` and set `r.rating` in `scrapeCard()` ⚠️ red flag
2. Disable `product.js` in manifest — comment out second `content_scripts` entry ⚠️ red flag
3. Remove `AU_AFFILIATE_TAG` and `auTagUrl` from `core.js` ⚠️ must happen before public release
4. Show Selected / Clear Selection rework — wording, behavior, location (shortlist bar)
5. Frequently Returned badge — make it red (bold done, red still needed)
6. Page-fetch throttling (500ms delay between fetches)
7. Move `auSendLog` to background.js
8. Telemetry opt-out toggle

### 🔭 Further out (post-alpha)
- GitHub Pages setup (actuallyuseful.net)
- Supabase setup (shareable links)
- Marketing/landing page built and published
- Comparison page with sort/filter + shareable links
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
- Version: manifest uses three-part `0.6.1`; AU_VERSION in core.js is `0.6.1.3`
- Always provide a suggested GitHub commit message at end of session
- Bundle small changes together rather than shipping each one separately
- Always include Project_Briefing.md in end-of-session documents — do not skip it
- Project documents now live in `docs/` folder in GitHub — update them there after each session

---

## Suggested next commit message
`v0.6.1.3 — fix rating filter, disable product.js, remove affiliate tag, rework Show Selected`
*(update this at end of next session based on what actually landed)*

## End-of-session checklist
- [x] Handover.md — written
- [x] Changelog.md — updated
- [x] Roadmap.md — updated
- [x] Project_Briefing.md — updated
- [ ] Melissa downloads all four documents and puts them in `docs/` in GitHub
- [ ] Melissa commits and pushes via GitHub Desktop
- [ ] Melissa updates project files in Claude Project (upload new versions)
