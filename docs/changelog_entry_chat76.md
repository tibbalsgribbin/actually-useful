# Changelog — Chat 76

*May 16, 2026 — Phase 7 planning session (Opus 4.7). No code changed.*

*Note: first pass of this session was accidentally Sonnet 4.6; redone in Opus 4.7 with several scope and design corrections.*

---

## Summary

Phase 7 scope locked. Split into two Sonnet sessions (7A extension + 7B website). Bug reporting tool fully designed.

---

## Decisions locked

- **Phase 7 splits into 7A and 7B.** Two Sonnet sessions, not one. Combined scope was too large for single session.
- **Phase 7A** = extension fixes + bug reporting tool. Files: search.js, styles.css. Bumps to v0.6.2.0.
- **Phase 7B** = welcome.html + index.html + privacy.html. Runs after 7A is pushed.
- **Phase 8** = compare.html structural pass + compare.html bug reporting.
- **Bug reports** → new Supabase `bug_reports` table. Schema in Phase 7A brief.
- **Bug report entry point** → ⋯ menu on cards only. No footer link. Added as a 4th option in the brand options popover.
- **Edge case:** cards without detected brand have no bug report access in 7A. Revisit Phase 8.
- **Bug report categories:** Unit type wrong · PPU math wrong · Brand wrong · Brand filtered incorrectly · Other. Title case in UI, snake_case in DB.
- **Bug reports always send regardless of telemetry opt-out.** Active user consent via the form, with on-form transparency note.
- **Transparency note copy (final):** "Submitting sends the item details (URL, ASIN, price, PPU, raw data) and your notes to Actually Useful. No personal info."
- **Phase 7A version bump:** v0.6.1.85 → v0.6.2.0 (minor segment bump for new feature).
- **Doc cadence for Phase 7:** 7A produces Handover + Changelog only; 7B produces all four documents at bundle close.
- **Welcome page full settings** → separate design conversation, not Phase 7.
- **Keyword hint verbosity + "we show our working" banner** → separate design conversation, deferred.
- **Impossible Burger math** → investigation session, deferred.

## Deliverables

- `Phase7A_Kickoff_Brief_Chat76.md` — produced
- `Phase7B_Kickoff_Brief_Chat76.md` — produced
- `Handover_Chat76.md` — produced
- `changelog_entry_chat76.md` — this file
- `Roadmap_Chat76.md` — produced (phase status updated, Phase 7 scope documented, Phase 8 listed)

## Files changed

None. Planning session only.

## Working rules

No changes to standing rules.

---

*End of changelog entry.*
