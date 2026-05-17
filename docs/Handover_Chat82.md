# Handover — Chat 82 → Chat 83

*May 17, 2026*

*Notes design session complete. Opus. No code changes.*

---

## What happened this session

Notes design session, per Chat 81's handover. Deliverable: **Notes_Design.md**, now in the project.

Investigation approach: read `search.js`, `compare.html`, and `core.js` to map where notes live, how they move between surfaces, and what touches Supabase. Surfaced the dead `AU_UPDATE_NOTE` wire (compare.html:1629 sends, nothing listens). Mapped the `note` / `ppuNote` naming distinction. Documented the privacy leak in the Compare-click path.

Four design decisions surfaced. One was settled this session (Q4 — leave naming alone, document the distinction). The other three were deferred and documented with options + recommendations + implementation sketches in §3 of the design doc. Recommendations across all three lean local-first with `chrome.storage` as the spine.

---

## Files pushed this session

None. Design doc only.

## Files to push at session end

- `Notes_Design.md` — added to project
- `changelog_entry_chat82.md` — added to project

## Phase 7B status

Still pushed (unchanged from Chat 80). Welcome.html, index.html, privacy.html live in GitHub. SUGGESTED COPY blocks on welcome.html and report-banner copy in search.js remain unreviewed.

---

## Open items / deferred

Carried forward from Chat 81:
- **SUGGESTED COPY review** — all flagged blocks on welcome.html need Melissa decision before CWS push
- **Banner text in search.js** — `// <!-- SUGGESTED COPY -->` in `enterReportMode()` — review before CWS push
- **Panel_Redesign_Spec.md updates** — §8.3 and §5.7 stale; separate careful pass
- **Pattern A+B** (`(?)` icons + Help drawer) — see Pattern_AB_Note.md; future phase
- **"Always hide" semantics** — demotes instead of hides; pre-existing UX question
- **Keyword filter hint verbosity** — deferred, design conversation required
- **Impossible Burger math** — deferred, investigation session required
- **Prime scraping selector change** — deferred
- **Coral vs Amazon orange** — verify #f25d4e doesn't clash with Amazon's #ff9900 on live page
- **Text-size — observation session with friend** (no design until observed)
- All other known issues in Roadmap

New this session:
- **§3.1, §3.2, §3.3 in Notes_Design.md** — three notes decisions deferred. Recommendations documented but not binding. Decisions needed before any notes implementation kickoff.
- **Phase 8 kickoff brief** — next session, Opus, fresh chat. compare.html structural pass + bug reporting on compare.html. Informed by Chat 81 brand research and this session's notes design.
- **Phase 9 kickoff brief** — brand detection overhaul. Already framed in Brand_Detection_Research.md. Open questions in §5 of that doc still need settling (slug token-boundary heuristic, sub-brand handling, S1 selector verification, compound-brand allowlist seeding).
- **Notes implementation phase** — sequencing TBD. Could land after Phase 9 or as a separate phase. Depends on whether the deferred decisions in §3 of Notes_Design.md get made before then.

---

## Version state (unchanged from Chat 81)

| File | Version | Status |
|---|---|---|
| `search.js` | v0.6.2.0 | Pushed Chat 78 |
| `styles.css` | updated Chat 78 | Pushed Chat 78 |
| `core.js` | v0.6.1.53 | Unchanged |
| `background.js` | v0.6.1.18 | Unchanged |
| `manifest.json` | v0.6.1 | Unchanged — will not bump until CWS push |
| `welcome.html` | updated Chat 79 | Pushed Chat 79 |
| `index.html` | updated Chat 79 | Pushed Chat 79 |
| `privacy.html` | updated Chat 79 | Pushed Chat 79 |

---

## What's next — Phase 8 kickoff brief

Open a **fresh Opus chat**. Deliverable: kickoff brief for Phase 8 — compare.html structural pass + bug reporting on compare.html.

Per Chat 81's handover, this session should be informed by:
- **Brand_Detection_Research.md** (Chat 81 output)
- **Notes_Design.md** (this session's output)

Sonnet executes from the brief in a subsequent session.

**Melissa to bring:**
- Whatever code files the brief author asks for after reviewing the project knowledge. Likely `compare.html` at minimum; possibly `search.js` for the bug-reporting handoff.

---

## Then — Phase 9 kickoff brief

Open another fresh Opus chat after Phase 8 lands. Deliverable: kickoff brief for Phase 9 (brand detection overhaul). Straightforward to produce from Brand_Detection_Research.md — main work is settling the §5 open questions in that doc.

---

## Then — Notes implementation phase

Sequencing TBD. Before any kickoff brief for notes implementation, the three deferred decisions in §3 of Notes_Design.md need to be made:
- §3.1 Persistence (recommendation: Option C, persist + clear-all)
- §3.2 Sharing (recommendation: Option C, always strip)
- §3.3 Edit-back (recommendation: Option C, storage-as-bus)

Recommendations compose into a coherent local-first design. Melissa can accept the bundle, reject pieces, or take time to think — none of it blocks Phase 8 or Phase 9.

---

*End of handover.*
