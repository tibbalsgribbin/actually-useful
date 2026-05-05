# Handover — May 4, 2026 (Chat 50)

## Session type
Coding session. Brand filter Session 3 — bundled blocklist wire-up, personal blocklist, [•••] per-card menu, management view. One code version shipped (v0.6.1.50). No new data files.

## Current versions
- manifest: 0.6.1 (updated — web_accessible_resources added)
- search.js: v0.6.1.50
- core.js: v0.6.1.46 (unchanged)
- compare.html: v0.6.1.30 (unchanged)
- background.js: v0.6.1.16 (unchanged)
- styles.css: unchanged
- index.html: unchanged
- killswitch.json: disabled:false

---

## What this session covered

### Design decisions made before coding
- Allowlist deferred — skip for now, add after telemetry shows false positives
- [•••] menu placement: inline next to brand name
- High-noise banner updated to: "A lot of noise in these results. Try Amazon's brand filters on the far left before loading more pages. Hiding sponsored listings (above) also helps in categories like this."
- Rationale for banner addition: high-noise categories have heavy sponsored/junk overlap; Amazon's Premium Brands filter works well; nudge belongs in the banner where it's contextual

### Brand filter Session 3 — complete

**Bundled blocklist (brand_blocklist.txt):**
- Loaded at startup via `loadBundledBlocklist()` using `chrome.runtime.getURL()`
- Parses lines, strips comments (#), uppercases, stores to `bundledBlocklist[]`
- `manifest.json` updated with `web_accessible_resources` for `data/brand_blocklist.txt`
- Check runs first in `detectGibberishBrand` — always flags, no heuristic scoring

**Personal blocklist:**
- Loaded at startup via `loadPersonalBlocklist()` from `chrome.storage.local` (`auBlocklistBrands`)
- Stored as `personalBlocklist[]` module-level var
- Check runs after bundled blocklist check in `detectGibberishBrand` — always flags

**[•••] per-card menu:**
- Appears inline next to brand name on every card with a detected brand (brand !== null)
- Brand name displayed in small gray text below title/srcTag
- Click on ··· opens dropdown: "Hide all [Brand] forever"
- Click on that button: adds brand to personalBlocklist[], persists to chrome.storage.local, re-flags all matching items, re-renders
- Dropdowns close on outside click

**Management view ("My blocklist"):**
- "My blocklist (N brands)" link in panel footer — count updates dynamically
- Click opens overlay panel anchored to footer area
- Lists all blocked brands with Remove buttons
- Remove: removes from personalBlocklist[], re-detects affected items (may un-flag if heuristics also don't catch them), persists to storage, re-renders

**Logging:**
- 2 new fields added to doLog(): personalBlocklistSize, personalBlocklistHits
- Sheet goes from 56 to 58 columns — Apps Script header row update still pending

**High-noise banner:**
- Text updated to Melissa's wording (with Amazon brand filter + sponsored nudge)

**Startup sequence:**
- Both blocklists load before tryBuild fires — loadBundledBlocklist → loadPersonalBlocklist → setTimeout(tryBuild, 1500)

---

## Files produced this session
- search.js v0.6.1.50 — place at extension/content/search.js
- manifest.json — place at extension/manifest.json
- brand_blocklist.txt unchanged — stays at extension/data/brand_blocklist.txt

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
10. No selector resilience — broader codebase still fragile
11. No self-test mode
12. No welcome page on install
13. compare.html logging — not yet implemented
14. Brand filter mixed-case invented names — accepted gap
15. Apps Script header row not yet updated (now 58 columns, was 56) — do before next log analysis
16. Brand filter allowlist — deferred; add after telemetry shows false positives

---

## Next session priorities (in order)

1. **Brand filter Session 4** — delivery window filter. Files: search.js, styles.css. See Brand_Filter_Design.md Session 4 scope.
2. **compare.html logging** — direct fetch to Google Sheets endpoint; deferred from Chat 46
3. **Welcome page on install** — chrome.runtime.onInstalled
4. **Fix extractCount "1 Pack (250 Sheets)"**
5. **Verify auto-resort fires on Re-sync page-add**

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
- Apps Script header row needs updating to 58 columns
- Allowlist deferred — add after telemetry review post-alpha

---

## Start of next session
1. Confirm whether next session is Brand Filter Session 4 or something else (Melissa's pick)
2. Read Brand_Filter_Design.md Session 4 scope
3. Confirm Melissa has uploaded current code files from GitHub (search.js v0.6.1.50, styles.css, manifest.json)
4. Begin work
