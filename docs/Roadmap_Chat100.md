# Roadmap — Chat 100

*Updated end of Chat 100. Phase 3-prep verification round 2: boxing gloves added (Shape A confirmed); Chat 99 verifications re-run with AU extension on and corrected (Shape A confirmed in all three cases). Major reframe — Shape A collisions are AU-sourced, not Amazon-sourced. N1/N2 promotion deferred. New roadmap item: broader AU-accuracy review.*

*May 21, 2026*

---

## Active work streams

Two parallel tracks. Sessions pick based on what's queued and what energy is available; they don't block each other.

1. **Phase 8B residue** — Option 1 test suite completion, Share Redesign, panel styling cleanup, Test 1 regression. Sonnet/Haiku territory once design questions are settled.
2. **Unit-collision design** — Phase 1 catalog (Chat 93), trust posture framework (Chat 96), Phase 1.5 catalog tagging (Chat 97), Phase 2 taxonomy (Chat 98), Phase 3-prep verification (rounds 1+2, Chats 99–100), Phase 3 detection rules, Phase 4 ambiguity-note redesign. Opus design work; eventual Sonnet implementation.

---

## Immediate — next session (Chat 101)

**Track: unit-collision design.**

### Phase 3-prep — first Shape F verification (recommended)

Chat 100 surfaced that the verification methodology has been looking at Amazon's behavior when the deliverable is AU's behavior. Shape F is the canonical defer case — categories where AU should correctly *not* override anything. Verifying a Shape F entry tests whether the corrected methodology (check AU's output, not just Amazon's) holds in a "should defer" scenario.

**Best candidates:**

- **Deodorant or lotion** — semi-solid personal care, the canonical Shape F prediction. Test: do all listings on the page use the same convention (fl oz, oz) so that AU's $/oz comparison still works even though it's technically imprecise? And does AU defer correctly, or does it produce something weird?
- **Canned soup or canned beans** — pourable/semi-solid foods, the other Shape F prediction.

**Mode:** observational + interactive, but with the corrected lens — check both Amazon's PPU output AND AU's compare.html output / telemetry. The Chat 100 re-check pattern (compare.html export + telemetry unit-family breakdown) is the established methodology.

**Model recommendation:** Opus. Shape F is the first verification in a defer category — interpretation work, not mechanical.

### Continue Shape A queue

If Shape F lands quickly, take another Shape A candidate. Highest-priority queue items:

- **Weighted vest lb** — close to the VERIFIED dumbbell collision. Tests whether AU's `isMultiPackWeight()` guard fires for weighted vests (blocking pack-multiplication but not $/lb), same as dumbbells.
- **Body weight ranges (kg, lb)** — pet harness, dog/cat size ratings. AU may or may not have a guard for this; would be useful to know.
- **Empty product weight kg** — appliances, furniture. Spec-rating-as-quantity with kg.

Each verification now follows the corrected methodology: check Amazon's PPU output (for completeness and to update N1/N2 instance counts), then check AU's compare.html output / telemetry to determine whether the Shape A collision is present on AU's side.

### Alternative — broader AU-accuracy review (new, deferred)

Chat 100's discovery showed AU's own detector accuracy is less established than the project had assumed. A separate review pass might be worth scoping:

- How many of AU's existing detectors have been verified against live Amazon results?
- Are there detector categories where AU produces PPU when Amazon doesn't (Shape A pattern), and is this a systematic issue or limited to spec-rating-as-quantity?
- Is the verification methodology itself complete, or does it need a parallel AU-only track?

**Recommendation: don't take this on yet.** It's a phase-design conversation, not a verification session. Hold for after a few more Shape verifications give us a clearer sense of how often AU is the collision source vs. Amazon. Chat 102 or later, probably.

### Track 1 alternative

If energy is low for design work: pick up Phase 8B residue (Option 1 test suite, panel purple styling investigation, Test 1 regression).

---

## Phase 8B residue — gated on energy/availability

Carried forward from Chat 92. Not touched in Chats 93–100 (design-track sessions).

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
| Phase 3-prep — Verification round 1 | Done (Chat 99) | 2 Shape A entries verified at Amazon level |
| Phase 3-prep — Verification round 2 | Done (Chat 100) | Boxing gloves added; Chat 99 entries re-verified at AU level; Shape A confirmed 3/3 |
| Phase 3-prep — Verification round 3+ | Pending | First Shape F verification + continued Shape A queue |
| Phase 3-prep — Broader AU-accuracy review | Pending (new, Chat 100) | Held for after more shape verifications |
| Phase 3 — Detection rules | Gated on verification | Per-detector design; ~12-15 detectors estimated. Now informed by "is AU the collision source?" question, not just "is Amazon?" |
| Phase 4 — Ambiguity-note redesign | Pending | `applyPairsNote` rewrite + generalized note pattern |

---

## Locked design docs (do not edit in routine sessions)

- `Override_Principle.md` — design spine, four trust postures. Locked Chat 96.
- `Servings_Design.md` — canonical add-pill worked example. Locked Chat 96.
- `Demotion_Display.md` — visual layer of trust postures. Locked Chat 96.
- `Design_System.md` — partial, Chat 96. Extend only in dedicated design sessions.

---

## Verification queue snapshot

Carried forward from `Phase2_Taxonomy.md` Phase 3-prep verification queue. Updated to reflect Chat 99 + Chat 100 progress.

**Verified (Shape A confirmed, all three AU-sourced):**
- Fishing sinkers oz — Amazon omits PPU (N1); AU computes $/oz for 36/178 listings.
- Fishing line lb test — Amazon computes $/foot from spool length (N2); AU computes $/lb for 37/162 listings.
- Boxing gloves oz — Amazon omits PPU (N1, 3rd instance); AU computes $/oz from title weight.

**Highest-priority next:**
- Shape F: semi-solid personal care or pourable food (first defer-case verification).
- Shape A: weighted vest lb (close to VERIFIED dumbbell) OR body weight ranges OR empty product weight kg.

**Other Shape A candidates still queued:** kg load capacity, focal length mm, screen size variants.

**Shape B–E and possible-new-shapes lists** unchanged from `Phase2_Taxonomy.md`.

---

## Process reminders

- Verification mode is observational, not synthetic. Single-search results yield verification notes, not status changes (Memory guard #19).
- Verification now requires checking BOTH Amazon's PPU output AND AU's compare.html / telemetry output. Looking at only one is incomplete.
- N1/N2 outcome patterns describe Amazon's behavior. They do not by themselves indicate that an override is unnecessary — that depends on AU's behavior.
- Catalog entries stay SPECULATIVE until "confirmed across reasonable variation." Three instances of a shape across categories is signal, but not yet promotion-grade.
- Always include recommendations with justifications when offering Melissa choices (Memory guard #18).
- Cross-check related docs when writing one (Memory guard #6). N1/N2 lives in two places in `Phase2_Taxonomy.md` now (Shape A findings + cross-shape working note); changes to one need a check on the other.
- Read the actual file in the session, not from memory of prior sessions (Memory guard #4 + #8). Project knowledge may be stale.
