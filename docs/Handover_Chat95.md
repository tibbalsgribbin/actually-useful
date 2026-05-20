# Handover — Chat 95 → Chat 96

*May 20, 2026 · Opus*

*Audit session following Chat 94's halt. Outcomes: ten audit findings reviewed and documented; finding #9 (recategorize-vs-add-pill conceptual fuzziness) resolved with implications for #5 and #6; six process guards committed to memory. The four design docs from Chat 94 remain in project knowledge but un-committed, pending consolidation in Chat 96. No code changes this session.*

---

## Why this session happened

Chat 94 was halted after a context-loss error: I created `Trust_Postures.md` early in the session, forgot it existed, wrote `Override_Principle.md` from scratch covering substantially the same content, and then confidently misidentified Trust_Postures as stale from a previous session. Melissa halted before any of the four design docs (`Trust_Postures.md`, `Override_Principle.md`, `Servings_Design.md`, `Demotion_Display.md`) were saved or committed.

Chat 95 was scoped to do the audit the halt called for: fresh-eyes review of all four docs, identification of contradictions and vocabulary drift, and a decision about how to proceed with the design work.

---

## What this session accomplished

1. **Full audit of the four Chat 94 docs.** Confirmed the four findings already named in Chat 94's handover. Found six additional issues.
2. **Read the Chat 94 transcript end-to-end.** Traced the origins of several findings (cookware and supplement posture contradictions were under-specified in conversation, not just doc drift) and analyzed the context-loss failure mode.
3. **Committed six process guards to Claude's memory.** These persist across sessions and are now in force.
4. **Resolved finding #9** (the recategorize-vs-add-pill conceptual fuzziness) in chat discussion. The resolution also closes findings #5 (cookware classification) and #6 (supplement posture).
5. **Generalized the add-pill posture** based on Melissa's multi-pack observation: add-pill is plural by default, surfacing every meaningful unit the title supports.

No code was touched. No design docs were edited or rewritten — that work was deferred to Chat 96.

---

## The ten audit findings and their status

Numbered in the order they were surfaced, not in priority order.

### Confirmed from the Chat 94 handover

