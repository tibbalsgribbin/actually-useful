# Handover — May 11, 2026 (Chat 60)

## Session type
Coding session. search.js and styles.css updated. No changes to manifest, core.js, compare.html, background.js, welcome.html, or index.html.

## Current versions
- manifest: v0.6.1 (unchanged)
- search.js: v0.6.1.70
- core.js: v0.6.1.53 (unchanged)
- compare.html: updated Chat 57 (unchanged)
- background.js: v0.6.1.17 (unchanged)
- styles.css: updated Chat 60
- welcome.html: created Chat 59 (unchanged)
- index.html: unchanged
- killswitch.json: disabled:false

---

## What this session covered

### Keyword filter — full parser rewrite + UI overhaul

The keyword filter now supports a proper boolean search model.

**Operators:**
- `AND` — top-level separator; all AND-groups must match
- `OR` / `|` / space — alternatives within a group; any one matches
- `"exact phrase"` — strict adjacency match
- `term*` / `t*m` — wildcard anywhere in the word
- `-term` / `NOT term` — global exclusion
- `+term` — treated as required term

**Model:** `unscented OR "fragrance-free" AND pods OR pa*s -sheet*` → Group 1 (unscented or fragrance-free) AND Group 2 (pods or anything matching pa*s). Exclusion: sheet*.

**Key bug fixed:** Wildcard matching split title on whitespace, leaving punctuation attached to words ("Pacs," failed `^pa.*s$`). Fixed by stripping leading/trailing non-alphanumeric chars before pattern test.

**New functions:** `parseKeywords` (3-pass), `readToken` (shared tokenizer), `tokenMatches` (phrase/wildcard/word).

**Updated functions:** `titleMatchesKeywords`, `highlightKeywords`.

**UI:** Persistent `Keyword filter` label outside the box. 3-line hint block below input. Updated placeholder. `ppu-kw-input-row` wrapper re-anchors the clear button.

**styles.css:** `ppu-kw-wrap` is now a column flex container. New classes: `ppu-kw-label`, `ppu-kw-input-row`, `ppu-kw-hint`. `ppu-filter-row` alignment changed to `flex-start`.

---

## Files produced this session
- search.js v0.6.1.70 — upload to GitHub extension/content/
- styles.css — upload to GitHub extension/content/
- Project_Briefing.md — upload to Claude Project
- Roadmap.md — upload to Claude Project
- changelog_entry_chat60.md — upload to Claude Project

---

## Known issues (carried forward)
1. Multi-pack weight PPU wrong — needs design session
2. Contact lens solution liquid PPU unreliable
3. Cotton swabs extractCount grabbing pack count
4. Razor blade $0.1/ct outlier
5. Cardstock "1 Pack (250 Sheets)" extractCount ordering
6. Pairs ambiguity — interim note only
7. FSA/HSA, Climate Pledge, Small Business — not yet verified on live searches
8. Blue/indigo palette inconsistency — post-alpha
9. No selector resilience — broader codebase still fragile
10. No self-test mode
11. compare.html logging — deferred (storage boundary)
12. Brand filter mixed-case invented names — accepted gap
13. Duplicate "Pages slider" comment in search.js — cosmetic only
14. Outlier PPU units (lb, ft) sorting to top as best value — needs design session
15. welcome.html screenshot — needs replacement with laundry pods screenshot, annotated callout design

---

## Next session priorities (in order)

1. **New screenshot for welcome.html** — laundry pods search, keyword filter showing multiple terms, annotated callout design (red ovals, lines left and right of image, minimize button called out)
2. **Fix extractCount "1 Pack (250 Sheets)"** — pack/count ordering fix
3. **compare.html logging** — deferred until website has more surfaces

---

## Key reminders
- Code files NOT in Claude Project — upload fresh from GitHub each coding session
- Files must be actual uploads, not document blocks
- compare.html JS uses string concatenation, not template literals
- core.js uses callback pattern, not Promises
- Affiliate tags on website only — never in extension
- search.js sends raw numbers to compare.html — compare.html handles formatting
- note = user note; ppuNote = AU inference note — never conflated
- All Google tasks: butactuallyuseful Chrome profile
- Confirm scope before touching any files
- Use AskUserQuestion widget
- All extension text must be selectable
- Rollback rule: 3 failed attempts = stop, revert
- Always provide commit message with GitHub push
- Don't touch weight unit logic without design session
- One agent at a time — Claude only
- Produce complete document files at end of session — not snippets
- brand_blocklist.txt and amazon_brands.txt must be updated concurrently in extension/data/ AND repo root data/
- Always give Melissa a commit message at end of session
- No filler phrases like "I'm waiting" — wastes context

---

## Start of next session
1. Read this handover
2. Ask if anything has come up since last session
3. Upload files fresh from GitHub as needed
4. Confirm scope before touching any files
