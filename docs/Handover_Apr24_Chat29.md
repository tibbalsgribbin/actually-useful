# Handover — April 24, 2026 (Chat 29)

## Session type
Planning/comms only — no code changes, no version bumps.

## Current versions (unchanged from Chat 27/28)
- manifest: 0.6.1
- search.js: 0.6.1.19
- compare.html: 0.6.1.17
- background.js: 0.6.1.16
- core.js: unchanged
- styles.css: unchanged

---

## What this session covered

### CWS approval confirmed
Dashboard shows "Published - unlisted." No email received but dashboard is authoritative. Clean install from store URL confirmed working. Comparison table working on first try.

### Reddit and Facebook posts drafted and finalized
Five posts produced as downloadable markdown files. All include:
- "Free forever, no paywalls"
- Affiliate transparency line (website only once out of testing; extension never)
- Early testing / feedback wanted framing

**Files produced this session:**
- reddit-claudeai.md (shortened version — r/ClaudeAI has a post length limit; body ~1,460 chars)
- reddit-chrome_extensions.md
- reddit-vibecodingcommunity.md
- reddit-vibecodedevs.md
- facebook.md

**Posting schedule:**
- Day 1: r/ClaudeAI
- Day 2–3: r/chrome_extensions
- Day 3–4: r/vibecodingcommunity
- Day 5–7: r/vibecodedevs
- Facebook: whenever

**Notes:**
- r/Frugal, r/AmazonPrime, r/BuyItForLife, r/productivity — Melissa checked, none allow promotion
- The four planned subs are r/ClaudeAI, r/chrome_extensions, r/vibecodingcommunity, r/vibecodedevs
- All Claude references say "almost all Sonnet 4.6, with a couple of planning sessions on other models" — no mention of Opus or Gemini specifically
- "Features Amazon doesn't offer" used throughout — not "deliberately withholds"
- r/ClaudeAI length limit hit in testing; shortened version produced and confirmed ~1,460 chars; if still truncating, Melissa will report exact cutoff

**Before posting each one:**
- Check sub rules for self-promotion tags or flair requirements
- Be ready to respond in comments within first few hours

### Melissa has a bug/observation list started
Not discussed this session — carry into next session or a dedicated triage session.

---

## Known issues / deferred (unchanged)
- Palette redesign still needed
- Laundry pods wrong unit ($/lb instead of $/ct)
- actuallyuseful.net not yet pointed at GitHub Pages
- Pages slider — monitor for recurrence
- Melissa has a list of fresh testing observations — not yet triaged

---

## Next session priorities (in order)
1. Confirm Reddit posts are landing (any responses, feedback coming in?)
2. Triage Melissa's testing observations list
3. Palette redesign (still needed for future store update)

## Parked for later
- Create Associates Central account (low effort, low commitment)
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
1. Ask if Reddit posts have gone up and if any feedback is coming in
2. Ask about the testing observations list — triage or defer?
3. Proceed accordingly
