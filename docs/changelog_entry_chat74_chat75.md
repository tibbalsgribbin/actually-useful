# Changelog — Chat 74 + Chat 75 (May 16, 2026)

*Phase 6 bundle (close button + onboarding refresh). Two coding sessions — Chat 74 (close button) and Chat 75 (Phase 6). Docs produced at end of Chat 75 covering both.*

---

## Chat 74 — Close button (v0.6.1.18)

### background.js — v0.6.1.18

**New: `chrome.action.onClicked` listener.** Fires when user clicks the toolbar icon. Sends `{type: 'ppu-restore-panel'}` to the active tab's content script. Silent failure if not on an Amazon search page (correct — `chrome.runtime.lastError` intentionally swallowed).

**Prerequisite:** `default_popup` removed from `manifest.json` action block. If `default_popup` is ever re-added, `onClicked` will silently stop firing and panel restore will break. Comment added to both files noting this dependency.

**New: `chrome.runtime.onInstalled` listener.** Opens `https://actuallyuseful.net/welcome` on fresh install only (`details.reason === 'install'`). Does not fire on update or reload.

### search.js — v0.6.1.84 → (see Chat 75 below)

**Close button wired.** `#ppu-close` (expanded header) and `#ppu-close-min` (minimized header) both wired. Click hides panel via `display: none`. DOM preserved — internal state (filters, drag position, minimized state, scroll) intact.

**New: `ppu-restore-panel` message handler.** Receives message from background.js, restores panel to last position/size/minimized state.

**New: First-close toast.** Fires once ever, gated by `auHasSeenCloseToast`. Copy: "Panel closed. Click the Actually Useful icon in your browser toolbar to bring it back." [Got it]. Auto-dismisses after 8 seconds OR on Got it click. Anchors to the side of viewport where panel was last located. Either dismiss path sets `auHasSeenCloseToast = true`.

**New storage key:** `auHasSeenCloseToast` (boolean, default false).

**New function:** `loadHasSeenCloseToast(cb)` — added to startup chain before `loadUserDefaults`.

### manifest.json — default_popup removed

`default_popup` key removed from `action` block (was absent, confirmed by audit). Documented as prerequisite for `onClicked` listener. No other manifest changes.

---

## Chat 75 — Phase 6: Onboarding refresh (v0.6.1.85)

### search.js — v0.6.1.85

**Workflow banner removed.** `#ppu-workflow-banner` HTML block removed from panel build. Dismiss handler removed. `au-banner-dismissed` localStorage set/remove calls removed. `#ppu-workflow-banner` removed from `contentRowIds` array in settings view hide/show logic (replaced with `#ppu-loading-banner-slot`).

**New: `#ppu-loading-banner-slot`.** Empty div above `#ppu-filter-row` (the slot previously occupied by the workflow banner). Always present in DOM; content injected by auto-load lifecycle.

**New: Loading banner system.** Injected into `#ppu-loading-banner-slot` at start of auto-load, cleared with 200ms fade on completion or error.
- First time (`!hasSeenLoadingBanner`): amber full banner with spinner and explanatory copy.
- Subsequent (`hasSeenLoadingBanner`): thin coral progress strip. Strip bar width updates proportionally as pages load.
- On completion: sets `auHasSeenLoadingBanner = true` in storage, fades slot out.
- On error: slot cleared immediately, existing error copy shown via `autoStatusEl`.

**New: First-search brand-controls hint.** Fires once ever after first `render()` call in `buildPanel`, gated by `hasSeenBrandHint`.
- Inline note injected at top of `#ppu-list` (`#ppu-brand-hint-inline`).
- Tooltip (`#ppu-brand-hint-tooltip`) appended to first `.ppu-brand-menu-btn` on a card with a detected brand, with pulse animation on the button.
- Edge case: if no detected brands, inline note shows alone; tooltip silently skipped.
- Four dismiss paths: Got it button, X button, clicking any `.ppu-brand-menu-btn` (user is exploring), 30-second auto-dismiss. All paths set `auHasSeenBrandHint = true`.
- 300ms delay before tooltip injection to allow `render()` to paint cards.

