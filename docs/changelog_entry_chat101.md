# Changelog — Chat 101 (May 21, 2026 · Opus)

## Summary

Phase 3-prep verification round 3 complete. First Shape F (defer-case) verifications: deodorant and lotion both confirmed. AU defers correctly to Amazon's per-listing PPU choices in both uniform-PPU (deodorant) and mixed-PPU (lotion) configurations. Separately, brand-detection accuracy issue surfaced from telemetry review during the lotion verification: AU is demoting legitimate brands (NIVEA, DEGREE, ARRID, Schmidt's, etc.) via heuristic signals despite none being on Melissa's personal blocklist. Root cause traced to `signalAllCapsInvented` and `signalFakeMashup` solo-triggers + a fashion-focused passlist that lacks personal-care brands. Held for audit-path decision. No code changes this session.

## Shape F verification — deodorant + lotion

Both confirmed defer per Chat 100's corrected methodology (check Amazon AND AU):

- **Deodorant.** Amazon shows ~uniform `(/ounce)` across the 60-listing scrape (1 outlier: `(/count)` for a 2-pack item). AU produces `oz(192)` of 226 listings, plus `ct(24), fl oz(9), g(1)`. Selected unit: `as-listed`. Defer confirmed.
- **Lotion.** Amazon shows mixed liquid-dominant PPU: ~48 `(/fluid ounce)`, ~8 `(/ounce)`, ~3 `(/milliliter)` across the 60-listing scrape. AU produces `fl oz(123)` of 174 listings, plus `oz(35), ct(9), ml(5), g(1)`. Selected unit: `as-listed`. `Liquid Dominant: TRUE`. Defer confirmed — AU correctly follows Amazon's per-product choices without trying to normalize across the mix.

## Brand-detection finding

While reading lotion telemetry, noticed `brandsFilteredTotal: 14` with `topFilteredBrands: NIVEA(12), BIOTONE(1), ATTITUDE(1)`. Deodorant telemetry showed parallel pattern: `Schmidt's(9), CRYSTAL(4), Harry's(1), DEGREE(1), Procter(1), ARRID(1), LAVILIN(1)`. `personalBlocklistSize: 0` for both — none of these brands are on Melissa's rules list.

Investigation against search.js v0.6.1.54:

- The brand-filter system has two paths: blocklists (exact-match) and heuristics (Signals 1–5, function `detectGibberishBrand`, lines 1071–1174). The heuristics run on every brand whenever `brandFilterActive` is TRUE, regardless of whether the rules list is empty.
- `signalAllCapsInvented` (Signal 5, lines 1150–1169) flags any all-caps brand name (no spaces, 5+ letters) not on a hardcoded `ALL_CAPS_PASSLIST` (lines 1155–1164). The passlist is fashion-focused (ZARA, ASOS, NIKE, etc.) — no personal-care brands.
- Solo-trigger logic (lines 1172–1174): `signalAllCapsInvented` and `signalFakeMashup` are sufficient alone, no corroboration required.
- Telemetry columns `topFilteredBrands` and `brandsFilteredTotal` conflate blocklist-source and heuristic-source flags. No source distinction visible in telemetry output.

Brand-by-brand attribution (inferred):
- NIVEA, DEGREE, ARRID, CRYSTAL, LAVILIN, BIOTONE, ATTITUDE → `signalAllCapsInvented` (solo-trigger)
- Schmidt's → `signalConsonantCluster` + `signalNoVowel` (score ≥ 2)
- Procter → `signalFakeMashup` (solo-trigger)
- Harry's → mechanism less clear; possibly apostrophe handling

## Doc updates

- `Phase2_Taxonomy.md` — Shape F "Verification findings (Chat 101)" subsection added (parallel to Shape A's existing structure). Phase 3-prep verification queue line for Shape F updated.
- `Unit_Catalog_Phase1.md` — New section added: "VERIFIED non-collisions (Shape F defer cases)" with deodorant and lotion as anchor entries. First non-collision entries in the catalog.
- `Roadmap_Chat101.md` — Round 3 marked done. Brand-detection accuracy added as sub-track under existing broader AU-accuracy review item. Audit path (in-family Opus, optional outside-family GPT-5) recommended for Chat 102.
- `Project_Briefing_Chat101.md` — Updated with all of the above. New standing rule #22: telemetry that conflates sources is its own bug class.
- `Handover_Chat101.md` — New file. Full details for next session.

## No code changes

Brand-detection fix held pending audit scope decision. Three candidate paths (passlist additions / solo-trigger logic change / diagnostic telemetry addition). The audit (Path A in Roadmap) is the recommended forum for that scope decision.

## Standing rules added

- **#22 (Chat 101):** Telemetry that conflates sources is its own bug class. When a telemetry column reports counts from multiple underlying mechanisms without source distinction, false positives from one mechanism can be invisible. Watch for this pattern.

## What Chat 102 should consider

1. Accuracy audit (in-family Opus, optional outside-family GPT-5 follow-up). Covers unit-detection, brand-detection, telemetry composition. Recommended if energy is high.
2. Continue verification queue: canned soup/beans (Shape F extension), weighted vest lb / body weight ranges (Shape A continuation).
3. Address brand-detection finding directly (if Melissa decides scope without an audit).
4. Track 1 alternative: Phase 8B residue.
