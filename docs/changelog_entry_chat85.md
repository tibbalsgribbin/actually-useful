# Changelog — Chat 85

*May 18, 2026*

*Sonnet session. Phase 8B — notes persistence, opt-in sharing, storage-as-bus, privacy.html update. Bundle close.*

---

## Delivered

### core.js

- Added `AU_ITEM_NOTES_KEY = 'au_item_notes'` storage key constant.
- Added `auNotesGet(callback)` — reads `au_item_notes` from `chrome.storage.local`, returns `{}` if absent.
- Added `auNotesSet(notes, callback)` — writes the full notes object to `chrome.storage.local`.
- Added `auNotesClearAll(callback)` — removes `au_item_notes` from `chrome.storage.local`.
- All three helpers follow the existing `auShortlistGet` / `auShortlistSet` pattern exactly.

### search.js

**§3.1 — Persistence:**
- `itemNotes` still declared as `{}` at startup; `auNotesGet` is called in `loadUserDefaults` callback to populate it async before first build.
- After `auNotesGet` resolves, `render()` is called so inline note previews in row HTML reflect stored notes on first load (fixes blank notes until re-check).
- `auShowNoteTextarea` input handler: 300ms debounced `auNotesSet` call on every keystroke.
- `auShowNoteTextarea` blur handler: immediate `auNotesSet` call on blur.
- Uncheck preservation: `auNotesSet` called after `itemNotes[asin] = ta.value` before textarea removal.
- Added `noteWriteTimer` debounce variable to shared state.

**§3.1 — Clear all notes (Settings):**
- "Clear all notes" button added to Settings → Privacy section, below the telemetry toggle row.
- Uses the existing two-click confirmation pattern from the Reset button exactly: first click → "Click again to confirm" + 3s revert timer; second click → `auNotesClearAll()`, `itemNotes = {}`, `render()`.

**§3.2 — Opt-in share checkbox (panel):**
- "Include my notes in the shared link" label + checkbox added to the shortlist bar HTML, between the Compare hint text and the Compare button.
- Hidden by default; shown via `display:flex` when checked item count > 0. Wired into both the render function and the checkbox change handler.
- Checkbox unchecked by default (per-action opt-in, not sticky).
- Compare button payload: `note` field gated — empty string when unchecked, `itemNotes[r.asin]` when checked.
- Styling: `#c2362a` text, `accent-color:#f25d4e`, 11px font — matches coral palette.

**§3.3 — Storage-as-bus listener:**
- `chrome.storage.onChanged` listener added after `auInjectNoteWidget` definition.
- On `au_item_notes` change: updates `itemNotes` and calls `auRefreshNoteWidget` on all visible `.ppu-note-widget` elements.
- Guarded with `window.__ppuNotesStorageListenerAttached` flag to prevent duplicate listeners across re-injections.

**Blur fix (second pass):**
- Replaced the `_suppressBlur` flag approach with `preventDefault()` on `mousedown` inside the widget (when target is not the textarea itself). This prevents focus-shift from firing blur when the user clicks the widget border, scrollbar, or resize handle.
- Listener is removed on blur to avoid leaking handlers.

### compare.html

**§3.1 — Local notes persistence on load:**
- Added `localNotes = {}` module-level variable (alongside `currentItems`, `checkedAsins`, `showCheckedOnly`).
- `rerender()` now merges `localNotes` into `currentItems` before every render, so notes survive sort, filter, and all other rerenders without needing to re-fetch from storage.
- `scheduleNoteWrite` updates `localNotes[asin]` immediately (synchronously) before the debounced storage write, so rerenders triggered during typing also see the latest value.

**§3.1 — Init flow:**
- After Supabase load, `chrome.storage.local.get('au_item_notes')` populates `localNotes`, then calls `rerender()`.
- `chrome.storage.onChanged` listener is wired inside this callback (after `currentItems` is populated and `rerender()` has run), not at module scope. Fixes the previous bug where the listener fired before `currentItems` existed.
- On storage change: `localNotes` updated, `rerenderTableOnly()` called.

**§3.2 — Opt-in share checkbox (compare.html):**
- "Include my notes in the shared link" checkbox added to `renderActionBar()`, between "Show checked only" and "Share checked items" buttons.
- `saveComparison()` reads `#action-include-notes` checkbox state; strips notes (`note: ''`) from all items when unchecked before POST.
- Both share paths (Share checked items, Share this comparison) go through `saveComparison()` and pick up the gate for free.

**§3.3 — Dead code removal:**
- Removed the `chrome.runtime.sendMessage({ type: 'AU_UPDATE_NOTE', ... })` block from the note textarea input handler.
- Replaced with `scheduleNoteWrite(asin, note)` — 300ms debounced write to `chrome.storage.local`.
- Comment retained to document the replacement.

### privacy.html

- Added new "Notes" section (Option 1 — new section alongside existing "The comparison page" section, existing copy unchanged).
- Copy verbatim as approved by Melissa: *"Notes you add to items are stored locally on your computer. They are not included in shared comparison links by default. If you choose to include your notes when sharing, they are saved to the comparison database along with product information. Notes included in a shared link are accessible to anyone who has the link."*
- Section label: "Notes". Placed between "The comparison page" and "Bug reports" sections.

---

## Test results (partial — session ended before full retest)

### Confirmed working

- Notes visible after page refresh without re-checking items ✓
- Clear all notes (two-click confirm) ✓
- Note survives trip to compare.html ✓
- §3.2 sharing via compare.html path ✓
- privacy.html Notes section present ✓

### Confirmed not working / untested after final fixes

- **Textarea closes prematurely (panel)** — two fix attempts made. First attempt (flag-based) didn't work. Second attempt (preventDefault on mousedown) committed but not yet tested by Melissa. Root cause uncertain — see Opus notes below.
- **Include-notes checkbox styling** — first attempt used purple palette (wrong). Second attempt corrected to coral palette (`#c2362a` / `#f25d4e`). Not retested.
- **§3.3 Storage-as-bus (panel ↔ compare.html live sync)** — fix committed (listener moved inside init callback) but not retested.
- **Note added on compare.html not surviving refresh** — fix committed (`localNotes` module variable + merge on rerender) but not retested.
- **Note in shared link not visible to recipient** — reported once, not reproduced in code review. Possibly resolved by `localNotes` merge fix. Needs retest.
- **compare.html: no include-notes mechanism for notes added directly on that page** — the action-bar checkbox covers this path; not retested.

---

## Files changed

- `core.js` — new storage key + 3 helpers. Version unchanged (v0.6.1.53).
- `search.js` — all §3.1/§3.2/§3.3 wiring + blur fixes + checkbox styling. Version unchanged (v0.6.2.0).
- `compare.html` — all §3.1/§3.2/§3.3 wiring + dead code removal + share checkbox.
- `privacy.html` — Notes section added.

## Files unchanged

- `background.js` — no changes needed.
- `styles.css` — no visual changes.
- `manifest.json` — no version bump.

---

## Pre-coding CONFIRMs settled (all 3)

1. Opt-in checkbox label: *"Include my notes in the shared link"* (Opus suggestion accepted).
2. Checkbox placement on compare.html: action bar near "Share checked items" (Opus recommendation accepted).
3. privacy.html: Option 1 — new Notes section, existing copy unchanged (Opus recommendation accepted).

---

*End of Chat 85 changelog.*
