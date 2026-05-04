## Chat 47 — May 4, 2026

*Design session. No code changes, no version bumps.*

### Brand filter + delivery window filter — full design completed

Researched and designed AU's approach to filtering low-quality / pseudo-brand / dropship listings. Full design saved as Brand_Filter_Design.md.

Approach decided:
- **Heuristic primary** — 4-signal scoring detector (no-dictionary, no-vowel-pattern, consonant-cluster, short-all-caps). Threshold: 3+ signals fire = action.
- **Allowlist as escape hatch** — small bundled list (~300 brands) overrides heuristic for known-good brands. Curated from telemetry, not user submissions.
- **Personal blocklist** — `[•••]` per-card menu adds brand to user's chrome.storage.local hide list.
- **Optional Amazon-brands demote toggle** — off by default. Demote only, never hide. Strategic neutrality.
- **Delivery window filter** — single "Hide slow shipping" checkbox + slider (2–21 days). Uses earlier of free/paid delivery date.

Per-filter hide/demote toggles. Defaults: brand → demote, delivery → hide. Two-button pill UI per filter. "Below the line" divider when demote active.

Telemetry-driven curation: top 10 filtered brands per session + signal counts logged. No "report a brand" UI — log signal handles it. ~16 new logging fields planned.

### Build plan: 5 sessions

Session 1: brand text scraping + heuristic detector (no UI yet, console logging only)
Session 2: brand filter UI + hide/demote toggle + results summary
Session 3: bundled allowlist + personal blocklist plumbing
Session 4: delivery window filter
Session 5: Amazon-brands demote toggle + polish

Optional Session 6: compare.html integration (brand column, brand filter on filter bar).

### Updates to project docs

- Roadmap.md — China/origin research marked complete; v0.7 brand filter section added with 5-session breakdown; pre-CWS-listing checklist updated; "Hide this seller forever" rolled into personal blocklist scope.
- Project_Briefing.md — date stamp only (no code state changes).
- Brand_Filter_Design.md — new file. Full design spec.
