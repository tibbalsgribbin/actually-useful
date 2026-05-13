# Actually Useful — Panel Redesign Spec

*Source of truth for the panel + settings redesign. Output of the design conversation in Chat 64.*
*Companion to Project_Briefing.md and Roadmap.md. Will be referenced by the coding sessions that follow.*

*Last updated: May 12, 2026 (Chat 64)*

---

## 1. Why this exists

The panel grew incrementally over 63 sessions. Features were added one at a time without a top-down design. The result: no clear hierarchy, too much competing for attention, high cognitive load. That last one matters most — the target audience (frugal shoppers, accessibility-minded users, people fed up with Amazon's defaults) benefits directly from less mental work, not more.

This redesign is **cognitive minimalism** — not aesthetic minimalism. Not fewer features. Same features, restaged so the user's eye lands somewhere on purpose.

## 2. Design principles

**The panel telegraphs the workflow: expand → narrow → decide.** Three power features carry the workflow: keyword filter (narrow), pages slider (expand), compare button (decide). These stay always-visible and prominent. Everything else is in support.

**Settings handles defaults; the panel handles overrides.** A user who sets their preferences once should never see those decisions again unless they want to.

**Compare is a destination, not an instruction.** It's the gateway to actuallyuseful.net — the full research surface where monetization happens and where AU becomes more than an extension. The compare bar should be visible and inviting, not hiding until the user has committed.

**Cheekiness lives in the cracks, not the headlines.** "Actually Useful, you know, actually useful" is the voice. Used in 2–3 high-traffic spots where a person speaking would say something like that. Not on every label.

**Contextual reveals must have stable footprint.** If something appears or disappears, reserve the space. The layout never reflows around the user.

## 3. Palette — coral + slate

Applied to both extension panel and website (full brand alignment). To be tested during build for clash with Amazon's orange; adjusted if necessary.

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
| Success | `#0f8a4d` | Delivery dates, SNAP EBT eligible (kept standard — user's eye already trained) |
| Warning surface | `#fef3c7` / `#78350f` | Loading banner, transparency warnings |

**Why coral + slate over alternatives:** the most "current design language" of the seven palettes considered, without reading as corporate. Pairs with Amazon's orange because they're in different families (coral is pink-leaning, Amazon orange is yellow-leaning). Warm enough to feel personal, cool enough to carry data UI.

## 4. Panel chrome

**Size:** 380px wide default. User-resizable from the left edge (resize handle invisible until hover). Min width 320px. Max width 600px.

**Position:** Right side of the Amazon page by default. User can drag the title bar to reposition. Position persisted in `chrome.storage.local` (`auPanelPosition`).

**Snap-to-edge:** When user drags within 30px of the left or right edge of the viewport, an inset 4px coral stripe lights up to indicate snap target. Releasing within snap zone docks the panel flush to that edge.

**Minimize:** Two ways — (1) click the minus icon (`−`) in the header, (2) double-click the title bar. Minimized state shows only the header row.

**Minimized header content:** logo + title + search summary ("60 items · 3 selected") + Compare arrow icon + expand icon + close icon. User can still jump straight to compare from minimized state without expanding the panel.

**Expand from minimized:** click the expand icon (chevron-down-in-square) OR double-click the title bar again.

**Drag affordance:** Title bar shows `cursor: move` on hover. User can grab anywhere in the title bar except the icons.

**Resize affordance:** Left edge (or whichever edge faces toward the page content) shows a 4px resize handle on hover with a subtle coral tint.

**Persistence summary:**
- `auPanelPosition` — `{ x, y, width }` in `chrome.storage.local`
- `auPanelMinimized` — boolean, persists across sessions
- `auPanelSnapped` — `"left" | "right" | null`, persists across sessions

## 5. Layout — top to bottom

The panel has 9 stacked regions when fully expanded.

### 5.1 Header

Background: coral primary (`#f25d4e`). Text: white.

Contents: logo (white square, coral letters) · "Actually Useful" title · settings gear (⚙) · help (?) · minimize (−) · close (×).

Icons are 26px square with hover background `rgba(255,255,255,0.15)`. Icons sit at the right; title fills the middle; logo at the left.

### 5.2 Compare bar (Medium variant)

Background: coral wash (`#fef2f0`). Text: slate primary (`#1e293b`). Border-bottom: slate border.

Two-line text on the left:
- **Top line (13px, weight 500):** "Take 3 items to the full comparison table" *(open item — see §10)*
- **Sub line (11px, muted):** "Filter, sort, share, save your research"

Button on the right: coral background, white text, count baked in: "Compare (3) →"

**Empty state (0 items checked):** *open item — see §10*

**Disabled state:** button background turns to slate border color, text turns muted, no hover state. *Open item if we even need this.*

### 5.3 Power feature 1 — Keyword filter

Background: panel background. Border-bottom: slate divider.

Header row inside this section:
- Left: "Keyword filter" label (muted, 12px)
- Right: "Clear all" link (deep coral, 11px, cursor pointer) — only visible when input has content

Input below: full width, 8px vertical padding, slate border, white background, placeholder text muted.

Placeholder: `e.g. unscented OR "fragrance-free" AND pods OR pa*s -sheet*`

**Hint behavior (already implemented):** hidden by default, appears on first keypress, dismissible via × that resets the seen-flag (so it reappears for first use after dismissal).

Hint text: `AND = both · OR or space = any · − or NOT = exclude · "phrase" · wild*`

### 5.4 Sort row

Background: panel background. Border-bottom: slate divider. 9px padding top/bottom, 14px sides.

Contents (single horizontal row):
- "Sort:" label (muted, 12px)
- Sort select (flex: 1, slate border, white bg): options are **Best value ↑ · Price low → high · Price high → low · Rating · As Amazon listed**
- "Ads to end" button (small, white bg, slate border) — toggles independently

**"As Amazon listed"** is the new option, matching the existing "As listed" language from the unit pill row. Users select this when they want to find a specific product in its original Amazon position.

### 5.5 Power feature 2 — Pages row

Background: panel background. Border-bottom: slate divider.

Contents (single horizontal row):
- "Show me:" label (muted)
- "1" (current value, slate primary)
- Slider (flex: 1, slate track, coral fill, slate knob)
- "7 pages" (max, slate primary)
- "Re-sync" link (deep coral, with refresh icon)

**Default value:** 4 pages. *(Changed from current default of 1 — middle ground between cautious and max.)*

**Slider max:** 7. *(Unchanged.)*

### 5.6 Filters — Option C (overlay)

Background: panel background. Border-bottom: slate divider.

Closed state: single row, 11px top/bottom padding, 14px sides.
- Left: filters icon + "Filters" (13px, slate primary, weight 500)
- Right: active count pill ("2 active" — coral wash bg, deep coral text, coral border) + chevron-down

Click the row to open the overlay. The overlay slides down within the panel (does not float above results). Overlay background: white. Border-top: slate divider.

**Overlay contents** (top to bottom, all under labeled mini-sections):

- **Quality** — Min reviews slider, Min rating slider
- **Price** — Range slider (dual-handle, see existing implementation)
- **Sources** — Pill row (Amazon, Fresh, Whole Foods, Metropolitan Market, etc.)
- **Badges** — Pill row (SNAP EBT, FSA/HSA, Small Business, Climate Pledge, Has coupon)
- **Brand & delivery** — short text line: "Using your default settings. [Adjust for this search →]" with deep-coral link. Clicking opens an inline expansion with three controls: Move Amazon brands to end · Move unrecognized brands to end · Hide slow shipping + day picker.

The overlay has a close × in the top-right that closes it; clicking the trigger row again also closes it. Chevron rotates 180° when overlay is open.

**Override visibility:** when the user has set a per-search override (e.g., "min rating: 4★" for this search but their default is "any"), the active count pill on the trigger row includes the overrides. The "Adjust for this search" affordance in Brand & delivery shows whether overrides are active.

### 5.7 Result cards (dense by default)

The actual list of Amazon results, scrollable region. Each card:

- Padding: 8px top/bottom, 14px sides (dense). Comfortable version doubles vertical padding.
- Display: flex, gap 10px
- Left: 17px checkbox (coral when checked, slate border when not)
- Middle: 44px thumbnail
- Right: body content (flex: 1)

**Body content rows (in order):**

1. **Title row** — product title (12px, deep coral, weight 500, line-height 1.3)
2. **Price/PPU row** — price (13px, slate primary, weight 500), PPU pill (coral wash bg, deep coral text, small), optional badges (Fresh, etc.)
3. **Brand row** — brand name in muted slate (11px), followed by ⋯ menu icon (disabled-color, cursor pointer). Tapping the ⋯ opens a small popover with "Always show [brand]" / "Always hide [brand]" / "Hide this seller forever" (future). Whole row goes away if no brand was detected.
4. **Delivery + rating row** — green delivery text, separator, rating + review count
5. **Badge row** (optional) — SNAP EBT, Subscribe & Save %, coupon, etc.

**Density preference:** user setting. Comfortable or Dense. *Default = offered during onboarding as a first-run choice.*

**Brand row redesign rationale:** the current "Always show / Always hide" pill buttons on every card are visually loud and rarely used per-card. Plain text + ⋯ menu surfaces the brand info (still useful) while keeping the control accessible. Onboarding must teach this control exists since it's no longer visible by default.

### 5.8 Footer status line

Background: surface accent (coral wash `#fef2f0`). Border-top: slate divider. 8px padding top/bottom.

Two-part region with **stable footprint** — height does not change when content changes:

- **Always:** one line of status text (11px, muted). Examples:
  - "All in $/lb · 54/60 items have unit data" (when all items share a unit family)
  - "54/60 items have unit data · weight mix — pick a unit to compare" (when there's a mix)

- **Conditional:** unit pills row (oz · lb · g · kg · As listed) — only appears when there's a unit mix. The slot is always reserved at the same height; what changes is whether the pills are visible.

### 5.9 Footer links

Background: panel background. Border-top: slate divider.

Single row of links separated by space (deep coral, 11px, underline on hover):

- Give feedback
- Buy me a coffee
- My brand rules (N) — count of personal allowlist + blocklist combined
- Settings

## 6. Loading state

When `pages > 1` and the panel is fetching additional pages, a loading banner appears between the compare bar and the keyword filter section.

**Style:** background `#fef3c7` (warning surface), text `#78350f`, 11px, with a small spinner icon. Border-bottom: matching amber border.

**First-time copy (user has never loaded > 1 page before):**
> ⟳ **Loading 7 pages of results** — this is what makes Actually Useful, you know, actually useful. About 8–12 seconds. You can start checking items as they appear.

**Subsequent-load copy:** *open item — see §10*

**Persistence:** `auHasSeenLoadingBanner` boolean in `chrome.storage.local`. Set to `true` after first full message has been shown.

## 7. Settings page

Opens when user clicks the settings gear in the panel header, or the "Settings" link in the footer. Replaces the panel content in-place (not a new tab). Back arrow returns to the panel without losing any active filter state.

Width: 580px (slightly wider than the panel to give settings rows room to breathe). If the panel is currently narrower than 580px, settings opens at 580px and resizes the panel.

**Header:** coral primary background, back arrow on the left, "Settings" title.

**Sections (top to bottom):**

### 7.1 Defaults for every search

| Setting | Control | Default | Copy |
|---|---|---|---|
| Default sort | Select | Best value ↑ | How results are ordered when a search loads |
| Pages to load by default | Number input (1–7) | **4** | Loading more pages takes longer — but it's also what gives you a complete picture before you start filtering. If you plan to send your shortlist to the comparison page, you'll probably want more pages, not fewer. |
| Move ads to end of results | Toggle | On | Sponsored listings still visible, just at the bottom |
| Card density | Radio (Comfortable / Dense) | *Set during onboarding* | How much space each result takes up |

### 7.2 Quality thresholds

| Setting | Control | Default | Copy |
|---|---|---|---|
| Minimum rating | Select (Any, 3★+, 4★+, 4.5★+) | Any | Hide items below this rating |
| Minimum reviews | Number input | 0 | Hide items with fewer reviews |

### 7.3 Brand & shipping

| Setting | Control | Default | Copy |
|---|---|---|---|
| Move Amazon brands to end | Toggle | Off | AmazonBasics, Solimo, etc. |
| Move unrecognized brands to end | Toggle | On | Likely dropship junk — moved, not hidden. You can always include or exclude any specific brand from results using the ⋯ menu on a result, or the [My brand rules] page. |
| Hide slow shipping | Toggle + select (3/5/7/10/14 days) | Off | Hide items not arriving within your window |

### 7.4 Privacy

| Setting | Control | Default | Copy |
|---|---|---|---|
| Share anonymous usage data | Toggle | On | Helps Actually Useful improve — no personal info, no purchase history |

## 8. Onboarding

Three pieces: welcome page (always shown on install), personalize wizard (optional, skippable), first-search hint (one-time tooltip).

### 8.1 Welcome page

URL: `actuallyuseful.net/welcome` — opens automatically on extension install via `chrome.runtime.onInstalled`.

Must cover:

1. **What AU does (the pitch)** — Amazon, but Actually Useful. One short paragraph + tagline.
2. **The three power features** — keyword filter, load more pages, compare. One sentence each, ideally with a small illustration or screenshot.
3. **Brand controls live in a menu now — here's how** — explainer with a visual showing the brand row + ⋯ menu + popover. *This replaces the current per-card "Always show / Always hide" pattern; users need to discover that brand management exists.*
4. **Privacy / telemetry choice** — explicit opt-in or opt-out, with the same copy as Settings 7.4.
5. **Optional: Personalize Actually Useful** — link/button to the wizard. Skip option goes straight to a sample search.

### 8.2 Personalize wizard (optional)

Four screens, all skippable, with Back/Next/Skip controls. Skipping uses defaults.

| Screen | Purpose | Decision |
|---|---|---|
| 1 | Loading expectations | "Most searches load 1 page. Actually Useful can load up to 7 — slower, but you see everything before you start filtering. We default to 4. You can change this anytime." |
| 2 | Default sort + page count | Two controls. Sort dropdown (with "As Amazon listed" option). Pages input. Live "About X seconds" estimate next to pages. |
| 3 | Quality thresholds | Min rating + min reviews. "These hide weak results across every search. Most users start with 4★+ and 50 reviews." |
| 4 | Card density | Visual side-by-side of comfortable vs dense, with one shown as the selected option. |

All four are persisted to `chrome.storage.local` and reflected in Settings.

### 8.3 First-search brand-controls hint

*Open item — see §10*

## 9. Implementation phases (suggested)

Not part of the spec proper — included as a starting point for coding session planning.

**Phase 1: Palette migration + layout scaffold**
- Apply coral + slate to styles.css
- Reorganize panel into the 9 regions
- Move sort/pages out of the Filters section into their own rows
- Result: panel looks new but no behavior changes yet

**Phase 2: Filters overlay (Option C)**
- Collapse all filters into a single row + overlay
- Build the overlay panel with internal grouping
- Migrate existing filter controls into the overlay

**Phase 3: Card redesign**
- Replace per-card brand row with plain text + ⋯ menu
- Build the brand-options popover
- Density preference + radio in Settings
- Compact existing card spacing

**Phase 4: Panel chrome — minimize, drag, resize, snap**
- Minimize button + double-click handler
- Drag-to-reposition with `chrome.storage.local` persistence
- Resize handle with persistence
- Snap zones on left/right edges
- Minimized header content

**Phase 5: Settings page**
- Build settings as a panel state (back-arrow returns)
- Wire every default to existing behavior
- Onboarding wizard reuses these controls

**Phase 6: Onboarding refresh**
- New welcome page content (coral palette, three power features, brand explainer)
- Personalize wizard
- First-search hint
- Persist `auHasSeenLoadingBanner`, `auHasSeenBrandHint`, etc.

**Phase 7: Website palette migration**
- compare.html → coral + slate
- index.html → coral + slate
- welcome.html → coral + slate (built in phase 6)
- privacy.html → coral + slate

## 10. Open items (Claude's judgment, flagged for review)

### 10.1 Empty-state compare bar copy

*Claude's call:* When zero items are checked, the compare bar still appears but the button is muted-slate and the copy shifts to:
- **Top line:** "Check items below to send to the full comparison table"
- **Sub line:** "Filter, sort, share, save with Actually Useful's research workspace"
- **Button:** "Compare (0)" — disabled visual treatment

The bar stays the same height. The button doesn't disappear (which would cause reflow). User can't click it when empty.

**Melissa: confirm or rewrite the copy.**

### 10.2 First-search brand-controls hint

*Claude's call:* On the user's first search after install, show a small inline note above the result list:

> 💡 **Brand controls** — Click the ⋯ next to any brand name to always show or always hide that brand. Manage your rules from the [My brand rules] link at the bottom. [Got it]

Dismissible via "Got it" or via a small × on the right of the note. Dismissal persists (`auHasSeenBrandHint = true`).

**Why this approach:** a tooltip pointing at a specific ⋯ icon would be visually noisy on first load, and the user's eye is already settling on the panel. An inline note above results sits in expected reading flow without grabbing attention away from results.

**Melissa: confirm, or push for a tooltip-pointer style instead.**

### 10.3 Loading banner — subsequent loads

*Claude's call:* After the user has seen the full first-time message once, subsequent loads show a thin progress strip below the compare bar:

- Height: ~4px
- Background: `#fef3c7` (matching warning surface)
- Progress bar fills coral as pages load (e.g., 1/4 → 25% filled)
- Tiny text inside the strip: "Loading 4 pages..." (10px, `#78350f`)

When loading completes, the strip slides away (with stable footprint — the slot is always reserved). When a new search starts, the strip reappears.

**Melissa: confirm, or alternative (always show full message, or always count-only)?**

### 10.4 Compare bar copy

*Claude's call:* Current placeholder is "Take 3 items to the full comparison table." This is functional but flat.

A more characterful alternative: "Take 3 items to the full comparison table — that's where Actually Useful really earns its name." Slightly long. The cheek is in the back half.

Or shorter: "3 items ready for the full comparison."

Or — keep the functional version and put the personality in the empty-state copy and the loading banner only.

**Melissa: pick or rewrite. The compare bar is the highest-traffic element in the panel besides search results, so this copy gets seen constantly.**

### 10.5 Auto-collapse on scroll

*Claude's call:* The panel does NOT auto-collapse when the user scrolls. The panel stays put because it's an interactive surface, not a notification. If the user wants it out of the way, they can minimize.

**Melissa: confirm, or push for some scroll-aware behavior?**

## 11. What's out of scope for this redesign

- Per-product page fetching (Frequently Returned, variations, Sold by) — post-alpha
- Cross-session shortlist persistence — post-alpha
- compare.html visual redesign — separate session (it will inherit the palette in Phase 7 but a structural redesign of compare.html is its own project)
- search.html (standalone search page) — post-alpha, separate spec
- Walmart / Target support — post-alpha
- Per-card "Hide this seller forever" — listed in popover as future
- Lazy product-page fetch architecture — post-alpha
- Public-facing telemetry dashboard — post-alpha

## 12. Standing rules (carried from Project_Briefing.md)

- All extension text must be selectable
- No template literals in compare.html JS (string concatenation only)
- core.js uses callback pattern, not Promises
- search.js stays as one file until selector resilience is properly designed
- Affiliate tags on website only — never in the extension
- note = user note; ppuNote = AU inference note — never conflated
- search.js sends raw numbers to compare.html — compare.html handles all formatting

## 13. Decision log

| Decision | Choice | Made in |
|---|---|---|
| Compare bar variant | Medium | Chat 64 |
| Compare bar position | Top of panel | Chat 64 |
| Filters layout | Option C — overlay | Chat 64 |
| Brand on cards | Plain text + ⋯ menu | Chat 64 |
| Card density default | First-run onboarding choice | Chat 64 |
| Default pages | 4 | Chat 64 |
| New sort option | "As Amazon listed" | Chat 64 |
| Minimize behavior | Minus button + double-click title | Chat 64 |
| Resizable/moveable | Yes, with snap-to-edge | Chat 64 |
| Position persistence | `chrome.storage.local` | Chat 64 |
| Onboarding structure | Welcome page + optional wizard | Chat 64 |
| First-search hint | Yes — exact form pending review | Chat 64 |
| Voice | Cheeky in 2–3 spots, neutral elsewhere | Chat 64 |
| Palette | Coral + slate | Chat 64 |
| Palette scope | Panel AND website | Chat 64 |
| Settings page in scope | Yes, real product surface | Chat 64 |
