# Phase 8A — Kickoff Brief

*compare.html structural pass + bug reporting on compare.html*

*Author: Opus, Chat 83. Executor: Sonnet, next session.*

*Date: May 17, 2026*

---

## 0. Read this first

You are Sonnet. You are executing Phase 8A.

**Rules of engagement:**

- Melissa does not write code. You do.
- Stop and confirm before changing anything you're not sure about. Stop especially before any decision marked **CONFIRM** in this brief.
- Use Melissa's exact wording for user-facing copy. Suggestions welcome — flag them and let her decide.
- Skip sycophancy. Direct criticism welcome.
- One Sonnet session. End-of-session: produce Handover + Changelog only. (Bundle close — all four documents — happens at end of 8B.)
- This is the **8A** session. Phase 8B (notes implementation) is a separate later session and is **out of scope** for 8A.

**Pre-session checklist for Melissa:**

1. Confirm `bug_reports` Supabase table exists (created before Phase 7A — should already be there).
2. Upload fresh from GitHub: `compare.html`, `search.js`. (`search.js` is needed for pattern-matching the existing bug report code; you should not modify `search.js` in 8A.)
3. Have Phase 7A bug-report code visible. The compare-side bug report must use the same Supabase POST shape, same category mapping, same transparency note copy.

---

## 1. Scope summary

Phase 8A has three workstreams:

1. **Bug reporting tool on compare.html.** Mirror Phase 7A. One genuine design decision: entry point on compare rows (no ⋯ menu exists today).
2. **Roadmap compare.html bugs.** Eight items, mostly the same root cause: old shared links missing payload fields that newer search.js versions populate. Plus one Amazon Basics brand-column issue.
3. **CSS variable rename.** Cosmetic. `--cream/--navy/--teal/--teal-lt` hold coral+slate hex values from the Chat 66 palette migration but kept their indigo-era names. Same kind of cleanup that hit privacy.html in Phase 7B.

**Files touched in 8A:** `compare.html` only.

