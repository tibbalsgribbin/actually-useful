# Roadmap — Chat 89

*Updated end of Chat 89. Compare Persistence product decision complete. Option 1 chosen as the foundation. Next session designs the Option 1 implementation.*

*May 19, 2026*

---

## Immediate — next session is the Option 1 design

### A. Compare Persistence — Option 1 design session (next Opus session)

The Chat 89 decision was: **compare.html is primarily a private workspace; sharing is an extension of that purpose.** Option 1 (manifest content script for compare.html + chrome.storage.local) is the foundation. The next session produces a kickoff brief for Sonnet implementation.

The brief needs to cover:

- [ ] **Manifest change.** New `content_scripts` entry for `tibbalsgribbin.github.io/actually-useful/*`. Decide which existing scripts inject (`core.js`? others?).
- [ ] **What state goes in chrome.storage.local.** Notes are the minimum. Filters, sort, column visibility were flagged in Chat 88 as facing the same wall. Decide which subset Option 1 covers in its first pass vs. follow-up passes.
- [ ] **Key naming.** Existing key is `au_item_notes`. Decide structure for any additional state.
- [ ] **`rerenderTableOnly()` merge gap** (Chat 88 Q3 finding). Once compare.html has storage access, `rerenderTableOnly()` needs to merge `localNotes` into `currentItems` like `rerender()` does (compare.html line 1786). Decide if part of Option 1 brief or separate cleanup.
- [ ] **Permission surface implications.** Adding github.io domain widens what the extension can touch. Privacy.html note? User-facing mention?
- [ ] **Migration / first-run behavior.** Confirm existing Supabase records with embedded notes continue to load correctly via `parsed.items`.

**Do not make sharing-model decisions in this session.** The always-latest vs. frozen-snapshot question is deferred to Share Redesign.

### B. Test 1 regression investigation

Independent of the Compare Persistence design. Can be picked up in any session.

- [ ] Panel textarea closing prematurely reported passing earlier in Chat 87, then failing later. Possibly intermittent.
- [ ] Investigate delegated handlers on `.ppu-row` or panel wrapper that may move focus away from the textarea.

### C. Share Redesign — gated on Compare Persistence design

Absorbs Tests 2, 5, 6 and the Approach 4 include-notes UX decision. Can proceed in parallel with Option 1 implementation if scope is bounded — but the include-notes UX still stands (Option 5 was not chosen).

- [ ] Hold until Compare Persistence design brief is written.
- [ ] Then write kickoff brief covering: number of share buttons, share scopes (all/filtered/checked), where include-notes choice lives, prompt style, **sharing model (always-latest vs. frozen-snapshot — leaning frozen 1a per Chat 89 discussion)**.
- [ ] Design pass.
- [ ] Implementation.

---

## Phase 8B test status — updated after Chat 89 decision

| Test | Status | Resolution path |
|---|---|---|
| 1. Textarea closes prematurely (panel) | ❌ Possibly intermittent | Workstream B above |
| 2. Include-notes checkbox styling (panel) | ❌ Coral on coral | Share Redesign (checkbox may be removed) |
| 3. Storage-as-bus live sync | ❌ Bus doesn't exist | Will exist after Option 1 manifest change |
| 4. Note added on compare.html not surviving refresh | ❌ No storage access | Fixed by Option 1 implementation |
| 5. Note in shared link not visible to recipient | ❌ Wired to wrong button | Share Redesign |
| 6. Compare.html include-notes for notes typed there | ❌ Cannot work — notes never stored | Option 1 creates the storage; Share Redesign decides if checkbox still exists |

**None of these are individually patchable bugs.** They resolve through the structural work above.

---

## Phase 9 — Brand detection overhaul

Opus kickoff brief. Read Brand_Detection_Research.md. Held until Phase 8B residue clears (Compare Persistence Option 1 implementation + Share Redesign + Test 1).

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

---

*End of roadmap.*
