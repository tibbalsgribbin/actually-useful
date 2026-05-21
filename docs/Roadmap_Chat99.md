# Roadmap — Chat 99

*Updated end of Chat 99. First verification round complete: two Shape A speculative entries verified, both disconfirmed the predicted Override-suppress failure mode. Catalog and taxonomy updated with verification notes and a new "non-failure outcome patterns" section. No code changes.*

*May 21, 2026*

---

## Active work streams

Two parallel tracks. Sessions pick based on what's queued and what energy is available; they don't block each other.

1. **Phase 8B residue** — Option 1 test suite completion, Share Redesign, panel styling cleanup, Test 1 regression. Sonnet/Haiku territory once design questions are settled.
2. **Unit-collision design** — Phase 1 catalog (Chat 93), trust posture framework (Chat 96), Phase 1.5 catalog tagging (Chat 97), Phase 2 taxonomy (Chat 98), Phase 3-prep verification round 1 (Chat 99, partial), Phase 3 detection rules, Phase 4 ambiguity-note redesign. Opus design work; eventual Sonnet implementation.

---

## Immediate — next session (Chat 100)

**Track: unit-collision design.**

### Phase 3-prep verification round 2 (recommended)

Continue the verification queue from `Phase2_Taxonomy.md`. Chat 99 verified two Shape A entries (sinkers oz, fishing line lb test); both surfaced N1 and N2 non-failure outcomes respectively. Two follow-up priorities:

**1. One more Shape A subtype.** Confirm whether N1/N2 patterns extend beyond fishing-category entries. Best candidates:

- **Boxing gloves oz** — different mechanic (paired buyable, single weight class displayed per listing). Tests whether N1/N2 hold in a non-fishing category.
- **Weighted vest lb / dumbbell-like adjacent items** — close to the VERIFIED dumbbell collision; useful to see if Amazon's behavior across "weight class" items is consistent or varies.

If the third Shape A verification also surfaces N1 or N2, that's enough signal to consider promoting these outcome patterns to a formal catalog status tag.

**2. First Shape F verification.** Confirm page-internal-interchangeable-units behavior in a representative category. Best candidates:

- **Deodorant or lotion** — semi-solid personal care, the canonical Shape F prediction.
- **Canned soup or canned beans** — pourable/semi-solid foods, the other Shape F prediction.

Mode is observational and interactive — Melissa drives Amazon, Claude interprets. Same energy profile as Chat 99.

**Model recommendation:** Opus for the third Shape A verification (still interpretive). Sonnet may suffice for Shape F if the Chat 99 pattern repeats and interpretation becomes more mechanical.

### Alternative — promote N1/N2 to formal status

If next verification confirms the pattern with a third example, consider:

- Adding "VERIFIED non-collision (N1)" and "VERIFIED non-collision (N2)" as catalog status options separate from VERIFIED (collision exists) and SPECULATIVE.
- Updating the verification queue presentation in `Phase2_Taxonomy.md` to track which entries have been verified as collisions vs. non-collisions.

Hold this decision for Chat 100; it depends on what verification surfaces.

### Alternative — Phase 3 directly

If verification feels premature or low-yield: start Phase 3 (detection rules) with what the catalog now provides as VERIFIED. Chat 99 actually reduced the urgency of some detector design (Shape A speculative entries may not all need detectors), so Phase 3 inputs are sharper than before — but the verification queue still has Shape F unverified, and Shape F is the canonical defer case. Phase 3 without Shape F verification produces detectors that may misfire on defer-category listings.

Lean against this unless verification really stalls.

### Track 1 alternative

If energy is low for design work: pick up Phase 8B residue (Option 1 test suite, panel purple styling investigation, Test 1 regression).

---

## Phase 8B residue — gated on energy/availability

Carried forward from Chat 92. Not touched in Chats 93–99 (design-track sessions).

- **Option 1 workspace persistence — Tests 9–17.** Test suite incomplete. Cross-tab sync, merge-gap fix, no-bridge fallback all pending.
- **Test 1 regression — panel textarea closes prematurely.** Open since Chat 92.
- **Panel note area purple/indigo styling.** Investigation pending since Chat 92.

Pick up when energy permits. Sonnet or Haiku territory.

---

## Unit-collision design track — full phase list

| Phase | Status | Notes |
|---|---|---|
| Phase 1 — Catalog | Done (Chat 93) | `Unit_Catalog_Phase1.md` |
| Phase 1.5 — Posture tagging | Done (Chat 97) | Posture tags applied to catalog entries |
| Phase 2 — Taxonomy | Done (Chat 98) | `Phase2_Taxonomy.md`, 8 shapes |
| Phase 3-prep — Verification round 1 | Partial (Chat 99) | 2/many Shape A entries verified |
| Phase 3-prep — Verification round 2 | Pending | At least one more Shape A subtype + first Shape F |
| Phase 3 — Detection rules | Gated on verification narrowing | Per-detector design; ~12-15 detectors estimated |
| Phase 4 — Ambiguity-note redesign | Pending | `applyPairsNote` rewrite + generalized note pattern |

---

## Locked design docs (do not edit in routine sessions)

- `Override_Principle.md` — design spine, four trust postures. Locked Chat 96.
- `Servings_Design.md` — canonical add-pill worked example. Locked Chat 96.
- `Demotion_Display.md` — visual layer of trust postures. Locked Chat 96.
- `Design_System.md` — partial, Chat 96. Extend only in dedicated design sessions.

---

## Verification queue snapshot

Carried forward from `Phase2_Taxonomy.md` Phase 3-prep verification queue. Updated to reflect Chat 99 progress.

**Verified Chat 99:**
- Fishing sinkers oz (Shape A) — N1 (Amazon omits PPU).
- Fishing line lb test (Shape A) — N2 (Amazon recategorizes to $/foot).

**Highest-priority next:**
- Shape A: boxing gloves oz OR another non-fishing weight-class entry.
- Shape F: semi-solid personal care or pourable food.

**Other Shape A candidates still queued:** body weight ranges (kg, lb), kg load capacity, empty product weight kg, focal length mm, screen size variants.

**Shape B–E and possible-new-shapes lists** unchanged from `Phase2_Taxonomy.md`.

---

## Process reminders

- Verification mode is observational, not synthetic. Resist the urge to over-interpret single results.
- Catalog entries stay SPECULATIVE until "confirmed across reasonable variation." A single search is a verification note, not a status change.
- N1/N2 outcome patterns are working notes, not framework. Promotion to formal status requires more data.
- Always include recommendations with justifications when offering Melissa choices.
