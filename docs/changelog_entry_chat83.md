# Changelog — Chat 83

*May 17, 2026*

*Opus session. Notes decisions locked + Phase 8A kickoff brief. No code changes.*

---

## Delivered

- **Notes_Design.md §3 decisions locked.** All three deferred decisions from Chat 82 settled:
  - §3.1 Persistence: **Option C** — persist locally + clear-all in Settings.
  - §3.2 Sharing: **Option A** — opt-in checkbox at Compare time, default off (not Option C as the design doc recommended; Melissa chose A).
  - §3.3 Edit-back: **Option C** — storage-as-bus.

- **Phase8A_Kickoff_Brief_Chat83.md** — kickoff brief for Phase 8A (compare.html structural pass + bug reporting on compare.html). Sonnet executes from this next session.

## Phase 8 split decision

Phase 8 scoped as one workstream in the Chat 82 handover. Split this session into:
- **Phase 8A** — bug reporting on compare + Roadmap compare bugs + CSS variable rename. Single Sonnet session.
- **Phase 8B** — notes implementation per locked §3 decisions. Separate Opus brief + Sonnet session, after 8A is pushed.

Reasoning: combined scope too large for one session. Same model as Phase 7A/7B. Lets bug reporting land first so Melissa can dogfood it on notes issues during 8B testing.

## Phase 8A scope locked

- Bug reporting on compare.html — mirror Phase 7A pattern exactly (categories, transparency note, Supabase shape). One genuine design decision: row entry point. Recommendation: per-row ⋯ button (Option B).
- Eight Roadmap "comparisons-saved-before-vX" bugs — graceful-fallback fixes. Mechanical work. All in compare.html.
- Amazon Basics brand-suppression check — confirm compare renders whatever the payload says. Fix upstream is Phase 9.
- CSS variable rename — `--cream/--navy/--teal/--teal-lt` → coral-named variables matching their hex values. Mirrors privacy.html Phase 7B cleanup.

## §3.2 sharing decision deviates from doc recommendation

Notes_Design.md §3.2 recommended **C** (always strip; device-local only). Melissa chose **A** (opt-in checkbox, default off). Implications for Phase 8B brief:
- privacy.html will say notes are local by default but can be included on opt-in.
- A checkbox UI is needed near the Compare button on the panel and/or near share buttons on compare.html.
- The payload-strip logic from Option C still applies, gated on the checkbox state.

## Files unchanged

- compare.html — no edits this session.
- search.js — read for reference, no edits.
- All other code files — no edits.
- manifest.json — no version bump.

## Sequencing

- **Next session (Sonnet):** Phase 8A. Brief in project. Melissa uploads compare.html and search.js fresh from GitHub.
- **After 8A pushed (Opus, fresh chat):** Phase 8B kickoff brief. Notes implementation per locked §3 decisions.
- **After 8B pushed:** Phase 9 kickoff brief (brand detection overhaul, per Brand_Detection_Research.md).

---

*End of Chat 83 changelog.*
