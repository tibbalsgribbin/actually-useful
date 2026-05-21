# Changelog — Chat 100

*May 21, 2026*

*Opus session. Phase 3-prep verification round 2 — boxing gloves added, and Chat 99 verifications re-run with AU extension on. Result: Shape A collisions are real in all three cases verified so far. Amazon's behavior (patterns N1, N2) does not prevent the collision because AU's own detectors compute the bad PPU independently. Major reframe of what the verification work has been showing. Six doc edits. No code changes.*

---

## Delivered

### Boxing gloves verification (new)

Search: "boxing gloves." Scraped via Instant Data Scraper (raw Amazon page) and re-checked via AU's compare.html export.

- **Amazon level:** No PPU on any boxing glove listing. Pattern N1, third instance.
- **AU level:** AU computes $/oz from the title weight ("8 oz", "12 oz", "16 oz", etc.) and carries the note "ℹ No Amazon unit price — calculated from weight in title." Affected listings sort to the top of compare.html under lowest-PPU sort.

The Shape A collision the catalog predicted is present — sourced by AU rather than Amazon.

### Chat 99 verifications re-run with AU extension on

The Chat 99 verifications scraped Amazon with AU off. Chat 100 re-checked the same searches with AU on, reading the unit-family breakdown from search.js telemetry:

- **Fishing sinkers oz:** AU computes $/oz for 36 of 178 listings (unit breakdown `oz(36)` in telemetry).
- **Fishing line lb test:** AU computes $/lb for 37 of 162 listings (unit breakdown `lb(37)` in telemetry).

Both surface the Shape A collision via AU's own detectors. Amazon's behavior (omitting PPU for sinkers, computing $/foot for fishing line) does not prevent the collision.

### Reframe: Shape A is real, but AU is the source

Three-for-three on Shape A collisions being present in AU's output, regardless of what Amazon does. Chat 99 read the early results as Amazon already handling the case and downgraded Phase 3 detector priority for these entries. That reading was wrong — Chat 99 was looking at Amazon, but the override decisions affect AU's output, and AU has its own detector logic that runs independently.

The override framework still applies. The audience of the override is wider than originally framed: not just "should we override Amazon's PPU?" but also "should we override AU's own detector output?"

### `Unit_Catalog_Phase1.md` — three entries updated

1. **`oz` → Boxing/MMA glove weight class:** new verification note with the Chat 100 finding.
2. **`oz` → Fishing weights/sinkers:** existing Chat 99 note updated with Chat 100 re-check (36/178 listings get $/oz from AU).
3. **`lb` → Fishing line test strength:** existing Chat 99 note updated with Chat 100 re-check (37/162 listings get $/lb from AU).

All three remain SPECULATIVE. The verification notes explicitly state that Phase 3 detector work is needed regardless of Amazon's behavior.

### `Phase2_Taxonomy.md` — three sections updated

1. **Shape A "Verification findings" subsection** rewritten. Now describes the three-instance picture honestly (sinkers, fishing line, boxing gloves all confirm Shape A), names the framework implication (AU-sourced, not Amazon-sourced), and defers the N1/N2 promotion question.

2. **N1/N2 working note** rewritten. Preserves precise definitions of N1 (Amazon omits PPU) and N2 (Amazon recategorizes from title) but corrects the Chat 99 interpretation. New subsections: "What Chat 99 thought they meant" + "What Chat 100 showed they actually mean." Lands at: N1/N2 describe Amazon's behavior only and do not by themselves indicate that an override is unnecessary.

3. **Phase 3-prep verification queue** line for Shape A updated. Sinkers, fishing line, and boxing gloves all marked as verified with "Shape A confirmed, AU-sourced" annotation.

---

## Decisions made

### Re-run Chat 99 verifications with AU on before recording the boxing gloves finding

