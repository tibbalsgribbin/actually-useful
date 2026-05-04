# Handover — May 4, 2026 (Chat 48)

## Session type
Coding session. Brand filter Session 1 — scraping + detection scaffolding. No UI. Two code versions shipped (v0.6.1.47 → v0.6.1.48). One new data file created (brand_blocklist.txt).

## Current versions
- manifest: 0.6.1
- search.js: v0.6.1.48
- core.js: v0.6.1.46 (unchanged)
- compare.html: v0.6.1.30 (unchanged)
- background.js: v0.6.1.16 (unchanged)
- styles.css: blue palette (unchanged)
- index.html: unchanged
- killswitch.json: disabled:false

---

## What this session covered

### Brand filter Session 1 — complete

Implemented brand scraping and heuristic detection in search.js. No UI — console logging only.

**scrapeBrand(el):** 3-selector fallback chain. Tries explicit "by Brand" line → .a-color-secondary byline (extracts "Visit the X Store" pattern) → first word of title. Returns null if nothing found. Items with null brand exempt from filter.

**detectGibberishBrand(brand):** 5 signals:
1. signalNoVowel — vowel ratio < 0.25, length ≥ 5
2. signalConsonantCluster — rare cluster OR 4+ consecutive consonants
3. signalShortAllCaps — 5–8 chars, all caps, ≤1 vowel
4. signalFakeMashup — no spaces, 5+ chars, 2+ common word fragments. **Flags alone.**
5. signalAllCapsInvented — all caps, no spaces, 5+ letters, not on passlist. **Flags alone.**

Flagging rule: signalFakeMashup or signalAllCapsInvented fires alone → flagged. Everything else: score ≥ 2.

`brand` and `brandFlagged` added to scraped item object and compare payload.

Console output: `[AU brand] "OUGES" → signals: [signalAllCapsInvented] score:1 flagged:true`

### Design update: bundled blocklist added

Real-world testing on "floral summer dress" showed entire search pages of dropship junk, many brands scoring 0. Heuristics alone insufficient. Bundled blocklist added to architecture as third detection layer (blocklist check before heuristics — always flags). Parallels the allowlist.

brand_blocklist.txt created with 70 starter brands. Placed in extension/data/. Wire-up deferred to Session 3 alongside allowlist loading.

### Key tuning decisions made this session
- signalAllCapsInvented upper limit raised to 5+ chars with no cap (not 5–8 as originally designed)
- signalFakeMashup word list significantly expanded to catch RoseSeek, Newshows, Soulomelody
- Both signals lowered to threshold 1 (flag alone)
- 50% catch rate from design doc rejected by Melissa — not an agreed standard

### Brands confirmed junk (in blocklist)
PRETTYGARDEN, BTFBM, OUGES, ZESICA, GORGLITTER, GLNEGE, KUTUMAI, WIHOLL, STYLEWORD, HTZMO, AGYMNX, MSVLDR, YBSKG, and 57 more — see brand_blocklist.txt.

### Brands confirmed NOT junk (passing correctly)
Amazon Essentials, GRACE KARIN, CUPSHE, CIDER, Scarlet Darkness, Belle Poque, SOLY HUX, DB MOON, Simplee, BIVENANT, MEROKEETY.

### Accepted gaps
Mixed-case invented names (Floerns, Verdusa, Wenrine, Annebouti, Fisoew) score 0 — heuristics can't catch everything. Bundled blocklist covers known repeat offenders. Ongoing gap.

---

## Files produced this session
- search.js v0.6.1.48 — download and place at extension/content/search.js
- brand_blocklist.txt — download and place at extension/data/brand_blocklist.txt
- Brand_Filter_Design.md — updated design doc, upload to Claude Project

---

## Known issues (carried forward)
1. Multi-pack weight PPU wrong — needs design session
2. Contact lens solution liquid PPU unreliable
3. Cotton swabs extractCount grabbing pack count
4. Razor blade $0.1/ct outlier
5. Cardstock "1 Pack (250 Sheets)" extractCount ordering
6. Pairs ambiguity — interim note only
7. FSA/HSA, Climate Pledge, Small Business — not yet verified on live searches
8. Auto-resort on Re-sync page-add — not verified
9. Blue/indigo palette inconsistency — post-alpha
10. No selector resilience — brand scraping uses fallback but broader codebase still fragile
11. No self-test mode
12. No welcome page on install
13. compare.html logging — not yet implemented

---

## Next session priorities (in order)

1. **Brand filter Session 2** — brand filter UI + hide/demote toggle. Files: search.js, styles.css. See Brand_Filter_Design.md Session 2 scope.
2. **compare.html logging** — direct fetch to Google Sheets endpoint. Deferred from Chat 46.
3. **Welcome page on install** — chrome.runtime.onInstalled.
4. **Fix extractCount "1 Pack (250 Sheets)"**
5. **Verify auto-resort on Re-sync**

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
- For brand filter work: read Brand_Filter_Design.md first
- brand_blocklist.txt lives at extension/data/ — wire-up in Session 3
- Console logging in detectGibberishBrand is intentional — remove when UI ships in Session 2

---

## Start of next session
1. Confirm whether next session is Brand Filter Session 2 or something else (Melissa's pick)
2. Read Brand_Filter_Design.md Session 2 scope
3. Confirm Melissa has uploaded current code files from GitHub (search.js v0.6.1.48, styles.css)
4. Begin work
