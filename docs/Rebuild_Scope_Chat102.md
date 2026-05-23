# Rebuild scope spec (Chat 102)

The point of this doc is to size the rebuild before building it. It draws the scope line, names the target architecture, breaks the work into discrete sessions with a done-state each, and defines the test that says "finished." If the phase count looks like 30 sessions, that's a signal to narrow. If it looks like 12, the rebuild beats the patch treadmill on cost and you can commit.

This is a plan, not code. Nothing here touches the live extension.

---

## Why rebuild instead of keep patching

Four audits found the same root four ways. That's the signature of a structural problem. The detector code is built as a stack of bolt-on exceptions, so each defect is a symptom of the structure, which means there's always another one. An audit of that kind of code doesn't converge, and neither does the patching.

The current architecture makes whole bug classes possible. A typed-quantity model makes them impossible to express. Shape A collisions (specs read as buyable quantities) can't happen if a spec isn't a buyable type. Brand false positives from one signal can't happen if flagging needs aggregate confidence. Fixing the structure once stops the stream of findings at the source.

The design docs, this audit, and three independent rebuild sketches that agree give you a spec that's already most of the way written. The design risk on this rebuild is low, which is rare. The 25 planning sessions aren't lost if you rebuild. They're the input.

---

## The scope line

This is the most important section. Hold it.

**In scope:**

- The detector core: brand detection, unit detection, PPU calculation, rebuilt around typed quantities, postures, provenance, and evidence aggregation.
- Telemetry composition, rebuilt to log sources and reasons, not just outcomes.

**Out of scope (hard line):**

- Every strategy-question feature. Supplier-network clustering, product-page layer, cart, order history, lists, monetization, cross-marketplace, review analysis. All of it goes on an after-cutover list, none of it enters the rebuild.
- The scrape selectors. They drift with Amazon's DOM regardless of architecture, so they get reused as-is and fixed only when they break.
- The render and UI layer. Kept. The new core feeds it through a thin adapter. The UI isn't where the bugs come from, and rebuilding it is how a bounded rebuild turns into an unbounded one.
- `styles.css`, the killswitch, the logging plumbing, `compare.html`, and the bridge. Reused untouched.

The render call is mine and it's the scope decision that matters most. If you'd rather rebuild render too, the rebuild grows by 3 to 5 sessions and the cutover gets riskier, because UI is the part you've tuned by feel over many sessions. I'd keep it and migrate it later only if the adapter turns out to be a pain. Your call to flip.

---

## What carries over, what gets rebuilt

| Piece | Fate |
|---|---|
| Scrape selectors | Carry over as-is |
| Unit conversion tables | Carry over |
| Killswitch + logging plumbing | Carry over |
| Bundled blocklist + loader | Carry over |
| Design docs | Become the rebuild spec |
| `scrapeCard` nested branches | Rebuilt into a detector pipeline |
| The 4 bolt-on detectors | Rebuilt as pure functions in the pipeline |
| Flat field model (`ppu`/`unit`/`source`/`note`/`altPPU`/`ppuNote`) | Replaced by typed objects with provenance |
| Solo-trigger brand flag rule | Replaced by evidence aggregation |
| Telemetry payload | Rebuilt around (item, posture, signals, source) |
| Render layer | Kept, fed via adapter |
| Bundled allowlist | Built for the first time (the missing piece) |

---

## Target architecture, minimal version

Only the pieces that stop the treadmill. Marked essential or later so scope stays tight.

1. **Typed quantity meaning (essential).** Every number from a title becomes a typed object: buyable-mass, buyable-volume, buyable-count, serving, capacity, specification, dimension, rating, pairing, ambiguous. PPU runs on the buyable types only. This is what kills Shape A by construction.
2. **Posture as a type (essential).** Each item resolves to one posture: defer, override-suppress, add-pill, note. Render reads the posture. This is `Override_Principle.md` made into code.
3. **Provenance on every derived field (essential).** Where it came from (amazon, calc-from-title, inferred) and a confidence number. Render softens uncertain claims. Telemetry logs it. User actions append to it instead of overwriting it, which kills the signal-clobber bug from the audit.
4. **Evidence aggregation for brand (essential).** Signals contribute weighted confidence. Flag above a threshold. The bundled allowlist lowers confidence. No single regex flags on its own.
5. **Detector pipeline (essential).** `detect(title, context) -> Posture | null`, registered with a priority, run by one pass. New detectors register. Order is explicit and testable.
6. **Category-aware semantics (later).** Inferred domains (food, supplements, beauty, fitness, fishing, electronics) each get their own unit meanings. Worth doing, but it can land after cutover as a refinement, not a blocker.
7. **Confidence-aware UI (later).** Solid pill for Amazon-provided, outlined for normalized, dotted for low-confidence. Render-side, so it rides with the render layer you're keeping for now.

