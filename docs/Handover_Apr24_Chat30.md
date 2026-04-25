# Handover — April 24, 2026 (Chat 30)

## Session type
Bug fixes — search.js only. One file changed, one version bump.

## Current versions
- manifest: 0.6.1
- search.js: **0.6.1.20**
- compare.html: 0.6.1.17
- background.js: 0.6.1.16
- core.js: unchanged
- styles.css: unchanged

---

## What this session covered

### Alpha tester feedback review
- Terry (neighbor) tested and met with Melissa in person — first real external tester
- One Reddit commenter responded to a post (process feedback, didn't test extension)
- 3 known installs (Melissa ×2 + Terry) but CWS dashboard still shows 0 — likely reporting lag
- Reddit posts live: r/ClaudeAI, r/chrome_extensions, r/vibecodingcommunity

### Bug fixes — v0.6.1.20

**Bug 1 — Pages slider clipping (reproducible: disappears after loading page 2)**
- Root cause: `setupCollapsible` measured `scrollHeight` at build time to set `maxHeight`; measurement was taken before slider fully rendered, locking the section too short
- Fix: `setupCollapsible` rewritten to use `maxHeight: none` when open instead of `scrollHeight` measurement
- Side effect: smooth open/close animation is gone — sections now snap. Noted in roadmap for post-alpha.
- First attempted fix (maxHeight refresh in `updateLoadMoreRow`) was wrong diagnosis — removed cleanly.

**Bug 2 — Ko-fi nudge firing on first checkbox click**
- Decision: remove nudge entirely for alpha; add to post-alpha roadmap for redesign
- All three `maybeShowNudge()` call sites removed: checkbox handler, pages slider loadNext, load-more button, keyword input handler
- `maybeShowNudge()` function definition left as dead code in search.js; core.js nudge infrastructure untouched

**Bug 3 — Rating/review count missing from panel rows**
- Root cause: data was scraped correctly but never rendered in the row HTML — dropped at some point during restructure
- Fix: added `ratingStr` rendered below delivery info; format e.g. `4.5★ (1,234 reviews)`; only renders when at least one value present

### Bigger items raised — deferred to future sessions
- Instructions page on website
- First-use onboarding flow in extension
- Short demo video
- TikTok account evaluation
- Outreach to frugality blogs (The Non-Consumer Advocate, The Frugal Girl + others)
- Melissa has more testing observations not yet triaged

---

## Known issues / deferred
- Palette redesign still needed
- Laundry pods wrong unit ($/lb instead of $/ct)
- actuallyuseful.net not yet pointed at GitHub Pages
- Collapsible animation gone — snap only; post-alpha
- Ko-fi nudge removed — redesign post-alpha
- Melissa has more testing observations not yet triaged
- r/vibecodedevs post not yet up (Day 5–7)
- Facebook post not yet up

---

## Next session priorities (in order)
1. Triage Melissa's remaining testing observations
2. Palette redesign (Claude Design tool)
3. Outreach planning — frugality blogs

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

---

## Start of next session
1. Ask if more Reddit responses or feedback have come in
2. Ask Melissa to share her remaining testing observations list
3. Proceed with triage, then palette or outreach planning
