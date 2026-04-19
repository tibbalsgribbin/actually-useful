# Actually Useful — Changelog

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## **v0.6.1.3 — April 19, 2026 (Chat 12)**

### Collapse/minimize bug fix (search.js)
- When the panel had been resized via the drag handle, clicking ⇕ was toggling between the resized height and whatever the CSS could manage — never collapsing to just the header
- Root cause: `applyPosition()` sets inline `style.height` and `style.maxHeight` when restoring a saved size; inline styles override CSS class rules, so the `.collapsed` rule (`max-height: 41px`) was losing
- Fix: collapse button now clears both inline height properties when collapsing, so the CSS rule takes effect; restores them from `au_search_panel_pos` in storage when expanding

### Version strings aligned (all four files)
- All version strings brought to the new sub-1.0 numbering scheme
- `manifest.json`: `6.1.2` → `0.6.1`
- `core.js` AU_VERSION: `6.1.2` → `0.6.1.3`
- `search.js` header comment: `v6.1.3` → `v0.6.1.3`
- `styles.css` header comment: `v6.1.0` → `v0.6.1.3`

### docs/ folder added to GitHub
- All ten project documents moved into `C:\Users\tibba\GitHub\actually-useful\docs\`
- GitHub is now the single source of truth for project documents
- Files: Project_Briefing.md, Changelog.md, Roadmap.md, Handover.md, About_Me.md, ActuallyUsefulLogger.gs, competitive-research-2026-04-14.md, gemini-ideas-synthesis.md, Session_Summary_2026-04-19.md, Session_Summary_Addendum_ClaudePro.md

### Process
- Confirmed session rule: confirm scope before coding, not mid-diagnosis

---

## **v0.6.1.3 — April 19, 2026 (Chat 10)** *(planning session — no code changes)*

### Version numbering decision
- All version numbers shifted to sub-1.0 to signal pre-release status while preserving history
- v6.1.3 → **v0.6.1.3** (internal AU_VERSION); manifest uses three-part `0.6.1`
- Roadmap: v0.6.2, v0.7 … v0.9 (polished/stable) … v1.0 (Web Store public launch)

### Website architecture decided
- Platform: **GitHub Pages** (static, free, existing repo) + **Supabase** (free database for shareable links)
- Replaces Carrd plan entirely
- Pages planned: `index.html` (marketing), `compare.html` (comparison table), `search.html` (power search form)
- Shareable links confirmed as essential — implemented via Supabase short IDs
- Affiliate tags applied on website only — never in extension (existing `AU_AFFILIATE_TAG` in core.js must be removed before public release)

### Price history approach decided
- Link to Keepa per item (`keepa.com/product/[ASIN]`) rather than CamelCamelCamel
- Reason: CamelCamelCamel injects their own affiliate tags — clicks through their site earn them the commission, not AU. Keepa does not use the Associates program.
- Building our own price history ruled out — requires recording data from day one; new users see a flat line for months

### Review integrity approach decided
- Mild caution signal for statistically improbable ratings (high stars, very low review count)
- Contextual nudge to Fakespot / ReviewMeta on flagged items
- No API integration available — Fakespot closed external access after Mozilla acquisition

### New feature batches added to roadmap
- **Hidden data capture batch:** SNAP eligible, Small Business badge, Condition (New/Used/Renewed), Amazon's Choice label (with transparency note), Best Seller badge + category
- **Review integrity + price history batch:** caution signal, Fakespot nudge, Keepa link per card

### Gemini near-term list — status audit
- ✅ Done: persistent filters, keyword debouncing, empty state message, system font stack
- ⚠️ Partial: Frequently Returned badge (bold done, red not done)
- ❌ Remaining: page-fetch throttling, move auSendLog to background.js, telemetry opt-out toggle, toolbar badge text, affiliate tag removal from core.js

### Website cannot fetch Amazon results independently
- Amazon actively blocks external scrapers; viable services (Apify, Rainforest API) cost $50+/month and carry ToS risk
- Extension remains the Amazon-facing piece; website is the analysis and affiliate layer

### Two-way extension ↔ website connection
- Confirmed as post-alpha
- Extension exports shortlist to website; website sends refined selection back to extension (pre-checks those ASINs in panel on next search)
- Requires extension to be installed; gracefully absent for non-extension users

### Feedback form — action item
- Gemini's three questions need to be verified as present in the form:
  1. "What is one thing that confused you?"
  2. "What is one feature you wish it had?"
  3. "Did it break anything on the page?"

### Visual checklist format added to Handover
- New section in Handover shows recent done / short-term / further out items at a glance

---

## **v6.1.3 — April 18, 2026 (Chat 9)** *(panel height resize + persistent filters + Re-scan page)*

### Panel height resize (search.js, styles.css)
- Added bottom edge drag handle (`#ppu-bottom-handle`) — drag anywhere along the bottom of the panel to resize height
- Min height: 200px. Max height: `window.innerHeight - 10px` from panel top
- Height now saved to `au_search_panel_pos` alongside position and width, and restored on next panel build
- Left edge (width) and bottom edge (height) resize both now save height in their respective `mouseup` handlers

