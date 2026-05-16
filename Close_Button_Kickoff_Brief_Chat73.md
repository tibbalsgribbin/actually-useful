# Close Button Kickoff Brief — Panel Redesign

*For the next coding session of the panel redesign. Hand this to Sonnet 4.6 at the start of the chat alongside Panel_Redesign_Spec.md, Handover_Chat73.md, and current code files (uploaded fresh from GitHub).*

*Source of truth: design decisions in Chat 73 Opus planning session (this brief). Not a spec §-numbered section — it's a small piece of work that didn't get its own spec entry but needed to be designed before coding.*

*Planned in: Chat 73 (Opus 4.7 planning session).*

---

## Note for Sonnet

This is a coding session. If a real design question comes up during this work — scope, defaults, user-facing copy, anything that wasn't already decided in this brief — **stop and tell Melissa to bring it back to Opus**. Don't make design decisions ad-hoc.

This is the **first session** of the unbundled Close button + Phase 6 work. **Phase 6 is NOT in scope this session.** Don't start onboarding work, don't touch welcome.html, don't draft wizard screens. The next session covers Phase 6.

---

## What we're building

The × close button in the panel header is currently inert (documented no-op since Phase 4). This session wires it up using **Path C**: toolbar-icon restore via `background.js` plumbing, with a one-time first-close toast to teach users how to bring the panel back.

Two pieces of behavior:

1. **Close button hides panel via CSS** (`display: none`), preserves DOM and internal state. Panel reappears on next page load (closed state does not persist across reloads).
2. **First close ever** shows a one-time toast: "Panel closed. Click the Actually Useful icon in your browser toolbar to bring it back." Auto-dismisses after 8 seconds OR on "Got it" click. Never shows again after dismissal (gated by `auHasSeenCloseToast`).
3. **Toolbar icon click** restores panel to its last position/size/minimized state (preserved because DOM was preserved via display:none).

Wires up both `#ppu-close` and `#ppu-close-min` (the close icons in both expanded and minimized headers).

---

## Files in scope

**Extension:**
- `content/search.js` — close button handlers, toast component, `chrome.runtime.onMessage` listener for restore, `auHasSeenCloseToast` storage
- `content/styles.css` — toast styling, any close-specific visual states
- `background/background.js` — `chrome.action.onClicked` listener that sends restore message to active tab
- `manifest.json` — verify no `default_popup` conflict (if there is one, it needs to be removed/handled so `action.onClicked` fires)

**Out of scope this session:**
- All of Phase 6 (welcome.html, wizard, first-search brand hint, loading banner, workflow banner removal, `chrome.runtime.onInstalled`)
- All of Phase 7
- `core.js`, `compare.html`, `index.html`, `welcome.html`, `privacy.html` — no changes
- Weight unit logic, brand detection, keyword parser
- Logging payload

---

## Step 1 — Storage key audit (before any editing)

Before touching code, Sonnet grep-checks all `chrome.storage.local` key reads/writes across `search.js`, `core.js`, and `background.js`. Report the full list. Confirm `auHasSeenCloseToast` is not already in use.

This is the same audit pattern from Phase 5. One new key this session — small, but the discipline catches conflicts before they become silent bugs.

---

## Step 2 — Manifest audit

Check `manifest.json` for:
- `action.default_popup` — if present, this prevents `chrome.action.onClicked` from firing. Document what's currently there.
- `permissions` — confirm `storage` and `tabs` are present (tabs needed for messaging the active tab)
- `background.service_worker` — confirm background.js is wired as a service worker (it should be — we have background.js v0.6.1.17)

Report findings to Melissa before editing. If `default_popup` is set, we need to decide whether to remove it. Likely yes since we have no popup UI, but confirm.

---

## Step 3 — Design spec (already locked)

### 3.1 Close behavior

- `#ppu-close` (expanded header) and `#ppu-close-min` (minimized header) get click handlers
- Click → set `#ppu-controls-wrap` (or whatever the top-level panel container is — Sonnet to identify exact element) to `display: none`
- DOM is NOT removed. Internal state (filters, scroll position, drag position, minimized state, settings open/closed) is preserved.
- Closed state does NOT persist across page reloads. On next page load, panel mounts and is visible by default. This means no new storage key for "is panel closed" — it's an in-memory state only.

### 3.2 Restore behavior

- `background.js` adds `chrome.action.onClicked` listener
- On toolbar icon click: send `{ type: 'ppu-restore-panel' }` message to the active tab via `chrome.tabs.sendMessage`
- `search.js` adds `chrome.runtime.onMessage` listener
- On receiving `ppu-restore-panel`: flip the panel container back to visible (`display: ''` or remove inline display style)
- Because DOM was preserved, panel appears in last position/size/minimized state automatically — no restore logic needed

