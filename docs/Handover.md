# Session Handover — April 19, 2026 (Chat 14)

## What we did this session

1. **Ko-fi link fixed (search.js)** — nudge was pointing to `ko-fi.com/tibbalsgribbin`; corrected to `ko-fi.com/butactuallyuseful`. Footer link was already correct.

2. **Page-fetch throttling (search.js)** — added 750ms delay between sequential page fetches in the pages slider `loadNext` loop. Reduces bot-detection risk. Single-page load-more button unaffected.

3. **`auSendLog` moved to background.js (core.js, background.js, search.js)** — `AU_LOG_URL` and `auSendLog()` removed from `core.js`. `sendLog()` in `search.js` now assembles the payload and relays via `chrome.runtime.sendMessage({ type: 'AU_LOG', payload })`. `background.js` fires the fetch from the service worker, bypassing Amazon's CSP.

4. **Telemetry opt-out toggle (popup.html, popup.js, background.js, manifest.json)** — new `popup.html` and `popup.js` created. Extension icon is now clickable. Popup contains: telemetry toggle (default on), Give feedback link, Buy me a coffee link, version number. Toggle persists to `chrome.storage.local` under `au_telemetry_enabled`. `AU_LOG` handler in background.js checks preference before firing fetch. Manifest updated with `"action": { "default_popup": "popup.html" }`.

5. **FR badge deferred indefinitely** — confirmed badge only appears in product page panel (disabled). Removed from next-up list.

6. **Known manifest warning noted** — `_content_scripts_product_disabled` key causes a cosmetic "Unrecognized manifest key" warning in Edge. Pre-existing from Chat 13, harmless, extension loads correctly. Fix before Web Store submission by deleting the block entirely.

---

## ⚠️ Start of next session

1. Melissa uploads fresh files from GitHub as actual file uploads
2. Claude confirms version strings: `0.6.1` (manifest) / `0.6.1.5` (core.js, search.js)
3. Confirm scope before touching any files
4. Ask Melissa if she has fresh testing observations

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
- Collapse/minimize bug fixed (Chat 12)
- Version strings aligned to sub-1.0 numbering (Chat 12)
- docs/ folder created in GitHub (Chat 12)
- Minimum rating filter fixed — parseRating() + r.rating (Chat 13)
- product.js disabled in manifest (Chat 13)
- Affiliate tag machinery removed from core.js (Chat 13)
- Show Selected / Clear Selection reworked — moved to shortlist bar (Chat 13)
- Ko-fi link fixed in nudge (Chat 14)
- Page-fetch throttling — 750ms between sequential fetches (Chat 14)
- auSendLog moved to background.js (Chat 14)
- Telemetry opt-out toggle + popup (Chat 14)

### 🔜 Next up (short term) — in order
1. Verify logging still reaches Google Sheet (do a search, check Sheet for new row)
2. Fix manifest warning — delete `_content_scripts_product_disabled` block entirely (can just comment out instead, or delete; either way cleaner than renamed key)
3. *(No other short-term items — roadmap items below are all pre-alpha or post-alpha)*

### 🔭 Further out (pre-alpha)
- GitHub Pages setup (actuallyuseful.net)
- Supabase setup (shareable links)
- Marketing/landing page built and published
- Comparison page with sort/filter + shareable links
- Feedback form verified (three required questions)
- Test extension on a different setup (Mac, or Chrome vs Edge)
- Decide: Chrome Web Store submission before or after alpha?

### 🔭 Further out (post-alpha)
- Comparison page "Open in new tabs" becomes "Compare on website"
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
- `_content_scripts_product_disabled` manifest warning is cosmetic/pre-existing — fix before Web Store submission by deleting the block

---

## Suggested commit message
`v0.6.1.5 — fix Ko-fi link, add fetch throttling, move logging to background, add popup + telemetry toggle`

## End-of-session checklist
- [x] Handover.md — written
- [x] Changelog.md — updated
- [x] Roadmap.md — updated
- [x] Project_Briefing.md — updated
- [ ] Melissa downloads all six output files and places them in the extension folder
- [ ] Melissa reloads extension in Edge and tests popup + search panel
- [ ] Melissa commits and pushes via GitHub Desktop
- [ ] Melissa downloads all four docs and puts them in `docs/` in GitHub
- [ ] Melissa updates project files in Claude Project (upload new versions)
