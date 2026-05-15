# Phase 4 Kickoff Brief — Panel Redesign

*For the next coding session of the panel redesign. Hand this to Sonnet 4.6 at the start of the chat alongside Panel_Redesign_Spec.md, Project_Briefing.md, and current code files (uploaded fresh from GitHub).*

*Source of truth: Panel_Redesign_Spec.md §4 (in the Claude Project). This brief is the scoped slice of that spec for one coding session.*

*Planned in: Chat 69 (Opus 4.7 planning session).*

---

## Note for Sonnet

This is a coding session. If a real design question comes up during this work — scope, defaults, user-facing copy, anything that wasn't already decided in the spec or this brief — **stop and tell Melissa to bring it back to Opus**. Don't make design decisions ad-hoc.

---

## What we're building

Phase 4 of the panel redesign — **Panel chrome**. The panel becomes user-positioned and user-sized. Five capabilities:

1. **Minimize** — wire the inert `#ppu-minimize` button, plus double-click-title-bar handler. Minimized state shows only the header row with a slightly different layout.
2. **Drag** — title bar becomes a drag handle; panel can be moved anywhere on the page.
3. **Resize** — left edge becomes a resize handle (panel sits on the right by default, so left edge faces the page content).
4. **Snap-to-edge** — dragging within 30px of left or right viewport edge shows a coral indicator stripe and snaps the panel flush on release.
5. **Position persistence** — position, width, minimized state, and snap state all persist in `chrome.storage.local`.

Phase 5 (Settings page) is the next coding session — not part of this brief.

---

## Files in scope

**Extension:**
- `content/search.js` — drag/resize/minimize/snap logic, minimized header layout, persistence load/save, position-clamping on restore
- `content/styles.css` — resize handle hover state, snap-indicator stripe, drag cursor, minimized state styles
- `content/core.js` — verify no impact (likely none)

**Out of scope this phase:**
- `compare.html`, `index.html`, `welcome.html`, `privacy.html`, `background.js`, `manifest.json` — no changes
- Settings page (Phase 5)
- Onboarding refresh (Phase 6)
- Website polish (Phase 7)
- Weight unit logic, brand detection logic, keyword parser — don't touch
- Logging payload — no new fields

---

## What changes — Minimize

**Two ways to minimize:**
1. Click the `#ppu-minimize` button (the `−` icon, currently inert)
2. Double-click anywhere on the title bar except the icons

**Two ways to expand from minimized:**
1. Click the expand icon (chevron-down-in-square)
2. Double-click anywhere on the title bar except the icons

**Minimized state:**
- Shows only the header row.
- Header content reflows to: logo · "Actually Useful" title · search summary text ("60 items · 3 selected") · Compare arrow icon · expand icon · close icon.
- Settings gear (⚙), help (?), and minimize (−) icons are hidden in minimized state.
- Search summary uses the live shortlist count and current result count from existing state — no new tracking needed.
- Compare arrow icon: clicking it goes to the comparison page just like the full Compare button. Same behavior as clicking the full Compare button — including disabled state when 0 items checked (in which case it shows a tooltip "Nothing checked yet" via native title attr, same as the full button).
- Close icon: present but **inert in Phase 4** (see "Documented no-op" below).

**Expanded state (default):**
- Header shows: logo · title · settings gear · help · minimize · close icons. (This is the current Phase 1 layout — unchanged.)

**Persistence:**
- `auPanelMinimized` (boolean) in `chrome.storage.local`. Persists across sessions.
- Load happens at startup in the existing `load*` callback chain. Add `loadPanelMinimized(cb)` matching the pattern.

---

## What changes — Drag

**Drag handle:** the title bar (the coral header). User can grab anywhere in it **except the icons** (settings gear, help, minimize, close, plus the expand icon and compare arrow in minimized state). The icons keep their own click handlers and stop event propagation on `mousedown`.

**Drag affordance:** title bar shows `cursor: move` on hover.

**Drag behavior:**
- On `mousedown` in the title bar (not on an icon): record start position, switch panel to `position: fixed` with explicit `top`/`left` coords if it isn't already.
- On `mousemove`: update `top` and `left` based on drag delta.
- On `mouseup`: stop dragging, save position to `chrome.storage.local`.

