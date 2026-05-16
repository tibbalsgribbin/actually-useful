# Pattern A+B — Future Onboarding/Hint System

*Created: May 16, 2026 — Chat 77 (Opus design conversation).*

*Status: Deferred. To be implemented in a future phase, likely after Phase 7B and the compare.html structural pass.*

---

## Why this exists

The current onboarding pattern (first-search hint with strip + tooltip, per Panel_Redesign_Spec.md §8.3) was tried in Phase 6 and found to be wrong:

- **Peekaboo timing is bad for users with cognitive load.** The hint auto-dismisses after a fixed duration. Anyone who looks away, gets interrupted, or just reads slowly loses access to the information. Can't be recalled.
- **Two competing surfaces undermine each other.** The dark tooltip on the `⋯` is visually loud and steals attention from the strip. The strip is the actual teaching surface but goes unnoticed.
- **The tooltip is clipped on narrow panels.** The panel's minimum width is 320px; the tooltip text is too wide to fit. Half of it is always off-screen at default width.

The deeper problem: any "appears and disappears" pattern requires the user to be paying attention at the right moment. Users with fibromyalgia, brain fog, autism, ADHD, or other cognitive-load conditions are exactly the audience least likely to catch a transient hint. They are also a meaningful portion of the target audience.

## The replacement: Pattern A + Pattern B

**Pattern A — always-visible `(?)` icons next to feature labels.**

Every feature group in the panel has a small `(?)` icon adjacent to its label. Click or hover to reveal a short popover explaining what the feature does. The `(?)` never moves, never auto-dismisses, never demands attention. It's there when the user wants it and invisible the rest of the time.

**Pattern B — "Help" footer link opens a drawer with all feature documentation.**

A new footer link, "Help," opens a slide-up or full-panel drawer that lists every feature with its explanation. Scrollable. Comprehensive. The user can read it once at install, ignore it forever, or return whenever they want.

**The two patterns work together.** Pattern A handles in-context "what is this?" questions. Pattern B handles "I want to learn the whole tool." A user who never clicks a `(?)` and never opens the drawer can still use the tool — the UI is functional without help. A user who wants to understand the tool can choose how to engage.

## What this replaces in the existing spec

- **Panel_Redesign_Spec.md §8.3 (first-search brand-controls hint)** — fully replaced. The strip + tooltip pattern goes away. The brand controls feature gets a `(?)` next to its label in the controls area, and an entry in the Help drawer.
- **Panel_Redesign_Spec.md §5.1 (header)** — header currently includes a `(?)` icon. That stays but it should open the Help drawer (Pattern B) rather than the welcome page.
- **Future hints throughout the panel** — no new hint patterns should be designed ad-hoc. Every new feature gets a `(?)` next to its label and an entry in the Help drawer. This is the system.

## Design details

### Pattern A — the `(?)` icon

- Small circle, 13px diameter, light gray border (`#d1d5db`) at rest, `?` character centered (9px, font-weight 500)
- Hover: border and text both turn deep coral (`#c2362a`), background turns coral wash (`#fef2f0`)
- Click or hover triggers a popover (see below)
- Cursor: `help` on hover
- Sits immediately after the feature label, separated by 4px gap

### Pattern A — the popover

- White background, light gray border, soft shadow, rounded corners (matches existing popover style)
- Small arrow pointing at the `(?)`
- Max width: panel width minus 40px (so it never clips)
- Text: 11px, dark gray (`#1f2937`), line-height 1.4
- Closes on click outside or ESC
- Click on the `(?)` toggles the popover open/closed
- Hover behavior is supplementary — for desktop users who prefer hover over click

### Pattern A — first-time discoverability (optional)

One-time visual emphasis on the `(?)` icon before the user has interacted with it: deeper coral border, slight color saturation. Returns to gray default after first click. This is optional — the system works without it. Stored as a per-feature flag (e.g., `auHasOpened_brandControls_help`).

### Pattern B — the Help drawer

- Triggered by the "Help" footer link (new — added to the footer alongside the existing links)
- Slides up from the bottom of the panel (or fills the panel like the Settings page does — match Settings behavior for consistency)
- Header: coral wash background, "How Actually Useful works" title, close × on the right
- Body: scrollable list of feature entries
- Each entry: feature name (12px, bold, dark gray) · inline icon hint where relevant · explanation paragraph (11px, regular)
- Sections grouped by area: Sort & filter · Brand controls · Keyword filter · Compare · Privacy · Reporting issues · etc.
- Search input at the top (post-MVP — not needed in v1)

### Where the `(?)` goes — initial list

(Not exhaustive — every feature should get one over time. This is the starting set:)

- **Sort** — explains the sort options and what "Best value" means
- **Filters** — explains the filter overlay and what each filter does
- **Brand controls** — explains the `⋯` menu and how brand rules work
- **Pages** — explains the pages slider and trade-off between load time and completeness
- **Keyword filter** — explains AND/OR/NOT/quotes/wildcards (replaces the deferred verbosity issue)
- **Compare** — explains what the shortlist does and what compare.html offers

### Where the Help drawer link goes

In the footer, after "My brand rules" and "Report an issue," before "Settings":

> Give feedback · Buy me a coffee · My brand rules · Report an issue · **Help** · Settings

## What this means for existing flagged design issues

- **Keyword filter hint verbosity** — solved. Long-form explanation lives in the Help drawer. The `(?)` next to "Keyword filter" gives a short popover. The current in-panel hint can be drastically shortened or removed entirely.
- **"We show our working" banner** — solved or partly solved. The transparency message can live in the Help drawer under a "Why this PPU calculation?" entry. Per-card transparency can stay as a small `(?)` on the PPU pill itself if desired.
- **Bug reporting discoverability** — partially solved. The footer link is the primary entry. The Help drawer's "Reporting issues" entry tells users it exists.

## What this does NOT do

- It doesn't replace welcome.html. The welcome page still introduces the tool and walks new users through the four-step workflow.
- It doesn't replace the personalize wizard. The wizard is for setting defaults, not for explanations.
- It doesn't try to handle proactive teaching. If a feature is so subtle that the user won't know to look for it, fix the UI — don't add a hint.

## Implementation phasing (suggested)

This is its own Phase, likely Phase 9 or 10 (after 7B website work and the compare.html structural pass).

- **Phase X.1 — Pattern A only.** Add `(?)` icons next to each feature label. Build the popover. Wire up the initial set above. Reuse existing popover infrastructure where possible.
- **Phase X.2 — Pattern B.** Build the Help drawer. Migrate the current welcome page brand controls section content into a drawer entry.
- **Phase X.3 — Cleanup.** Remove any remaining ad-hoc hint code (keyword filter hint, etc.). Audit for consistency.

The strip + tooltip code from Phase 6 should be stripped in Phase 7A (already happening) so it doesn't sit in the codebase dead.

## Spec update — what needs to change in Panel_Redesign_Spec.md

This is a separate task. Don't do it during a coding session. When ready:

- §8.3 — strike the strip + tooltip pattern entirely. Replace with a forward reference to Pattern A+B.
- §5.7 — verify the brand row description still matches the actual implementation (plain text + `⋯` menu).
- §5.9 — add "Help" link to the footer link list.
- §13 — add a decision row: "First-search hint pattern → replaced with `(?)` icons + Help drawer (Pattern A+B). Chat 77 — May 16, 2026."
- Add a new §14 documenting Pattern A+B as the system for all hints and onboarding.

---

*End of note.*