When boxing gloves showed AU producing the predicted collision, the natural question was whether the same was true for sinkers and fishing line. If yes, Chat 99's "Amazon already handles this" interpretation was wrong across the board. If no, boxing gloves was a one-off. Recording boxing gloves first and asking the question later would have left the docs in a contradictory state. Better to close the loop in one session.

### Defer N1/N2 promotion entirely

Chat 99 handover proposed promoting N1/N2 to formal catalog status after a third verification surfaced the same pattern. Three instances are now observed, so the original criterion is met. But the criterion itself was based on the assumption that N1/N2 = "Amazon already handles this," which Chat 100 disproved. Promotion is held pending a different question: do we need a status tag describing AU's behavior, not Amazon's?

### Verification entries stay SPECULATIVE

Per Memory guard #19, single-search confirmations yield verification notes, not status changes. Even with the AU-level re-check showing the Shape A collision in all three cases, the entries remain SPECULATIVE — VERIFIED status would require confirmation across reasonable variation. The verification notes explicitly carry the AU-collision finding, which is enough signal for Phase 3 detector work without needing a status promotion.

### New roadmap item — broader AU-accuracy review

The boxing gloves discovery showed that AU's own detector accuracy across categories is less established than the project had assumed. The verification queue was designed to verify Amazon's behavior; a parallel verification thread is now needed for AU's behavior. Added to roadmap as a future workstream, not gating current Phase 3 work.

---

## What's not in the catalog yet, but probably should be next session

- Run Shape F verification (semi-solid personal care or pourable food) — first verification of a Shape that involves AU correctly *not* applying a posture. This will test whether the verification methodology generalizes outside Shape A.
- Continue Shape A queue: weighted vest lb, body weight ranges, kg load capacity, etc. Each one tests whether the AU-sourced Shape A pattern holds across categories.
- Sketch what a broader AU-accuracy review would look like — is it a separate phase, a parallel queue, or a permanent check before Phase 3 lands?

---

## Files touched this session

- `Unit_Catalog_Phase1.md` — three entries updated with verification notes (boxing gloves new; sinkers and fishing line updated with Chat 100 re-check).
- `Phase2_Taxonomy.md` — Shape A "Verification findings" rewritten; N1/N2 working note rewritten; Phase 3-prep verification queue line updated.

No code files touched. No version bumps.

**Project knowledge note:** Chat 99's catalog updates were saved with a non-canonical file (project knowledge had the un-edited version of `Unit_Catalog_Phase1.md`). Chat 100 caught this when reading the file — the uploaded local copy had the Chat 99 verification notes, but project knowledge did not. The catalog file Claude edited this session is the correct Chat 99 + Chat 100 version. When pushing, the freshly-corrected catalog needs to replace the stale project-knowledge copy.

---

## Process notes

- **Memory guard #4 (cross-doc consistency) flagged the project-knowledge staleness.** When the catalog file in project knowledge didn't have the Chat 99 verification notes the handover claimed, Claude stopped and checked the uploaded copy rather than assuming the handover was wrong or that Chat 99 hadn't done the work. The uploaded copy had the notes; project knowledge was stale. The fix (use uploaded as canonical) preserved the Chat 99 work and let Chat 100 build on it correctly.
- **Recommendation-with-justification pattern held throughout.** Every choice offered to Melissa came with an explicit recommendation and reasoning.
- **Mid-session reframe handled cleanly.** When the boxing gloves discovery showed the verification queue had been looking at the wrong thing, the response was not "stop and write up the discovery" or "ignore it, finish what we planned." It was "pause, re-run the prior verifications, integrate, then write." This required re-drafting the verification notes once more data came in. Worth the back-and-forth.
- **N1/N2 working note rewrite preserved the precise definitions while honestly walking through the Chat 99 → Chat 100 evolution.** Two named subsections ("What Chat 99 thought they meant" / "What Chat 100 showed they actually mean") rather than silently rewriting. Future-us will want to know why the interpretation shifted, and the doc now carries that record.
