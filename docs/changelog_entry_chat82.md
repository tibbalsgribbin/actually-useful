# Changelog — Chat 82

*May 17, 2026*

*Opus session. Notes design document. No code changes.*

---

## Delivered

- **Notes_Design.md** — design document for the per-item notes feature. Current state, three deferred decisions with options + recommendations + implementation sketches, privacy section, naming gotcha, known issues list. Lands as input to a future Phase 9 (or whichever phase implements notes).

## Current state documented

- `itemNotes` in search.js is a plain JS object in panel memory. Not persisted. Cleared on panel close, page refresh, or browser restart. `core.js` has no notes logic.
- Two distinct "note" fields in the codebase: `r.note` inside search.js is the system-generated PPU explanation; `itemNotes[asin]` is the user-typed note. They get renamed at the compare payload boundary (search.js:3463-3464) to `ppuNote` and `note` respectively.
- Panel-side note widget is only visible while item is checked. Note data survives a check/uncheck cycle within a session.
- Compare.html has a Notes column with editable textareas. Edits update compare's in-memory `currentItems` but the cross-surface sync is dead code.
- Sharing: every Compare click POSTs the full notes set to Supabase. No UI to strip notes. Shared link is publicly addressable.

## Key findings

- **The `AU_UPDATE_NOTE` message has no listener.** compare.html sends it on every keystroke (compare.html:1629). Grep across search.js, compare.html, and core.js returns one hit — the `sendMessage` call itself. Dead wire. Not a user-visible bug; a maintenance trap.
- **Privacy posture is the worst case today.** Notes leak silently on every Compare click, no UI hint, no user agency.

## Recommendations in the design doc

- **§3.1 Persistence:** Option C — persist locally to `chrome.storage.local` + clear-all in Settings.
- **§3.2 Sharing:** Option C — always strip notes from Supabase payload; notes are device-local only.
- **§3.3 Edit-back:** Option C — use `chrome.storage` as the bus between panel and compare.html, with `chrome.storage.onChanged` listeners on both sides.

The bundle composes: one mechanism (`chrome.storage.local`) provides persistence, privacy enforcement, and cross-surface sync.

## Naming gotcha (Q4 this session)

- Decision: leave `note` / `ppuNote` names alone, document the distinction. Documented in §5 of the design doc.

## Files unchanged

- search.js — no edits this session
- compare.html — no edits this session
- core.js — no edits this session
- All other code files — no edits
- manifest.json — no version bump

## Sequencing

Notes design lands. Decisions in §3 still deferred — accepted as recommendations, not yet binding. Next session (Opus, fresh chat): **Phase 8 kickoff brief** (compare.html structural pass + bug reporting on compare.html), informed by both brand research (Chat 81) and notes design (this chat). Then **Phase 9** (brand detection overhaul). Notes implementation slots in after Phase 9 or as a separate phase — sequencing TBD.

---

*End of Chat 82 changelog.*
