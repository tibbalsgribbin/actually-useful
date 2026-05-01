# Handover — May 1, 2026 (Chat 42)

## Session type
Website and infrastructure session. No extension code changes. index.html fully overhauled. DNS configured.

## Current versions
- manifest: 0.6.1
- search.js: 0.6.1.36
- compare.html: 0.6.1.30
- background.js: 0.6.1.16
- core.js: unchanged
- styles.css: unchanged
- index.html: overhauled (no version number — website file)

---

## What this session covered

### index.html — complete rewrite
Seven sections drafted section by section with Melissa's approval at each stage:

1. **Hero** — "Amazon is built to sell what *they* want. Actually Useful is built to help you buy what *you* want." + subhead + CTA button
2. **Problem** — no header, italic blockquote style, ends on "whatever Amazon actually showed you"
3. **How it works** — Amazon credit paragraph + three-step expand/narrow/decide structure
4. **Features** — five named sections: math, keyword filter, delivery, other filters, panel control
5. **Compare callout** — dark indigo card, links to real googly eyes comparison (id=72)
6. **Story** — personal origin, "I built the thing I wished existed. It's still Amazon. But Actually Useful." + Somewhat Useful aside
7. **Footer CTA** — mirrors hero

Layout uses Playfair Display serif for headings, DM Sans for body, scroll reveal animations, sticky nav. Indigo palette preserved.

### Infrastructure
- actuallyuseful.net A records and CNAME added in Namecheap
- Custom domain configured in GitHub Pages settings
- Green checkmark confirmed; HTTPS enforcement pending SSL certificate provisioning (check back in a few hours)

### Planning
- Four-pillar framework kept as internal reference only — retired from public-facing copy
- Feature-to-pillar mapping produced
- Slider max → 7 confirmed by testing; code change deferred to next session
- Auto-resort on Re-sync page-add flagged for investigation
- Sample comparisons: id=72 (googly eyes) live on page; id=73 (laundry pods) and id=74 (laptops) held until unit display verified

---

## Known issues (carried forward)
1. **Multi-pack weight PPU wrong** — needs design session before any code
2. **Cat food oz/lb inconsistency** — deferred pending weight design session
3. **Fix 2 weight regex** — Purina 4-pack "3.15 lb." still showing $/ct — needs investigation
4. **Toothpaste** — SOLID_KEYWORDS fix shipped; some items still show fl oz
5. **Razor blade $0.1/ct** — one outlier persists despite zero-pad fix
6. **extractCount "1 Pack (250 Sheets)"** — not yet fixed
7. **Contact lens solution liquid PPU** — not yet fixed
8. **Cotton swabs extractCount** — not yet fixed
9. **Results summary line for badge filters** — not yet fixed
10. **Pairs ambiguity** — interim note only; full fix deferred
11. **Slider max still at 10** — should be 7; small search.js change pending
12. **Auto-resort on Re-sync page-add** — not yet verified or fixed
13. **Laundry pods and laptop sample links** — held until unit display clean

---

## Next session priorities (in order)
1. **Design session: weight units** — map out multi-pack weight, oz vs lb, Amazon-reported vs calculated — needed before laundry pods and laptop demos go live
2. **Fix extractCount "1 Pack (250 Sheets)"**
3. **Fix results summary line for badge filters**
4. **Slider max → 7** — bundle with whatever else ships
5. **Verify auto-resort fires on Re-sync page-add**
6. **Add laundry pods and laptop sample links** to index.html once unit display verified
7. **Check HTTPS enforcement** — should be available after SSL provisions

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
1. Ask if HTTPS enforcement is now available on GitHub Pages (should be a few hours after DNS propagated)
2. Ask if any new Reddit responses, feedback form submissions, or installs since Chat 42
3. Confirm which priority to start with
4. If coding: confirm Melissa has uploaded current files from GitHub before touching anything
