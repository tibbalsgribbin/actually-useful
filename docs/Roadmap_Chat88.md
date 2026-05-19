# Roadmap — Chat 88

*Updated end of Chat 88. Test 4 investigation complete. Architectural finding reframes Compare Persistence — it is now the next product decision, not a deferred design item.*

*May 19, 2026*

---

## Immediate — next session is the Compare Persistence decision

### A. Compare Persistence — product-decision session (next Opus session)

The Chat 88 investigation revealed compare.html has no access to `chrome.storage.local` because the manifest doesn't declare a content script for the github.io domain. Notes typed on compare.html have never been saved. The Compare Persistence item is no longer a "design when ready" placeholder — it's the gate on Phase 8B closeout and on Share Redesign.

The session's job is **decide what compare.html is.** Four options remain on the table (Option 2 ruled out in Chat 88):

- **Option 1** — Content script in manifest. compare.html becomes a private workspace using chrome.storage.local. Smallest code change. Notes tied to browser profile.
- **Option 3** — Server-side persistence in Supabase. Works across devices and recipients. Privacy model changes.
- **Option 4** — Accept that compare.html notes don't persist. Possibly disable note editing or warn. Zero code.
- **Option 5** — Turn-based collaboration. Each share is an immutable snapshot; recipients fork to reply. Doesn't solve personal persistence.

A complete answer may combine two options (e.g. Option 1 for personal state + Option 5 for sharing).

- [ ] Decide primary use case for compare.html (workspace / shared document / collaborative thread).
- [ ] Pick option(s) — single or combined.
- [ ] Hand the decision to a separate design session for the chosen path. Do not implement in the decision session.

Supabase cost is not a blocker — confirmed in Chat 88. Free tier holds ~17,000 comparison records and ~170,000 link-opens per month.

### B. Test 1 regression investigation

Independent of the Compare Persistence decision. Can be picked up in any session.

- [ ] Panel textarea closing prematurely reported passing earlier in Chat 87, then failing later. Possibly intermittent.
- [ ] Investigate delegated handlers on `.ppu-row` or panel wrapper that may move focus away from the textarea.

### C. Share Redesign — gated on Compare Persistence

Absorbs Tests 2, 5, 6 and the Approach 4 include-notes UX decision. **Cannot start until the compare.html question lands.** If Option 5 is chosen, the include-notes concept (Approach 4) becomes obsolete and Share Redesign's scope changes significantly.

- [ ] Hold until Compare Persistence decision is made.
- [ ] Then write kickoff brief covering: number of share buttons, share scopes (all/filtered/checked), where include-notes choice lives (if it still exists), prompt style.
- [ ] Design pass.
- [ ] Implementation.

---

## Phase 8B test status — updated after Chat 88 findings

| Test | Status | Resolution path |
|---|---|---|
| 1. Textarea closes prematurely (panel) | ❌ Possibly intermittent | Workstream B above |
| 2. Include-notes checkbox styling (panel) | ❌ Coral on coral | Share Redesign (likely moot — checkbox may be removed) |
| 3. Storage-as-bus live sync | ❌ Bus doesn't exist | Compare Persistence (Option 1 would make this work; others don't) |
| 4. Note added on compare.html not surviving refresh | ❌ No storage access | Compare Persistence |
| 5. Note in shared link not visible to recipient | ❌ Wired to wrong button | Share Redesign |
| 6. Compare.html include-notes for notes typed there | ❌ Cannot work — notes never stored | Compare Persistence (creates the storage) + Share Redesign (decides if checkbox still exists) |

**None of these are individually patchable bugs anymore.** They're consequences of two structural decisions (Compare Persistence + Share Redesign) that haven't been made yet.

---

## Phase 9 — Brand detection overhaul

Opus kickoff brief. Read Brand_Detection_Research.md. Held until Phase 8B residue clears (Compare Persistence + Share Redesign + Test 1).

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

---

## UX polish — newly added (Chat 87, still pending)

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
