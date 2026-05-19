# Roadmap — Chat 87

*Updated end of Chat 87. Phase 8B retest produced failures + a structural discovery. Phase 8B is being decomposed rather than just retested.*

*May 19, 2026*

---

## Immediate — three workstreams replacing "Phase 8B retest"

### A. Test 4 root-cause investigation (next Opus session)

- [ ] Trace what URL the panel's "Compare" button generates. Check search.js for the "Send to compare" handler.
- [ ] Confirm whether the `?id=` Supabase load path actually preserves notes across refresh in real testing (not just in code review).
- [ ] Diagnose why mirroring the `?id=` notes-load onto `?data=` broke Test 3 (storage-as-bus live sync). Likely culprit: `rerenderTableOnly()` vs `rerender()` not merging localNotes identically. compare.html has two render functions (lines 1526, 1994) — figure out which one matters when.
- [ ] Only after diagnosis: propose a fix, walk Melissa through it before coding.

### B. Test 1 regression investigation

- [ ] Panel textarea closing prematurely was reported passing earlier in Chat 87, then failing later. Possibly intermittent, possibly triggered by another action.
- [ ] Investigate delegated handlers on `.ppu-row` or panel wrapper that may move focus away from the textarea.
- [ ] Can fold into the Test 4 session if scope allows; otherwise its own session.

### C. Share Redesign (Opus — kickoff brief first)

Absorbs Tests 2, 5, 6 and the Approach 4 include-notes UX decision.

- [ ] Write kickoff brief covering: number of share buttons, share scopes (all/filtered/checked), where include-notes choice lives in the new structure, prompt style (popover vs modal).
- [ ] Design pass.
- [ ] Implementation.

---

## Compare Persistence — new design item

Surfaced clearly in Chat 87: compare.html state does not persist across refresh. Everything resets — filters, keyword filters, sort, column visibility, show-checked-only, checked items, and notes typed directly on the page. The previous "filters don't survive refresh" bug was one symptom of a missing persistence layer.

Scope of design item:

- [ ] Decide what should persist (all of it? some of it? a "session" model that clears when tab closes?).
- [ ] Decide where state lives (chrome.storage.local? sessionStorage? URL-encoded?).
- [ ] Decide how state interacts with the existing `?id=` (Supabase share) and `?data=` (base64) URL forms.
- [ ] Consider whether resumability across browser restart is desired.

Big enough to be its own phase. Should not be tackled inside a bug-fix session.

---

## Phase 9 — Brand detection overhaul

Opus kickoff brief. Read Brand_Detection_Research.md. Held until the Phase 8B residue (A, B, C above + Compare Persistence) is meaningfully clear.

---

## Known bugs — pre-existing (not Phase 8B regressions)

| Bug | Surface | Priority |
|---|---|---|
| Minimum price filter doesn't work | compare.html | High |
| PPU math wrong on gram-weight items (Thai paste 200g $29.99 → $0.15/oz, should be ~$4.25/oz) | Panel + compare.html | High |
| Bug report overlay appears below triggering listing, on top of the one below | compare.html | Medium |
| Image and product name mushed together unless columns removed | compare.html | Medium |
| No link to privacy.html from compare.html footer | compare.html | Low |
| privacy.html header hierarchy wacky | privacy.html | Low |

Compare.html filters/sorts don't survive refresh — **moved out** of this table into Compare Persistence design item above.

---

## UX polish — newly added (Chat 87)

| Item | Surface | Notes |
|---|---|---|
| "+ Add a note…" always visible (not just after checking listing) | Panel | UX request from Test 1 retest |
| AU favicon on AU webpages (compare, privacy, welcome) | All AU pages | `<link rel="icon">` work |

---

## Standing deferred items

| Item | Notes |
|---|---|
| Silent-catch sweep | ~40 `catch(e) {}` patterns remain across search.js, compare.html, background.js. Demo conversion done; full sweep deferred. |
| SUGGESTED COPY review (welcome.html) | Review before CWS push |
| Banner text in search.js (`enterReportMode`) | Review before CWS push |
| Panel_Redesign_Spec.md §8.3 + §5.7 | Stale — needs careful pass |
| Pattern A+B (`(?)` icons + Help drawer) | Pattern_AB_Note.md; future phase |
| "Always hide" semantics | Demotes not hides — UX question open |
| Keyword filter hint verbosity | Design conversation required |
| Impossible Burger math | Investigation session required |
| Prime scraping selector change | Deferred |
| Coral vs Amazon orange | Verify #f25d4e vs #ff9900 on live page |
| Text-size observation session | No design until observed |
| Per-note X delete button | Deferred from Notes_Design.md §7 |
| Purge existing Supabase rows with notes | One-time data cleanup — Melissa decision |

---

## Post-Phase-9 horizon

- Phase 10 — TBD (Panel Redesign Spec? Onboarding?)
- CWS public listing prep (SUGGESTED COPY review, demo video, Associates application)

---

*End of roadmap.*
