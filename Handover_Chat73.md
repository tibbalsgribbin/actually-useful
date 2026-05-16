# Handover — Chat 73 → Chat 74

*May 15, 2026*

*Planning session (Opus 4.7). No code changed.*

---

## What was completed this session

**Close button design locked.** Path C selected — toolbar-icon restore via background.js + first-close toast. Full spec is in `Close_Button_Kickoff_Brief_Chat73.md`.

**Phase 6 scoped and bundled with close button.** Bundle is two sessions, not one. Phase 6 covers welcome page rewrite, personalize wizard, first-search brand hint, new loading banner system, removal of old workflow banner, and `chrome.runtime.onInstalled` auto-open. Full spec is in `Phase6_Kickoff_Brief_Chat73.md`.

**Phase 7 deferred.** Scope to be defined after Phase 6 ships.

---

## Design decisions made this session

### Close button — Path C

1. **Path A vs Path B vs hybrid:** Chose Path C — toolbar-icon restore (Path A) plus a first-close toast for discoverability. Best of both: clean by default, discoverable on first encounter.
2. **Close behavior:** Panel hides via CSS (`display: none`), DOM preserved. Internal state (filters, drag position, minimized state) preserved automatically.
3. **Closed state across reloads:** Resets — panel reappears on next page load. No "is panel closed" storage flag needed.
4. **Restore state:** Toolbar icon restores panel to last position/size/minimized state. Free because DOM was preserved.
5. **Toast:** Fires only on first close ever. Gated by `auHasSeenCloseToast`. Auto-dismisses after 8 seconds OR on "Got it" click. Either path sets the flag.
6. **Toast position:** Anchored to the side of the viewport where the panel was last located. Read panel's pre-hide `left`; if left < viewport center → top-left, else top-right.
7. **Toast copy:** "Panel closed. Click the Actually Useful icon in your browser toolbar to bring it back." [Got it]
8. **Auto-dismiss timing:** 8 seconds — accommodates fibromyalgia/brain-fog reading speed; doesn't make people race the clock.

### Phase 6 — Onboarding

9. **Wizard location:** Inline on welcome.html, below welcome content. Single file. "Get started" CTA scrolls to it.
10. **Welcome page primary CTA:** Single "Get started" → scrolls to wizard. Secondary "Skip and start shopping" → amazon.com.
11. **Privacy/telemetry choice on welcome:** Own labeled section. Toggle defaults On per §7.4. Link to full privacy policy at /privacy.html.
12. **Workflow banner removal:** The existing "Get the best results..." workflow banner at top of panel gets fully removed. Welcome page covers this education. Two pieces of "how to use AU" content in the same UI is one too many. `au-banner-dismissed` localStorage key orphaned in users' browsers; no migration needed.
13. **Loading banner build:** Per Spec §6 — first-time amber banner + subsequent thin coral progress strip. New flag: `auHasSeenLoadingBanner`.
14. **First-search brand hint:** Per Spec §8.3 + first_search_hint_wireframe.html. Both surfaces (inline note + tooltip), shared flag `auHasSeenBrandHint`. Edge case decision: if no detected brands on first search, show inline note alone, skip tooltip silently; dismissal still sets the flag.

### Process decisions

15. **Bundling:** Initially decided one bundle (close + Phase 6), then unbundled into two sessions per Melissa's reconsideration. Rationale: Phase 6 is large enough that a focused session is worth the small overhead of two GitHub pushes.
16. **Documents between sessions:** Close button session produces Handover only (no Changelog, no Briefing, no Roadmap). Phase 6 session produces full end-of-bundle docs covering BOTH sessions. Saves doc-production overhead between sessions but means Chat 74's Handover needs to explicitly note "Changelog deferred to Phase 6 session."

---

## New documents produced this session

- `Close_Button_Kickoff_Brief_Chat73.md` — for the next Sonnet coding session (close button only)
- `Phase6_Kickoff_Brief_Chat73.md` — for the Sonnet coding session after the close button session
- `Handover_Chat73.md` — this file
- `changelog_entry_chat73.md` — companion changelog

---

## Current state

- **Overall version:** v0.6.1.83 (unchanged — no code edits this session)
- **search.js:** v0.6.1.83
- **core.js:** v0.6.1.53
- **styles.css:** updated Chat 72
- **background.js:** v0.6.1.17
- **manifest:** v0.6.1
- **compare.html, index.html, welcome.html, privacy.html:** unchanged

Phase 4+5 bundle complete. Phase 6 bundle (close button + onboarding) planned, briefs ready. No code changes this session.

---

## Documented no-ops (carry forward)

- `#ppu-close` / `#ppu-close-min` — still inert. **Wires up in Chat 74 (close button session).**
- `setupCollapsible` dead code — still present, leave as-is.

---

## What's next

**Chat 74 — Close button coding session** (Sonnet 4.6). Brief is `Close_Button_Kickoff_Brief_Chat73.md`. Single deliverable: working close button + first-close toast. Document output: Handover only.

**Chat 75 (or whenever) — Phase 6 onboarding coding session** (Sonnet 4.6). Brief is `Phase6_Kickoff_Brief_Chat73.md`. Multiple deliverables. Document output: full end-of-bundle docs covering both Chat 74 and Chat 75.

---

## Things to know going into the close button coding session

**This is the Sonnet handoff point.** Open a fresh Sonnet 4.6 chat. Upload current code files (search.js v0.6.1.83, core.js v0.6.1.53, styles.css from Chat 72, background.js v0.6.1.17, manifest.json) fresh from GitHub. Paste the suggested session opener from the bottom of the close button brief.

**First Sonnet message back should include both audits** (storage keys + manifest config). Don't skip either — they're structurally important.

**Document cadence note:** Chat 74 produces Handover only. No Changelog this session — it gets rolled into the Phase 6 session's docs.

---

## Things to know going into the Phase 6 coding session (after Chat 74)

**This is a larger session.** Welcome.html rewrite + wizard + brand hint + loading banner + workflow banner removal + onInstalled listener. Use the Phase 6 brief as the structure.

**Verify Chat 74 work first** — quick close button check before stacking Phase 6 on top.

**Document cadence note:** Chat 75 produces full end-of-bundle docs (Handover + Changelog covering BOTH Chat 74 and Chat 75 + Project_Briefing + Roadmap). Phase 7 scope gets defined in the Roadmap at this point.

---

## Session opener for Chat 74 (close button session)

> Close button design session of the panel redesign — Path C (toolbar-icon restore + first-close toast). The brief is `Close_Button_Kickoff_Brief_Chat73.md` in the Project. Panel_Redesign_Spec.md is the full reference. Handover_Chat73.md has current state. I'm uploading current code files fresh from GitHub. Confirm scope before touching anything.

---

## Session opener for Chat 75 (Phase 6 session)

> Phase 6 of the panel redesign — Onboarding refresh. The brief is `Phase6_Kickoff_Brief_Chat73.md` in the Project. Panel_Redesign_Spec.md is the full reference. Handover_Chat74.md has the close button session state (close button is done — verify it's working before stacking on top). I'm uploading current code files fresh from GitHub. Confirm scope before touching anything.

---

*End of handover.*
