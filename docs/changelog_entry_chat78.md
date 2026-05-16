# Changelog — Chat 78 (Phase 7A complete)

*May 16, 2026 — Phase 7A final. Push after this session.*

---

## This session

Finished Phase 7A. Two tasks: stripped the broken brand hint, moved bug reporting to a footer link.

### Code changes (search.js v0.6.2.0, styles.css)

**Task 1 — Brand hint removed:**
- Removed the Phase 6 brand hint IIFE from search.js (~60 lines)
- Removed the `dismissBrandHint` placeholder declaration from enclosing scope
- Removed the brand hint re-injection block from `render()`
- Removed `#ppu-hint-slot` div from `buildPanel()` HTML
- Removed all brand hint CSS from styles.css: `#ppu-brand-hint-inline`, `.ppu-brand-hint-*` rules, `#ppu-brand-hint-tooltip`, `::after` arrow, `.ppu-brand-hint-tip-gotit`, `.ppu-brand-menu-btn.ppu-brand-hint-highlighted`, `@keyframes ppu-hint-pulse`, `#ppu-hint-slot`
- Kept `hasSeenBrandHint`, `auHasSeenBrandHint` storage key, and `loadPhase6Flags` — harmless, may be reused by Pattern A+B

**Task 2 — Bug reporting moved to footer link:**
- Removed `reportBtn` block from `openBrandPopover()` — `⋯` popover is now two items (Always show / Always hide)
- Removed `.ppu-brand-popover-item--report` and its hover/focus rules from inline CSS block
- Added `<span id="ppu-report-link">Report an issue</span>` to footer HTML, between My brand rules and Settings
- Added `reportMode` state variable to buildPanel scope
- Added `enterReportMode()`, `exitReportMode()`, `onReportEsc()` functions
- Added capturing click listener on `#ppu-scroll-area` to intercept card clicks in report mode
- Wired `#ppu-report-link` click to `enterReportMode()`
- CSS added for `#ppu-report-link` (matches existing footer link pattern), `#ppu-report-banner`, `#ppu-report-cancel`, `.report-mode-target`, `.report-mode-target:hover`
- Banner text flagged as `// <!-- SUGGESTED COPY -->` for Melissa review

**No version bump** — stays at v0.6.2.0 per Chat 77 decision.

### What's intact from Chat 77 (verified, not touched)
- Sponsored items physically move to end (`sponDemotedHtml` bucket + grey divider)
- Footer link consistency (all four links: 11px / #c2362a / underline on hover)
- Keyword hint selectable (`user-select:text; cursor:text`)
- Unit pill size reduction
- Slider tick contrast
- Brand name clickable (click listener on `.ppu-brand-name`)
- Bug report overlay form + Supabase POST — unchanged; only entry point changed

---

## Testing checklist for Melissa

- [ ] Brand hint code fully removed — no `#ppu-hint-slot`, no `#ppu-brand-hint-inline`, no tooltip, no IIFE, no CSS
- [ ] `⋯` popover shows exactly two items: Always show / Always hide
- [ ] Footer shows five links: Give feedback · Buy me a coffee · My brand rules · Report an issue · Settings
- [ ] All five footer links match style (11px, coral, no underline at rest, underline on hover)
- [ ] Clicking "Report an issue" shows the banner + outlines on all cards
- [ ] Clicking a card in report mode opens the bug overlay for that item
- [ ] Cancel button exits report mode (banner gone, outlines gone)
- [ ] ESC exits report mode
- [ ] Existing bug overlay works (radio selection, Send, cancel, yellow highlight on missing category)
- [ ] Supabase row arrives with all fields
- [ ] Sponsored move to end still works
- [ ] Brand name still clickable
