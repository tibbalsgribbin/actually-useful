# Changelog — Chat 99

*May 21, 2026*

*Opus session. Phase 3-prep verification — first round. Two Shape A speculative entries verified against live Amazon searches; both disconfirmed the predicted Override-suppress failure mode. Catalog and taxonomy updated with verification notes and a new "non-failure outcome patterns" section. No code changes.*

---

## Delivered

### Verification work — two Shape A speculative entries

Verifications run against live Amazon search results (AU extension off, scraped via Melissa's existing extension).

**Search 1: "fishing sinkers" (Shape A — oz spec).** 60 listings captured. Amazon reported NO PPU on any listing in the natural sort. Predicted $/oz collision did not occur. The category appears to be one where Amazon's parser declines to compute PPU.

**Search 2: "braided fishing line" (Shape A — lb test spec).** ~57 listings captured. Amazon reported $/foot on most listings (the $0.01–$0.04/foot range), computed from the spool length in the title. Amazon does NOT compute $/lb from the strength rating. The category appears to be one where Amazon recognizes that length is the buyable and recategorizes.

Both verifications were single-search/first-page checks. Catalog status remains SPECULATIVE pending broader confirmation.

### `Unit_Catalog_Phase1.md` — updated

Added verification notes to two entries:

- `oz` → "Fishing weights/sinkers" entry: verification note with search results and date.
- `lb` → "Fishing line test strength" entry: verification note with search results and date.

Both notes flag that the predicted failure mode did not occur, but keep the entry SPECULATIVE per the project rule of not over-interpreting a single search.

### `Phase2_Taxonomy.md` — updated

Three changes:

1. **Shape A section.** Added a "Verification findings" subsection at the end summarizing the two-for-two disconfirmation result and pointing to the new non-failure pattern note in Cross-shape patterns. Flagged that VERIFIED Shape A entries (paper grade, dumbbells) remain unaffected.

2. **Cross-shape patterns section.** Added a "Non-failure outcome patterns" note describing N1 (Amazon omits PPU) and N2 (Amazon recategorizes from title) as outcome classes — not postures — that the verification queue may keep surfacing. Implication: detector design should not assume "speculative Shape A entry = needs detector." Some sub-patterns won't need detectors because Amazon already handles them. Tagged as a working note rather than framework-level, pending more verification data.

3. **Phase 3-prep verification queue.** Shape A candidates bullet: marked sinkers oz and fishing line lb test as verified (with strikethrough and N1/N2 annotation). Remaining Shape A candidates unchanged.

---

## Decisions made

### Stop verification after two data points; update docs instead of continuing

Recommendation accepted. Two-for-two disconfirmation of predicted failure mode is enough to warrant catalog-level work. Continuing without integrating findings would risk interpreting later searches against assumptions we know are shaky.

### N1/N2 patterns stay in `Phase2_Taxonomy.md` cross-shape section, not in `Override_Principle.md`

Two data points are enough to flag a pattern but not enough to elevate to framework status in the locked `Override_Principle.md`. Cross-shape section is reversible, contained, honest about evidence. If a third or fourth verification keeps surfacing N1/N2, this may warrant promotion to a formal catalog status tag.

### Catalog entries stay SPECULATIVE despite verification

A single search confirms what Amazon currently does on the first page, sorted by default — not the full distribution of behaviors. Project rule: VERIFIED has meant "confirmed across reasonable variation." Verification notes capture the finding without overstating its strength.

---

## What's not in the catalog yet, but probably should be next session

- Confirm N1/N2 pattern with a third Shape A subtype (boxing gloves oz, weighted vest lb, etc.) before deciding whether to promote N1/N2.
- Run a Shape F verification (semi-solid personal care) before Phase 3-prep is considered done.
- Decide whether the verification mode justifies a formal "VERIFIED non-collision" status in the catalog separate from VERIFIED (collision exists) and SPECULATIVE.

---

## Files touched this session

- `Unit_Catalog_Phase1.md` — two entries updated with verification notes.
- `Phase2_Taxonomy.md` — Shape A verification subsection added; Cross-shape patterns gained N1/N2 note; verification queue updated.

No code files touched. No version bumps.

---

## Process notes

- The conversation started with two Amazon scrapes interpreted in sequence. Pivot decision was made after the second result rather than continuing further — the right call based on session energy and the strength of the two-for-two disconfirmation.
- Recommendation-with-justification pattern adopted mid-session (per Melissa's request). Going forward, every choice offered should include a recommendation and rationale, not just the options.
- Memory guard #4 (cross-doc consistency) applied when updating `Unit_Catalog_Phase1.md` and `Phase2_Taxonomy.md` — the same finding is described in both docs with consistent vocabulary (N1 = "Amazon omits PPU", N2 = "Amazon recategorizes from title").
