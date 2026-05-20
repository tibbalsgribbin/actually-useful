# Demotion & Display

*Chat 96 · May 20, 2026 · Opus*

*The visual layer of the trust postures defined in `Override_Principle.md`. That doc specifies what AU does to the PPU value (defer, override, add-pill, note). This doc specifies what the user sees as a result — when a card is rendered normally, when it's visually demoted, when it's moved in the sort order, and how the compare view handles the same cases. This is the natural pair to the pairs-note redesign in Phase 4, and shares vocabulary with it.*

---

## Why this exists

When AU can't supply a PPU value for a card (because the card has no honest comparison value on the current sort dimension), the user needs to know that something is different about that card — otherwise the absence reads as "AU is broken" or "this listing is weird" rather than "AU made a deliberate decision not to compare this on PPU." Visual demotion is how AU communicates that decision.

When the user explicitly sorts by a PPU dimension, items that can't supply a value for that dimension shouldn't be ranked into the middle of the result list — that gives a misleading position signal. Position demotion handles this.

The two are different operations and answer different questions.

---

## The two axes of demotion

### Position demote (move to the end of the sort)

**When**: the user has explicitly sorted by a PPU dimension and the item cannot supply a value for that dimension.

**Why it's correct**: an honest sort can't include items that don't have the sortable value. Putting them somewhere in the middle implies a comparable rank where none exists. End of list is the truthful position.

**When NOT to apply**: in the default/relevance order. The user hasn't asked for a PPU ranking; AU has no business reordering.

### Visual demote (fade, badge, or both)

**When**: AU wants the user to see at a glance that this card differs in comparability from its neighbors — either because no meaningful PPU is available for the page's sort dimension, or because no meaningful PPU is available at all.

**Why it's correct**: the user's eye needs a signal that this card is in a different category from the rest. Fading reads as "lesser" without being inflammatory; a badge gives the *reason*.

**Lean on the visuals**: 60–70% opacity for text. Never below 60% — readability matters more than the visual effect, especially on brain-fog days. Badge text is full-strength so the reason stays legible even when the rest of the card is faded.

---

## The trigger: "can this listing supply the currently-sorted unit?"

The demote decision is keyed on the listing's data, not directly on its posture. Three questions, in order:

1. **Can this listing supply the currently-sorted PPU unit?** If yes — render normally. Stop.
2. **Can this listing supply *some* meaningful PPU on this page, just not the currently-sorted one?** If yes — **soft demote**.
3. **Can this listing supply *any* meaningful PPU on this page?** If no — **hard demote**.

