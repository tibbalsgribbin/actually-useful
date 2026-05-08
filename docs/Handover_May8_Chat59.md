# Handover — May 8, 2026 (Chat 59)

## Session type
Coding session. welcome.html created; background.js, search.js, styles.css updated. No changes to manifest, core.js, or compare.html.

## Current versions
- manifest: v0.6.1 (unchanged)
- search.js: v0.6.1.66
- core.js: v0.6.1.53 (unchanged)
- compare.html: updated Chat 57 (unchanged)
- background.js: v0.6.1.17
- styles.css: updated Chat 59
- welcome.html: created Chat 59
- index.html: unchanged
- killswitch.json: disabled:false

---

## What this session covered

### welcome.html — new onboarding page
New page at actuallyuseful.net/welcome. Opens automatically on fresh extension install via background.js onInstalled listener. Matches index.html palette and structure (Playfair Display / DM Sans, indigo palette). Contains:
- Panel anatomy section with embedded screenshot + callout list (Sort, Move ads, Pages/Re-sync, Filters, Brands, Delivery, Result cards, Compare bar, Brand rules, Footer)
- The workflow — 5 steps (Amazon filters → load pages → sort/filter → shortlist → compare)
- Features in depth — 8 feature cards
- Video placeholder (demo video not yet recorded)
- Compare page section (dark indigo background, prominent)
- Footer CTA with feedback form and email links

Panel screenshot is embedded as base64 (JPEG, ~108KB). Session ended before taking a better screenshot with laundry pods search — next session starts with a new screenshot for the welcome page.

### background.js v0.6.1.17
Added chrome.runtime.onInstalled listener. Fires only on fresh install (details.reason === 'install'), opens https://actuallyuseful.net/welcome in a new tab.

### styles.css changes
- Sponsored button "Hidden · Show ads" — was salmon/coral, now indigo (#4f46e5) to match other active states
- Active filters dec-bar — hidden entirely (display:none)
- Footer text — smaller (11→10px sort-note, 12→10.5px info) and tighter line spacing
- Keyword highlight — yellow background (#fff176) instead of white
- Compare subtext (#ppu-compare-sub) — added CSS rules for default muted color and white when bar is active

### search.js v0.6.1.66
- Note click fix — innerHTML render path created .ppu-note-add-link and .ppu-note-edit-link spans without event listeners. Fixed by adding querySelectorAll wiring after each render, matching brand button pattern.
- Pages slider fill gap — updatePagesSliderFill had max hardcoded as 10 instead of 7. At value 7 it only filled to 67%.
- Keyword smart quote fix — parseKeywords now strips curly/smart quotes and straight quotes before parsing, so "fragrance-free" matches fragrance-free correctly.
- Compare subtext inline color — removed hardcoded color:#9ca3af from inline style on #ppu-compare-sub so CSS rules can control it.

---

## Files produced this session
- welcome.html — upload to GitHub repo root
- background.js v0.6.1.17 — upload to GitHub extension/
- search.js v0.6.1.66 — upload to GitHub extension/content/
- styles.css — upload to GitHub extension/content/
- Project_Briefing.md — upload to Claude Project
- Roadmap.md — upload to Claude Project
- changelog_entry_chat59.md — upload to Claude Project

---

## Known issues (carried forward)
1. Multi-pack weight PPU wrong — needs design session
2. Contact lens solution liquid PPU unreliable
3. Cotton swabs extractCount grabbing pack count
4. Razor blade $0.1/ct outlier
5. Cardstock "1 Pack (250 Sheets)" extractCount ordering
6. Pairs ambiguity — interim note only
7. FSA/HSA, Climate Pledge, Small Business — not yet verified on live searches
8. Blue/indigo palette inconsistency — post-alpha
9. No selector resilience — broader codebase still fragile
10. No self-test mode
11. compare.html logging — deferred (storage boundary)
12. Brand filter mixed-case invented names — accepted gap
13. Duplicate "Pages slider" comment in search.js — cosmetic only
14. Outlier PPU units (lb, ft) sorting to top as best value — needs design session
15. welcome.html screenshot — current screenshot is charmin/old search; needs replacement with laundry pods screenshot with keyword filter active

---

## Next session priorities (in order)

1. **New screenshot for welcome.html** — laundry pods search, keyword filter showing multiple terms, take screenshot, rebuild welcome.html with annotated callout design (red ovals, lines left and right of image, minimize button called out)
2. **Fix extractCount "1 Pack (250 Sheets)"** — pack/count ordering fix
3. **compare.html logging** — deferred until website has more surfaces

---

## Key reminders
- Code files NOT in Claude Project — upload fresh from GitHub each coding session
- Files must be actual uploads, not document blocks
- compare.html JS uses string concatenation, not template literals
- core.js uses callback pattern, not Promises
- Affiliate tags on website only — never in extension
- search.js sends raw numbers to compare.html — compare.html handles formatting
- note = user note; ppuNote = AU inference note — never conflated
- All Google tasks: butactuallyuseful Chrome profile
- Confirm scope before touching any files
- Use AskUserQuestion widget
- All extension text must be selectable
- Rollback rule: 3 failed attempts = stop, revert
- Always provide commit message with GitHub push
- Don't touch weight unit logic without design session
- One agent at a time — Claude only
- Produce complete document files at end of session — not snippets
- brand_blocklist.txt and amazon_brands.txt must be updated concurrently in extension/data/ AND repo root data/
- Always give Melissa a commit message at end of session
- No filler phrases like "I'm waiting" — wastes context

---

## Start of next session
1. Read this handover
2. Ask if anything has come up since last session
3. Upload files fresh from GitHub as needed
4. Confirm scope before touching any files
