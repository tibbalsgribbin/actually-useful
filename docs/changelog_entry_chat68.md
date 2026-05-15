# Changelog — Chat 68 (Phase 3: Card redesign)

*May 14, 2026*

## Version bump
- **search.js:** v0.6.1.79 → **v0.6.1.80**
- **styles.css:** updated
- **core.js:** unchanged (v0.6.1.53)
- **Overall:** v0.6.1.80

## Files changed
- `content/search.js`
- `content/styles.css`

---

## Phase 3 — Card redesign

### Brand row — pill buttons → plain text + ⋯ menu (per spec §5.7)

**Removed:**
- `.ppu-brand-allow-btn` and `.ppu-brand-block-btn` "Always show" / "Always hide" pill buttons that appeared on every card with a detected brand
- Their two associated CSS rules (inline `styleEl` block in search.js)
- Their two per-card click listener `.forEach` blocks

**Added:**
- Brand row now renders as: `<span class="ppu-brand-name">Brand</span> <button class="ppu-brand-menu-btn">⋯</button>`
- Brand name in muted slate (`#6b7280`, 11px) per spec
- ⋯ button styled in disabled-color (`#9ca3af`) with hover lift, `.is-open` state shows coral tint
- Click ⋯ → small popover (`.ppu-brand-popover`) anchored below the button via `position:fixed` + viewport coords (avoids clipping by scrolling list container)
- Popover contains two `.ppu-brand-popover-item` buttons:
  - "Always show [brand]" — calls `applyBrandAllow(brand)`
  - "Always hide [brand]" — calls `applyBrandBlock(brand)`
- The two action functions preserve the exact allowlist/blocklist logic from the previous pill-button handlers (storage writes, re-detection, render). No behavior changes — only the trigger UI changed.

**Popover close behavior** (matches Phase 2 overlay pattern):
- ESC (document-level keydown listener)
- Click outside the popover (document-level click listener; ignores clicks on ⋯ triggers since those have their own handler with stopPropagation)
- Clicking the same ⋯ a second time (toggle behavior via `.is-open` class)
- Clicking a different card's ⋯ (auto-closes current popover before opening new one)
- Selecting an action (closes after applying)
- Document-level listeners attached once via `window.__ppuBrandPopoverListenersAttached` guard flag to prevent duplicates across re-renders

**Card with no detected brand:** row absent entirely (unchanged from pre-Phase-3 behavior).

### Card density preference — storage plumbed (Phase 5/6 will add UI)

**Added:**
- New state variable `cardDensity = 'dense'` (default), values `'dense'` | `'comfortable'`
- New `loadCardDensity(cb)` function — reads `auCardDensity` from `chrome.storage.local`, sets the in-memory `cardDensity` var, calls `cb()`. Matches the callback pattern of the other `load*` functions.
- `loadCardDensity` inserted into the startup chain in the bottom IIFE (after `loadPersonalAllowlist`, before `tryBuild`).
- At render time, `#ppu-list` gets a class applied: `.density-dense` (default) or `.density-comfortable`. Both old density classes are removed first so re-renders behave correctly.

**styles.css:**
- `.ppu-row` padding changed from `6px 10px 6px 8px` to `8px 14px` (dense baseline per spec §5.7)
- New rule: `#ppu-list.density-comfortable .ppu-row { padding:16px 14px; }` (doubled vertical, same horizontal)

**No UI to change density yet** — Settings page (Phase 5) and onboarding wizard (Phase 6) will surface the control. To manually test, run in the extension's service worker console: `chrome.storage.local.set({auCardDensity: 'comfortable'})` then reload the Amazon search page.

---

## Documented no-ops / future-phase notes

**`#ppu-minimize` — Phase 4** (carries forward from Chat 66/67)
Still inert. Wire as part of Phase 4 panel chrome work.

**Compare button `pointer-events:none` — do not reinstate** (carries forward from Chat 67)
Removed in Phase 2 so the native `title` tooltip fires on hover. Click blocked in JS instead.

**`setupCollapsible` function — dead code** (carries forward from Chat 67)
Function defined but never called. Safe to leave. Opportunistic removal in a future session.

**Active count pill — Phase 5 swap** (carries forward from Chat 67)
`updateActiveIndicators()` compares against hardcoded built-in defaults. When Settings ships in Phase 5, each comparison line swaps to user-saved defaults. One-line change per field.

**Card density — needs UI** (new Chat 68)
Storage is plumbed and the render reads from it, but there is no user-facing control to set `auCardDensity`. Phase 5 (Settings page) and Phase 6 (onboarding wizard) will add the surfaces. Default is `'dense'` so existing users see no change unless they explicitly set comfortable via DevTools.

---

## Testing notes (Chat 68)

Tested live on Amazon search:
- ⋯ popover opens, shows both actions with brand name
- ESC closes
- Click outside closes
- Click another card's ⋯ switches popover
- Click same ⋯ again toggles closed
- "Always show" and "Always hide" actions work as before (verified in "My brand rules" overlay at bottom of panel)

Density storage not directly tested (no UI yet); code path verified to match existing `load*` callback pattern. JS syntax check passed.

---

*End of changelog entry.*