This trigger reverses the earlier framing (which keyed on whether the listing's *preferred* unit matched the current sort). Under the corrected framing, a listing with $/g available from Amazon stays at normal in a $/g sort regardless of whether $/serving is its more useful unit — because $/g *is* available, the sort can rank it honestly.

---

## The three tiers

### Normal

**Visual**: full opacity, no badge, normal sort position.

**Trigger**: the listing supplies the currently-sorted PPU unit.

**Examples**:
- Toothpaste in $/fl oz sort (defer; Amazon supplies the unit).
- Supplement with valid product weight in $/g sort (defer; Amazon supplies the unit).
- Supplement with serving data in $/serving sort (add-pill supplies the unit).
- Trash bag with recategorized $/bag in $/bag sort (recategorize supplies the unit).
- Listing with a pair-note in any sort (note doesn't affect tier — the note renders as a marker, not a demotion).

**Why no demote here**: the sort can rank this listing honestly. There's nothing to flag.

### Soft demote

**Visual**: full opacity *or* light fade (Phase 3 calibration), badge with reason, end-of-list position when the *current sort* fails the listing.

**Trigger**: the listing can supply *some* meaningful PPU on this page, just not the currently-sorted unit. The user can switch sort dimensions and recover the listing.

**Examples**:
- Yarn without yardage data in title, in a $/yard sort. The yarn has $/oz available; switching to $/oz sort pulls it back to normal. Soft demote with "by weight" badge.
- Supplement without serving data in title, in a $/serving sort. The supplement has $/g available; switching pulls it back. Soft demote with "by weight" badge.
- Trash bags recategorized to $/bag, in a hypothetical $/gallon sort (AU doesn't supply $/gallon for these). The listing has $/bag; switching pulls it back. Soft demote.

**Why soft, not hard**: there is a sort dimension on which this listing belongs in the ranking. The badge tells the user which dimension to switch to.

### Hard demote

**Visual**: 60–70% opacity, badge with reason, end-of-list position in *any* PPU sort.

**Trigger**: the listing cannot supply any meaningful PPU comparison to others on the page, in any sort dimension.

**Examples**:
- **Bundle** (the Tide Pods + Downy + Stopables case): no single PPU honestly compares this card to a pure-detergent listing. Hard demote with "bundle" badge.
- **Subscription box** with variable contents: no fixed product to per-unit. Hard demote with "subscription" badge.
- **Service / membership**: no per-unit concept at all. Hard demote with "service" badge.
- **Variable-yield consumable**: skincare "30 day supply" depends on application amount; no honest $/use. Hard demote with "variable yield" badge.
- **Cookware / dinnerware / luggage set**: components aren't equivalent units, so $/piece is misleading and $/set is trivially price. Hard demote with "set" badge.
- **Supplement caught by `isServingWeight()` *and* with no serving data in title**: $/g is suppressed (the gram value is per-serving, not product), and no $/serving pill is available either. Nothing to rank on. Hard demote with "spec" badge.

**Why hard, not soft**: there's no comparable dimension on which the card belongs in the ranking. The user can't recover this card by switching sort units — it's simply not the same kind of thing as the items it's listed alongside.

---

## How posture relates to tier

Postures from `Override_Principle.md` don't map 1:1 to tiers. The same posture can yield different tiers depending on what the listing's title contains. Some patterns:

| Posture combination | Typical tier outcome | Notes |
|---|---|---|
| Defer | Normal in any sort whose unit Amazon supplies. Soft demote in sorts whose unit Amazon doesn't supply (rare, depends on what other pills the page offers). | Listings whose only PPU is Amazon's. |
| Defer + Add-pill | Normal in any sort whose unit Amazon or AU supplies. Soft demote when the sort unit isn't in either. | Most yarn, most supplements. |
| Defer + Note | Same as Defer for tier; the note renders as a marker on a normal-tier card. | Pair-of-X listings. |
| Override-recategorize | Normal in sorts on the replacement unit. Soft demote in sorts on Amazon's original unit (rare — the page typically isn't offering that unit if AU is recategorizing across it). | Trash bags. |
| Override-suppress | Soft demote if a different PPU dimension exists for the listing. Hard demote if not. | Cookware → hard; isServingWeight subset with serving data in title → soft (via add-pill recovery). |

The earlier claim that each posture lands in exactly one tier is incorrect: override-suppress straddles soft and hard depending on whether recovery is available, and defer can soft-demote in sorts whose unit it doesn't supply. The tier is a property of the listing-in-current-sort, not of the posture alone.

---

## Compare view is different

In `compare.html` the user has explicitly added items. They want to see what they chose. Fading those rows works against the user's intent.

The compare view rule: **all rows render at full opacity. PPU cells that the listing can't supply render with inline annotations explaining why, not with the row itself demoted.**

So the bundle row's $/load column reads "n/a — bundle" rather than being faded. The set row's $/piece column reads "n/a — set." The subscription row reads "n/a — subscription."

For soft-demote cases (listing can supply *some* unit but not this column's), the cell shows "n/a — by [unit]" where [unit] is what the listing *can* supply. E.g., a supplement without serving data in a $/serving column reads "n/a — by weight." The user can read across the row to find a column where the listing has a value.

The vocabulary of annotation phrases should be the same as the panel badge text. Same words, both views. The user learns one vocabulary and applies it across both.

---

## Badge / annotation vocabulary

A consolidated list of badge labels for the panel and matching annotations for compare cells. Working set — additions expected as Phase 2 surfaces more cases.

| Trust reason | Tier | Panel badge | Compare cell annotation |
|---|---|---|---|
| Multi-product bundle | Hard | bundle | n/a — bundle |
| Component-in-set | Hard | set | n/a — set |
| Variety pack | Normal (with note) | variety | (PPU shown; "variety" renders as note, not demote badge) |
| Spec masquerading as unit (paper, fishing line, dumbbells, screen size, aquarium) | Hard | spec | n/a — spec |
| Mesh / thread density | Hard | density | n/a — density spec |
| Subscription / variable contents | Hard | subscription | n/a — subscription |
| Variable-yield consumable | Hard | variable yield | n/a — variable yield |
| Service / membership | Hard | service | n/a — service |
| Soft-recoverable: listing comparable on a different unit | Soft | by [unit] | n/a — by [unit] |
| Pair ambiguity | Normal (with note) | pair (?) | $/pair* with footnote |

Variety pack and pair ambiguity sit in the Note posture, not demote. The badge is a hedge marker, not a tier signal.

---

## Worked examples

**User searches "laundry detergent" and sorts by $/load:**

- Pure detergent listings with reliable $/load → normal.
- Tide bundle (the screenshot) → hard demote: faded, end of list, "bundle" badge. AU's message: "we can't compare this card on $/load because the price covers multiple products."
- Subscription detergent → hard demote: faded, end of list, "subscription" badge.

**User searches "protein powder" and sorts by $/g:**

- Pure protein listings with valid product weight → normal. (Amazon's $/g is available; the listing supplies the sorted unit. The $/serving pill exists but doesn't change tier.)
- Same listings sorted by $/serving (user clicks the $/serving pill) → also normal, if serving data is in the title.
- Protein powder with no parseable serving data in title, sorted by $/serving → soft demote: end of list, "by weight" badge. User can switch back to $/g to recover it.
- A listing where Amazon scraped a per-serving gram as product weight (`isServingWeight()` fires) AND no serving count in title, sorted by $/g → hard demote: $/g suppressed, $/serving not available, "spec" badge.

**User searches "yarn" and sorts by $/yard:**

- Multi-skein yarn with yardage in title → normal ($/yard supplied via add-pill).
- Single-skein yarn with yardage in title → normal.
- Single-skein yarn without yardage in title (rare for yarn but possible) → soft demote: "by weight" badge.

**User adds the Tide bundle and two pure-detergent listings to compare:**

- All three rows render at full opacity.
- Bundle row's $/load cell reads "n/a — bundle." Other PPU cells the bundle can't supply also show "n/a — bundle."
- Pure detergent rows' $/load cells show their values.

---

## Open questions

**Soft demote: full opacity or light fade?** The current lean is full-opacity for soft, 60–70% for hard. An alternative is a small fade (e.g. 85%) for soft to distinguish it from normal at a glance. Worth user testing during implementation; the badge is doing the primary work either way.

**Accessibility floor on fade.** 60–70% opacity is the lean for hard demote. Worth a real check against actual contrast ratios on the panel's background colors. May need to be higher (e.g. 75%) if the panel background isn't pure white. Brain-fog days are the calibration target — text needs to be readable when reading is hard.

**Should the user be able to hide hard-demoted items entirely?** A toggle to filter them out would clean up the visual field but adds a setting and a discoverability problem. Lean default: show hard-demoted items at end of list. Consider toggle later if user feedback says they're clutter.

**Variety pack treatment.** Currently listed as note-posture (PPU shown, badge as note). Worth verifying with a real search whether $/oz of chips in a variety pack is actually comparable to $/oz of single-flavor chips. If yes, variety stays at normal tier with note. If the variety pack's $/oz is systematically misleading (e.g., the count is per-flavor not per-bag), it moves to soft demote.

**Defer marking.** Defer means trust — no badge, no annotation. But should there be any user-visible signal that AU has examined this listing and chosen to pass Amazon's PPU through unchanged? Lean: no. Defer should be invisible. Marking it would re-introduce the hedging that defer is supposed to avoid.

**Where the badge renders in the panel layout.** Existing panel design has tight spacing. The badge needs a place that doesn't push the PPU pills or the title around. This is a Phase 3 / Phase 4 implementation question, not a design-doc decision.

---

## What this doc doesn't decide

- **Detection mechanics.** Which titles get tagged as bundle, set, subscription, etc. is Phase 2 (shape grouping) and Phase 3 (detection rules). This doc specifies what to do once tagging is done.
- **Exact opacity values, badge styling, fonts, colors.** Implementation choices for Sonnet. This doc specifies the principle (60–70% lean for hard, contrast floor) and the vocabulary, not pixel values.
- **Panel layout adjustments.** Where the badge fits, whether it goes above or below the title, how it interacts with the existing pair-note rendering — Phase 4 implementation work.

---

## Relationship to other docs and phases

- **`Override_Principle.md`** — defines the trust postures. This doc maps listings (not postures directly) to visual treatment, since the same posture can yield different tiers depending on the listing's title data.
- **`Servings_Design.md`** — the supplement worked example here uses the corrected trigger: supplements with valid $/g stay normal in $/g sort; supplements without serving data soft-demote in $/serving sort.
- **`Unit_Catalog_Phase1.md`** — every VERIFIED collision entry should eventually be tagged with both trust posture AND likely demotion tier(s) in common sorts. The catalog cleanup pass already proposed adding the posture tag; adding tier expectations is the natural extension.
- **Phase 4 (pairs-note redesign)** — shares vocabulary with this doc. The general ambiguity-note display pattern that Phase 4 produces should accommodate both the pair-style note and the demotion badges defined here. They are not separate display systems.

---

*Working document. Tier definitions, badge vocabulary, and accessibility floor all expected to refine as Phase 3 implementation tests them against real cards.*
