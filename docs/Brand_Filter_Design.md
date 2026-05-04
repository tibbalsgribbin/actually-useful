# Brand Filter + Delivery Window Filter — Design Doc

*Design only. Companion to Chat 47 research. Spans 5–6 build sessions.*
*Created May 4, 2026 (Chat 47). Updated May 4, 2026 (Chat 48 — Session 1 complete).*

---

## What we're building

Two new filters for the search.js panel:

1. **Brand filter** — flags low-quality / pseudo-brand / dropship listings using a heuristic detector, with a bundled blocklist for known-bad brands, a personal blocklist for user overrides, and a bundled allowlist as a false-positive escape hatch. Optional Amazon-brands demote toggle.
2. **Delivery window filter** — hides or demotes items whose fastest available delivery is beyond a user-set threshold. Doubles as a soft proxy for overseas shipping.

Both filters use the same hide/demote toggle pattern, the same "show our work" results-summary line, and the same expand-to-view-hidden footer.

---

## Why this matters

Search results are clogged with dropship junk under gibberish brand names — Pukemark, MOFFBUZW, OUGES — that exist for weeks, never reorder, and ship from overseas. Reliably detecting "made in China" from search-card data is impossible. Reliably detecting "this is a pseudo-brand selling cheap mass-market garbage" is achievable. That's what this filter does.

Long shipping times are a separate but overlapping signal. Even when brand detection misses, slow shipping catches a lot of the same listings.

Real-world testing (Chat 48) confirmed that in categories like "floral summer dress," the entire search space can be dropship junk. Heuristics alone don't catch everything — fake brand names are a moving target, and many invented names are pronounceable enough to dodge signal-based detection. The bundled blocklist exists to cover known repeat offenders that heuristics miss.

---

## Design principles for this work

- **Spell things out.** Every filter action is visible. No silent hiding. Counts, expandable views, ability to inspect.
- **Wrong is worse than no answer.** When brand can't be detected, leave the item alone. Don't guess.
- **User decides.** Defaults are gentle (demote rather than hide for brand, hide for clearly-too-slow delivery). User can flip either toggle.
- **Heuristics catch new junk; lists catch known junk.** Both are needed. Neither alone is sufficient.
- **Telemetry is the feedback channel.** No "report this brand" button. The usage log captures what's being filtered and we curate the lists from that signal.

---

## Layer 1: Brand text scraping (foundation)

Before any filter logic, we need to reliably get the brand string off each search card.

### Where the brand lives on a search card

Amazon shows brand in one of three places, in priority order:

1. **`<h2 class="a-size-mini">` "by [Brand]" line** — most explicit. Often present on apparel and beauty.
2. **`.a-size-base.a-color-secondary` second-row text** — sometimes contains "Visit the X Store" or brand byline.
3. **First word of title in `<h2 a span>`** — many categories follow "BrandName Product Description" convention.

Detection approach: try selectors in priority order; first match wins. If none match, brand is `null`. Items with `null` brand are exempt from the filter — they pass through unchanged.

### Status: implemented in search.js v0.6.1.48

`scrapeBrand(el)` — multi-strategy fallback, returns string or null. Extracting "Visit the X Store" pattern. First-word-of-title fallback with sanity check (length ≥ 3, not an article or preposition).

### Risk: selector fragility

Brand selectors use multi-strategy fallback from day one. Still subject to Amazon updates, but more resilient than single-selector approach.

---

## Layer 2: Heuristic gibberish detector

The core logic. Each brand string is scored on multiple signals.

### Signals (as implemented in v0.6.1.48)

1. **`signalNoVowel`** — vowel-to-consonant ratio under 0.25, length ≥ 5. Catches MOFFBUZW, KMUYSL.
2. **`signalConsonantCluster`** — rare consonant cluster OR 4+ consecutive consonants. Catches BTFBM, WIHOLL.
3. **`signalShortAllCaps`** — 5–8 chars, all caps, ≤1 vowel. Catches HTZMO, AGYMNX.
4. **`signalFakeMashup`** — no spaces, 5+ chars, 2+ common English word fragments found via substring match or CamelCase split. Catches Prettygarden, Soulomelody, RoseSeek, Newshows. **Flags alone at score 1.**
5. **`signalAllCapsInvented`** — all caps, no spaces, 5+ letters, not on passlist. Catches OUGES, ZESICA, GORGLITTER, GLNEGE. **Flags alone at score 1.**

### Flagging rule

- `signalFakeMashup` or `signalAllCapsInvented` fires → flagged regardless of other signals
- All other signals: score ≥ 2 = flagged

### Passlist (within detector)

Small inline list of known real all-caps brands that would otherwise trigger `signalAllCapsInvented`: ZARA, ASOS, NIKE, ADIDAS, CUPSHE, CIDER, SHEIN, ZAFUL, GRACE, KARIN, SOLY, BIVENANT, ANRABESS, MEROKEETY, and others.

### Allowlist override (Session 3)

