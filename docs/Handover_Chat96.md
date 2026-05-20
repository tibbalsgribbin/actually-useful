# Handover — Chat 96 → Chat 97

*May 20, 2026 · Opus*

*Doc consolidation session. The four Chat 94 design docs became three locked design docs plus a partial Design System doc. Trust_Postures.md discarded. `isServingWeight()` verified against actual code. Consumption-unit equivalence principle surfaced from a laundry-detergent question and folded into Override_Principle. No code changes. Briefing rolled up Chats 93–96 (it had been at Chat 92).*

---

## What's locked now

The trust posture framework is consolidated and locked. Three canonical docs:

- **`Override_Principle.md`** — the design spine. Four postures (defer, override, add-pill, note), how they relate, the decision tree, the case table, the handler table.
- **`Servings_Design.md`** — canonical worked example of the add-pill posture.
- **`Demotion_Display.md`** — visual layer of the postures. Tier is determined by what the listing supplies in the current sort, not by its posture.

Three principles worth pinning explicitly because they took the most work to surface:

1. **Add-pill and recategorize are mutually exclusive.** Trigger: "is Amazon's PPU meaningful to keep available?" Yes → defer (plus add-pill if applicable). No → recategorize or suppress.
2. **Add-pill is plural by default.** A title supporting three meaningful units gets three pills, not one.
3. **Consumption-unit equivalence.** Multiple title units describing the same consumption unit (laundry sheet/pod/tab/load) collapse into one pill, not multiple. This is already how AU handles it in code via the "per item" pill in search.js.

The demote trigger from `Demotion_Display.md`: a listing demotes when it can't supply the currently-sorted unit. Not when its preferred unit doesn't match. Direction matters.

---

## What Chat 97 needs to do

Two reasonable next steps. Melissa picks based on energy.

### Path A — Phase 1.5: catalog posture tagging

Apply trust posture tags to every VERIFIED entry in `Unit_Catalog_Phase1.md`. Tag values: `defer`, `override-suppress`, `override-recategorize`, `add-pill`, `note`, and combinations (`defer + add-pill`, `defer + note`, `defer + add-pill + note`).

Mechanical work, lower judgment cost. Outputs feed into Phase 2.

Could also be a self-contained Sonnet session if the rules are tight enough — though the judgment calls (especially around speculative entries) probably warrant Opus.

### Path B — Phase 2 kickoff: taxonomy

Group verified collisions by shape. Each shape maps to one or more postures. This is design-judgment work and warrants Opus. Phase 2 produces input to Phase 3 (detection rules).

If Phase 1.5 is done first, Phase 2 gets richer input. Recommended ordering: A then B.

### Other options if energy is low

- **Track 1 (Phase 8B residue)**: complete Option 1 test suite (Tests 9–17, cross-tab sync, merge-gap, no-bridge fallback). Sonnet/Haiku. Test 1 + panel styling investigation can also be picked up here.
- **Design System verification**: audit production CSS vs the mockups' font choices to reconcile "Inter Tight" / "Source Serif 4" before either is treated as canonical.

---

## State of the project

| File | Version | Status |
|---|---|---|
| `manifest.json` | v0.6.2 | Unchanged since Chat 92 |
| `background.js` | v0.6.1.19 | Unchanged |
| `core.js` | v0.6.1.54 | Unchanged |
| `search.js` | v0.6.2.1 | Unchanged. `isServingWeight()` verified Chat 96 at lines 974–977. |
| `compare.html` | compare-v1.1.0 | Unchanged |
| `content/page/compare-bridge.js` | bridge-v1.0.0 | Unchanged |

No code touched in Chats 93–96. Code work resumes when Phase 8B testing or unit-collision implementation kicks off.

### Design docs

