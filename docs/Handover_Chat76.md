# Handover — Chat 76 → Chat 77

*May 16, 2026*

*Phase 7 planning session (Opus 4.7 — second pass; first pass was accidentally Sonnet 4.6, redone). No code changed this session.*

---

## What was completed this session

**Phase 7 scope locked.** Full design conversation — extension bugs triaged, website polish scoped, bug reporting tool fully designed, welcome.html copy changes specified.

**Phase 7 split into two Sonnet sessions:**
- **Phase 7A** — Extension fixes + bug reporting tool. Kickoff brief: `Phase7A_Kickoff_Brief_Chat76.md`
- **Phase 7B** — Website work (welcome.html / index.html / privacy.html). Kickoff brief: `Phase7B_Kickoff_Brief_Chat76.md`

The original combined brief (produced by Sonnet earlier in this session) was discarded.

---

## Current state — file versions

Unchanged from Chat 75. No code was touched this session.

| File | Version | Last changed |
|---|---|---|
| `search.js` | v0.6.1.85 | Chat 75 |
| `core.js` | v0.6.1.53 | Chat 68 |
| `styles.css` | updated Chat 75 | Chat 75 |
| `background.js` | v0.6.1.18 | Chat 74 |
| `manifest.json` | v0.6.1 | Chat 75 |
| `welcome.html` | rewritten Chat 75 | Chat 75 |
| `content/welcome-bridge.js` | new Chat 75 | Chat 75 |
| `compare.html` | updated Chat 66 | Chat 66 |
| `index.html` | updated Chat 66 | Chat 66 |
| `privacy.html` | updated Chat 66 | Chat 66 |

**Overall canonical version: v0.6.1.85**

After Phase 7A: search.js will jump to **v0.6.2.0** to mark the new bug reporting tool feature.

---

## Storage keys — unchanged from Chat 75

See Handover_Chat75.md for full inventory.

---

## Decisions locked this session

1. **Phase 7 splits into 7A (extension) + 7B (website).** Two Sonnet sessions, not one. Reasoning: combined scope is large enough to risk context rot and end-of-session doc overhead.

2. **compare.html structural pass → Phase 8.** Not part of Phase 7.

3. **Bug reporting on compare.html → Phase 8** alongside the structural pass.

4. **Bug reports land in a new Supabase `bug_reports` table.** Not the comparisons table, not the Google Sheet usage log. Melissa creates the table before Phase 7A.

5. **Bug report entry point — card-only via the ⋯ menu.** No footer link. The bug tool is added as a fourth option in the existing brand options popover, alongside Always show / Always hide / Hide seller (future).

6. **Edge case acknowledged:** cards without a detected brand have no ⋯ menu, so they have no bug-reporting access in Phase 7A. Acceptable; revisit in Phase 8.

7. **Bug reports always send regardless of telemetry opt-out.** Active user consent via the form is the disclosure context. The form shows a transparency note: *"Submitting sends the item details (URL, ASIN, price, PPU, raw data) and your notes to Actually Useful. No personal info."*

8. **Bug report categories — 5 options:** Unit type wrong · PPU math wrong · Brand wrong · Brand filtered incorrectly · Other. Title case in UI, snake_case in the database (`unit_type`, `ppu_math`, `brand_wrong`, `brand_filtered`, `other`).

9. **Phase 7A version bump → v0.6.2.0.** Minor segment bump to mark the new feature, not a fourth-segment increment.

10. **End-of-session document cadence applied to Phase 7:**
    - End of 7A: Handover + Changelog only (mid-bundle)
    - End of 7B: All four documents (bundle close)
    This is already the rule in the roadmap, but called out explicitly in both kickoff briefs to reduce the doc-overhead problem flagged at end of Chat 75.

11. **Welcome page full settings → separate design conversation.** Not Phase 7 scope.

12. **Keyword hint verbosity + "we show our working" banner → separate design conversation.** Both deferred.

13. **Impossible Burger math → investigation session.** Deferred.

14. **welcome.html copy:** Melissa's exact wording used for 02 Narrow (partial) and 03 Decide. Everything else flagged as `<!-- SUGGESTED COPY: ... -->` for Melissa review before push. Website copy gets a dedicated review pass during 7B.

---

## Phase 7A scope (locked)

**Files: search.js, styles.css.** Bumps to v0.6.2.0.