1. **Substantial overlap** between `Trust_Postures.md` and `Override_Principle.md`. They define the same four postures. Override is more thorough; Trust has a "How to choose" decision tree Override doesn't. — *Status: resolved framing-wise; action pending in Chat 96.*
2. **Vocabulary drift**: Trust uses "alt-pill"; the other three use "add-pill". — *Action pending: standardize on "add-pill" in Chat 96.*
3. **Mis-dating**: Trust_Postures.md header says "Chat 93"; it was created in Chat 94. — *Action pending: discard the doc in Chat 96 (per finding #1 resolution).*
4. **Trust_Postures is not referenced** by the other three docs. — *Resolved by discarding Trust_Postures in Chat 96.*

### Newly found in Chat 95

5. **Cookware classification contradiction**: Trust used cookware as the recategorize example; Override's case table classified cookware as suppress. — *Resolved by #9 resolution: cookware is override-suppress (no good replacement unit). Trust_Postures had it wrong.*
6. **Supplement posture contradiction between Servings_Design and Demotion_Display**: Servings framed supplements as "add-pill + override-recategorize"; Demotion treated supplements as override-suppress with soft-demote in $/g sort. — *Resolved by #9 resolution: supplements is just add-pill. $/g stays as a valid pill; $/serving is added.*
7. **Demotion_Display claim "each posture lands in exactly one tier" is contradicted by its own content**: override-suppress was placed in both Soft and Hard tiers. — *Action pending: Chat 96 to fix the claim and clarify the tier-split.*
8. **Coverage gaps in Override_Principle's case table**: bundles and variety packs (introduced after Override was written) never got posture tags in Override. — *Action pending: Chat 96 to add them. Tentative tagging: bundles = override-suppress, variety packs = note.*
9. **Recategorize-vs-add-pill conceptual fuzziness**: Both involve pulling a different unit from the title. Servings_Design's "add-pill + override-recategorize" combination muddled the distinction. — *Resolved in chat (see next section).*
10. **Unverified claim about `isServingWeight()`**: Servings_Design line 110 asserts the handler's current logic (100g threshold + supplement keywords) without code check. — *Action pending: Chat 96 to verify against actual code before propagating.*

---

## The #9 resolution and its implications

The distinction that holds across cases:

- **Recategorize**: AU *replaces* Amazon's PPU. Original unit no longer available as a pill choice.
- **Add-pill**: AU *adds* a unit alongside. Amazon's PPU stays available; user can switch.

These are mutually exclusive postures, not combinable. The trigger for choosing: **is Amazon's PPU meaningful to keep available?**

- Amazon's unit fine, just not maximally useful → add-pill (augment)
- Amazon's unit misleading or meaningless → recategorize (replace)

### Add-pill is plural by default

Surfaced in conversation: add-pill isn't "one unit per category." AU adds *every* meaningful comparison unit the title supports. Worked examples:

| Listing | Pills shown |
|---|---|
| Yarn (single skein) | $/yard + Amazon default. $/ct meaningless with count of 1. |
| Yarn (multi-pack) | $/yard + $/ct + Amazon default. |
| Embroidery floss (6-pack) | $/skein + $/yard + Amazon default. |
| Ribbon multi-roll | $/roll + $/yard + Amazon default. |
| Supplements (single tub) | $/serving + Amazon default. |
| Supplements (multi-pack) | $/serving + $/tub + Amazon default. |

The principle: add-pill triggers wherever the title contains data for a meaningful comparison unit not currently offered. Number of pills depends on how much useful data is in the title.

### Reclassifications under the resolution

| Case | Posture | Notes |
|---|---|---|
| Trash bags "13 gallon" | Recategorize | $/gallon-as-capacity replaced with $/bag. |
| Yarn | Add-pill | $/oz fine; add $/yard (plus $/ct for multi-packs). |
| Supplements | Add-pill | $/g fine; add $/serving. *Not* "add-pill + override-recategorize" as Servings_Design framed it. |
| Detergent loads | Add-pill or defer | If Amazon shows $/oz, add $/load. If $/load, defer. |
| Cookware "10 piece set" | Override-suppress | No good replacement unit; $/set is trivially price. |

### Demote-trigger reversal in Demotion_Display

Current (incorrect) framing in Demotion_Display: "Supplement in $/g sort soft-demotes with 'by serving' badge" — i.e., the listing's *preferred* unit not matching the sort triggers demote.

Correct framing: a listing is demoted when *it can't supply the currently-sorted unit*. So:
- Supplement *with* serving data in $/g sort → no demote ($/g is available).
- Supplement *without* serving data in $/serving sort → demote (can't supply $/serving).
- Bundle in $/load sort → demote (can't supply meaningful $/load).
- Cookware in any per-piece sort → demote (no meaningful per-piece value).

The direction matters. Chat 96 needs to flip this in Demotion_Display.

---

## Guards now in force (committed to memory)

Six process rules added to memory_user_edits as #4–#9. They apply across all future sessions, not just AU work:

4. **Unfamiliar files**: read before claiming provenance. Never assert "probably stale from earlier session" without checking.
5. **Announce doc creation in chat** by name (e.g., "Writing Override_Principle.md now"). Makes outputs auditable from the transcript.
6. **Cross-check related docs while writing them**. Re-read earlier docs explicitly when writing later ones. Verify posture assignments, example classifications, vocabulary across the set.
7. **Verify "clean mapping" claims** ("1:1," "exactly one") against the doc's own enumerated cases before stating them.
8. **Don't state current code behavior without checking the code** in the current session. Function logic, thresholds, gating conditions all need verification.
9. **Pin terminology once per session and reuse exactly.** No drift between "add-pill" / "alt-pill" / "add pill" mid-session.

Of these, #5 is the one most directly aimed at the Trust_Postures failure mode. #8 is the one I've now broken twice in two sessions (Chat 93 Phase 4 Problem 4 retrospective and Chat 94 isServingWeight claim) — worth watching to see whether memory alone is enough.

---

## What Chat 96 needs to do

### Priority 1: Doc consolidation using the resolved framing

The four Chat 94 docs are in project knowledge as-is (no edits in Chat 95). Recommended actions:

**`Trust_Postures.md`** — Discard. Salvage the "How to choose" decision tree (steps 1–4 from its section "How to choose") into Override_Principle.md.

**`Override_Principle.md`** — Edit. Specifically:
- Add the decision tree from Trust_Postures.
- Pin the recategorize-vs-add-pill distinction per the #9 resolution. Mutually exclusive; trigger is "is Amazon's PPU meaningful to keep available?"
- Update the case table: cookware → suppress (was correct), add bundle (override-suppress) and variety pack (note), correct supplements to just add-pill.
- Generalize add-pill to plural. Existing wording ("alongside or instead of Amazon's PPU") needs tightening to remove the "or instead of" overlap with recategorize.
- Standardize vocabulary on "add-pill" with a hyphen.

**`Servings_Design.md`** — Edit. Specifically:
- Remove the "add-pill + override-recategorize" framing. Supplements is just add-pill.
- Verify the isServingWeight() claim (100g threshold + supplement keywords) against actual code before treating as fact.
- Generalize the doc beyond servings — the multi-pack discussion from Chat 95 means $/ct and $/serving co-exist for multi-pack supplements, same as $/ct and $/yard for multi-pack yarn. Either fold this into the doc or note that add-pill plurality is the general pattern.

**`Demotion_Display.md`** — Edit. Specifically:
- Remove the "each posture lands in exactly one tier" claim. Override-suppress straddles Soft and Hard tiers based on whether a recoverable alternative exists. Either name the sub-cases explicitly (soft-suppress vs hard-suppress) or restructure the tier discussion around "can the listing supply *some* meaningful PPU somewhere" rather than per-posture.
- Reverse the demote trigger per #9 resolution: demote listings that can't supply the currently-sorted unit, not listings whose preferred unit isn't the current sort.
- Reconcile the supplement worked example. Under the new framing, a supplement with serving data in $/g sort does *not* demote.

### Priority 2: Update Unit_Catalog_Phase1.md (optional this session)

The catalog from Chat 93 needs posture tags applied. This was on the Chat 93 → Chat 94 plan and got displaced by the design discussion. With the resolution in hand, Chat 96 could either:

- Do the tagging immediately after consolidation, in the same session.
- Defer to Chat 97 to keep Chat 96 focused on the design docs.

Depends on energy and context after consolidation completes.

### Priority 3 (do NOT skip ahead to): verification searches, Phase 2 taxonomy

Still valid downstream work from Chat 93. Should not be picked up until consolidation is done.

---

## State of the project

| File | Version | Status |
|---|---|---|
| `manifest.json` | v0.6.2 | Unchanged |
| `background.js` | v0.6.1.19 | Unchanged |
| `core.js` | v0.6.1.54 | Unchanged |
| `search.js` | v0.6.2.1 | Unchanged |
| `compare.html` | compare-v1.1.0 | Unchanged |
| `content/page/compare-bridge.js` | bridge-v1.0.0 | Unchanged |

No code touched in Chat 94 or Chat 95. Code work resumes when Phase 8B testing or unit-collision implementation kicks off.

### Status of the four Chat 94 design docs

All four are in project knowledge but un-committed to GitHub. They should remain that way until Chat 96 produces consolidated versions, at which point:

- `Trust_Postures.md` → delete (do not commit at any point)
- `Override_Principle.md` → commit the consolidated version
- `Servings_Design.md` → commit the consolidated version
- `Demotion_Display.md` → commit the consolidated version

---

## Process notes for Chat 96

- **Opus is the right model** for the consolidation work. Each doc requires careful cross-referencing against the resolved framing and the other docs — exactly the judgment-heavy synthesis Opus is good at.
- **Guard #5 (announce doc creation) is in force.** Every doc creation should be named in chat before/during the write. This audit is also a test of whether memory edits actually change behavior.
- **Guard #6 (cross-check related docs) applies directly.** When editing Override, re-read Servings and Demotion. When editing Servings, re-read Override and Demotion. The contradictions in this set came from writing them serially without cross-reference; the consolidation pass needs to actively counter that pattern.
- **Estimated session shape**: one focused Opus session for the doc consolidation. If the catalog tagging is folded in, two sessions.
- **Memory rule #3 (server-deployment commit before testing) remains active** for code work but isn't relevant to Chat 96's consolidation work.
- **Pairs note redesign is still Phase 4, not now.** Standing reminder from Chat 92/93/94 handovers.

---

## Known issues to keep in mind (unchanged from Chat 92/93/94)

- Compare.html Option 1 test suite incomplete — separate session, Sonnet or Haiku.
- Panel note area purple/indigo styling — separate session.
- Panel textarea closes prematurely (Test 1) — separate session.

---

## GitHub commit message

For this session's docs:

```
Chat 95: Audit of Chat 94 design docs + process guards

- Handover_Chat95.md: full bridge to Chat 96 with audit findings,
  #9 resolution, and consolidation plan
- changelog_entry_chat95.md: session summary
- Roadmap_Chat95.md: updated Roadmap with unit-collision design
  track section

Six process guards committed to Claude's memory (not GitHub):
unfamiliar-file handling, doc creation announcements, cross-doc
cross-checking, clean-mapping verification, code-behavior
verification, terminology pinning.

No code changes. Chat 94 design docs (Trust_Postures, Override_Principle,
Servings_Design, Demotion_Display) remain in project knowledge,
not committed; consolidation pass scheduled for Chat 96.
```

After the push, remember to update project documents in Claude.

---

## A note to Melissa

The halt in Chat 94 was the right call, and this audit confirmed it. The framework underneath the four docs is sound — the four postures hold up, the catalog finding about category-based "what makes a meaningful PPU" remains the spine. The contradictions traced to under-specified decisions made differently in each doc, not to wrong thinking.

The deepest finding from the transcript review wasn't "I forgot a file." It was that I confidently asserted Trust_Postures was stale without checking — that's the moment that needed the halt, and the moment guard #4 is aimed at preventing. Whether it actually prevents recurrence is the test for next session.

---

*End of handover.*