### Persistent filter settings (search.js)
- Filters now saved to `sessionStorage` keyed by search term on every render
- Same search term → filters restore automatically on panel rebuild (e.g. after page navigation)
- Different search term → all filters reset to defaults (clean slate)
- Filters persisted: keyword, sort, min reviews, min rating, sponsored mode, selected unit, source filter state
- Uses `sessionStorage` (not `chrome.storage.local`) — intentionally session-scoped, not cross-session

### Re-scan page (search.js)
- "↺ Refresh" button renamed to "↺ Re-scan page" — describes what the button actually does
- Loading state now reads "Re-scanning…"
- Error fallback messages in pages slider and load-more button also updated to say "try Re-scan page"

### Working rule added
- If files come through as document blocks rather than file uploads, stop and ask Melissa to re-attach as actual uploads — never reconstruct or infer from document blocks

---

## **v6.1.2 — April 18, 2026 (Chat 8)** *(select-all rework + shortlist bar always visible)*

### Select-all checkbox rework (search.js)
- Replaced three-branch logic (none/some/all) with simple toggle: nothing checked → check all; anything checked (some or all) → uncheck all
- Removed `confirm()` dialog entirely
- Removed `indeterminate` state from checkbox — no longer needed with the two-state toggle model
- Applies to all items in `allData` including dimmed/hidden ones

### Shortlist bar always visible (search.js, styles.css)
- Shortlist bar (Select all checkbox + Open in tabs button) now always visible at top of scroll area
- Previously only appeared when at least one item was checked
- JS: removed show/hide logic from `render()` and per-checkbox change handler
- CSS: changed `#ppu-shortlist-bar` baseline from `display:none` to `display:flex`
- Button shows "(0)" when nothing is selected; clicking with 0 selected does nothing

### Bug caught this session
- CSS `display:none` baseline was not updated when JS show/hide was removed — shortlist bar remained hidden until CSS was also fixed
- Prevention rule added: when removing JS visibility toggling, always check and update the CSS baseline too

### Deferred — noted for future session
- Show Selected / Clear Selection buttons in Sort section need rethinking — wording, behavior, and likely relocation to the shortlist bar

---

## **v6.1.2 — April 18, 2026 (Chat 7)** *(polish items landed + shortlist bar fix)*

### System font stack (styles.css)
- Replaced all 4 instances of `Arial, sans-serif` with `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif`
- UI now renders in the native system font on both Windows and Mac

### Keyword debouncing (search.js)
- Added 250ms debounce to the keyword input listener
- Panel no longer re-renders on every keystroke — waits until typing pauses

### Empty state message (search.js + styles.css)
- When keyword filter matches zero results, a message now appears at the top of the (faded) list: *"No results match your keyword(s)"*
- No clear/reset action — user edits the keyword field directly
- Styled as small italic grey text

### Frequently Returned badge (styles.css)
- `.ppu-product-warning-fr` now has `font-weight:600` — badge is bolder and harder to miss

### Keyword hint text (search.js + styles.css)
- Font size bumped from 11px to 13px
- Wording updated: "…Make your selections in the left sidebar of the results page before refining with Actually Useful."

### Shortlist bar visibility fix (search.js)
- Shortlist bar (Select all + Open in new tabs) was only appearing after `render()` was triggered (e.g. by pressing Show Selected)
- Fixed: checkbox `change` handler now updates shortlist bar visibility and button text directly
- Bar now appears immediately when any item is checked

### Project hygiene
- Code files (search.js, styles.css, core.js, product.js, manifest.json) removed from Claude Project
- New session protocol: upload current code files fresh from GitHub at session start
- Eliminates the stale-file problem that caused two reverts in previous sessions

---

## **v6.1.1 — April 17, 2026 (Chat 6)** *(Gemini synthesis + polish attempts — reverted)*

### Gemini ideas synthesised
- Reviewed and organised all ideas from a Gemini consultation into a structured reference document (gemini-ideas-synthesis.md) with dispositions: now / later / not for AU / already done
- Added to project knowledge for future sessions

### Polish changes attempted — reverted
- Four changes were prepared: system font stack, keyword debouncing, empty state message, Frequently Returned badge bolding
- **Files had to be reverted** — Claude was working from stale project files (pre-9:30am versions) that did not reflect v6.1.1 code actually pushed to GitHub
- This is the second revert in two days; root cause identified (see Working Rules)
- No code changes survived this session

### Root cause: stale project files
- Claude reads source files from the Claude Project at session start
- If project files are not updated after a GitHub push, Claude works from the wrong base — silently
- Changes applied to the wrong base produce broken output
- Fix: added explicit reminders at session end (update project files) and session start (verify versions match GitHub)

---

## **v6.1.1 — April 17, 2026 (Chat 5)** *(UX refinements + folder path resolved)*

