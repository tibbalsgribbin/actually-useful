# Phase 2 Kickoff Brief — Panel Redesign

*For the second coding session of the panel redesign. Hand this to Claude at the start of the chat alongside Panel_Redesign_Spec.md, Project_Briefing.md, and current code files (uploaded fresh from GitHub).*

*Source of truth: Panel_Redesign_Spec.md §5.6 (in the Claude Project). This brief is the scoped slice of that spec for one coding session.*

---

## What we're building

Phase 2 of the panel redesign — the Filters overlay (Option C).

Today, the Filters section is a collapsible block of controls living below the Sort and Pages rows. Phase 2 replaces that collapsible with a single **trigger row** + a **slide-down overlay**. Tapping the row opens the overlay; the overlay holds all the filter controls, regrouped into five labeled mini-sections. Tapping the row again, the × in the overlay, ESC, or anywhere outside the overlay closes it.

The filter controls themselves keep their existing behavior — sliders still slide, pills still toggle, event handlers stay wired. This is a **structural refactor with grouping**, not a rewrite of filter logic.

One small carryover from Phase 1: the Compare button's disabled state currently has no affordance. Phase 2 adds a tooltip.

---

## Files in scope

**Extension:**
- `content/search.js` — overlay markup, trigger row, open/close logic, active count, chevron rotation, ESC/tap-outside handlers, Brand & delivery inline expansion, Compare button tooltip
- `content/styles.css` — overlay styles, trigger row, active count pill, mini-section labels, chevron animation, slide-down transition, tooltip styles
- `content/core.js` — verify no impact (likely none)

**Out of scope this phase:**
- `compare.html`, `index.html`, `welcome.html`, `privacy.html`, `background.js`, `manifest.json` — no changes
- Brand allowlist/blocklist files — no changes
- Filter logic itself — controls move, behavior stays identical
- Weight unit logic, brand detection logic, keyword parser — don't touch
- Logging payload — no new fields

---

## What changes — trigger row (closed state)

Single row, replaces the current Filters collapsible header. 11px top/bottom padding, 14px sides. Border-bottom: slate divider. Background: panel background.

**Left side:**
- Filters icon (small, slate primary)
- "Filters" label — 13px, slate primary, weight 500

**Right side:**
- Active count pill ("2 active") — only visible when count > 0
  - Background: coral wash (`--surface-accent`)
  - Text: deep coral (`--primary-deep`)
  - Border: coral (`--primary`)
  - Small/compact sizing matching existing pill conventions in the panel
- Chevron-down icon (slate primary) — rotates 180° when overlay is open

**Active count logic:** non-default + overrides combined. Anything that differs from the user's saved defaults counts. (For now, since the Settings page doesn't exist yet, "default" = the current built-in defaults: min reviews 0, min rating 0, no source/badge filters set, etc. When Settings ships in Phase 5, this comparison swaps to user-saved defaults — but the count function should be structured so that swap is a one-line change.)

**Whole row is clickable** — clicking anywhere on the row toggles the overlay open/closed.

---

## What changes — overlay (open state)

Slides down from the trigger row, inside the panel. Does **not** float above results — it pushes everything below it down. Background: white. Border-top: slate divider.

**Open/close animation:** slide-down via `max-height` transition, ~150ms, ease-out. Closed: `max-height: 0`, `overflow: hidden`. Open: `max-height: 800px` (generous — actual content will be shorter; the transition speed varies a bit with content height but stays in the responsive range).

**Header inside the overlay:** small row at the top with a × close button on the right. No title — the trigger row above it already says "Filters."

**Five mini-sections, top to bottom**, each with a small section label (muted, 11px, uppercase or sentence case — match other section label conventions in the panel) and divider below:

### 1. Quality
- Min reviews slider — existing control, moved as-is
- Min rating slider — existing control, moved as-is

### 2. Price
- Dual-handle range slider — existing implementation, moved as-is

### 3. Sources
- Pill row — Amazon, Fresh, Whole Foods, Metropolitan Market, etc. Existing pills, moved as-is

### 4. Badges
- Pill row — SNAP EBT, FSA/HSA, Small Business, Climate Pledge, Has coupon. Existing pills, moved as-is

