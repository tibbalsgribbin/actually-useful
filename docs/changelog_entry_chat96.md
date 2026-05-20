# Changelog — Chat 96

*May 20, 2026*

*Opus consolidation session following the Chat 95 audit. The four Chat 94 design docs were consolidated into three locked docs plus a new partial Design System doc. Trust_Postures.md discarded. `isServingWeight()` verified against actual code. Consumption-unit equivalence principle surfaced from Melissa's laundry-detergent question and folded into Override_Principle. No code changes.*

---

## Delivered

### Consolidated three design docs

`Override_Principle.md` — edited end-to-end:

- New "How the four relate" intro establishing that defer is base, add-pill and note stack, override replaces.
- Sharpened recategorize/suppress split inside Override section: explicit mutually-exclusive sub-postures.
- Add-pill section: dropped "alongside or instead of" phrasing; established "plural by default" with the 6-row worked-examples table from the Chat 95 handover.
- New 3-step "How to choose" decision tree.
- New "Consumption-unit equivalence" subsection (added late session per Melissa's laundry question): explains how multiple title units describing the same consumption unit collapse to one pill.
- Case table: cookware reason clarified, trash bags reason clarified, supplements → `Defer + Add-pill`, new rows for bundle (`override-suppress`), variety pack (`Defer + Note`), and laundry detergent (`Defer + Add-pill` with consumption-unit-equivalence note).
- Handler table: `isServingWeight` row corrected to reflect defensive role (not a posture-shift candidate).
- Vocabulary standardized to "add-pill" with hyphen throughout.

`Servings_Design.md` — edited end-to-end:

- Lead reframed: supplements = `defer + add-pill`. `isServingWeight()` stays as defensive code on a subset.
- Trust-posture mapping rewritten: `Defer + Add-pill` / `Defer alone` / `Override-suppress`. The buggy "add-pill + override-recategorize" combination removed.
- New section on multi-pack plurality: single tub → +$/serving; multi-pack → +$/tub + $/serving.
- `isServingWeight()` claim verified against search.js lines 974–977; doc now quotes the actual code, names the threshold (gQty < 100), and flags the keyword-list mix (category words + serving-presence words).
- "What changes about `isServingWeight()`" section rewritten — handler doesn't shift posture; add-pill is a separate code path.

`Demotion_Display.md` — edited end-to-end:

- New "The trigger" section with 3-question algorithm. Tier is determined by what the listing supplies in the current sort, not by its posture.
- Three tiers restructured around the trigger. Examples reworked: yarn-in-$/lb sort and supplement-in-$/g sort moved from soft-demote to **normal**.
- "Each posture lands in exactly one tier" claim removed. Replaced with a posture→tier mapping table showing the same posture can land in different tiers depending on title data.
- Worked examples rewritten end-to-end.
- Compare view "n/a — by [unit]" added for soft-demote cells.

### Discarded `Trust_Postures.md`

Replaced by `Override_Principle.md`. Should be deleted from project knowledge after the GitHub push. The "How to choose" decision tree was salvaged into Override_Principle (rephrased per the #9 resolution).

### New: `Design_System.md` (partial)

Lean consolidation of established design choices: palette (from Panel_Redesign_Spec §3), fonts (from mockups, with verification caveat), opacity (from Demotion_Display), `(?)` icon and popover (from Pattern_AB_Note). Explicit "Things this doc does not yet cover" section lists spacing, border-radius, button states, form inputs, transitions, icons beyond `(?)`, shadows, and badge sizing as TBD — Sonnet should surface these gaps rather than invent values. Has a "do not extend during coding sessions" rule.

Per Melissa's call: created because the consolidation was cheap (only consolidating already-settled material). Full design system consolidation deferred — would require a design session.

### `isServingWeight()` verified against actual code

search.js uploaded mid-session. Function lives at lines 974–977 of search.js. Verified behavior: returns true when `gQty < 100` and title matches a keyword regex. Regex includes both category words (`whey|isolate|casein|collagen|creatine|bcaa|amino|pre-?workout|mass\s*gainer|greens|protein`) and serving-presence words (`serving|servings`). The keyword-list-mix observation folded into Servings_Design.md.

### Consumption-unit equivalence principle surfaced

Melissa's question about laundry detergent units (load, sheet, tab, pac, pack, ct) prompted a verification dive into search.js. Confirmed: the existing "per item" pill collapses sheet/pod/tab/load/pac/fling/strip into a single sort dimension via `altPPU`, regardless of `altUnit`. The card displays its own unit; the sort treats them as equivalent.

This is a principle the consolidated docs didn't capture. Folded into `Override_Principle.md` as a new subsection ("Consumption-unit equivalence") with laundry as canonical, plus likely sister categories (dishwasher detergent, coffee, pet food, paper goods).

---

## New issues surfaced this session

**`Panel_Redesign_Spec.md` doesn't define fonts.** Found while assembling `Design_System.md`. Fonts are defined ad-hoc in HTML mockups ("Inter Tight" for UI, "Source Serif 4" for serif body in onboarding) but not in the canonical panel spec. The production CSS should be verified against the mockup choices before either is treated as definitive. Flagged in Design_System.md.

No new code bugs.

---

## Not changed

`manifest.json`, `background.js`, `core.js`, `search.js`, `styles.css`, `compare.html`, `privacy.html`, `content/page/compare-bridge.js` — all unchanged.

`Unit_Catalog_Phase1.md` — posture tagging still pending (Phase 1.5).

---

*End of Chat 96 changelog.*
