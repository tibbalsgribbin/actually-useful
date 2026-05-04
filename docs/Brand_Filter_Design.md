# Brand Filter + Delivery Window Filter — Design Doc

*Design only. Companion to Chat 47 research. Spans 5–6 build sessions.*
*Created May 4, 2026 (Chat 47)*

---

## What we're building

Two new filters for the search.js panel:

1. **Brand filter** — flags low-quality / pseudo-brand / dropship listings using a heuristic detector, with a personal blocklist for user overrides and a starter allowlist as a false-positive escape hatch. Optional Amazon-brands demote toggle.
2. **Delivery window filter** — hides or demotes items whose fastest available delivery is beyond a user-set threshold. Doubles as a soft proxy for overseas shipping.

Both filters use the same hide/demote toggle pattern, the same "show our work" results-summary line, and the same expand-to-view-hidden footer.

---

## Why this matters

Search results are clogged with dropship junk under gibberish brand names — Pukemark, MOFFBUZW, OUGES — that exist for weeks, never reorder, and ship from overseas. Reliably detecting "made in China" from search-card data is impossible. Reliably detecting "this is a pseudo-brand selling cheap mass-market garbage" is achievable. That's what this filter does.

Long shipping times are a separate but overlapping signal. Even when brand detection misses, slow shipping catches a lot of the same listings.

---

## Design principles for this work

- **Spell things out.** Every filter action is visible. No silent hiding. Counts, expandable views, ability to inspect.
- **Wrong is worse than no answer.** When brand can't be detected, leave the item alone. Don't guess.
- **User decides.** Defaults are gentle (demote rather than hide for brand, hide for clearly-too-slow delivery). User can flip either toggle.
- **Heuristics scale; lists don't.** Detection logic is the primary lever. Allowlist exists only to override known false positives.
- **Telemetry is the feedback channel.** No "report this brand" button. The usage log captures what's being filtered and we curate the allowlist from that signal.

---

## Layer 1: Brand text scraping (foundation)

Before any filter logic, we need to reliably get the brand string off each search card.

### Where the brand lives on a search card

Amazon shows brand in one of three places, in priority order:

1. **`<h2 class="a-size-mini">` "by [Brand]" line** — most explicit. Often present on apparel and beauty.
2. **First word of title in `<span class="a-size-base-plus">`** — many categories follow "BrandName Product Description" convention.
3. **`<span class="a-size-base a-color-secondary">` second-row text** — sometimes contains "Visit the X Store" or brand byline.

Detection approach: try selectors in priority order; first match wins. If none match, brand is `null`. Items with `null` brand are exempt from the filter — they pass through unchanged.

### Risk: selector fragility

This is the same problem flagged in the Briefing's known issues. Brand selectors will break when Amazon updates. **The brand filter should not ship before the broader selector resilience refactor — or, at minimum, brand selectors should use the multi-strategy fallback pattern from day one** (try selector A, fall back to B, fall back to C). Don't compound fragility on fragility.

---

## Layer 2: Heuristic gibberish detector

The core logic. Each brand string is scored on multiple signals; only acts on high-confidence cases.

### Signals (placeholder names — finalize during build)

1. **`signalNoDict`** — brand has no dictionary match (English wordlist). Weak signal alone.
2. **`signalNoVowel`** — vowel-to-consonant ratio under 0.25, and length ≥ 5. Catches MOFFBUZW, KMUYSL.
3. **`signalConsonantCluster`** — contains 3+ consecutive consonants from a "rare cluster" set (MFB, XCQ, WHL, NGC, etc.). Strong signal.
4. **`signalShortAllCaps`** — 5–8 chars, all caps, no vowel pattern. Catches OUGES, WIHOLL.

(Possible additional signals to consider during build: brand has no detectable web presence — too expensive live, but could be precomputed. Brand contains digits or special chars in unusual positions. Romanized-Chinese-name pattern.)

### Scoring rule

Sum the signals. **Default action threshold: 3 or more signals fire.** Below that, the brand passes through unchanged. This deliberately leaves "weakly suspicious but possibly legitimate" brands (e.g. OUGES on its own) untouched.

The threshold is tunable per release. If telemetry shows we're missing too much junk, lower to 2. If we're catching too many real brands, raise to 4.

### Allowlist override

