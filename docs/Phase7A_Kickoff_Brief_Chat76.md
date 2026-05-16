# Phase 7A — Kickoff Brief (Extension)
*For Sonnet coding session. Produced in Chat 76 (Opus planning).*

---

## Ground rules for this session

- Confirm before coding. Align with Melissa on what we're building before touching any files.
- If a real design question comes up (scope, defaults, user-facing copy decisions) — stop, flag it, return to Opus. Do not decide unilaterally.
- Melissa's wording is Melissa's wording. For anything user-facing, use her exact words. Suggestions welcome but must be flagged and approved.
- Code files are not in this project. Melissa uploads fresh from GitHub at session start as actual file uploads. Confirm version string before editing.
- If files come through as document blocks rather than actual file uploads, stop and ask Melissa to re-attach.
- All text in the extension interface must be selectable.
- CSS/JS consistency rule: when removing JS visibility toggling from an element, check and update the CSS baseline too.
- Rollback rule: 3 failed fix attempts on a single item = stop, revert, return to Opus.

---

## What Phase 7A is

Extension-only session. All extension fixes + new bug reporting tool.

Phase 7B (website work) is a separate later session — do not touch website files (welcome.html, index.html, privacy.html, compare.html) in this session.

---

## Files touched in this session

- `search.js`
- `styles.css`

That's it. If anything else needs touching, stop and confirm with Melissa.

---

## End-of-session documents

**This session produces Handover + Changelog only.** Briefing and Roadmap update at end of Phase 7B (end of bundle), not now. Do not produce them at the end of 7A.

---

## Version bump

Phase 7A is a substantial change set including a new feature (bug reporting tool). **Bump search.js to v0.6.2.0.** Update version string in the file header comment and in any version constant used internally.

---

## Pre-session setup — Melissa must do this before opening the Sonnet session

**Create the `bug_reports` table in Supabase.**

Steps:
1. Go to supabase.com and sign in.
2. Open the **Actually Useful / actually-useful** project.
3. Left sidebar → **Table Editor** → **New table**.
4. Name: `bug_reports`
5. Disable Row Level Security for now (same as the comparisons table).
6. Add these columns (in addition to default `id` and `created_at`):

| Column | Type | Notes |
|---|---|---|
| `session_id` | `text` | Random ID generated per page load |
| `search_url` | `text` | Current Amazon search URL |
| `asin` | `text` | ASIN of the reported item |
| `title` | `text` | Product title |
| `category` | `text` | One of: `unit_type`, `ppu_math`, `brand_wrong`, `brand_filtered`, `other` |
| `notes` | `text` | Optional user notes |
| `ppu` | `float8` | AU's calculated PPU |
| `ppu_unit` | `text` | Unit string (e.g. "oz", "ct") |
| `price` | `float8` | Item price |
| `raw_extract` | `text` | JSON.stringify of the item's full data object |
| `extension_version` | `text` | search.js version string |

7. Save the table.
8. Confirm to Sonnet that the table exists. The Supabase project URL and anon public key already used by compare.html are the same credentials — Sonnet should pattern-match the Supabase POST from existing compare.html code.

---

## Part 1 — Urgent extension fixes

### 1a. Ads not moving — functional bug

**Problem:** "Move ads to end" toggle greys out sponsored items but does not actually move them to the end of the rendered list.

**Fix:** When the toggle is on, sponsored items must be physically reordered to the bottom of the rendered list after all non-sponsored items. The visual grey treatment stays. The items move.

Check the `auDefaultMoveAdsToEnd` storage key and the sort/render logic in `search.js`. Confirm current behavior in DevTools before changing code.

---

### 1b. Brand hint timeout too short

**Problem:** Brand hint (inline note + tooltip) auto-dismisses after only a few seconds.

**Spec:** §8.3 Panel_Redesign_Spec.md — auto-dismiss is **30 seconds**.

