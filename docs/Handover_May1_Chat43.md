# Handover — May 1, 2026 (Chat 43)

## Session type
Infrastructure and troubleshooting session. No extension code changes. No website file changes.

## Current versions
- manifest: 0.6.1
- search.js: 0.6.1.36
- compare.html: 0.6.1.30
- background.js: 0.6.1.16
- core.js: unchanged
- styles.css: unchanged
- index.html: unchanged (overhauled Chat 42)

---

## What this session covered

### HTTPS troubleshooting
Worked through the full checklist:
- A records confirmed correct (all four GitHub IPs)
- Found and added missing TXT domain verification record (`_github-pages-challenge-tibbalsgribbin` / `6371f6f379f9278e7a3eb08b7d6993`) in Namecheap
- Domain verified in GitHub account settings (github.com/settings/pages)
- Found and deleted conflicting URL Redirect Record (`@` → `http://www.actuallyuseful.net/`) — this was likely the root cause blocking cert provisioning
- Rogue IP `162.255.119.244` still showing in dnschecker.org as of end of session — DNS propagation of the deleted redirect record still in progress

**What to do next:** Check dnschecker.org for `actuallyuseful.net` (type A). Once `162.255.119.244` is gone from all results, do one more remove-and-re-save of the custom domain in GitHub Pages settings. Cert should provision shortly after.

### Usage log
Discovered two Google Sheets were logging separately:
- Sheet 1 (Untitled Project script) — receiving extension data
- Sheet 2 (Actually Useful Logger script) — receiving old userscript data from an unknown user still running the Tampermonkey version

Sheets merged into one. Script version column allows filtering extension vs userscript rows if needed. Orphaned "Actually Useful Logger" Apps Script project (never deployed) can be deleted from script.google.com.

### Reddit research
Identified neurodivergent/chronic illness subreddits as a target audience for outreach: r/ADHD, r/AutisticAdults, r/ADHDwomen, r/fibromyalgia, r/ChronicIllness, r/MECFS, r/disability, r/neurodivergent, r/executivefunction. Search terms documented for finding individual posts.

Reviewed r/Frugal thread — validated existing AU features. One new post-alpha idea flagged: $/calorie as a unit for food (requires product page data; low priority).

### Outreach strategy added to roadmap
"Reddit comparison drops" — find threads where people ask for help choosing a product, run AU, share the real comparison table + extension install link. Gated on unit consistency being reliable first.

---

## Known issues (carried forward — no change from Chat 42)
1. Multi-pack weight PPU wrong — needs design session
2. Cat food oz/lb inconsistency — deferred
3. Fix 2 weight regex — word-form weights still not fully matched
4. Toothpaste — some items still showing fl oz
5. Razor blade $0.1/ct outlier
6. extractCount "1 Pack (250 Sheets)"
7. Contact lens solution liquid PPU
8. Cotton swabs extractCount
9. Results summary line for badge filters
10. Pairs ambiguity — interim only
11. Slider max still at 10 — should be 7
12. Auto-resort on Re-sync page-add — not verified
13. Laundry pods and laptop sample links — held

---

## Next session priorities (unchanged from Chat 42)
1. **Check HTTPS enforcement** — should be available once rogue IP clears from DNS
2. **Design session: weight units** — needed before laundry pods and laptop demos go live
3. **Fix extractCount "1 Pack (250 Sheets)"**
4. **Fix results summary line for badge filters**
5. **Slider max → 7** — bundle with whatever else ships
6. **Verify auto-resort fires on Re-sync page-add**
7. **Add laundry pods and laptop sample links** to index.html once unit display verified

---

## Key reminders (do not skip)
- Code files are NOT in the Claude Project — Melissa uploads fresh from GitHub each coding session
- Files must be actual file uploads, not document blocks
- compare.html JS must use string concatenation, not template literals
- core.js uses callback pattern, not Promises
- Affiliate tags on website only — never in the extension
- search.js sends raw numbers to compare.html — compare.html handles all formatting
- note = user's note; ppuNote = AU inference note — both in payload, never conflated
- All Google tasks: InPrivate Edge + butactuallyuseful@gmail.com
- Always confirm scope before touching any files
- Use AskUserQuestion widget for clarifying questions
- All text in the extension interface must be selectable — standing rule
- Rollback rule: 3 failed bug-fix attempts = stop, revert to last stable commit
- Always provide a commit message when a GitHub push is needed
- Don't touch weight unit logic without a design session first

---

## Start of next session
1. Check dnschecker.org for `actuallyuseful.net` (type A) — is `162.255.119.244` gone yet?
2. If yes: do remove-and-re-save in GitHub Pages, check if Enforce HTTPS is now clickable
3. Ask if any new Reddit responses, feedback form submissions, or installs since Chat 43
4. Confirm which priority to start with
5. If coding: confirm Melissa has uploaded current files from GitHub before touching anything
