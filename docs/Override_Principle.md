# Override Principle

*Chat 96 · May 20, 2026 · Opus*

*Articulates the foundational question behind every unit-handling decision in AU: when does AU trust Amazon's reported PPU, and when does AU override it? Defines four "trust postures" — defer, override, add-pill, note — and the criteria for choosing between them. This document is the design spine for Phase 3. It is also the lens through which existing handlers (`isPaperWeightLb`, `isMultiPackWeight`, `isServingWeight`, `applyPairsNote`) should be re-examined, and the framework within which new collision rules will be designed.*

*Supersedes `Trust_Postures.md` (Chat 94, discarded).*

---

## The principle

**PPU exists to enable apples-to-apples comparison within a category of search results.** It is a comparison tool, not an abstract correctness statement.

This reframes every override decision. The question is not "what is the most technically accurate unit for this product?" The question is **"does Amazon's PPU let the user compare meaningfully against the other products on this page, and if not, what should AU do instead?"**

When Amazon's PPU enables in-category comparison, AU defers — even if the unit is technically imprecise. When Amazon's PPU doesn't enable comparison, AU intervenes. The form the intervention takes depends on what's actually wrong.

---

## The four trust postures

Existing handlers (and any new ones) fall into one of four postures. Each posture answers a different problem.

### How the four relate

The four postures are not all parallel. **Defer** is the base case when Amazon's PPU is meaningful; **add-pill** and **note** stack on top of defer (you can defer to Amazon's PPU *and* add pills, *and* surface a note). **Override** replaces defer — when Amazon's PPU is unsalvageable, AU either recategorizes (replaces with a unit pulled from the title) or suppresses (shows no PPU).

This is the central distinction the #9 resolution pinned down: **add-pill adds a unit alongside Amazon's; recategorize replaces Amazon's.** The two are mutually exclusive — the trigger for choosing between them is whether Amazon's PPU is meaningful to keep available.

### 1. Defer

**When**: Amazon's reported PPU enables comparison within the category, even if the unit name is technically imprecise.

**Action**: AU passes Amazon's PPU through unchanged. No override, no note, no alternative unit.

**Canonical example**: Toothpaste. Amazon shows $/fl oz; the technically correct unit is $/oz (weight). But every toothpaste on the search page shows the same way, the densities are similar enough that the comparison still works, and forcing a $/oz conversion would introduce error and disagree with the rest of the page. Defer.

**Test for fit**: would a user comparing products on this page get a useful answer from Amazon's PPU? If yes — defer, even if a unit purist would object.

**Likely category**: most semi-solid, paste-like, gel-like, and thick-liquid products where oz and fl oz are used interchangeably across the page (personal care, pourable foods, semi-solid foods, canned goods, pressurized cans). Needs verification searches before being treated as settled.

### 2. Override

**When**: Amazon's PPU does not enable comparison because the number Amazon used is not actually a quantity-of-product — it's a spec, a per-serving figure, a stray scrape, or a set-component descriptor.

**Action**: AU suppresses or recategorizes the PPU. The user sees something other than what Amazon reported.

**Two sub-postures, mutually exclusive**:

- **Recategorize**: replace Amazon's PPU with a different unit pulled from the title. Amazon's original PPU is no longer offered as a pill. Use when a meaningful replacement unit is available in the title.
- **Suppress**: show no PPU. Use when no meaningful replacement unit exists.

**Canonical examples**:
- **Paper weight** ("65 lb cover"): the lb is a paper grade, not the weight of the buyable item. $/lb cannot compare cardstock products meaningfully. No useful replacement unit in title. **Suppress.**
- **Cross-stitch fabric** ("14 count Aida"): the count is mesh density, not item quantity. $/ct cannot compare fabrics meaningfully. **Suppress** (count of buyable pieces is rarely in title).
- **Cookware set** ("10 piece pots and pans set"): the 10 is set composition, not buyable units. $/piece is misleading and $/set is trivially just price. **Suppress.**
- **Trash bags** ("13 gallon, 80 count"): Amazon's $/gallon treats bag *capacity* as quantity. The buyable unit is the bag; count is in the title. **Recategorize to $/bag.**

**Test for fit**: is the number Amazon used a description of the product (a spec) rather than a count of what's being purchased? If yes — override. Then choose recategorize vs suppress by asking whether a meaningful replacement unit appears in the title.

### 3. Add-pill

**When**: Amazon's PPU is meaningful (defer is in effect) and the title contains data for *one or more* additional units that would also be meaningful to compare on.

**Action**: AU surfaces additional PPU pills in the compare panel, alongside Amazon's. The user chooses which one to compare on. Amazon's original PPU remains available.

**Add-pill is plural by default.** AU surfaces *every* meaningful comparison unit the title supports — not just one. The number of pills offered depends on how much useful data the title carries. Worked examples:

