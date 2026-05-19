# Project Briefing — Chat 87

*Updated after Phase 8B retest. One fix attempted + reverted. Share Redesign added.*

*May 19, 2026*

---

## What is Actually Useful

A free Chrome extension that improves Amazon search. Shows price-per-unit, filters, sorts, brand controls, notes, and a side-by-side comparison table. Open source. No ads. No data sales.

---

## Current version

`v0.6.1` (manifest). Do not bump until CWS push.

---

## Active phase status

**Phase 8B — Notes implementation.** Still not closed. Retest run in Chat 87 surfaced four real failures (Tests 1, 2, 4, 5) plus one untested (Test 6) plus a major structural discovery (compare.html has no persistence layer).

**Phase 8B is being decomposed**, not just retested. The remaining failures split into three:

1. **Test 4 + compare.html persistence** — needs root-cause investigation, then likely a Compare Persistence design item.
2. **Tests 2, 5, 6 + include-notes UX** — absorbed into the new Share Redesign item.
3. **Test 1 (panel textarea)** — needs its own investigation. Was passing earlier in Chat 87, then reported failing later. Possibly intermittent.

---

## Locked decisions (standing, not revisited)

| Decision | Chosen |
|---|---|
| Notes persistence | C — chrome.storage.local + clear-all in Settings |
| Notes sharing default | Off — recipient does not see notes unless sender opts in |
| Notes edit-back | C — storage-as-bus (chrome.storage.onChanged) |
| Note-sharing checkbox label (current) | "Include my notes in the shared link" — *will likely change in Share Redesign* |
| Checkbox placement (compare.html) | Currently action bar — *will be replaced by share-time prompt (Approach 4) in Share Redesign* |
| Panel-to-compare notes flow | Notes always travel; the privacy gate is at the share step on compare.html, not the panel-to-compare step |
| Share-time prompt approach (selected Chat 87) | Approach 4 — no persistent checkbox; ask at share time when notes exist. Style (popover vs modal) decided at design time. |
| privacy.html notes copy | Option 1 — new Notes section, existing copy unchanged |
| Error reporting destination | Separate endpoint, independent of telemetry opt-out, diagnostic-only payloads |
| Browser detection in error reports | `navigator.userAgent` check for `Edg/` token |

---

## Files — current state

Unchanged from end of Chat 86. Chat 87 reverted its one in-session edit.

| File | Version | Notes |
|---|---|---|
| `manifest.json` | v0.6.1 | `default_icon` added to action block (Chat 86). Do not bump. |
| `background.js` | v0.6.1.19 | AU_ERROR handler + Fix B + dead AU_UPDATE_NOTE handler removed (Chat 86). |
| `core.js` | v0.6.1.54 | auReportError + auSendMessage added (Chat 86). |
| `search.js` | v0.6.2.1 | Two sendMessage sites use auSendMessage (Chat 86). Phase 8B changes from .6.2.0 still pending real retest. |
| `compare.html` | compare-v1.0.0 | Phase 8B push from Chat 86. Chat 87 fix attempted and reverted. |
| `privacy.html` | Phase 8B | Pushed (Chat 85). |
| `styles.css` | — | Unchanged. |

---

## Infrastructure — current state

| System | Purpose | Notes |
|---|---|---|
| Telemetry Apps Script + sheet | Search usage logging | Gated by user telemetry toggle (default on). Established pre-Chat-86. |
| AU Error Log Apps Script + sheet | Diagnostic error reporting | Added Chat 86. Independent of telemetry opt-out. Diagnostic-only payloads. |
| Supabase | Compare-page sharing | Established earlier. Note: stored row data includes notes only when `includeNotes` is true at save time. |

---

## Standing process rules

1. **Sonnet never makes design/color decisions.** Every brief includes exact hex, font size, placement.
2. **Testing instructions every time, plain language, numbered steps.** Don't assume Melissa remembers prior tests.
3. **Commit summary at end of every session.** Also any time a file in the GitHub root folder changes mid-session.
4. **Opus owns version number decisions.** Melissa never decides versions.
5. **(New, Chat 87) Diagnose before fixing.** When a bug report comes in, confirm root cause before writing code. Mirror-the-working-path moves are not diagnoses.
6. **(New, Chat 87) Revert cleanly when a fix doesn't work.** Don't leave partial fixes in the codebase to patch later.

---

## Standing deferred items (pre-8B, unchanged)

- SUGGESTED COPY review — welcome.html flagged blocks, review before CWS push
- Banner text in search.js — `// <!-- SUGGESTED COPY -->` in `enterReportMode()`, review before CWS push
- Panel_Redesign_Spec.md — §8.3 and §5.7 stale; separate careful pass
- Pattern A+B (`(?)` icons + Help drawer) — Pattern_AB_Note.md; future phase
- "Always hide" semantics — demotes instead of hides; UX question pending
- Keyword filter hint verbosity — deferred, design conversation required
- Impossible Burger math — deferred, investigation session required
- Prime scraping selector change — deferred
- Coral vs Amazon orange — verify #f25d4e doesn't clash with #ff9900 on live page
- Text-size observation session — no design until observed
- Per-note X delete button — deferred from Notes_Design.md §7
- Purge existing Supabase rows with notes — one-time data cleanup, Melissa decision

---

## Deferred items from Phase 8B testing

- compare.html filters and sorts don't survive page refresh → now part of **Compare Persistence** design item
- Minimum price filter on compare.html doesn't work
- No link to privacy.html from compare.html footer
- privacy.html header hierarchy needs audit
- Bug report overlay appears below triggering listing instead of near button
- Image and product name mushed together in compare.html unless columns removed
- PPU math wrong on gram-weight items (Thai soup paste 200g $29.99 → $0.15/oz, should be ~$4.25/oz)

---

## Newly deferred (Chat 87)

- **"+ Add a note…" always visible (panel)** — UX request from Test 1 retest. Currently only appears after a listing is checked. Roadmap polish item.
- **AU favicon on AU webpages** — compare.html, privacy.html, welcome.html etc. don't show the extension icon in the browser tab. `<link rel="icon">` work. Roadmap polish.
- **Test 1 regression investigation** — panel textarea closing prematurely came back during this session after initially passing. Could be intermittent or could be triggered by some other state change.

---

## Newly deferred from Chat 86 (still standing)

- **Silent-catch sweep across the codebase.** Roughly 40 `catch(e) {}` patterns remain in search.js alone, plus more in compare.html and background.js. Demo conversion done in search.js for `saveSearchContext` and `sendLog`. Full sweep deferred.

---

## What's next

1. **Next session (Opus) — Test 4 root-cause investigation.** Confirm what URL the panel's "Compare" button produces, confirm whether the `?id=` notes-load actually works in practice, and diagnose why Chat 87's mirroring fix broke Test 3. Do not write a fix until diagnosis is clear.
2. **Test 1 investigation** — could fold into the same session if scope allows, otherwise its own session.
3. **Share Redesign (Opus)** — kickoff brief, then design, then implementation. Absorbs Tests 2, 5, 6 and the Approach 4 include-notes UX. Should not begin until the kickoff brief is written.
4. **Compare Persistence (Opus)** — design item. What state on compare.html persists across refresh and how. Big enough to be its own phase.
5. **Phase 9 (Opus brief) — Brand detection overhaul.** Read Brand_Detection_Research.md. Held until Phase 8B's residue is fully cleared by the items above.

---

*End of briefing.*