**Fix:** Find the auto-dismiss timer in `search.js`, set to `30000`ms. Confirm all four dismiss paths still work: Got it button, ×, click any ⋯ menu, 30s auto.

---

### 1c. Footer link formatting inconsistency

**Problem:** Footer links inconsistent — font name, size, weight, underline treatment differ across the four links.

**Spec:** §5.9 Panel_Redesign_Spec.md — single row, deep coral (`#c2362a`), 11px, underline on hover only, no underline at rest. All links: Give feedback · Buy me a coffee · My brand rules (N) · Settings.

**Fix:** Audit footer link rules in `styles.css`. Make all four match: same font-family (inherit from panel base), 11px, same font-weight, deep coral color, underline on hover only.

---

### 1d. Keyword hint text not selectable

**Problem:** Keyword filter boolean hint text cannot be selected for copy/paste. Violates the standing selectable-text rule.

**Fix:** Find the keyword hint element in `search.js` HTML and `styles.css`. Remove any `user-select: none` (or `-webkit-user-select: none`, `-moz-user-select: none`) on the hint or its container. Verify text is selectable after fix.

---

## Part 2 — Extension improvements

### 2a. Unit pills — reduce size

**Problem:** Unit pills (oz · lb · g · kg · As listed) in footer status line too large.

**Fix:** CSS only. Reduce font-size, padding, and overall pill height in `styles.css`. Maintain readability. Maintain selectable text. Do not change pill logic, behavior, or which pills appear.

---

### 2b. Pages slider tick marks

**Problem:** Tick marks on the 1–7 pages slider hard to see.

**Fix:** In order of preference:
1. Increase tick mark contrast/size in CSS first.
2. If ticks alone aren't visible enough, add visible step labels (1, 2, 3, 4, 5, 6, 7) below the slider track.

**Stop and confirm with Melissa before adding labels** if CSS-only ticks aren't enough — this is a UX call she should make.

---

### 2c. Brand name clickable

**Problem:** Only the ⋯ button opens the brand options popover; the brand name text is not clickable.

**Fix:** Make the brand name text in each result card trigger the same popover that ⋯ triggers, on click. The ⋯ button stays. Add `cursor: pointer` on hover. Do not change the popover content or behavior.

---

## Part 3 — Bug reporting tool (new feature)

### Overview

Users can flag problems with a specific item directly from its result card. Entry point: the ⋯ menu on the card. Reports POST to the new Supabase `bug_reports` table.

### Entry point — ⋯ menu only

**No footer link. Card-only via the ⋯ menu.**

Add a new option to the brand options popover (the popover that opens when ⋯ is clicked on a card with a detected brand). Existing popover options: "Always show [brand]" / "Always hide [brand]" / "Hide this seller forever (future)". Add a fourth: **"Report an issue with this item"**.

**Edge case — cards without a detected brand:** the ⋯ button is currently hidden when no brand is detected. For this release, the bug reporting tool is therefore unavailable on those cards. This is acceptable for Phase 7A; revisit in Phase 8 if needed. Document this limitation in the changelog.

### Overlay form

When "Report an issue with this item" is clicked, an overlay opens **inside the panel** (not a new tab, not a browser popup). Overlay UI:

- Header: "Report an issue" + close × in top-right
- Item context line (read-only, muted): the product title (truncated if long, e.g. first 60 chars + "…")
- Category picker — radio buttons:
  - Unit type wrong
  - PPU math wrong
  - Brand wrong
  - Brand filtered incorrectly
  - Other
- Notes field — `<textarea>`, optional, short (3–4 rows)
- Transparency note (small muted text above the buttons): **"Submitting sends the item details (URL, ASIN, price, PPU, raw data) and your notes to Actually Useful. No personal info."**
- Buttons: "Send report" (primary, coral) + "Cancel" (link, deep coral)

Styling: match existing panel UI. Coral primary, slate text, surface accent for the overlay background.