| Listing | Pills offered |
|---|---|
| Yarn (single skein) | Amazon default ($/oz or $/g) + **$/yard**. $/ct meaningless with count of 1. |
| Yarn (multi-pack) | Amazon default + **$/ct** + **$/yard**. |
| Embroidery floss (6-pack) | Amazon default + **$/skein** + **$/yard**. |
| Ribbon multi-roll | Amazon default + **$/roll** + **$/yard**. |
| Supplements (single tub) | Amazon default ($/g or $/oz) + **$/serving**. |
| Supplements (multi-pack) | Amazon default + **$/tub** + **$/serving**. |

The principle: add-pill triggers wherever the title supplies data for a meaningful unit AU isn't already offering. A title with one extra meaningful unit gets one extra pill; a title with three extra meaningful units gets three.

**Consumption-unit equivalence.** When multiple title units describe the *same* underlying consumption unit, they collapse to a single pill rather than each getting their own. The user is sorting on "how much per wash" or "how much per dose," not on "how much per physical-form-of-thing."

The canonical case: laundry detergent. A search page mixing sheets, pods, tabs, pacs, flings, strips, and liquid-measured-in-loads all share one consumption unit — the wash. Currently AU handles this through the existing "per item" pill (search.js): each listing's per-count value is used as the sort key regardless of whether the title's unit is `sheet`, `pod`, `tab`, or `load`. The card displays its own unit; the sort treats them as equivalent.

Other categories likely to need consumption-unit equivalence:

- **Dishwasher detergent** — pods, tablets, gel-by-load. One pill: per-wash.
- **Coffee** — pods, K-cups, ground-by-cup-yield. One pill: per-cup (hedged for grind variation).
- **Pet food** — kibble cups, wet-food cans, by-dog-size meal estimates. One pill: per-meal (hedged).
- **Toilet paper / paper towels** — sheets, rolls, mega-rolls. One pill: per-sheet *or* per-roll depending on page convention.

The general test: would a user comparing two listings on this page want them ranked together, even though their title units differ? If yes — one pill.

Plurality (multiple pills per listing) and equivalence (multiple title units collapse to one pill) operate at different levels and don't conflict:

- Plurality: a single listing's title supports multiple meaningful pills (a yarn skein listing with both yardage and count data → $/yard + $/ct + Amazon default).
- Equivalence: multiple listings on a page, with different title units that describe the same consumption thing, get sorted together under one pill.

Phase 3 detection rules need both. Plurality decides how many pills a single listing's title earns; equivalence decides whether two listings' different title units sort under the same pill or different pills.

**Test for fit**: for each meaningful unit a title could support — is the data present in the title, and is AU not already offering it? Each "yes" adds a pill.

**Distinction from recategorize**: add-pill *augments*; recategorize *replaces*. They are mutually exclusive. The trigger that selects between them is the same trigger used for defer-vs-override: **is Amazon's PPU meaningful to keep available?** If yes → defer (plus add-pill if there's more in the title). If no → recategorize (if replacement available) or suppress (if not).

### 4. Note

**When**: Amazon's PPU is ambiguous — it may or may not be comparable depending on what the neighboring listings show. AU can't unilaterally decide, and overriding would risk introducing a different error.

**Action**: AU keeps Amazon's PPU but adds a user-facing ambiguity note. Note stacks with defer; it does not replace it.

**Canonical example**: `applyPairsNote()`. When a title contains "pair," Amazon's $/pair may or may not match how other listings on the page are priced (some show $/item, some show $/pair). AU flags the ambiguity without overriding the number.

**Test for fit**: is the unit contested in a way the user should know about, but where AU lacks the data to decide for them? If yes — note.

**Note that the current implementation has its own design problems (documented in Phase 4 scope of the catalog). The posture is right; the execution needs rework.**

---

## How to choose: decision tree

For each listing, apply in order. Stop at the first match (except where stacking is allowed).

**Step 1 — Is Amazon's PPU meaningful to keep available as a comparison unit?**

- **No** → **Override**. Then:
  - Is a meaningful replacement unit present in the title? **Yes** → recategorize to that unit. **No** → suppress.
  - *Stop. Override replaces defer; add-pill and note do not stack with override under normal cases.*
- **Yes** → **Defer.** Continue to step 2 for stackable additions.

**Step 2 — Does the title contain additional meaningful comparison units that AU isn't already offering?**

- **Yes** → **Add-pill** for each one. Plural by default. Continue to step 3.
- **No** → continue to step 3.

**Step 3 — Is the unit contested in a way the user should be warned about?**

- **Yes** → **Note.**
- **No** → done.

The order matters: override is decided first because it changes whether the other postures even apply. Add-pill and note can both be active on a defer-base listing.

---

## Applying the postures to existing handlers

| Handler | Posture | Notes |
|---|---|---|
| `isPaperWeightLb` | Override (suppress) | Correct posture. Detection is narrow, works. |
| `isMultiPackWeight` | Override (cautionary) | Hybrid — blocks pack-multiplication rather than suppressing PPU outright. May need recasting in Phase 3 as a constraint on weight computation rather than a separate handler. |
| `isServingWeight` | Override (suppress) | Defensive against a parse failure: Amazon scrapes a per-serving gram value as if it were product weight. The handler is correct for that subset. The category-wide supplement posture (defer + add-pill for $/serving) is a separate code path; see `Servings_Design.md`. |
| `applyPairsNote` | Note | Right posture, execution problems. Phase 4 redesign. |

