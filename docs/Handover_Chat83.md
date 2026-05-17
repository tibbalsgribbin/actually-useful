# Handover — Chat 83 → Chat 84

*May 17, 2026*

*Opus. Notes §3 decisions locked + Phase 8A kickoff brief produced. No code changes.*

---

## What happened this session

Two deliverables.

**1. Notes_Design.md §3 decisions settled.** Three deferred decisions from Chat 82 walked through with Melissa one by one, with plain-language explanations for §3.3 (the storage-as-bus concept needed unpacking — terms like "message channel" and "bus" weren't landing).

Final choices:
- **§3.1 Persistence:** Option C — persist locally + clear-all in Settings. (Matched the design doc recommendation.)
- **§3.2 Sharing:** Option A — opt-in checkbox at Compare time, default off. (**Deviated from doc recommendation of C**; Melissa explicitly preferred opt-in.)
- **§3.3 Edit-back:** Option C — storage-as-bus.

**2. Phase 8 split + Phase 8A kickoff brief.** Phase 8 split into 8A (this brief) and 8B (notes implementation, future Opus session), same model as Phase 7. Brief produced: `Phase8A_Kickoff_Brief_Chat83.md`.

---

## Files pushed this session

None. Brief and decisions only.

## Files to push at session end

- `Phase8A_Kickoff_Brief_Chat83.md` — added to project
- `changelog_entry_chat83.md` — added to project

## Phase 7B status

Still pushed (unchanged since Chat 80). welcome.html, index.html, privacy.html live in GitHub. SUGGESTED COPY blocks on welcome.html and report-banner copy in search.js remain unreviewed.

---

## Open items / deferred

Carried forward from Chat 82:
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
- **Phase 8B kickoff brief** — Opus, fresh chat, after 8A is pushed. Notes implementation per locked §3 decisions. **§3.2 = Option A (opt-in checkbox)**, not the C the design doc recommended — the brief author must read the Chat 83 handover/changelog before drafting, not just Notes_Design.md.
- **Phase 9 kickoff brief** — brand detection overhaul. Already framed in Brand_Detection_Research.md. Open questions in §5 of that doc still need settling (slug token-boundary heuristic, sub-brand handling, S1 selector verification, compound-brand allowlist seeding).

---

## Version state (unchanged from Chat 82)

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
| `compare.html` | updated Chat 66 | Unchanged — will change in Phase 8A |

---

## What's next — Phase 8A (Sonnet)

Open a **fresh Sonnet chat**. Paste the kickoff brief: `Phase8A_Kickoff_Brief_Chat83.md`.

**Melissa to bring:**
- `compare.html` — fresh upload from GitHub.
- `search.js` — fresh upload from GitHub (read-only reference for Sonnet to pattern-match Phase 7A bug report code; no edits).
- The IDs of any old compare links Melissa wants used as test fixtures (likely id=72, id=73, id=74; confirm at session start).

**Pre-session check:** confirm Supabase `bug_reports` table still exists (created before Phase 7A).

**Sonnet must CONFIRM with Melissa before coding (per brief §9):**
1. Entry point design — recommendation: per-row ⋯ button (Option B)
2. Version constant — recommendation: hardcoded `COMPARE_VERSION`
3. Removing any brand-suppression logic if found in `isAmazonBrand` path
4. CSS variable rename naming — defer to Phase 7B's privacy.html precedent if it exists
5. Old compare-link IDs to test against

---

## Then — Phase 8B kickoff brief (Opus)

Open a **fresh Opus chat** after Phase 8A is pushed. Produce kickoff brief for notes implementation per Notes_Design.md and the §3 decisions locked this session.

**Brief author must read this handover + changelog_entry_chat83.md before reading Notes_Design.md**, because the §3.2 decision deviates from the doc's recommendation. Melissa chose **A (opt-in checkbox)**, not C. The doc itself still recommends C — that recommendation is stale.

Locked decisions to design around:
- §3.1 C: persist locally to `chrome.storage.local` + clear-all in Settings
- §3.2 A: opt-in checkbox at Compare time, default off
- §3.3 C: storage-as-bus (both surfaces read/write same `chrome.storage.local`)

8B will touch: search.js (notes storage + share checkbox + clear-all wiring), compare.html (storage read/write, possibly checkbox on its share buttons too — design call), privacy.html (copy update reflecting opt-in default), Settings page (clear-all affordance).

---

## Then — Phase 9 kickoff brief (Opus)

After Phase 8B is pushed. Brand detection overhaul. Straightforward to produce from Brand_Detection_Research.md — main work is settling the §5 open questions in that doc.

---

*End of handover.*
