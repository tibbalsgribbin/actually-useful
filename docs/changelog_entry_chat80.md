# Changelog — Chat 80 (Planning session)

*May 16, 2026 — Opus planning session. No code touched. Phase 7B confirmed pushed.*

---

## This session

Planning session. Reviewed scope for Phase 8 (compare.html structural pass + bug reporting on compare.html). Three new items surfaced:

1. **Text-size setting** (feedback from a friend with poor eyesight) — parked pending in-person observation. Reasoning: friend reports Ctrl+/- works less well on overlays generally; Melissa observed AU panel scales less per Ctrl-press than the underlying page. Outcome of observation session may be either better Ctrl-zoom behavior on AU panel, or an explicit Small/Medium/Large setting. Don't build either until observed.

2. **Brand detection gaps** — known cases failing:
   - **Truncation:** Amazon Basics → "Amazon"; Arm & Hammer → "Arm"
   - **Not detected at all:** 9 Elements (laundry detergent); Asus, Logitech (keyboards); zero brands detected on laptop searches
   These look like different problems: first-word-of-title fallback firing instead of finding the byline (truncation), and category-wide byline-selector failure (laptops). Distinct from the known "mixed-case invented names" gap (Floerns/Verdusa) already in the Roadmap.

3. **Notes** — bigger component of compare than the extension has surfaced so far. Open questions: where notes live, what they're for, privacy when notes go to Supabase, sharing semantics. Currently the `note` field is on the shortlist payload (§4 of Briefing) but session-scoped behavior, storage, edit-back, and sharing rules are not documented.

---

## Sequencing decision

Brand detection blocks broader compare.html push (brand is a column and a filter dimension on compare; unreliable detection makes compare look broken).

**Three sessions before Phase 8 code:**

1. **Brand research session (Opus)** — research doc only. Deliverable answers: what's getting scraped today, what rules can realistically fix, what external brand lists exist and how we'd use them. Melissa to bring: Instant Data Scraper exports from 3–4 failing searches (laptops, keyboards, laundry detergent + a working control), current `search.js`, current `brand_blocklist.txt` and `amazon_brands.txt`.

2. **Notes design session (Opus)** — design doc only. Deliverable covers current behavior, proposed behavior, storage, privacy, sharing UX. Melissa to bring: current `search.js`, `compare.html`, anything else storage-related.

3. **Phase 8 design session (Opus)** — kickoff brief for compare.html structural pass + bug reporting on compare.html, informed by outputs of (1) and (2). Sonnet then executes.

Text-size setting is sequenced separately — observation session with friend first, design after, possibly part of a later phase.

---

## Files changed

None. No code touched. Project docs only.

---

## Decisions / flags

- **Phase 7B is pushed.** Roadmap and Handover now reflect this.
- **Pre-Phase-8 sequence locked:** brand research → notes design → Phase 8 design brief → Phase 8 execution.
- **Text-size parked.** Needs friend-observation session before any design or build.
- **Brand detection examples documented** as distinct problem types (truncation vs. byline-selector failure vs. accepted mixed-case gap).
- **Notes elevated** from a side-issue to a pre-Phase-8 design item in its own right.

---

## No version bump

No code touched. Extension files unchanged.

---

## Deliverables

- `changelog_entry_chat80.md` — this file
- `Handover_Chat80.md` — produced
- `Project_Briefing_Chat80.md` — produced (PART TWO updated; PART ONE unchanged)
- `Roadmap_Chat80.md` — produced

---

*End of changelog entry.*