### Behavior

**Category value mapping (UI → DB):**
- Unit type wrong → `unit_type`
- PPU math wrong → `ppu_math`
- Brand wrong → `brand_wrong`
- Brand filtered incorrectly → `brand_filtered`
- Other → `other`

**Snapshot built on submit:**
- `session_id` — generate once per page load via a JS-scope variable (e.g., `const sessionId = crypto.randomUUID();`), reuse for the page lifetime. Not persisted to storage.
- `search_url` — `window.location.href`
- `asin` — from the item object
- `title` — from the item object (full untruncated)
- `category` — DB value from the picker
- `notes` — textarea contents (empty string if blank)
- `ppu` — from the item object
- `ppu_unit` — from the item object
- `price` — from the item object
- `raw_extract` — `JSON.stringify(item)` — the full item object as AU has it internally
- `extension_version` — the current search.js version constant

**Submit:** POST to Supabase `bug_reports` REST endpoint using the same auth pattern as compare.html's comparisons POST. **Pattern-match the existing compare.html Supabase code** — do not reinvent the auth flow.

**No telemetry gate.** Bug reports are sent regardless of `au_telemetry_enabled` state. The user clicking Send is the consent. The transparency note on the form is the disclosure. (This is a deliberate Opus decision — bug reports are active user consent, distinct from passive telemetry.)

**Success:** Show "Thanks — report sent" in the overlay (replace the form contents with this message). Auto-close after 2 seconds.

**Failure (network error, Supabase error, etc.):** Show "Couldn't send report. Try again?" with a "Retry" button + "Cancel" link. Do not lose the user's notes — preserve them through retry.

---

## Open design conversations — out of scope for 7A

Do not touch these. If anything seems to touch them, stop and confirm with Melissa.

- Keyword filter hint verbosity — design session required
- "We show our working" banner — design session required
- Welcome page full settings — design session required
- Impossible Burger math — investigation session
- compare.html structural pass — Phase 8
- Bug reporting on compare.html — Phase 8

---

## Testing checklist (before push)

Stop and confirm each with Melissa as the session progresses, not all at the end.

- [ ] Move ads toggle — sponsored items physically move to bottom
- [ ] Brand hint timeout — 30s auto-dismiss confirmed; all four dismiss paths work
- [ ] Footer links — all four match in font/size/weight/color/underline behavior; new "Report an issue" is not in the footer (it's in the ⋯ menu)
- [ ] Keyword hint text — selectable (can highlight and copy)
- [ ] Unit pills — smaller, still readable, still selectable
- [ ] Pages slider — tick marks visible (or labels added per Melissa's call)
- [ ] Brand name — clickable, opens same popover as ⋯
- [ ] Bug report flow — happy path: open ⋯ → click report option → fill form → send → success message → auto-close
- [ ] Bug report flow — error path: simulate network error, retry preserves notes, cancel works
- [ ] Bug report data — verify row appears in Supabase with all fields populated correctly
- [ ] Bug report data — verify `raw_extract` is valid JSON
- [ ] Telemetry off, bug report still sends (deliberate behavior)
- [ ] Brand options popover — original three options (Always show / Always hide / Hide seller future) still work
- [ ] Version bump — search.js header reflects v0.6.2.0

---

## End-of-session checklist (Sonnet)

1. All changed files presented for download (`search.js`, `styles.css`).
2. GitHub commit message suggested.
3. Push reminder given.
4. **Handover + Changelog produced as complete files.** Briefing and Roadmap do NOT update at end of 7A — they update at end of 7B (bundle close).
5. Remind Melissa to update Handover and Changelog in the Claude Project after the push.

---

## Session opener for Phase 7A

> Phase 7A coding session. Kickoff brief: Phase7A_Kickoff_Brief_Chat76.md. Upload fresh search.js and styles.css from GitHub. [Paste this brief.]

---

*End of Phase 7A kickoff brief.*