Before scoring, check the bundled allowlist. If brand is on the allowlist, never filter it regardless of signals.

### Bundled blocklist override (Session 3)

Before scoring, check the bundled blocklist. If brand is on the blocklist, always filter it regardless of signals. Takes priority over allowlist.

### Personal blocklist override (Session 3)

After scoring, check the personal blocklist. If brand is on the user's personal blocklist, always filter it regardless of signals.

---

## Layer 3: Bundled blocklist — known-bad brands

**Added Chat 48.** Parallel to the allowlist. Brands confirmed as dropship junk that heuristics miss.

### File

`extension/data/brand_blocklist.txt` — one brand per line, uppercase, case-insensitive match. Created in Chat 48 with 70 starter brands from session testing.

### Maintenance

Same telemetry workflow as allowlist:
1. Review `topFilteredBrands` in Google Sheet — look for brands scoring 0 that keep appearing
2. Google the brand — if it's definitively junk, add to blocklist
3. Ship in next release

### Detection priority

Blocklist check runs before heuristics. Blocklist match → always flagged. No heuristic scoring needed.

---

## Layer 4: Allowlist — small, additive, telemetry-driven

A flat-text file of brand names that should never be filtered, regardless of heuristic or blocklist.

### File

`extension/data/brand_allowlist.txt` — one brand per line, alphabetized, lowercase comparison (case-insensitive match).

### Initial seed

Ship v1 with ~200–500 brands. Sources:
- Top brands the AU author knows are legitimate
- Brands from the AU bug-test categories that have been verified working
- A subset of the Mosley list (MIT licensed) — only brands that look unambiguously legitimate

### Maintenance

Driven by telemetry. Sort Google Sheet by `brandsDistinctCount` descending, read `topFilteredBrands`, google unknowns, add legitimate ones to allowlist.

---

## Layer 5: Personal blocklist

User can right-click any product card and add its brand to a personal hide list.

### Storage

`chrome.storage.local` — keys: `auBlocklistBrands` (array of strings), `auBlocklistSellers` (future).

### UI on search results

Each card with a detectable brand gets a `[•••]` action menu. Options:
- "Hide all [BrandName] forever"
- "Hide this seller forever" *(future, post-MVP)*

### UI for managing the blocklist

"My blocklist (N brands)" link in panel footer or popup. Simple list with remove buttons.

### Sync

Out of scope for v1. Single-device.

---

## Layer 6: Optional Amazon-brands demote toggle

Off by default. Amazon house brands (AmazonBasics, Solimo, Amazon Essentials, etc.) pushed to end of results — not hidden.

### Why demote-only

Strategic neutrality. AU's positioning is "Amazon but better" — not adversarial.

---

## Delivery window filter

### Source data

`freeDateTs`, `fastDateTs` (epoch ms). Use the earlier of the two — fastest possible delivery. If both null, exempt the item.

### UI

Single checkbox: "Hide slow shipping." When checked, slider appears: "Hide items not arriving within [7] days." Range 2–21 days, default 7.

### Hide vs demote

Default: hide. Delivery is a clear-cut signal.

---

## Hide vs demote — how the toggles work

Two independent toggles, one per filter.

- **Hide**: item removed from rendered list; counted in summary line; recoverable via expand
- **Demote**: item moved to end of results after a "Below the line: items flagged by [filter name]" divider

Defaults: brand → demote, delivery → hide. Persist via `chrome.storage.local`.

---

## Logging fields summary

**Brand filter (~9 fields):**
- `brandFilterActive` (bool)
- `brandFilterMode` ("hide" | "demote")
- `topFilteredBrands` (string, top 10 brands with counts)
- `brandsFilteredTotal` (int)
- `brandsDistinctCount` (int)
- `signalNoVowelHits`, `signalConsonantClusterHits`, `signalShortAllCapsHits`, `signalFakeMashupHits`, `signalAllCapsInventedHits` (int each)

**Personal blocklist (2 fields):**
- `personalBlocklistSize` (int)
- `personalBlocklistHits` (int)

**Amazon-brands demote (2 fields):**
- `amazonBrandsDemoteActive` (bool)
- `amazonBrandsCountDemoted` (int)

**Delivery filter (3 fields):**
- `deliveryFilterActive` (bool)
- `deliveryFilterMaxDays` (int)
- `deliveryCountFiltered` (int)

**Total: ~18 new fields.** Sheet goes from 46 columns to ~64.

---

## Compare.html implications

New payload fields (forward-compat, added in v0.6.1.47):
- `brand` (string | null) — detected brand string

To add in Session 2+:
- `brandFilterClass` ("none" | "demoted" | "hidden")
- `isAmazonBrand` (bool)

Compare.html integration is Session 6 (optional).

---

## Build order — 5 sessions

### Session 1 — Brand text scraping + detection scaffolding ✅ COMPLETE (Chat 48)

Files touched: `search.js`

