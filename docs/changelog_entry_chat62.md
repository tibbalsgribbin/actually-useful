# Changelog — Chat 62 (May 12, 2026)

## Files changed
- search.js: v0.6.1.72 → v0.6.1.74

---

## search.js changes (v0.6.1.73 → v0.6.1.74)

### extractCount — N/Pack pattern added (v0.6.1.74)
Added `/(\d[\d,]*)\/(?:pack|box|pk)\b/i` pattern to catch "250/Pack", "100/Box", "500/Pk" title formats. Previously the slash between the number and "Pack" caused extractCount to return null, which sent items like "Astrobrights Color Cardstock, 65 lb Cover Weight, 8.5 x 11, 250/Pack" to the CONTAINER_UNITS fallback path showing the full item price as $/ct. Now returns 250, enabling correct $/ct calculation.

---

## search.js changes (v0.6.1.72 → v0.6.1.73)

### isPaperWeightLb — new helper function (v0.6.1.73)
New `isPaperWeightLb(title)` function returns true when a title's lb number is a paper-grade spec rather than physical weight. Checks for qualifier words after the lb match: cover, bond, text, index, weight, cardstock, card stock, gsm, basis, bristol, vellum. Used in three places to prevent paper-weight specs from triggering weight-based PPU calculation.

### parseTitleWeightQty — now uses isPaperWeightLb helper (v0.6.1.73)
Replaced the inline regex guard with a call to the new isPaperWeightLb helper. Behavior unchanged, but now shares logic with the other two call sites.

### titleHasWeightQty check — paper-weight lb suppressed (v0.6.1.73)
The `titleHasWeightQty` test that gates the Fix 2 weight path now uses isPaperWeightLb. If the only weight match in the title is a paper-weight lb spec, the title is treated as having no physical weight. Items like "65 lb Cover Weight, 250 Sheets" no longer fall into the weight-based PPU path.

### Weight-from-title fallback — paper-weight lb suppressed (v0.6.1.73)
The `lbM2` match in the weight-from-title fallback (used when Amazon provides no unit price) is now nulled out when isPaperWeightLb fires. Paper/cardstock products without Amazon unit prices will now fall through to $/ct rather than showing a bogus $/lb.

### scrapeBrand Strategy 3 — expanded adjective blocklist (v0.6.1.73)
The first-word fallback in scrapeBrand now rejects a broader set of common descriptor words that are not brand names: premium, extra, heavy, ultra, thick, white, black, bright, pure, classic, super, best, pro, true, new, large, small, big, soft, hard, clear, blank, bulk, pack, set, kit, high, low, top, max, mini, micro, multi, anti, non. Previously only articles and prepositions were excluded, causing "Premium [Product]" titles to return "Premium" as a brand name.

---

## Known issues identified this session

### Multi-pack × weight PPU — needs design session
Items with both a weight and a pack count (e.g. "2 lb Bag (Pack of 2)") should show PPU based on total weight (2 lb × 2 = 4 lb), not per-bag or per-item. Currently AU treats weight and count as separate tracks and doesn't multiply them. For rice/food comparisons this is critical — $/oz or $/lb across all results is what the user needs. Correct logic: total weight = unit weight × pack count; PPU = price / total weight. Do not attempt without a design session — touches weight unit logic.
