# Changelog — Chat 77 (Phase 7A partial)

*May 16, 2026 — Phase 7A, in flight. Final entry will be written by the next Sonnet session when Phase 7A pushes.*

---

## This session

Started as a Sonnet coding session for Phase 7A. Escalated to Opus when the brand hint design issues surfaced. No push at end of session — work continues in the next Sonnet session.

### Code in flight (search.js v0.6.2.0)

- Sponsored items physically move to end of results (was: visual styling only, no reorder)
- Brand name in result cards is clickable, opens the same popover as `⋯`
- Footer link styling unified across all four links (11px, deep coral, no underline at rest, underline on hover)
- Keyword hint text is now selectable
- Unit pill size reduced (12px → 10px font, 3px → 2px padding)
- Slider tick marks more visible (color + size)
- Sponsored items "moved to end" divider added
- Hint slot CSS added (will be removed in next session — see below)

### Design decisions

- **Brand hint pattern (spec §8.3) is being abandoned.** The strip + tooltip pattern is wrong for users with cognitive load (peekaboo timing, transient information that can't be recalled). Implementation code is in the working files; will be stripped in the next Sonnet session.
- **Bug reporting moves from the `⋯` menu to a footer link.** The `⋯` menu is for brand rules; the bug report is about the listing's data, not the brand. New "Click an item to report" interaction flow designed; implementation in the next Sonnet session.
- **Pattern A+B designed as the future of onboarding/hints.** Always-visible `(?)` icons next to feature labels (Pattern A) + a "Help" footer link opening a drawer with all feature documentation (Pattern B). Deferred to a future phase. Full design in Pattern_AB_Note.md.

### What's deferred from this session

- Pattern A+B implementation (future phase)
- Panel_Redesign_Spec.md updates to reflect the brand hint reversal (§8.3 and §5.7 mention now stale)
- "Always hide" semantics — popover label says "hide" but implementation demotes; pre-existing UX issue flagged

### What ships at end of Phase 7A (next session)

Once the next Sonnet session finishes:
- All Phase 7A scoped improvements (sponsored move, brand click, footer links, keyword hint selectable, unit pills, slider ticks)
- Bug reporting via footer link + "click an item to report" interaction
- Bug report overlay form + Supabase POST (unchanged from this session)
- Brand hint code fully removed
- search.js at v0.6.2.0
