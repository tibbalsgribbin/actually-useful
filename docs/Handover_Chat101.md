# Handover — Chat 101 → Chat 102

*May 21, 2026 · Opus*

*Shape F verification round complete. Deodorant and lotion both confirmed Shape F — AU defers correctly to Amazon's PPU, no collision. Two-out-of-two clean defer cases. Separately, while reviewing the lotion telemetry, surfaced a brand-detection accuracy issue: AU is demoting legitimate brands (NIVEA, DEGREE, ARRID, Schmidt's, etc.) via heuristic signals despite none being on Melissa's personal blocklist. Root-caused to `signalAllCapsInvented` firing as a solo-trigger on any all-caps brand name not on a fashion-focused passlist. No code changes this session — investigation and Handover only. Doc updates: Shape F verification integrated into Phase2_Taxonomy.md, Unit_Catalog_Phase1.md, Roadmap, Briefing.*

---

## What's done now

### Shape F verification (primary work)

Two verifications, both confirmed Shape F per the corrected (Chat 100) methodology — check Amazon's PPU output AND AU's telemetry, both sides.

| Search | Amazon level | AU level | Verdict |
|---|---|---|---|
| `deodorant` | ~uniform `(/ounce)` PPU across page (59/60 scraped listings; 1 outlier `(/count)`) | `oz(192), ct(24), fl oz(9), g(1)`; selected `as-listed`; not Liquid Dominant | Shape F confirmed — uniform-PPU defer case |
| `lotion` | Mixed liquid-dominant: ~48 `(/fluid ounce)`, ~8 `(/ounce)`, ~3 `(/milliliter)` | `fl oz(123), oz(35), ct(9), ml(5), g(1)`; selected `as-listed`; Liquid Dominant TRUE | Shape F confirmed — mixed-but-coherent defer case |

Both cases the AU unit-family breakdown closely tracks Amazon's per-listing PPU choices. AU is selecting `as-listed` — i.e. deferring to whatever unit Amazon picked per listing — and not trying to normalize across the mix. This is the correct Shape F behavior.

Lotion is the more interesting datapoint because Amazon's PPU is *not* uniform on the page — it's mixed by product type (liquid lotions get fl oz; semi-solid or balm-type lotions get oz; some imports get ml). AU correctly didn't try to override that mix. The `Liquid Dominant: TRUE` flag plus `as-listed` selection is AU expressing "Amazon's per-product choices are reasonable here, I'll defer."

### Brand-detection finding (secondary, surfaced from telemetry review)

While reading the lotion telemetry, noticed `brandsFilteredTotal: 14` with `topFilteredBrands: NIVEA(12), BIOTONE(1), ATTITUDE(1)`. None of these brands are on Melissa's personal blocklist (`personalBlocklistSize: 0`). The deodorant telemetry showed the same pattern: `brandsFilteredTotal: 18` with `topFilteredBrands: Schmidt's(9), CRYSTAL(4), Harry's(1), DEGREE(1), Procter(1), ARRID(1), LAVILIN(1)`.

Investigation (against search.js v0.6.1.54 uploaded this session) traced the cause:

**The brand-filter system has two completely separate paths, conflated in telemetry:**

1. **Blocklists** (personal rules list + bundled blocklist) — exact-match flags. Documented behavior.
2. **Heuristic signals** (Signals 1–5 in `detectGibberishBrand`, search.js lines 1071–1174) — pattern-detection that runs on every brand whenever the brand filter is active. Does not consult the rules list. Was designed to catch dropshipping garbage brands (OUGES, MOFFBUZW, etc.).

The telemetry columns `brandsFilteredTotal` and `topFilteredBrands` report any brand flagged for any reason — blocklist OR heuristic — with no source distinction. This makes heuristic false positives invisible at the telemetry level unless you read the per-signal hit counts and reason backward.

**The core false-positive mechanism:**

