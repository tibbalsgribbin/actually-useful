# Roadmap — Chat 101

*Updated end of Chat 101. Phase 3-prep verification round 3: first defer-case verifications complete. Deodorant and lotion both confirmed Shape F — AU defers correctly. Separately, brand-detection accuracy issue surfaced from telemetry review (heuristic false positives on legitimate brands). Repositioned: brand-detection accuracy added as a sub-track under the existing broader AU-accuracy review item. Audit path recommendation added.*

*May 21, 2026*

---

## Active work streams

Two parallel tracks. Sessions pick based on what's queued and what energy is available; they don't block each other.

1. **Phase 8B residue** — Option 1 test suite completion, Share Redesign, panel styling cleanup, Test 1 regression. Sonnet/Haiku territory once design questions are settled.
2. **Unit-collision design** — Phase 1 catalog (Chat 93), trust posture framework (Chat 96), Phase 1.5 catalog tagging (Chat 97), Phase 2 taxonomy (Chat 98), Phase 3-prep verification (rounds 1+2+3, Chats 99–101), Phase 3 detection rules, Phase 4 ambiguity-note redesign. Opus design work; eventual Sonnet implementation.

---

## Immediate — next session (Chat 102)

**Track: unit-collision design, with a new strategic question on the table.**

### Path A — Accuracy audit (recommended, but a strategic decision)

Chat 100 found unit-detection accuracy issues (Shape A is AU-sourced, not Amazon-sourced). Chat 101 found brand-detection accuracy issues (heuristic false positives on legitimate brands). Both came from targeted investigation, not synthetic testing. The pattern is consistent: AU's own detector accuracy is less established than the project had assumed, across multiple subsystems.

Two tiers, can be done sequentially or independently:

**Tier 1 — In-family Opus audit.** Dedicated session, Opus 4.7. Focused scope: review specific subsystems (brand detection, unit detection, PPU calculation, telemetry composition) for blind spots, false-positive risks, and gaps between intent and behavior. Outcome: triage-able findings list.

**Tier 2 — Outside-family audit.** GPT-5 (preferred for code) on the same subsystems + the working documents (Phase2_Taxonomy.md, Override_Principle.md, Unit_Catalog_Phase1.md, several recent handovers). Different model-family priors catch issues an in-family review may share. Outcome: a second findings list to compare against the in-family one.

**Recommendation:** Do Opus first for an in-family baseline, then optionally follow with GPT-5. Doing only one — outside-family GPT-5 — is the higher-information path if budget or energy forces a single choice.

**Why this might not be Chat 102's right move:** an audit is a high-information session and the findings list will be hard to act on if energy is low. If the day is high-energy, this is the call. If not, defer.

### Path B — Continue verification queue

Plenty of useful verification work remains. Now follows the corrected methodology (check Amazon AND AU) as standard.

- **Continued Shape F** — canned soup or canned beans (the other Shape F prediction in the taxonomy). Tests whether Shape F holds for pourable/semi-solid foods, not just personal care. Sonnet may suffice now that the framework is settled.
- **Shape A queue** — weighted vest lb (close to VERIFIED dumbbell collision), body weight ranges (kg/lb pet harnesses), empty product weight kg (appliances/furniture). Opus probably wanted for first verification of a Shape A category that might surface a new sub-pattern.

### Path C — Phase 3 detector design (still not recommended)

Phase 3 detector design now has Shape A and Shape F verified (2 of 8 shapes confirmed against the corrected methodology). Other shapes have varying verification status. Phase 3 is still gated on broader verification work.

### Path D — Address brand-detection finding directly (deferrable)

Chat 101 deliberately did not make code changes to the brand-detection system. The fix scope isn't obvious yet:

- **Passlist additions** (NIVEA, DEGREE, ARRID, CRYSTAL, etc.). Band-aid. Doesn't address the structural issue that the passlist can't enumerate every legitimate all-caps brand across every category.
- **Solo-trigger logic change** (require `signalAllCapsInvented` and `signalFakeMashup` to corroborate rather than fire alone). Structural fix. Non-trivial design change that should get dedicated attention.
- **Diagnostic telemetry addition** (separate `topFilteredBrands` into blocklist-source and heuristic-source). Good engineering but it's preparation, not the fix.

The audit (Path A) is the better forum for deciding scope. But if Melissa decides this is urgent, Chat 102 could take it directly. Sonnet/Haiku territory once scope is settled.

### Track 1 alternative

If energy is low for design work: pick up Phase 8B residue (Option 1 test suite, panel purple styling investigation, Test 1 regression).

---

## Phase 8B residue — gated on energy/availability

