# Handover — April 25, 2026 (Chat 33)

## Session type
compare.html improvements + styles.css patch. No search.js changes.

## Current versions
- manifest: 0.6.1
- search.js: 0.6.1.27 (unchanged)
- compare.html: **0.6.1.28**
- background.js: 0.6.1.16 (unchanged)
- core.js: unchanged
- styles.css: updated — `.ppu-delivery.paid` rule now present

---

## What this session covered

### Activity check
- u/Prestigious_Gur_6702 commented on r/VibeCodeDevs — positive, said they'd try it. Comment subsequently deleted.
- 2 organic installs confirmed (5 total, 3 are Melissa + Terry)

### Strategic discussion — compare.html as destination
- Reframed: extension is the on-ramp, compare.html is the destination
- Affiliate links go on outbound product links at click time (not baked into stored data)
- compare.html should serve both "active workspace" and "final decision view" users
- Add to Cart deferred — not convinced it's necessary
- Affiliate account not yet created — affiliate link feature deferred

### styles.css (v0.6.1.27 patch)
- Added `.ppu-delivery.paid { color: #b45309; }` after `.ppu-delivery.wf-fee`

### compare.html (v0.6.1.28)
- Delivery column: free delivery shows full window range (e.g. `Tuesday, 5 PM–10 PM`); fast delivery shows order-by cutoff; paid express delivery shown in amber
- Coupon/promo column: switched to full `renderCouponCell` — S&S shows actual discount string, coupons show with-coupon price and strikethrough was-price
- Prime only filter: new checkbox in filter bar; wires into `applyFilters` and clear handler
- Both render paths (renderTable + rerenderTableOnly) updated throughout

---

## Known issues / deferred
- Palette redesign still needed (Claude Design tool)
- Affiliate link on outbound links — deferred until Associates account created
- compare.html: further table refinements — discussed but not started (next session topic)
- actuallyuseful.net not yet pointed at GitHub Pages
- Collapsible animation gone — snap only; post-alpha
- Ko-fi nudge removed — redesign post-alpha
- r/vibecodedevs post not yet up (Day 5–7)
- Facebook post not yet up
- Laundry sheet edge cases — post-alpha

---

## Next session priorities (in order)
1. compare.html table refinements — Melissa has more ideas; start there
2. Palette redesign (Claude Design tool)
3. Outreach planning (after extension and compare page more polished)

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
2. Ask if Melissa has tested Chat 33's compare.html changes
3. Discuss compare.html table refinements — Melissa has ideas, hear them before touching any files
