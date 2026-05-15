# Changelog — Chat 67 (May 14, 2026)

## Phase 2 — Filters overlay (Option C)

**search.js** bumped to v0.6.1.79. **styles.css** updated. **core.js** unchanged.

---

### Filters overlay — structural refactor

The Filters collapsible has been replaced with a trigger row + slide-down overlay.

**Trigger row (`#ppu-filters-trigger`):**
- Filters icon (funnel), "Filters" label, active count pill, chevron
- Full row is clickable — toggles overlay open/closed
- Chevron rotates 180° when overlay is open
- Active count pill visible only when count > 0; coral wash background (`--surface-accent`), deep coral text, coral border

**Overlay (`#ppu-filters-overlay`):**
- Slides down from trigger row via `max-height` transition (0 → 800px, 150ms ease-out)
- Does not float — pushes content below it down
- Header: × close button only (no title — trigger row already says "Filters")
- Five mini-sections with muted uppercase labels and dividers

**Mini-sections (top to bottom):**
1. Quality — Min reviews slider, Min rating slider
2. Price — Dual-handle range slider
3. Sources — Source pills (Amazon, Fresh, Whole Foods, etc.) — only rendered when multiple sources present
4. Badges — SNAP EBT, FSA/HSA, Small Business, Climate Pledge checkboxes — only rendered when badges present
5. Brand & delivery — "Using your default settings. Adjust for this search →" link toggles inline expansion with Move Amazon brands to end, Move unrecognized brands to end, Hide slow shipping + day picker

All filter controls keep their existing IDs, classes, and event handlers. The markup around them changed; the filter logic did not.

**Close behavior:** trigger row click again · × button · ESC · tap anywhere outside overlay

**Persistence:** overlay always starts closed (no localStorage). Brand & delivery expansion always starts closed.

---

### Active count pill — logic

Counts all non-default filter states:
- minReviews > 0
- minRating > 0
- minPrice set
- maxPrice set
- any srcFilter off
- snapOnly, fsaHsaOnly, climatePledgeOnly, smallBusinessOnly
- brandFilterActive, amazonBrandsDemoteActive, deliveryFilterActive

Structured for Phase 5 swap: when Settings ships, each line is a one-line change from built-in default to user-saved default.

`au-filters-open` localStorage key is no longer used.

---

### Compare button tooltip

Added "Nothing checked yet" tooltip (native `title` attribute) when button is in `.disabled` state.

`pointer-events:none` removed from `#ppu-btn-compare.disabled` CSS rule so the browser shows the title tooltip on hover. Click is blocked in JS instead (`if (compareBtn.classList.contains('disabled')) return;`).

Both places where `.disabled` is toggled now also set/clear the `title` attribute.

**Note for future phases:** if `pointer-events:none` is reinstated on the disabled rule, the title tooltip will stop appearing. The JS guard must remain regardless.

---

### Cleanup

- `filtersOpen` localStorage read removed (overlay always starts closed)
- `setupCollapsible` function kept but marked superseded — never called; kept in case future phases need it
- Old collapsible filter markup (`#ppu-filters-toggle`, `#ppu-filters-collapsible`) fully removed
- `#ppu-filters-count` (old active indicator chip) removed; replaced by `#ppu-filters-active-pill` in trigger row
- Price range row injected padding updated to work inside overlay mini-section
