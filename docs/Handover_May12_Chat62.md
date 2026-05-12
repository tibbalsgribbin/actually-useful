# Handover — May 12, 2026 (Chat 62)

## Session type
Coding session. search.js updated. No changes to manifest, core.js, background.js, styles.css, compare.html, welcome.html, or index.html.

## Current versions
- manifest: v0.6.1 (unchanged)
- search.js: v0.6.1.74
- core.js: v0.6.1.53 (unchanged)
- compare.html: updated Chat 61 (unchanged)
- background.js: v0.6.1.17 (unchanged)
- styles.css: updated Chat 60 (unchanged)
- welcome.html: created Chat 59 (unchanged)
- index.html: unchanged
- killswitch.json: disabled:false

---

## What this session covered

### isPaperWeightLb() helper (v0.6.1.73)
New shared helper function. Returns true when the lb number in a product title is a paper-grade spec (cover, bond, text, index, weight, cardstock, gsm, basis, bristol, vellum) rather than physical weight. Used in three places to prevent paper-weight specs from triggering weight-based PPU. Category-agnostic — applies to any paper/printing product.

### titleHasWeightQty check — paper-weight lb suppressed (v0.6.1.73)
The gate that decides whether to use the weight-based PPU path now ignores paper-weight lb. Previously "65 lb Cover Weight" triggered the weight path; now it falls through to $/ct.

### Weight-from-title fallback — paper-weight lb suppressed (v0.6.1.73)
The lbM2 match in the fallback weight calculator is nulled when isPaperWeightLb fires. Paper products without Amazon unit prices no longer get $/lb.

### scrapeBrand Strategy 3 — expanded adjective blocklist (v0.6.1.73)
First-word brand detection now rejects ~25 common descriptor words: premium, extra, heavy, ultra, thick, white, black, bright, pure, classic, super, best, pro, true, new, large, small, big, soft, hard, clear, blank, bulk, pack, set, kit, high, low, top, max, mini, micro, multi, anti, non.

### extractCount — N/Pack pattern (v0.6.1.74)
"250/Pack", "100/Box", "500/Pk" formats now return the correct count. Previously the slash separator caused extractCount to return null, which showed the full item price as $/ct for these items.

### Testing done this session
- Cardstock search — "250/Pack" items now show correct $/ct (e.g. ~$0.07/ct not $16.84/ct) ✅
- Rice/food search — dog food working correctly; rice has multi-pack × weight gaps (see known issues)

---

## Files produced this session
- search.js v0.6.1.74 — upload to GitHub extension/content/
- Project_Briefing.md — upload to Claude Project
- Roadmap.md — upload to Claude Project
- changelog_entry_chat62.md — upload to Claude Project
- Handover_May12_Chat62.md — upload to Claude Project

---

## Known issues (carried forward + new)

1. **Multi-pack × weight PPU — needs design session.** Items like "2 lb Bag (Pack of 2)" or "32-Ounce Box (Pack of 6)" should show $/lb or $/oz based on total weight (unit weight × pack count). Currently AU shows $/ct per bag or full price. The math is: total weight = unit weight × pack count; PPU = price / total weight. Do not attempt without a design session — touches weight unit logic.
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
15. Prime scraping — possible Amazon selector change. Needs investigation.
16. Amazon Basics brand column shows — on compare.html. Needs investigation.

---

## Next session priorities (in order)

1. **Multi-pack × weight PPU design session** — "2 lb Bag (Pack of 2)" should show $/lb or $/oz based on total weight. Design the logic before touching any code.
2. **Prime scraping investigation** — check selectors against current Amazon HTML
3. **welcome.html screenshot** — laundry pods, annotated callout design
4. **CWS push + Reddit posts** — held pending above

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

---

## Start of next session
1. Read this handover
2. Ask if anything has come up since last session
3. Upload search.js fresh from GitHub
4. Confirm scope before touching any files
