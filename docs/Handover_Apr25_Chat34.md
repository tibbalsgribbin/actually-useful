# Handover — April 25, 2026 (Chat 34)

## Session type
compare.html improvements only. No search.js or styles.css changes.

## Current versions
- manifest: 0.6.1
- search.js: 0.6.1.27 (unchanged)
- compare.html: **0.6.1.29**
- background.js: 0.6.1.16 (unchanged)
- core.js: unchanged
- styles.css: unchanged (paid delivery color rule was added in Chat 33)

---

## What this session covered

### Activity check
- No new Reddit responses, feedback form submissions, or installs since Chat 33

### Testing notes on Chat 33 changes
- Coupon column was duplicating price info from the Price column — fixed this session
- Chat 33's delivery column and Prime only filter confirmed working

### compare.html (v0.6.1.29)
- **Coupon column simplified:** `renderCouponCell` now shows "Coupon" pill only — no with-price or was-price (that info is already in the Price column). S&S unchanged — still shows actual discount string. `couponPillOnly` label changed from "Coupon — check Amazon" to "Check Amazon". Both render paths consistent.
- **Column hide toggles:** "Show columns:" toggle bar added above the table. Hideable: Price, Per unit, Delivery, Rating, Reviews, Prime, Coupon/promo, Source, Notes. Always visible: checkbox, thumbnail, Product. Active = filled indigo button; hidden = white/muted button. Per-session only (resets on reload). Both render paths updated.

### Flagged for later
- Other discount types (buy-multiple deals, vague "save X%") — not captured; post-alpha
- SNAP EBT — search.js + compare.html; scheduled for next session

---

## Known issues / deferred
- SNAP EBT not yet captured — next session priority
- Palette redesign still needed (Claude Design tool)
- Affiliate link on outbound links — deferred until Associates account created
- actuallyuseful.net not yet pointed at GitHub Pages
- Collapsible animation gone — snap only; post-alpha
- Ko-fi nudge removed — redesign post-alpha
- r/vibecodedevs post not yet up (Day 5–7)
- Facebook post not yet up
- Laundry sheet edge cases — post-alpha
- Other discount types — post-alpha

---

## Next session priorities (in order)
1. **SNAP EBT** — capture in search.js, display in extension panel and compare table (upload search.js + compare.html)
2. **Palette redesign** (Claude Design tool)
3. **Outreach planning** (after extension and compare page more polished)

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
2. Ask if Melissa has tested Chat 34's compare.html changes (column toggles, coupon column)
3. Confirm SNAP EBT as first priority — ask Melissa to upload search.js + compare.html before starting
