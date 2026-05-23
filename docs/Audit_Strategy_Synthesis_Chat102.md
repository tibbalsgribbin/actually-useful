# Audit and strategy synthesis (Chat 102)

A four-way detector audit (in-family Claude, plus GPT, Gemini, and a cold-read Claude that never saw the project history), followed by three strategy questions put to the three outside models. All code claims below were checked against `search.js` v0.6.2.1 this session. Confirmed means read in code. Inferred means reasoned but not run.

---

## Part 1: the audit, four ways

### The keystone we missed

Three audits (in-family, GPT, cold-read Claude) landed on the same root cause. But the most important single finding came from the two that diffed the design doc against the code line by line, Gemini and the cold-read Claude. It's something the in-family audit and both prior chats (100, 101) walked right past.

**The bundled `brand_allowlist.txt` was never built.** Brand_Filter_Design specifies it (lines 84-86, 119-137, 276-287): a 200-500 brand allowlist, loaded at startup, checked before scoring, as the false-positive escape hatch. I grep-confirmed the absence this session. No `bundledAllowlist` variable, no `brand_allowlist.txt` load, not in the manifest's web-accessible resources. The bundled blocklist is wired (search.js:4877; manifest:46). Its allowlist twin is not.

This changes the whole brand story. The solo-trigger heuristics were designed aggressive on purpose, on the assumption a 300-brand allowlist would absorb the overflow (Brand_Filter_Design:336, "Allowlist absorbs known false positives"). Half that system shipped. NIVEA, DEGREE, Schmidt's, and Harry's get flagged because the net they were calibrated against doesn't exist.

The lesson is about method. Tracing from observed telemetry finds bugs in code that runs. It can't find a feature that should exist and doesn't. Only doc-versus-code diffing catches an absence, and that's the pass the in-family audit skipped.

### The common cause

All four arrived at the same root, four coupled facets:

1. Hardcoded lists tuned to the test category mix. Fashion passlist; laundry `COUNTABLE_SOLID_TITLE_KEYWORDS`; supplement `isServingWeight`; paper `isPaperWeightLb`. Each was compiled against the category that surfaced its first bug. Each fails outside that category.
2. Fire on a single match, no corroboration. Brand solo-triggers; `solidUnitIsWrong`'s coincidence test; `isMultiPackWeight` firing on any substance word.
3. No scope gate. Detectors run on every input regardless of whether it's the domain the list was built for.
4. Telemetry logs outcomes, not sources. Every misfire looks identical to a correct fire, so each one gets re-found by hand.

The keystone ties them together: facets 1 and 2 only hurt because the design's counterbalance, the bundled allowlist, is missing. Aggressive heuristics, plus lists tuned to one category, plus no allowlist, is the worst combination for false positives. That's a better root than the in-family audit's original "fire on match, no scope gate."

### Net-new verified findings (beyond the in-family audit)

Each re-checked against v0.6.2.1 this session.

