# Handover — May 4, 2026 (Chat 46)

## Session type
Logging audit and recovery session. No new user-facing features. Extension restored to working state; logging pipeline fully repaired and expanded.

## Current versions
- manifest: 0.6.1
- search.js: v0.6.1.46
- core.js: v0.6.1.46
- compare.html: v0.6.1.30
- background.js: v0.6.1.16
- styles.css: blue palette (unchanged)
- index.html: unchanged
- killswitch.json: disabled:false

---

## What this session covered

### Recovery
- Files uploaded at session start were from extension-old — caught before any edits were made
- Gemini's manifest.json rewrite was still on disk; search.js was missing from extension/content/
- Restored search.js from extension-old, corrected manifest.json, committed to main

### Logging audit
- Audited search.js payload vs Apps Script vs sheet headers
- Added 10 new fields to doLog(): snapCount, fsaHsaCount, snapFilterActive, fsaHsaFilterActive, climatePledgeFilterActive, smallBusinessFilterActive, priceFilterActive, priceFilterMin, priceFilterMax, sourceFilterActive, countPartner
- Updated Apps Script to Version 2 with all new fields
- Updated Google Sheet header row — now 46 columns
- Fixed critical bug: Apps Script sheet ID was wrong (pointing to different spreadsheet). Correct ID: 1EmTXKDTISyLG4T1k6TiDqeXYisffobTClStK8y47MXU
- Verified end-to-end: v0.6.1.46 rows logging correctly with all new fields ✅
- Bumped AU_VERSION in core.js to 0.6.1.46

### Protocol updates
- butactuallyuseful Chrome profile is now the working profile for all AU Google tasks
- End-of-session documents: Claude produces complete files for download, not snippets

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
13. compare.html logging — not yet implemented

---

## Next session priorities (in order)
1. **China/origin filter research** — research how existing extensions handle country-of-origin and low-quality seller filtering; design AU's approach. Research only — do not build anything until approach is designed.
2. **compare.html logging** — direct fetch to Google Sheets endpoint; planned this session, deferred
3. **Welcome page on install** — chrome.runtime.onInstalled opens onboarding tab
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

---

## Start of next session
1. Ask if any new Reddit responses, feedback form submissions, or installs since Chat 46
2. Confirm Melissa has uploaded current files from GitHub before touching anything
3. Begin China/origin filter research
