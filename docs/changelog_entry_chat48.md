## Chat 48 — May 4, 2026

*Brand filter Session 1. Two search.js versions shipped (v0.6.1.47 → v0.6.1.48). One new data file created.*

### Brand text scraping — implemented

`scrapeBrand(el)` added to search.js. Three-selector fallback chain: explicit "by Brand" line → .a-color-secondary byline (with "Visit the X Store" extraction) → first word of title. Returns null if nothing found. Items with null brand exempt from filter. `brand` and `brandFlagged` fields added to scraped item object and compare payload.

### Heuristic gibberish detector — implemented

`detectGibberishBrand(brand)` added to search.js. Five signals:

- `signalNoVowel` — vowel ratio < 0.25, length ≥ 5
- `signalConsonantCluster` — rare cluster OR 4+ consecutive consonants
- `signalShortAllCaps` — 5–8 chars, all caps, ≤1 vowel
- `signalFakeMashup` — no spaces, 5+ chars, 2+ common English word fragments. Flags alone at score 1.
- `signalAllCapsInvented` — all caps, no spaces, 5+ letters, not on passlist. Flags alone at score 1.

Flagging rule: signalFakeMashup or signalAllCapsInvented fires → flagged regardless of score. All other combinations: score ≥ 2 = flagged.

Console output active for verification: `[AU brand] "OUGES" → signals: [signalAllCapsInvented] score:1 flagged:true`

### Signal tuning (v0.6.1.47 → v0.6.1.48)

Based on real-world testing against dress search results:
- signalAllCapsInvented upper char limit raised from 8 to no limit (5+ chars)
- signalFakeMashup word list significantly expanded — now catches RoseSeek, Newshows, Soulomelody
- Both signalFakeMashup and signalAllCapsInvented lowered to threshold 1 (flag alone)

### Bundled blocklist — architecture updated, file created

Real-world testing showed heuristics alone insufficient for high-junk categories (apparel). Bundled blocklist added to brand filter architecture as third detection layer — runs before heuristics, always flags matched brands. Parallels the allowlist.

`brand_blocklist.txt` created with 70 starter brands confirmed as dropship junk. Placed in `extension/data/`. Wire-up to detection logic deferred to Session 3 alongside allowlist loading.

### Design doc updated

Brand_Filter_Design.md updated to reflect Session 1 decisions: bundled blocklist architecture, revised signal design, updated success criteria, Session 1 marked complete.
