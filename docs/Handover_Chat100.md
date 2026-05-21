# Handover — Chat 100 → Chat 101

*May 21, 2026 · Opus*

*Phase 3-prep verification round 2 complete with a reframe. Boxing gloves added (Shape A confirmed) and Chat 99 verifications re-run with AU extension on. Result: Shape A collisions are AU-sourced in all three verified cases, not Amazon-sourced. The Chat 99 reading that "Amazon already handles these" was wrong because the verification queue had been examining only Amazon's PPU output, not AU's. Six doc edits to integrate the corrected picture. N1/N2 promotion deferred. Broader AU-accuracy review added to Roadmap. No code changes.*

---

## What's done now

Three Shape A verifications integrated. Two ways of looking at the data — Amazon level and AU level — now both required for a complete verification.

| Search | Amazon level | AU level | Verdict |
|---|---|---|---|
| `fishing sinkers` | Omits PPU (N1) | $/oz for 36/178 listings | Shape A confirmed, AU-sourced |
| `braided fishing line` | $/foot from spool length (N2) | $/lb for 37/162 listings | Shape A confirmed, AU-sourced |
| `boxing gloves` | Omits PPU (N1, 3rd instance) | $/oz from title weight | Shape A confirmed, AU-sourced |

**Doc updates:**

- `Unit_Catalog_Phase1.md` — boxing gloves entry: new verification note. Sinkers and fishing line entries: existing Chat 99 notes updated with Chat 100 re-check.
- `Phase2_Taxonomy.md` — Shape A "Verification findings" subsection rewritten; N1/N2 working note rewritten (preserves definitions, walks through Chat 99 → Chat 100 evolution); Phase 3-prep verification queue line updated.

The N1/N2 working note rewrite is worth a separate mention. The earlier version said "AU does nothing" in N1/N2 cases. Chat 100 disproved that. The replacement preserves the precise definitions of N1 and N2, then adds two named subsections ("What Chat 99 thought they meant" / "What Chat 100 showed they actually mean") so future-us can see how the interpretation shifted without rewriting history.

No new docs created. No code touched.

---

## What Chat 101 should do

### Path A — Phase 3-prep verification round 3 (recommended)

The verification methodology now needs a Shape F verification to test whether it generalizes. Shape F is the canonical defer case — AU should correctly *not* override anything. So far the verifications have all been Shape A (collision predicted, collision present). Shape F tests the other side: no collision predicted, no collision should appear.

**Best candidate: deodorant or lotion.** Semi-solid personal care, the canonical Shape F prediction. The verification question: do all listings on the page use the same convention (e.g. fl oz), so AU's $/oz comparison still works even though it's technically imprecise across solid/liquid? And does AU produce PPU at all, or does it defer correctly?

**Backup: canned soup or canned beans.** The other Shape F prediction (pourable/semi-solid foods).

**Mode:** Same as Chat 100 — observational, interactive, but with the corrected lens. Melissa runs the search with AU on; we read both the compare.html export (or telemetry breakdown) AND check what Amazon does on the live page.

**Model recommendation:** Opus. First defer-case verification means interpretation work. If Shape F goes cleanly, follow-on Shape F verifications may suffice on Sonnet.

**Energy budget:** Chat 100 ran ~6 substantive interpretive exchanges (longer than Chat 99 because of the mid-session reframe). Shape F should be shorter if the methodology holds — verification is more mechanical when the framework is settled.

### Path B — Continued Shape A verification queue

If Shape F isn't appealing, take another Shape A candidate to test whether the AU-sourced pattern holds across more categories:

- **Weighted vest lb** — close to the VERIFIED dumbbell collision. Specifically interesting because if AU's `isMultiPackWeight()` guard fires for weighted vests, the $/lb collision might be partial like dumbbells (blocks pack-multiplication, not $/lb).
- **Body weight ranges (kg, lb)** — pet harness/dog sizes. Different mechanic.
- **Empty product weight kg** — appliances, furniture. Tests whether AU's logic extends to kg.

### Path C — Phase 3 directly

Not recommended. Phase 3 detector design now has the right inputs (Shape A is real, AU is the source) but Shape F is still unverified. Without a Shape F datapoint, detector design for defer-category listings is operating on assumption.

