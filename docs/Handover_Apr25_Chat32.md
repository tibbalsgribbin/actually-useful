# Handover — April 25, 2026 (Chat 32)

## Session type
Bug fixes and delivery improvements — search.js only changed. Multiple version bumps (v0.6.1.22–27).

## Current versions
- manifest: 0.6.1
- search.js: **0.6.1.27**
- compare.html: 0.6.1.17
- background.js: 0.6.1.16
- core.js: unchanged
- styles.css: updated (no version number) — but `.ppu-delivery.paid` rule still missing

---

## What this session covered

### Outreach planning discussed
- Non-Consumer Advocate and Frugal Girl researched
- Decision: wait until extension and compare page more polished before outreach
- Plan documented: one blog at a time, email not guest post, Katy first

### Unit fixes (v0.6.1.22–24)
- SOLID_KEYWORDS gains sheet/sheets/strip/strips
- Solid product weight-unit override: when title contains pod/sheet/strip/load/pac/fling/tab and Amazon reports weight unit or whole-package $/ct, calculates price/count instead
- extractCount gains patterns for loads, sheets, strips
- normalizeUnit handles "sheet per load" and compound laundry units
- guessCountUnit gains load and strip
- Some laundry sheet edge cases still slipping through — deferred to post-alpha

### Paid express delivery (v0.6.1.25)
- parseDeliveryDates now detects "Or $4.99 delivery in 3 hours" lines
- Stored as paidDate (computed from now + N hours), paidCutoff, paidPrice
- Displayed in panel row: `$4.99: in 3 hrs`
- Factored into delivery-any sort

### Delivery window range (v0.6.1.26)
- New parseDeliveryWindowEnd captures end of window
- New formatWindowRange combines start–end: `5 PM–10 PM`
- formatWindowMinutes no longer prepends "by " — pure time formatter now
- Paid line display cleaned up: shows cutoff only, no redundant date

### Compare payload expanded (v0.6.1.27)
- Added: freeWindowEnd, fastCutoff, paidDate, paidCutoff, paidPrice
- Available to compare.html for comparisons from v0.6.1.27 forward

### styles.css — one rule still pending
`.ppu-delivery.paid { color: #b45309; }` — needs adding next coding session when styles.css uploaded

---

## Known issues / deferred
- Palette redesign still needed
- Laundry sheet edge cases — some $/ct = whole-package slipping through; post-alpha
- styles.css paid delivery color rule missing
- compare.html: paid delivery + window range not yet displayed
- actuallyuseful.net not yet pointed at GitHub Pages
- Collapsible animation gone — snap only; post-alpha
- Ko-fi nudge removed — redesign post-alpha
- r/vibecodedevs post not yet up (Day 5–7)
- Facebook post not yet up

---

## Next session priorities (in order)
1. Upload styles.css — add `.ppu-delivery.paid { color: #b45309; }`
2. compare.html strategy discussion — delivery display, extension→compare flow, table improvements
3. Palette redesign (Claude Design tool)
4. Outreach planning (after extension and compare page more polished)

---

## Parked for later
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
2. Ask if Melissa has any remaining testing observations
3. Upload styles.css → add paid delivery color rule
4. Then: compare.html strategy discussion
