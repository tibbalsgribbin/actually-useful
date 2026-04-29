# Handover — April 28, 2026 (Chat 37)

## Session type
Planning and strategy session. No code changes. No code files needed or uploaded.

## Current versions (unchanged from Chat 36)
- manifest: 0.6.1
- search.js: 0.6.1.28
- compare.html: 0.6.1.29 (Chat 36 changes are in the file; no internal version string)
- background.js: 0.6.1.16
- core.js: unchanged
- styles.css: unchanged

---

## What this session covered

### Synthesis of external AI advice
Melissa uploaded 14 documents — conversations with ChatGPT, Gemini, Grok, Kimi, DeepSeek, Pi, Bard, and several internal session summaries. These were synthesized into a single reference document (Master_Synthesis.md) organized by topic: workflow, code quality, testers, marketing, monetization, features.

Key findings:
- The external AI sources heavily over-recommend tooling (Cursor, Windsurf, Claude Code, SonarCloud, etc.) — all declined for now
- The external sources heavily under-diagnose the real problem: 5 installs after 3 Reddit posts = wrong channels, not wrong product
- The internal docs (Strategy_Summary_Apr26, Session_Summary_2026-04-19) are stronger than most external advice
- Demo video remains the single highest-leverage action

### Outreach platform rules research
Each suggested outreach channel was web-verified for self-promotion rules and fit. Key corrections confirmed:
- **r/Frugal:** no self-promo even in comments — confirmed as Melissa suspected
- **r/AmazonDeals:** requires link to actual Amazon product/page — not viable for a tool post
- **Buy Nothing groups:** explicitly prohibited by the Buy Nothing Project's published rules
- **Slickdeals:** "No spam or self promotion please" on every forum category

Outreach_Platform_Rules.md produced with full table of venues, rules, and approach guidance.

### Melissa's four additions to the synthesis
1. **Informational banners / "show our work" principle** — whenever AU interprets data (unit inference, solid-product override, liquid-dominant detection, etc.), surface that interpretation as a brief, dismissible note. Transparency is an accessibility feature. New design principle added.
2. **Logging audit session** — added to pre-public-CWS-listing checklist. Compare.html logging is currently a gap; need to know whether users who reach compare.html are clicking through to Amazon.
3. **Welcome page on install elevated** — now treated as near-equal priority to the demo video. Converts installers into users. Also the right place to establish trust (transparency statement, telemetry opt-out, shortlist is private).
4. **Public-facing roadmap** — to be published before public CWS listing. GitHub Issues with roadmap label, linked from landing page. Includes a "won't do" section.

### Documents produced this session
- Master_Synthesis.md — full strategy synthesis (new, lives in project files)
- Outreach_Platform_Rules.md — verified platform rules (new, lives in project files)
- bug-test.md — blank testing log template with 11 search categories (new, goes in docs/ folder)

### Project documents updated
- Project_Briefing.md — new known issues, four new design principles, end-of-session checklist clarified
- Roadmap.md — rollback rule, updated next-session priorities, pre-public-CWS-listing checklist (12 items), post-alpha section updated, design principles updated, outreach corrected
- changelog.md — planning session entry added

---

## Pre-public-CWS-listing checklist (new — added this session)

The gate before moving from unlisted to public. Estimated 8–12 sessions of work:

- [ ] SNAP EBT verified working on real grocery searches
- [ ] Logging audit session complete
- [ ] Selector resilience refactor (named selector object + multi-strategy fallbacks)
- [ ] Self-test mode + degradation banner
- [ ] Kill switch (JSON status check on extension load)
- [ ] Anomaly/transparency banner audit pass (mixed units, solid override, liquid inference, sparse data, has-variations)
- [ ] Welcome page on install
- [ ] Demo video recorded and embedded on landing page
- [ ] Bug-test spreadsheet — at least 5 categories passing
- [ ] Public-facing roadmap published (GitHub Issues + "won't do" section)
- [ ] Copy update — CWS listing and landing page hero text rewritten
- [ ] actuallyuseful.net pointed at GitHub Pages

---

## Known issues / deferred (unchanged)
- SNAP EBT detection untested on real Amazon pages
- Palette redesign still needed
- Affiliate link on outbound links — deferred until Associates account
- Collapsible animation gone — post-alpha
- Ko-fi nudge removed — redesign post-alpha
- Laundry sheet edge cases — post-alpha
- Other discount types — post-alpha
- r/vibecodedevs post not yet up
- Facebook post not yet up

---

## Next session priorities (in order)
1. **Test SNAP EBT** — grocery search; report whether items get flagged; if not, upload search.js to adjust selectors
2. **Bug-test spreadsheet** — start one category from bug-test.md (pet supplies or tools recommended as first new category)
3. **Demo video planning** — draft script bullets, sign up for Loom, do one dry run (no recording yet)
4. **Palette redesign** — Claude Design tool

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
- All text in the extension interface must be selectable — standing rule
- **Rollback rule:** 3 failed bug-fix attempts = stop, revert to last stable commit

---

## Start of next session
1. Ask if any new Reddit responses, feedback form submissions, or installs since Chat 36
2. Ask if Melissa has tested SNAP EBT on a real grocery search since Chat 36
3. Ask which priority to start with from the list above
4. If doing a coding session: confirm Melissa has uploaded current code files from GitHub before touching anything
