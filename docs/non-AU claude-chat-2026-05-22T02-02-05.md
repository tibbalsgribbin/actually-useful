# Claude Conversation Export

Exported: 5/21/2026, 7:02:05 PM
Messages included: 9

\---

## Claude

I have the audit prompt and three of the eight files in my context (manifest.json, background.js, core.js). I need to read the other five from disk before I can do this properly.

\---

## User

If you were rebuilding this product from the ground up, what would you do differently?

\---

## Claude

The biggest thing I noticed reading the docs alongside the code is that the design docs are better than the implementation. Override\_Principle.md, Phase2\_Taxonomy.md — those describe a clean architecture (four postures, eight collision shapes, a unified detector framework). The code was written before that framework existed and reflects an earlier mental model. So my rebuild would start with: make the code reflect the docs, not the other way around.

Concretely:

1. Posture as a first-class type. Right now every item has `ppu`, `unit`, `source`, `note`, `altPPU`, `altUnit`, `ppuNote` — seven loosely-coupled fields, three of which (`source`, `note`, `ppuNote`) are partly synonymous and partly not. The Override Principle doc says every item lives in one of four postures (defer / override / add-pill / note). I'd make that a real discriminated union: `{ kind: 'defer', ppu, unit }`, `{ kind: 'override-suppress', reason: 'paperGrade', original: {ppu, unit} }`, etc. The render layer reads postures, not field combinations. The "mixed-units banner" gates on `kind === 'override-\*'` and never has to know about `calc-weight` vs `calc-single` vs `calc-liquid`.
2. Provenance is a foundational requirement, not telemetry-grade decoration. The single deepest pattern in the audit was "AU acted, no one can see why" — silent overrides (P-7/P-8), `applyBrandBlock` overwriting signals (B-10), telemetry that logs outputs without sources (T-3, T-6), the "unrecognized brands" label hiding the signal-set behind a soft phrase (B-9). In a rebuild, every detector decision carries a `provenance` field: which signals fired, which thresholds, which list matched. Render uses it for UI ("ⓘ we recalculated this because…"), telemetry logs it directly, and user actions like `applyBrandBlock` add to provenance rather than overwriting it.
3. Confidence-and-corroboration, not solo-triggers + escape hatches. The fashion-passlist failure mode (B-1) is what you get when one signal can flag and the only safety net is a hardcoded list of exceptions calibrated to one category mix. Replace with: every signal contributes a weighted confidence; flag when aggregate ≥ threshold. The bundled allowlist contributes negative confidence (it pushes brands below the threshold even if signals fire). The maintenance loop becomes principled: "we're seeing X% of all-caps brands flagged solo — what's missing from the allowlist?" rather than "did we remember to put BOSCH on the passlist?"
4. Lists as data, not code. Hardcoded fashion passlist, hardcoded substance words in isMultiPackWeight, hardcoded supplement keywords in isServingWeight, hardcoded `COUNTABLE\_SOLID\_TITLE\_KEYWORDS` — these all want to be `.txt` files in `data/`, loaded at init, ideally hot-reloadable via the killswitch path (which already exists). The killswitch today is binary (disabled / not). A small extension — "delta lists you can ship without a Chrome Web Store re-review" — is one of the highest-leverage moves available. It makes the curation loop actually closeable on the developer's timeline rather than the store's.
5. Detectors as pure functions in a registry. Right now `isPaperWeightLb`, `isMultiPackWeight`, `isServingWeight`, `applyPairsNote` are bolted into the `scrapeCard` flow with their call order determined by control-flow accident. They should be `detect(title, context) → Posture | null` modules, registered with a priority, applied by a single pipeline runner. New detectors register; the runner stays unchanged. Order is explicit, testable, and documented.
6. Scrape health is a metric, not an assumption. AU's brand scraper degrading to 0% looks identical in telemetry to Amazon shipping cleaner results (B-11). The rebuild logs `brandsScrapedCount`, `brandsScrapedByStrategy`, `ppuSourceDistribution`, `firstUnitDetectedRatio` every page. A real DOM regression sets off the metric and triggers the alarm. Today there's no alarm.
7. Render is too big. `render()` is \~600 lines doing sort, filter, format strings, banner gating, telemetry scheduling, persistence. In a rebuild it's a pipeline of pure transformations: `data → sorted → filtered → annotated → grouped → rendered`. Each step is testable in isolation. Today, debugging "why is this card demoted" requires tracing through five-layer-deep boolean state.
8. A bug-test corpus as automated tests, not a markdown file. The design docs reference bug-test.md repeatedly as the canonical test inventory. I see no evidence in the uploaded code of automated test infrastructure — no `tests/`, no test framework imports. Every detector change is presumably re-verified by manual Amazon searches. Frozen sample HTML pages run on every build would catch regressions without a human reproducing the search.

What I'd keep unchanged: the four-posture framework itself (it's genuinely good and underused), the multi-strategy scrape fallback pattern (defensive against DOM drift), the separation of error reporting from usage telemetry (privacy-respecting), the killswitch, the "show our work" ethic in user-facing notes. The bones are sound. The skin is mostly bolt-ons accreted around real bugs, which is honest and how products get built — but at this point the bolt-ons are obscuring the architecture the docs already describe.

The single rephrasing that captures it: stop writing detectors that produce booleans. Start writing detectors that produce justified postures. Everything downstream — UI, telemetry, override behavior, curation feedback — gets easier when each card's verdict carries its own reasoning.

\---

## User

Do you believe there is value in Actually Useful as an extension? Does it fill a need? If the user were able to take the results in the extension and further filter and sort them on a website comparison table, theoretically that could be a place to inject an affiliate code and monetize it. What other Amazon annoyances aren't being met by existing tools (price change history is well-done by others, for example) and could be made a part of Actually Useful?

\---

## Claude

Yes, I think AU fills a real need — and one that's gotten worse, not better, in the last few years. Amazon's search results have steadily degraded into a mix of dropship junk, sponsored placements, AI-generated listings, fake variants, and review-laundered relistings. The people who feel this acutely feel it as a daily papercut. The question isn't whether there's a need; it's whether enough of those people are annoyed enough to install a browser extension. Extension friction is real — most users have <5 installed, and shoppers aren't typically extension power-users.

That said, the audience that does install shopping extensions skews heavily toward "people who don't trust Amazon and shop deliberately" — which is also the audience most likely to monetize well on a comparison-table affiliate model. The Honey / Rakuten / Capital One Shopping crowd has proven this audience exists and converts. AU's positioning is different (defensive filtering rather than coupon-hunting), but the user is overlapping. It's a defensible niche.

On the comparison-table monetization
This is the strongest strategic move on the board, and I think you should lean into it harder than the current architecture suggests.

The extension by itself is a defensive tool — you use it when you're frustrated. Defensive tools are intermittent. The comparison table is constructive — you use it every time you're choosing between options. Constructive tools are daily. That's the difference between "thing I install and forget" and "thing I open whenever I'm shopping."

It also resolves an ethical tension that would otherwise bite you. If affiliate links live in the search-page filter, every demotion looks potentially conflicted ("you demoted brand X because you don't get paid on it"). If affiliate links live downstream on the comparison page — where the user has opted into "I'm seriously considering these N items, help me decide" — the user has already selected the candidates and the affiliate link is just on the final outbound click. That's defensible to users and to the FTC. Disclose the relationship plainly on the comparison page, do nothing weird in the filter, and you're clean.