Signal 5 (`signalAllCapsInvented`, lines 1150–1169) flags any all-caps brand name (no spaces, 5+ letters) that is not on a hardcoded passlist (`ALL_CAPS_PASSLIST`, lines 1155–1164). The passlist is fashion-focused (ZARA, ASOS, NIKE, ADIDAS, etc.) — no personal-care brands. So when Amazon presents NIVEA, DEGREE, ARRID, CRYSTAL, LAVILIN, BIOTONE, ATTITUDE in all caps (their official styling in many listings), Signal 5 fires.

**The aggravating factor:**

Lines 1172–1174:
```js
var hasSoloSignal = signals.indexOf("signalAllCapsInvented") !== -1 ||
                    signals.indexOf("signalFakeMashup") !== -1;
var flagged = hasSoloSignal || score >= 2;
```

`signalAllCapsInvented` is a **solo-trigger** — one hit is enough to flag the brand. No corroboration required. So an all-caps presentation alone is sufficient to demote a legitimate brand.

**Brand-by-brand attribution (inferred from the signal logic):**

| Brand | Likely signal(s) firing |
|---|---|
| NIVEA, DEGREE, ARRID, CRYSTAL, LAVILIN, BIOTONE, ATTITUDE | signalAllCapsInvented (solo-trigger) |
| Schmidt's | signalConsonantCluster ("schmdt" / "sch" + "dt") + likely signalNoVowel; needs score ≥ 2 |
| Procter | signalFakeMashup (contains common words like "pro"); solo-trigger |
| Harry's | Less obvious — possibly apostrophe-handling issue; worth a closer look in the audit |

Lotion telemetry has `signalAllCapsInventedHits: 14` and 14 total demoted brands, with NIVEA(12) dominating — strongly consistent with NIVEA's all-caps presentation being the entire story for that page.

**Why this matters for the project:**

The structural pattern matches Chat 100's Shape A reframe almost exactly. Chat 100 found AU's unit-detection logic firing where it shouldn't (collisions AU generates on its own). Chat 101 found AU's brand-detection logic firing where it shouldn't (legitimate brands flagged as junk). Both are accuracy issues in AU's own detectors that weren't visible without targeted investigation. This is exactly what the Roadmap's "broader AU-accuracy review" item was anticipating, just on a different subsystem than originally framed.

### Doc updates