**Click vs drag disambiguation:** if `mousedown` and `mouseup` are within ~4px of each other and within ~200ms, treat as a click (not a drag). This matters because double-click-to-minimize also lives on the title bar.

**Persistence:**
- `auPanelPosition` in `chrome.storage.local`, shape `{ x: number, y: number, width: number }`. Width tracked here too since it's a sibling concern.

**Restore behavior with clamping:**
- On load, read `auPanelPosition`. If present, set panel to those coords.
- **Clamp to viewport:** if the saved x would put the title bar past the right edge of the viewport, clamp x so at least the leftmost ~80px of the title bar is visible. Same for y (don't let the title bar drop below the visible viewport). Don't let x or y go negative either.
- The clamp ensures the panel is always grabbable, even if the user switched monitors or resized the browser smaller since last visit.
- Width clamps to its min/max range (320–600px).

---

## What changes — Resize

**Resize handle:** a 4px-wide invisible strip on the **left edge** of the panel (the edge facing the Amazon page content, since the panel defaults to the right side).

**Resize affordance:** on hover, the 4px strip shows a subtle coral tint and `cursor: ew-resize`.

**Resize behavior:**
- On `mousedown` on the handle: start resize.
- On `mousemove`: update panel `width` based on drag delta (dragging left makes panel wider; dragging right makes it narrower).
- Clamp width: min 320px, max 600px.
- On `mouseup`: save width to `auPanelPosition.width`.

**Edge case:** if the panel is snapped to an edge, resizing keeps it snapped to that edge — only the width changes. (The snap logic re-anchors width on the snap side.)

**Edge case:** if the panel position changes such that the resize handle ends up on the right side of the viewport instead of the left (e.g. user drags panel to the left side of the page), the resize handle stays on the same edge of the panel itself — i.e. the side that faces away from the closest viewport edge. Simpler approach for Phase 4: **keep the resize handle on the left edge of the panel always.** If that becomes awkward in practice, address later. Document the choice.

---

## What changes — Snap-to-edge

**Snap zone:** within 30px of the left or right edge of the viewport during drag.

**Snap indicator:** when the cursor enters the snap zone during a drag, show a 4px coral stripe inset from that edge of the viewport (left or right). The stripe disappears when the cursor leaves the snap zone or the drag ends.

**Snap behavior:**
- On `mouseup` inside a snap zone: dock the panel flush to that edge of the viewport. Vertical position stays where the user dropped it (subject to the same vertical clamping as drag).
- After snapping, the panel's x coordinate equals 0 (left snap) or `viewport.width - panel.width` (right snap).

**Persistence:**
- `auPanelSnapped` in `chrome.storage.local`, value `"left" | "right" | null`. Persists across sessions.
- On restore: if `auPanelSnapped` is `"left"` or `"right"`, re-anchor the panel to that edge using current viewport width — don't use the saved x coord.
- If the user drags the panel out of a snapped state, clear `auPanelSnapped` to `null` and start saving x coords normally again.

**Viewport resize handling:**
- If the user resizes their browser window while a snapped panel is open, the snapped panel re-anchors to stay flush against its edge.
- For unsnapped panels in Phase 4: no special viewport-resize handling. If the viewport shrinks and the panel ends up outside it, it will be clamped on the *next* page load. (Mid-session re-clamping is out of scope.)

---

## What changes — Close button (×)

**Documented no-op for Phase 4.** The × icon stays present but inert.

Rationale: a working close button needs a corresponding "how do you bring the panel back?" answer. The toolbar icon would be the natural answer, but there's no plumbing for that yet. Better to ship close half-built later than half-built now.

**Carry-forward note for Sonnet:** document in code comments that × is intentionally inert pending session-hide design.

---

## Persistence summary

Three new `chrome.storage.local` keys, all loaded at startup in the existing `load*` callback chain:

| Key | Type | Default | Notes |
|---|---|---|---|
| `auPanelPosition` | `{ x, y, width }` | none | Width clamps 320–600. Position clamped to keep title bar reachable. |
| `auPanelMinimized` | boolean | `false` | |
| `auPanelSnapped` | `"left" \| "right" \| null` | `null` | When set, overrides `x` coord at restore time. |

**Saves are debounced.** Drag and resize fire `mousemove` continuously. Save to storage only on `mouseup`, not during the drag.

---

## What changes — None (control behavior)

All existing panel controls keep their existing behavior. This phase is **chrome**, not content. Filter sliders still slide, sort still sorts, keyword filter still filters, brand ⋯ popovers still work. The panel just lives in a different place and can be a different size.

---

## Test plan — what to check before producing docs

Run on a real Amazon search in the butactuallyuseful Edge profile:

1. Click `−` to minimize. Header reflows to minimized layout. Click chevron to expand. Back to full panel.
2. Double-click the title bar (not on an icon). Minimizes. Double-click again. Expands.
3. From minimized state, click the Compare arrow icon. Goes to compare.html just like the full Compare button.
4. From minimized state with 0 items checked, hover the Compare arrow — tooltip "Nothing checked yet" shows.
5. Drag the title bar somewhere in the middle of the page. Release. Reload the page. Panel restores to dragged position.
6. Drag panel within 30px of the left edge. Coral indicator stripe lights up. Release. Panel docks flush to left edge.
7. Reload. Panel still docked to left.
8. Drag panel away from left edge. Snap clears.
9. Drag panel toward right edge. Snaps right. Reload. Panel still snapped right.
10. Hover the left edge of the panel. Resize cursor appears. Drag left to widen. Drag right to narrow. Width clamps at 320 and 600.
11. Resize while snapped. Panel stays snapped; only width changes.
12. Click the settings gear — verify it doesn't trigger drag (icons stop event propagation).
13. Click an empty area of the title bar — verify it doesn't trigger drag (click vs drag disambiguation).
14. Try to drag the panel off-screen entirely. Reload. Verify the title bar is still reachable (clamping works).
15. With the panel dragged to a custom position, close Edge entirely. Reopen Edge, navigate to an Amazon search. Position persists.
16. With the panel minimized, close Edge. Reopen. Panel still minimized.

---

## Definition of done

1. `#ppu-minimize` button works. Double-click-title-bar also works.
2. Minimized state shows the spec'd header content; expand icon brings it back.
3. Drag works from anywhere on the title bar except icons.
4. Resize works from the left edge; width clamps 320–600.
5. Snap-to-edge works on both left and right, with coral indicator stripe during drag.
6. Position, width, minimized state, and snap state all persist across page reloads and browser restarts.
7. Off-screen clamping works on restore.
8. Close button × is documented as inert.
9. No regressions: filters still work, brand ⋯ menus still work, compare still works, all controls behave exactly as in Phase 3.
10. JS syntax check passes.

---

## What this session does NOT do

- Settings page (Phase 5)
- Welcome page content rewrite (Phase 6)
- Personalize wizard (Phase 6)
- First-search brand hint (Phase 6)
- compare.html structural changes (post-Phase 7)
- Wiring the toolbar icon for close-restore — deferred until close button design is locked
- compare.html, index.html, welcome.html, privacy.html — no changes

---

## Version bump

Suggested: bump search.js to `v0.6.1.81`. Styles.css gets updated this session. core.js unchanged.

Overall version stays at `v0.6.1` (manifest unchanged).

---

## Out of scope (don't touch)

- Weight unit logic
- Brand detection logic
- Keyword parser
- Logging payload — no new fields, no changes to existing fields
- `setupCollapsible` dead code (can be left as-is; opportunistic removal in a future session is fine but not required)

---

## Suggested session opener (for Melissa to paste)

When opening the Sonnet chat:

> Phase 4 of the panel redesign — panel chrome. The brief is in the Project; Panel_Redesign_Spec.md is the full reference. I'm uploading current code files fresh from GitHub. Confirm scope before touching anything.

The first message back from Sonnet should:
1. Confirm receipt of the code files (search.js v0.6.1.80, core.js v0.6.1.53, styles.css updated Chat 68)
2. Restate Phase 4 scope in one paragraph
3. Ask any clarifying questions via the AskUserQuestion widget — *if* there are real implementation questions the brief didn't cover. Design questions go back to Opus.
4. Wait for explicit go-ahead before editing files

---

*End of brief.*
