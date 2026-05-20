# Changelog — Chat 95

*May 20, 2026*

*Opus audit session following Chat 94's halt. Full audit of the four Chat 94 design docs. Finding #9 (recategorize-vs-add-pill conceptual fuzziness) resolved in chat; resolution also closes findings #5 and #6. Six process guards committed to Claude's memory. No code changes; no design docs edited (consolidation deferred to Chat 96).*

---

## Delivered

### Audit of Chat 94 design docs

Reviewed all four docs (`Trust_Postures.md`, `Override_Principle.md`, `Servings_Design.md`, `Demotion_Display.md`) with fresh eyes per the Chat 94 handover plan. Ten findings surfaced:

- 4 confirmed from the Chat 94 handover: doc overlap, "alt-pill" vs "add-pill" vocabulary drift, Trust_Postures mis-dated to Chat 93, Trust_Postures not referenced by the others.
- 6 new in Chat 95: cookware classification contradiction, supplement posture contradiction, Demotion_Display's contradicted "exactly one tier" claim, bundle and variety pack coverage gaps in Override, recategorize-vs-add-pill conceptual fuzziness, unverified `isServingWeight()` claim in Servings_Design.

Full findings list with resolution status in `Handover_Chat95.md`.

### Chat 94 transcript review

Read the full Chat 94 conversation transcript end-to-end. Confirmed several findings trace to under-specified conversational decisions (cookware suppress-vs-recategorize and supplement posture were never pinned down in chat) rather than pure doc drift. Analyzed the Trust_Postures-forgetting failure mode in three layers: silent doc creation, no cross-check before writing Override, confident misattribution when noticing the unfamiliar file.

### Resolution of finding #9 (recategorize vs add-pill)

Mutually exclusive postures with a clean trigger:

- **Recategorize**: AU replaces Amazon's PPU. Original unit no longer available.
- **Add-pill**: AU adds a unit alongside. Amazon's PPU stays available.

Trigger: *is Amazon's PPU meaningful to keep available?* If yes, add-pill. If no, recategorize.

Resolution also closes findings #5 (cookware is override-suppress, not recategorize) and #6 (supplements is just add-pill, not "add-pill + override-recategorize").

### Generalization: add-pill is plural by default

Surfaced from Melissa's question about yarn multi-packs. Add-pill triggers wherever the title contains a meaningful comparison unit not currently offered — and several units can apply to one listing. Worked examples: yarn multi-pack ($/yard + $/ct + Amazon default), supplements multi-pack ($/serving + $/tub + Amazon default), embroidery floss 6-pack ($/skein + $/yard + Amazon default).

### Demote-trigger reversal in Demotion_Display (pending application)

Current Demotion_Display rule demotes listings whose preferred unit doesn't match the sort. Correct rule: demote listings that can't supply the currently-sorted unit. Direction reversed. Pending application in Chat 96 consolidation.

### Six process guards committed to memory

Added as memory_user_edits #4–#9:

- #4: Read unfamiliar files before claiming provenance.
- #5: Announce doc creation in chat by name.
- #6: Cross-check related docs while writing them.
- #7: Verify "clean mapping" claims against the doc's own cases.
- #8: Don't state current code behavior without checking the code.
- #9: Pin terminology once per session and reuse exactly.

---

## New issues surfaced this session

None. The session was retrospective audit work. No new code bugs, no new design problems beyond those already in the four Chat 94 docs.

---

## Not changed

`manifest.json`, `background.js`, `core.js`, `search.js`, `styles.css`, `compare.html`, `privacy.html`, `content/page/compare-bridge.js`, `Unit_Catalog_Phase1.md` — all unchanged.

Four Chat 94 design docs (`Trust_Postures.md`, `Override_Principle.md`, `Servings_Design.md`, `Demotion_Display.md`) remain in project knowledge as-is. Consolidation deferred to Chat 96.

---

*End of Chat 95 changelog.*
