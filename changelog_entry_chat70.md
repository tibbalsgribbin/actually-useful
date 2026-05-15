# Changelog — Chat 70 (Phase 4: Panel chrome)

*May 15, 2026*

## Version bump
- **search.js:** v0.6.1.80 → **v0.6.1.82**
- **styles.css:** updated
- **core.js:** unchanged (v0.6.1.53)
- **Overall:** v0.6.1.82

## Files changed
- `content/search.js`
- `content/styles.css`

---

## Phase 4 — Panel chrome

### Minimize / expand

**Two ways to minimize:**
- Click the `#ppu-minimize` button (− icon), now wired (was inert since Phase 1)
- Double-click anywhere on the title bar except the icon buttons

**Two ways to expand from minimized:**
- Click the expand button (chevron-down SVG, `#ppu-expand`) in the minimized header
- Double-click anywhere on the minimized title bar except the icon buttons

**Minimized state:**
- Panel body hidden; only the minimized header row (`#ppu-header-minimized`) is shown
- Minimized header content: AU logo mark · "Actually Useful" title · summary text ("53 items · 3 selected") · expand icon · close icon (inert — see below)
- Summary text updates live via `updateMinSummary()`, called from `render()` whenever the panel is minimized
- Settings gear (?), help (?), and minimize (−) icons are hidden in minimized state

**Expanded state:** unchanged from Phase 3 — logo · title · help (?) · minimize (−) · close (×)

**Persistence:** `auPanelMinimized` (boolean) in `chrome.storage.local`. Loaded at startup via new `loadPanelMinimized(cb)` function, inserted into the startup chain after `loadCardDensity`, before `tryBuild`.

---

### Drag to move

- Title bar (`#ppu-header` in expanded state, `#ppu-header-minimized` in minimized state) is a drag handle
- Both headers set up via `setupHeaderDrag(hdr)` — shared function, called once per header
- Icon buttons in the title bar (`#ppu-minimize`, `#ppu-close`, `#ppu-help`, `#ppu-expand`, `#ppu-close-min`) stop `mousedown` propagation to prevent accidental drag
- **Click vs drag disambiguation:** if `mousedown` → `mouseup` within 4px and 200ms, treated as click. Prevents single-click from triggering drag; double-click-to-minimize still works.
- On drag start: records panel's current `left`/`top` as origin
- On `mousemove`: updates `left` and `top` based on delta; checks snap zone
- On `mouseup`: applies snap or clears snap, then saves position

---

### Resize (left edge)

- Left-edge resize handle (`#ppu-drag-handle`) unchanged visually; width clamped to **320px–600px** (was 280–900px)
- Snap-aware: if panel is snapped right, resizing keeps right edge flush to viewport. If snapped left, left stays at 0 and panel grows rightward. Unsnapped: fixed-right-edge behavior (drag left to widen).
- Saves to `auPanelPosition` on `mouseup`

**Design note:** Resize handle stays on the left edge of the panel regardless of which side the panel is on. If this proves awkward when the panel is on the left side of the viewport, address in a future session.

---

### Snap to edge

- **Snap zone:** within 30px of left or right viewport edge during drag
- **Snap indicator:** a 4px coral stripe (`#ppu-snap-indicator`) appended to `document.body`, shown inset from the relevant viewport edge during drag in the snap zone. Hidden on `mouseup` or when cursor leaves zone.
- **On release in snap zone:** panel docked flush to that edge. Vertical position stays at the drop point (clamped to keep title bar reachable).
- **Dragging out of snap:** clears `auPanelSnapped` to `null`, resumes saving x coords normally.
- **Viewport resize:** if panel is snapped, re-anchors flush to its edge on `window resize` event. Unsnapped panels: clamped at next page load (mid-session re-clamping out of scope).

**Persistence:** `auPanelSnapped` (`"left"` | `"right"` | `null`) saved alongside `auPanelPosition` on `mouseup`. On restore, if snapped, re-anchors using current viewport width rather than saved x coord.

---

### Position persistence

Three new `chrome.storage.local` keys:

| Key | Type | Default | Notes |
|---|---|---|---|
| `auPanelPosition` | `{ x, y, width }` | none | Width clamped 320–600. Position clamped to keep title bar reachable. |
| `auPanelMinimized` | boolean | `false` | |
| `auPanelSnapped` | `"left" \| "right" \| null` | `null` | Overrides x coord at restore time when set. |

**Old key `au_search_panel_pos`:** no longer written. Existing saved values silently ignored — panel defaults to right-side position on first load after update.

**Saves are on `mouseup` only** — not during drag/resize `mousemove`.