**Files NOT touched in 8A:**
- `search.js` — read for pattern-matching only. No edits.
- `styles.css` — compare.html has its own embedded `<style>` block. Don't touch.
- `manifest.json` — no version bump (compare.html is not extension code, doesn't ship via CWS).

**Version bookkeeping:** No version constant in compare.html today. Phase 8A doesn't change that — but the new bug report payload needs a version string. See §3.4.

---

## 2. Phase 8 split rationale (for context)

The handover scoped Phase 8 as "compare.html structural pass + bug reporting on compare.html." Notes implementation per the Chat 82 design decisions could plausibly belong here too. Decision in Chat 83: split into 8A and 8B, same model as Phase 7.

- **Phase 8A** (this brief) — bug reporting + Roadmap bugs + CSS rename.
- **Phase 8B** (separate brief, separate session, after 8A is pushed) — notes implementation per Notes_Design.md §3.1 C + §3.2 A + §3.3 C.

Reasoning: combined scope was too large for one Sonnet session. Splitting also lets the bug reporting tool land before the notes work, which means Melissa can dogfood the report flow on any notes-related issues during 8B testing.

---

## 3. Part 1 — Bug reporting on compare.html

### 3.1 Design context

Phase 7A added bug reporting to the panel via the ⋯ menu on cards with a detected brand. Compare.html has no equivalent ⋯ menu on rows. The entry point is the only real design decision here.

The five categories, the transparency note, the success/failure UX, the Supabase POST shape, and the on-form transparency wording are all settled by Phase 7A and must be mirrored exactly.

### 3.2 Entry point — **CONFIRM with Melissa**

Three options. Recommend Option B.

**Option A — Per-row icon button.** Add a small `⚠️` or `⋯` icon to each row (probably in the Notes column or as a new narrow leftmost column). Click opens the report overlay for that row's item.

- Pro: every row is reportable independently. Matches the "I want to report this specific item" mental model.
- Con: adds visual density to an already-wide table. Another icon to learn.
- Con: needs a column-visibility decision (toggleable? always on? if toggleable, where in the column toggle bar?).

**Option B — Per-row option inside an existing-or-new row menu.** Add a `⋯` button to each row that opens a small popover with one option for now: "Report an issue with this item." This mirrors the panel-side ⋯ menu but for compare rows. Future row-level actions (hide seller, copy link, etc.) can join the same popover later.

- Pro: matches the panel-side pattern. Same mental model on both surfaces.
- Pro: extensible without crowding the table.
- Con: still adds a column or a per-row button. Less dense than Option A but not invisible.

**Option C — Action bar button for checked items.** Add a "Report issue" button to the action bar (which already appears when 1+ rows are checked). User checks the row(s), clicks Report. If multiple rows are checked, either disable until exactly 1 is checked, or open a picker.

- Pro: zero per-row visual weight.
- Con: the action bar is a different mental model — "things to do to the things I picked" vs. "report this one item." Reporting feels per-item, not per-shortlist.
- Con: forces a check-first interaction. Friction on a flow that's already a side-task.

**Recommendation: Option B.** Matches the panel-side ⋯ pattern, which is already documented in welcome.html and in the user's head. Extensible. Visual cost is small (a single ⋯ button per row). The new column should be narrow, always visible, leftmost or rightmost — leftmost feels right since it's a row-level affordance, not a data column.

If Melissa picks Option B, the brief assumes that going forward. If she picks A or C, stop and revise this section before coding.

### 3.3 Overlay form — identical to Phase 7A

Form fields, layout, copy, button labels, success/failure flow: **mirror Phase 7A exactly.** Do not improvise.

Specifically:
- Header: "Report an issue" + close × in top-right
- Item context line (read-only, muted): product title, truncated if long (first 60 chars + "…")
- Category picker — 5 radio buttons (Title case in UI, snake_case in DB):
  - Unit type wrong → `unit_type`
  - PPU math wrong → `ppu_math`
  - Brand wrong → `brand_wrong`
  - Brand filtered incorrectly → `brand_filtered`
  - Other → `other`
- Notes field — `<textarea>`, optional, 3–4 rows
- Transparency note (small muted text above buttons): **"Submitting sends the item details (URL, ASIN, price, PPU, raw data) and your notes to Actually Useful. No personal info."**
- Buttons: "Send report" (primary, coral) + "Cancel" (link, deep coral)

Styling: match existing compare.html palette. The overlay should sit above the table (modal or full-page overlay — your call, lean modal). Don't open a new tab.

**Edge case different from Phase 7A:** the panel's "Brand filtered incorrectly" makes sense — the panel applies brand filtering. Compare.html does not apply brand filtering the same way (its brand filter is in the filter overlay, but rows aren't hidden by Brand-detection failure the way they are on the panel). The category list still stays the same — users may want to report a brand-filter issue from compare even if the proximate cause is upstream. Don't drop the category; keep the menu consistent.

### 3.4 Submit payload — match Phase 7A schema

