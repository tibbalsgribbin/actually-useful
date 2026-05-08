# Handover — May 8, 2026 (Chat 57)

## Session type
Coding session. Bug fixes to search.js and compare.html. No new features added to manifest or core.js.

## Current versions
- manifest: v0.6.1 (unchanged)
- search.js: v0.6.1.64
- core.js: v0.6.1.53 (unchanged)
- compare.html: updated Chat 57
- background.js: v0.6.1.16 (unchanged)
- styles.css: unchanged
- index.html: unchanged
- killswitch.json: disabled:false

---

## What this session covered

### scrapeBrand() Strategy 2 fix
Added `bought` and `sold` to the Strategy 2 exclusion regex. Electronics cards show "6K+ bought in past month" in the s2 slot — this was passing the filter and being returned as the brand. Fix confirmed via console testing on keyboards and headphones searches. Apparel (summer dresses) confirmed unaffected.

### Delivery scraper fix
Amazon often puts free and fastest delivery in a single div with two bold elements. The scraper was only reading the first bold element, so fastDate always got the free delivery date. Fix: detect the combined case and read boldEls[0] for freeDate, boldEls[1] for fastDate. Tested on keyboards — Fastest delivery now correctly shows May 9 (tomorrow) instead of May 13.

### compare.html delivery column split
Single "Delivery" column replaced with two: "Free delivery" and "Fastest delivery". Each independently sortable on its own timestamp. No more combined FREE:/Fastest: display. Hide slow shipping now uses Math.min(freeDateTs, fastDateTs).

### Banner dismiss improvements
- High-noise banner: X dismiss added, positioned upper right
- PPU interpretation banner: existing X moved to upper right (was floating in line with text)
Both tested and confirmed working.

### Re-sync prompt
After Re-sync fires with >1 page previously loaded, a bar appears below the pages/Re-sync row: "You had X pages loaded — reload all?" with Yes/No. Yes triggers sequential page reloading. Uses polling (100ms intervals, up to 20 attempts) to wait for buildPanel() DOM to be ready before inserting. Tested and confirmed working.

---

## Files produced this session
- search.js v0.6.1.64 — upload to GitHub extension/content/
- compare.html — upload to GitHub repo root
- Project_Briefing.md — upload to Claude Project to replace current version
- Roadmap.md — upload to Claude Project to replace current version
- changelog_entry_chat57.md — upload to Claude Project

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
16. Filter layout jank — checkboxes and Hide slow shipping row positioning needs cleanup; deferred to UI improvements session

---

## Next session priorities (in order)

1. **UI improvements** — filter layout jank (checkboxes own line, Hide slow shipping positioning); other panel/compare.html polish Melissa identifies at session start
2. **Welcome page on install** — chrome.runtime.onInstalled
3. **Fix extractCount "1 Pack (250 Sheets)"**
4. **compare.html logging** — deferred; revisit when website has more surfaces

---

## Key reminders
- Code files NOT in Claude Project — upload fresh from GitHub each coding session
- Files must be actual uploads, not document blocks
- compare.html JS uses string concatenation, not template literals
- core.js uses callback pattern, not Promises
- Affiliate tags on website only — never in extension; every outbound Amazon link from the website carries the tag
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
3. If search.js work: upload search.js v0.6.1.64 fresh from GitHub
4. If compare.html work: upload compare.html fresh from GitHub
5. Confirm scope before touching any files