### Path D — Broader AU-accuracy review (new)

Don't pick this yet. Held for after a few more shape verifications. The relevant scoping question is "what categories has AU's detector accuracy been verified in?" and we don't yet have enough verification data to answer it well. Chat 102 or later.

### Track 1 alternative — Phase 8B residue

Standing reminder. Sonnet/Haiku territory once design questions are settled. Pick this if design-track energy is low.

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

No code touched in Chats 93–100.

### Design docs

| Doc | Status |
|---|---|
| `Override_Principle.md` | Locked Chat 96. |
| `Servings_Design.md` | Locked Chat 96. |
| `Demotion_Display.md` | Locked Chat 96. |
| `Design_System.md` | Partial, Chat 96. Extend in dedicated design sessions only. |
| `Unit_Catalog_Phase1.md` | **Updated Chat 100** (boxing gloves new note; sinkers and fishing line notes updated with AU-level re-check). |
| `Phase2_Taxonomy.md` | **Updated Chat 100** (Shape A "Verification findings" rewritten; N1/N2 working note rewritten; verification queue line updated). |
| `bug-test.md` | Updated Chat 97. Toothpaste verdict reconciled. |
| `Panel_Redesign_Spec.md` | §3 palette canonical. §5.7, §8.3 stale. |

---

## Process notes for Chat 101

