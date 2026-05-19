# Roadmap — Chat 91

*Updated end of Chat 91. Option 1 architecture decided (Architecture A). Implementation spec locked. Next session is the Sonnet implementation.*

*May 19, 2026*

---

## Immediate — next session is Option 1 implementation

### A. Compare Persistence — Option 1 implementation (next Sonnet session)

Implementation spec: **`Option1_Implementation_Spec_Chat91.md`**. Self-contained, gated by smoke tests at each step. 13 steps per spec §17.

Implementation order:

- [ ] **Step 1.** Create `content/page/compare-bridge.js` from spec §5. Full file, ~100 lines.
- [ ] **Step 2.** Update `manifest.json` with new `content_scripts` entry from spec §6.1. Reload extension. Verify Amazon panel still works (smoke 1). Verify compare.html still opens (smoke 2).
- [ ] **Step 3.** Devtools-verify bridge presence on compare.html via the ping snippet (smoke 4).
- [ ] **Step 4.** Add bridge client block to compare.html (spec §7.1).
- [ ] **Step 5.** Add state-shaping helpers (spec §8.2).
- [ ] **Step 6.** Apply `rerenderTableOnly` merge fix (spec §8.6).
- [ ] **Step 7.** Replace init storage block + add push handler (spec §8.3, §8.4).
- [ ] **Step 8.** Replace `scheduleNoteWrite` (spec §8.5.4). Test 5-8.
- [ ] **Step 9.** Wire column toggles to `saveColumns` (spec §8.5.3). Test 15-17.
- [ ] **Step 10.** Wire filter handlers to `scheduleSearchStateWrite` — 18 call sites (spec §8.5.1). Test 9-12.
- [ ] **Step 11.** Wire sort handler to `scheduleSearchStateWrite` (spec §8.5.2). Test 13-14.
- [ ] **Step 12.** Cross-tab and merge-gap tests (spec §13.6, §13.7).
- [ ] **Step 13.** No-bridge fallback verification (spec §13.8).

Version bumps on success:
- `manifest.json` → `0.6.2`
- `compare.html` → `compare-v1.1.0`
- `compare-bridge.js` → starts at `bridge-v1.0.0`

### B. Test 1 regression investigation

Independent of the Compare Persistence implementation. Can be picked up in any session.

- [ ] Panel textarea closing prematurely reported passing earlier in Chat 87, then failing later. Possibly intermittent.
- [ ] Investigate delegated handlers on `.ppu-row` or panel wrapper that may move focus away from the textarea.

### C. Share Redesign — gated on Option 1 implementation

Absorbs Tests 2, 5, 6 and the Approach 4 include-notes UX decision.

- [ ] Hold until Option 1 ships.
- [ ] Then write kickoff brief covering: number of share buttons, share scopes (all/filtered/checked), where include-notes choice lives, prompt style, **sharing model (always-latest vs. frozen-snapshot — leaning frozen 1a per Chat 89 discussion)**.
- [ ] Design pass.
- [ ] Implementation.

### D. Privacy.html small update — pre-CWS-push polish pass

- [ ] Add a brief note that the extension injects a small bridge script into compare.html on actuallyuseful.net for local persistence. No new data category; small wording change.

---

## Phase 8B test status — updated after Chat 91 architecture decision

| Test | Status | Resolution path |
|---|---|---|
| 1. Textarea closes prematurely (panel) | ❌ Possibly intermittent | Workstream B above |
| 2. Include-notes checkbox styling (panel) | ❌ Coral on coral | Share Redesign (checkbox may be removed) |
| 3. Storage-as-bus live sync | ❌ Bus doesn't exist | Will exist after Option 1 ships |
| 4. Note added on compare.html not surviving refresh | ❌ No storage access | Fixed by Option 1 implementation. Spec ready. |
| 5. Note in shared link not visible to recipient | ❌ Wired to wrong button | Share Redesign |
| 6. Compare.html include-notes for notes typed there | ❌ Cannot work — notes never stored | Option 1 creates the storage; Share Redesign decides if checkbox still exists |

**None of these are individually patchable bugs.** They resolve through the structural work above.

---

## Phase 9 — Brand detection overhaul

Opus kickoff brief. Read Brand_Detection_Research.md. Held until Phase 8B residue clears (Option 1 implementation + Share Redesign + Test 1).

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

## UX polish — pending

| Item | Surface | Notes |
|---|---|---|
| "+ Add a note…" always visible (not just after checking listing) | Panel | UX request from Test 1 retest (Chat 87) |
| AU favicon on AU webpages (compare, privacy, welcome) | All AU pages | `<link rel="icon">` work |
| Non-extension viewer hint on compare.html | compare.html | Optional future polish; not in Option 1 |
| Bridge ping timeout tuning | compare.html | Watch during Option 1 testing; tune down from 1000ms if noticeable |

---

## Standing deferred items

| Item | Notes |
|---|---|
| Silent-catch sweep | ~40 `catch(e) {}` patterns remain across search.js, compare.html, background.js. Demo conversion done; full sweep deferred. |
| SUGGESTED COPY review — welcome.html | Flagged blocks, review before CWS push |
| Banner text in search.js | `// <!-- SUGGESTED COPY -->` in `enterReportMode()`, review before CWS push |
| Panel_Redesign_Spec.md | §8.3 and §5.7 stale; separate careful pass |
| Pattern A+B (`(?)` icons + Help drawer) | Pattern_AB_Note.md; future phase |
| "Always hide" semantics | Demotes instead of hides; UX question pending |
| Keyword filter hint verbosity | Deferred, design conversation required |
| Impossible Burger math | Deferred, investigation session required |
| Prime scraping selector change | Deferred |
| Coral vs Amazon orange | Verify #f25d4e doesn't clash with #ff9900 on live page |
| Text-size observation session | No design until observed |
| Per-note X delete button | Deferred from Notes_Design.md §7 |
| Purge existing Supabase rows with notes | One-time data cleanup, Melissa decision |
| AU favicon on AU webpages | compare.html, privacy.html, welcome.html don't show extension icon in browser tabs |
| Test 1 regression investigation | Panel textarea closing prematurely came back during Chat 87 after initially passing |
| Remove dead `?data=` fallback path | compare.html lines 2578-2607. Not urgent; future maintenance pass. |
| Privacy.html bridge-injection note | Pre-CWS-push polish pass after Option 1 ships |

---

*End of roadmap.*
