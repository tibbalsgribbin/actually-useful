# Handover — May 3, 2026 (Chat 45)

## Session type
Recovery and consolidation session. No new features shipped. No code changes beyond restoring the working state from before Gemini's modular refactor.

## Current versions
- manifest: 0.6.1
- search.js: 0.6.1.45 (confirmed by reading the file)
- compare.html: 0.6.1.30
- background.js: 0.6.1.16
- core.js: unchanged
- styles.css: blue palette (redesigned, Chat 45 confirmed active)
- index.html: unchanged (overhauled Chat 42)
- killswitch.json: disabled:false

---

## What this session covered

### Recovery from Gemini modular refactor
Gemini had split search.js into config.js, scraper.js, and ui.js — but all three were stubs with placeholder comments, not functional code. The extension panel was completely non-functional. Rolled back via GitHub Desktop to the last working commit. search.js v0.6.1.45 was intact with all Chat 44 features. manifest.json was corrected. Extension confirmed working.

### What's confirmed in search.js v0.6.1.45
- Kill switch (killswitch.json fetch at load) ✅
- Slider max = 7 ✅
- Badge filters (SNAP, FSA/HSA, Climate Pledge, Small Business) ✅
- Results summary line updates for badge filters ✅
- Sub-penny PPU formatting (3 decimal places when < $0.10) ✅
- Solid product override including toothpaste, fuzzy 1% comparison ✅
- solidUnitIsWrong covers liquid units ✅
- Weight-from-title fallback, weight sanity check ✅
- inferWeightDominant + normalizePPUForSort + unit pills ✅
- parseTitleWeightQty ✅
- normalizeUnit "X per Y" suffix strip ✅
- extractCount "N Adj Tubes/Sticks/Bottles/Jars" patterns ✅
- Sort label display + filter count badge (active indicators) ✅
- All earlier PPU fixes (Fix 1, Fix 2, pairs note, footage) ✅

### Blue palette
Confirmed active in extension panel via styles.css. Website retains indigo. Inconsistency documented as known issue — full unification post-alpha.

### Document consolidation
Three Briefing versions and two Roadmap versions eliminated. Single authoritative set produced. Canonical overall version: v0.6.1.45.

### Protocol additions
- One agent at a time rule formalized in documents
- search.js single-file architecture explicitly documented as intentional

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
10. No selector resilience
11. No self-test mode
12. No welcome page on install

---

## Next session priorities (in order)
1. **Welcome page on install** — chrome.runtime.onInstalled opens onboarding tab; currently silence on install
2. **Fix extractCount "1 Pack (250 Sheets)"** — pack/count ordering fix
3. **Verify auto-resort fires on Re-sync page-add**
4. **Add laundry pods (id=73) and laptop (id=74) sample links to index.html** — weight display much improved; worth checking readiness
5. **Selector resilience refactor** — CSS selectors into named constants object

---

## Key reminders (do not skip)
- Code files are NOT in the Claude Project — Melissa uploads fresh from GitHub each coding session
- Files must be actual file uploads, not document blocks
- compare.html JS must use string concatenation, not template literals
- core.js uses callback pattern, not Promises
- Affiliate tags on website only — never in the extension
- search.js sends raw numbers to compare.html — compare.html handles all formatting
- note = user's note; ppuNote = AU inference note — both in payload, never conflated
- All Google tasks: InPrivate Edge + butactuallyuseful@gmail.com
- Always confirm scope before touching any files
- Use AskUserQuestion widget for clarifying questions
- All text in the extension interface must be selectable — standing rule
- Rollback rule: 3 failed bug-fix attempts = stop, revert to last stable commit
- Always provide a commit message when a GitHub push is needed
- Don't touch weight unit logic without a design session first
- **One agent at a time** — Claude only for code; no Replit/Gemini/Figma touching files

---

## Start of next session
1. Ask if any new Reddit responses, feedback form submissions, or installs since Chat 45
2. Confirm Melissa has uploaded current files from GitHub before touching anything
3. Confirm which priority to start with