### 3.3 First-close toast

**Trigger:** First click on `#ppu-close` or `#ppu-close-min` where `auHasSeenCloseToast` is falsy in `chrome.storage.local`.

**Sequence:**
1. User clicks ×
2. Panel hides (display: none)
3. Toast appears anchored near where the panel was — see positioning below
4. Toast auto-dismisses after 8 seconds OR on "Got it" click, whichever first
5. Either dismissal path sets `auHasSeenCloseToast = true` in `chrome.storage.local`
6. Toast never shows again

**Positioning:**
- Anchor to the side of the viewport where the panel was last located
- If panel was snapped left → toast appears top-left area, ~20px from top, ~20px from left
- If panel was snapped right or not snapped → toast appears top-right area, ~20px from top, ~20px from right
- The simpler rule for Sonnet: read the panel's pre-hide `left` coord. If left < viewport center, anchor toast top-left; else top-right.

**Styling:**
- White background, slate-700 text, coral-deep "Got it" button
- 1px slate border, subtle box-shadow (`0 4px 12px rgba(15, 23, 42, 0.12)`)
- Border-radius 8px
- Padding ~14px 18px
- Max-width 360px
- z-index above Amazon's UI (panel uses z-index 9999 — toast goes 10000)
- Font size 13.5px, line-height 1.5
- "Got it" button: coral primary background, white text, 6px 14px padding, 5px border-radius, font-size 12.5px

**Copy (locked):**
> **Panel closed.** Click the Actually Useful icon in your browser toolbar to bring it back.
>
> [Got it]

The first line is bold. Period at end of first sentence. The "Got it" is a button, not text — same styling pattern as the brand-hint Got it buttons spec'd for Phase 6.

