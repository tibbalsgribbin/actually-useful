# Handover — Chat 89 → Chat 90

*May 19, 2026*

*Opus session. Compare Persistence product decision per Chat 88 handover. Decision reached. No code changes. The "what is compare.html" question is now answered; next session designs the Option 1 implementation.*

---

## What happened this session

Picked up Chat 88's gating question: decide what compare.html *is.* Worked through it from the top: primary purpose first, then sharing model, then how those interact under one-to-many use. Decision reached with confidence by end of session.

No code was written. No code was committed. The deliverable is the decision itself plus the framing it carries forward.

---

## Decision

**compare.html is primarily a private workspace** — a larger, more legible extension of the panel with sort, filter, and column tools for narrowing a search from broad to narrow. The page needs to serve that one user well, before considering other potential users.

**Sharing is an extension of that purpose, not the primary purpose.**

### What this means architecturally

- **Option 1 (manifest content script for compare.html + chrome.storage.local) is the foundation.** The workspace must persist locally across refresh and sessions. Without persistence, the workspace isn't a workspace.
- Sharing is a smaller question downstream of getting the workspace right. The always-latest vs. frozen-snapshot decision is **deferred, not resolved.** It will surface again when Share Redesign is designed.
- **Option 5 (turn-based) is clearly optional** — possible later if a real need emerges, not architected for now.
- Options 3 and 4 are not chosen. Option 3 (server-side persistence) was the wrong model for a private workspace. Option 4 (accept that notes don't persist) was incompatible with "serve the one user well."

---

## How the decision unfolded (for context, not re-litigation)

The session opened by asking Melissa to pick a primary purpose for compare.html from three: private workspace, shared document, or turn-based dialog. She initially answered "definitely both 1 and 2, maybe also 3."

Working through the implications of one-to-one sharing led to a leaning toward the **frozen-snapshot model** (1a: workspace stays live on the user's machine; clicking Share freezes a snapshot to Supabase; user keeps editing). The always-latest model was eliminated because it doesn't support sending different versions to different people and degrades the user's ability to know what a recipient is seeing.

The decisive move came when Melissa introduced **one-to-many sharing** as a complication. One-to-many breaks always-latest entirely (recipients see different states at different times; no "the comparison" exists) and validates frozen-snapshot.

Then Melissa re-read the session's opening framing and reframed: **compare.html is first and foremost a private workspace.** Sharing is a feature *of* the workspace, not a co-equal purpose. This reframe demoted the sharing-model question from architectural to downstream-of-architecture, and made Option 1 the clear foundation.

The session ended with the decision captured and the next session's job defined: design the Option 1 implementation.

---

## Files state

Nothing changed. Repo identical to start of session and to end of Chats 87 and 88.

| File | Version | Status |
|---|---|---|
| `manifest.json` | v0.6.1 | Unchanged |
| `background.js` | v0.6.1.19 | Unchanged |
| `core.js` | v0.6.1.54 | Unchanged |
| `search.js` | v0.6.2.1 | Unchanged |
| `compare.html` | compare-v1.0.0 | Unchanged |
| `privacy.html` | Phase 8B | Unchanged |
| `styles.css` | — | Unchanged |

---

## Notes for next-session Opus brief

**Next session's job: design the Option 1 implementation.** The decision is locked. This is now a design session for a specific path.

The design session needs to produce a kickoff brief covering at minimum:

1. **Manifest change.** New `content_scripts` entry for the `tibbalsgribbin.github.io/actually-useful/*` path. Which existing scripts (`core.js`?) inject, and which are skipped.
2. **What state goes in chrome.storage.local.** Notes are the obvious one. Filters, sort, column visibility were all flagged in Chat 88 as facing the same wall. The design session should decide which subset Option 1 covers in its first pass.
3. **Key naming.** Existing key is `au_item_notes`. Decide if other state shares this key, gets sibling keys, or moves to a new structured key.
4. **The `rerenderTableOnly()` merge gap from Chat 88's Q3 finding.** Once compare.html has storage access, `rerenderTableOnly()` needs to merge `localNotes` into `currentItems` (the way `rerender()` does at compare.html line 1786). Decide whether this is part of the Option 1 brief or a separate cleanup.
5. **Permission surface implications.** Adding the github.io domain widens what the extension can touch. Worth a privacy.html note? A user-facing mention?
6. **Migration / first-run.** Existing users have compare.html records in Supabase with embedded notes (when include-notes was checked). What happens to those on first load after Option 1 ships? Probably nothing — they continue to load from `parsed.items` — but the design session should confirm.

**Things the next session should remember:**

- The decision is "private workspace primarily, sharing secondary." Don't re-open it.
- The sharing-model question (always-latest vs. frozen-snapshot) is deferred. It surfaces again at Share Redesign. **Do not make a sharing decision in the Option 1 design session.**
- Option 5 is parked, not chosen and not dead. If Share Redesign later wants turn-based collaboration, the snapshot primitive sits naturally on top of Option 1.
- The include-notes UX (Approach 4 from Chat 87) is **not moot.** Option 5 was the scenario that made it moot, and Option 5 wasn't chosen. Approach 4 stands until Share Redesign revisits it.

**Test 1 investigation** (panel textarea regression) is still independent. Can be picked up in any future session.

---

## Process notes for next session

- The "stop the session when findings reframe the shape" rule from Chat 88 didn't fire this session — the decision crystallized cleanly and Melissa was steady throughout. Worth keeping the rule on the books regardless.
- The opening framing from the Chat 88 handover ("decide what compare.html is — private workspace, shared document, or turn-based dialog") was the move that resolved the session. Melissa re-read it mid-conversation and that's what produced the reframe. Good handover framing matters.
- One-to-many sharing was the test case that broke the always-latest model. Worth remembering as a design-pressure case in future sharing conversations.

---

*End of handover.*
