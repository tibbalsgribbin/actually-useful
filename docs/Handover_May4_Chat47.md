# Handover — May 4, 2026 (Chat 47)

## Session type
Design-only session. No code changes. Researched and designed the brand filter + delivery window filter feature suite. Output is Brand_Filter_Design.md.

## Current versions (unchanged from Chat 46)
- manifest: 0.6.1
- search.js: v0.6.1.46
- core.js: v0.6.1.46
- compare.html: v0.6.1.30
- background.js: v0.6.1.16
- styles.css: blue palette
- index.html: unchanged
- killswitch.json: disabled:false

---

## What this session covered

### Research
- Surveyed existing extensions: Cultivate (origin detection — unreliable), AmazonBrandFilter / chris-mosley (allowlist-based), Amazon Brand Detector / The Markup (highlight-only, Amazon house brands), several blocklist tools.
- Confirmed: country-of-origin detection from search cards is not reliable. Brand-string detection plus heuristics is.
- Confirmed: Amazon TOS rule about "manipulating Search and Browse" applies to *sellers*, not buyer-side extensions. Demoting Amazon's own brands is not a TOS risk.

### Design decisions made
- Heuristic primary, allowlist as false-positive escape hatch
- Personal blocklist via right-click `[•••]` menu, stored in chrome.storage.local
- Optional Amazon-brands demote toggle, off by default, demote-only (never hide)
- Delivery filter uses earlier of free/paid delivery date (fastest possible)
- Two per-filter hide/demote toggles (one global toggle was rejected)
- Defaults: brand → demote (judgment call), delivery → hide (clear-cut)
- "Show our work" expand-to-view footer for both filters
- "Below the line" divider when demote mode is active
- Telemetry-driven allowlist curation: top 10 filtered brands + signal counts per session
- ~16 new logging fields total (sheet from 46 to ~62 columns)

### Build plan (5 sessions)
1. Brand text scraping + heuristic detector (no UI yet)
2. Brand filter UI + hide/demote toggle + results summary
3. Allowlist + personal blocklist
4. Delivery window filter
5. Amazon-brands demote toggle + polish

Optional Session 6: compare.html integration.

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
10. **No selector resilience — relevant to brand filter Session 1.** Brand-text scraping must use multi-strategy fallback from day one.
11. No self-test mode
12. No welcome page on install
13. compare.html logging — not yet implemented

---

## Next session priorities (in order)

1. **Brand filter — Session 1: scraping + detection scaffolding.** Implement brand text scraping (multi-strategy selector fallback), add `brand` field to scraped item object and compare payload, implement heuristic detector (4 signals, sum-and-threshold). No UI. Console logging for verification. Test against bug-test categories.
2. **compare.html logging** — direct fetch to Google Sheets endpoint. Deferred from Chat 46.
3. **Welcome page on install** — chrome.runtime.onInstalled.
4. **Fix extractCount "1 Pack (250 Sheets)"**
5. **Verify auto-resort on Re-sync**

After Session 1 of brand filter is solid, sessions 2–5 follow the order in Brand_Filter_Design.md.

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
- **For brand filter work: read Brand_Filter_Design.md first.**

---

## Start of next session
1. Confirm whether next session is Brand Filter Session 1, or something else (Melissa's pick)
2. If brand filter: confirm Brand_Filter_Design.md is uploaded to project, read it
3. Confirm Melissa has uploaded current code files from GitHub before touching anything
4. Begin work
