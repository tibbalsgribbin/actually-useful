# Handover — Chat 97 → Chat 98

*May 20, 2026 · Opus*

*Phase 1.5 catalog posture tagging executed (1.5a + 1.5b). Twenty entries in `Unit_Catalog_Phase1.md` carry inline posture tags. `bug-test.md` toothpaste verdict reconciled in both locations. No code changes. No new design questions surfaced — mechanical execution against the Chat 96 framework.*

---

## What's done now

`Unit_Catalog_Phase1.md` carries inline posture tags on every VERIFIED entry plus the case-table-covered SPECULATIVE entries. Two tag forms:

- **`**Posture:** ...`** — firm, applied to VERIFIED entries (13 total).
- **`**Posture-hypothesis:** ...`** — applied to SPECULATIVE entries whose posture is asserted in `Override_Principle.md` case table but not yet verified against real Amazon results (7 total).

The bug-vs-posture distinction is now explicit in the catalog: five of the thirteen VERIFIED entries are not category collisions but parse bugs (stray paren fl oz, pack/item ct), arithmetic bugs (pack count multiplication), formatting issues (sub-penny PPU), or detection carve-outs (min-5ft guard, `'in'` preposition risk). Those carry `Posture: N/A` with a reason.

`bug-test.md` toothpaste verdict reconciled with the Chat 96 Defer call in two spots — the Apr 29 log row and the "known tricky cases" entry. The earlier "needs solid override" framing is now annotated as superseded.

---

## What Chat 98 should do

### Path A — Phase 2 kickoff: taxonomy (recommended)

Group verified collisions by shape. Each shape maps to one or more postures. The catalog now feeds in cleanly: every VERIFIED entry has a firm posture; case-table-covered SPECULATIVE entries have hypotheses to test.

Likely shape candidates worth checking the catalog against (these are hypotheses, not commitments — Phase 2 is the work that decides):

- **Spec-masquerading-as-quantity** — paper grade lb, dumbbells lb, fishing line lb test, screen size inch, aquarium L, glove weight class oz, fishing weights oz. Hypothesis: this shape consistently takes Override (suppress).
- **Capacity-of-container** — trash bag gallons, mug oz, water bottle oz. May split on whether buyable count is in title.
- **Set composition** — cookware piece sets, dinnerware sets, luggage sets. Hypothesis: Override (suppress) — $/set is trivially price.
- **Mesh / thread density** — cross-stitch count, bedding thread count. Hypothesis: Override (suppress).
- **Consumption-unit-equivalent forms** — laundry detergent (sheet/pod/tab/pac/load), possibly dishwasher detergent, coffee, pet food, paper goods. Hypothesis: Defer + Add-pill with single collapsed pill.
- **Per-serving / per-use** — supplements (already done), coffee dosage, pre-workout (handler-gated), pet food meals. Hypothesis: Defer + Add-pill.

Opus session. Synthesis work; Phase 1.5 lowered per-entry overhead but the grouping decisions are novel.

### Path B — SPECULATIVE entry verification (Phase 2 prep)

If Phase 2 feels too big for one session: pick 2–4 catalog SPECULATIVE entries (especially those with `posture-hypothesis` tags) and run verification searches against Amazon. Outputs firm up the hypotheses and give Phase 2 more confident inputs. Sonnet-able if the verification questions are kept tight, but the judgment of what counts as verification probably warrants Opus.

### Track 1 alternative — Phase 8B residue

If energy is low for design work: pick up Option 1 test suite (Tests 9–17, cross-tab sync, merge-gap, no-bridge fallback), Test 1 regression, or panel purple styling. All Sonnet/Haiku territory once design questions are settled. Standing reminder from Chats 92–96.

---

## State of the project

| File | Version | Status |
|---|---|---|
| `manifest.json` | v0.6.2 | Unchanged since Chat 92 |
| `background.js` | v0.6.1.19 | Unchanged |
| `core.js` | v0.6.1.54 | Unchanged |
| `search.js` | v0.6.2.1 | Unchanged. `isServingWeight()` verified Chat 96. |
| `compare.html` | compare-v1.1.0 | Unchanged |
| `content/page/compare-bridge.js` | bridge-v1.0.0 | Unchanged |

