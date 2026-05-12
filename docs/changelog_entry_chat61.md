# Changelog — Chat 61 (May 11, 2026)

## Files changed
- search.js: v0.6.1.70 → v0.6.1.72
- compare.html: updated Chat 61

---

## search.js changes (v0.6.1.71 → v0.6.1.72)

### extractCount — pack patterns moved to end (v0.6.1.71)
Pack and pk patterns moved to end of the `pats` array in `extractCount`. "1 Pack (250 Sheets)" now returns 250 instead of 1. Specific item-count words (count, ct, sheets, strips, loads, etc.) now take priority over the generic container word "pack."

### Keyword hint — hide by default, show on first use (v0.6.1.71)
Hint block now hidden on load (`display:none`). Appears on first keypress in the keyword input and stays visible for the session. Tracked via `localStorage` key `au-kw-hint-seen`.

Added × dismiss button (upper right of hint block). Clicking × hides the hint permanently and clears `au-kw-hint-seen`, so it reappears on the next first use.

### scrapeBrand — whitespace normalization (v0.6.1.72)
All return values in `scrapeBrand()` now collapse internal whitespace via `cleanBrand()` helper (`s.replace(/\s+/g, ' ').trim()`). Fixes "Premiu m" style artifacts from line-broken text in Amazon's HTML.

### parseTitleWeightQty — paper-weight lb guard (v0.6.1.72)
lb matches followed within 30 characters by paper-weight qualifier words (cover, bond, text, index, weight, cardstock, card stock, gsm, basis) are discarded. Intended to prevent "65 lb Cover Weight" from being treated as package weight.

**Note:** Testing revealed this fix is insufficient — cardstock items are still showing $/lb PPU via a different code path. Needs a design session. The parseTitleWeightQty guard is harmless but incomplete.

---

## compare.html changes (Chat 61)

### Boolean keyword parser ported from search.js
`includeMatchesItem` replaced with full boolean parser matching search.js v0.6.1.71. Supports AND groups, OR alternatives, quoted phrases, wildcards, and exclusions. New functions: `auNormalizeDimensions`, `auReadToken`, `auTokenMatches`, `auParseKeywords`.

### Include filter hint text updated
Hint text updated from "(use | or OR for alternatives)" to "(AND · OR · −exclude · "phrase" · wild*)". Placeholder updated to match search.js example.

### Keyword highlight in title column
`highlightTitle()` function added. Wraps matching keyword terms in yellow `<mark>` tags using the ported boolean parser. Handles word, phrase, and wildcard token types. Both title cell locations (standard and checked-only views) updated to use `highlightTitle(item.title, filterInclude)`.
