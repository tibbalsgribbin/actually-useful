# Handover — Chat 77 → Chat 78

*May 16, 2026*

*Phase 7A partial — Opus 4.7. Started as a Sonnet coding session, escalated to Opus when the brand hint design issues surfaced.*

---

## What happened this session

Started Phase 7A coding. Got partway through, then surfaced two design problems that forced a switch to Opus:

1. **The brand hint is broken by design.** The "strip + tooltip" pattern (Panel_Redesign_Spec.md §8.3) is the wrong pattern. The tooltip on the `⋯` is clipped by the panel width and visually shouts; the strip is the actual teaching surface but goes unnoticed because the tooltip steals attention. Peekaboo behavior (auto-dismiss timers) is also wrong for users with cognitive load — easy to miss, can't be recalled. Whole pattern needs to go.

2. **Bug reporting doesn't belong in the brand `⋯` menu.** Mixing "this brand's rules" with "this listing has a data problem" is semantically wrong. Was the Chat 76 decision; revisited and reversed this session.

Opus designed a replacement system (Pattern A+B — always-visible `(?)` icons next to feature labels + a "Help" footer link opening a drawer with all feature documentation). Decision: **defer A+B to a future phase, ship the rest of 7A with the broken hint stripped out and bug reporting moved to a footer link.**

---

## What was actually coded (and is good)

These are in the working files but not yet pushed:

- **search.js bumped to v0.6.2.0**
- **1a — Sponsored items physically move to end.** Added `sponDemotedHtml` bucket, routes `sponDem` items there, appends at bottom with a grey "N sponsored items moved to end" divider. Pattern matches existing amazon/brand divider treatment.
- **1c — Footer link consistency.** All four footer links normalized to 11px / `#c2362a` / no underline at rest / underline on hover. Inline styles removed from `ppu-blocklist-link` and `ppu-settings-link`; CSS-driven now.
- **1d — Keyword hint selectable.** Added `user-select:text; cursor:text` to `.ppu-kw-hint`.
- **2a — Unit pill size reduction.** Font-size 12px → 10px, padding 3px 10px → 2px 7px.
- **2b — Slider tick contrast.** Color changed from `var(--au-border)` to `#b0b0bc`. Major ticks 5px → 6px, minor 3px → 4px.
- **2c — Brand name clickable.** Added click listener on `.ppu-brand-name` spans that opens the same popover as `⋯`. Added `cursor:pointer` and coral hover state.
- **Sponsored divider CSS** added in styles.css.
- **`#ppu-hint-slot` CSS** added (`flex-shrink:0`, panel surface background, `overflow:hidden`) — was bleeding Amazon's background through.
- **Keyword hint verbosity TODO** added as a comment for the deferred design session.

---

## What still needs to be done for 7A (next Sonnet session)

### 1. Strip the broken brand hint entirely

The hint code added in Phase 6 is broken by design (see top of this doc). Strip it out cleanly.

**Files affected:**
- `search.js`
  - Remove the entire brand hint IIFE (currently around line 4725, starts with `// ── Phase 6 — First-search brand-controls hint ────`, ends with `})();` before the catch block)
  - Remove the `dismissBrandHint` placeholder declaration just before `render()` (around line 4594)
  - Remove the brand hint re-injection block inside `render()` (the block guarded by `if(!hasSeenBrandHint)` that adds the hint to `#ppu-hint-slot`)
  - Remove the `#ppu-hint-slot` div from the panel HTML
- `styles.css`
  - Remove `#ppu-brand-hint-inline` rule and all `.ppu-brand-hint-*` rules
  - Remove `#ppu-brand-hint-tooltip` rule
  - Remove `.ppu-brand-menu-btn.ppu-brand-hint-highlighted` rule
  - Remove `#ppu-hint-slot` rule (added this session, no longer needed)
- Keep `hasSeenBrandHint` variable, the `auHasSeenBrandHint` storage key, and the load function — they're harmless and may be reused if Pattern A+B reuses the flag

### 2. Move bug reporting from `⋯` menu to footer link

**Remove from `⋯` popover:**
- The `reportBtn` block inside `openBrandPopover()` (the "Report an issue with this item" 4th menu item)
- The `.ppu-brand-popover-item--report` CSS rule and its `:hover/:focus` rule

The `⋯` popover returns to three items as the spec requires (§5.7): Always show / Always hide / Hide this seller (future).

**Add to footer:**
- A new "Report an issue" link in the footer, styled identically to the other four links (Give feedback · Buy me a coffee · My brand rules · Settings)
- Link order: Give feedback · Buy me a coffee · My brand rules · **Report an issue** · Settings
- The link should be 11px, `#c2362a`, no underline at rest, underline on hover (matches existing footer link style)

**New interaction flow — "click an item to report":**

Clicking the footer "Report an issue" link puts the panel into a "select item to report" mode:
- All cards get a soft coral outline indicating they're tappable for reporting (subtle, like `box-shadow: 0 0 0 1px #fcc8c3 inset`)
- A banner appears at the top of the scroll area: "Click an item to report an issue. [Cancel]"
- Clicking any card opens the existing bug report overlay for that item
- Clicking Cancel exits the mode, removes the outlines and banner
- ESC also exits the mode