**New storage flags:** `auHasSeenLoadingBanner` (boolean, default false), `auHasSeenBrandHint` (boolean, default false).

**New function:** `loadPhase6Flags(cb)` — loads both new flags. Added to startup chain after `loadHasSeenCloseToast`, before `loadUserDefaults`.

**Version bumped:** v0.6.1.84 → v0.6.1.85.

### styles.css

**Removed:** All `#ppu-workflow-banner` styles (main block + coral wash palette override block in dark theme section). `@keyframes ppu-pulse-dot` removed.

**New — loading banner:**
- `#ppu-loading-banner-slot` — flex-shrink:0 container, no height when empty.
- `#ppu-loading-banner-first` — amber first-time banner (background `#fef3c7`, border `#fde68a`, text `#78350f`).
- `.ppu-loading-spinner` — 12px spinning border-top animation (`ppu-spin` keyframe).
- `#ppu-loading-strip` — 18px thin coral progress strip container.
- `#ppu-loading-strip-bar` — absolute fill, coral `#f25d4e` at 35% opacity, transitions on width.
- `#ppu-loading-strip-label` — 10px label overlaid on strip.

**New — brand hint:**
- `#ppu-brand-hint-inline` — amber/orange inline note above results (background `#fff7ed`, border `#fdba74`, text `#9a3412`).
- `.ppu-brand-hint-body`, `.ppu-brand-hint-link`, `.ppu-brand-hint-gotit`, `.ppu-brand-hint-x` — inline note anatomy.
- `.ppu-brand-menu-btn.ppu-brand-hint-highlighted` — highlighted state on targeted three-dot button, with `ppu-hint-pulse` animation.
- `#ppu-brand-hint-tooltip` — dark slate tooltip anchored right of button (arrow pointing right, tooltip extending left). `#ppu-brand-hint-tip-gotit` button inside.

### manifest.json

**New `content_scripts` entry:**
```json
{
  "matches": ["https://actuallyuseful.net/welcome*"],
  "js": ["content/welcome-bridge.js"],
  "run_at": "document_idle"
}
```
Match pattern agrees with URL opened by `chrome.runtime.onInstalled` in background.js. No new permissions required — `storage` already present.

### welcome-bridge.js (new file — `content/welcome-bridge.js`)

Content script injected on `actuallyuseful.net/welcome*`. Listens for `au-wizard-save` CustomEvents dispatched by welcome.html wizard JS. Writes `event.detail.key` / `event.detail.value` to `chrome.storage.local`. Silent failure if extension context unavailable (e.g. extension disabled mid-session).

### welcome.html (full rewrite)

**Welcome content:**
- Headline + tagline per positioning framework.
- Step 0 prologue callout (left-border accent, muted slate text) — "Start in Amazon's own sidebar..."
- Three feature cards: 01 Expand / 02 Narrow / 03 Decide.
- Brand controls explainer with visual mockup (card with popover).
- Privacy/telemetry toggle (defaults on, reads saved state on load, writes via `au-wizard-save` CustomEvent).
- Two CTAs: "Get started" (scrolls to wizard) + "Skip and start shopping" (amazon.com).

**Personalize wizard (4 screens):**
- Screen 1: Loading expectations — informational, no controls. Explains page count concept + Step 0 tip.
- Screen 2: Sort + pages — sort select (`auDefaultSort`) + pages number input with live time estimate (`auDefaultPages`).
- Screen 3: Quality thresholds — min rating select (`auDefaultMinRating`) + min reviews number (`auDefaultMinReviews`).
- Screen 4: Card density — two clickable cards with visual previews (`auCardDensity`).
- Progress bar (4 steps), Back/Next/Skip on each screen, done state with "Start shopping" CTA.
- All settings write to extension storage on change via `au-wizard-save` CustomEvent, not on submit.

**All user-facing copy marked `<!-- SUGGESTED COPY: ... -->` — not locked in.**

---

## Orphaned keys / cleanup notes

- `au-banner-dismissed` (localStorage) — no longer written or read by search.js. Left in existing users' browsers. No migration.

---

*End of changelog entry.*