- **`Phase2_Taxonomy.md`** — Shape F section updated: "Verification findings" subsection added (parallel to Shape A's existing one). Phase 3-prep verification queue line for Shape F updated.
- **`Unit_Catalog_Phase1.md`** — New VERIFIED non-collision section added (deodorant and lotion as defer-case anchors). First non-collision entries in the catalog.
- **`Roadmap_Chat101.md`** — Shape F first-pass verifications marked done. Brand-detection accuracy added as a sub-track under the existing broader AU-accuracy review item. Audit recommendation added (Opus dedicated session, optional outside-family follow-up).
- **`Project_Briefing_Chat101.md`** — Brand-detection finding added to known issues. New standing rule: telemetry that conflates sources is its own bug class.

No code changes this session.

---

## What Chat 102 should do

### Path A — Accuracy audit (recommended, but a strategic decision Melissa should make)

Chat 100 found unit-detection accuracy issues. Chat 101 found brand-detection accuracy issues. Both came from targeted investigation, not from synthetic testing. The pattern suggests other detector subsystems have similar issues that haven't surfaced yet.

The Roadmap now positions an **accuracy audit** as a candidate for an upcoming session. Two tiers, can be done sequentially or independently:

1. **In-family Opus audit** — dedicated session, Opus 4.7, focused scope: review specific subsystems (brand detection, unit detection, PPU calculation, telemetry composition) for blind spots, false-positive risks, and gaps between intent and behavior. Outcome: triage-able findings list.
2. **Outside-family audit** — GPT-5 (preferred for code) on the same subsystems + the working documents (Phase2_Taxonomy.md, Override_Principle.md, Unit_Catalog_Phase1.md, several recent handovers). Different model-family priors catch issues an in-family review may share. Outcome: a second findings list to compare against the in-family one.

**Recommendation: do Opus first.** Gives an in-family baseline; the outside-family review then has something to contrast against, making it easier to distinguish "real blind spot" from "different model's stylistic preferences."

**Why this might not be Chat 102's right move:** energy budget. An accuracy audit is a high-information session; doing it on a low-energy day will produce a findings list that's hard to act on. If Melissa is energized for design work, this is the call. If not, defer.

### Path B — Continue verification queue

Plenty of useful verification work remains:

- **Continued Shape F** — canned soup or canned beans (the other Shape F prediction in the taxonomy). Tests whether Shape F holds for pourable/semi-solid foods, not just personal care.
- **Shape A queue** — weighted vest lb (close to VERIFIED dumbbell), body weight ranges (kg/lb pet harnesses), empty product weight kg (appliances/furniture).

**Mode:** Established methodology (check Amazon AND AU). Sonnet may suffice for Shape F continuations now that the framework is settled; Opus probably wanted for first verification of a Shape A category that might surface a new sub-pattern.

### Path C — Phase 3 detector design (still not recommended)

Phase 3 detector design now has Shape A and Shape F verified (2/8 shapes confirmed against the corrected methodology). Other shapes have varying verification status. Phase 3 is still gated on broader verification work.

### Path D — Address brand-detection finding directly (deferrable)

This session deliberately chose not to make code changes to the brand-detection system. The reasoning: the right scope of fix isn't clear yet (passlist additions vs. solo-trigger logic change vs. diagnostic telemetry addition). The accuracy audit (Path A) is the better forum for deciding scope. But if the finding feels urgent, Chat 102 could take it directly — Sonnet/Haiku territory once scope is decided.

### Track 1 alternative — Phase 8B residue

Standing reminder. Unchanged from Chat 100. Pick this if design-track energy is low.

---

## State of the project

| File | Version | Status |
|---|---|---|
| `manifest.json` | v0.6.2 | Unchanged since Chat 92 |
| `background.js` | v0.6.1.19 | Unchanged. Read this session for brand-investigation context. |
| `core.js` | v0.6.1.54 | Unchanged. Read this session. |
| `search.js` | v0.6.2.1 | Unchanged. Read this session — brand-detection logic in `detectGibberishBrand`, lines 1071–1174. |
| `compare.html` | compare-v1.1.0 | Unchanged |
| `content/page/compare-bridge.js` | bridge-v1.0.0 | Unchanged |

No code touched in Chats 93–101.

Note on file versioning: `core.js` is currently AU_VERSION 0.6.1.54 (read from file this session). The Chat 100 handover listed it as 0.6.1.54 also; no change.

### Design docs

| Doc | Status |
|---|---|
| `Override_Principle.md` | Locked Chat 96. |
| `Servings_Design.md` | Locked Chat 96. |
| `Demotion_Display.md` | Locked Chat 96. |
| `Design_System.md` | Partial, Chat 96. Extend in dedicated design sessions only. |
| `Unit_Catalog_Phase1.md` | **Updated Chat 101** (new VERIFIED non-collision section: deodorant, lotion). Note: project-knowledge copy was confirmed stale at start of Chat 101 (no Chat 99/100 verification notes present). Melissa's local copy is canonical. |
| `Phase2_Taxonomy.md` | **Updated Chat 101** (Shape F "Verification findings" subsection added; verification queue line updated). |
| `bug-test.md` | Unchanged. |
| `Panel_Redesign_Spec.md` | §3 palette canonical. §5.7, §8.3 stale. |

---

## Process notes for Chat 102

- **Verification mode requires both Amazon AND AU.** Standing rule #20. Continue.
- **Project knowledge may be stale; uploaded files are canonical.** Standing rule #21. Continue.
- **N1/N2 are observational categories of Amazon's behavior only.** Promotion still held pending broader AU-accuracy review.
- **New standing rule (#22): telemetry that conflates sources is its own bug class.** The brand-detection finding surfaced only because Chat 101 traced through the code. If `topFilteredBrands` had separated "blocklist hits" from "heuristic hits" in the telemetry output, this could have been spotted from telemetry alone. Watch for other instances of this pattern in AU's telemetry composition.
- **Recommendations with justifications.** Continue.
- **Memory guards #4–#9 remain in force.** Chat 101 exercised #4 (project-knowledge staleness on the catalog) and #8 (read the actual code in-session, not from memory of code behavior).
- **Code investigation pattern.** When investigating an anomaly in AU's behavior, request the relevant code files fresh from GitHub. This session demonstrated the value: the brand-detection logic was visible only by reading search.js lines 1071–1174; the inferences from telemetry alone would have been less precise.

---

## Known issues to keep in mind

Carried forward, unchanged:

- Compare.html Option 1 test suite incomplete — separate session, Sonnet or Haiku.
- Panel note area purple/indigo styling — separate session.
- Panel textarea closes prematurely (Test 1) — separate session.

New from Chat 101:

- **Brand-detection false positives.** `signalAllCapsInvented` and `signalFakeMashup` are solo-triggers that fire on legitimate brands not on a fashion-focused passlist. Affects NIVEA, DEGREE, ARRID, CRYSTAL, LAVILIN, BIOTONE, ATTITUDE, Procter at minimum (observed on this session's searches). Held for audit decision. Scope decision: passlist additions (band-aid) vs. solo-trigger logic change (structural) vs. diagnostic telemetry addition (preparation for the actual fix).
- **Telemetry source conflation.** `topFilteredBrands` and `brandsFilteredTotal` don't distinguish blocklist hits from heuristic hits. Even after the brand-detection fix, this telemetry-level fix would be valuable for future debugging. Lower priority than the underlying detector fix.

---

## GitHub commit message

```
Chat 101: Shape F verification — defer-case confirmed 2/2; brand-detection finding

Phase 3-prep verification round 3: first defer-case verifications.
Deodorant and lotion both confirmed Shape F per Chat 100's corrected
methodology (check Amazon AND AU). AU defers correctly to Amazon's
per-listing PPU choices on both pages.

Verifications:
- Deodorant: Amazon shows ~uniform $/oz across 60 listings; AU produces
  oz(192) of 226 listings with selected unit 'as-listed'. Defer confirmed.
- Lotion: Amazon shows mixed liquid-dominant PPU (~48 fl oz, ~8 oz, ~3 ml
  on the 60-listing scrape); AU produces fl oz(123), oz(35), ml(5) of 174
  listings with selected unit 'as-listed' and Liquid Dominant flag TRUE.
  Defer confirmed; AU correctly follows Amazon's per-product choices
  without normalizing across the mix.

Brand-detection finding (secondary, from telemetry review):
While reading lotion telemetry, noticed brandsFilteredTotal=14 with
topFilteredBrands listing NIVEA(12), BIOTONE(1), ATTITUDE(1). Deodorant
telemetry showed parallel pattern with Schmidt's(9), CRYSTAL(4), DEGREE,
ARRID, LAVILIN, Procter, Harry's. None are on Melissa's personal
blocklist (personalBlocklistSize=0 for both).

Investigation against search.js v0.6.1.54: root cause is signalAllCapsInvented
(search.js lines 1150-1169), a heuristic that flags any all-caps brand
name not on a fashion-focused passlist (ALL_CAPS_PASSLIST, lines 1155-1164).
Personal-care brands like NIVEA, DEGREE, ARRID present in all caps in
Amazon listings, so the heuristic fires. Aggravated by solo-trigger logic
(lines 1172-1174): signalAllCapsInvented alone is enough to flag, no
corroboration required.

Schmidt's likely fires via signalConsonantCluster + signalNoVowel
(score ≥ 2). Procter likely fires via signalFakeMashup (solo-trigger).
Harry's mechanism less clear, may involve apostrophe handling.

Telemetry-level secondary issue: topFilteredBrands conflates blocklist
hits and heuristic hits with no source distinction, making heuristic
false positives invisible at the telemetry level. New standing rule
added to Briefing (#22).

Updates to Phase2_Taxonomy.md:
- Shape F "Verification findings (Chat 101)" subsection added, parallel
  to Shape A's structure. Documents both verifications with Amazon and
  AU side breakdowns.
- Phase 3-prep verification queue line for Shape F updated: deodorant
  and lotion marked verified.

Updates to Unit_Catalog_Phase1.md:
- New "VERIFIED non-collisions (Shape F defer cases)" section added.
  First non-collision entries in the catalog. Documents deodorant and
  lotion as anchor defer cases.

No code changes. Brand-detection fix deferred pending audit scope decision.
Roadmap repositioned: broader AU-accuracy review now has brand-detection
accuracy as an explicit sub-track. Audit path (in-family Opus, optional
outside-family follow-up) recommended for Chat 102.
```

---

## Push reminder

After committing and pushing:

- **Important:** Update project knowledge with the updated `Unit_Catalog_Phase1.md` and `Phase2_Taxonomy.md`. The project-knowledge copy of `Unit_Catalog_Phase1.md` was confirmed stale at start of Chat 101 (no Chat 99/100 verification notes present). The full canonical version with all Chat 99 + Chat 100 + Chat 101 updates should be uploaded.
- Update project knowledge with the new Briefing (`Project_Briefing_Chat101.md`), Roadmap (`Roadmap_Chat101.md`), Changelog (`changelog_entry_chat101.md`), and Handover (`Handover_Chat101.md`).
- Confirm in Chat 102 that the catalog file in project knowledge has all three Shape A verification notes (boxing gloves, sinkers, fishing line) AND the new Shape F non-collision section (deodorant, lotion).

---

## A note to Melissa

Two things from this session worth flagging.

**On the Shape F verifications.** Both came in clean. The corrected methodology (check Amazon AND AU) works in defer cases too — not just collision cases. That's a useful generalizability result. The framework predicted "AU defers when Amazon's PPU is reasonable" and that prediction held in both a uniform-PPU case (deodorant) and a mixed-PPU case (lotion). Two datapoints isn't proof, but it's enough to start treating Shape F as understood the same way Shape A is.

**On the brand-detection finding.** You caught this. The verification work was complete; you noticed something off about the demoted-brands count in telemetry and asked the right question. That question led to reading the code, which surfaced a real structural issue in AU's brand-detection accuracy. This is the second time in two sessions (Chat 100 was the first) where your noticing-something-off-about-AU's-output led to a finding that changed how we think about the project. The pattern is consistent: AU's own detector accuracy is less established than the project had assumed.

I deliberately recommended *not* fixing the brand-detection issue this session. The fix scope isn't obvious — passlist additions are a band-aid that won't generalize; changing solo-trigger logic is the right structural fix but it deserves dedicated design attention; telemetry diagnostics are useful but they're preparation, not the fix. Mixing a code change into a verification session would break the pattern that's been working well, where verification, design, and implementation sessions stay separate.

The Roadmap now has an "accuracy audit" item that explicitly covers both unit-detection (from Chat 100) and brand-detection (from Chat 101). My recommendation for Chat 102 is to consider whether an Opus audit session would be productive, then optionally follow with an outside-family review (GPT-5 is the strongest candidate for code). But "would be productive" depends on energy budget — an audit session is high-information and you'll want to be in shape for it. If not, continued verification work or Phase 8B residue are fine alternatives.

---

*End of handover.*
