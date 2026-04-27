# Handover — April 27, 2026 (Chat 36)

## Session type
search.js + compare.html changes only. No manifest, background.js, styles.css, or core.js changes.

## Current versions
- manifest: 0.6.1 (unchanged)
- search.js: **0.6.1.28**
- compare.html: **0.6.1.29** (version number unchanged from Chat 34 — compare.html has no internal version string; Chat 36 changes are in the file)
- background.js: 0.6.1.16 (unchanged)
- core.js: unchanged
- styles.css: unchanged

---

## What this session covered

### Activity check
- No new Reddit responses, feedback form submissions, or installs since Chat 34
- Chat 34's compare.html changes (column toggles, coupon column) confirmed working

### search.js (v0.6.1.28)
- **SNAP EBT detection:** `detectSnap(el)` added — checks `aria-label` attributes and leaf-node text for "SNAP EBT"; returns boolean
- **`isSnap`** stored on each scraped item and included in compare payload
- **Panel row:** "SNAP EBT eligible" note line added (green, same pattern as coupon/S&S lines, not bold)
- **Panel filter:** "SNAP EBT eligible only" checkbox added into price range row — only renders when `hasSnap` is true (at least one result in current set is SNAP-eligible)
- **`snapOnly` filter:** hides non-SNAP items; excludes them from best-value star calculation; resets on Clear all

### compare.html (Chat 36 changes — no version string bump)
- **SNAP EBT pill:** green `pill-snap` style added; `renderCouponCell` reworked to build pills as array — SNAP pill appends alongside coupon/S&S pills; both inline render paths updated
- **SNAP EBT only filter:** conditional — only renders when at least one item in the comparison has `isSnap: true`; wired into `applyFilters`, `attachFilterHandlers`, and Clear filters
- **Default sort changed to PPU ascending** — `sortCol` initialises to `'ppu'`; items without PPU sort to bottom; Clear filters resets to PPU sort

### Flagged / noted
- SNAP EBT detection untested on real Amazon pages — needs grocery search to confirm selectors work
- The SNAP conditional visibility is a deliberate exception to the "always visible" UI rule — justified because showing a filter for something not in the results is confusing

---

## Known issues / deferred
- **SNAP EBT detection needs real-world testing** — grocery searches (rice, baby formula, frozen veg) are best test cases
- Palette redesign still needed (Claude Design tool)
- Affiliate link on outbound links — deferred until Associates account created
- actuallyuseful.net not yet pointed at GitHub Pages
- Collapsible animation gone — snap only; post-alpha
- Ko-fi nudge removed — redesign post-alpha
- r/vibecodedevs post not yet up
- Facebook post not yet up
- Laundry sheet edge cases — post-alpha
- Other discount types — post-alpha

---

## Next session priorities (in order)
1. **Test SNAP EBT** — Melissa does a grocery search after reloading extension; reports whether any items get flagged; if not, selector adjustment needed (no file uploads required unless fixing selectors)
2. **Palette redesign** (Claude Design tool)
3. **Outreach planning**

---

## Parked for later
- Affiliate link on outbound links (after Associates account)
- Instructions page on website
- First-use onboarding flow in extension
- Short demo video
- TikTok account evaluation
- Create Associates Central account
- Draft Amazon Associates application narrative
- Point actuallyuseful.net at GitHub Pages
- Third-branch website power search build (post-alpha)

---

## Key reminders (do not skip)
- Code files are NOT in the Claude Project — Melissa uploads fresh from GitHub each coding session
- Files must be actual file uploads, not document blocks
- compare.html JS must use string concatenation, not template literals
- core.js uses callback pattern, not Promises
- Affiliate tags on website only — never in the extension
- Amazon Associates disclaimer on every page
- search.js sends raw numbers to compare.html — compare.html handles all formatting
- All Google tasks: InPrivate Edge + butactuallyuseful@gmail.com
- Supabase secret key never in browser code — publishable key only
- Always confirm scope before touching any files
- Use AskUserQuestion widget for clarifying questions
- Always include context/token status when asking "continue or wrap up?"
- Project documents live in docs/ folder in GitHub repo
- Always provide GitHub commit message at end of coding sessions
- Always remind Melissa to push to GitHub and update Claude Project files after coding sessions
- All text in the extension interface must be selectable — standing rule, no exceptions

---

## Start of next session
1. Ask if any new Reddit responses, feedback form submissions, or installs since last session
2. Ask if Melissa has tested Chat 36's changes — specifically whether any SNAP EBT items were detected on a grocery search
3. If SNAP detection didn't fire: ask Melissa to upload search.js so selectors can be adjusted
4. Confirm next priority before proceeding
