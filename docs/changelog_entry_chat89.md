# Changelog — Chat 89

*May 19, 2026*

*Opus session. Compare Persistence product decision per Chat 88 plan. Decision reached. No code shipped.*

---

## Delivered

**No code changes.** Decision session only.

---

## Decision: what compare.html is

**compare.html is primarily a private workspace** — a larger, more legible extension of the panel with sort, filter, and column tools for narrowing a search from broad to narrow. The page needs to serve that one user well, before considering other potential users.

**Sharing is an extension of that purpose, not the primary purpose.**

---

## Option resolution

| Option | Outcome |
|---|---|
| **Option 1** — Content script in manifest + chrome.storage.local | **Chosen as the foundation.** Workspace must persist locally across refresh and sessions. |
| Option 2 — postMessage bridge | Already ruled out (Chat 88). |
| Option 3 — Server-side persistence in Supabase | **Not chosen.** Wrong model for a private workspace; pushes personal state to a server unnecessarily. |
| Option 4 — Accept that notes don't persist | **Not chosen.** Incompatible with "serve the one user well." |
| Option 5 — Turn-based collaboration | **Parked.** Possible future extension if a real need emerges. Snapshot primitive sits naturally on top of Option 1. |

---

## Sharing model question — deferred

The always-latest vs. frozen-snapshot question was discussed but **not resolved.** It is deferred to Share Redesign.

Leaning during discussion was toward frozen-snapshot (variant 1a: live local workspace; clicking Share freezes a snapshot to Supabase). One-to-many sharing was identified as a design-pressure case that breaks always-latest. These notes are recorded here so the next sharing conversation doesn't start from zero.

---

## What this unblocks

- **Compare Persistence** is no longer a gating decision. It is now a design session for the chosen path (Option 1).
- **Share Redesign** remains gated on the Compare Persistence *design* (not the decision). It can proceed in parallel with Option 1 implementation if scope is bounded carefully — but the include-notes UX (Approach 4) still stands, since Option 5 was not chosen.

---

## Phase 8B test outlook — updated

| Test | Status after Chat 89 |
|---|---|
| 1. Textarea closes prematurely (panel) | Unchanged. Independent investigation. |
| 2. Include-notes checkbox styling | Unchanged. Share Redesign. |
| 3. Storage-as-bus live sync | Will become testable once Option 1 ships. The bus will exist after the manifest change. |
| 4. Note added on compare.html not surviving refresh | Will be fixed by Option 1 implementation. |
| 5. Note in shared link not visible to recipient | Unchanged. Share Redesign. |
| 6. Compare.html include-notes for notes typed there | Will become testable once Option 1 ships + Share Redesign decides if checkbox still exists. |

---

## Process notes

- **The Chat 88 handover framing produced the resolution.** Asking "what is compare.html?" up front, with three discrete options, gave the session a clean structure. Melissa re-read the framing mid-session and that triggered the reframe to "private workspace first."
- **One-to-many as a design-pressure case** was the move that eliminated always-latest. Worth keeping in mind for the Share Redesign sharing-model conversation.
- **Walking through implications slowly** — devils-advocate pass on the leaning option, surfacing limitations one at a time — was what Melissa explicitly asked for. The handholding was the work.

---

## Files changed

None.

## Files unchanged

All. `manifest.json`, `background.js`, `core.js`, `search.js`, `compare.html`, `privacy.html`, `styles.css` — identical to end of Chat 88 (which was identical to end of Chat 87, which was identical to end of Chat 86).

---

*End of Chat 89 changelog.*