**Keep all existing bug report overlay code as-is.** The `openBugReportOverlay(item)` function, `submitBugReport()`, the form HTML, the CSS, the Supabase POST — all of it stays. Only the entry point changes.

### 3. Done — coding complete for 7A

Phase 7A version is v0.6.2.0. Bump to v0.6.2.1 only if additional bug fixes are needed.

---

## Files in working state (not yet pushed)

The two files modified this session are in the outputs of this chat. They include all the working changes from §"What was actually coded" above, plus the broken brand hint code that needs to be stripped. The next Sonnet session should:

1. Download those files (or get them from Melissa fresh from GitHub if she's already pushed them — likely she has not)
2. Strip out the broken hint and the `⋯` bug report code per §"What still needs to be done"
3. Move bug reporting to a footer link
4. Present final files for Melissa to push

**Important:** Melissa has NOT pushed any of this session's code yet. The next Sonnet session is the one that finishes the work and produces the push.

---

## Version state

| File | Version | Status |
|---|---|---|
| `search.js` | **v0.6.2.0** | In flight — bumped this session, needs cleanup before push |
| `styles.css` | updated this session | In flight |
| `core.js` | v0.6.1.53 | Unchanged |
| `background.js` | v0.6.1.18 | Unchanged |
| `manifest.json` | v0.6.1 | Unchanged — will not bump until CWS push |

---

## Storage keys — unchanged from Chat 75

See Handover_Chat75.md for inventory.

Note: `auHasSeenBrandHint` key remains in storage but is no longer used by any code after the strip. Harmless; will be reused if Pattern A+B reuses the flag.

---

## Decisions made this session

1. **Brand hint pattern (spec §8.3) is rejected.** Strip the implementation. Replace later with Pattern A+B (Phase 9 or later — see Pattern_AB_Note.md).

2. **Bug reporting entry point moves from `⋯` menu to a footer link.** New "click an item to report" interaction flow. Overlay form stays the same.

3. **Phase 7A version stays v0.6.2.0.** Originally bumped this session; no need to re-bump.

4. **Pattern A+B (`(?)` icons + Help drawer) is the future of all onboarding/hints in the panel.** Deferred but documented. See Pattern_AB_Note.md for the full design.

5. **Panel_Redesign_Spec.md needs updates.** §8.3 and §5.7's mention of brand hint are stale. Spec update is its own task — do not edit the spec mid-coding-session.

6. **"Always hide" semantics flagged but unchanged.** The popover label says "Always hide" but the implementation demotes to bottom at 50% opacity. Pre-existing design issue, not a Phase 7A bug. Track for a future UX session.

---

## Open items for testing (carried forward)

These were verified done before this session started (Melissa confirmed):

- [x] Workflow banner gone on Amazon search
- [x] Loading banner first-time
- [x] Loading banner subsequent
- [x] Brand hint — all four dismiss paths (now moot, hint being stripped)
- [x] Welcome page renders
- [x] Privacy toggle
- [x] Wizard settings write to storage
- [x] Auto-open on install
- [x] Close button regression

For the next Sonnet session to test after coding:

- [ ] Brand hint code fully removed — no `#ppu-hint-slot`, no `#ppu-brand-hint-inline`, no tooltip, no CSS, no JS IIFE
- [ ] `⋯` popover has exactly three items: Always show / Always hide / [no third item until "Hide this seller" ships]
- [ ] Footer has "Report an issue" link, correctly styled
- [ ] Clicking "Report an issue" enters report mode (outlines on cards, banner at top)
- [ ] Cancel button exits report mode
- [ ] ESC key exits report mode
- [ ] Clicking a card in report mode opens the bug overlay for that item
- [ ] Existing bug overlay works (radio selection, Send, transparency note, yellow highlight on missing category, cancel)
- [ ] Supabase row arrives with all fields
- [ ] All Phase 7A coded improvements still work: sponsored move to end, footer link consistency, keyword hint selectable, unit pills smaller, slider ticks more visible, brand name clickable

---

## What's deferred (post-Phase 7A)

- **Pattern A+B (`(?)` icons + Help drawer)** — see Pattern_AB_Note.md
- **Panel_Redesign_Spec.md updates** — §8.3 and §5.7 brand-row mention now stale; needs careful pass
- **"Always hide" semantics** — demotes instead of hides; UX question
- **Phase 7B** — welcome.html / index.html / privacy.html (next Sonnet session, after 7A push)
- All Chat 76 deferred items still deferred (Impossible Burger math, $/serving for protein powder, Prime scraping, CWS push, keyword filter hint verbosity, etc.)

---

## Before next Sonnet session

Melissa must:

1. Update Claude Project documents (this Handover, revised kickoff brief, Pattern A+B note, Changelog)
2. Open a fresh Sonnet chat
3. Upload `search.js` and `styles.css` fresh from GitHub (or from this session's outputs if she hasn't pushed yet)
4. Paste the revised Phase 7A kickoff brief (`Phase7A_Kickoff_Brief_Chat77.md`)

---

## Session opener for next session

> Phase 7A finish — strip broken brand hint, move bug reporting to footer link. Kickoff brief is Phase7A_Kickoff_Brief_Chat77.md. Read Handover_Chat77.md first. Upload search.js and styles.css from GitHub. [Paste brief.]

---

*End of handover.*