**Animation (suggested, Sonnet decides if it's complicated):**
- Fade in over ~200ms on appearance
- Fade + slight translateY out over ~200ms on dismissal
- If animation adds risk or complexity, skip it. Plain appear/disappear is fine.

### 3.4 Subsequent closes

Every close after the first is silent — panel hides, no toast, nothing else. The toolbar icon is the only restore path after the toast has been seen once.

---

## Storage keys

**New keys this session:**

| Key | Type | Default | Purpose |
|---|---|---|---|
| `auHasSeenCloseToast` | boolean | `false` | Whether first-close toast has been shown |

Add load to startup callback chain matching the existing pattern (e.g. `loadHasSeenCloseToast(cb)`).

**Existing keys touched:** none.

---

## Wiring summary

### search.js changes

1. **At module scope:** add `hasSeenCloseToast` variable
2. **Startup chain:** add `loadHasSeenCloseToast(cb)` to existing load chain
3. **Close handler function:** binds to `#ppu-close` and `#ppu-close-min`. Hides panel container. If `!hasSeenCloseToast`, shows toast and updates flag.
4. **Toast component:** DOM creation + auto-dismiss timer + Got it click handler. Removes itself from DOM after dismissal.
5. **Message listener:** `chrome.runtime.onMessage.addListener` — on `ppu-restore-panel`, shows panel container.

### background.js changes

1. **`chrome.action.onClicked` listener:** on click, get active tab via `chrome.tabs.query({ active: true, currentWindow: true })`, send `{ type: 'ppu-restore-panel' }` via `chrome.tabs.sendMessage(tab.id, ...)`.
2. **Error handling:** if no active tab or message fails (e.g. user is on a non-Amazon page), fail silently. Don't crash the background script.

### manifest.json changes

- Likely remove `action.default_popup` if present
- Confirm `permissions` includes `storage` and `tabs`

### styles.css changes

- `.ppu-close-toast` class (positioned fixed, the visual styling described in §3.3)
- `.ppu-close-toast-btn` class for the Got it button
- Animation keyframes if Sonnet includes them

---

## Documented no-ops to clear

- `#ppu-close` / `#ppu-close-min` — REMOVE the "inert" comment in code (and the Documented no-ops carry-forward in the Handover after this session). They are now wired.

---

## Test plan — what to check before producing docs

Test in butactuallyuseful Edge profile on a real Amazon search:

### Close behavior
1. Click × in expanded header. Panel disappears. No toast yet (assuming first time — toast appears, see step 7).
2. Reload page. Panel reappears in its last position/size.
3. Click ×, then immediately click extension icon in toolbar. Panel restores to same position/size.
4. Minimize panel. Click × in minimized header. Panel disappears.
5. Click extension icon. Panel restores to minimized state at last position.
6. Drag panel to left edge. Snap. Close. Click toolbar icon. Panel restores snapped left.

### Toast — first close
7. Reset by deleting `auHasSeenCloseToast` from chrome.storage.local (DevTools → Application → Storage → Chrome storage). Reload page. Click ×. Toast appears.
8. Verify position: if panel was right side, toast appears top-right. If left side, top-left.
9. Click "Got it". Toast disappears. Check chrome.storage.local — `auHasSeenCloseToast` is `true`.
10. Reset flag again. Reload. Close ×. Wait 8 seconds without clicking. Toast auto-dismisses. Flag is `true`.
11. After toast has been seen, close × again. NO toast shows. Panel just hides.

### Edge cases
12. Click toolbar icon when on a non-Amazon page (e.g. google.com). No error, no crash. Silent failure is fine.
13. Click toolbar icon when panel is already visible. Nothing visible should change (panel stays open). Or if Sonnet adds a no-op message handler when panel is already visible, fine.
14. Open settings view. Close ×. Toast appears. Reload. Panel reappears in results view (settings does not persist per existing Phase 5 spec).
15. Re-do all 14 with the panel snapped right.

### Regressions
16. All Phase 1–5 behavior intact: filters work, brand ⋯ menus work, compare works, drag works, resize works, minimize works, settings opens/closes, active count pill works.
17. JS syntax check passes (`node -c` or equivalent if you have it).

---

## Definition of done

1. `#ppu-close` and `#ppu-close-min` both wired.
2. Panel hides via CSS, DOM preserved.
3. Toolbar icon click restores panel to last state.
4. First-close toast appears with correct copy, correct position, dismisses both ways, sets flag.
5. Subsequent closes are silent.
6. `auHasSeenCloseToast` storage key added, loaded on startup.
7. background.js wired with `chrome.action.onClicked` listener.
8. manifest.json audited and updated if needed.
9. No regressions in Phase 1–5 behavior.
10. JS syntax check passes.
11. "Documented no-op" entry for close button removed.

---

## What this session does NOT do

- Phase 6 onboarding (welcome page, wizard, first-search hint, loading banner, workflow banner removal)
- Phase 7 website polish
- Anything in `core.js`, `compare.html`, `index.html`, `welcome.html`, `privacy.html`
- Wiring `chrome.runtime.onInstalled` — that's Phase 6
- `setupCollapsible` dead code — still leave as-is

---

## Document deliverables this session

**Reduced cadence this session** — per Melissa's call in Chat 73, the close button session produces:

1. Test on real Amazon search before producing docs
2. Updated **Handover_Chat74.md** — full handover with what was done
3. GitHub commit message + push reminder
4. Reminder to update Handover in the Claude Project after the push

**NOT produced this session** (will be produced after Phase 6 session, covering both close + Phase 6):
- Changelog entry — Phase 6 session's changelog will cover both sessions
- Project_Briefing_Chat[N].md
- Roadmap_Chat[N].md

The Handover for this session needs to explicitly note "Changelog deferred to Phase 6 session" so future-Melissa isn't confused.

---

## Version bump

Suggested:
- `search.js` → v0.6.1.84 (close handlers + toast + message listener)
- `styles.css` → updated Chat 74
- `background.js` → v0.6.1.18 (new onClicked listener)
- `manifest.json` → bump if any changes made; otherwise unchanged at v0.6.1

Overall version stays at v0.6.1.

---

## Out of scope (don't touch)

- Weight unit logic
- Brand detection logic
- Keyword parser
- Logging payload — no new fields, no changes to existing fields
- `setupCollapsible` dead code

---

## Suggested session opener (for Melissa to paste)

> Close button design session of the panel redesign — Path C (toolbar-icon restore + first-close toast). The brief is `Close_Button_Kickoff_Brief_Chat73.md` in the Project. Panel_Redesign_Spec.md is the full reference. Handover_Chat73.md has current state. I'm uploading current code files fresh from GitHub. Confirm scope before touching anything.

First message back from Sonnet should:
1. Confirm receipt of code files and versions (search.js v0.6.1.83, core.js v0.6.1.53, styles.css updated Chat 72, background.js v0.6.1.17, manifest.json v0.6.1)
2. Restate close button scope in one paragraph
3. **Storage key audit** per Step 1 — grep all `chrome.storage.local` keys, report list, confirm `auHasSeenCloseToast` is not in use
4. **Manifest audit** per Step 2 — report what's in `action.default_popup`, `permissions`, `background`
5. Ask clarifying questions via widget if needed
6. Wait for explicit go-ahead before editing files

---

*End of brief.*