Extension urgent fixes:
- Ads not moving (sponsored items must physically reorder)
- Brand hint timeout (30s per spec)
- Footer link formatting consistency
- Keyword hint text selectable

Extension improvements:
- Unit pills size reduction (CSS only)
- Pages slider tick mark visibility
- Brand name clickable (mirrors ⋯ click)

New feature — bug reporting tool:
- "Report an issue with this item" added to brand options popover (4th item)
- Overlay form: title context · 5-radio category picker · notes textarea · transparency note · Send/Cancel
- POST to Supabase `bug_reports` table (pattern-matches compare.html POST)
- Always sends regardless of telemetry state
- Pre-session: Melissa creates `bug_reports` table in Supabase (schema in 7A brief)

---

## Phase 7B scope (locked)

**Files: welcome.html, index.html, privacy.html.** Runs after 7A is pushed.

welcome.html copy:
- 02 Narrow: remove "Cut through 60 results" line, add Boolean examples (SUGGESTED COPY)
- 03 Decide: Melissa's exact wording (final, not flagged)
- Brand controls section: full reframe away from "now" (SUGGESTED COPY)
- Wizard screen 2 + 3: existing SUGGESTED COPY flags remain, Melissa reviews
- New alpha/dev notice section before wizard CTA (SUGGESTED COPY)

index.html:
- Palette consistency audit
- Add sample search links: id=73 (laundry pods) + id=74 (laptop)
- Old screenshot — add TODO HTML comment, do not auto-replace
- Confirm affiliate disclosure present

privacy.html:
- Palette consistency audit
- Add Bug reports section documenting the `bug_reports` table
- Confirm affiliate disclosure present

---

## Open items / testing still needed before any push

Carried from Chat 75 — Phase 6 testing not yet completed:

- [ ] Workflow banner fully gone on Amazon search
- [ ] Loading banner first-time (clear `auHasSeenLoadingBanner`, pages > 1)
- [ ] Loading banner subsequent (thin coral strip)
- [ ] Brand hint — all four dismiss paths (Got it, ×, click any ⋯, 30s auto)
- [ ] Welcome page — all sections render, wizard works, done state
- [ ] Privacy toggle — writes/restores correctly
- [ ] Wizard settings write to storage
- [ ] Auto-open on install (test profile reinstall)
- [ ] Close button regression

Melissa should test the above before Phase 7A starts, or at minimum confirm awareness that these aren't yet verified.

---

## What's deferred (post-Phase 7)

- $/serving for protein powder — design session
- Prime scraping investigation
- CWS push + Reddit posts — held pending Phase 7 completion
- Keyword filter hint verbosity — design session
- "We show our working" banner — design session
- Welcome page full settings — design session
- Impossible Burger math — investigation session
- **Phase 8** — compare.html structural pass + bug reporting on compare.html

---

## Before Phase 7A session

Melissa must:
1. **Create the `bug_reports` table in Supabase.** Full schema and steps in `Phase7A_Kickoff_Brief_Chat76.md` §Pre-session setup.
2. Update Claude Project documents (this Handover, Changelog, Roadmap, kickoff briefs).
3. Open a fresh Sonnet chat.
4. Upload `search.js` and `styles.css` fresh from GitHub.
5. Paste the Phase 7A kickoff brief.

---

## Notes from this session

The first pass of this planning session was accidentally done in Sonnet 4.6. Reviewing it in Opus revealed several issues:

- Phase 7 was over-scoped for one Sonnet session (Phase 6 took two)
- Bug tool design had unresolved questions left for Sonnet to decide (violates Opus-plans-Sonnet-codes rule)
- Several decisions had been made without asking (entry points, footer position)
- A model version was wrong in the roadmap (Opus 4.6 instead of 4.7)

Second pass resolved all of these. The revised plan is in this Handover and the two kickoff briefs.

This is a useful data point on the cost of getting the model wrong for a session type. The scope conversation was fine — the structural decisions (size, deferrals, unresolved questions) were where Sonnet showed.

---

## Session opener for Phase 7A

> Phase 7A coding session. Kickoff brief is Phase7A_Kickoff_Brief_Chat76.md. Make sure the bug_reports Supabase table exists before starting. Upload search.js and styles.css from GitHub. [Paste brief.]

---

*End of handover.*
