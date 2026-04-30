## **v0.6.1.35 — April 29, 2026 (Chat 40)**

*UI polish and bug-test session. One code change; no logic changes.*

### search.js — v0.6.1.35 (badge filter layout)
- Badge filter checkboxes (SNAP EBT, FSA/HSA, Climate Pledge Friendly, Small Business) moved out of `#ppu-price-range-row` into a new `#ppu-badge-filter-row` div below it
- Now render as a vertical stack, one checkbox per line, in order: SNAP EBT → FSA/HSA → Climate Pledge → Small Business
- Label class renamed from `ppu-snap-label` to `ppu-badge-label`; `font-weight:normal` applied — was inheriting bold
- Whole block conditionally renders only when at least one qualifying result is present — same logic as before, restructured
- Fixed syntax error (mismatched parentheses) introduced in first edit pass

### Bug-test session — personal care / small sizes
Tested 8 search categories. Findings logged as known issues:

- **Travel shampoo / conditioner** ✅ — $/oz correct
- **Lip balm** ⚠️ Partial — $/ct or $/oz depending on item; can't show both; cosmetics $/oz reveals wild price differences (one item: $191/oz)
- **Razor blade refills** ✅ — $/ct correct; $0.1/ct formatting bug noted (missing zero-pad)
- **Disposable razors** ✅ Pass
- **Contact lens solution** ❌ — Amazon-reported $/fl oz unreliable; stray numbers in title (e.g. "(12)") cause wrong division; needs liquid PPU sanity check
- **Travel size toothpaste** ⚠️ Partial — word-form weights not matched ("3 Ounce"); toothpaste classified as liquid (Amazon reports fl oz; needs SOLID_KEYWORDS entry)
- **Cotton swabs** ❌ — extractCount grabbing pack count instead of swab count; one case where count found but PPU calculates price/1; sub-penny PPU needs 3 decimal places

### New known issues added to roadmap
- PPU formatting: $0.1/ct → $0.10/ct (zero-pad)
- PPU display: 3 decimal places when PPU ≤ $0.01
- Toothpaste → SOLID_KEYWORDS
- Word-form weights in personal care ("3 Ounce", "0.85 OZ")
- Contact lens solution liquid PPU sanity check
- Cotton swabs extractCount pack vs item count
- Results summary line doesn't update for badge filters
- Show both weight and count PPU (post-alpha)
