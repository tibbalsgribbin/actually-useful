# Changelog — Chat 60 (May 11, 2026)

## Files changed
- search.js: v0.6.1.66 → v0.6.1.70
- styles.css: updated Chat 60

---

## search.js changes (v0.6.1.67 → v0.6.1.70)

### Keyword filter — full rewrite of parsing and matching engine

The keyword filter now supports a full boolean search model:

**Operators supported:**
- `AND` — splits the expression into required groups; all groups must match
- `OR` / `|` / space — alternatives within a group; any one matches
- `"exact phrase"` — strict adjacency match
- `term*` / `t*m` — wildcard anywhere in the word (pa*s matches pacs, paks, packs)
- `-term` / `NOT term` — global exclusions; matched items are always hidden
- `+term` — treated as a required term (same as bare word)

**Model:** AND is the top-level separator. Within each AND-group, OR/space/| are alternatives. Exclusions are stripped first and apply globally regardless of groups.

**Example:** `unscented OR "fragrance-free" AND pods OR pa*s -sheet*`
- Group 1: unscented OR fragrance-free (at least one must match)
- Group 2: pods OR anything matching pa*s (pacs, paks, packs, etc.)
- Exclusion: anything containing a word matching sheet* (sheet, sheets, sheeting)

**New functions:**
- `parseKeywords` — full rewrite; 3-pass parser (strip exclusions → split on AND → collect OR-alternatives per group). Returns `{ requiredGroups, exclusions }`.
- `readToken` — shared tokenizer; handles quoted phrases, wildcards (anywhere in token), and bare words.
- `tokenMatches` — single-token matcher; handles phrase (substring), wildcard (per-word regex with punctuation stripping), and word (substring) types.

**Updated functions:**
- `titleMatchesKeywords` — uses requiredGroups model; all groups must have at least one match.
- `highlightKeywords` — highlights matching tokens from all groups; wildcard matches strip punctuation before testing pattern.

**Bug fixed (v0.6.1.70):** Wildcard matching failed when Amazon titles had punctuation attached to words (e.g. "Pacs,"). Fixed by stripping leading/trailing non-alphanumeric characters from each word before testing the wildcard pattern.

### Keyword filter — UI changes

- `Keyword filter` label moved outside the input box as a persistent `<label>` element
- Input wrapped in `ppu-kw-input-row` div (clear button re-anchored to this)
- Hint block below input — 3 lines:
  - Line 1: AND · OR · exclusion rules
  - Line 2: quotes · wildcard with example
  - Line 3: full example query
- Placeholder updated to: `e.g. unscented OR "fragrance-free" AND pods OR pa*s -sheet*`

---

## styles.css changes

- `.ppu-kw-wrap` — changed from `position:relative` to `flex-direction:column; gap:3px`
- New: `.ppu-kw-label` — indigo, 11px, semibold
- New: `.ppu-kw-input-row` — `position:relative` (re-anchors the clear button)
- New: `.ppu-kw-hint` — 10px muted gray, line-height 1.3
- `#ppu-filter-row` alignment changed from `align-items:center` to `align-items:flex-start` (handles taller keyword block)
