# Handover — April 23, 2026 (Chat 28)

## Session type
Planning/discussion only — no code changes, no version bumps.

## Current versions (unchanged from Chat 27)
- manifest: 0.6.1
- search.js: 0.6.1.19
- compare.html: 0.6.1.17
- background.js: 0.6.1.16
- core.js: unchanged
- styles.css: unchanged

---

## What this session covered

### 1. Third-branch website concept — decided direction

Melissa asked what's possible for the standalone website branch (for users who won't install the extension). Jungle Search is the closest existing model, but its category selector only changes `node=` in the URL — the form never changes.

**Decision:** Two-layer model.

- **Layer 1 — Global fields.** Standard power-search operators (keywords, must-include, exclude, price range, min rating, min reviews, Prime only, department, sort, free shipping, brand exclusions, seller preference). Works fine on its own.
- **Layer 2 — Category-specific guided forms.** Appear when user picks a category OR when keywords match a known category. Each category carries hidden gotcha exclusions applied automatically (laundry → no "sample," no "trial"; ink → no "refill kit" when OEM selected; etc.).

**Additional elements:**
- Shareable permalinks for saved searches (reuses Supabase — decide whether same table with a `type` field, or separate table)
- Affiliate tag on outbound Amazon URLs
- Grows one category at a time — version 1 can ship with 3 categories
- Seed categories come from Melissa's own shopping experience
- Post-alpha work, listed in Roadmap under Website

### 2. Amazon Associates timing — decided

**Decision: do not apply yet.**

The 180-day / 3-qualifying-sales rule is strict. If approved and the threshold isn't hit, the account closes and cannot be reinstated. Applying too early is worse than applying too late.

**Preconditions documented in Roadmap:**
1. CWS extension approved and publicly installable (unlisted OK)
2. Real user base with documented outbound-click volume from compare.html
3. actuallyuseful.net pointed at GitHub Pages (clean domain for the application)
4. Outbound-click tracking in place long enough to estimate feasibility (~300 clicks/180 days at 1% conversion = rough threshold)

**Low-effort habit recommended:** Create an Associates Central account now (not the same as applying) — puts Melissa on the policy-change email list.

**Policy note:** April 14, 2026 update tightened the "original content" definition and added a 180-day shipping/payment limit. A utility tool + comparison page is legitimately original content, but the Associates application will need a carefully drafted narrative because Amazon's guidance assumes blogs/influencers.

### 3. Sources for Amazon Associates info

- Authoritative: **affiliate-program.amazon.com** only (Operating Agreement, Program Policies, Updates page)
- Useful community: r/juststart, Authority Hacker, Niche Pursuits
- Skeptical of: generic SEO "how to make money" blogs and YouTube channels — most are selling courses/tools
- Best early-warning system: logged-in Associates Central account + their policy-change emails

---

## Files updated this session
- Roadmap.md — Amazon Associates preconditions expanded; Power search form item expanded to full two-layer model spec
- changelog.md — Chat 28 planning entry added
- Handover_Apr23_Chat28.md — this file
- Project_Briefing.md — no changes needed (no infrastructure/feature state changed)

---

## Known issues / deferred (unchanged from Chat 27)
- Palette redesign still needed
- Laundry pods wrong unit ($/lb instead of $/ct)
- actuallyuseful.net not yet pointed at GitHub Pages
- Pages slider — monitor for recurrence
- CWS approval still pending

---

## Next session priorities (in order)
1. Confirm CWS approval email received (check butactuallyuseful@gmail.com)
2. Draft Reddit alpha tester recruitment posts (both sets)
3. Palette redesign (still needed for future store update)

## Parked for later
- Create Associates Central account (low effort, low commitment — gets Melissa on the policy-change email list)
- Draft Amazon Associates application narrative (before applying, not now)
- Point actuallyuseful.net at GitHub Pages (prerequisite for Associates application)
- Third-branch website build (post-alpha; seed categories TBD from Melissa's shopping experience)

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
- Use AskUserQuestion widget for clarifying questions — but remember option text gets truncated in the UI; for anything longer than a short phrase, lay options out in the chat text instead
- Always include context/token status when asking "continue or wrap up?"
- Project documents live in docs/ folder in GitHub repo
- Always provide GitHub commit message at end of session
- Always remind Melissa to push to GitHub and update Claude Project files after

---

## Start of next session
1. Check butactuallyuseful@gmail.com for CWS review outcome
2. Ask Melissa if there are fresh testing observations
3. Proceed with Reddit posts if CWS is approved, or palette redesign if still waiting
