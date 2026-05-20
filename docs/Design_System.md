# Design System — Actually Useful

*Chat 96 · May 20, 2026 · Opus*

*A lean consolidation of design choices that are already settled across other project docs, so coding sessions (especially Sonnet UI work) can refer to one file instead of hunting through Panel_Redesign_Spec.md, Pattern_AB_Note.md, Demotion_Display.md, and the HTML mockups. This doc is not a complete style guide. It captures what has been decided. Anything not in here is not yet specified and would need a design session before being treated as canonical.*

*Authoritative sources for what's already here:*
- *Palette: `Panel_Redesign_Spec.md` §3*
- *Opacity floor: `Demotion_Display.md`*
- *(?) icon and popover: `Pattern_AB_Note.md`*
- *Fonts: `onboarding_mockup.html`, `first_search_hint_wireframe.html` (mockup-level — production CSS should be verified before treating as canonical)*

---

## How to use this doc

When starting a UI session: read this file first. If a needed decision is here, use it. If it's marked TBD or not present, surface the gap rather than guessing — the absence is intentional and means a design decision hasn't been made.

Do not extend this doc during a coding session. Additions are design work, not implementation work.

---

## Palette — coral + slate

From `Panel_Redesign_Spec.md` §3. Applied to both extension panel and website.

| Role | Hex | Used for |
|---|---|---|
| Primary | `#f25d4e` | Header background, primary button, brand accent |
| Primary deep | `#c2362a` | Links, hover states, brand name in product titles |
| Surface accent | `#fef2f0` | Compare bar background, status bar background, PPU pill background, hint blocks |
| Background | `#f8fafc` | Panel background, settings background |
| Inner divider | `#e2e8f0` | Between rows, between cards |
| Border | `#cbd5e1` | Outer panel border, input borders, button borders |
| Primary text | `#1e293b` | Body text, headings |
| Muted text | `#64748b` | Labels, secondary text, descriptions |
| Disabled / placeholder | `#94a3b8` | Placeholder text, dot icons in muted state |
| Success | `#0f8a4d` | Delivery dates, SNAP EBT eligible |
| Warning surface | `#fef3c7` background / `#78350f` text | Loading banner, transparency warnings |

**Standing test:** clash with Amazon's orange (`#ff9900`). Coral is pink-leaning; Amazon orange is yellow-leaning. Verify on the live page after any palette change.

---

## Fonts

**Sans-serif (UI):** "Inter Tight", "Helvetica Neue", system-ui, sans-serif.

**Serif (body in onboarding-style contexts):** "Source Serif 4", "Source Serif Pro", Georgia, serif.

Source: the onboarding and wireframe mockups. **Caveat:** these are mockup-level choices. Before treating "Inter Tight" or "Source Serif 4" as canonical for the production panel, verify what the live extension CSS actually loads. If they don't match, that's a discrepancy to resolve, not an instruction to change one to match the other.

TBD: a definitive answer to which font is used where in production. A future audit session should reconcile mockups with shipped CSS.

---

## Opacity

From `Demotion_Display.md`.

**Hard-demote text:** 60–70%. **Never below 60%** — readability matters more than the visual effect, especially on brain-fog days.

**Badge text:** full strength (100%), so the reason for demotion stays legible even when the rest of the card is faded.

**Soft-demote text:** lean is full opacity (the badge does the work). Light fade (e.g. 85%) is an open design question for Phase 3 implementation.

**Accessibility floor:** the 60% lower bound should be tested against real contrast ratios on the actual panel background (`#f8fafc`). If contrast falls below WCAG AA, raise the opacity floor — readability always wins over the visual effect.

---

## The `(?)` icon (Pattern A)

From `Pattern_AB_Note.md`.

- 13px diameter circle.
- Rest state: light gray border `#d1d5db`, `?` character centered (9px, font-weight 500).
- Hover: border and text turn deep coral `#c2362a`; background turns surface accent `#fef2f0`.
- Cursor: `help` on hover.
- 4px gap between the icon and the label it follows.
- Click toggles the popover open/closed. Hover behavior is supplementary, not the primary trigger.

### Popover

- White background, light gray border, soft shadow, rounded corners.
- Small arrow pointing at the `(?)`.
- Max width: panel width minus 40px (never clips the panel).
- Text: 11px, dark gray `#1f2937`, line-height 1.4.
- Closes on click outside or ESC.

### First-time discoverability (optional)

Per-feature flag (e.g. `auHasOpened_brandControls_help`). Before first interaction: deeper coral border, slight color saturation. Returns to gray default after first click.

---

## Things this doc does not yet cover

The following areas have no consolidated specification. Each would require a design session to settle:

- **Spacing system** (padding, margins, gutters between rows and cards). Currently ad-hoc in CSS.
- **Border radius conventions** (used inconsistently across mockups: 4px, 6px, 8px, 10px, 14px appear in different contexts).
- **Button states** (hover, active, disabled, focus). Some implicit in current panel; not codified.
- **Form input styling** (text inputs, selects, checkboxes, toggles). Mockup-level only.
- **Transition timings** (the onboarding mockup uses 0.12s on density-card hover; whether this is the standard is unclear).
- **Icon system beyond `(?)`** (close X, expand/collapse chevrons, menu `⋯`, etc.). Used but not specified.
- **Drop shadow conventions**. The frame mockup uses `0 1px 0 rgba(15,23,42,0.03), 0 8px 28px rgba(15,23,42,0.06)`; consistency across the rest of the UI is not documented.
- **Badge sizing and placement** for the trust-posture badges from `Demotion_Display.md` (size, font-weight, internal padding).

When a coding session needs any of these and finds them missing here, the right move is to surface the gap — not to invent a value.

---

## Relationship to other docs

- **`Panel_Redesign_Spec.md`** — the canonical source for panel-level layout decisions. This doc pulls only the palette from there. Other sections of Panel_Redesign_Spec cover panel chrome, layout, settings, and onboarding; some are flagged as stale on the Roadmap (§5.7, §8.3) and shouldn't be treated as current without verification.
- **`Pattern_AB_Note.md`** — the canonical source for the help/hint system. This doc pulls only the `(?)` icon spec from there.
- **`Demotion_Display.md`** — the canonical source for trust-posture badges and the demote-tier visual treatment. This doc pulls only the opacity floor from there.
- **HTML mockups** (`onboarding_mockup.html`, `first_search_hint_wireframe.html`) — useful for seeing the palette in context, but mockup-level. CSS values in these files are not automatically canonical.

---

*Working document. Additions are design work, not implementation work — extend in design sessions, not coding sessions.*