- **Verification mode now requires both Amazon AND AU.** The methodology established Chat 100: scrape Amazon's PPU output, then check AU's compare.html export / telemetry unit-family breakdown. A verification looking at only one side is incomplete. Chat 99's "Amazon already handles this" reading happened because only Amazon was checked. New standing rule (#20 in the Briefing).
- **Project knowledge may be stale; uploaded files are canonical.** Chat 100 caught a real instance of this: project knowledge had the un-edited catalog, but the local copy Melissa uploaded had the Chat 99 verification notes. The right move was to read the upload and treat it as the canonical Chat 99+Chat 100 base. New standing rule (#21).
- **N1/N2 are observational categories of Amazon's behavior only.** They do not indicate override-need. AU's behavior determines that. Promotion of N1/N2 to formal status held pending broader AU-accuracy review.
- **Recommendations with justifications.** Chat 100 exercised this throughout. Continue.
- **Memory guards #4–#9 remain in force.** Chat 100 exercised #4 (project knowledge staleness) and #6 (cross-doc consistency — N1/N2 now lives in two places in `Phase2_Taxonomy.md`, both updated together). Continue.
- **Phase 3 hold pattern updated.** Phase 3 is still gated on verification, but the criterion is now "more shapes verified with the corrected methodology" not just "more Shape A entries verified." At minimum, one Shape F verification before Phase 3.

---

## Known issues to keep in mind (unchanged)

- Compare.html Option 1 test suite incomplete — separate session, Sonnet or Haiku.
- Panel note area purple/indigo styling — separate session.
- Panel textarea closes prematurely (Test 1) — separate session.

---

## GitHub commit message

```
Chat 100: Phase 3-prep verification round 2 — Shape A confirmed 3/3, AU-sourced

Verification round 2 added boxing gloves (Shape A) and re-ran the Chat 99
verifications (sinkers, fishing line) with AU extension on. The result
inverted the Chat 99 reading: Shape A collisions are real in all three
cases verified so far, but the collision source is AU's own detectors
rather than Amazon's PPU output.

Verifications:
- Boxing gloves oz (new): Amazon omits PPU (N1, 3rd instance);
  AU computes $/oz from title weight ("8 oz", "12 oz", "16 oz")
  with note "ℹ No Amazon unit price — calculated from weight in title."
- Fishing sinkers oz (re-verified): Amazon omits PPU (N1);
  AU computes $/oz for 36 of 178 listings (telemetry oz(36)).
- Fishing line lb test (re-verified): Amazon computes $/foot
  from spool length (N2); AU computes $/lb for 37 of 162 listings
  (telemetry lb(37)).

Updates to Unit_Catalog_Phase1.md:
- oz "Boxing/MMA glove weight class" entry: new verification note.
- oz "Fishing weights/sinkers" entry: Chat 99 note updated with
  Chat 100 re-check.
- lb "Fishing line test strength" entry: Chat 99 note updated with
  Chat 100 re-check.
- All three remain SPECULATIVE per Memory guard #19.

Updates to Phase2_Taxonomy.md:
- Shape A "Verification findings" subsection rewritten. Now describes
  the three-instance picture honestly: Shape A confirmed in all three
  cases, AU-sourced rather than Amazon-sourced. Framework implication
  noted: override audience is wider than originally framed.
- N1/N2 working note in Cross-shape patterns rewritten. Preserves
  precise definitions of N1 and N2; adds "What Chat 99 thought they
  meant" + "What Chat 100 showed they actually mean" subsections to
  walk through the interpretation shift honestly.
- Phase 3-prep verification queue line for Shape A updated: sinkers,
  fishing line, and boxing gloves all marked verified with
  "Shape A confirmed, AU-sourced" annotation.

Framework impact: the trust posture framework still applies, but its
audience is wider than originally framed. The override question shifts
from "should we override Amazon's PPU?" to "should we override AU's
own detector output?" — at least for Shape A categories where Amazon
omits PPU or recategorizes.

N1/N2 promotion to formal catalog status: deferred. The Chat 99
handover proposed promotion after a third verification surfaced the
same pattern. Three N1/N2 instances are now observed (criterion met),
but Chat 100 showed N1/N2 alone don't determine override-need —
they describe Amazon's behavior only. Promotion held pending broader
AU-accuracy review (new roadmap item).

VERIFIED Shape A entries (paper grade lb, dumbbells lb) unaffected.

Project knowledge staleness caught: Chat 99's catalog updates were
not in project knowledge at session start. The uploaded local copy
had them. Treated the upload as canonical and built Chat 100 edits
on that base. Standing rule added (#21 in Briefing).

No code changes.
```

---

## Push reminder

After committing and pushing:
- **Important:** Update project knowledge with the updated `Unit_Catalog_Phase1.md` and `Phase2_Taxonomy.md`. The catalog upload from this session should fully replace what's in project knowledge — the project-knowledge copy was missing the Chat 99 verification notes (caught mid-session in Chat 100), and the local/uploaded copy is canonical.
- Update project knowledge with the new Briefing (`Project_Briefing_Chat100.md`), Roadmap (`Roadmap_Chat100.md`), Changelog (`changelog_entry_chat100.md`), and Handover (`Handover_Chat100.md`).
- Confirm in Chat 101 that the catalog file in project knowledge has all three Shape A verification notes (boxing gloves, sinkers, fishing line).

---

## A note to Melissa

The pivotal moment this session was your question: "Given what we learned about how AU was handling boxing gloves, do we want to re-run the other searches through AU, too?" That question reframed the entire verification work to date. Chat 99 had been checking Amazon's PPU output and reading the results as "Amazon handles these acceptably." Chat 100 checked AU's output and found the predicted collision in all three cases.

This is what informed partnership looks like in practice. You don't write code, but you noticed something about the methodology that I had missed — that "Amazon doesn't show $/oz" is not the same as "no $/oz problem exists." The verification queue had been designed around an assumption (Amazon is the source of truth, AU mostly inherits it) that turned out to be wrong at least for Shape A categories. Catching that early matters because Phase 3 detectors would have been designed around the wrong question.

Two consequences worth flagging:

1. **The methodology now requires checking both Amazon AND AU.** That's a new standing rule (#20). It will make verifications slightly slower but the findings will actually answer the right question.

2. **N1 and N2 are demoted from "important findings" to "observational categories of Amazon's behavior."** They were never wrong; they were just less load-bearing than Chat 99 made them. The override-need question doesn't depend on them. The doc keeps them defined precisely, with the Chat 99 interpretation captured honestly so future-us understands the shift.

The new "broader AU-accuracy review" Roadmap item is held. Not Chat 101's job. Chat 101 should do at least one Shape F verification with the corrected methodology, then we can decide whether the AU-accuracy question is a separate phase or just the verification queue done properly.

---

*End of handover.*