| Doc | Status |
|---|---|
| `Override_Principle.md` | **Locked Chat 96.** Commit and use. |
| `Servings_Design.md` | **Locked Chat 96.** Commit and use. |
| `Demotion_Display.md` | **Locked Chat 96.** Commit and use. |
| `Design_System.md` | **Partial, Chat 96.** Commit and use; extend in future design sessions only. |
| `Trust_Postures.md` | **Discard.** Should be removed from project knowledge after the GitHub push. |
| `Unit_Catalog_Phase1.md` | Posture tagging pending (Phase 1.5) |
| `Panel_Redesign_Spec.md` | §3 palette canonical. §5.7, §8.3 stale. |

---

## Process notes for Chat 97

- **Memory guards #4–#9 are in force.** Chat 96 was the first session running with these. They fired correctly and visibly:
  - Guard #5 (announce doc creation by name) was followed for all five docs created/edited this session.
  - Guard #6 (cross-check related docs) drove the post-write grep cross-checks for vocabulary, cookware classification, and supplement classification.
  - Guard #7 (verify clean-mapping claims) caught and corrected the "each posture lands in exactly one tier" claim in Demotion_Display.
  - Guard #8 (don't state code behavior without checking) drove the `isServingWeight()` verification and the laundry-units verification. Both produced findings the design docs needed.
  - Guard #4 (read unfamiliar files) didn't get tested this session — no unfamiliar files surfaced. It remains in force.
- **Opus is the right model** for Phase 2 taxonomy or for posture tagging where judgment is needed. Sonnet could handle Phase 1.5 if the rules are kept tight.
- **Pairs note redesign is still Phase 4, not now.** Standing reminder from Chat 92/93/94/95 handovers.
- **Memory rule #3 (server-deployment commit before testing) remains active** for code work but isn't relevant to design-track sessions.

---

## Known issues to keep in mind (unchanged)

- Compare.html Option 1 test suite incomplete — separate session, Sonnet or Haiku.
- Panel note area purple/indigo styling — separate session.
- Panel textarea closes prematurely (Test 1) — separate session.

---

## GitHub commit message

```
Chat 96: Trust posture consolidation + Design System (partial)

Three locked design docs replace the four Chat 94 drafts:
- Override_Principle.md (edited): decision tree, mutually-exclusive
  recategorize/add-pill, add-pill plural by default, consumption-unit
  equivalence, updated case table.
- Servings_Design.md (edited): defer+add-pill framing, multi-pack
  plurality, isServingWeight code verified against search.js lines
  974–977, defensive-handler clarification.
- Demotion_Display.md (edited): tier determined by what the listing
  supplies, not by its posture; reversed demote trigger; restructured
  worked examples.

New Design_System.md (partial): palette, fonts, opacity, (?) icon
consolidated from existing docs. Spacing/buttons/etc. TBD.

Trust_Postures.md discarded — do not commit. Should be removed from
project knowledge after this push.

Briefing rolled up Chats 93-96 (previous version was Chat 92).

No code changes. Memory guards #4-#9 from Chat 95 fired correctly
in this session.
```

---

## Push reminder

After committing and pushing:
- Remove `Trust_Postures.md` from project knowledge in Claude.
- Update project knowledge with the new versions of `Override_Principle.md`, `Servings_Design.md`, `Demotion_Display.md`.
- Add the new `Design_System.md` to project knowledge.
- Update project knowledge with the new Briefing, Roadmap, Changelog, and Handover.

---

## A note to Melissa

The audit framework from Chat 95 held up under the consolidation. Each of the ten findings either resolved cleanly into the new docs or was bumped to a follow-up (Phase 1.5 catalog tagging, the design-system audit). Nothing surfaced that fundamentally re-opened the framework.

The unexpected payoff was your laundry-detergent question. The consumption-unit equivalence principle was hiding in the existing code the whole time — search.js's "per item" pill has been doing it correctly for a while — but none of the design docs had named the principle. Now it's named, and it should make Phase 3 detection-rule design cleaner: plurality and equivalence operate at different levels and don't interfere.

The Design System doc is a half-step, deliberately. Producing a complete style guide would have been design work, not consolidation work. What's there should reduce drift on the basics; the explicit "TBD" sections are an invitation for Sonnet to surface gaps rather than invent.

---

*End of handover.*