| Finding | Source | Status | Severity |
|---|---|---|---|
| Bundled `brand_allowlist.txt` unimplemented (the design's FP safety net) | Gemini + cold-read Claude | Confirmed (grep) | High |
| `applyBrandBlock`/`applyBrandAllow` overwrite `brandDetection.signals` (3051, 3026), so heuristic-hit telemetry under-counts after any manual block | cold-read Claude | Confirmed (read code) | Med (telemetry) |
| No `brandsScraped`/`brandsNull` field, so the doc's >70% scrape-rate criterion can't be measured; silent scrape decay reads as "clean results" | cold-read Claude | Confirmed (absent in doLog 1511-1572) | High (diagnostic) |
| Mixed-units banner gates on `source==='calc'\|\|'none'` (2722), so `calc-weight`/`calc-single`/`calc-liquid` overrides fire with no user indicator | cold-read Claude | Confirmed | High |
| `'in'` in `LENGTH_UNITS` (line 42), an English preposition the catalog already flagged | Gemini + cold-read Claude | Confirmed | Low |
| Priority: personalAllowlist (1057) short-circuits before bundledBlocklist (1062) | Gemini + cold-read Claude | Confirmed | Low-Med |
| `normalizeUnit` strips a leading number (169), risking loss of a rate denominator | cold-read Claude | Inferred, needs sample data | Med |

One nuance on the priority finding: Gemini got it slightly wrong, the cold-read Claude got it right. The doc's "blocklist beats allowlist" rule was about the bundled allowlist. The code's early return is the personal allowlist, a different thing. So it's "user choice beats bundled blocklist," which is arguably fine. The real point is that it's an accident of statement order, not a decision.

### What the in-family audit had that the others didn't

Held to the same standard, code-verified, and not isolated by the outside three:

- **Duplicate `COMMON_WORDS` entries** (`pro, max, plus, nova, flow, shine, wear, forest, glory`) make `signalFakeMashup` fire from one distinct word counted twice. Procter, Proraso, Proactiv, Novalash. The cold-read Claude found the broader looseness (substring match, no word boundary, GoPro and BlackBerry via two genuine words) but not the single-word double-count.
- **The inner-count multiplication** in the weight sanity check (1311), times `(count||1)` with no `isMultiPackWeight` guard, while its two sibling branches (1323, 1367) both guard. KIND Bars: correct $0.779/oz becomes $0.065, 12x too low. The cold-read Claude's P-2 hit the same line but framed it as a bad-parse risk, not the count multiply.
- **`unitsFound` (1516) conflates PPU source** the same way `topFilteredBrands` conflates flag source. GPT named the concept (P7/T3); the cold-read Claude named the banner version; the in-family audit named the specific field.
- The **Schmidt's / Procter / Harry's** code-confirmed attributions. Schmidt's and Harry's flag via signalNoVowel plus signalConsonantCluster at score 2 (Harry's because 'y' isn't counted as a vowel). Procter flags via the duplicate-`pro` mashup. Only the in-family audit ran these.

### Per-auditor read

The cold-read Claude was strongest. Accurate line numbers, clean confirmed/inferred tags, traced examples, the most net-new verified findings, the best synthesis. "Never saw the project files" didn't cost it anything, because the audit is code-versus-doc and both were in the upload. It re-derived the missing allowlist cold.

Gemini was one big hit on low precision. Most of its transcript is the strategy answers and a rebuild riff. Its line numbers are wrong (it put `detectGibberishBrand` at 1395, `doLog` at 2011; actual 1051 and 1511), so don't trust a Gemini location without checking. But its doc-versus-code pass caught the missing allowlist and the `'in'` token. Method beat precision.

GPT was accurate but mostly not new. Zero code line numbers (every reference points at a design doc), and it largely restates the docs' own acknowledged limits. It also assumed `brand_allowlist.txt` exists, so it missed the absence. Its real value is the framing in B5: the code is conservative about missing data (null brand, leave it alone) yet aggressive about weak evidence (one signal, demote). That asymmetry is a sharp lens.

---

## Part 2: the strategy questions, three ways

### The throughline

The rebuild answers and the audit findings are the same problem from two ends. Every model's top rebuild principle (provenance, confidence, posture as a type) is the exact hole the audits flagged. And every expansion idea assumes detector accuracy AU doesn't have yet. So all three strategy questions point at one prerequisite: the provenance and diagnostic foundation, plus the brand safety net, come before monetization or expansion.

### Q1: rebuild from the ground up

The three outside models independently proposed the same architecture.

| Principle | GPT | Gemini | Cold-read Claude |
|---|---|---|---|
| Posture / comparison-meaning as a first-class type | semantic quantity type + `ComparisonPosture` enum | `applyCollisionRules` pipeline stage | discriminated union: defer / override-suppress / add-pill / note |
| Provenance + confidence on every field | yes | rich objects with source + confidence | a `provenance` field read by render, telemetry, and user actions |
| Evidence aggregation instead of solo-trigger + escape list | weighted scoring | implicit | allowlist as negative confidence |
| Lists as data, not code | category-aware | externalize to a CDN (most developed) | tie to the existing killswitch path |
| Detectors as pure functions in a pipeline | semantic pipeline | pipeline (most developed) | named the 4 bolt-on detectors directly |

The notable part: all three said to make AU's own `Override_Principle.md` posture model into a real type. Three outside models, separately, told you the thing your design doc is reaching for should be the architecture. That's strong outside agreement that the Phase 3 posture direction is right.

The split is in calibration. GPT went deepest on reframe ("ontology is the actual product"), most ambitious, least buildable. Gemini went furthest on infrastructure (versioned config on a CDN), most build-heavy for a solo dev. The cold-read Claude tied every principle to existing code, so it's the most actionable.

What none of them said: a ground-up rebuild into a typed semantic engine is a big project, and they answered the literal hypothetical without weighing it against your energy and time. The payoff isn't a rewrite. It's lifting two pieces (a provenance field, which the audit says you need anyway, and a posture type, which Phase 3 is already heading toward) into the current code, piecemeal.

### Q2: value, monetization, unmet annoyances

Value: unanimous yes. All three put the defensible niche in the same place, comparability and trust, and contrast it with price-history tools (Keepa, CamelCamelCamel) that are mature because prices are objective. AU's space is harder because meaning is semantic, which is also why it has fewer competitors.

Monetization: viable, trust-conditional. The most useful take is the cold-read Claude's, because it connects to the audit. Once affiliate links route through the comparison page, a brand false positive isn't a shrug, it's revenue lost on a call the tool made for the user. So the brand-FP fixes matter more near money, not less. Gemini added the concrete legal point: extensions that inject or cloak affiliate links break Amazon Associates terms, but AU's user-initiated, off-site model (export to actuallyuseful.net) probably complies. Worth a real check before building.

Unmet annoyances, the ones with weight:

- **Seller / supplier-network clustering** ("these 5 brands are one factory"). GPT and Gemini both, independently. Extends AU's existing brand work and is genuinely underserved.
- **Sponsored decontamination and result dedup.** All three. "One listing per brand, collapse near-identical ASINs" feeds the comparison-table idea directly.
- **Review quality, not fake detection.** All three deliberately avoided "these reviews are fake" in favor of velocity, coherence, and "used to be good" drift.
- **Stale-discount detection.** Cold-read Claude and Gemini.

The cold-read Claude's ranking discipline is the one to keep: it sorted by (pain felt) x (ease to compute from card data) x (no good existing tool), and put stale-discount first, sold-by/ships-from clarity second, review-velocity third. All three compute from data AU already scrapes. GPT's and Gemini's lists are wider but reach into review NLP, image clustering, and cross-marketplace work that isn't realistic for one person.

### Q3: extend to other Amazon pages

All three structured it the same way (product page, cart, saved-for-later, order history, lists) and agreed on the per-page roles. Product page as a "what Amazon isn't telling you" layer (concentration, refill economics, compatibility traps). Cart as a last-minute check (price drift since save, unapplied coupons). Order history as a re-buy assistant with post-purchase notes. Lists as price-drop and health.

Gemini was the most feature-detailed (Trust Score, Re-Buy Assistant, List Health). GPT framed it most ambitiously (a persistent intelligence layer reasoning about regret and lifecycle).

The cold-read Claude's was the most useful, for two AU-specific reasons. Its lead product-page feature was "why was this demoted? let the user reject it, and feed the rejection back as an implicit allowlist signal." That makes the product page the data source that fixes the missing-allowlist problem. And it was the only one to give a constraint instead of a feature: maintenance scales with surface count, each new page is another scrape pipeline that drifts, so build scrape-health-as-a-first-class metric (its B-11/T-5 finding) before expanding, not after.

---

## Part 3: paths forward

Five, roughly in order of size. My recommendation follows.

### Path A: safety net and instruments (smallest)

Implement the bundled allowlist (B-3) and add the missing telemetry fields: `bundledBlocklistHits`, `personalAllowlistHits`, `brandsScraped`, `brandsNull`, a per-brand signal breakdown, and a snapshot of signal counts taken at scrape time before user actions mutate them.

Cost: the allowlist wiring is a copy of `loadBundledBlocklist`. The real work is sourcing the 300-brand starter list. The telemetry is a handful of fields plus a one-time Apps Script and Sheet header change.

Payoff: this is the missing half of the shipped design, and it makes every other finding measurable. You stop re-finding bugs by hand. It also unblocks the curation loop the design doc already describes.

### Path B: brand accuracy (A plus the brand logic)

Path A, plus: dedupe `COMMON_WORDS` (kill the 9 duplicate-driven false positives), drop or condition the solo-triggers (require one corroborating signal), count 'y' as a vowel in `signalNoVowel`, and raise the short-brand bar so Schmidt's and Harry's stop flagging.

Cost: contained, one function (`detectGibberishBrand`). The dedupe is a 30-second fix. The solo-trigger change is the judgment call, and it's safe to make once Path A's allowlist is in place.

Payoff: cuts the live brand false-positive rate sharply. Best done after A, because the allowlist is what lets you keep the heuristics aggressive without collateral damage.

### Path C: unit accuracy

Fix the calc-* banner gap (P-7/P-8, so silent overrides become visible), the inner-count override (Finding C, the KIND Bars bug), and add a source tag to `unitsFound`. Optionally start the posture type as a thin layer over `parseTitleWeightQty`, the main collision source.

Cost: medium. The banner fix is small. The override fix needs the inner-count-versus-pack-count disambiguation. The posture layer is Phase 3 and larger.

Payoff: stops AU from confidently overriding correct Amazon PPUs and hiding that it did. Separate code from the brand work, so it's a different session.

### Path D: strategic expansion

Product-page truth layer, comparison-table monetization, or a new annoyance feature (supplier clustering and stale-discount are the cheapest, both computable from card data).

Cost: high, and it adds scrape surface that drifts. Gated on A (you need the instruments before you add pages).

Payoff: this is where growth and revenue live. But it sits on top of the accuracy and diagnostic foundation, and it's shaky without it.

### Path E: full rebuild

Covered in Part 4. My short version: don't, as a big bang. Adopt its principles incrementally through Paths A through C.

### Recommendation

Do A first. It's the cheapest, it's the missing design half, and it turns the rest from guesswork into measurement. The cold-read Claude's top-3 lands here too: the telemetry can't run the design's own curation loop, which blocks everything downstream.

Then B, because the brand false positives are the most user-visible problem and the allowlist from A makes them safe to fix.

Hold C and D. C is real and worth doing, just a separate unit-side session. D waits until A is in and you've decided on direction.

Treat E as a no for now, but mine it (next part).

---

## Part 4: starting over from scratch

You asked what a ground-up rebuild looks like with everything we now know. Here it is, then my honest read on whether to do it.

### The shape three models converged on

If you rebuilt AU today, the architecture writes itself, because GPT, Gemini, and the cold-read Claude all drew the same one without coordinating:

1. **Typed quantity meaning.** Every number scraped from a title becomes a typed object: buyable-mass, buyable-volume, buyable-count, serving, capacity, specification, dimension, rating, pairing, or ambiguous. PPU only runs on the buyable types. The "10 lb dumbbell" and "20 lb fishing line" bugs disappear by construction instead of by suppression patch.

2. **Posture as a real type.** Every item resolves to one posture: defer, override-suppress, add-pill, or note. The render layer reads the posture, not a tangle of `source`/`note`/`ppuNote` fields. This is `Override_Principle.md` made into code.

3. **Provenance on everything.** Each derived field carries where it came from and how sure AU is: amazon, calc-from-title, inferred, with a confidence number. Render uses it to soften uncertain claims. Telemetry logs it directly. User actions add to it instead of overwriting it (which kills the B-10 signal-clobber bug).

4. **Evidence aggregation, not solo-triggers.** Signals contribute weighted confidence. Flag above a threshold. The bundled allowlist pushes confidence down. No single regex demotes a brand on its own.

5. **Category-aware semantics.** Inferred commerce domains (food, supplements, beauty, fitness, fishing, electronics) each get their own unit meanings and suppression rules, so apparel heuristics stop leaking into electronics.

6. **Detectors as pure functions in a registry.** `detect(title, context) -> Posture | null`, registered with a priority, run by one pipeline. New detectors register. Order is explicit and testable, instead of an accident of control flow in `scrapeCard`.

7. **Telemetry about beliefs, not activity.** Log what AU believed, why, how sure, what it did, and what happened downstream. That's what makes a heuristic system safe to tune.

8. **Confidence-aware UI.** Solid pill for Amazon-provided, outlined for AU-normalized, dotted for low-confidence inference. The user can see when AU is guessing.

### What carries over, what gets thrown out

Carries over: the scrape selectors, the unit conversion tables, the killswitch and logging plumbing, the design docs (they're already most of the spec for the rebuild), and the bundled blocklist.

Thrown out: the `scrapeCard` nested-if structure, the bolt-on detectors as inline branches, the flat field model (`ppu`/`unit`/`source`/`note`/`altPPU`/`ppuNote`), and the solo-trigger flag rule.

### Rough phasing if you did it

1. Define the types: QuantityMeaning, Posture, Provenance. No behavior change yet, just the data model.
2. Build the pipeline runner and port one detector (say `isPaperWeightLb`) into it as a pure function.
3. Port the rest of the detectors one at a time, each with its own small test.
4. Move the lists to data files, loaded via the killswitch path.
5. Rebuild telemetry around the new objects.
6. Rebuild the render layer to read postures and provenance.

### My honest verdict

Don't do it as a rewrite. Not because the architecture is wrong (it's right, three models and your own docs agree), but because of who's building it. A full rebuild is months of solo work, and a half-finished rewrite is worse than a working messy extension. The current code works. People use it.

The smart move is to steal from the rebuild without doing the rebuild. Three pieces are worth pulling into the current code now, and they double as audit fixes:

- The provenance field (Path A). You need it for telemetry regardless, and it's the foundation of items 3 and 7 above.
- The posture type (Path C). Start it as a thin wrapper over the existing detectors, even if `scrapeCard` stays ugly underneath. It's items 2 and 6, partway.
- The bundled allowlist as negative confidence (Path A/B). It's item 4, partway, and it's the missing safety net anyway.

Adopt those three and you've absorbed maybe 60% of the rebuild's value at a fraction of the cost, with no rewrite and no risk of a stranded half-migration. If, a year from now, those three have proven out and you've got the energy, the full pipeline migration becomes a series of small ports instead of a leap.

So: the rebuild is the right map. Use it to steer the next few sessions, not to burn the current code down.