No code touched in Chats 93–97. Code work resumes when Phase 8B testing or unit-collision implementation kicks off.

### Design docs

| Doc | Status |
|---|---|
| `Override_Principle.md` | Locked Chat 96. Commit and use. |
| `Servings_Design.md` | Locked Chat 96. Commit and use. |
| `Demotion_Display.md` | Locked Chat 96. Commit and use. |
| `Design_System.md` | Partial, Chat 96. Commit and use; extend in future design sessions only. |
| `Unit_Catalog_Phase1.md` | **Updated Chat 97.** Phase 1.5 posture tags applied. |
| `bug-test.md` | **Updated Chat 97.** Toothpaste verdict reconciled. |
| `Panel_Redesign_Spec.md` | §3 palette canonical. §5.7, §8.3 stale. |

---

## Process notes for Chat 98

- **Memory guards #4–#9 remain in force.** Chat 97 was straightforward and didn't stress any of them, but they continue to apply.
- **Opus is the right model** for Phase 2 taxonomy. The catalog's posture tags reduce per-entry friction but the grouping synthesis is design judgment.
- **Pairs note redesign is still Phase 4, not now.** Standing reminder from Chats 92–96.
- **Memory rule #3 (server-deployment commit before testing)** remains active for code work but isn't relevant to design-track sessions.

---

## Known issues to keep in mind (unchanged)

- Compare.html Option 1 test suite incomplete — separate session, Sonnet or Haiku.
- Panel note area purple/indigo styling — separate session.
- Panel textarea closes prematurely (Test 1) — separate session.

---

## GitHub commit message

```
Chat 97: Phase 1.5 catalog posture tagging + bug-test.md reconciliation

Phase 1.5a — 13 firm posture tags on VERIFIED entries in
Unit_Catalog_Phase1.md:
- 8 category-level postures (Defer, Override-suppress, Override-
  recategorize, Defer+Add-pill, Defer+Note combinations)
- 5 N/A entries (parse bugs, arithmetic bug, formatting issue,
  detection carve-outs — not category collisions)

Phase 1.5b — 7 posture-hypothesis tags on SPECULATIVE entries
covered by the Override_Principle case table (cross-stitch,
bedding thread count, fishing line lb, screen size, aquarium L,
trash bag gallons, cookware piece sets).

bug-test.md — toothpaste verdict reconciled in both spots
(Apr 29 log row + known-tricky-cases entry) to reflect the
Chat 96 Defer call. Earlier "needs solid override" framing
annotated as superseded.

No code changes. No new design questions surfaced.
```

---

## Push reminder

After committing and pushing:
- Update project knowledge with the new versions of `Unit_Catalog_Phase1.md` and `bug-test.md`.
- Update project knowledge with the new Briefing, Roadmap, Changelog, and Handover.

---

## A note to Melissa

This session was the mechanical follow-through the Chat 96 framework was designed to enable. The case table did most of the work; Phase 1.5 just transcribed it into the catalog at the entry level, with the bug-vs-posture distinction made explicit.

The one judgment call worth noting: tagging the five non-collision entries as `Posture: N/A` rather than forcing a posture onto them. Parse bugs, arithmetic bugs, formatting issues, and detection carve-outs aren't collisions, and pretending otherwise would have muddled the framework. The N/A tags say "this entry is real and verified, but it lives in a different repair queue."

Phase 2 has the inputs it needs. The catalog's verified-with-firm-posture entries are the testbed; case-table-covered SPECULATIVE entries are the next ring out. Beyond that lie the genuinely speculative entries (mug capacity, glove weight class, syringe ml, body weight ranges, etc.) — those are the ones Phase 2 has to decide on, and Phase 1.5 deliberately didn't pre-commit them.

---

*End of handover.*