Phase 7A's snapshot fields:
- `session_id` — generate once per page load, reuse for page lifetime. Use `crypto.randomUUID()`.
- `search_url` — `window.location.href` (this will be the compare.html URL, possibly with `?id=...` — that's correct and useful for debugging).
- `asin` — from the item object.
- `title` — full untruncated.
- `category` — DB value from picker.
- `notes` — textarea contents (empty string if blank).
- `ppu` — from the item object.
- `ppu_unit` — from the item object.
- `price` — from the item object.
- `raw_extract` — `JSON.stringify(item)`.
- `extension_version` — **see below**.

**Version constant question.** Phase 7A reads `search.js`'s version constant for `extension_version`. compare.html doesn't have access to that — it's a separate page, separate execution context. Three options:

- **A.** Hardcode a `COMPARE_VERSION` constant at top of compare.html (e.g. `'compare-2026-05-17'`). Bump manually on changes.
- **B.** Read from the loaded comparison's payload — items came from a specific search.js version, and that version could be included in the share payload. But it isn't today. Adding it requires a search.js change, which is out of 8A scope.
- **C.** Send a placeholder string like `'compare.html'` and accept that we won't know which compare.html version sent the report.

**Recommendation: A.** Add `const COMPARE_VERSION = 'compare-0.6.2.0';` at the top of compare.html (matching the current search.js minor version it's compatible with). Manual bump per session. Same string goes in the `extension_version` field. We accept it's loose; better than placeholder C, and doesn't require a search.js change like B.

**CONFIRM with Melissa** before coding this part. Loose version tracking on compare.html is a long-running choice with implications later. If she has a strong opinion go that way.

### 3.5 Submit, success, failure — match Phase 7A

- POST to Supabase `bug_reports` REST endpoint. Same auth pattern as compare.html's existing `saveComparison()`. Reuse the constants `SUPABASE_URL` and `SUPABASE_KEY` already at the top of compare.html.
- Success: replace form contents with "Thanks — report sent." Auto-close after 2 seconds.
- Failure: show "Couldn't send report. Try again?" with a Retry button + Cancel link. **Preserve the user's notes through retry.**
- No telemetry gate. Bug reports always send.

### 3.6 Scope guard for bug reporting

**In scope:**
- Adding the entry point (⋯ button + popover per Option B).
- Overlay form, form handlers, Supabase POST.
- Identical category list, transparency note, and field schema to Phase 7A.

**Out of scope:**
- Changing anything about Phase 7A's panel-side bug reporting.
- Adding new categories.
- Editing the `bug_reports` Supabase schema.
- Adding bug reporting to the share flow, action bar, or anywhere except the row entry point.

---

## 4. Part 2 — Roadmap compare.html bugs

Eight items from the Roadmap's "Known issues / needs testing" section that touch compare.html. Seven share a root cause; one is different. All should be fixable in 8A.

### 4.1 Root cause for items 4.1.1 – 4.1.7

Items 4.1.1 through 4.1.7 share a root cause: **old shared comparisons saved before a given search.js version don't carry the payload field that newer compare.html code expects.** When compare.html loads a row missing a field, the resulting cell renders empty, `undefined`, or breaks the layout.

Fix shape for all of them: **detect missing field, render graceful fallback.** Either a muted "—" or, where the column makes more sense empty than as "—", just an empty cell with no error. Prefer "—" for consistency with existing missing-value treatment (search compare.html for current `na()` helper at line 604 — it already exists and is the right pattern).

Note for Melissa from this brief: she is probably the only person who has shared compare links to date, so the risk of breaking a real user is small. Still worth doing now because (a) the fix is mechanical, (b) doing it now means compare.html stops being a "fragile if your link is old" surface forever, and (c) it's smaller now than it will be later.

### 4.1.1 "Amazon search" link only works for comparisons after v0.6.1.14

**Symptom:** compare.html has an "Amazon search" link somewhere (back to the original search). Old comparisons don't have the `searchTerm` field. Link breaks.

**Investigation needed:** locate the "Amazon search" link in compare.html. Verify whether it's gated on `currentSearchTerm` being non-empty. Audit fallback path.

**Fix:** if `currentSearchTerm` is missing or empty, hide the link entirely (don't render a broken one). Don't show a placeholder.

### 4.1.2 Delivery time only correct after v0.6.1.17

**Symptom:** comparisons saved with v0.6.1.16 or earlier carry incorrect delivery time data.

**Fix:** detect, fall back to "—". You'll need to identify the field(s) involved. Check compare.html's delivery column rendering and look for what's expected vs. what older payloads have.

### 4.1.3 Thumbnails only populated after v0.6.1.16

**Symptom:** old comparisons have no thumbnail field.

**Fix:** if thumbnail URL is missing or empty, render a small muted placeholder (a grey box, or the existing thumbnail cell with no image — your call, lean placeholder).

### 4.1.4 Paid delivery only after v0.6.1.27

**Same shape as 4.1.2.** Detect missing, fall back to "—".

### 4.1.5 `isSnap` only after v0.6.1.28

**Symptom:** SNAP column is empty/falsy on old comparisons.

**Fix:** show "—" (or empty) rather than a misleading "no" badge. The current rendering may already do this; verify.

### 4.1.6 `ppuNote` only after v0.6.1.29

**Symptom:** PPU explanation tooltip/popover is empty on old comparisons.

**Fix:** if `ppuNote` (the system-generated PPU explanation, not the user's note — see Notes_Design.md §5) is missing, suppress the tooltip rather than show an empty one.

### 4.1.7 `isFsaHsa` / `isClimatePledge` / `isSmallBusiness` only after v0.6.1.34

**Same shape as 4.1.5.** Missing → "—" or empty, not a misleading negative.

### 4.1.8 Amazon Basics brand column shows "—"

**Different root cause.** This isn't a missing-payload issue. The brand is being detected as `"Amazon"` (truncated from "Amazon Basics") in `search.js`'s `scrapeBrand()`, then `compare.html`'s `isAmazonBrand()` filter or render path may be treating "Amazon" as a special case that suppresses the cell.

**This is a Phase 9 problem upstream (brand detection overhaul).** The compare-side fix for 8A is minimal:

- Confirm compare.html is rendering whatever the payload says, even if the payload says "Amazon".
- If compare.html has special-case logic that suppresses "Amazon" or short brands, **remove that suppression.** The fix for "Amazon Basics" lives in search.js's slug-parsing strategy, landing in Phase 9. Compare's job is just to render the brand it was sent.

**Investigation step:** grep compare.html for `isAmazonBrand` and trace whether there's a render path that suppresses brand display for known-Amazon brands. There appears to be (search returned a function at line 798). Determine whether it suppresses *display* or just filters; it should only do the latter.

**CONFIRM with Melissa** if you find display-suppression logic. Removing it might surface other items currently rendering as empty.

### 4.2 Testing the bug fixes

Melissa has shared a small number of old compare links. **Ask her at session start which IDs to test against.** Likely candidates: id=72 (googly eyes — known old, mentioned in TODO comments), id=73 (laundry pods, post-Phase-7B), id=74 (laptops, post-Phase-7B). The age spread should cover most of the missing-field cases.

If id=72 turns out to be too old to be useful (e.g. has no thumbnails, no delivery time, no SNAP), great — it confirms the graceful-fallback fixes work.

---

## 5. Part 3 — CSS variable rename

### 5.1 Why

The Chat 66 palette migration moved compare.html from indigo to coral+slate. The hex values changed. The CSS variable names did not. Today the variable names are:

```css
:root {
  --cream:   #fef2f0;    /* 10 — lightest indigo, background */
  --navy:    #f25d4e;    /* 1  — deep indigo, headers & nav */
  --teal:    #c2362a;    /* 2  — medium indigo, links & buttons */
  --teal-lt: #fcc8c3;    /* 8  — light indigo, pills */
  --gold:    #BDB96A;    /* gold — star ratings */
  --muted:   #64748b;    /* muted indigo */
  --border:  #e2e8f0;    /* 7  — indigo border */
  --red:     #c94b2e;
  --green:   #D4920A;    /* amber — best value */
}
```

The names lie. `--navy` is coral. `--teal` is deep coral. The comments still describe indigo. Privacy.html had the same problem; Phase 7B cleaned it up. Compare.html should follow the same playbook.

### 5.2 Rename map

Mirror the rename approach used in Phase 7B for privacy.html — pull the variable names from there if needed. If 7B's cleanup didn't establish a canonical naming, propose this:

| Old | New | Hex |
|---|---|---|
| `--cream` | `--bg-cream` | `#fef2f0` |
| `--navy` | `--coral` | `#f25d4e` |
| `--teal` | `--coral-deep` | `#c2362a` |
| `--teal-lt` | `--coral-light` | `#fcc8c3` |
| `--gold` | `--gold` *(unchanged — name still accurate)* | `#BDB96A` |
| `--muted` | `--muted` *(unchanged — name still accurate)* | `#64748b` |
| `--border` | `--border` *(unchanged — name still accurate)* | `#e2e8f0` |
| `--red` | `--red` *(unchanged — name still accurate)* | `#c94b2e` |
| `--green` | `--amber` | `#D4920A` |

Update all comments to match the actual hex values.

**Implementation:** find-and-replace each `var(--cream)` → `var(--bg-cream)`, etc., across the embedded `<style>` block in compare.html. Verify no broken references.

**CONFIRM with Melissa** if Phase 7B used different names. The 7B names win; we want consistency across pages.

### 5.3 Scope guard

**In scope:** variable rename only.

**Out of scope:** changing any hex values, adjusting any color usage, redesigning any component. This is a pure refactor with zero visual diff.

---

## 6. Out of scope for 8A

Do not touch these. If anything seems to touch them, stop and confirm.

- **Notes implementation** (Notes_Design.md decisions) — that's Phase 8B.
- **The dead `AU_UPDATE_NOTE` send at compare.html:1629** — leave it alone. Phase 8B will rebuild the notes wiring per §3.3 storage-as-bus.
- **Brand detection logic** — Phase 9.
- **search.js edits** — none in 8A. Read-only for pattern-matching the Phase 7A bug report code.
- **styles.css** — not a compare.html dependency.
- **Logging on compare.html** — deferred per Roadmap.
- **Welcome.html / index.html / privacy.html** — Phase 7B closed those.

---

## 7. Testing checklist

Stop and confirm with Melissa as the session progresses, not all at the end.

### 7.1 Bug reporting

1. Entry point is reachable on every row (confirm Option B's ⋯ button or whichever option locked).
2. Click opens overlay. Form renders with all 5 categories, transparency note, both buttons.
3. Item title shows truncated to 60 chars + "…" for long titles.
4. Cancel closes overlay, no data sent, no Supabase row.
5. Submit with valid form: POST succeeds, "Thanks — report sent" appears, auto-closes after 2 seconds.
6. Submit with notes textarea empty: succeeds, notes field is empty string in DB.
7. Force a failure (offline, or block Supabase URL in DevTools): "Couldn't send report" appears with Retry. User's notes are preserved on Retry.
8. Verify Supabase row: all 11 fields populated, category is snake_case, `session_id` is the same UUID across multiple reports in the same page load.
9. Open compare.html a second time (fresh page load): new `session_id` is generated.

### 7.2 Old-link bug fixes

Run against each of the test links Melissa provides at session start.

1. "Amazon search" link: present and works on new comparisons; absent (not broken) on old comparisons that lack `searchTerm`.
2. Delivery time: shows real data on new links; "—" on old.
3. Thumbnails: show on new; placeholder or muted cell on old.
4. Paid delivery: shows on new; "—" on old.
5. SNAP / FSA-HSA / Climate Pledge / Small Business: show badge on new where applicable; empty or "—" on old. **Crucially: not a misleading "no" badge.**
6. PPU explanation tooltip: appears on new; suppressed entirely on old (not an empty tooltip).
7. Amazon Basics brand: confirm whatever the payload says renders (after the suppression-logic check in §4.1.8).

### 7.3 CSS rename

1. Visual diff: zero. Take a before/after screenshot of compare.html in any state — they should be pixel-identical.
2. DevTools: no broken `var(--X)` references (red strikethroughs in computed styles).
3. Sanity-grep the file: zero occurrences of the old variable names anywhere except the `:root` block (which has the new names).

### 7.4 Regression

1. Existing share flow still works (save + load round-trip).
2. Existing filter/sort/column-toggle behavior unchanged.
3. Action bar still appears/disappears with checked items.
4. Resizable columns still resize.
5. Sticky scrollbar still syncs.

---

## 8. End-of-session deliverables

**Documents to produce at session end (Phase 8A is mid-bundle; full bundle close is at end of 8B):**

- `Handover_Chat[N].md` — what happened, files pushed, open items.
- `changelog_entry_chat[N].md` — what was delivered, key findings, decisions made or carried forward.

**Files to present for download:**

- `compare.html` — modified per §3, §4, §5.

**GitHub commit message:** suggest one at session end.

**Push reminder:** remind Melissa to push to GitHub and update Claude Project docs after the push.

**Skip until end of 8B (bundle close):**

- Roadmap update
- Project Briefing update

The mid-bundle doc cadence is the same as Phase 7A → 7B. Reduces end-of-session doc overhead.

---

## 9. Decisions Sonnet must CONFIRM with Melissa before coding

1. **§3.2** — Entry point for bug reporting on compare.html. Recommendation: Option B (per-row ⋯ button). Other options exist; let her choose.
2. **§3.4** — Version tracking on compare.html. Recommendation: Option A (hardcoded `COMPARE_VERSION` constant).
3. **§4.1.8** — If display-suppression logic is found in `isAmazonBrand` render path, confirm removing it is acceptable.
4. **§5.2** — Variable rename naming. If Phase 7B established canonical names for privacy.html, use those instead. Confirm.
5. **§4.2** — Which old compare link IDs to test against.

---

*End of brief.*
