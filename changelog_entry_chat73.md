# Changelog — Chat 73 (May 15, 2026)

*Planning session (Opus 4.7). No code changed.*

---

## Close button design locked — Path C

Two coding-session briefs produced:

- `Close_Button_Kickoff_Brief_Chat73.md` — for the next Sonnet 4.6 session. Single deliverable: working close button + first-close toast.
- `Phase6_Kickoff_Brief_Chat73.md` — for the Sonnet session after that. Welcome page rewrite + personalize wizard + first-search brand hint + new loading banner + workflow banner removal + auto-open on install.

---

## Design decisions made this session

### Close button (Path C — toolbar-icon restore + first-close toast)

**Path C selected.** Path A (toolbar-icon restore via background.js) plus a one-time first-close toast for discoverability. Clean by default, discoverable on first encounter.

**Close behavior:**
- × hides panel via CSS (`display: none`), DOM preserved.
- Internal state (filters, drag position, minimized state, scroll position) preserved automatically.
- Closed state resets on page reload — panel reappears on next page load. No "is panel closed" storage flag needed.
- Toolbar icon click restores panel to last position/size/minimized state.

**Toast:**
- Fires only on first close ever. Gated by new flag `auHasSeenCloseToast`.
- Copy: "Panel closed. Click the Actually Useful icon in your browser toolbar to bring it back." [Got it]
- Auto-dismisses after 8 seconds OR on "Got it" click. Either path sets the flag.
- Anchors to the side of the viewport where the panel was last located (left if panel.left < viewport center; else right).

**Plumbing:**
- background.js: new `chrome.action.onClicked` listener → sends `{type: 'ppu-restore-panel'}` to active tab.
- manifest.json: audit needed for `default_popup` (if present, prevents `onClicked` from firing).
- search.js: new `chrome.runtime.onMessage` listener for restore.

### Phase 6 — Onboarding refresh

**Wizard location:** Inline on welcome.html, below welcome content. Single file. "Get started" CTA scrolls to it.

**Welcome page CTAs:** Single "Get started" → scrolls to wizard. Secondary "Skip and start shopping" link → amazon.com.

**Privacy/telemetry on welcome page:** Own labeled section. Toggle defaults On per §7.4. Link to full privacy policy at /privacy.html.

**Workflow banner removal:** The existing "Get the best results..." workflow banner at top of panel (introduced Chat 31, dismissible via `au-banner-dismissed` localStorage) gets fully removed. Welcome page covers this education. `au-banner-dismissed` key orphaned in existing users' browsers — no migration.

**Loading banner build:** Per Spec §6 — first-time amber banner + subsequent thin coral progress strip. New flag `auHasSeenLoadingBanner`. Slot is reserved for stable footprint.

**First-search brand hint:** Per Spec §8.3 + first_search_hint_wireframe.html. Both surfaces (inline note + tooltip), shared flag `auHasSeenBrandHint`. Edge case: if no detected brands on first search, show inline note alone, skip tooltip silently; dismissal still sets the flag.

**Auto-open welcome page:** `chrome.runtime.onInstalled` in background.js. Triggers on `install` only, not `update`.

### Process

**Initial plan:** One bundle, close + Phase 6 → one Sonnet session. **Reconsidered:** unbundled into two sessions for cleaner testing surface and to avoid Sonnet-session-gets-sloppy-when-long pattern.

**Document cadence between the two sessions:** Close button session (Chat 74) produces Handover only. Phase 6 session (Chat 75) produces full end-of-bundle docs covering BOTH sessions. Saves doc-production overhead without losing context — the Chat 74 Handover carries enough for Chat 75 to start cleanly.

**Phase 7 deferred** — scope gets defined after Phase 6 ships, captured in the Roadmap at end of Phase 6 session.

---

## Storage keys planned (not yet implemented)

| Key | Session | Type | Default | Purpose |
|---|---|---|---|---|
| `auHasSeenCloseToast` | Chat 74 (close button) | boolean | `false` | First-close toast shown |
| `auHasSeenLoadingBanner` | Chat 75 (Phase 6) | boolean | `false` | First-time loading message completed |
| `auHasSeenBrandHint` | Chat 75 (Phase 6) | boolean | `false` | First-search brand hint dismissed |

---

## Decision-log updates (Panel_Redesign_Spec.md §13)

To be added next time the spec gets updated:

| Decision | Choice | Made in |
|---|---|---|
| Close button — restore mechanism | Path C: toolbar-icon restore + first-close toast | Chat 73 |
| Close button — close behavior | Hide via CSS, DOM preserved | Chat 73 |
| Close button — state across reloads | Resets (panel returns on next page load) | Chat 73 |
| Close button — toast copy | "Panel closed. Click the Actually Useful icon..." | Chat 73 |
| Phase 6 bundling | Close button + Phase 6, two sessions | Chat 73 |
| Workflow banner (Chat 31) | Removed in Phase 6 — welcome page covers it | Chat 73 |
| Wizard location | Inline on welcome.html | Chat 73 |
| Phase 7 scope | Deferred until after Phase 6 ships | Chat 73 |

---

*End of changelog entry.*
