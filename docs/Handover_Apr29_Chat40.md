# Handover — April 29, 2026 (Chat 40)

## Session type
UI polish + bug-test session. One code change (badge filter layout). No logic changes.

## Current versions
- manifest: 0.6.1
- search.js: 0.6.1.35
- compare.html: 0.6.1.30
- background.js: 0.6.1.16
- core.js: unchanged
- styles.css: unchanged

---

## What this session covered

### Badge filter layout (v0.6.1.35)
All four badge filter checkboxes (SNAP EBT, FSA/HSA, Climate Pledge, Small Business) moved out of the price range row into a new vertical stack below it. Text is now regular weight. One syntax error fixed in the first pass. Melissa confirmed it looks correct.

### Bug-test — personal care / small sizes
Full category tested. Summary:

| Search | Status | Notes |
|---|---|---|
| Travel shampoo | ✅ Pass | $/oz correct |
| Travel size conditioner | ✅ Pass | $/oz correct |
| Lip balm | ⚠️ Partial | $/ct or $/oz; can't show both; cosmetics $/oz very revealing |
| Razor blade refills | ✅ Pass | $0.1/ct formatting bug noted |
| Disposable razors | ✅ Pass | |
| Contact lens solution | ❌ Fail | Amazon $/fl oz unreliable; stray numbers cause bad division |
| Travel size toothpaste | ⚠️ Partial | Word-form weights missed; toothpaste treated as liquid |
| Cotton swabs | ❌ Fail | Pack count grabbed instead of item count; sub-penny PPU needs 3 decimals |

---

## Known issues (carried forward + new)
1. **Fix 2 weight regex misses word-form weights** — "5-Pound", "18 Pound", "3 Ounce", "0.85 OZ" not matching. Rice, cat food, toothpaste suppressed incorrectly.
2. **Toothpaste classified as liquid** — Amazon reports fl oz; needs "toothpaste" / "tooth paste" added to SOLID_KEYWORDS
3. **PPU formatting — $0.1/ct** — missing zero-pad to two decimal places
4. **PPU display — sub-penny items** — need 3 decimal places when PPU ≤ $0.01
5. **extractCount "1 Pack (250 Sheets)"** — picks up 1 before 250; wrong PPU
6. **Contact lens solution liquid PPU** — Amazon's reported $/fl oz is wrong when title has stray numbers; needs recalculate-and-compare check
7. **Cotton swabs extractCount** — grabs pack count instead of item count; one case where count found but not used in calculation
8. **Results summary line doesn't update for badge filters** — should reflect filtered count same as keyword filter
9. **Solid product override firing on rice** — "15 lbs (Pack of 2)" treated as 2-pack solid item (related to #1)
10. **Pairs ambiguity** — uncertainty note is interim; full fix deferred

---

## Next session priorities (in order)
1. **Fix weight-unit word forms** — extend Fix 2 regex to match "pound/pounds", hyphenated ("5-Pound"), abbreviated with period ("15 lb."), word-form oz ("3 Ounce", "0.85 OZ")
2. **Add toothpaste to SOLID_KEYWORDS** — "toothpaste", "tooth paste"
3. **Fix PPU formatting** — $0.1/ct → $0.10/ct (zero-pad to 2 decimal places)
4. **Fix PPU display** — 3 decimal places when PPU ≤ $0.01
5. **Fix extractCount "1 Pack (250 Sheets)"**
6. **Bug-test another category** — tools & hardware or single-unit items
7. **Demo video planning** — draft script bullets, sign up for Loom

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

---

## Start of next session
1. Ask if any new Reddit responses, feedback form submissions, or installs since Chat 40
2. Confirm which priority to start with
3. If coding: confirm Melissa has uploaded current files from GitHub before touching anything