### 5. Brand & delivery
- Text line: "Using your default settings. [Adjust for this search →]"
  - "Adjust for this search →" is a link in deep coral
  - Clicking the link toggles an **inline expansion** below the text line
- Inline expansion contains three existing controls:
  - Move Amazon brands to end (existing toggle)
  - Move unrecognized brands to end (existing toggle)
  - Hide slow shipping + day picker (existing control)
- Expansion starts closed each session; no persistence

**Important on control migration:** the existing filter controls get **moved into new wrappers** that provide the mini-section structure. The controls themselves keep their existing IDs, classes, and event handlers. The filter logic doesn't know or care that the markup around it changed.

---

## What changes — close behavior

The overlay closes on any of:

1. **Click the trigger row again** — chevron rotates back, max-height returns to 0
2. **Click the × in the overlay** — same as above
3. **Press ESC** — same as above (capture at document level, only when overlay is open)
4. **Click outside the overlay** — anywhere in the panel below the overlay, or anywhere in the page outside the panel
   - Implementation: a document-level click handler that checks whether the click target is inside `#ppu-filters-overlay` or the trigger row; if not, close
   - Make sure clicks inside the overlay (on a slider, pill, etc.) don't trigger close
   - Make sure the close handler doesn't fire on the same click that opened the overlay

---

## What changes — Compare button tooltip

Phase 1 left the Compare button disabled state without an affordance — clicking does nothing, but nothing tells the user why. Phase 2 adds a tooltip.

**Copy:** "Nothing checked yet"

**Behavior:** native HTML `title` attribute is the cheapest option and works for accessibility. If a richer tooltip is needed (styled, positioned, etc.), use a simple CSS `::after` on the disabled state. Either is fine — pick the one that's less ugly. Tooltip only shows when the button is in the disabled state.

---

## Persistence

- **Overlay open/closed state:** none. Overlay starts closed each search/session.
- **Brand & delivery expansion:** none. Starts closed each time the overlay opens.
- **Filter values themselves:** keep existing persistence (whatever they have today).

---

## Out of scope this phase

- Brand row redesign (Phase 3)
- Card density preference (Phase 3)
- Minimize, drag, resize, snap chrome (Phase 4) — note: `#ppu-minimize` is still inert from Phase 1
- Settings page (Phase 5)
- New welcome page content (Phase 6)
- Personalize wizard (Phase 6)
- First-search brand hint (Phase 6)
- Website further polish (Phase 7)

---

## Version bump

Suggested: `v0.6.1.79` (search.js) — single increment for structural overlay work.

Overall version stays at `v0.6.1` unless something requires a manifest bump (it shouldn't).

---

## Testing checklist (Melissa runs this on real Amazon searches)

- Trigger row appears below Pages row with correct icon, label, chevron
- Active count pill hidden when 0 filters non-default
- Active count pill appears with correct count when filters are set
- Clicking the row opens the overlay with slide-down animation
- Chevron rotates 180° on open
- All five mini-sections visible with labels and dividers
- Each filter control still works exactly as before (Min reviews, Min rating, Price range, Source pills, Badge pills)
- "Adjust for this search →" link toggles the inline expansion
- The three brand & delivery controls inside the expansion still work
- × in overlay closes it
- Clicking the trigger row again closes it
- ESC closes it
- Clicking outside the overlay closes it
- Clicking *inside* the overlay (on a slider, pill, etc.) does NOT close it
- Compare button shows "Nothing checked yet" tooltip when 0 items checked
- Tooltip disappears when items are checked
- Coral + slate palette holds — no indigo leftovers, no clashes with Amazon orange
- All text in the overlay is still selectable

---

## End-of-session deliverables

1. Updated `search.js` and `styles.css` files for download
2. Confirm `core.js` unchanged (or note any changes if needed)
3. Updated Project_Briefing.md (Chat 67 version)
4. Updated Roadmap.md (Phase 2 marked complete)
5. Changelog entry for Chat 67
6. Handover_Chat67.md
7. Suggested GitHub commit message
8. Push reminder
9. Reminder to update project files in Claude after the push

---

*End of brief.*
