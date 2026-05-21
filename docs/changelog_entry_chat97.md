# Changelog — Chat 97

*May 20, 2026*

*Opus session. Phase 1.5 catalog posture tagging executed (1.5a + 1.5b). Twenty entries in `Unit_Catalog_Phase1.md` now carry inline posture tags: 13 firm postures on VERIFIED entries, 7 posture-hypothesis tags on SPECULATIVE entries the Override_Principle case table already covers. `bug-test.md` toothpaste verdict reconciled to match the Chat 96 Defer call. No code changes.*

---

## Delivered

### Phase 1.5a — VERIFIED entry tagging

Thirteen VERIFIED collisions in `Unit_Catalog_Phase1.md` now carry inline `**Posture:** ...` lines. Split by type:

**Eight category-level postures:**

- Toothpaste (oz/fl oz) → **Defer**. Earlier "needs solid override" framing dropped.
- Paper grade (lb) → **Override (suppress)**.
- Dumbbells/kettlebells (lb) → **Override (suppress)**, with note that `isMultiPackWeight` may need recasting in Phase 3 as a constraint on weight computation.
- Per-serving nutrition supplements (g) → **Override (suppress) at handler level; Defer + Add-pill at category level.** Two different code paths called out per `Servings_Design.md`.
- Per-serving more broadly (g) → **Defer + Add-pill** when generalized beyond supplements (speculative for coffee, pet food).
- Whole-package $/ct → **Override (recategorize)**, with fallback to Override (suppress) when no count appears in the title.
- Pair $/pair vs $/item → **Defer + Note**.
- Solid-product override gap (load family) → **Defer + Add-pill (consumption-unit equivalence)**.

**Five N/A entries** (not category collisions, tagged for completeness):

- Stray parenthesized fl oz numbers — parse bug.
- Pack-count vs item-count ct confusion — arithmetic bug.
- Sub-penny PPU on high-count items — formatting issue.
- Min-5ft guard in `extractCount` — detection carve-out.
- `'in'` preposition risk in `LENGTH_UNITS` — detection-risk note.

### Phase 1.5b — SPECULATIVE bookkeeping pass

Seven SPECULATIVE entries that the `Override_Principle.md` case table already covers were tagged inline as `**Posture-hypothesis:** ...` (a distinct tag form from firm `Posture:` tags). These propagate the case table's hypotheses into the catalog without claiming verification status:

- Cross-stitch "14 count Aida" → Override (suppress)
- Bedding "400 thread count" → Override (suppress)
- Fishing line "20 lb test" → Override (suppress)
- Screen size "55 inch TV" → Override (suppress)
- Aquarium "20 L tank" → Override (suppress)
- Trash bags "13 gallon" → Override (recategorize)
- Cookware "10 piece set" → Override (suppress)

### `bug-test.md` toothpaste verdict reconciled

Two locations updated to reflect the Chat 96 Defer verdict:

- **Apr 29 log row** for "travel size toothpaste" — appended a May 20, 2026 update noting the "needs SOLID_KEYWORDS entry" framing is superseded by Defer. Original observation preserved; "3 Ounce" word-form parse failure called out as a separate remaining issue.
- **"Known tricky cases" item "Toothpaste as liquid"** — "Should be solid override" struck through and replaced with a Defer note pointing to `Override_Principle.md`.

This completes the reconciliation that `Override_Principle.md` flagged as needed.

---

## Not changed

No code changes. `manifest.json`, `background.js`, `core.js`, `search.js`, `styles.css`, `compare.html`, `privacy.html`, `content/page/compare-bridge.js` — all unchanged.

The four locked design docs (`Override_Principle.md`, `Servings_Design.md`, `Demotion_Display.md`, `Design_System.md`) — all unchanged from Chat 96 versions.

`Panel_Redesign_Spec.md` — unchanged (§5.7, §8.3 still stale).

---

## New issues surfaced this session

None. Phase 1.5 was mechanical execution against the Chat 96 framework; no new design questions surfaced.

The bug-vs-posture distinction (five of thirteen VERIFIED entries are parse bugs, arithmetic bugs, formatting issues, or detection carve-outs rather than category collisions) is now made explicit in the catalog. Not new — was implicit in Chat 96 design work — but now visible at the entry level.

---

## What's next

Phase 2 (taxonomy) becomes the natural next step. Phase 1.5 outputs feed in: every VERIFIED entry has a firm posture, and case-table-covered SPECULATIVE entries have hypotheses to test. Remaining SPECULATIVE entries (mug/tumbler/water-bottle capacity, spray-can coverage, glove weight class, fishing weights, precious metals, load capacity ratings, body weight ranges, jewelry weight specs, syringe ml, and others — see catalog) wait for Phase 2 shape grouping.

---

*End of Chat 97 changelog.*