- `scrapeBrand(el)` — 3-selector fallback, returns string or null ✅
- `detectGibberishBrand(brand)` — 5 signals, solo-signal flagging for signalFakeMashup and signalAllCapsInvented ✅
- `brand` and `brandFlagged` added to scraped item object ✅
- `brand` added to compare payload (forward-compat) ✅
- Console logging for verification ✅
- `brand_blocklist.txt` starter file created (70 brands), placed in `extension/data/` ✅

Versions: search.js bumped to v0.6.1.48.

Key Session 1 findings:
- signalAllCapsInvented needed 5+ char limit with no upper bound (not 5–8)
- signalFakeMashup word list needed significant expansion
- Both signals are high-confidence enough to flag alone (threshold lowered to 1 for each)
- Bundled blocklist added to architecture — heuristics alone insufficient for apparel category
- Catch rate on dress search: strong for all-caps gibberish and mashup brands; misses for mixed-case invented words (Floerns, Wenrine, Verdusa, etc.) — accepted gap

### Session 2 — Brand filter UI + hide/demote toggle

Files touched: `search.js`, `styles.css`

- Brand filter on/off toggle
- Hide/demote two-button pill
- Results summary line ("N demoted by brand filter")
- Expand-to-view footer with "below the line" divider
- Demote rendering logic
- Persist filter state in `chrome.storage.local`
- Add logging fields to doLog()
- Update Apps Script + sheet header row

### Session 3 — Allowlist + bundled blocklist + personal blocklist

Files touched: `search.js`, `core.js`, `extension/data/brand_allowlist.txt` (new), `extension/data/brand_blocklist.txt` (wire up), `manifest.json`

- Create `brand_allowlist.txt` with starter list (~300 brands)
- Load both allowlist and blocklist at panel init via `chrome.runtime.getURL()`
- Wire blocklist check before heuristics (blocklist always flags)
- Wire allowlist check before heuristics (allowlist always passes)
- Implement `[•••]` per-card menu with "Hide all [Brand] forever"
- Wire personal blocklist into detector
- Implement "My blocklist" management view
- Update logging with personal blocklist fields

### Session 4 — Delivery window filter

Files touched: `search.js`, `styles.css`

- Delivery filter checkbox + slider
- Filter logic using earlier of `freeDateTs` / `fastDateTs`
- Same hide/demote toggle pattern (default: hide)
- Same results summary line + expand footer
- Persist state
- Add logging fields

### Session 5 — Amazon-brands demote toggle + polish

Files touched: `search.js`, `styles.css`, `extension/data/amazon_brands.txt` (new)

- Create `amazon_brands.txt` with Amazon's known house brands
- Toggle (off by default) — "Demote Amazon brands"
- Detection + demotion (always demote, never hide)
- Add logging fields
- General polish pass
- Update bug-test.md with new test categories

### Session 6 (optional) — compare.html integration

Files touched: `compare.html`

- Brand column (toggleable)
- Brand filter on filter bar
- Visual indication for demoted/filtered items

---

## Open design questions

1. **Allowlist starter list** — fork Mosley list, hand-curate, or build fresh? Decide during Session 3.
2. **`[•••]` menu placement** — top-right corner of card? Below price? Decide during Session 2.
3. **Below-the-line divider styling** — Decide during Session 2.
4. **Slider granularity** — 1-day increments or jumpy (2/3/5/7/10/14/21)? Decide during Session 4.
5. **Brand filter affecting the best-value star** — demoted items still eligible? Probably yes. Confirm during Session 2.
6. **Blocklist curation cadence** — how often to review telemetry and ship list updates? Decide post-alpha.

---

## Risks and dependencies

**Selector resilience.** Brand scraping uses multi-strategy fallback. Broader codebase refactor still pending.

**False-positive overflagging.** Default mode is demote. Allowlist absorbs known false positives. Telemetry surfaces patterns.

**False-negative underflagging.** Mixed-case invented names (Floerns, Verdusa, Wenrine) are an accepted gap for now. Bundled blocklist covers known repeat offenders. Signal tuning continues post-alpha.

**Moving target.** New fake brands appear constantly. Blocklist + heuristics together are more resilient than either alone. Telemetry drives ongoing curation.

**Scope creep.** Each session is intentionally bounded. Stop and resume rather than push through.

---

## Out of scope

- Country-of-origin detection (unreliable)
- Per-product page fetches to enrich brand data
- Cross-device blocklist sync (post-alpha)
- Walmart / Target (post-alpha)
- Public-facing "report a brand" form (telemetry handles this)
- Brand quality ratings

---

## Success criteria

The feature ships when:

1. Brand text scraped reliably on >70% of search cards across bug-test categories
2. Heuristic detector + bundled blocklist together catch the majority of obvious junk brands
3. Personal blocklist works across reloads
4. Allowlist starter is at least 200 brands
5. Bundled blocklist has at least 50 confirmed junk brands (70 at Session 1 close)
6. Hide and demote modes both work correctly
7. Telemetry logs new fields; Apps Script + sheet updated
8. Filtered items visible via expand-to-view (no silent hiding)
9. "Below the line" divider clear and readable when demote is active