Carried forward from Chat 92. Not touched in Chats 93–101 (design-track sessions).

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
| Phase 3-prep — Verification round 3 | Done (Chat 101) | First Shape F verifications: deodorant and lotion both confirmed defer |
| Phase 3-prep — Verification round 4+ | Pending | Continue Shape A queue + extend Shape F to pourable/semi-solid foods |
| Phase 3-prep — Broader AU-accuracy review | Pending, audit path recommended (new this session) | Now covers BOTH unit-detection (from Chat 100) and brand-detection (from Chat 101) as sub-tracks |
| Phase 3 — Detection rules | Gated on verification | Per-detector design; ~12-15 detectors estimated. Now informed by "is AU the detector source?" question across multiple subsystems. |
| Phase 4 — Ambiguity-note redesign | Pending | `applyPairsNote` rewrite + generalized note pattern |

---

## Broader AU-accuracy review — sub-tracks (new structure as of Chat 101)

This umbrella item now covers all detector subsystems where AU's own accuracy has been called into question by targeted investigation. Originally framed (Chat 100) around unit-detection only. Expanded (Chat 101) to include brand-detection.

| Sub-track | Surfaced | Status |
|---|---|---|
| **Unit-detection accuracy** | Chat 100 | Shape A is AU-sourced, not Amazon-sourced. Override question shifts from "should we override Amazon's PPU?" to "should we override AU's own detector output?" Audit work pending. |
| **Brand-detection accuracy** | Chat 101 | `signalAllCapsInvented` solo-trigger fires on legitimate brands (NIVEA, DEGREE, ARRID, etc.) due to fashion-focused passlist gaps. `signalFakeMashup` solo-trigger also fires (e.g. Procter). Multi-signal flagging (e.g. Schmidt's) also possibly hitting false positives. Audit work pending. |
| **Telemetry composition** | Chat 101 | Secondary issue from brand-detection investigation: `topFilteredBrands` conflates blocklist-source and heuristic-source flags. Pattern may exist elsewhere in telemetry composition. Audit work pending. |
| **Future sub-tracks** | TBD | Other detector subsystems may surface accuracy issues during future verification or use. |

**Recommended approach:** the in-family Opus audit (Path A above) addresses all current sub-tracks at once. Outside-family follow-up extends across all of them.

---

## Locked design docs (do not edit in routine sessions)

- `Override_Principle.md` — design spine, four trust postures. Locked Chat 96.
- `Servings_Design.md` — canonical add-pill worked example. Locked Chat 96.
- `Demotion_Display.md` — visual layer of trust postures. Locked Chat 96.
- `Design_System.md` — partial, Chat 96. Extend only in dedicated design sessions.

---

## Verification queue snapshot

Carried forward from `Phase2_Taxonomy.md` Phase 3-prep verification queue. Updated to reflect Chat 99 + Chat 100 + Chat 101 progress.

**Verified Shape A (confirmed, all three AU-sourced):**
- Fishing sinkers oz — Amazon omits PPU (N1); AU computes $/oz for 36/178 listings.
- Fishing line lb test — Amazon computes $/foot from spool length (N2); AU computes $/lb for 37/162 listings.
- Boxing gloves oz — Amazon omits PPU (N1, 3rd instance); AU computes $/oz from title weight.

**Verified Shape F (confirmed defer):**
- Deodorant (uniform-PPU defer) — Amazon ~uniform $/oz; AU `as-listed` with oz(192)/226 listings.
- Lotion (mixed-but-coherent defer) — Amazon mixed liquid-dominant; AU `as-listed` with fl oz(123) + oz(35) + ml(5) out of 174 listings.

**Highest-priority next:**
- Shape F: canned soup or canned beans (pourable/semi-solid food defer case).
- Shape A: weighted vest lb (close to VERIFIED dumbbell) OR body weight ranges OR empty product weight kg.

**Other Shape A candidates still queued:** kg load capacity, focal length mm, screen size variants.

**Shape B–E and possible-new-shapes lists** unchanged from `Phase2_Taxonomy.md`.

---

## Process reminders

- Verification mode is observational, not synthetic. Single-search results yield verification notes, not status changes (Memory guard #19).
- Verification requires checking BOTH Amazon's PPU output AND AU's compare.html / telemetry output. Looking at only one is incomplete. (Standing rule #20.)
- N1/N2 outcome patterns describe Amazon's behavior. They do not by themselves indicate that an override is unnecessary — that depends on AU's behavior.
- Catalog entries stay SPECULATIVE until "confirmed across reasonable variation." Three instances of a shape across categories is signal, but not yet promotion-grade.
- Always include recommendations with justifications when offering Melissa choices (Memory guard #18).
- Cross-check related docs when writing one (Memory guard #6).
- Read the actual file in the session, not from memory of prior sessions (Memory guard #4 + #8). Project knowledge may be stale. (Standing rule #21.)
- Telemetry that conflates sources is its own bug class — watch for it. (Standing rule #22, new this session.)
