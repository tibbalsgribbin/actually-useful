# Handover — May 12, 2026 (Chat 63)

## Session type
Coding session. search.js updated. No changes to manifest, core.js, background.js, styles.css, compare.html, welcome.html, or index.html.

## Current versions
- manifest: v0.6.1 (unchanged)
- search.js: v0.6.1.78
- core.js: v0.6.1.53 (unchanged)
- compare.html: updated Chat 61 (unchanged)
- background.js: v0.6.1.17 (unchanged)
- styles.css: updated Chat 60 (unchanged)
- welcome.html: created Chat 59 (unchanged)
- index.html: unchanged
- killswitch.json: disabled:false

---

## What this session covered

### Multi-pack × weight PPU — design and build (v0.6.1.75–v0.6.1.77)

Full design session followed by implementation. Core question: when a product has both a pack count and a physical weight (e.g. "Rice 20 lb Bag, Pack of 6"), show $/lb based on total weight rather than $/ct.

**New helper `isMultiPackWeight(title)`:** Guards the multiplication. Fires when EITHER a container word (bag, box, bottle, etc.) appears adjacent to the weight in the title, OR a strong substance keyword (rice, food, powder, protein, detergent, etc.) appears anywhere. Prevents dumbbells and cookware from being multiplied.

**New helper `isServingWeight(title, gQty)`:** Suppresses gram values under 100g when supplement keywords are present. Prevents "30g Protein" in a whey powder title from being treated as physical product weight.

**Two insertion points for multiply logic:**
1. `count&&price` branch — when count=1 and isMultiPackWeight passes, shows weight PPU for single items too (fixes Minute Rice $/ct regression). When count>1, multiplies and shows ppuNote ("6 × 20 lb = 120 lb total").
2. Weight-from-title fallback — same multiply logic for count>1 when Amazon provides no unit price.

### Oz hyphen fix (v0.6.1.78)

Root cause of persistent Minute Rice $/ct bug: "72-Ounce" uses a hyphen between the number and the unit word. All three oz extraction regexes used `\s*` (whitespace only), not matching the hyphen. Changed to `[- ]*` in parseTitleWeightQty (ozM), the count&&price multi-pack block (mwOz), and the weight-from-title fallback (ozM2). This also fixes "32-Ounce Box", "16-Ounce Bottle", and similar patterns throughout.

### Testing done this session
- Rice search — multi-pack rice (15 lb Pack of 2, 20 lb Pack of 2) now shows correct $/lb with ppuNote ✅
- Minute Rice (72-Ounce Box, Pack of 1, no Amazon unit price) — now shows $/oz ✅
- Protein powder — $/oz from Amazon unit price working correctly; per-serving nutrition grams suppressed ✅
- Dumbbells — correctly NOT multiplied; pre-existing $/lb for single items is the known outlier issue ✅

---

## Files produced this session
- search.js v0.6.1.78 — upload to GitHub extension/content/
- Project_Briefing.md — upload to Claude Project
- Roadmap.md — upload to Claude Project
- changelog_entry_chat63.md — upload to Claude Project
- Handover_May12_Chat63.md — upload to Claude Project

---

## Known issues (carried forward + new)

1. Contact lens solution liquid PPU unreliable
2. Cotton swabs extractCount grabbing pack count
3. Razor blade $0.1/ct outlier
4. Pairs ambiguity — interim note only
5. FSA/HSA, Climate Pledge, Small Business — not yet verified on live searches
6. Blue/indigo palette inconsistency — post-alpha
7. No selector resilience — broader codebase still fragile
8. No self-test mode
9. compare.html logging — deferred (storage boundary)
10. Brand filter mixed-case invented names — accepted gap
11. Duplicate "Pages slider" comment in search.js — cosmetic only
12. Outlier PPU units (lb, ft) sorting to top as best value — needs design session
13. welcome.html screenshot — needs replacement with laundry pods screenshot, annotated callout design
14. Prime scraping — possible Amazon selector change. Needs investigation.
15. Amazon Basics brand column shows — on compare.html. Needs investigation.
16. Dumbbells $/lb — pre-existing; isMultiPackWeight returns false but weight-from-title still fires for single items. Part of the broader outlier PPU issue.

---

## Next session priorities (in order)

1. **$/serving for protein powder — design session** — Amazon reliably provides "N Servings" in brand row. altPPU/altUnit fields already exist. Design display logic before coding.
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
