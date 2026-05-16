# Handover — Chat 75 → Chat 76

*May 16, 2026*

*Phase 6 coding session (Sonnet 4.6). End of Phase 6 bundle (Chat 74 close button + Chat 75 onboarding).*

---

## What was completed this session

**Phase 6 — Onboarding refresh.** Full scope delivered:

- `welcome.html` — full rewrite: welcome content (headline, tagline, Step 0 prologue, 01/02/03 feature cards, brand controls explainer, privacy/telemetry toggle) + inline Personalize wizard (4 screens) + done state.
- `content/welcome-bridge.js` — new file. Content script injected on `actuallyuseful.net/welcome*`. Listens for `au-wizard-save` CustomEvents dispatched by the wizard and writes to `chrome.storage.local`. This is the only mechanism the welcome page has to reach extension storage.
- `manifest.json` — new `content_scripts` entry for `https://actuallyuseful.net/welcome*` (runs `content/welcome-bridge.js`). No new permissions needed — `storage` already present.
- `search.js` v0.6.1.85 — workflow banner fully removed (HTML, CSS, dismiss handler, `au-banner-dismissed` localStorage key). Loading banner system added (first-time amber banner + subsequent thin coral progress strip). First-search brand-controls hint added (inline note above results + tooltip on first branded card's ⋯ button). Two new flags loaded at startup.
- `styles.css` — workflow banner CSS removed. Loading banner styles added. Brand hint styles added.

**Close button from Chat 74 verified working** before Phase 6 work began.

---

## Current state — file versions

| File | Version | Last changed |
|---|---|---|
| `search.js` | v0.6.1.85 | Chat 75 (this session) |
| `core.js` | v0.6.1.53 | Chat 68 |
| `styles.css` | updated Chat 75 | Chat 75 (this session) |
| `background.js` | v0.6.1.18 | Chat 74 |
| `manifest.json` | v0.6.1 | Chat 75 (this session — content_scripts change) |
| `welcome.html` | rewritten Chat 75 | Chat 75 (this session) |
| `content/welcome-bridge.js` | new Chat 75 | Chat 75 (this session) |
| `compare.html` | updated Chat 66 | Chat 66 |
| `index.html` | updated Chat 66 | Chat 66 |
| `privacy.html` | updated Chat 66 | Chat 66 |

**Overall canonical version: v0.6.1.85**

---

## Storage keys — full current inventory

| Key | Type | Default | Set by | Purpose |
|---|---|---|---|---|
| `auPanelPosition` | `{x,y,width}` | none | search.js | Panel position |
| `auPanelMinimized` | boolean | `false` | search.js | Panel minimized state |
| `auPanelSnapped` | `"left"\|"right"\|null` | `null` | search.js | Snap state |
| `auHasSeenCloseToast` | boolean | `false` | search.js | First-close toast shown |
| `auHasSeenLoadingBanner` | boolean | `false` | search.js | First-time loading message completed |
| `auHasSeenBrandHint` | boolean | `false` | search.js | First-search brand hint dismissed |
| `auCardDensity` | string | `'dense'` | search.js / welcome-bridge.js | Card density |
| `auDefaultSort` | string | `'ppu-asc'` | search.js / welcome-bridge.js | Default sort |
| `auDefaultPages` | number | `4` | search.js / welcome-bridge.js | Default pages |
| `auDefaultMoveAdsToEnd` | boolean | `true` | search.js | Move ads to end |
| `auDefaultMinRating` | number | `0` | search.js / welcome-bridge.js | Min rating filter |
| `auDefaultMinReviews` | number | `0` | search.js / welcome-bridge.js | Min reviews filter |
| `auDefaultMoveAmazonBrands` | boolean | `false` | search.js | Move Amazon brands to end |
| `auDefaultMoveUnrecognized` | boolean | `true` | search.js | Move unrecognized brands to end |
| `auDefaultHideSlowShipping` | boolean | `false` | search.js | Hide slow shipping |
| `auDefaultSlowShippingDays` | number | `7` | search.js | Slow shipping threshold |
| `au_telemetry_enabled` | boolean | `true` | search.js / welcome-bridge.js | Telemetry opt-in |
| `auAllowlistBrands` | string[] | `[]` | search.js | Always-show brands |
| `auBlocklistBrands` | string[] | `[]` | search.js | Always-hide brands |
| `au_shortlist` | object[] | `[]` | background.js | Current shortlist |

**Orphaned, no longer used:** `au-banner-dismissed` (localStorage) — left in existing users' browsers. No migration.

---

## Design decisions made this session

1. **Loading slot placement:** `#ppu-loading-banner-slot` occupies the slot previously held by `#ppu-workflow-banner`, above `#ppu-filter-row`. Spec §6 was written assuming a different layout; current code has compare/shortlist bar in scroll area below, not above keyword filter. The workflow banner slot is the natural replacement.

2. **manifest.json content_scripts entry:** match pattern `https://actuallyuseful.net/welcome*` — matches the exact URL `chrome.runtime.onInstalled` opens and any query strings. `web_accessible_resources` unchanged.

3. **Wizard storage bridge:** CustomEvent pattern (`au-wizard-save`) dispatched from welcome page JS, caught by `welcome-bridge.js` content script, which writes to `chrome.storage.local`. Fires on every input change, not on wizard submit. Each setting writes individually.

4. **Brand hint — no detected brands edge case:** inline note still shows; tooltip silently skipped. Dismissal sets flag either way.

5. **Wizard screen 1:** Informational only — no controls. Sets loading expectations and explains the Amazon-sidebar Step 0 before user sets page count on screen 2.

6. **Copy flagged for review:** All user-facing copy on welcome.html and wizard marked `<!-- SUGGESTED COPY: ... -->`. Loading banner and brand hint text marked `// <!-- SUGGESTED COPY: ... -->` in search.js. None locked in — Melissa decides before pushing.

---

## Documented no-ops (carry forward)

- `setupCollapsible` dead code — still present, leave as-is.

---

## Open items / testing needed before push

- [ ] Workflow banner fully gone on Amazon search
- [ ] Loading banner first-time (clear `auHasSeenLoadingBanner`, pages > 1) — amber banner, fades on completion, flag set
- [ ] Loading banner subsequent — thin coral strip, fills, fades
- [ ] Brand hint — all four dismiss paths (Got it, X, click any three-dot, 30s auto)
- [ ] Welcome page — all sections render, wizard all 4 screens, Back/Next/Skip all work, done state
- [ ] Privacy toggle — writes to storage on click, restores on reload
- [ ] Wizard settings write to storage (check DevTools after completing wizard)
- [ ] Auto-open on install — uninstall + reinstall in test profile
- [ ] Close button regression — still works
- [ ] **Copy review** — all SUGGESTED COPY blocks before push

---

## What's next

**Phase 7 — Website polish.** Scope to be defined in an Opus session. Rough scope: remaining website palette work, index.html and privacy.html pass, compare.html polish, any missed §8 items from the redesign spec.

**Deferred work (returns after Phase 7):**
- $/serving for protein powder — design session required
- Prime scraping — check selectors against current Amazon HTML
- CWS push + Reddit posts — held pending redesign completion

---

## Session opener for Chat 76

> Phase 7 planning — website polish. Handover_Chat75.md has current state. Panel redesign is Phase 6 complete. I want to scope Phase 7 before touching anything.

---

*End of handover.*