Before scoring, check the allowlist. If brand is on the allowlist, never filter it regardless of signals. This is the safety valve for the "OUGES is actually a real brand" case once we discover it via telemetry.

### Personal blocklist override

After scoring, check the personal blocklist. If brand is on the user's personal blocklist, always filter it regardless of signals. This is for legitimate brands the user personally dislikes (e.g. "I hate AmazonBasics" or "I never buy from this seller").

---

## Layer 3: Allowlist — small, additive, telemetry-driven

A flat-text file of brand names that should never be filtered, regardless of heuristic.

### Initial seed

Ship v1 with ~200–500 brands. Sources:
- Top brands the AU author knows are legitimate
- Brands from the AU bug-test categories that have been verified working
- A subset of the Mosley list (MIT licensed) — only brands that look unambiguously legitimate

### Format

`extension/data/brand_allowlist.txt` — one brand per line, alphabetized, lowercase comparison (case-insensitive match).

### Maintenance

Driven by usage log. Workflow:
1. Sort the Google Sheet by `brandsDistinctCount` descending
2. Read the `topFilteredBrands` field
3. Pick brands you don't recognize → google → if real, add to allowlist
4. Bundle additions into a release every few weeks

No PR mechanism, no GitHub issues for users to file, no "report" button. Telemetry does the work. (This matches Melissa's stated preference for keeping things simple.)

### What ships in the extension

The allowlist is bundled with the extension as a static file. Loaded once at panel init. Updates ship in the next extension release. No live remote fetching — keeps things simple, deterministic, and avoids another network dependency.

---

## Layer 4: Personal blocklist

User can right-click any product card and add its brand or seller to a personal hide list.

### Storage

`chrome.storage.local` — survives across sessions and reloads, but is per-device. Keys:
- `auBlocklistBrands` — array of strings
- `auBlocklistSellers` — array of strings (future, when seller info is available on cards)

### UI on search results

Each card with a detectable brand gets a small `[•••]` action menu (or right-click context). Options:
- "Hide all [BrandName] forever"
- "Hide this seller forever" *(future, post-MVP)*

After clicking, the brand is added to local storage and immediately filtered.

### UI for managing the blocklist

A small "My blocklist (N brands)" link in the panel footer or in the popup. Clicking opens a simple list with remove buttons. No bulk actions in v1.

### Sync

Out of scope for v1. Single-device. Cross-device sync via `chrome.storage.sync` is post-alpha — has a 100KB cap which is plenty for a brand list, but adds complexity around merge conflicts.

---

## Layer 5: Optional Amazon-brands demote toggle

Off by default. When on, items detected as Amazon house brands (AmazonBasics, Solimo, Amazon Essentials, Amazon Aware, etc.) are pushed to the end of results — *not* hidden.

### Detection

Cross-reference against a small static list of Amazon's known house brands. Source: Amazon's own "our brands" filter (which The Markup used) plus their published list.

### Why demote-only, no hide

Strategic. AU's positioning is "Amazon but better" — neutral, not adversarial. Hiding Amazon's own products feels like picking a fight. Demoting them is a transparency tool: "you can still see them, but you won't be steered to them by accident."

### Logging

Single new field: `amazonBrandsDemoteActive` (bool) and `amazonBrandsCountDemoted` (int).

---

## Delivery window filter

Smaller, slots into the same UI patterns.

### Source data

Already scraped: `freeDateTs`, `fastDateTs` (epoch ms). Use the **earlier of the two** — fastest available delivery, paid or free. Reasoning: at the research stage, what matters is whether fast delivery is *possible*. The user can decide later whether to pay for it.

If both are null, the filter exempts the item (don't filter what we can't measure).

### UI

Single checkbox: **"Hide slow shipping"** — off by default.

When checked, a slider appears:
> Hide items not arriving within **[7]** days
> Range: 2–21 days, default 7

Slider label updates live.

### Hide vs demote toggle

Same pattern as brand filter. Default for delivery: **hide**. Reasoning: a delivery date is a clear-cut signal — either it's fast enough or it isn't, no judgment call. Hide is the natural default. User can flip to demote if they want.

### Logging

New fields:
- `deliveryFilterActive` (bool)
- `deliveryFilterMaxDays` (int)
- `deliveryCountFiltered` (int)

---

## Hide vs demote — how the toggles work

Two independent toggles, one per filter. Each lives next to its filter controls.

### UI pattern

```
[ Brand filter on/off ]
   When something fails: [ Hide ] [ Demote ]      ← two-button pill, demote highlighted by default
   ▼ N demoted by brand filter                     ← expand to see what was demoted

[ Delivery filter on/off ]
   When something fails: [ Hide ] [ Demote ]      ← hide highlighted by default
   ▼ N hidden by delivery filter
```

### Behaviors

- **Hide**: item removed from rendered list; counted in summary line; recoverable via expand
- **Demote**: item moved to end of results, after a thin divider that says "Below the line: items flagged by [filter name]"

The "below the line" divider matters. It tells the user "we did flag these, but here they are if you want them." Spell it out, every time.

### Defaults

- Brand filter → **Demote** (judgment call, user might want to see them anyway)
- Delivery filter → **Hide** (clear-cut signal)

User-changed toggles persist via `chrome.storage.local`.

---

## Logging fields summary

12 new fields total across all this work:

**Brand filter (7 fields):**
- `brandFilterActive` (bool)
- `brandFilterMode` ("hide" | "demote")
- `topFilteredBrands` (string, top 10 brands with counts)
- `brandsFilteredTotal` (int)
- `brandsDistinctCount` (int)
- `signalNoDictHits` (int)
- `signalNoVowelHits` (int)
- `signalConsonantClusterHits` (int)
- `signalShortAllCapsHits` (int)

(Actually 9 fields. I miscounted. Adjust during build.)

**Personal blocklist (2 fields):**
- `personalBlocklistSize` (int — total brands user has blocked)
- `personalBlocklistHits` (int — items hidden by it this session)

**Amazon-brands demote (2 fields):**
- `amazonBrandsDemoteActive` (bool)
- `amazonBrandsCountDemoted` (int)

**Delivery filter (3 fields):**
- `deliveryFilterActive` (bool)
- `deliveryFilterMaxDays` (int)
- `deliveryCountFiltered` (int)

**Total: ~16 new fields.** Sheet goes from 46 columns to ~62.

---

## Compare.html implications

Brand string and brand-filter classification need to flow into the compare payload so the comparison page can display them.

New payload fields:
- `brand` (string | null) — the detected brand string
- `brandFilterClass` ("none" | "demoted" | "hidden") — what the filter did to this item
- `isAmazonBrand` (bool)

Compare.html will need a brand column (toggleable, like the others), a brand filter on the filter bar, and possibly visual indication on rows that were demoted in the original results. **All of this is post-MVP for compare.html — out of scope until search.js side is solid.**

---

## Build order — 5 sessions

This is **all the same files** — primarily search.js, styles.css, core.js. So one design doc covers all of it. But the work is too much for one session.

### Session 1 — Brand text scraping + detection scaffolding

Files touched: `search.js`, `core.js`

- Implement brand-text scraping with multi-strategy fallback (3 selectors, first match wins)
- Add `brand` field to scraped item object
- Add `brand` to compare payload (forward-compat; compare.html ignores it for now)
- Implement the heuristic detector (4 signals, sum-and-threshold)
- **No UI yet.** Just scrape + classify, log to console for verification.
- Test against bug-test categories. Tune signals if needed.

Test plan:
- Run searches on 5+ categories from bug-test
- Verify brand text scraped on >70% of items (some legitimately won't have brand text)
- Inspect classification results in console — flag items that the detector misclassifies
- Adjust signal thresholds if needed

### Session 2 — Brand filter UI + hide/demote toggle

Files touched: `search.js`, `styles.css`

- Add brand filter on/off toggle to panel
- Add hide/demote two-button pill
- Add results summary line ("N demoted by brand filter")
- Add expand-to-view hidden/demoted footer with "below the line" divider
- Implement the demote rendering logic (push items to end of list with divider)
- Persist filter state in `chrome.storage.local`
- Add new logging fields to doLog()
- Update Apps Script + sheet header row

Test plan:
- Toggle filter on, verify panel updates
- Switch hide/demote, verify behavior changes
- Verify telemetry rows show new fields populated correctly

### Session 3 — Allowlist + personal blocklist

Files touched: `search.js`, `core.js`, `extension/data/brand_allowlist.txt` (new file), `manifest.json` (web_accessible_resources)

- Create `brand_allowlist.txt` with starter list (~300 brands)
- Load allowlist at panel init
- Wire allowlist override into detector (allowlist always passes)
- Implement `[•••]` per-card menu with "Hide all [Brand] forever"
- Wire personal blocklist into detector (blocklist always filters)
- Implement "My blocklist" management view (popup or panel footer)
- Update logging with personal blocklist fields

Test plan:
- Search for a brand on the allowlist → verify it's never filtered
- Add a known-good brand to personal blocklist → verify it's always filtered
- Remove from blocklist → verify it goes back to normal classification

### Session 4 — Delivery window filter

Files touched: `search.js`, `styles.css`

- Add delivery filter checkbox + slider
- Implement filter logic using earlier of `freeDateTs` / `fastDateTs`
- Apply same hide/demote toggle pattern (default: hide)
- Apply same results summary line + expand footer
- Persist state
- Add logging fields

Test plan:
- Search a category with mixed shipping times
- Set threshold to 5 days → verify slow items hide/demote correctly
- Verify items with no delivery date pass through unfiltered

### Session 5 — Amazon-brands demote toggle + polish

Files touched: `search.js`, `styles.css`, `extension/data/amazon_brands.txt` (new file)

- Create `amazon_brands.txt` with Amazon's known house brands
- Add toggle (off by default) — "Demote Amazon brands"
- Implement detection + demotion (always demote, never hide)
- Add logging fields
- General polish pass — hover states, keyboard nav, accessibility check
- Update bug-test.md with new test categories

### Session 6 (optional) — compare.html integration

Files touched: `compare.html`

- Add brand column (toggleable)
- Add brand filter on the filter bar
- Visual indication for items that were demoted/filtered in original results

Out of scope for first launch — can ship the search.js side independently and follow up later.

---

## Open design questions for the build sessions

These don't need to be answered now. They'll surface during build and are flagged as "decide during implementation":

1. **Allowlist starter list** — do we fork the Mosley list, hand-curate from his entries, or build fresh? Decide during Session 3.
2. **`[•••]` menu placement** — top-right corner of card? Below price? Decide during Session 2.
3. **Below-the-line divider styling** — full width? Just text? With separator line? Decide during Session 2.
4. **Slider granularity** — 1-day increments or jumpy (2/3/5/7/10/14/21)? Decide during Session 4.
5. **Brand filter affecting the best-value star** — should a demoted item still be eligible for the best-value star? Probably yes (demoted = "below the line but still ranked"). Confirm during Session 2.
6. **What counts as "the brand" for compare.html** — first scraped value, or one consistent canonical string? Decide during Session 1 testing.

---

## Risks and dependencies

**Selector resilience refactor.** Brand-text scraping uses multi-strategy fallback from the start, but the broader codebase still has fragile selectors. If Amazon updates while this work is in flight, brand detection breaks silently. Mitigation: Session 1 test plan includes a sanity check ("does it find brand on >70% of items"). If that drops, surface a banner.

**False-positive overflagging.** Heuristic might catch real brands (small US makers with unusual names). Mitigation: default mode is demote, not hide. User can see what was flagged. Telemetry surfaces patterns. Allowlist absorbs known false positives.

**False-negative underflagging.** Heuristic might miss obvious junk. Mitigation: signal threshold is tunable per release. Telemetry on signal counts shows whether we're firing enough.

**Scope creep.** This doc covers a lot. Each session is intentionally bounded. If a session gets long, stop and resume next time — don't push through.

**Brain fog.** This is multi-session work. The handover at end of each session matters more than usual.

---

## Out of scope

- Country-of-origin detection (unreliable, see research notes)
- Per-product page fetches to enrich brand data (cost too high)
- Cross-device blocklist sync (post-alpha)
- Walmart / Target / other platforms (post-alpha by definition)
- Public-facing "report a brand" form (telemetry handles this)
- Brand quality ratings (subjective, out of AU's mission)

---

## Success criteria for the brand filter feature as a whole

The feature ships when:

1. Brand text is scraped reliably on >70% of search cards across the bug-test categories
2. Heuristic detector catches >50% of obvious gibberish brands without flagging known good brands
3. Personal blocklist works across reloads
4. Allowlist starter is at least 200 brands
5. Hide and demote modes both work correctly
6. Telemetry logs the new fields and the Apps Script + sheet are updated
7. Filtered items are visible via expand-to-view (no silent hiding)
8. The "below the line" divider is clear and readable when demote is active

When all 8 are green, the feature is alpha-ready.
