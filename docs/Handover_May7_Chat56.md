# Handover — May 7, 2026 (Chat 56)

## Session type
Strategy and docs session — no code changes. Website strategy framing added to Project Briefing. compare.html logging deferred. Positioning updated.

## Current versions
- manifest: 0.6.1 (unchanged)
- search.js: v0.6.1.62 (unchanged)
- core.js: v0.6.1.53 (unchanged)
- compare.html: updated Chat 55 (unchanged this session)
- background.js: v0.6.1.16 (unchanged)
- styles.css: unchanged
- index.html: unchanged
- killswitch.json: disabled:false

---

## What this session covered

### Website strategy
Added Section 3 (Website Strategy) to Project Briefing. The framing: the extension is the data bridge; the website is where Actually Useful is fully realized. Planned surfaces in rough priority order: compare.html (live), search.html (standalone search, post-alpha), product pages, gift lists/carts/saved-for-later. Affiliate tags on all outbound Amazon links from the website. Extension never carries tags — standing rule, unchanged.

### Positioning update
Section 2 of Briefing updated. "Extension-to-website arc" is now the lead framing. Two-stage story retained as supporting copy.

### search.html
Description updated in Website Architecture: "standalone search results page — AU features without being on Amazon; clean, ad-free alternative to tools like jungle-search.com."

### compare.html logging — deferred
Confirmed that compare.html can't read the user's telemetry opt-out (chrome.storage.local is extension-only; website can't access it). Options discussed: URL parameter, always log, skip it. Decision: skip it for now. Search.js logging captures the most important signal. Revisit when the website has more surfaces. Noted in Briefing Section 10 and Roadmap.

### Affiliate policy
Existing policy clarified in Briefing and Roadmap: every outbound Amazon link from the website carries the Associates tag.

---

## Files produced this session
- Project_Briefing.md — upload to Claude Project to replace current version
- Roadmap.md — upload to Claude Project to replace current version
- changelog_entry_chat56.md — upload to Claude Project

No code files changed. No GitHub push needed.

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
13. compare.html logging — deferred (storage boundary; revisit when website has more surfaces)
14. Brand filter mixed-case invented names — accepted gap
15. Duplicate "Pages slider" comment in search.js — cosmetic only
16. Outlier PPU units (lb, ft) sorting to top as best value — needs design session
17. Brand column blank for electronics — search.js scrapeBrand() fallback grabbing purchase metadata; needs search.js fix

---

## Next session priorities (in order)

1. **search.js scrapeBrand() fix** — first-word fallback grabbing purchase metadata instead of brand name for electronics categories
2. **Welcome page on install** — chrome.runtime.onInstalled
3. **Fix extractCount "1 Pack (250 Sheets)"**
4. **Verify auto-resort fires on Re-sync page-add**
5. **compare.html logging** — deferred; revisit when website has more surfaces

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
3. If search.js work: upload search.js v0.6.1.62 fresh from GitHub
4. Confirm scope before touching any files