**Clamping on restore:** x clamped so at least 80px of title bar is visible. y clamped to keep title bar within viewport. Width clamped 320–600.

---

### Close button (×) — documented inert

`#ppu-close` (expanded header) and `#ppu-close-min` (minimized header) are present but **not wired**. Previously `#ppu-close` removed the panel from the DOM — that behavior is now also removed. Both buttons are visually dimmed (`opacity: 0.4`, `cursor: default`).

**Rationale:** A working close button needs a "how do you bring the panel back?" answer. The toolbar icon is the natural answer but there's no plumbing for it yet. Better to ship close half-built later than half-built now.

**Code comments:** Both buttons carry `<!-- intentionally inert in Phase 4 pending session-hide design -->`.

---

### Bottom resize handle (height)

Unchanged from pre-Phase-4. Variable renamed `fixedTop2` internally to avoid conflict with drag code. Still saves to `auPanelPosition` on mouseup.

---

## Phase 4 polish (same session)

### Compare arrow removed from minimized title bar

`#ppu-min-compare-arrow` was removed after testing showed it was unintuitive — users saw an arrow icon with no label and unclear destination. The full Compare button in the expanded panel remains the only Compare control. To compare while minimized: expand (one click on chevron), then click Compare.

**Removed:**
- Button element from minimized header HTML
- `#ppu-min-compare-arrow` from both `iconSelectors` strings (drag guard and double-click guard)
- Click handler wiring block
- `disabled`-state update logic in `updateMinSummary`
- `#ppu-min-compare-arrow` and `.disabled` variant CSS rules

### Compare bar copy — flipped

The longer pitch now appears in the **unselected** state (informational), and a shorter confirmation appears when items are checked (user has already engaged with the feature).

**Before:**
- Unselected: "Check items below to send to the full comparison table"
- Selected: "Take X items to the full comparison table — that's where Actually Useful really earns its name."

**After:**
- Unselected: "Check items below to send to the full comparison table — that's where Actually Useful really earns its name."
- Selected: "Take X items to the full comparison table"

Applied in both occurrences: the `render()` block and the checkbox click handler block. The `ppu-compare-sub` sub-line ("Filter, sort, share, save with Actually Useful's research workspace") is unchanged — always visible.

---

## Brief inaccuracy noted

The Phase 4 kickoff brief described the expanded header as including a settings gear icon (claimed it was already present in Phase 1). It was not and is not. The gear is a Phase 5 addition. Phase 4 expanded header is unchanged from Phase 3: logo · title · help (?) · minimize (−) · close (×).

Test plan item #12 ("Click the settings gear — verify it doesn't trigger drag") should read: "Click any title-bar icon — verify it doesn't trigger drag." Drag icon-exclusion is verified working for the five wired icons.

---

## Documented no-ops / future-phase notes

**`#ppu-close` / `#ppu-close-min`** (new — Phase 4)
Both inert. Wire when toolbar-icon restore path is designed (Phase 5 or later).

**Settings gear** (carries forward)
Phase 5 addition. Not present in Phase 4.

**`setupCollapsible` function — dead code** (carries forward from Chat 67)
Function defined but never called. Safe to leave. Opportunistic removal in a future session.

**Active count pill — Phase 5 swap** (carries forward from Chat 67)
`updateActiveIndicators()` compares against hardcoded built-in defaults. When Settings ships in Phase 5, each comparison line swaps to user-saved defaults. One-line change per field.

**Card density — needs UI** (carries forward from Chat 68)
Storage plumbed, no user-facing control yet. Phase 5 (Settings) and Phase 6 (onboarding) will add surfaces.

---

## Testing notes (Chat 70)

Tested live on Amazon search (butactuallyuseful Edge profile):
- Minimize (− button): panel collapses to title bar only ✅
- Minimize (double-click title bar): works ✅
- Expand (chevron button): panel restores ✅
- Expand (double-click minimized title bar): works ✅
- Minimized summary text shows item count and selected count ✅
- Drag: panel moves freely; saves position; restores on reload ✅
- Snap left: coral indicator stripe appears; panel docks flush; persists across reload ✅
- Snap right: same ✅
- Drag out of snap: snap clears ✅
- Left-edge resize: width changes; clamps correctly ✅
- Resize while snapped: stays snapped, only width changes ✅
- All filters, brand ⋯ menus, compare button: no regressions ✅
- Compare arrow removed from minimized header ✅
- Compare bar copy flip: longer pitch on unselected, short on selected ✅

JS syntax check passed.

---

*End of changelog entry.*
