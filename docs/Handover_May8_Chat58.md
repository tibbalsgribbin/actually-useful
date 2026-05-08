# Handover — May 8, 2026 (Chat 58)

## Session type
Coding session. UI polish to search.js and styles.css. No changes to manifest, core.js, compare.html, or background.js.

## Current versions
- manifest: v0.6.1 (unchanged)
- search.js: v0.6.1.65
- core.js: v0.6.1.53 (unchanged)
- compare.html: updated Chat 57 (unchanged)
- background.js: v0.6.1.16 (unchanged)
- styles.css: updated Chat 58
- index.html: unchanged
- killswitch.json: disabled:false

---

## What this session covered

### Notable non-code event
First Ko-fi tip received, accompanied by a message offering to help refine the extension for organic superfood powders. Melissa replied warmly and opened the door to feedback. This is the first real user contact beyond Reddit.

### Filter layout jank fix (styles.css)
The three checkbox filter rows (Amazon brands, unrecognized brands, Hide slow shipping) were separate divs with inconsistent padding. Now unified: all three share `flex-direction:column`, consistent `14px` horizontal padding, tidy vertical spacing. Delivery slider wrap inherits column layout from parent rather than re-declaring it.

### Keyword input background (styles.css)
Changed from `#f9f9fc` (grey) to `#ffffff` (white). The grey background made the field look disabled.

### Sort and Filters — remember collapsed state (search.js)
`sortOpen` and `filtersOpen` now persisted in `localStorage` (`au-sort-open`, `au-filters-open`). Default `true` (expanded) when key absent — first-time users see everything. State saves on every toggle click.

Collapsed divider labels:
- Sort collapsed: "Click to sort and load more pages"
- Sort expanded: "Sort"
- Filters collapsed: "Click to filter by price, delivery, brand, and more"
- Filters expanded: "Filters"

### Sort chip visibility (search.js)
"Best value ↑" chip now hidden when Sort section is expanded, shown when collapsed. Updates live on toggle.

---

## Files produced this session
- search.js v0.6.1.65 — upload to GitHub extension/content/
- styles.css — upload to GitHub extension/content/
- Project_Briefing.md — upload to Claude Project to replace current version
- Roadmap.md — upload to Claude Project to replace current version
- changelog_entry_chat58.md — upload to Claude Project

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
11. No welcome page on install
12. compare.html logging — deferred (storage boundary; revisit when website has more surfaces)
13. Brand filter mixed-case invented names — accepted gap
14. Duplicate "Pages slider" comment in search.js — cosmetic only
15. Outlier PPU units (lb, ft) sorting to top as best value — needs design session

---

## Next session priorities (in order)

1. **Welcome page on install** — chrome.runtime.onInstalled opens onboarding tab
2. **Fix extractCount "1 Pack (250 Sheets)"** — pack/count ordering fix
3. **compare.html logging** — deferred; revisit when website has more surfaces

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

---

## Start of next session
1. Read this handover
2. Ask if anything has come up since last session (testing observations, changed priorities)
3. If search.js work: upload search.js v0.6.1.65 fresh from GitHub
4. If styles.css work: upload styles.css fresh from GitHub
5. Confirm scope before touching any files