A few practical notes worth verifying before committing (these change periodically and I'd check current state rather than rely on my read): Amazon Associates commission rates by category (groceries pay almost nothing; tools, electronics, fashion pay better — and this affects which categories are worth investing detection effort into), the 24-hour cookie window (probably fine since people compare-then-convert quickly), and the program's ToS around browser extensions specifically. Some affiliate programs explicitly prohibit extension-driven referrals; Amazon's stance here has been ambiguous historically.

The strategic move I'd make: treat the extension as the funnel, not the destination. The extension's job is to surface good candidates and remove bad ones. The website's job is to help the user make the decision and convert. Premium features (persistent comparison lists, price-watch on a comparison set, shared/exportable comparison sheets, notes that survive across sessions) all live on the website where you have full control.

Underserved Amazon annoyances
You're right that Keepa and Camelizer have price history locked down. Fakespot got absorbed into Firefox in a way that left a lot of users without a good review-trust tool. Honey/Rakuten/Capital One Shopping all do coupons; nobody seriously does trust signals on the listing itself. There's a gap.

The strongest candidates that fit AU's existing architecture (search-card scraping, no product-page fetch):

Listing-data accuracy as a parallel axis to brand/seller quality. AU today is about who's selling this. There's an underserved axis about is what they're claiming accurate. The two together would be a stronger value prop than either alone.

Specific things I'd build:

* Stale-discount detection. "Save 30%" against a list price that hasn't been valid in years is rampant. The card carries enough data (current price, list price, savings percentage). Compute the apparent discount; flag when it's suspiciously round or doesn't match the price-history floor. Multiple regulators have gone after this practice; users would notice and appreciate the call-out.
* Variation rot. "Available in 27 colors" where 23 are out of stock or are sock puppets for review-laundering. The search card sometimes shows variation counts; you can sanity-check against a quick probe. The "merged listing" review-stuffing problem (where a phone case inherits a laptop sleeve's review history) is a related issue users hate.
* Sold-by / ships-from clarity at search time. Amazon hides the third-party seller and origin until product-page. The search card sometimes carries enough hints (badges, Prime status, "Ships from Amazon" tag) to flag when something is third-party with co-mingled inventory. Counterfeit risk is a real concern for electronics, supplements, baby formula, makeup.
* Review-velocity anomalies. Not full review-trust analysis — just "this listing has 4.5 stars from 12,000 reviews but the review count tripled in three weeks" as a flag. Cheap to compute from review-count delta if you cache previous visits.
* Hidden-Prime pricing tells. The non-Prime price is sometimes dramatically higher; non-Prime users see only the inflated number. Surface "Prime price: $X; standard: $Y" when both are detectable.
* Bundling claim vs reality. Pack-count vs photo mismatch is hard from card data alone, but the title/image mismatch ("Pack of 3" with a single-item hero shot) is detectable enough that even noisy heuristics would catch the worst offenders.
* Soft-fail availability. Items that show in search but are actually back-ordered weeks out. The delivery filter is a proxy; better data would beat it.

Weaker fits (would need product-page integration or a backend):

* Recall information (would need a real recall database)
* Detailed return policy parsing
* Used/refurbished disclosure (Amazon hides this behind Buy Box logic that varies)

If I were ranking these by ratio of (pain felt) × (ease to detect from search cards) × (no good existing tool), I'd put stale-discount detection at the top, sold-by/ships-from clarity second, and review-velocity flagging third. All three slot naturally into the existing detector framework — they're new postures on the same data, not new infrastructure.

One honest concern
The audit findings around brand-detection accuracy become more pointed once money is on the line. Right now an over-aggressive false positive demotes a real brand and a user shrugs. Once affiliate links route to a comparison page, an over-aggressive false positive demotes a brand the user might have bought — and that's revenue lost on a decision the tool made for them. The fixes I suggested (real bundled allowlist, drop solo-triggers, surface signals in UI) get more important the closer you get to monetization, not less.

The good news: that audit work makes the extension better in a way users will feel, and the comparison-page monetization gives you the budget rationale to do it.

\---

## User

What would it look like to have AU enhance other Amazon pages and not just search results? If AU could see the product page, your saved for later list, your shopping cart, your previous purchases,  your lists, what would that look like?

\---

## Claude

The frame shift here is interesting: AU stops being "a filter on the search firehose" and becomes "a personal shopping memory layer over Amazon." Amazon's data is structured for Amazon's benefit — Buy Box favors what makes them the most margin, "Frequently bought together" is ads, search rank reflects sponsored placement. AU's pitch becomes: your Amazon, indexed for you. That's a much bigger product than a search-page extension, and it's also a much more defensible one because it builds personal data lock-in nobody else has.

Let me walk through each surface and then talk about what unifies them.

Product page
This is the highest-ROI next step. The user has clicked into commit-mode; they want confidence. Everything AU already computes on search results becomes useful here, plus things only visible at this level.

* The "why was this demoted?" reveal. If the user got here from a search where AU demoted this listing, surface that reasoning prominently. Let them confirm or reject — and feed the rejection back as implicit allowlist signal. That feedback loop is more honest than asking users to fiddle with the popover menu.
* Variation trap. Clicking a size/color often changes price and sometimes seller silently. AU could compute a "you selected X; this changes price from $A to $B and switches from Prime to non-Prime" callout in the moment.
* Seller decode. "Sold by" / "Ships from" / FBA-vs-FBM / co-mingled inventory is buried and confusing. Amazon-fulfilled third-party with co-mingled inventory is the counterfeit risk profile users should know about for electronics, supplements, baby formula, makeup. The data is on the page; nobody surfaces it usefully.
* PPU breakdown on demand. Show the user the math: title says 12 oz, count says 6, computed PPU is $X/oz; alternative pills available. Same transparency principle as search.
* Old-reviews-on-new-product detection. Amazon's review-laundering problem comes from listings whose product changed but kept the review history. AU can't fully solve this without listing-change history (see "primitives" below), but a soft signal — "this listing has been edited; the photo no longer matches early review descriptions" — would be valuable.

Cart
Commit-imminent mode. Don't add UI noise; surface the few things worth blocking on.

* Cart consistency check. "You added \[X] from search where AU demoted it — confirm?" One-line, dismissible. Recovers users who clicked through anyway and forgot why.
* Free-shipping add-on trap. "$4 more for free shipping" frequently triggers add-ons that cost more than the shipping they save. Show the math.
* Sponsored-origin reminder. If the user added something that came from a sponsored search slot, mention it neutrally. Some users will keep it; some will reconsider. Either is fine.
* Bundle math. Multiple items from the same seller? Sometimes a bundle SKU exists at a discount.

Cart is small scope and high impact. Worth building early.

Saved-for-later, lists, wishlists
These are curated future intent. AU already knows what the user cares about — it can do work without being asked.

* Implicit price-watch. Honey/Capital One Shopping do this with their own watch lists; AU could do it on whatever's in your existing Saved-for-Later without any extra setup. "3 items hit their 6-month low this week" is a useful weekly digest.
* Listing rot. Did this item change since you saved it? Seller swap, title rewrite, model number change — all signs the thing you wanted may not be what's there now. AU can detect these by storing what the listing looked like when you saved it (local-only, no backend needed).
* Bulk-compare from list. Send 6 saved items to the AU comparison table with one click. This is the conversion path: saved items → comparison → affiliate outbound.

Order history / previous purchases
Highest user value, highest privacy stakes, highest Amazon adversarial risk. Build last; build it right.

* Personal price baseline. "You paid $X for this last year; it's $Y now." More relevant than Keepa's range chart for the user's own decisions.
* Implicit personal allowlist. Items the user has bought and kept (no return, no 1-star review) become signals that their brands are okay for that user — even if AU's heuristics would otherwise flag them. This is how the false-positive problem gets fixed at the individual level.
* Replenishment without sales pitch. "You bought paper towels every \~6 weeks; you're due." Amazon does this to upsell. AU does it as a neutral nudge — and it can recommend the user's previously chosen brand, not whatever has the highest commission.
* Return-history-driven seller flags. If the user has returned X% of items from a specific seller, flag that seller in future search results. Personal feedback loop.

The unifying primitives
A few capabilities, if built once, power many features above:

* Listing fingerprint / change-detection. Store (locally) a hash of key listing attributes — title, seller, brand, primary image hash, model number, price — when AU first sees a listing the user interacts with. Detect drift on revisit. This single primitive enables review-laundering detection, saved-item rot, "this isn't the same product you bought" warnings, and many more.
* Personal product graph. Local-only store of: items the user has searched for, viewed, compared, saved, bought, returned, reviewed. With brand and category derived. This is the substrate for personalization that isn't surveillance — because it never leaves the device.
* Cross-surface judgment coherence. A demote in search means something on product page, in cart, in saved-for-later. Same brand judgment everywhere. The user shouldn't have to re-train AU on each surface.
* Reversibility. Every AU action is undoable. Every demote can be confirmed-or-rescued in context. This becomes especially important as AU's judgments touch more surfaces — a misfire that the user sees three times in one shopping session is dramatically more annoying than one in search.

Honest concerns

* Permissions creep. Each new manifest match increases install friction and Chrome Web Store scrutiny. Order history especially. The justification needs to be clear in onboarding, and the privacy story needs to be airtight — "all your data stays on your device" or the brand erodes.
* Privacy positioning is the moat. Honey was bought for what it knew about its users. AU's differentiator can be the opposite: we know nothing about you; everything is local; that's why we work in your interest. The architectural cost of being local-first is real (no easy cross-device sync, harder to ship list updates) but the brand cost of not being local-first is fatal for this product.
* Amazon adversarial response. Amazon doesn't love extensions that modify its pages. Order history is the most sensitive surface. They could change CSPs, add anti-extension JS, or restructure pages adversarially. The product should expect this and design scrape paths defensively (the multi-strategy approach AU already uses for brand is the right pattern).
* Maintenance scales with surface count. Each scraped page is a scrape pipeline that drifts. Audit findings about scrape-failure invisibility (B-11 in my earlier report) get worse, not better, when you have 5 pipelines instead of 1. Building the "scrape health is a first-class metric" infrastructure before expanding is more important than building it after.
* Scope discipline. Everything above is buildable. Building all of it at once is the failure mode. I'd order it: product page (high impact, natural extension, builds on existing detectors) → cart (small scope, useful) → saved/lists (passive value, low cost, monetization-aligned) → order history (biggest payoff, biggest stakes, build last).

The narrative I'd build externally: AU is the only Amazon companion that's on your side at every surface, with nothing it learns ever leaving your device. That positioning differentiates from Honey (PayPal owns your data), Keepa (good product, limited scope, paywall friction), and the abandoned Fakespot. Each new surface adds to the story rather than complicating it — if you keep the privacy spine intact.

\---

## Claude

Looks like your message came through as just a backslash — did you mean to send something? I'm happy to keep going on whatever direction you want to take this. Some threads we could pull on:

* Concrete next-step prioritization (what to build first, what depends on what)
* The local-first architecture question in more detail — how the personal product graph actually works without becoming a maintenance burden
* Listing-change detection as a primitive — what to hash, when, storage cost
* Going back to any specific audit finding and digging deeper
* Something else entirely

What were you going to ask?

\---

## Claude

Actually Useful — Accuracy Audit
Auditor: Claude Opus 4.7. Scope per the audit prompt: brand detection, unit detection, PPU calculation, telemetry composition. UI, performance, code style, compare.html, compare-bridge.js out of scope.

Convention: every finding is tagged \[confirmed] (read in code) or \[inferred] (logical consequence I have not run to reproduce). Line numbers refer to the uploaded files. Severity is impact × likelihood × user-visibility; fix scope is band-aid / structural / diagnostic.

1. Brand subsystem
1A. False-positive risks
B-1. `signalAllCapsInvented` is a solo trigger gated by a fashion-only passlist. \[confirmed]
* What. `detectGibberishBrand` flags any all-caps brand of ≥5 letters with no spaces as gibberish on the strength of one signal alone (`signalAllCapsInvented`, score 1 → `hasSoloSignal === true` → flagged). The only escape hatch within the heuristic is `ALL\_CAPS\_PASSLIST`. Reading the passlist (search.js:1155–1164), the active entries (≥5 letters — shorter ones can't fire the signal at all and are dead) are overwhelmingly fashion/apparel: ZARA, ASOS, ADIDAS, GUCCI, PRADA, BCBG, ECCO, ALDO, LOFT, SOMA, WHBM, CHICO, REEBOK, ASICS, SKECHERS, MERRELL, WRANGLER, CARHARTT, DICKIES, WOLVERINE, TIMBERLAND, COLUMBIA, PATAGONIA, NORTHFACE, MARMOT, ARCTERYX, CIDER, CUPSHE, SHEIN, ROMWE, ZAFUL, VENUS, TORRID, ELOQUII, GRACE, KARIN, BIVENANT, ANRABESS, MEROKEETY. There are essentially no consumer-electronics, appliance, tool, kitchen, photo, or audio brands on the passlist.
* Worked examples. I traced the function by hand for several real all-caps brands of ≥5 letters; the ones below all fire `signalAllCapsInvented` as a solo trigger (no other signal fires) and are therefore flagged on score 1:

`CASIO` — vowels 3/5, no other signal fires, not on passlist → flagged.
`NIKON` — vowels 2/5, no other signal fires, not on passlist → flagged.
`CANON` — vowels 2/5, not on passlist → flagged.
`EPSON` — vowels 2/5, not on passlist → flagged.
`ANKER`, `BELKIN`, `DEWALT`, `RYOBI`, `MAKITA`, `KYOCERA` — same pattern. All flagged.
`BOSCH`, `LODGE`, `PYREX` — also fire `signalNoVowel` and `signalShortAllCaps` (1-vowel words), so they're flagged at score 3. Removing the solo-trigger rule would not save these — they'd still be flagged.

* Where. search.js:1150–1169 (signal), search.js:1171–1174 (solo-trigger rule).
* Severity. High. This is a category-wide miss: any large search where listings carry all-caps non-fashion brands will see real brands demoted as "unrecognized." Default mode is demote, default user setting is `moveUnrecognized: true` (search.js:1491), so this happens by default for new installs. The user-visible label is "unrecognized brands moved to end" (search.js:2705), which is soft enough that the user is unlikely to investigate.
* Fix scope. Structural. Options, in increasing order of effort:

Require corroboration: change the rule so `signalAllCapsInvented` flags only when at least one other signal also fires (drop solo-trigger). Worked examples above suggest the false-positive surface collapses sharply.
Ship a real bundled allowlist (see B-3 below) so the passlist isn't the only safety net.
Both.

B-2. `signalFakeMashup` substring-matching false-positives on real compound brands. \[confirmed]

* What. `signalFakeMashup` is also a solo trigger (search.js:1146–1148, then 1172). The mashup detector runs every entry of `COMMON\_WORDS` (search.js:1108–1137, \~120 entries including very short tokens: `go`, `co`, `pro`, `lab`, `fit`, `one`, `two`, `new`, `axe`, `bee`, `owl`, `fox`) through `bLower.includes(word)` with no length floor on the word and no word-boundary check. Two substring hits anywhere in the lowercased brand → flagged.
* Worked examples (traced by hand against the code):

`GoPro` → `gopro` includes `go` (pos 0) and `pro` (pos 2) → 2 hits → flagged.
`Sunlight` → `sunlight` includes `sun` and `light` → 2 hits → flagged.
`Lifeproof` → `life` and `pro` → 2 hits → flagged.
`BlackBerry` → `black` and `berry` → 2 hits → flagged.
`Newshows` → `new`, `show`, `shows` → ≥2 → flagged (this one is in the design doc as a target; it's not a false positive).

* Where. search.js:1108–1148.
* Severity. High. GoPro and BlackBerry alone are enough to make the false-positive rate visible to many users. The substring-without-boundary approach makes the FP surface scale with brand frequency in compound English: any two short common-English fragments anywhere in a name suffice.
* Fix scope. Structural. Tighten the matcher: require word-boundary or CamelCase split match (the CamelCase code path on line 1144 already has a `length >= 3` filter — extend that discipline to the substring path), and consider raising the threshold above 2 for solo-trigger eligibility. The current code already has the right hook (`camelHits`) and just needs to stop trusting raw `.includes()` of 2-char tokens.

B-3. Bundled allowlist described in the design doc is not implemented. \[confirmed]

* What. `Brand\_Filter\_Design.md` (lines 84–86, 119–137, 276–287) specifies a bundled allowlist of \~200–500 brands, loaded from `extension/data/brand\_allowlist.txt` at startup, checked before scoring. None of this exists in the code. I grep'd: no `bundledAllowlist` variable, no `loadBundledAllowlist` function, no `brand\_allowlist.txt` reference in search.js, background.js, core.js, or manifest.json's web\_accessible\_resources. The bundled blocklist is there (search.js:4877–4888, manifest.json line 23); the allowlist counterpart is absent.
* Where. Expected at search.js around line 1057 (before the `personalAllowlist` check) and at startup chain (search.js:4969–4988). Currently the only "allowlist" mechanisms are (a) the 50-ish-entry `ALL\_CAPS\_PASSLIST` inside `detectGibberishBrand` (only protects against `signalAllCapsInvented`, not other signals), and (b) the empty-by-default `personalAllowlist` from `chrome.storage.local`.
* Severity. High. This is the false-positive safety net described in the design doc. Without it, B-1 and B-2 have no scalable mitigation: every false-positive must be hand-added by each user, per device (the doc explicitly defers cross-device sync). The Session 3 build order item is partially complete (blocklist + personal lists wired; bundled allowlist not).
* Fix scope. Structural. The wiring is straightforward — `loadBundledBlocklist` (search.js:4877) is a copy-paste template — but the content of the allowlist file is the real work (the doc names a 200–500-brand target with curated sources).

B-4. `scrapeBrand` Strategy 3 false-positive list omits material adjective categories. \[confirmed]

* What. When the first two scrape strategies fail, Strategy 3 (search.js:1034–1043) takes the first word of the title as the brand, with a stop-list:

```
  the|a|an|for|with|by|premium|extra|heavy|ultra|thick|white|black|bright|pure|classic|super|best|pro|true|new|large|small|big|soft|hard|clear|blank|bulk|pack|set|kit|high|low|top|max|mini|micro|multi|anti|non
```

Missing categories that commonly start Amazon titles: many common color words (red, blue, green, yellow, orange, purple, gray, brown, gold, silver, pink); size modifiers (medium, tall, short); number-words (one, two, three, double, triple, quad); descriptors (eco, organic, natural, fresh, smart, digital, wireless, portable, professional, deluxe, vintage); and 3-letter color words like "red" (length 3 passes the length filter, not on the stop-list).

* Worked example. "Red velvet hand soap" → first word `Red` → length 3 → not in stop-list → returned as brand. Then "Red" enters `detectGibberishBrand`. Length 3 letters → none of the signals fire (all require length ≥5 or letters ≥5). So it ends up with brand = "Red", brandFlagged = false. That's a miss (the real brand may have been on `.a-size-base.a-color-secondary` and not extracted), but at least it doesn't false-flag. However, "Vintage" → 7 letters, all letters, lowercase mixed → fakeMashup runs — `vintage` contains nothing in COMMON\_WORDS that I can see, signal doesn't fire. OK.
* The bigger risk is the opposite: a legitimate short brand like "Eco" being returned, then "Eco" gets pushed downstream as the brand, and the user's mental model of "we filtered by brand" is wrong (it's filtering by a stopword-style adjective that scrape mistook for a brand).
* Where. search.js:1034–1043.
* Severity. Medium. Affects display correctness more than filter accuracy — `detectGibberishBrand` returns `flagged: false` for most adjective-as-brand cases. But the brand string flows into `topFilteredBrands` telemetry and the `\[•••]` per-card menu, so a user blocking "Red" effectively blocks anything starting with "Red ".
* Fix scope. Band-aid. Expand the stop-list. Or, structurally: refuse Strategy 3 entirely when the first word is ≤4 chars (most real brands the catalog cares about are at least that long).

B-5. `isAmazonBrand` is comparison-fragile. \[confirmed]

* What. search.js:1223: `var isAmazonBrand = brand ? amazonBrandsList.indexOf(brand.toUpperCase()) !== -1 : false;`. The list is loaded with `.map(l => l.toUpperCase())` (search.js:4871) — fine. But scrapeBrand returns the brand as scraped (case-preserved, internal whitespace collapsed, no trailing-punctuation strip). If the scrape produces "AmazonBasics," (with trailing comma from a poorly-segmented byline), the `.toUpperCase()` is "AMAZONBASICS," which won't match "AMAZONBASICS" in the list.
* Where. search.js:1015–1045 (cleanBrand only collapses spaces, see line 1016), search.js:1223 (comparison).
* Severity. Low–Medium. Affects the Amazon-brands demote toggle, which is off by default. Worth fixing but not critical.
* Fix scope. Band-aid. Strip non-alphanumeric trailing chars in cleanBrand or in the comparison.

1B. Hardcoded lists
B-6. `ALL\_CAPS\_PASSLIST` has duplicates and dead entries. \[confirmed]

* What. The passlist (search.js:1155–1164) contains `DKNY` twice (line 1156) and `BCBG` twice (lines 1156 and 1158). Also contains entries that are too short to ever fire the gated signal: `H\&M` (2 letters after `\&` strip), `GAP`, `COS`, `TED`, `REI`, `UGG` (3 letters), `VANS`, `FILA`, `PUMA`, `COLE`, `LEVI`, `SOLY` (4 letters). The signal requires `letters.length >= 5`, so these can never trigger the signal and therefore the passlist entry is dead code.
* Severity. Low. No accuracy impact (harmless), but signals incomplete review and may mislead a future contributor reading the list as a coverage hint.
* Fix scope. Band-aid. Dedupe and document.

B-7. `bundledBlocklist` count is unverifiable in this audit. \[inferred]

* What. Design doc says the blocklist ships with 70 starter brands. I can't read `brand\_blocklist.txt` (not uploaded). The cost of omission from this list is high — a junk brand the heuristic also misses will pass through. The cost of false inclusion is also high — a legitimate brand on the bundled blocklist is always flagged, with no in-detector escape hatch (personalAllowlist is the only override; see ordering note in 1C below).
* Severity. Cannot evaluate without the file. Flag as needing inspection.
* Fix scope. Diagnostic. Audit the file contents.

1C. Intent vs. behavior gap
B-8. Override precedence does not match the design doc. \[confirmed]

* What. `Brand\_Filter\_Design.md` states (line 90): "If brand is on the blocklist, always filter it regardless of signals. Takes priority over allowlist." In the code (search.js:1056–1069), the order is:

`personalAllowlist` → return `flagged: false` immediately
`bundledBlocklist` → return `flagged: true` immediately
`personalBlocklist` → return `flagged: true` immediately

Because `personalAllowlist` is checked first and returns early, personal allowlist beats bundled blocklist in the code. The doc says blocklist > allowlist.

* Note. The doc was written assuming a bundled allowlist; the personal allowlist is a separate construct it doesn't directly address. Reasonable people could argue user choice should win. But the implementation should be a conscious decision, not an artifact of statement order. Right now it is the latter.
* Where. search.js:1056–1069.
* Severity. Medium. Affects niche but real cases: user manually allowlists "OUGES" (perhaps they like it); bundled blocklist also contains "OUGES"; design doc intent says block wins, code says allow wins. Telemetry-driven curation won't notice this — the brand never appears in `topFilteredBrands` because allowlist short-circuited.
* Fix scope. Structural decision (which precedence is correct), then band-aid edit (reorder the three returns).

B-9. UI label "unrecognized brands" overclaims confidence. \[confirmed]

* What. The render's info-bar copy reads `' · '+brandFlaggedCt+' unrecognized brands moved to end'` (search.js:2705). The high-noise banner (search.js:2735–2747) doubles down ("a lot of noise in these results"). These labels do not distinguish flagged-by-blocklist (high confidence) from flagged-by-solo-heuristic (low confidence). They present every demotion equivalently as a confident judgment.
* Where. search.js:2705, 2737, 2741.
* Severity. Medium. The user can't easily tell whether to trust the filter. Combined with B-1/B-2 false positives, this is what makes the false flags lasting damage rather than visible bugs.
* Fix scope. Structural. The render layer doesn't currently have access to why a brand was flagged (only `brandFlagged: bool`). Surfacing the `brandDetection.signals` array per row and using it for differential copy would require small UI work.

1D. Silent failures
B-10. `applyBrandBlock` overwrites prior heuristic signals on the in-memory item. \[confirmed]

* What. When the user clicks "Always hide \[Brand]" from the popover, `applyBrandBlock` (search.js:3048–3053) iterates `allData` and writes `r.brandDetection = {signals: \['personalBlocklist'], score: 1, flagged: true}` for every matching item. This overwrites any prior signal data for those items. The next call to `doLog` (triggered by `render()` on line 3057, which calls `scheduleLog` on 3182) will therefore under-count the heuristic-signal hits, because the brand that originally fired `signalNoVowel + signalConsonantCluster` now has `signals: \['personalBlocklist']`.
* Effect on telemetry. `signalNoVowelHits`, `signalConsonantClusterHits`, etc. (search.js:1558–1562) all filter on `r.brandDetection.signals.indexOf('signalX')`. So after a user manually blocks a brand that originally fired heuristics, those heuristic-hit counts decrease by however many listings of that brand existed on the page.
* Symmetric on allowlist. `applyBrandAllow` (search.js:3024–3029) calls `detectGibberishBrand(r.brand)` fresh, which hits the personalAllowlist short-circuit and returns `{signals: \['personalAllowlist'], score: 0, flagged: false}`. Same effect: original signals lost.
* Where. search.js:3024–3030 (allow), 3048–3053 (block).
* Severity. Medium (telemetry-accuracy; not user-visible directly). The signal hit counts in the Google Sheet are biased downward, in proportion to how much manual blocking users do. The bias is silent — no field tracks "items where signals were overwritten by user action."
* Fix scope. Diagnostic. Either preserve the original signals array (e.g., add user-action signals additively rather than overwriting), or log signal counts at scrape time and lock them.

B-11. `scrapeBrand` returning `null` is silent. \[confirmed]

* What. When all three scrape strategies fail, brand is `null` (search.js:1044) and the item is exempt from filtering. No telemetry counts this — `brandsFilteredTotal` filters by `brandFlagged \&\& brand !== null`, and there is no `brandsScraped` / `brandsNull` field anywhere in `doLog` (search.js:1511–1572).
* Effect. If an Amazon DOM update causes `scrapeBrand` to silently fail on, say, 80% of cards, the filter's hit count drops dramatically but nothing surfaces this as a failure. Telemetry would show "low junk on this search" — indistinguishable from "Amazon shipped cleaner results."
* Where. search.js:1015–1045 (no instrumentation), 1511–1572 (no scrape-rate field).
* Severity. High. This is the canonical silent-failure shape: an extractor whose degradation looks identical to success. The design doc names ">70% scrape rate" as a success criterion (Brand\_Filter\_Design.md line 361), but the telemetry pipeline can't measure it.
* Fix scope. Diagnostic. Add `brandsScrapedCount` and `brandsNullCount` to the `doLog` payload. One line each. Also: log `brandsScrapedByStrategy` (which of the three selectors won) to detect partial Amazon-side selector drift.

1E. Coupling
B-12. Brand passlist coverage is implicitly coupled to AU's tested category mix. \[confirmed]

* What. The passlist content reads as the tail of Brand\_Filter\_Design's "bug-test categories that have been verified working" — heavy on dresses, leggings, and other apparel categories. The signals were tuned on those categories (design doc Session 1 findings, line 256–261). Run AU on a search outside those categories (electronics, tools, kitchen, photo) and the false-positive rate rises sharply because the passlist provides no coverage and the heuristics were never tuned against those distributions.
* Severity. Medium–High (depending on cross-category usage).
* Fix scope. Structural — covered by B-3 (real bundled allowlist).

B-13. Brand detection feeds the high-noise banner. \[confirmed]

* What. The high-noise banner appears when `brandFlaggedCt / allData.length >= 0.25` (search.js:2737–2741). If brand detection over-flags (B-1, B-2), the banner over-fires; if scraping silently degrades (B-11), the banner under-fires. The user-facing message ("a lot of noise in these results") nudges the user to apply Amazon's own filters, which AU has no further say in.
* Severity. Medium. Compounds B-1 errors with a "you should distrust this page" prompt that the user has no way to verify.
* Fix scope. Band-aid (raise threshold) or structural (gate on signal-source mix; if all flags are heuristic solo-triggers, suppress the banner).
2. Unit subsystem
2A. False-positive risks
U-1. `LENGTH\_UNITS` includes the bare token `'in'`. \[confirmed]
* What. search.js:42: `LENGTH\_UNITS = \['ft','feet','foot','meter','meters','m','cm','centimeter','centimeters','inch','inches','in','yard','yards','sq ft','square feet','square foot','square meter','square meters']`. The bare token `'in'` is also the most common English preposition.
* Where used. `parseAmazonUnitPrice` returns `{ppu, unit: normalizeUnit(um\[1])}` (search.js:847) — normalizeUnit doesn't touch `'in'` so it stays as `in`. `scrapeCard` then checks `LENGTH\_UNITS.includes(ap.unit)` at search.js:1273, 1277. If Amazon ever reports a unit string containing the literal "in" without further context — unlikely from the parenthesized PPU pattern, more likely from the broader `text.match(/\\(\\$(\[\\d.]+)\\s\*\\/\\s\*(\[^)\\n,]+)\\)/i)` fallback (search.js:850) — `in` could be captured as the unit. The catalog (Unit\_Catalog\_Phase1.md line 275) flags this risk explicitly.
* Severity. Low — I couldn't construct a code path that fires this on real Amazon output, but the token has no functional use ("inches" already covers it) and the risk is non-zero.
* Fix scope. Band-aid. Remove `'in'` from `LENGTH\_UNITS`.

U-2. `normalizeUnit`'s leading-number strip silently discards rate denominator. \[confirmed]

* What. search.js:169: `u = u.replace(/^\\d+\\s+/, '');`. The intent (comment lines 167–168) is to handle "100 sheets" → "sheets". But Amazon sometimes reports per-N PPU strings like "100 ct" meaning "the listed PPU is per 100 count" — i.e., the 100 is the denominator of the rate, not a quantity to be stripped. Stripping it gives `unit = ct` and `ppu = (the per-100-ct price)`, which is 100× too low.
* Where. search.js:164–186, called from search.js:847.
* Severity. Medium. I cannot confirm without sample data whether Amazon currently emits per-100-style strings on `(text/N unit)` lines. Inferred risk from the pattern. If the function is right that "100 sheets" means "the unit is sheets and there are 100 in this package" — then the PPU may need recomputation. If it means "the price is per 100 sheets" — strip is wrong.
* Fix scope. Diagnostic — find sample listings that hit this path and confirm semantics before deciding direction.

U-3. `extractCount` pack patterns over-broad. \[confirmed]

* What. Several patterns at the end of `extractCount` (search.js:877–878) match `pack` or `pk` after any digit-and-spaces, including titles where "pack" doesn't denote count (e.g., "Hydration pack 2 liter"). The last-in-pats-list ordering helps somewhat (more specific item-count patterns win), but for short titles where no specific pattern matches, generic pack/pk can mis-count.
* The catalog (Unit\_Catalog\_Phase1.md lines 162–166) flags `pack` as backpack/daypack/six-pack-abs noun.
* Worked example. Title "Tactical pack 25L hiking" → no count pattern matches "25" (no "ct" / "count" / etc. after). Goes to fallback. `extractCount` returns `null` — actually fine here. Where it might miss: "Best 4 backpacks under $50" type listing titles, though those are unusual on Amazon.
* Severity. Low. The natural ordering of patterns and the digit-bound minimums (`n > 1 \&\& n < 10000`) absorb most cases.
* Fix scope. Band-aid if anything surfaces in practice.

U-4. `extractCount` patterns for "Nft"/"N feet" allow short-length titles to source counts. \[confirmed]

* What. Search.js:882–883 accepts footage values ≥5 as a count. The catalog (Unit\_Catalog\_Phase1.md line 258) calls out the existing guard as "doesn't help when a count regex matches first." Confirmed by ordering: the `ft` extraction is after the `pats` loop, so if any earlier pattern matched, the ft branch is skipped. So the catalog point holds — a title with both "8 piece" and "25 ft" would extract 8 from the piece pattern and never reach ft. Probably correct (piece comes first for set descriptions), but the inverse — "Garden hose 25 ft 2 piece set" — would extract 2 (a count), losing the 25-ft length signal that's the actual buyable quantity.
* Severity. Medium. Affects hose/cord/rope categories.
* Fix scope. Structural — `extractCount` returns a single value with no source tag; the caller can't tell whether it's a piece count or a footage count. Returning `{n, source}` would let `guessCountUnit` make a better decision.

U-5. `guessUnitFromTitle` early-return on pack/roll/bag. \[confirmed]

* What. search.js:915: `if(/\\bpack\\b|\\bpacks\\b|\\broll\\b|\\brolls\\b|\\bbag\\b|\\bbags\\b/.test(lower)) return null;`. If any of these words appear in the title, the function bails. Intent seems to be: if it's a pack/roll/bag, the count-unit (ct) is fine and we don't need to override. But the function is called as a fallback after `guessCountUnit`, which already handles pack/roll/bag via specific regexes. So the early-return is redundant and it can suppress legitimate sub-unit detection — e.g., "100 wipes per pack" has both "wipes" and "pack"; `guessUnitFromTitle` returns null instead of "wipe", which could matter when `guessCountUnit` also missed because the regex for "wipes" requires a digit-precedes structure not present here.
* Severity. Low–Medium. Hard to assess without sample data.
* Fix scope. Band-aid — remove the early-return after confirming what cases it was intended to protect against.

2B. Hardcoded lists
U-6. Inconsistent unit-string coverage across WEIGHT\_UNITS, LIQUID\_UNITS, and the regex passes. \[confirmed]

* What. `WEIGHT\_UNITS` (search.js:40) includes `oz, g, gram, grams, kg, kilogram, kilograms, lb, lbs, pound, pounds` — note no `ounce` or `ounces`, even though `normalizeUnit` knows to map `ounce/ounces → oz` (search.js:173). So if any code path consults `WEIGHT\_UNITS.includes(ap.unit)` before normalizeUnit normalizes the string, the check fails. In practice the code path runs `normalizeUnit` first (`parseAmazonUnitPrice` line 847, 851, 853), so this works. But the symmetric `LIQUID\_UNITS` (line 39) does include `fluid ounce` and `fluid ounces` — so the two arrays follow different conventions.
* The regex passes that look for weight tokens in raw titles (e.g., `parseTitleWeightQty` search.js:993, `isMultiPackWeight` line 960, weight-from-title at line 1287) all explicitly include `ounce|ounces`, so they're internally consistent. But the inconsistency between the constant arrays and the regexes is brittle: a future contributor adding a path that consults `WEIGHT\_UNITS` against a pre-normalize string would see weird misses on "ounce"/"ounces" titles.
* Severity. Low. No active bug, but a footgun.
* Fix scope. Band-aid. Either keep both arrays post-normalize (and add a comment saying so) or add `ounce, ounces` to `WEIGHT\_UNITS` for symmetry.

U-7. `CONTAINER\_UNITS` excludes `bottle, jar, can, jug, canister, tub` etc. used by `isMultiPackWeight`. \[confirmed]

* What. `CONTAINER\_UNITS = \['roll','rolls','box','boxes','pack','packs','package','packages','pouch','pouches','tube','tubes']`. But `isMultiPackWeight`'s Condition C container-word regex (search.js:963) checks `bag|box|pouch|can|canister|jug|bottle|carton|tub|pail`. So the two notions of "container word" diverge.
* Severity. Low. Each function uses the list that's appropriate for its purpose. But it makes maintenance harder — if Amazon adds a new container word, you'd need to know which list to update.
* Fix scope. Band-aid. Document, or unify.

2C. Intent vs. behavior gap
U-8. `isPaperWeightLb` window is 40 chars, hardcoded paper-grade list. \[confirmed]

* What. search.js:982–987. Window: 40 chars after the lb match. Words: `cover|bond|text|index|weight|cardstock|card\\s\*stock|gsm|basis|bristol|vellum`. Misses: `linen` (textured cardstock finish), `parchment`, `glossy`, `matte`, `coated`, `uncoated`, `sulphite`. Also misses paper-grade lb in reverse order — "Cover Stock, 65 lb" — because the regex looks only after the lb match. Intent (per catalog and Override\_Principle.md) is suppress for paper grade; behavior misses non-Eastern-paper-jargon and pre-positioned grade words.
* Severity. Low. Narrow case, but the detector is the foundation other paper-handling code is built on (e.g., search.js:996 in `parseTitleWeightQty`, line 1289 in scrapeCard, line 1327 in multi-pack, line 1355 in weight-from-title). A miss here cascades to all four.
* Fix scope. Band-aid. Expand keyword list and consider symmetric pre-match window.

U-9. `isServingWeight` keyword list misses non-supplement contexts. \[confirmed]

* What. search.js:976: `whey|isolate|casein|collagen|creatine|bcaa|amino|pre-workout|mass gainer|greens|protein|serving|servings`. Catalog (Phase 1 line 77) names "coffee bean dosage, pre-workout doses" as missed by the supplement-keyword gate. Confirmed by reading: nothing here gates on coffee-context (coffee, espresso, ground, beans, dose), nor on drink-mix-context (electrolyte, hydration, scoop). So "Coffee single-origin 20g protein equivalent" type titles wouldn't hit the suppressor; a stray "20g" would be picked up as the product weight.
* The keyword `protein` is itself broad: it fires on "Protein bars" (where the lb/oz on the title might be per-serving, but also might be per-bar weight which is meaningful for per-bar PPU). Hard to tell which sense is intended by the title without category context.
* Severity. Medium for the supplement-edge case `isServingWeight` is named for. Other categories (coffee dose, drink mix scoop) are out-of-scope of this handler by design but are flagged by Phase 1.
* Fix scope. Structural — Phase 3 work per the design docs; not a band-aid candidate.

U-10. `isMultiPackWeight` Condition B fires on "food" and "detergent" anywhere in title. \[confirmed]

* What. search.js:966: substance words checked anywhere in title — `rice|flour|sugar|oats|oatmeal|coffee|beans|lentils|pasta|kibble|food|feed|seed|seeds|salt|powder|protein|formula|detergent|softener`. False-positive on titles where these words are descriptors rather than what's being sold:

"Dog food bowls 4-pack" → `food` triggers Condition B → returns true → weight (the bowl's weight, scraped from title or elsewhere) gets multiplied by count → nonsense PPU.
"Detergent dispenser pump" → `detergent` triggers → multiplier applied.
"Powder room organizer 5 piece" → `powder` triggers.

* Severity. Medium. Magnitude depends on whether these descriptor-titles also have a weight in them. Often they don't (no oz/lb in title), so the function's return value doesn't matter — the call path requires both a weight and a count to fire (scrapeCard:1320, 1367). When both are present, the multiplier is applied silently.
* Where. search.js:958–968, callers at 1320, 1323, 1367.
* Fix scope. Structural. Condition B's "any substance word in title" is the wrong shape — it needs to know the substance word is what's being sold, not what the product is for. Phase 3 detector design territory.

U-11. `applyPairsNote` matches `\\bpairs?\\b` too broadly. \[confirmed]

* What. search.js:943: `if(/\\bpairs?\\b/i.test(title))`. Catches "pair of replacement blades," "comes with a pair of socks," "set of 3 paired with X." The Phase 4 scope (Unit\_Catalog\_Phase1.md lines 367–375 and Phase2\_Taxonomy.md line 271) names this explicitly. The handler fires the note whenever Amazon supplied the PPU and the word appears.
* Behavior detail. The unit relabel to `"pair"` only fires when current unit is `ct` or empty (search.js:947). The note fires whenever pair-word appears (line 944–945). So the note is broader than the relabel. The catalog's Phase 4 item #2 ("Only fires when unit is ct or empty, meaning a possibly-wrong $/oz from Amazon goes un-flagged") is partially incorrect re. the note — the note does still fire when unit is oz; only the relabel doesn't. So $/oz with "pair" in title gets a note but keeps the (possibly wrong) unit name.
* Severity. Low (Phase 4 owns it).
* Fix scope. Structural per Phase 4 plan.

2D. Silent failures
U-12. `inferLiquidDominant` threshold can flip the entire sort. \[confirmed]

* What. search.js:189–208. Returns true when `termIsLiquid \&\& total > 0 \&\& liquidCount/total >= 0.6`. When `isLiquidDominant` is true, the sort pipeline treats `oz` as `fl oz` (search.js:142, 144), the normalizePPUForSort skips weight-conversion (line 145, returns ppu as-is), and `unitFamilyForSort` lumps `oz` into the liquid family (line 153–154). One boolean changes the entire weight-vs-liquid behavior of the page.
* The threshold (0.6 of items with detected unit) is a binary cliff. A search of 100 items with 30 oz units and 30 ml units = 0.5 → false. A search with 30 oz and 31 ml = 31/61 > 0.5 but only matters if termIsLiquid. The cliff is not user-visible.
* Where. search.js:189–208, consumers at 142, 154, 230 (`generateUnitPills`), 2622–2624 (sort family fix at the per-pair level, not at the page level).
* Severity. Medium. Boundary cases on the threshold can flip the entire result order with no indication. The info line says "liquid category (oz≈fl oz)" only when liquid-dominant is true; when false, there's no indication that the determination was made and is just-below threshold.
* Fix scope. Structural. Either soften the binary (e.g., bucket-sort within the threshold zone and flag) or surface the determination always (e.g., "65% liquid units; treating oz as fl oz").

U-13. `applyLiquidCtConversion` silently divides by title's fl oz with no validation. \[confirmed]

* What. search.js:1383–1394 walks `data`, finds items with `unit === 'ct'`, extracts an fl oz value from the title via `extractFlOzFromTitle`, and rewrites `r.ppu = r.ppu / perItemFlOz; r.unit = 'fl oz'; r.source = 'calc-liquid'`. There's no plausibility check on `perItemFlOz`. `extractFlOzFromTitle` (search.js:210) matches the first `\\d+(?:\\.\\d+)?` before fl oz; for "Contact lens solution 12 fl oz (12)" it grabs 12 from the first match (correct). For "Pack of 6 — 12 fl oz bottles" it grabs 6 — wait, no: regex is `(\\d+(?:\\.\\d+)?)\\s\*(?:fl\\.?\\s\*oz|fluid\\s\*ounces?)`. The digit immediately precedes fl oz. So for "Pack of 6 — 12 fl oz", it grabs 12.
* The bigger silent-failure shape: if the title has multiple fl oz values, the function takes the first with no awareness of multi-pack semantics ("6 × 12 fl oz" — per-can volume vs. total). The "per-can price" comment (line 1392) implies per-can semantics are assumed; the math is `r.ppu / perItemFlOz` (price-per-can divided by oz-per-can = $/fl oz), which is right if perItemFlOz is per-can.
* Severity. Medium. Niche but real. The path is hit specifically when a `ct`-unit item has an fl oz in the title, which is the multi-can-soda / canned-soup / canned-beverage shape.
* Fix scope. Band-aid: validate `perItemFlOz` is sane (e.g., 0.1 < value < 100). Structural: connect to count, so $/fl oz uses `(price / count) / perItemFlOz` only when count agrees.

U-14. `parseTitleWeightQty` takes first-match without context. \[confirmed]

* What. search.js:992–1010. Uses `title.match()` for oz / lb / g / kg — first occurrence wins. For "Boxing gloves 16 oz with 4 oz insert" → 16. For "Premium cardstock 65 lb cover, 100 sheets, 8.5x11 inch" → 65 (then `isPaperWeightLb` catches this case and the lb is suppressed — good). But for cases the paper-weight detector misses (U-8) or for non-paper specs the catalog flags (fishing line `20 lb test`, capacity ratings, etc.), the first match is taken as the product weight.
* Severity. Medium. Source of the Shape A collisions documented in Phase2\_Taxonomy.md, especially the Chat 100 findings that AU produces $/lb on fishing line and boxing gloves independently of Amazon's behavior. The function is one of the primary collision sources.
* Fix scope. Structural — Phase 3 territory.

2E. Coupling
U-15. `applyLiquidCtConversion` runs over already-scraped `r.ppu` without knowing its source. \[confirmed]

* What. The function does not branch on `r.source`. So a card whose `ppu` was already calculated downstream (`calc`, `calc-weight`, `calc-single`) can be subjected to ct→fl oz conversion if its unit happens to be `ct` and its title contains fl oz. Stacking arithmetic on already-massaged values is the cleanest way to compound errors.
* Severity. Low–Medium. Hard to construct a clean example without sample data; flagged as a structural concern.
* Fix scope. Structural. Either gate by source or annotate the conversion with provenance.

U-16. `inferLiquidDominant` decision feeds three downstream behaviors. \[confirmed]

* What. A wrong `isLiquidDominant` decision (U-12) affects: (a) per-item sort PPU (search.js:142–148), (b) unit-family bucketing for sort comparison (line 150–157), (c) which pill is recommended (search.js:230–267), (d) the info-bar message (search.js:2697), and (e) the `liquidDominant` telemetry field (search.js:1541). The user sees five surface effects of one infer-call, and there's no diagnostic that explains why the boolean is true or false (search term match? unit ratio? both?).
* Severity. Medium. This is high-coupling on a fragile inference.
* Fix scope. Diagnostic — log the inputs to the inference (term-was-liquid bool, liquidCount, weightCount) so post-hoc analysis is possible.
3. PPU subsystem
3A. False-positive risks
P-1. `scrapeCard`'s `solidUnitIsWrong` third-disjunct fires on legitimate single-pack solids. \[confirmed]
* What. search.js:1242–1246:

```
  var solidUnitIsWrong = ap \&\& titleIsSolid \&\& count \&\& price \&\& (
    WEIGHT\_UNITS.includes(ap.unit) ||
    LIQUID\_UNITS.includes(ap.unit) ||
    (Math.abs(ap.ppu - price) / price < 0.01)
  );
```

The third disjunct — "Amazon's PPU ≈ price" — fires on Shape G (whole-package $/ct). But combined with `titleIsSolid \&\& count`, it can also fire on legitimate single-pack pods/sheets/strips where `count === 1` and the Amazon PPU correctly equals the listing price ($/pod = price for a 1-pod pack). The override then sets `ppu = price / count = price / 1 = price`, same numerically, but with the unit relabeled from whatever Amazon said to `guessCountUnit(title) || 'ct'`. That's not a numerical error but is a quiet unit-label change.
More problematically, if a 1-pack of a solid product has Amazon's $/wash PPU correctly displayed and AU overrides to $/ct because of the third-disjunct match, the pill semantics shift.

* Severity. Low. Numerical impact is null; semantic impact is minor.
* Fix scope. Band-aid. Gate the third-disjunct on `count > 1`.

P-2. Cascading paths in `scrapeCard` for "Amazon weight/liquid unit but no title weight". \[confirmed]

* What. search.js:1285–1317. Branch order:

If `!titleHasWeightQty`: try footage; else show $/item; else suppress.
If `titleHasWeightQty` and `WEIGHT\_UNITS.includes(ap.unit) \&\& price`: weight sanity check; if off by >10%, recalc.

The weight sanity check (line 1310–1316) uses `parseTitleWeightQty(title, ap.unit)` (subject to U-14 above) times `(count || 1)`. If `parseTitleWeightQty` returns the wrong weight (e.g., grabs a spec rather than the product weight), the sanity check thinks Amazon is wrong and rewrites PPU. So a correct Amazon PPU can be overridden to a wrong recalculated PPU on inputs where AU's title parser misreads the title.

* Severity. Medium. This is where Phase 2 Chat 100 finding lives: AU produces bad PPU on titles where Amazon would have been correct (or absent). The detector's accuracy is bounded by `parseTitleWeightQty`'s accuracy.
* Where. search.js:1310–1316, dependencies at 992–1010, 982–987 (paper-weight guard).
* Fix scope. Structural — Phase 3.

P-3. Multi-pack × weight applied silently in two code paths. \[confirmed]

* What. Two code paths apply `count × weight` when `isMultiPackWeight(title)` is true:

search.js:1320–1344 (Amazon supplied a unit price but no usable count/unit alignment).
search.js:1367–1372 (no Amazon unit price; computing from title).

Both rely on `isMultiPackWeight`, which fires on "food," "detergent," etc. anywhere in title (U-10). The note that surfaces is `count + ' × ' + qty + ' ' + unit + ' = ' + total + ' ' + unit + ' total'` (search.js:1337) — placed in `ppuNote`, not `note`. This matters for whether the "we recalculated" mixed-units banner shows up (see D-1 below).

* Severity. Compounds U-10. Medium.
* Fix scope. Structural — Phase 3.

3B. Hardcoded lists
P-4. `COUNTABLE\_SOLID\_TITLE\_KEYWORDS` is small and category-specific. \[confirmed]

* What. search.js:1236–1239: `pod, pods, pac, pacs, fling, flings, tab, tabs, sheet, sheets, strip, strips, load, loads`. Tuned for laundry/dishwasher detergent and adjacent products. Misses other consumption-unit-equivalence categories that the design docs flag for future work (Override\_Principle.md lines 86–93): coffee pods/K-cups (k-cup, kcup not in list), pet food (kibble in `isMultiPackWeight` but not here), gum (sticks, pieces — "stick" not in list but "tab" is which causes ambiguity).
* The list is consulted in lowercase regex-word-boundary form (`\\b<kw>\\b`), so doesn't false-fire on substrings.
* Severity. Medium. Closes some Phase 2 Shape E cases for laundry, misses other categories that the design treats as same-shape.
* Fix scope. Structural — Phase 3 work to define equivalence classes.

P-5. Convert tables for `convertPPU` hardcode `fluid ounce`/`fluid ounces` but `normalizeUnit` always produces `fl oz`. \[confirmed]

* What. `convertPPU` (search.js:121–139) has entries for `'fluid ounce'`/`'fluid ounces'` in `toFlOz`. But every code path that calls `convertPPU` runs the unit through `normalizeUnit` first, which maps `'fluid ounce'`/`'fluid ounces' → 'fl oz'` (line 172). So the long-form entries are dead code. Not an accuracy issue but suggests the conversion table was written before normalizeUnit was wired up; future maintainers may add entries inconsistently.
* Severity. Low. Cleanup, not a bug.
* Fix scope. Band-aid.

3C. Intent vs. behavior gap
P-6. `solidUnitIsWrong` mixes Shape E and Shape G detection in one expression. \[confirmed]

* What. The three disjuncts in `solidUnitIsWrong` (search.js:1243–1245) correspond to three different override rationales:

`WEIGHT\_UNITS.includes(ap.unit)` — Shape A (Override\_Principle.md): Amazon's weight unit is wrong for a solid product → recategorize to count.
`LIQUID\_UNITS.includes(ap.unit)` — similar shape, but for liquids.
`Math.abs(ap.ppu - price) / price < 0.01` — Shape G (whole-package $/ct): Amazon's PPU is the full price.

These are different problems with different (but coincident) actions. The current code treats them as a single OR. The Override Principle doc explicitly separates them (Shape A: spec rating; Shape G: whole-package $/ct).

* Severity. Low. No incorrect output today, but the structure makes it hard to diagnose which disjunct fired in a given case. Telemetry doesn't say.
* Fix scope. Structural — Phase 3 framework.

3D. Silent failures
P-7. Mixed-units banner only fires for `source === 'calc' || source === 'none'`. \[confirmed]

* What. search.js:2722: `overriddenItems = allData.filter(function(r){return r.note \&\& (r.source === 'calc' || r.source === 'none');});`. So the banner ("we had to interpret or recalculate") triggers only for those two sources. Sources `calc-weight`, `calc-single`, `calc-liquid`, `calc` (already in), `amazon-container`, `unavailable` — only `calc` and `none` count. But several override paths produce `calc-weight` (search.js:1338, 1340, 1370, 1373), `calc-single` (1303, 1376), `calc-liquid` (1391). These overrides happen silently — no banner.
* Severity. High. This is a textbook silent-override path. Multi-pack weight multiplication, weight-from-title computation, and ct→fl oz conversion all bypass the user-facing "we changed something" indicator.
* Where. search.js:2722–2733 (banner), source assignments throughout scrapeCard.
* Fix scope. Band-aid: extend the filter to include `calc-\*` sources. Structural: encode per-item the strength of the override (defer / pill / recategorize / suppress per Override\_Principle.md) so the banner can present accordingly.

P-8. Override paths leave `note` field empty in some branches. \[confirmed]

* What. Some override-producing paths put text in `note`; others use `ppuNote` instead:

Multi-pack × weight (line 1338, 1371) — uses `ppuNote`, not `note`.
Per-item from weight (line 1340, 1373) — uses `note`.
Liquid ct conversion (line 1392) — uses `note`.
Recalc from count (line 1259) — uses `note`.

The banner gate (P-7) only checks `r.note`, so items with `ppuNote` but empty `note` cannot trigger the banner regardless of their source. Combined with P-7, the multi-pack × weight path is doubly invisible.

* Severity. High. Compounds P-7.
* Fix scope. Band-aid. Unify on `note` (and use a separate `ppuTooltip` if a shorter inline format is needed).

P-9. `applyPairsNote` notes can disappear via subsequent `Object.assign`. \[confirmed]

* What. `applyPairsNote` (search.js:941–950) sets `result.note = note + 'Sold in pairs ...'`. The function is called in scrapeCard at lines 1262, 1266, 1269, 1271, 1318. Subsequent `Object.assign(base, {...})` calls in the other branches don't preserve notes set by earlier branches — but since the branches are exclusive (each returns), that's actually fine. The risk is at post-scrapeCard passes like `applyLiquidCtConversion`, which sets `r.note = 'converted from per-can price'` (line 1392) — overwriting any note that was already there (including pairs note).
* Severity. Low. Probably rare ("X pair" listing with also fl oz value); flagged.
* Fix scope. Band-aid. Concatenate rather than overwrite.

3E. Coupling
P-10. PPU correctness is downstream of brand detection through render filtering. \[confirmed]

* What. Items filtered by brand (when brand-filter is on) are demoted, which means they fall below the "best value" bar in display. Their PPU is still computed. But if the user is sorting by PPU and brand-filter is hiding (not demoting), the lowest PPUs may be hidden. This is the documented intent (Brand\_Filter\_Design.md "Hide vs demote").
* More importantly, the best PPU indicator (search.js:2769) is computed from `displayData` after the kw/source/sponsored/etc. filters apply, but before brand-demotion in the rendered list. So a brand-demoted item's correct PPU could still be the best, awarded a star (search.js infrastructure I didn't read), even though its display position is at the bottom. Whether that's intended is unclear — the Brand\_Filter\_Design.md open question #5 names this explicitly: "Brand filter affecting the best-value star — demoted items still eligible? Probably yes. Confirm during Session 2."
* Severity. Low. Design ambiguity, not a clear bug.
* Fix scope. Diagnostic — confirm intent and document.

P-11. PPU pill selection coupling to `inferLiquidDominant`. \[confirmed]

* What. `generateUnitPills` (search.js:230–267) gates `pills` differently based on `isLiqDom`. When `isLiqDom` is true, the `'per item'` pill is suppressed (line 257: `\&\& !isLiqDom`). When `isLiqDom` is false but `convertibleCount < 2 \&\& !hasMinorityUnits`, `pills` is reset to empty (line 264). So a wrong `isLiquidDominant` (U-12) propagates to which pills the user can see.
* Severity. Medium. Same root as U-12.
* Fix scope. Structural — see U-12.
4. Telemetry subsystem
4A. False-positive risks
(Not the framing — telemetry doesn't have false positives in the detector sense. Read as "wrong-output risks.")

T-1. Signal hit counts are biased downward by user-driven blocklist actions. \[confirmed]

* What. Detailed in B-10. After any user "Always hide" action, the in-memory `r.brandDetection.signals` is overwritten to `\['personalBlocklist']`. The next `doLog` call (triggered \~5s later via `scheduleLog`) reports lower hit counts for the heuristic signals than were observed during the original scrape.
* Severity. Medium (telemetry, not user-visible).
* Fix scope. Diagnostic.

4B. Hardcoded lists
T-2. Telemetry has hit-counter fields for 5 heuristic signals + personal blocklist, but not `bundledBlocklist` or `personalAllowlist`. \[confirmed]

* What. search.js:1558–1564 logs:

`signalNoVowelHits`
`signalConsonantClusterHits`
`signalShortAllCapsHits`
`signalFakeMashupHits`
`signalAllCapsInventedHits`
`personalBlocklistHits`

But `detectGibberishBrand` also emits `'bundledBlocklist'` and `'personalAllowlist'` signals (search.js:1058, 1063). Neither has a telemetry counterpart. So:

You cannot tell from the log how many items were flagged by the bundled blocklist vs. by heuristics. Both contribute to `brandsFilteredTotal` indistinguishably.
You cannot tell how many items were rescued by user allowlists — i.e., the false-positive volume that the personalAllowlist absorbed. This is exactly the data needed to drive bundled allowlist curation (the design doc's prescribed workflow).

* Severity. High. Direct gap in the curation feedback loop. The design doc says (Brand\_Filter\_Design.md:131–137) "Driven by telemetry. Sort Google Sheet by `brandsDistinctCount` descending, read `topFilteredBrands`, google unknowns, add legitimate ones to allowlist." But the curator cannot see which brands the heuristic-flagged-but-user-rescued — that's the highest-value signal for "add to bundled allowlist."
* Fix scope. Diagnostic. Add `bundledBlocklistHits`, `personalAllowlistHits` (and possibly `personalAllowlistTopBrands`) to `doLog`.

T-3. `topFilteredBrands` does not encode why each brand was flagged. \[confirmed]

* What. search.js:1557: `topFilteredBrands` is a string like `"OUGES(12),GORGLITTER(8),ZESICA(5)"` — brand name + count. There is no per-brand source. A curator reviewing the sheet cannot tell whether OUGES was flagged by `bundledBlocklist`, `signalAllCapsInvented` solo, or multiple heuristics. The design doc's workflow ("look for brands scoring 0 that keep appearing") assumes the curator can see the score; the data shipped doesn't include it.
* Severity. High. Same root finding as T-2 — the design's curation loop assumes data that isn't in the logs.
* Fix scope. Diagnostic. Augment `topFilteredBrands` with per-brand signal sets, or add a parallel field like `topFilteredBrandsSignals`.

T-4. Signal hit counts are item-level, not brand-level. \[confirmed]

* What. Counts on line 1558 etc. are `allData.filter(...).length` — they count individual listing hits, not distinct brands. So one MOFFBUZW brand appearing on 20 listings contributes 20 to the count. This makes the distribution opaque: "120 signalAllCapsInvented hits" could mean "120 distinct gibberish brands" or "6 popular gibberish brands × 20 listings each." These have different implications for blocklist curation.
* Severity. Medium.
* Fix scope. Diagnostic. Add per-signal distinct-brand counts alongside hit counts.

4C. Intent vs. behavior gap
T-5. No `brandsScraped` field; cannot measure scrape success rate. \[confirmed]

* What. Detailed in B-11. The design doc names ">70% scrape rate" as a success criterion; the logs cannot measure it. There's no field counting `brand !== null` against `brand === null`, nor a breakdown by scrape strategy.
* Severity. High (silent failure on detector health).
* Fix scope. Diagnostic.

4D. Silent failures
T-6. The fundamental telemetry-vs-action gap: log says what was filtered, not why. \[confirmed]

* What. This is the most consequential structural finding. Reading `doLog` end-to-end:

`brandsFilteredTotal`, `brandsDistinctCount`, `topFilteredBrands` describe outputs.
Hit counts for five heuristic signals describe inputs partially (excludes bundled/personal lists).
There is no field that ties brand → signal-set, no field for bundled-blocklist hits, no field for allowlist rescues, no field for scrape failure rate.

Net effect: when looking at a curation row in the sheet, the operator has no causal handle. They can see that OUGES showed up 12 times this week, but not whether the reason is "blocklist did its job," "heuristic flagged it," "both," or "personal allowlist failed to rescue it." All four imply different curation actions.

* Severity. High. This is the prompt's explicit question — "does telemetry distinguish between different sources of a flag?" The answer is no, only at aggregate signal-count level, and that level doesn't include bundled-blocklist or allowlist signals.
* Where. search.js:1511–1572.
* Fix scope. Structural — restructure telemetry around (brand, signals) tuples.

4E. Coupling
T-7. Telemetry samples in-memory state after user actions have already mutated it. \[confirmed]

* What. `doLog` is called via `scheduleLog`, which has a 5-second debounce (search.js:1506–1509). Render calls `scheduleLog` (line 3182). So if the user does N filter actions within 5 seconds, only one log fires, and it reflects state after ALL of them — including any signal overwrites from `applyBrandBlock` (B-10). The log is not a sample of "initial detector behavior on this page" — it's a sample of "state at log time, which may include user-driven cleanup."
* Severity. Medium.
* Fix scope. Diagnostic. Snapshot signal counts immediately after initial scrape, log that snapshot rather than re-deriving from in-memory state.
5. Open-ended tail
What the structured questions didn't ask about
* `brand`-as-flow-control: the brand field is consumed in five different ways — brand filter, Amazon brands demote, per-card menu, `topFilteredBrands` telemetry, compare payload (per design doc). A bug in `scrapeBrand` cascades to all five. The structured questions implicitly cover each consumer, but the shared single point of failure deserves naming.
* The killswitch path (search.js:4964–5008) is the only network call AU makes on every page load besides the log/error endpoints. It fetches `https://actuallyuseful.net/killswitch.json` and proceeds anyway after a 3s timeout. This is the only place the extension could be told to update detector lists remotely. Today it is binary (disabled / not disabled). Worth noting that a more sophisticated kill-switch could push allowlist/blocklist deltas; that's a structural opportunity, not a current bug.
* The 5s log debounce + `scheduleLog` in `render` means a quick-clicking user can defer logs indefinitely. Each render call resets the timer. A user actively interacting (sorting, clicking pills, blocking brands) might never produce a log for a session. Not an accuracy bug per se but affects telemetry sampling rate.

Patterns appearing in more than one subsystem

* Solo-trigger semantics with implicit lists as the only escape. Brand subsystem has `signalAllCapsInvented` solo-firing against the fashion-only passlist (B-1); PPU subsystem has `solidUnitIsWrong`'s third disjunct silently overriding on a coincidence test (P-1); unit subsystem has `isMultiPackWeight` Condition B firing on any substance word anywhere (U-10). The shape is the same: one signal, no corroboration, no exit ramp except a hardcoded list.
* Override telemetry hostility: outputs logged, sources not. `topFilteredBrands` doesn't carry signal source (T-3); the "we changed something" banner doesn't see `calc-\*` sources (P-7); `applyBrandBlock` clobbers signals so the original heuristic firing is lost (B-10). Three subsystems, same gap: AU can act on detector output but cannot diagnose the action later.
* Hardcoded lists tuned to the test mix. Fashion-heavy brand passlist (B-1); laundry-heavy `COUNTABLE\_SOLID\_TITLE\_KEYWORDS` (P-4); supplement-keyword `isServingWeight` (U-9); paper-grade `isPaperWeightLb` (U-8). Each list was clearly compiled against the categories that surfaced the originating bug; each fails systematically outside that category. The fix is the same in all four cases — broaden coverage via curation, or move the detection up a level of abstraction (Phase 3 work).
* Solo-trigger + tuned-to-test-mix list is the highest-FP combination. B-1 has both, hence its top-severity rank.

Top three findings by severity

* B-1 (signalAllCapsInvented solo-trigger + fashion-only passlist). High impact, high likelihood, default-on behavior with soft user-facing label. Affects every search containing all-caps non-fashion brands.
* T-6 (telemetry says what was filtered, not why), with T-2, T-3, T-5 as components. Locks in B-1 and B-2 by preventing the design's prescribed curation loop from running. The maintainer cannot tell from the Google Sheet which brands flagged are heuristic-false-positives vs. real junk vs. allowlist rescues vs. scrape failures.
* B-3 (bundled allowlist not implemented) + P-7/P-8 (silent PPU overrides). Same shape from two sides: AU acts on data, the safety net described in the design is missing, and the user has no signal that the action happened. B-3 makes B-1's false positives unrecoverable at scale; P-7/P-8 hide the multi-pack × weight and `calc-\*` recalculations entirely.

Questions for the developer most useful for prioritization

* For B-3: Was the bundled allowlist intentionally deferred, or did the Session 3 build run partial and never close? The Brand\_Filter\_Design.md doesn't mark Session 3 with ✅. If it's deferred, what's the unblocker — sourcing the \~300-brand starter list?
* For B-1: Is the solo-trigger rule for `signalAllCapsInvented` defensible against the test data you have? The Session 1 finding (Brand\_Filter\_Design.md:259) says "Both signals are high-confidence enough to flag alone." On what category mix was that confidence assessed? If it was the dress / apparel mix, the conclusion may not transfer.
* For T-6: Is there appetite for a small schema change to `doLog` that adds 4–6 fields (bundledBlocklistHits, personalAllowlistHits, brandsScraped, brandsNull, topFilteredBrandsSignals, signal-overwrite-count)? The Apps Script and Sheet header row would need a one-time update.
* For U-10 / U-14: What's the planned cutover from the four bolt-on detectors (`isPaperWeightLb`, `isMultiPackWeight`, `isServingWeight`, `applyPairsNote`) to the Phase 3 unified framework? Specifically: is it acceptable to ship a near-term band-aid that narrows Condition B (the "any substance word in title" path) before Phase 3 lands, or is the plan to wait?
* For P-7: Why does the mixed-units banner gate on `source === 'calc' || source === 'none'` rather than `source.startsWith('calc')`? Was it intentional to exclude `calc-weight`, `calc-single`, `calc-liquid`, or is that an oversight?
* For B-9: Is "unrecognized brands moved to end" the agreed user-facing label, or transitional? If it stays, the user has no clue this includes anything from the heuristic — they'll read it as "we don't know about these," which is misleading when the actual reason is "our heuristic flagged this on one signal."

Severity-by-finding summary table
#FindingSubsystemSeverityFix scopeB-1signalAllCapsInvented solo-trigger + fashion-only passlistBrandHighStructuralB-2signalFakeMashup substring matches without word boundaryBrandHighStructuralB-3Bundled allowlist not implementedBrandHighStructuralB-4scrapeBrand Strategy 3 stop-list incompleteBrandMediumBand-aidB-5isAmazonBrand comparison fragile to punctuationBrandLow–MedBand-aidB-6ALL\_CAPS\_PASSLIST duplicates + dead entriesBrandLowBand-aidB-7bundledBlocklist content not inspected this auditBrandCannot evalDiagnosticB-8Override precedence personalAllowlist > bundledBlocklistBrandMediumStructural decisionB-9UI "unrecognized brands" overclaims confidenceBrandMediumStructuralB-10applyBrandBlock overwrites prior signalsBrandMediumDiagnosticB-11scrapeBrand returning null is invisible to telemetryBrandHighDiagnosticB-12Passlist coverage coupled to tested category mixBrandMedium–HighStructural (= B-3)B-13High-noise banner amplifies brand-detection errorsBrandMediumBand-aidU-1LENGTH\_UNITS includes bare 'in'UnitLowBand-aidU-2normalizeUnit leading-number strip semanticsUnitMediumDiagnosticU-3extractCount pack patterns broadUnitLowBand-aidU-4extractCount loses footage when count regex matches firstUnitMediumStructuralU-5guessUnitFromTitle early-return on pack/roll/bagUnitLow–MedBand-aidU-6WEIGHT\_UNITS missing ounce/ounces (vs. regex passes)UnitLowBand-aidU-7CONTAINER\_UNITS vs isMultiPackWeight container-word list divergenceUnitLowBand-aidU-8isPaperWeightLb 40-char window + narrow keyword listUnitLowBand-aidU-9isServingWeight keyword list supplement-onlyUnitMediumStructuralU-10isMultiPackWeight Condition B fires on any substance wordUnitMediumStructuralU-11applyPairsNote broad regexUnitLow (Phase 4)StructuralU-12inferLiquidDominant binary cliff, no diagnosticUnitMediumStructuralU-13applyLiquidCtConversion no validationUnitMediumBand-aidU-14parseTitleWeightQty first-match no contextUnitMediumStructuralU-15applyLiquidCtConversion doesn't check sourceUnitLow–MedStructuralU-16inferLiquidDominant feeds 5 downstream behaviorsUnitMediumDiagnosticP-1solidUnitIsWrong third disjunct on single-packPPULowBand-aidP-2Weight sanity check trusts parseTitleWeightQtyPPUMediumStructuralP-3Multi-pack × weight applied silently in two pathsPPUMediumStructuralP-4COUNTABLE\_SOLID\_TITLE\_KEYWORDS laundry-tunedPPUMediumStructuralP-5convertPPU has dead entries for normalized-away stringsPPULowBand-aidP-6solidUnitIsWrong mixes Shape A and Shape G logicPPULowStructuralP-7Mixed-units banner only sees `calc`/`none` sourcesPPUHighBand-aidP-8Override paths use `ppuNote` not `note`, banner can't seePPUHighBand-aidP-9applyLiquidCtConversion overwrites prior notesPPULowBand-aidP-10brand demote vs best-PPU star couplingPPULowDiagnosticP-11Unit pills coupled to inferLiquidDominantPPUMediumStructuralT-1Signal counts biased by user blocklist actionsTelemetryMediumDiagnosticT-2No telemetry for bundled-blocklist or personal-allowlist hitsTelemetryHighDiagnosticT-3topFilteredBrands lacks per-brand signal sourceTelemetryHighDiagnosticT-4Signal hit counts are item-level, not brand-levelTelemetryMediumDiagnosticT-5No brandsScraped field; scrape failure invisibleTelemetryHighDiagnosticT-6Telemetry says what was filtered, not whyTelemetryHighStructuralT-7Logs sample post-mutation stateTelemetryMediumDiagnostic
End of audit.



# Actually Useful — Accuracy Audit

*Auditor: Claude Opus 4.7. Scope per the audit prompt: brand detection, unit detection, PPU calculation, telemetry composition. UI, performance, code style, compare.html, compare-bridge.js out of scope.*

*Convention: every finding is tagged **\[confirmed]** (read in code) or <b>\[inferred]</b> (logical consequence I have not run to reproduce). Line numbers refer to the uploaded files. Severity is impact × likelihood × user-visibility; fix scope is band-aid / structural / diagnostic.*

\---

## 1\. Brand subsystem

### 1A. False-positive risks

**B-1. `signalAllCapsInvented` is a solo trigger gated by a fashion-only passlist. \[confirmed]**

* **What.** `detectGibberishBrand` flags any all-caps brand of ≥5 letters with no spaces as gibberish on the strength of one signal alone (`signalAllCapsInvented`, score 1 → `hasSoloSignal === true` → flagged). The only escape hatch within the heuristic is `ALL\\\_CAPS\\\_PASSLIST`. Reading the passlist (search.js:1155–1164), the active entries (≥5 letters — shorter ones can't fire the signal at all and are dead) are overwhelmingly fashion/apparel: ZARA, ASOS, ADIDAS, GUCCI, PRADA, BCBG, ECCO, ALDO, LOFT, SOMA, WHBM, CHICO, REEBOK, ASICS, SKECHERS, MERRELL, WRANGLER, CARHARTT, DICKIES, WOLVERINE, TIMBERLAND, COLUMBIA, PATAGONIA, NORTHFACE, MARMOT, ARCTERYX, CIDER, CUPSHE, SHEIN, ROMWE, ZAFUL, VENUS, TORRID, ELOQUII, GRACE, KARIN, BIVENANT, ANRABESS, MEROKEETY. There are essentially **no consumer-electronics, appliance, tool, kitchen, photo, or audio brands** on the passlist.
* **Worked examples.** I traced the function by hand for several real all-caps brands of ≥5 letters; the ones below all fire `signalAllCapsInvented` as a **solo trigger** (no other signal fires) and are therefore flagged on score 1:

  * `CASIO` — vowels 3/5, no other signal fires, not on passlist → flagged.
  * `NIKON` — vowels 2/5, no other signal fires, not on passlist → flagged.
  * `CANON` — vowels 2/5, not on passlist → flagged.
  * `EPSON` — vowels 2/5, not on passlist → flagged.
  * `ANKER`, `BELKIN`, `DEWALT`, `RYOBI`, `MAKITA`, `KYOCERA` — same pattern. All flagged.
  * `BOSCH`, `LODGE`, `PYREX` — *also* fire `signalNoVowel` and `signalShortAllCaps` (1-vowel words), so they're flagged at score 3. Removing the solo-trigger rule would not save these — they'd still be flagged.
* **Where.** search.js:1150–1169 (signal), search.js:1171–1174 (solo-trigger rule).
* **Severity.** **High.** This is a category-wide miss: any large search where listings carry all-caps non-fashion brands will see real brands demoted as "unrecognized." Default mode is demote, default user setting is `moveUnrecognized: true` (search.js:1491), so this happens by default for new installs. The user-visible label is "unrecognized brands moved to end" (search.js:2705), which is soft enough that the user is unlikely to investigate.
* **Fix scope.** Structural. Options, in increasing order of effort:

  1. Require corroboration: change the rule so `signalAllCapsInvented` flags only when at least one other signal also fires (drop solo-trigger). Worked examples above suggest the false-positive surface collapses sharply.
  2. Ship a real bundled allowlist (see B-3 below) so the passlist isn't the only safety net.
  3. Both.

**B-2. `signalFakeMashup` substring-matching false-positives on real compound brands. \[confirmed]**

* **What.** `signalFakeMashup` is also a solo trigger (search.js:1146–1148, then 1172). The mashup detector runs every entry of `COMMON\\\_WORDS` (search.js:1108–1137, \~120 entries including very short tokens: `go`, `co`, `pro`, `lab`, `fit`, `one`, `two`, `new`, `axe`, `bee`, `owl`, `fox`) through `bLower.includes(word)` with **no length floor on the word and no word-boundary check**. Two substring hits anywhere in the lowercased brand → flagged.
* **Worked examples (traced by hand against the code):**

  * `GoPro` → `gopro` includes `go` (pos 0) and `pro` (pos 2) → 2 hits → **flagged**.
  * `Sunlight` → `sunlight` includes `sun` and `light` → 2 hits → **flagged**.
  * `Lifeproof` → `life` and `pro` → 2 hits → **flagged**.
  * `BlackBerry` → `black` and `berry` → 2 hits → **flagged**.
  * `Newshows` → `new`, `show`, `shows` → ≥2 → **flagged** (this one is in the design doc as a target; it's not a false positive).
* **Where.** search.js:1108–1148.
* **Severity.** **High.** GoPro and BlackBerry alone are enough to make the false-positive rate visible to many users. The substring-without-boundary approach makes the FP surface scale with brand frequency in compound English: any two short common-English fragments anywhere in a name suffice.
* **Fix scope.** Structural. Tighten the matcher: require word-boundary or CamelCase split match (the CamelCase code path on line 1144 already has a `length >= 3` filter — extend that discipline to the substring path), and consider raising the threshold above 2 for solo-trigger eligibility. The current code already has the right hook (`camelHits`) and just needs to stop trusting raw `.includes()` of 2-char tokens.

**B-3. Bundled allowlist described in the design doc is not implemented. \[confirmed]**

* **What.** `Brand\\\_Filter\\\_Design.md` (lines 84–86, 119–137, 276–287) specifies a **bundled allowlist** of \~200–500 brands, loaded from `extension/data/brand\\\_allowlist.txt` at startup, checked before scoring. None of this exists in the code. I grep'd: no `bundledAllowlist` variable, no `loadBundledAllowlist` function, no `brand\\\_allowlist.txt` reference in search.js, background.js, core.js, or manifest.json's web\_accessible\_resources. The bundled blocklist *is* there (search.js:4877–4888, manifest.json line 23); the allowlist counterpart is absent.
* **Where.** Expected at search.js around line 1057 (before the `personalAllowlist` check) and at startup chain (search.js:4969–4988). Currently the only "allowlist" mechanisms are (a) the 50-ish-entry `ALL\\\_CAPS\\\_PASSLIST` inside `detectGibberishBrand` (only protects against `signalAllCapsInvented`, not other signals), and (b) the empty-by-default `personalAllowlist` from `chrome.storage.local`.
* **Severity.** **High.** This is the false-positive safety net described in the design doc. Without it, B-1 and B-2 have no scalable mitigation: every false-positive must be hand-added by each user, per device (the doc explicitly defers cross-device sync). The Session 3 build order item is partially complete (blocklist + personal lists wired; bundled allowlist not).
* **Fix scope.** Structural. The wiring is straightforward — `loadBundledBlocklist` (search.js:4877) is a copy-paste template — but the *content* of the allowlist file is the real work (the doc names a 200–500-brand target with curated sources).

**B-4. `scrapeBrand` Strategy 3 false-positive list omits material adjective categories. \[confirmed]**

* **What.** When the first two scrape strategies fail, Strategy 3 (search.js:1034–1043) takes the first word of the title as the brand, with a stop-list:

```
  the|a|an|for|with|by|premium|extra|heavy|ultra|thick|white|black|bright|pure|classic|super|best|pro|true|new|large|small|big|soft|hard|clear|blank|bulk|pack|set|kit|high|low|top|max|mini|micro|multi|anti|non
  ```

Missing categories that commonly start Amazon titles: many common color words (red, blue, green, yellow, orange, purple, gray, brown, gold, silver, pink); size modifiers (medium, tall, short); number-words (one, two, three, double, triple, quad); descriptors (eco, organic, natural, fresh, smart, digital, wireless, portable, professional, deluxe, vintage); and 3-letter color words like "red" (length 3 passes the length filter, not on the stop-list).

* **Worked example.** "Red velvet hand soap" → first word `Red` → length 3 → not in stop-list → returned as brand. Then "Red" enters `detectGibberishBrand`. Length 3 letters → none of the signals fire (all require length ≥5 or letters ≥5). So it ends up with brand = "Red", brandFlagged = false. That's a *miss* (the real brand may have been on `.a-size-base.a-color-secondary` and not extracted), but at least it doesn't false-flag. However, "Vintage" → 7 letters, all letters, lowercase mixed → fakeMashup runs — `vintage` contains nothing in COMMON\_WORDS that I can see, signal doesn't fire. OK.
* The bigger risk is the opposite: a *legitimate* short brand like "Eco" being returned, then "Eco" gets pushed downstream as the brand, and the user's mental model of "we filtered by brand" is wrong (it's filtering by a stopword-style adjective that scrape mistook for a brand).
* **Where.** search.js:1034–1043.
* **Severity.** **Medium.** Affects display correctness more than filter accuracy — `detectGibberishBrand` returns `flagged: false` for most adjective-as-brand cases. But the brand string flows into `topFilteredBrands` telemetry and the `\\\[•••]` per-card menu, so a user blocking "Red" effectively blocks anything starting with "Red ".
* **Fix scope.** Band-aid. Expand the stop-list. Or, structurally: refuse Strategy 3 entirely when the first word is ≤4 chars (most real brands the catalog cares about are at least that long).

  **B-5. `isAmazonBrand` is comparison-fragile. \[confirmed]**

* **What.** search.js:1223: `var isAmazonBrand = brand ? amazonBrandsList.indexOf(brand.toUpperCase()) !== -1 : false;`. The list is loaded with `.map(l => l.toUpperCase())` (search.js:4871) — fine. But scrapeBrand returns the brand as scraped (case-preserved, internal whitespace collapsed, no trailing-punctuation strip). If the scrape produces "AmazonBasics," (with trailing comma from a poorly-segmented byline), the `.toUpperCase()` is "AMAZONBASICS," which won't match "AMAZONBASICS" in the list.
* **Where.** search.js:1015–1045 (cleanBrand only collapses spaces, see line 1016), search.js:1223 (comparison).
* **Severity.** **Low–Medium.** Affects the Amazon-brands demote toggle, which is off by default. Worth fixing but not critical.
* **Fix scope.** Band-aid. Strip non-alphanumeric trailing chars in cleanBrand or in the comparison.

  ### 1B. Hardcoded lists

  **B-6. `ALL\\\_CAPS\\\_PASSLIST` has duplicates and dead entries. \[confirmed]**

* **What.** The passlist (search.js:1155–1164) contains `DKNY` twice (line 1156) and `BCBG` twice (lines 1156 and 1158). Also contains entries that are too short to ever fire the gated signal: `H\\\&M` (2 letters after `\\\&` strip), `GAP`, `COS`, `TED`, `REI`, `UGG` (3 letters), `VANS`, `FILA`, `PUMA`, `COLE`, `LEVI`, `SOLY` (4 letters). The signal requires `letters.length >= 5`, so these can never trigger the signal and therefore the passlist entry is dead code.
* **Severity.** **Low.** No accuracy impact (harmless), but signals incomplete review and may mislead a future contributor reading the list as a coverage hint.
* **Fix scope.** Band-aid. Dedupe and document.

  **B-7. `bundledBlocklist` count is unverifiable in this audit. \[inferred]**

* **What.** Design doc says the blocklist ships with 70 starter brands. I can't read `brand\\\_blocklist.txt` (not uploaded). The cost of *omission* from this list is high — a junk brand the heuristic also misses will pass through. The cost of false *inclusion* is also high — a legitimate brand on the bundled blocklist is always flagged, with no in-detector escape hatch (personalAllowlist is the only override; see ordering note in 1C below).
* **Severity.** Cannot evaluate without the file. Flag as needing inspection.
* **Fix scope.** Diagnostic. Audit the file contents.

  ### 1C. Intent vs. behavior gap

  **B-8. Override precedence does not match the design doc. \[confirmed]**

* **What.** `Brand\\\_Filter\\\_Design.md` states (line 90): "If brand is on the blocklist, always filter it regardless of signals. **Takes priority over allowlist.**" In the code (search.js:1056–1069), the order is:

  1. `personalAllowlist` → return `flagged: false` immediately
  2. `bundledBlocklist` → return `flagged: true` immediately
  3. `personalBlocklist` → return `flagged: true` immediately

  Because `personalAllowlist` is checked first and returns early, **personal allowlist beats bundled blocklist** in the code. The doc says blocklist > allowlist.

* **Note.** The doc was written assuming a bundled allowlist; the personal allowlist is a separate construct it doesn't directly address. Reasonable people could argue user choice should win. But the *implementation* should be a conscious decision, not an artifact of statement order. Right now it is the latter.
* **Where.** search.js:1056–1069.
* **Severity.** **Medium.** Affects niche but real cases: user manually allowlists "OUGES" (perhaps they like it); bundled blocklist also contains "OUGES"; design doc intent says block wins, code says allow wins. Telemetry-driven curation won't notice this — the brand never appears in `topFilteredBrands` because allowlist short-circuited.
* **Fix scope.** Structural decision (which precedence is correct), then band-aid edit (reorder the three returns).

  **B-9. UI label "unrecognized brands" overclaims confidence. \[confirmed]**

* **What.** The render's info-bar copy reads `' · '+brandFlaggedCt+' unrecognized brands moved to end'` (search.js:2705). The high-noise banner (search.js:2735–2747) doubles down ("a lot of noise in these results"). These labels do not distinguish flagged-by-blocklist (high confidence) from flagged-by-solo-heuristic (low confidence). They present every demotion equivalently as a confident judgment.
* **Where.** search.js:2705, 2737, 2741.
* **Severity.** **Medium.** The user can't easily tell whether to trust the filter. Combined with B-1/B-2 false positives, this is what makes the false flags lasting damage rather than visible bugs.
* **Fix scope.** Structural. The render layer doesn't currently have access to *why* a brand was flagged (only `brandFlagged: bool`). Surfacing the `brandDetection.signals` array per row and using it for differential copy would require small UI work.

  ### 1D. Silent failures

  **B-10. `applyBrandBlock` overwrites prior heuristic signals on the in-memory item. \[confirmed]**

* **What.** When the user clicks "Always hide \[Brand]" from the popover, `applyBrandBlock` (search.js:3048–3053) iterates `allData` and writes `r.brandDetection = {signals: \\\['personalBlocklist'], score: 1, flagged: true}` for every matching item. This **overwrites any prior signal data** for those items. The next call to `doLog` (triggered by `render()` on line 3057, which calls `scheduleLog` on 3182) will therefore *under-count* the heuristic-signal hits, because the brand that originally fired `signalNoVowel + signalConsonantCluster` now has `signals: \\\['personalBlocklist']`.
* **Effect on telemetry.** `signalNoVowelHits`, `signalConsonantClusterHits`, etc. (search.js:1558–1562) all filter on `r.brandDetection.signals.indexOf('signalX')`. So after a user manually blocks a brand that originally fired heuristics, those heuristic-hit counts decrease by however many listings of that brand existed on the page.
* **Symmetric on allowlist.** `applyBrandAllow` (search.js:3024–3029) calls `detectGibberishBrand(r.brand)` fresh, which hits the personalAllowlist short-circuit and returns `{signals: \\\['personalAllowlist'], score: 0, flagged: false}`. Same effect: original signals lost.
* **Where.** search.js:3024–3030 (allow), 3048–3053 (block).
* **Severity.** **Medium** (telemetry-accuracy; not user-visible directly). The signal hit counts in the Google Sheet are biased downward, in proportion to how much manual blocking users do. The bias is silent — no field tracks "items where signals were overwritten by user action."
* **Fix scope.** Diagnostic. Either preserve the original signals array (e.g., add user-action signals additively rather than overwriting), or log signal counts at scrape time and lock them.

  **B-11. `scrapeBrand` returning `null` is silent. \[confirmed]**

* **What.** When all three scrape strategies fail, brand is `null` (search.js:1044) and the item is exempt from filtering. No telemetry counts this — `brandsFilteredTotal` filters by `brandFlagged \\\&\\\& brand !== null`, and there is no `brandsScraped` / `brandsNull` field anywhere in `doLog` (search.js:1511–1572).
* **Effect.** If an Amazon DOM update causes `scrapeBrand` to silently fail on, say, 80% of cards, the filter's hit count drops dramatically but **nothing surfaces this as a failure**. Telemetry would show "low junk on this search" — indistinguishable from "Amazon shipped cleaner results."
* **Where.** search.js:1015–1045 (no instrumentation), 1511–1572 (no scrape-rate field).
* **Severity.** **High.** This is the canonical silent-failure shape: an extractor whose degradation looks identical to success. The design doc names ">70% scrape rate" as a success criterion (Brand\_Filter\_Design.md line 361), but the telemetry pipeline can't measure it.
* **Fix scope.** Diagnostic. Add `brandsScrapedCount` and `brandsNullCount` to the `doLog` payload. One line each. Also: log `brandsScrapedByStrategy` (which of the three selectors won) to detect partial Amazon-side selector drift.

  ### 1E. Coupling

  **B-12. Brand passlist coverage is implicitly coupled to AU's tested category mix. \[confirmed]**

* **What.** The passlist content reads as the tail of Brand\_Filter\_Design's "bug-test categories that have been verified working" — heavy on dresses, leggings, and other apparel categories. The signals were tuned on those categories (design doc Session 1 findings, line 256–261). Run AU on a search outside those categories (electronics, tools, kitchen, photo) and the false-positive rate rises sharply because the passlist provides no coverage and the heuristics were never tuned against those distributions.
* **Severity.** **Medium–High** (depending on cross-category usage).
* **Fix scope.** Structural — covered by B-3 (real bundled allowlist).

  **B-13. Brand detection feeds the high-noise banner. \[confirmed]**

* **What.** The high-noise banner appears when `brandFlaggedCt / allData.length >= 0.25` (search.js:2737–2741). If brand detection over-flags (B-1, B-2), the banner over-fires; if scraping silently degrades (B-11), the banner under-fires. The user-facing message ("a lot of noise in these results") nudges the user to apply Amazon's own filters, which AU has no further say in.
* **Severity.** **Medium.** Compounds B-1 errors with a "you should distrust this page" prompt that the user has no way to verify.
* **Fix scope.** Band-aid (raise threshold) or structural (gate on signal-source mix; if all flags are heuristic solo-triggers, suppress the banner).

  \---

  ## 2\. Unit subsystem

  ### 2A. False-positive risks

  **U-1. `LENGTH\\\_UNITS` includes the bare token `'in'`. \[confirmed]**

* **What.** search.js:42: `LENGTH\\\_UNITS = \\\['ft','feet','foot','meter','meters','m','cm','centimeter','centimeters','inch','inches','in','yard','yards','sq ft','square feet','square foot','square meter','square meters']`. The bare token `'in'` is also the most common English preposition.
* **Where used.** `parseAmazonUnitPrice` returns `{ppu, unit: normalizeUnit(um\\\[1])}` (search.js:847) — normalizeUnit doesn't touch `'in'` so it stays as `in`. `scrapeCard` then checks `LENGTH\\\_UNITS.includes(ap.unit)` at search.js:1273, 1277. If Amazon ever reports a unit string containing the literal "in" without further context — unlikely from the parenthesized PPU pattern, more likely from the broader `text.match(/\\\\(\\\\$(\\\[\\\\d.]+)\\\\s\\\*\\\\/\\\\s\\\*(\\\[^)\\\\n,]+)\\\\)/i)` fallback (search.js:850) — `in` could be captured as the unit. The catalog (Unit\_Catalog\_Phase1.md line 275) flags this risk explicitly.
* **Severity.** **Low** — I couldn't construct a code path that fires this on real Amazon output, but the token has no functional use ("inches" already covers it) and the risk is non-zero.
* **Fix scope.** Band-aid. Remove `'in'` from `LENGTH\\\_UNITS`.

  **U-2. `normalizeUnit`'s leading-number strip silently discards rate denominator. \[confirmed]**

* **What.** search.js:169: `u = u.replace(/^\\\\d+\\\\s+/, '');`. The intent (comment lines 167–168) is to handle "100 sheets" → "sheets". But Amazon sometimes reports per-N PPU strings like "100 ct" meaning "the listed PPU is per 100 count" — i.e., the 100 is the *denominator* of the rate, not a quantity to be stripped. Stripping it gives `unit = ct` and `ppu = (the per-100-ct price)`, which is 100× too low.
* **Where.** search.js:164–186, called from search.js:847.
* **Severity.** **Medium.** I cannot confirm without sample data whether Amazon currently emits per-100-style strings on `(text/N unit)` lines. *Inferred* risk from the pattern. If the function is right that "100 sheets" means "the unit is sheets and there are 100 in this package" — then the PPU may need recomputation. If it means "the price is per 100 sheets" — strip is wrong.
* **Fix scope.** Diagnostic — find sample listings that hit this path and confirm semantics before deciding direction.

  **U-3. `extractCount` pack patterns over-broad. \[confirmed]**

* **What.** Several patterns at the end of `extractCount` (search.js:877–878) match `pack` or `pk` after any digit-and-spaces, including titles where "pack" doesn't denote count (e.g., "Hydration pack 2 liter"). The last-in-pats-list ordering helps somewhat (more specific item-count patterns win), but for short titles where no specific pattern matches, generic pack/pk can mis-count.
* The catalog (Unit\_Catalog\_Phase1.md lines 162–166) flags `pack` as backpack/daypack/six-pack-abs noun.
* **Worked example.** Title "Tactical pack 25L hiking" → no count pattern matches "25" (no "ct" / "count" / etc. after). Goes to fallback. `extractCount` returns `null` — actually fine here. Where it might miss: "Best 4 backpacks under $50" type listing titles, though those are unusual on Amazon.
* **Severity.** **Low.** The natural ordering of patterns and the digit-bound minimums (`n > 1 \\\&\\\& n < 10000`) absorb most cases.
* **Fix scope.** Band-aid if anything surfaces in practice.

  **U-4. `extractCount` patterns for "Nft"/"N feet" allow short-length titles to source counts. \[confirmed]**

* **What.** Search.js:882–883 accepts footage values ≥5 as a count. The catalog (Unit\_Catalog\_Phase1.md line 258) calls out the existing guard as "doesn't help when a count regex matches first." Confirmed by ordering: the `ft` extraction is *after* the `pats` loop, so if any earlier pattern matched, the ft branch is skipped. So the catalog point holds — a title with both "8 piece" and "25 ft" would extract 8 from the piece pattern and never reach ft. Probably correct (piece comes first for set descriptions), but the inverse — "Garden hose 25 ft 2 piece set" — would extract 2 (a count), losing the 25-ft length signal that's the actual buyable quantity.
* **Severity.** **Medium.** Affects hose/cord/rope categories.
* **Fix scope.** Structural — `extractCount` returns a single value with no source tag; the caller can't tell whether it's a piece count or a footage count. Returning `{n, source}` would let `guessCountUnit` make a better decision.

  **U-5. `guessUnitFromTitle` early-return on pack/roll/bag. \[confirmed]**

* **What.** search.js:915: `if(/\\\\bpack\\\\b|\\\\bpacks\\\\b|\\\\broll\\\\b|\\\\brolls\\\\b|\\\\bbag\\\\b|\\\\bbags\\\\b/.test(lower)) return null;`. If any of these words appear in the title, the function bails. Intent seems to be: if it's a pack/roll/bag, the count-unit (ct) is fine and we don't need to override. But the function is called as a fallback after `guessCountUnit`, which already handles pack/roll/bag via specific regexes. So the early-return is redundant *and* it can suppress legitimate sub-unit detection — e.g., "100 wipes per pack" has both "wipes" and "pack"; `guessUnitFromTitle` returns null instead of "wipe", which could matter when `guessCountUnit` also missed because the regex for "wipes" requires a digit-precedes structure not present here.
* **Severity.** **Low–Medium.** Hard to assess without sample data.
* **Fix scope.** Band-aid — remove the early-return after confirming what cases it was intended to protect against.

  ### 2B. Hardcoded lists

  **U-6. Inconsistent unit-string coverage across WEIGHT\_UNITS, LIQUID\_UNITS, and the regex passes. \[confirmed]**

* **What.** `WEIGHT\\\_UNITS` (search.js:40) includes `oz, g, gram, grams, kg, kilogram, kilograms, lb, lbs, pound, pounds` — note **no `ounce` or `ounces`**, even though `normalizeUnit` knows to map `ounce/ounces → oz` (search.js:173). So if any code path consults `WEIGHT\\\_UNITS.includes(ap.unit)` *before* normalizeUnit normalizes the string, the check fails. In practice the code path runs `normalizeUnit` first (`parseAmazonUnitPrice` line 847, 851, 853), so this works. But the symmetric `LIQUID\\\_UNITS` (line 39) does include `fluid ounce` and `fluid ounces` — so the two arrays follow different conventions.
* The regex passes that look for weight tokens in raw titles (e.g., `parseTitleWeightQty` search.js:993, `isMultiPackWeight` line 960, weight-from-title at line 1287) all explicitly include `ounce|ounces`, so they're internally consistent. But the inconsistency between the constant arrays and the regexes is brittle: a future contributor adding a path that consults `WEIGHT\\\_UNITS` against a pre-normalize string would see weird misses on "ounce"/"ounces" titles.
* **Severity.** **Low.** No active bug, but a footgun.
* **Fix scope.** Band-aid. Either keep both arrays post-normalize (and add a comment saying so) or add `ounce, ounces` to `WEIGHT\\\_UNITS` for symmetry.

  **U-7. `CONTAINER\\\_UNITS` excludes `bottle, jar, can, jug, canister, tub` etc. used by `isMultiPackWeight`. \[confirmed]**

* **What.** `CONTAINER\\\_UNITS = \\\['roll','rolls','box','boxes','pack','packs','package','packages','pouch','pouches','tube','tubes']`. But `isMultiPackWeight`'s Condition C container-word regex (search.js:963) checks `bag|box|pouch|can|canister|jug|bottle|carton|tub|pail`. So the two notions of "container word" diverge.
* **Severity.** **Low.** Each function uses the list that's appropriate for its purpose. But it makes maintenance harder — if Amazon adds a new container word, you'd need to know which list to update.
* **Fix scope.** Band-aid. Document, or unify.

  ### 2C. Intent vs. behavior gap

  **U-8. `isPaperWeightLb` window is 40 chars, hardcoded paper-grade list. \[confirmed]**

* **What.** search.js:982–987. Window: 40 chars after the lb match. Words: `cover|bond|text|index|weight|cardstock|card\\\\s\\\*stock|gsm|basis|bristol|vellum`. Misses: `linen` (textured cardstock finish), `parchment`, `glossy`, `matte`, `coated`, `uncoated`, `sulphite`. Also misses paper-grade lb in *reverse* order — "Cover Stock, 65 lb" — because the regex looks only *after* the lb match. Intent (per catalog and Override\_Principle.md) is suppress for paper grade; behavior misses non-Eastern-paper-jargon and pre-positioned grade words.
* **Severity.** **Low.** Narrow case, but the detector is the foundation other paper-handling code is built on (e.g., search.js:996 in `parseTitleWeightQty`, line 1289 in scrapeCard, line 1327 in multi-pack, line 1355 in weight-from-title). A miss here cascades to all four.
* **Fix scope.** Band-aid. Expand keyword list and consider symmetric pre-match window.

  **U-9. `isServingWeight` keyword list misses non-supplement contexts. \[confirmed]**

* **What.** search.js:976: `whey|isolate|casein|collagen|creatine|bcaa|amino|pre-workout|mass gainer|greens|protein|serving|servings`. Catalog (Phase 1 line 77) names "coffee bean dosage, pre-workout doses" as missed by the supplement-keyword gate. Confirmed by reading: nothing here gates on coffee-context (coffee, espresso, ground, beans, dose), nor on drink-mix-context (electrolyte, hydration, scoop). So "Coffee single-origin 20g protein equivalent" type titles wouldn't hit the suppressor; a stray "20g" would be picked up as the product weight.
* The keyword `protein` is itself broad: it fires on "Protein bars" (where the lb/oz on the title might be per-serving, but also might be per-bar weight which is meaningful for per-bar PPU). Hard to tell which sense is intended by the title without category context.
* **Severity.** **Medium** for the supplement-edge case `isServingWeight` is named for. Other categories (coffee dose, drink mix scoop) are out-of-scope of this handler by design but are flagged by Phase 1.
* **Fix scope.** Structural — Phase 3 work per the design docs; not a band-aid candidate.

  **U-10. `isMultiPackWeight` Condition B fires on "food" and "detergent" anywhere in title. \[confirmed]**

* **What.** search.js:966: substance words checked anywhere in title — `rice|flour|sugar|oats|oatmeal|coffee|beans|lentils|pasta|kibble|food|feed|seed|seeds|salt|powder|protein|formula|detergent|softener`. False-positive on titles where these words are descriptors rather than what's being sold:

  * "Dog food bowls 4-pack" → `food` triggers Condition B → returns true → weight (the bowl's weight, scraped from title or elsewhere) gets multiplied by count → nonsense PPU.
  * "Detergent dispenser pump" → `detergent` triggers → multiplier applied.
  * "Powder room organizer 5 piece" → `powder` triggers.
* **Severity.** **Medium.** Magnitude depends on whether these descriptor-titles also have a weight in them. Often they don't (no oz/lb in title), so the function's return value doesn't matter — the call path requires both a weight and a count to fire (scrapeCard:1320, 1367). When both are present, the multiplier is applied silently.
* **Where.** search.js:958–968, callers at 1320, 1323, 1367.
* **Fix scope.** Structural. Condition B's "any substance word in title" is the wrong shape — it needs to know the substance word is what's being *sold*, not what the product is *for*. Phase 3 detector design territory.

  **U-11. `applyPairsNote` matches `\\\\bpairs?\\\\b` too broadly. \[confirmed]**

* **What.** search.js:943: `if(/\\\\bpairs?\\\\b/i.test(title))`. Catches "pair of replacement blades," "comes with a pair of socks," "set of 3 paired with X." The Phase 4 scope (Unit\_Catalog\_Phase1.md lines 367–375 and Phase2\_Taxonomy.md line 271) names this explicitly. The handler fires the note whenever Amazon supplied the PPU and the word appears.
* **Behavior detail.** The unit relabel to `"pair"` only fires when current unit is `ct` or empty (search.js:947). The *note* fires whenever pair-word appears (line 944–945). So the note is broader than the relabel. The catalog's Phase 4 item #2 ("Only fires when unit is ct or empty, meaning a possibly-wrong $/oz from Amazon goes un-flagged") is *partially* incorrect re. the note — the note does still fire when unit is oz; only the relabel doesn't. So $/oz with "pair" in title gets a note but keeps the (possibly wrong) unit name.
* **Severity.** **Low** (Phase 4 owns it).
* **Fix scope.** Structural per Phase 4 plan.

  ### 2D. Silent failures

  **U-12. `inferLiquidDominant` threshold can flip the entire sort. \[confirmed]**

* **What.** search.js:189–208. Returns true when `termIsLiquid \\\&\\\& total > 0 \\\&\\\& liquidCount/total >= 0.6`. When `isLiquidDominant` is true, the sort pipeline treats `oz` as `fl oz` (search.js:142, 144), the normalizePPUForSort skips weight-conversion (line 145, returns ppu as-is), and `unitFamilyForSort` lumps `oz` into the liquid family (line 153–154). One boolean changes the entire weight-vs-liquid behavior of the page.
* The threshold (0.6 of items with detected unit) is a binary cliff. A search of 100 items with 30 oz units and 30 ml units = 0.5 → false. A search with 30 oz and 31 ml = 31/61 > 0.5 but only matters if termIsLiquid. The cliff is not user-visible.
* **Where.** search.js:189–208, consumers at 142, 154, 230 (`generateUnitPills`), 2622–2624 (sort family fix at the per-pair level, not at the page level).
* **Severity.** **Medium.** Boundary cases on the threshold can flip the entire result order with no indication. The info line says "liquid category (oz≈fl oz)" only when liquid-dominant is true; when false, there's no indication that the determination was made and is just-below threshold.
* **Fix scope.** Structural. Either soften the binary (e.g., bucket-sort within the threshold zone and flag) or surface the determination always (e.g., "65% liquid units; treating oz as fl oz").

  **U-13. `applyLiquidCtConversion` silently divides by title's fl oz with no validation. \[confirmed]**

* **What.** search.js:1383–1394 walks `data`, finds items with `unit === 'ct'`, extracts an fl oz value from the title via `extractFlOzFromTitle`, and rewrites `r.ppu = r.ppu / perItemFlOz; r.unit = 'fl oz'; r.source = 'calc-liquid'`. There's no plausibility check on `perItemFlOz`. `extractFlOzFromTitle` (search.js:210) matches the first `\\\\d+(?:\\\\.\\\\d+)?` before fl oz; for "Contact lens solution 12 fl oz (12)" it grabs 12 from the first match (correct). For "Pack of 6 — 12 fl oz bottles" it grabs 6 — wait, no: regex is `(\\\\d+(?:\\\\.\\\\d+)?)\\\\s\\\*(?:fl\\\\.?\\\\s\\\*oz|fluid\\\\s\\\*ounces?)`. The digit immediately precedes fl oz. So for "Pack of 6 — 12 fl oz", it grabs 12.
* The bigger silent-failure shape: if the title has multiple fl oz values, the function takes the *first* with no awareness of multi-pack semantics ("6 × 12 fl oz" — per-can volume vs. total). The "per-can price" comment (line 1392) implies per-can semantics are assumed; the math is `r.ppu / perItemFlOz` (price-per-can divided by oz-per-can = $/fl oz), which is right *if* perItemFlOz is per-can.
* **Severity.** **Medium.** Niche but real. The path is hit specifically when a `ct`-unit item has an fl oz in the title, which is the multi-can-soda / canned-soup / canned-beverage shape.
* **Fix scope.** Band-aid: validate `perItemFlOz` is sane (e.g., 0.1 < value < 100). Structural: connect to count, so $/fl oz uses `(price / count) / perItemFlOz` only when count agrees.

  **U-14. `parseTitleWeightQty` takes first-match without context. \[confirmed]**

* **What.** search.js:992–1010. Uses `title.match()` for oz / lb / g / kg — first occurrence wins. For "Boxing gloves 16 oz with 4 oz insert" → 16. For "Premium cardstock 65 lb cover, 100 sheets, 8.5x11 inch" → 65 (then `isPaperWeightLb` catches this case and the lb is suppressed — good). But for cases the paper-weight detector misses (U-8) or for non-paper specs the catalog flags (fishing line `20 lb test`, capacity ratings, etc.), the first match is taken as the product weight.
* **Severity.** **Medium.** Source of the Shape A collisions documented in Phase2\_Taxonomy.md, especially the Chat 100 findings that AU produces $/lb on fishing line and boxing gloves independently of Amazon's behavior. The function is one of the primary collision sources.
* **Fix scope.** Structural — Phase 3 territory.

  ### 2E. Coupling

  **U-15. `applyLiquidCtConversion` runs over already-scraped `r.ppu` without knowing its source. \[confirmed]**

* **What.** The function does not branch on `r.source`. So a card whose `ppu` was already calculated downstream (`calc`, `calc-weight`, `calc-single`) can be subjected to ct→fl oz conversion if its unit happens to be `ct` and its title contains fl oz. Stacking arithmetic on already-massaged values is the cleanest way to compound errors.
* **Severity.** **Low–Medium.** Hard to construct a clean example without sample data; flagged as a structural concern.
* **Fix scope.** Structural. Either gate by source or annotate the conversion with provenance.

  **U-16. `inferLiquidDominant` decision feeds three downstream behaviors. \[confirmed]**

* **What.** A wrong `isLiquidDominant` decision (U-12) affects: (a) per-item sort PPU (search.js:142–148), (b) unit-family bucketing for sort comparison (line 150–157), (c) which pill is recommended (search.js:230–267), (d) the info-bar message (search.js:2697), and (e) the `liquidDominant` telemetry field (search.js:1541). The user sees five surface effects of one infer-call, and there's no diagnostic that explains *why* the boolean is true or false (search term match? unit ratio? both?).
* **Severity.** **Medium.** This is high-coupling on a fragile inference.
* **Fix scope.** Diagnostic — log the inputs to the inference (term-was-liquid bool, liquidCount, weightCount) so post-hoc analysis is possible.

  \---

  ## 3\. PPU subsystem

  ### 3A. False-positive risks

  **P-1. `scrapeCard`'s `solidUnitIsWrong` third-disjunct fires on legitimate single-pack solids. \[confirmed]**

* **What.** search.js:1242–1246:

  ```
  var solidUnitIsWrong = ap \\\&\\\& titleIsSolid \\\&\\\& count \\\&\\\& price \\\&\\\& (
    WEIGHT\\\_UNITS.includes(ap.unit) ||
    LIQUID\\\_UNITS.includes(ap.unit) ||
    (Math.abs(ap.ppu - price) / price < 0.01)
  );
  ```

  The third disjunct — "Amazon's PPU ≈ price" — fires on Shape G (whole-package $/ct). But combined with `titleIsSolid \\\&\\\& count`, it can also fire on legitimate single-pack pods/sheets/strips where `count === 1` and the Amazon PPU correctly equals the listing price ($/pod = price for a 1-pod pack). The override then sets `ppu = price / count = price / 1 = price`, same numerically, but with the unit relabeled from whatever Amazon said to `guessCountUnit(title) || 'ct'`. That's not a numerical error but is a quiet unit-label change.
More problematically, if a 1-pack of a solid product has Amazon's $/wash PPU correctly displayed and AU overrides to $/ct because of the third-disjunct match, the pill semantics shift.

* **Severity.** **Low.** Numerical impact is null; semantic impact is minor.
* **Fix scope.** Band-aid. Gate the third-disjunct on `count > 1`.

  **P-2. Cascading paths in `scrapeCard` for "Amazon weight/liquid unit but no title weight". \[confirmed]**

* **What.** search.js:1285–1317. Branch order:

  1. If `!titleHasWeightQty`: try footage; else show $/item; else suppress.
  2. If `titleHasWeightQty` and `WEIGHT\\\_UNITS.includes(ap.unit) \\\&\\\& price`: weight sanity check; if off by >10%, recalc.

  The weight sanity check (line 1310–1316) uses `parseTitleWeightQty(title, ap.unit)` (subject to U-14 above) times `(count || 1)`. If `parseTitleWeightQty` returns the wrong weight (e.g., grabs a spec rather than the product weight), the sanity check thinks Amazon is wrong and rewrites PPU. So a *correct* Amazon PPU can be overridden to a wrong recalculated PPU on inputs where AU's title parser misreads the title.

* **Severity.** **Medium.** This is where Phase 2 Chat 100 finding lives: AU produces bad PPU on titles where Amazon would have been correct (or absent). The detector's accuracy is bounded by `parseTitleWeightQty`'s accuracy.
* **Where.** search.js:1310–1316, dependencies at 992–1010, 982–987 (paper-weight guard).
* **Fix scope.** Structural — Phase 3.

  **P-3. Multi-pack × weight applied silently in two code paths. \[confirmed]**

* **What.** Two code paths apply `count × weight` when `isMultiPackWeight(title)` is true:

  1. search.js:1320–1344 (Amazon supplied a unit price but no usable count/unit alignment).
  2. search.js:1367–1372 (no Amazon unit price; computing from title).

  Both rely on `isMultiPackWeight`, which fires on "food," "detergent," etc. anywhere in title (U-10). The note that surfaces is `count + ' × ' + qty + ' ' + unit + ' = ' + total + ' ' + unit + ' total'` (search.js:1337) — placed in `ppuNote`, not `note`. This matters for whether the "we recalculated" mixed-units banner shows up (see D-1 below).

* **Severity.** Compounds U-10. Medium.
* **Fix scope.** Structural — Phase 3.

  ### 3B. Hardcoded lists

  **P-4. `COUNTABLE\\\_SOLID\\\_TITLE\\\_KEYWORDS` is small and category-specific. \[confirmed]**

* **What.** search.js:1236–1239: `pod, pods, pac, pacs, fling, flings, tab, tabs, sheet, sheets, strip, strips, load, loads`. Tuned for laundry/dishwasher detergent and adjacent products. Misses other consumption-unit-equivalence categories that the design docs flag for future work (Override\_Principle.md lines 86–93): coffee pods/K-cups (k-cup, kcup not in list), pet food (kibble in `isMultiPackWeight` but not here), gum (sticks, pieces — "stick" not in list but "tab" is which causes ambiguity).
* The list is consulted in lowercase regex-word-boundary form (`\\\\b<kw>\\\\b`), so doesn't false-fire on substrings.
* **Severity.** **Medium.** Closes some Phase 2 Shape E cases for laundry, misses other categories that the design treats as same-shape.
* **Fix scope.** Structural — Phase 3 work to define equivalence classes.

  **P-5. Convert tables for `convertPPU` hardcode `fluid ounce`/`fluid ounces` but `normalizeUnit` always produces `fl oz`. \[confirmed]**

* **What.** `convertPPU` (search.js:121–139) has entries for `'fluid ounce'`/`'fluid ounces'` in `toFlOz`. But every code path that calls `convertPPU` runs the unit through `normalizeUnit` first, which maps `'fluid ounce'`/`'fluid ounces' → 'fl oz'` (line 172). So the long-form entries are dead code. Not an accuracy issue but suggests the conversion table was written before normalizeUnit was wired up; future maintainers may add entries inconsistently.
* **Severity.** **Low.** Cleanup, not a bug.
* **Fix scope.** Band-aid.

  ### 3C. Intent vs. behavior gap

  **P-6. `solidUnitIsWrong` mixes Shape E and Shape G detection in one expression. \[confirmed]**

* **What.** The three disjuncts in `solidUnitIsWrong` (search.js:1243–1245) correspond to three different override rationales:

  * `WEIGHT\\\_UNITS.includes(ap.unit)` — Shape A (Override\_Principle.md): Amazon's weight unit is wrong for a solid product → recategorize to count.
  * `LIQUID\\\_UNITS.includes(ap.unit)` — similar shape, but for liquids.
  * `Math.abs(ap.ppu - price) / price < 0.01` — Shape G (whole-package $/ct): Amazon's PPU is the full price.

  These are different problems with different (but coincident) actions. The current code treats them as a single OR. The Override Principle doc explicitly separates them (Shape A: spec rating; Shape G: whole-package $/ct).

* **Severity.** **Low.** No incorrect output today, but the structure makes it hard to diagnose which disjunct fired in a given case. Telemetry doesn't say.
* **Fix scope.** Structural — Phase 3 framework.

  ### 3D. Silent failures

  **P-7. Mixed-units banner only fires for `source === 'calc' || source === 'none'`. \[confirmed]**

* **What.** search.js:2722: `overriddenItems = allData.filter(function(r){return r.note \\\&\\\& (r.source === 'calc' || r.source === 'none');});`. So the banner ("we had to interpret or recalculate") triggers only for those two sources. Sources `calc-weight`, `calc-single`, `calc-liquid`, `calc` (already in), `amazon-container`, `unavailable` — only `calc` and `none` count. But several override paths produce `calc-weight` (search.js:1338, 1340, 1370, 1373), `calc-single` (1303, 1376), `calc-liquid` (1391). These overrides happen *silently* — no banner.
* **Severity.** **High.** This is a textbook silent-override path. Multi-pack weight multiplication, weight-from-title computation, and ct→fl oz conversion all bypass the user-facing "we changed something" indicator.
* **Where.** search.js:2722–2733 (banner), source assignments throughout scrapeCard.
* **Fix scope.** Band-aid: extend the filter to include `calc-\\\*` sources. Structural: encode per-item the strength of the override (defer / pill / recategorize / suppress per Override\_Principle.md) so the banner can present accordingly.

  **P-8. Override paths leave `note` field empty in some branches. \[confirmed]**

* **What.** Some override-producing paths put text in `note`; others use `ppuNote` instead:

  * Multi-pack × weight (line 1338, 1371) — uses `ppuNote`, not `note`.
  * Per-item from weight (line 1340, 1373) — uses `note`.
  * Liquid ct conversion (line 1392) — uses `note`.
  * Recalc from count (line 1259) — uses `note`.

  The banner gate (P-7) only checks `r.note`, so items with `ppuNote` but empty `note` *cannot* trigger the banner regardless of their source. Combined with P-7, the multi-pack × weight path is doubly invisible.

* **Severity.** **High.** Compounds P-7.
* **Fix scope.** Band-aid. Unify on `note` (and use a separate `ppuTooltip` if a shorter inline format is needed).

  **P-9. `applyPairsNote` notes can disappear via subsequent `Object.assign`. \[confirmed]**

* **What.** `applyPairsNote` (search.js:941–950) sets `result.note = note + 'Sold in pairs ...'`. The function is called in scrapeCard at lines 1262, 1266, 1269, 1271, 1318. Subsequent `Object.assign(base, {...})` calls in the *other* branches don't preserve notes set by earlier branches — but since the branches are exclusive (each returns), that's actually fine. The risk is at *post-scrapeCard* passes like `applyLiquidCtConversion`, which sets `r.note = 'converted from per-can price'` (line 1392) — **overwriting** any note that was already there (including pairs note).
* **Severity.** **Low.** Probably rare ("X pair" listing with also fl oz value); flagged.
* **Fix scope.** Band-aid. Concatenate rather than overwrite.

  ### 3E. Coupling

  **P-10. PPU correctness is downstream of brand detection through render filtering. \[confirmed]**

* **What.** Items filtered by brand (when brand-filter is on) are demoted, which means they fall *below* the "best value" bar in display. Their PPU is still computed. But if the user is sorting by PPU and brand-filter is hiding (not demoting), the lowest PPUs may be hidden. This is the documented intent (Brand\_Filter\_Design.md "Hide vs demote").
* More importantly, the **best PPU** indicator (search.js:2769) is computed from `displayData` after the kw/source/sponsored/etc. filters apply, but **before** brand-demotion in the rendered list. So a brand-demoted item's correct PPU could still be the best, awarded a star (search.js infrastructure I didn't read), even though its display position is at the bottom. Whether that's intended is unclear — the Brand\_Filter\_Design.md open question #5 names this explicitly: "Brand filter affecting the best-value star — demoted items still eligible? Probably yes. Confirm during Session 2."
* **Severity.** **Low.** Design ambiguity, not a clear bug.
* **Fix scope.** Diagnostic — confirm intent and document.

  **P-11. PPU pill selection coupling to `inferLiquidDominant`. \[confirmed]**

* **What.** `generateUnitPills` (search.js:230–267) gates `pills` differently based on `isLiqDom`. When `isLiqDom` is true, the `'per item'` pill is suppressed (line 257: `\\\&\\\& !isLiqDom`). When `isLiqDom` is false but `convertibleCount < 2 \\\&\\\& !hasMinorityUnits`, `pills` is reset to empty (line 264). So a wrong `isLiquidDominant` (U-12) propagates to which pills the user can see.
* **Severity.** **Medium.** Same root as U-12.
* **Fix scope.** Structural — see U-12.

  \---

  ## 4\. Telemetry subsystem

  ### 4A. False-positive risks

  (Not the framing — telemetry doesn't have false positives in the detector sense. Read as "wrong-output risks.")

  **T-1. Signal hit counts are biased downward by user-driven blocklist actions. \[confirmed]**

* **What.** Detailed in B-10. After any user "Always hide" action, the in-memory `r.brandDetection.signals` is overwritten to `\\\['personalBlocklist']`. The next `doLog` call (triggered \~5s later via `scheduleLog`) reports lower hit counts for the heuristic signals than were observed during the original scrape.
* **Severity.** **Medium** (telemetry, not user-visible).
* **Fix scope.** Diagnostic.

  ### 4B. Hardcoded lists

  **T-2. Telemetry has hit-counter fields for 5 heuristic signals + personal blocklist, but not `bundledBlocklist` or `personalAllowlist`. \[confirmed]**

* **What.** search.js:1558–1564 logs:

  * `signalNoVowelHits`
  * `signalConsonantClusterHits`
  * `signalShortAllCapsHits`
  * `signalFakeMashupHits`
  * `signalAllCapsInventedHits`
  * `personalBlocklistHits`

  But `detectGibberishBrand` also emits `'bundledBlocklist'` and `'personalAllowlist'` signals (search.js:1058, 1063). Neither has a telemetry counterpart. So:

  * You cannot tell from the log how many items were flagged by the bundled blocklist vs. by heuristics. Both contribute to `brandsFilteredTotal` indistinguishably.
  * You cannot tell how many items were rescued by user allowlists — i.e., the false-positive volume that the personalAllowlist absorbed. This is exactly the data needed to drive bundled allowlist curation (the design doc's prescribed workflow).
* **Severity.** **High.** Direct gap in the curation feedback loop. The design doc says (Brand\_Filter\_Design.md:131–137) "Driven by telemetry. Sort Google Sheet by `brandsDistinctCount` descending, read `topFilteredBrands`, google unknowns, add legitimate ones to allowlist." But the curator cannot see which brands the heuristic-flagged-but-user-rescued — that's the highest-value signal for "add to bundled allowlist."
* **Fix scope.** Diagnostic. Add `bundledBlocklistHits`, `personalAllowlistHits` (and possibly `personalAllowlistTopBrands`) to `doLog`.

  **T-3. `topFilteredBrands` does not encode why each brand was flagged. \[confirmed]**

* **What.** search.js:1557: `topFilteredBrands` is a string like `"OUGES(12),GORGLITTER(8),ZESICA(5)"` — brand name + count. There is no per-brand source. A curator reviewing the sheet cannot tell whether OUGES was flagged by `bundledBlocklist`, `signalAllCapsInvented` solo, or multiple heuristics. The design doc's workflow ("look for brands scoring 0 that keep appearing") assumes the curator can see the score; the data shipped doesn't include it.
* **Severity.** **High.** Same root finding as T-2 — the design's curation loop assumes data that isn't in the logs.
* **Fix scope.** Diagnostic. Augment `topFilteredBrands` with per-brand signal sets, or add a parallel field like `topFilteredBrandsSignals`.

  **T-4. Signal hit counts are item-level, not brand-level. \[confirmed]**

* **What.** Counts on line 1558 etc. are `allData.filter(...).length` — they count individual listing hits, not distinct brands. So one MOFFBUZW brand appearing on 20 listings contributes 20 to the count. This makes the distribution opaque: "120 signalAllCapsInvented hits" could mean "120 distinct gibberish brands" or "6 popular gibberish brands × 20 listings each." These have different implications for blocklist curation.
* **Severity.** **Medium.**
* **Fix scope.** Diagnostic. Add per-signal distinct-brand counts alongside hit counts.

  ### 4C. Intent vs. behavior gap

  **T-5. No `brandsScraped` field; cannot measure scrape success rate. \[confirmed]**

* **What.** Detailed in B-11. The design doc names ">70% scrape rate" as a success criterion; the logs cannot measure it. There's no field counting `brand !== null` against `brand === null`, nor a breakdown by scrape strategy.
* **Severity.** **High** (silent failure on detector health).
* **Fix scope.** Diagnostic.

  ### 4D. Silent failures

  **T-6. The fundamental telemetry-vs-action gap: log says *what was filtered*, not <i>why</i>. \[confirmed]**

* **What.** This is the most consequential structural finding. Reading `doLog` end-to-end:

  * `brandsFilteredTotal`, `brandsDistinctCount`, `topFilteredBrands` describe outputs.
  * Hit counts for five heuristic signals describe inputs partially (excludes bundled/personal lists).
  * There is no field that ties brand → signal-set, no field for bundled-blocklist hits, no field for allowlist rescues, no field for scrape failure rate.

  Net effect: when looking at a curation row in the sheet, the operator has no causal handle. They can see that OUGES showed up 12 times this week, but not whether the reason is "blocklist did its job," "heuristic flagged it," "both," or "personal allowlist failed to rescue it." All four imply different curation actions.

* **Severity.** **High.** This is the prompt's explicit question — "does telemetry distinguish between different sources of a flag?" The answer is **no, only at aggregate signal-count level**, and that level doesn't include bundled-blocklist or allowlist signals.
* **Where.** search.js:1511–1572.
* **Fix scope.** Structural — restructure telemetry around (brand, signals) tuples.

  ### 4E. Coupling

  **T-7. Telemetry samples in-memory state after user actions have already mutated it. \[confirmed]**

* **What.** `doLog` is called via `scheduleLog`, which has a 5-second debounce (search.js:1506–1509). Render calls `scheduleLog` (line 3182). So if the user does N filter actions within 5 seconds, only one log fires, and it reflects state after ALL of them — including any signal overwrites from `applyBrandBlock` (B-10). The log is *not* a sample of "initial detector behavior on this page" — it's a sample of "state at log time, which may include user-driven cleanup."
* **Severity.** **Medium**.
* **Fix scope.** Diagnostic. Snapshot signal counts immediately after initial scrape, log that snapshot rather than re-deriving from in-memory state.

  \---

  ## 5\. Open-ended tail

  ### What the structured questions didn't ask about

* **`brand`-as-flow-control: the brand field is consumed in five different ways** — brand filter, Amazon brands demote, per-card menu, `topFilteredBrands` telemetry, compare payload (per design doc). A bug in `scrapeBrand` cascades to all five. The structured questions implicitly cover each consumer, but the *shared single point of failure* deserves naming.
* **The killswitch path (search.js:4964–5008) is the only network call AU makes on every page load besides the log/error endpoints.** It fetches `https://actuallyuseful.net/killswitch.json` and proceeds anyway after a 3s timeout. This is the only place the extension *could* be told to update detector lists remotely. Today it is binary (disabled / not disabled). Worth noting that a more sophisticated kill-switch could push allowlist/blocklist deltas; that's a structural opportunity, not a current bug.
* **The 5s log debounce + `scheduleLog` in `render` means a quick-clicking user can defer logs indefinitely.** Each render call resets the timer. A user actively interacting (sorting, clicking pills, blocking brands) might never produce a log for a session. Not an accuracy bug per se but affects telemetry sampling rate.

  ### Patterns appearing in more than one subsystem

* **Solo-trigger semantics with implicit lists as the only escape.** Brand subsystem has `signalAllCapsInvented` solo-firing against the fashion-only passlist (B-1); PPU subsystem has `solidUnitIsWrong`'s third disjunct silently overriding on a coincidence test (P-1); unit subsystem has `isMultiPackWeight` Condition B firing on any substance word anywhere (U-10). The shape is the same: one signal, no corroboration, no exit ramp except a hardcoded list.
* **Override telemetry hostility: outputs logged, sources not.** `topFilteredBrands` doesn't carry signal source (T-3); the "we changed something" banner doesn't see `calc-\\\*` sources (P-7); `applyBrandBlock` clobbers signals so the original heuristic firing is lost (B-10). Three subsystems, same gap: AU can act on detector output but cannot diagnose the action later.
* **Hardcoded lists tuned to the test mix.** Fashion-heavy brand passlist (B-1); laundry-heavy `COUNTABLE\\\_SOLID\\\_TITLE\\\_KEYWORDS` (P-4); supplement-keyword `isServingWeight` (U-9); paper-grade `isPaperWeightLb` (U-8). Each list was clearly compiled against the categories that surfaced the originating bug; each fails systematically outside that category. The fix is the same in all four cases — broaden coverage via curation, or move the detection up a level of abstraction (Phase 3 work).
* **Solo-trigger + tuned-to-test-mix list is the highest-FP combination.** B-1 has both, hence its top-severity rank.

  ### Top three findings by severity

1. **B-1 (signalAllCapsInvented solo-trigger + fashion-only passlist).** High impact, high likelihood, default-on behavior with soft user-facing label. Affects every search containing all-caps non-fashion brands.
2. **T-6 (telemetry says what was filtered, not why), with T-2, T-3, T-5 as components.** Locks in B-1 and B-2 by preventing the design's prescribed curation loop from running. The maintainer cannot tell from the Google Sheet which brands flagged are heuristic-false-positives vs. real junk vs. allowlist rescues vs. scrape failures.
3. **B-3 (bundled allowlist not implemented) + P-7/P-8 (silent PPU overrides).** Same shape from two sides: AU acts on data, the safety net described in the design is missing, and the user has no signal that the action happened. B-3 makes B-1's false positives unrecoverable at scale; P-7/P-8 hide the multi-pack × weight and `calc-\\\*` recalculations entirely.

   ### Questions for the developer most useful for prioritization

4. **For B-3:** Was the bundled allowlist intentionally deferred, or did the Session 3 build run partial and never close? The Brand\_Filter\_Design.md doesn't mark Session 3 with ✅. If it's deferred, what's the unblocker — sourcing the \~300-brand starter list?
5. **For B-1:** Is the solo-trigger rule for `signalAllCapsInvented` defensible against the test data you have? The Session 1 finding (Brand\_Filter\_Design.md:259) says "Both signals are high-confidence enough to flag alone." On what category mix was that confidence assessed? If it was the dress / apparel mix, the conclusion may not transfer.
6. **For T-6:** Is there appetite for a small schema change to `doLog` that adds 4–6 fields (bundledBlocklistHits, personalAllowlistHits, brandsScraped, brandsNull, topFilteredBrandsSignals, signal-overwrite-count)? The Apps Script and Sheet header row would need a one-time update.
7. **For U-10 / U-14:** What's the planned cutover from the four bolt-on detectors (`isPaperWeightLb`, `isMultiPackWeight`, `isServingWeight`, `applyPairsNote`) to the Phase 3 unified framework? Specifically: is it acceptable to ship a near-term band-aid that narrows Condition B (the "any substance word in title" path) before Phase 3 lands, or is the plan to wait?
8. **For P-7:** Why does the mixed-units banner gate on `source === 'calc' || source === 'none'` rather than `source.startsWith('calc')`? Was it intentional to exclude `calc-weight`, `calc-single`, `calc-liquid`, or is that an oversight?
9. **For B-9:** Is "unrecognized brands moved to end" the agreed user-facing label, or transitional? If it stays, the user has no clue this includes anything from the heuristic — they'll read it as "we don't know about these," which is misleading when the actual reason is "our heuristic flagged this on one signal."

   \---

   ## Severity-by-finding summary table

|#|Finding|Subsystem|Severity|Fix scope|
|-|-|-|-|-|
|B-1|signalAllCapsInvented solo-trigger + fashion-only passlist|Brand|**High**|Structural|
|B-2|signalFakeMashup substring matches without word boundary|Brand|**High**|Structural|
|B-3|Bundled allowlist not implemented|Brand|**High**|Structural|
|B-4|scrapeBrand Strategy 3 stop-list incomplete|Brand|Medium|Band-aid|
|B-5|isAmazonBrand comparison fragile to punctuation|Brand|Low–Med|Band-aid|
|B-6|ALL\_CAPS\_PASSLIST duplicates + dead entries|Brand|Low|Band-aid|
|B-7|bundledBlocklist content not inspected this audit|Brand|Cannot eval|Diagnostic|
|B-8|Override precedence personalAllowlist > bundledBlocklist|Brand|Medium|Structural decision|
|B-9|UI "unrecognized brands" overclaims confidence|Brand|Medium|Structural|
|B-10|applyBrandBlock overwrites prior signals|Brand|Medium|Diagnostic|
|B-11|scrapeBrand returning null is invisible to telemetry|Brand|**High**|Diagnostic|
|B-12|Passlist coverage coupled to tested category mix|Brand|Medium–High|Structural (= B-3)|
|B-13|High-noise banner amplifies brand-detection errors|Brand|Medium|Band-aid|
|U-1|LENGTH\_UNITS includes bare 'in'|Unit|Low|Band-aid|
|U-2|normalizeUnit leading-number strip semantics|Unit|Medium|Diagnostic|
|U-3|extractCount pack patterns broad|Unit|Low|Band-aid|
|U-4|extractCount loses footage when count regex matches first|Unit|Medium|Structural|
|U-5|guessUnitFromTitle early-return on pack/roll/bag|Unit|Low–Med|Band-aid|
|U-6|WEIGHT\_UNITS missing ounce/ounces (vs. regex passes)|Unit|Low|Band-aid|
|U-7|CONTAINER\_UNITS vs isMultiPackWeight container-word list divergence|Unit|Low|Band-aid|
|U-8|isPaperWeightLb 40-char window + narrow keyword list|Unit|Low|Band-aid|
|U-9|isServingWeight keyword list supplement-only|Unit|Medium|Structural|
|U-10|isMultiPackWeight Condition B fires on any substance word|Unit|Medium|Structural|
|U-11|applyPairsNote broad regex|Unit|Low (Phase 4)|Structural|
|U-12|inferLiquidDominant binary cliff, no diagnostic|Unit|Medium|Structural|
|U-13|applyLiquidCtConversion no validation|Unit|Medium|Band-aid|
|U-14|parseTitleWeightQty first-match no context|Unit|Medium|Structural|
|U-15|applyLiquidCtConversion doesn't check source|Unit|Low–Med|Structural|
|U-16|inferLiquidDominant feeds 5 downstream behaviors|Unit|Medium|Diagnostic|
|P-1|solidUnitIsWrong third disjunct on single-pack|PPU|Low|Band-aid|
|P-2|Weight sanity check trusts parseTitleWeightQty|PPU|Medium|Structural|
|P-3|Multi-pack × weight applied silently in two paths|PPU|Medium|Structural|
|P-4|COUNTABLE\_SOLID\_TITLE\_KEYWORDS laundry-tuned|PPU|Medium|Structural|
|P-5|convertPPU has dead entries for normalized-away strings|PPU|Low|Band-aid|
|P-6|solidUnitIsWrong mixes Shape A and Shape G logic|PPU|Low|Structural|
|P-7|Mixed-units banner only sees `calc`/`none` sources|PPU|**High**|Band-aid|
|P-8|Override paths use `ppuNote` not `note`, banner can't see|PPU|**High**|Band-aid|
|P-9|applyLiquidCtConversion overwrites prior notes|PPU|Low|Band-aid|
|P-10|brand demote vs best-PPU star coupling|PPU|Low|Diagnostic|
|P-11|Unit pills coupled to inferLiquidDominant|PPU|Medium|Structural|
|T-1|Signal counts biased by user blocklist actions|Telemetry|Medium|Diagnostic|
|T-2|No telemetry for bundled-blocklist or personal-allowlist hits|Telemetry|**High**|Diagnostic|
|T-3|topFilteredBrands lacks per-brand signal source|Telemetry|**High**|Diagnostic|
|T-4|Signal hit counts are item-level, not brand-level|Telemetry|Medium|Diagnostic|
|T-5|No brandsScraped field; scrape failure invisible|Telemetry|**High**|Diagnostic|
|T-6|Telemetry says what was filtered, not why|Telemetry|**High**|Structural|
|T-7|Logs sample post-mutation state|Telemetry|Medium|Diagnostic|

*End of audit.*