### Collapsible Sort and Filters dividers (search.js, styles.css)
- Replaced ⚙ Filters toggle button with proper clickable section dividers matching the existing Sort divider style
- Sort and Filters now each have their own divider and collapse/expand independently
- Both sections start expanded by default
- Smooth slide animation (max-height transition) on collapse/expand
- Chevron rotates to indicate open/closed state
- Old `⚙ Filters` button and `#ppu-filter-toggle-row` removed entirely

### Footer repositioned (search.js, styles.css)
- Footer (sort note + info bar + Give feedback / Buy me a coffee links) moved to below the scroll area
- Now truly pinned at the bottom of the panel, always visible regardless of scroll position
- `#ppu-footer-row` restructured: sort note and info bar inside it, links in `#ppu-footer-links` sub-div

### Keyword hint text added (search.js, styles.css)
- New `#ppu-keyword-hint` line below the keywords input
- Text: "Actually Useful works best in conjunction with Amazon's existing filters. Make your selections in the left sidebar before refining with Actually Useful."
- Styled as small italic grey text

### Start over button relocated (search.js, styles.css)
- Moved from filter toggle row to the keyword row (right side)
- Subtle styling: grey border, muted colour

### Folder path reconciled
- Extension now loads from `C:\Users\tibba\GitHub\actually-useful\extension` (no space) — the GitHub Desktop folder
- Old `GitHub actually-similar` (with space) folder no longer used
- v6.1.1 pushed to GitHub for the first time

---

## **v6.1.1 — April 16, 2026 (Chat 4)** *(regression fixes + UI restructure)*

### Panel layout restructured (search.js, styles.css)
- Sort note, info bar, and footer (Give feedback / Buy me a coffee) pinned above scroll area — always visible
- Footer moved out of controls wrap, pinned just above `ppu-scroll-area`
- Info bar pinned just above footer

### Collapsible filters (search.js, styles.css)
- New ⚙ Filters ▾/▸ toggle button — clicking collapses/expands the filter section
- Keywords and Display As pills always visible; Sort, Pages, sliders, and Source pills collapse
- Chevron updates to indicate open/closed state

### Dual slider row (search.js, styles.css)
- Minimum reviews and Minimum rating now share a single row, side by side
- Labels fully spelled out: "Minimum reviews" and "Minimum rating"
- Regression fix: had reverted to separate rows in Chat 3

### Shortlist bar (search.js, styles.css)
- Sticky bar at top of scroll area, appears when any item is checked
- Select all checkbox with three-state logic: nothing → check all; some → confirm dialog; all → uncheck all
- "Open selected listings in new tabs (N)" button — opens all checked items in new tabs

### Sponsored button wording (search.js, styles.css)
- "Demote ads" → "Move ads to end of results"
- Full cycle: Move ads to end of results → ✓ Moved · Hide ads → ✓ Hidden · Show ads

### Keyword placeholder (search.js)
- Restored full examples string: `e.g. unscented -refill · 6ft OR 72 inches · organic -sponsored`
- Regression fix: had been shortened in Chat 3

### Folder path issue identified
- Extension was loading from `C:\Users\tibba\GitHub\GitHub actually-useful\extension`
- Files had been placed in `C:\Users\tibba\GitHub\actually-useful\extension`
- Two separate folders — reconciled in Chat 5

---

## **Session — April 16, 2026 (Chat 3)** *(no version bump — partial UX improvements, regressions)*

### Changes that worked
- Source-hidden bug fixed
- Pages warning and status bar text updated
- Collapsible filters introduced
- Shortlist bar redesigned with select-all and open-in-tabs
- `showCheckedOnly` removed

### Context rot
Session ran too long. Slider merge reverted, placeholder lost, footer/info bar in wrong positions. Files NOT deployed — fixed in Chat 4 (v6.1.1).

---

## **Session — April 16, 2026 (Chat 2)** *(no version bump)*

- Shortlist bar introduced (sticky, with open-in-tabs and clear buttons)
- Slider rows merged onto one line
- `showCheckedOnly` removed

---

## **Session — April 16, 2026 (Chat 1)** *(no version bump — housekeeping & recovery)*

- All references updated: `geeemel@gmail.com` → `butactuallyuseful@gmail.com`
- Apps Script logger rebuilt under new account
- v6.1.0 code recovered and restored
- All 9 extension files committed and pushed to GitHub for first time

---

## **Session — April 16, 2026** *(no version bump — bug fix & UX improvements)*

- `parseRating()` added — star rating filter now works
- Pages warning and status bar text improved

---

## **v6.1.0 — April 14, 2026**

- Full visual redesign: dark navy header, tactile buttons, section dividers, sliders
- Min reviews and min rating sliders
- Pages-to-load slider
- Sponsored button three-state mode
- Footer with feedback and Ko-fi links
- Source pills, thumbnails, nudge, usage logging, error panel

---

## **v6.0.x — March/April 2026**

*(Full history in archive-roadmap-history.md)*