Items 1 through 5 are the rebuild. Items 6 and 7 are the version after.

---

## Phase plan

Discrete sessions, each with a done-state. Estimates are rough and exist to size the thing, not to promise.

| Phase | Work | Done when | Est. sessions | Model |
|---|---|---|---|---|
| 0 | Lock the data model: QuantityMeaning, Posture, Provenance types. No behavior change. | Types defined, reviewed, frozen | 1 | Opus |
| 1 | Pipeline runner + port one detector (`isPaperWeightLb`) as a pure function behind a flag. Output diffed against current. | One detector runs in the pipeline, matches old output | 1-2 | Opus then cheaper |
| 2 | Port remaining unit/PPU detectors into the pipeline with the typed-quantity gate. | All unit/PPU logic runs through types; Shape A cases suppress by type | 3-5 | Cheaper, against spec |
| 3 | Rebuild brand detection as evidence aggregation. Wire the bundled allowlist. Dedupe `COMMON_WORDS`. | Brand flags on aggregate confidence; allowlist loads; audit FPs (NIVEA, Schmidt's, Procter, Harry's) clear | 2-3 | Opus for the threshold call, cheaper for wiring |
| 4 | Rebuild telemetry around (item, posture, signals, source). Add the missing fields. | Telemetry logs why, not just what; curation loop runnable | 1-2 | Cheaper |
| 5 | Adapter: existing render reads postures and provenance. Parallel path behind a flag. | New core renders correctly through the old UI | 1-2 | Cheaper |
| 6 | Cutover when the acceptance test passes. Remove the old path. | Old code deleted, new path live | 1 | Opus to sign off |

Rough total: 10 to 16 sessions, and most of phases 2, 4, and 5 are mechanical porting against a frozen spec, which a cheaper model or Claude Code can do. The expensive thinking concentrates in phases 0, 3, and 6.

Compare that to the patch path, which has no phase count because it doesn't end. That's the cost case in one line: a bounded 10-to-16 against an unbounded tail.

---

## The cutover test

This is how you know it's done and how the parallel build stays safe. The current extension keeps shipping until the new core passes all of it.

Build a fixed regression corpus: real search URLs and scraped titles across the categories that already surfaced bugs (laundry, deodorant, supplements, snacks/bars, fishing, fabric/craft) plus the Shape F defer categories that are verified working. For each, record the correct expected output.

The new core must:

1. Reproduce every currently-correct output in the corpus. No regressions on what already works.
2. Fix the audit findings in the corpus: NIVEA/DEGREE/Schmidt's/Procter/Harry's not flagged, the KIND Bars PPU correct, the calc-* overrides visible, the defer categories still deferring.
3. Carry provenance on every output, so the telemetry checks pass.

Until all 3 hold, the flag stays off and the old path ships. The day they hold, you cut over.

---

## What moves off Opus

Once phase 0 freezes the types and phase 1 proves the pipeline pattern, the per-detector ports in phase 2 are mechanical: read the old branch, express it as a typed pure function, diff against the corpus. That suits a cheaper model or Claude Code. Same for the telemetry rebuild and the adapter.

Opus earns its cost on the architecture (phase 0), the brand threshold and aggregation design (phase 3), and the cutover sign-off (phase 6). That's the strategic use: spend the expensive model on the decisions, run the execution cheap.

---

## Two constants, either path

Neither argues against rebuilding. Price them in so they're not surprises.

The scrape selectors drift whenever Amazon changes its page. That maintenance exists whether you rebuild or patch. The rebuild does add one thing here worth having: a scrape-health metric (the audit's B-11/T-5 finding), so selector decay shows up in telemetry instead of looking like clean results.

The bundled allowlist is 300 brands of curation. That's data work, not code, and it's the same lift in either path. It has to happen for the brand false positives to stop, rebuild or not.

---

## The one risk that kills it

Scope creep. The strategy features are interesting and they will tempt their way in mid-build ("while we're in here..."). Every one of them turns the bounded rebuild into a bigger treadmill than the one you're leaving.

The rule: any feature idea during the rebuild goes on the after-cutover list. Nothing enters the rebuild that isn't in phases 0 through 6. The render layer stays. The new pages stay out. Monetization stays out.

Hold the line and this is a finite project with a known end. Don't, and it's the same problem at a larger scale.
