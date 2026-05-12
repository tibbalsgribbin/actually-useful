# Handover — May 11, 2026 (Chat 61)

## Session type
Coding session. search.js and compare.html updated. No changes to manifest, core.js, background.js, styles.css, welcome.html, or index.html.

## Current versions
- manifest: v0.6.1 (unchanged)
- search.js: v0.6.1.72
- core.js: v0.6.1.53 (unchanged)
- compare.html: updated Chat 61
- background.js: v0.6.1.17 (unchanged)
- styles.css: updated Chat 60 (unchanged)
- welcome.html: created Chat 59 (unchanged)
- index.html: unchanged
- killswitch.json: disabled:false

---

## What this session covered

### Keyword filter hint — hide by default, show on first use, dismiss button
Hint block hidden on load. Appears on first keypress, stays visible for session. × dismiss button (upper right) hides it permanently and resets the localStorage flag (`au-kw-hint-seen`) so it reappears on next first use.

### extractCount — pack patterns moved to end
Pack/pk/pack-of/box-of patterns moved to end of `pats` array. "1 Pack (250 Sheets)" now returns 250 instead of 1.

### scrapeBrand — whitespace normalization
`cleanBrand()` helper collapses internal whitespace on all return values. Fixes "Premiu m" artifacts.

### parseTitleWeightQty — paper-weight lb guard (INCOMPLETE — needs design session)
lb matches followed by paper-weight qualifier words (cover, bond, text, index, weight, cardstock, gsm, basis) are discarded. Intended to fix cardstock showing $/lb PPU. Testing showed it is insufficient — cardstock items still show $/lb via a different code path. The guard is harmless but doesn't solve the problem.

### compare.html — boolean keyword parser port
`includeMatchesItem` replaced with full boolean parser ported from search.js. Include filter now supports AND, OR, quoted phrases, wildcards, exclusions. Hint text and placeholder updated.

### compare.html — keyword highlight in title column
`highlightTitle()` function highlights matching Include filter terms in yellow in the title column. Works for words, phrases, and wildcards.

---

## Files produced this session
- search.js v0.6.1.72 — upload to GitHub extension/content/
- compare.html — upload to GitHub repo root
- Project_Briefing.md — upload to Claude Project
- Roadmap.md — upload to Claude Project
- changelog_entry_chat61.md — upload to Claude Project
- Handover_May11_Chat61.md — upload to Claude Project

---

## Known issues (carried forward + new)

1. Multi-pack weight PPU wrong — needs design session
2. Contact lens solution liquid PPU unreliable
3. Cotton swabs extractCount grabbing pack count
4. Razor blade $0.1/ct outlier
5. Pairs ambiguity — interim note only
6. FSA/HSA, Climate Pledge, Small Business — not yet verified on live searches
7. Blue/indigo palette inconsistency — post-alpha
8. No selector resilience — broader codebase still fragile
9. No self-test mode
10. compare.html logging — deferred (storage boundary)
11. Brand filter mixed-case invented names — accepted gap
12. Duplicate "Pages slider" comment in search.js — cosmetic only
13. Outlier PPU units (lb, ft) sorting to top as best value — needs design session
14. welcome.html screenshot — needs replacement with laundry pods screenshot, annotated callout design
15. **Cardstock $/lb PPU — parseTitleWeightQty guard insufficient.** Cardstock items with paper-weight specs ("65 lb Cover Weight", "110 lb Index Weight") still showing $/lb PPU. Needs a design session. Root cause: weight is being picked up via a different path than parseTitleWeightQty. "cardstock" may need to be added to SOLID_KEYWORDS, and/or the weight-from-title fallback path needs a paper-weight exclusion. Do not attempt a quick fix — this touches weight unit logic.
16. **Prime scraping — Amazon may have changed the selector.** Two searches in this session showed no Prime badges detected. Amazon has changed the left-column filter from "Prime" to "Free Shipping by Amazon." Prime badge scraping may be affected. Needs investigation — deferred.
17. **scrapeBrand Strategy 3 (first-word fallback) produces wrong results** — "Premium" not a brand name; "Astrobrights" is. Strategy 3 is unreliable and should be removed or gated more tightly. Needs design session.
18. **Amazon Basics brand column shows — on compare.html** — Amazon brand items may not be showing in brand column as expected. Needs investigation.

---

## Next session priorities (in order)

1. **Cardstock PPU design session** — add "cardstock" to SOLID_KEYWORDS? Remove paper-weight lb from weight-from-title path? Don't touch without a design session first.
2. **scrapeBrand Strategy 3 design** — remove or tighten the first-word fallback; bring Melissa's scraper data to inform better brand detection
3. **Prime scraping investigation** — check selectors against current Amazon HTML
4. **welcome.html screenshot** — laundry pods, annotated callout design
5. **CWS push + Reddit posts** — held pending above fixes

---

## CWS / Reddit context
Melissa wants to push an updated CWS version and do another Reddit swing (same subs as before + vibe-coding subs). Held this session pending testing results. The cardstock PPU regression and Prime scraping issue should be resolved first.

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
- **Confirm scope before touching any files — do not code without explicit approval**
- Use AskUserQuestion widget
- All extension text must be selectable
- Rollback rule: 3 failed attempts = stop, revert
- Always provide commit message with GitHub push
- Don't touch weight unit logic without design session
- One agent at a time — Claude only
- Produce complete document files at end of session — not snippets
- brand_blocklist.txt and amazon_brands.txt must be updated concurrently in extension/data/ AND repo root data/
- Always give Melissa a commit message at end of session
- No filler phrases — wastes context
- **Context rot warning: this session ran long. Next session start fresh and keep scope tight.**

---

## Start of next session
1. Read this handover
2. Ask if anything has come up since last session
3. Upload files fresh from GitHub as needed
4. Confirm scope before touching any files