---

## Applying the postures to the unresolved cases

The catalog lists many SPECULATIVE collisions. Tagging each with a candidate posture sharpens what Phase 3 will need to design.

| Case | Candidate posture | Why |
|---|---|---|
| Toothpaste (fl oz) | **Defer** | Page-internal consistency; densities close enough. Reversal of earlier "needs override" verdict from bug-test.md. |
| Most semi-solid/paste personal care | **Defer** | Same reasoning as toothpaste. Verify category by category. |
| Cross-stitch "14 count Aida" | **Override (suppress)** | Mesh density is a spec, not a quantity. No good replacement in title. |
| Bedding "400 thread count" | **Override (suppress)** | Same shape as above. |
| Fishing line "20 lb test" | **Override (suppress)** | Spec masquerading as weight. |
| Dumbbells / kettlebells | **Override (suppress)** | Same. `isMultiPackWeight` partly covers but doesn't suppress the per-lb calculation itself. |
| Screen size "55 inch TV" | **Override (suppress)** | Spec; no per-inch meaning. |
| Aquarium "20 L tank" | **Override (suppress)** | Capacity spec, not buyable volume. |
| Trash bags "13 gallon" | **Override (recategorize)** | Gallon = bag capacity; bag count is in the title. Two-number title resolves cleanly. |
| Cookware "10 piece set" | **Override (suppress)** | Set composition. $/set is trivially price; no useful replacement. |
| Bundle (e.g. Tide Pods + Downy + Stopables) | **Override (suppress)** | Price covers multiple distinct products; no honest PPU dimension. |
| Variety pack | **Defer + Note** | Per-unit comparison works for most cases; mixed-flavor matters to some users — flag it. |
| Yarn yardage | **Defer + Add-pill** | $/oz fine; add $/yard. Multi-pack also adds $/ct. |
| Servings (supplements, etc.) | **Defer + Add-pill** | $/g fine when product weight is valid; add $/serving. Multi-pack also adds $/tub. See `Servings_Design.md`. |
| Laundry detergent (any form) | **Defer + Add-pill** | Consumption-unit equivalence: `sheet`, `pod`, `tab`, `pac`, `load` collapse to one "per wash" pill. Currently handled by the existing "per item" pill in search.js. |
| Pet food "makes 30 meals" | **Defer + Add-pill** (speculative) | Add $/meal alongside $/lb. Meal count is dog-size-conditional; hedge in label. |
| Coffee "makes 60 cups" | **Defer + Add-pill** (speculative) | Add $/cup alongside $/oz. Cup size isn't standardized; hedge in label. |
| Pair-of-X items | **Defer + Note** | Existing posture, redesign pending. |

This is a hypothesis sheet, not a spec. Phase 3 will refine.

---

## What this means for the catalog

Two follow-up actions:

1. **Add a "trust posture" tag** to every VERIFIED entry in `Unit_Catalog_Phase1.md`. Posture values: `defer`, `override-suppress`, `override-recategorize`, `add-pill`, `note`. Postures can combine: `defer + add-pill`, `defer + note`, `defer + add-pill + note`. Override replaces defer and does not combine with add-pill in the normal case.

2. **Reclassify the toothpaste verdict.** Bug-test.md says "needs solid override." Override is the wrong posture. The catalog should reflect defer, and bug-test.md should be amended or annotated to match.

---

## What this doc doesn't decide

- **Which categories actually behave like toothpaste.** The list of likely-defer categories above needs verification searches before any rule treats them collectively.
- **Detection mechanics.** How AU recognizes which posture applies to a given title is Phase 3 work — context windows, keyword lists, category inference. This doc names the postures; it doesn't engineer the detectors.
- **Display details.** How a "note" renders, how add-pill pills are presented in the panel and compare view, how the user switches between pills — see `Demotion_Display.md`.
- **The compound case "override-suppress with add-pill."** A bundle that also has yardage data for one of its components is unlikely but possible. The default in the decision tree is that override replaces defer entirely; whether to add pills on top of suppress is a Phase 3 edge case.

---

## Relationship to phases

- **Phase 1 (catalog)** is the inventory of unit-words and collisions. This doc adds a posture vocabulary to apply to that inventory.
- **Phase 2 (taxonomy)** groups collisions by shape. Postures are orthogonal to shapes — a single shape (e.g. "spec rating") might consistently take one posture (override-suppress), or shapes might split by posture.
- **Phase 3 (rules)** designs the detection and action mechanisms posture by posture.
- **Phase 4 (ambiguity notes)** is essentially the implementation of the Note posture, plus retroactive cleanup of `applyPairsNote`.

---

*Working document. Postures may merge, split, or gain a fifth as Phase 2 and Phase 3 surface cases that don't fit cleanly.*
