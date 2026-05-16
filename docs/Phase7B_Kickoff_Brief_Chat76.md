# Phase 7B — Kickoff Brief (Website)
*For Sonnet coding session. Produced in Chat 76 (Opus planning). Runs after Phase 7A is complete and pushed.*

---

## Ground rules for this session

- Confirm before coding. Align with Melissa on what we're building before touching any files.
- If a real design question comes up (scope, defaults, user-facing copy decisions) — stop, flag it, return to Opus. Do not decide unilaterally.
- Melissa's wording is Melissa's wording. For anything user-facing, use her exact words. Suggestions welcome but must be flagged and approved.
- Code files are not in this project. Melissa uploads fresh from GitHub at session start as actual file uploads. Confirm version string before editing.
- If files come through as document blocks rather than actual file uploads, stop and ask Melissa to re-attach.
- Rollback rule: 3 failed fix attempts on a single item = stop, revert, return to Opus.

---

## What Phase 7B is

Website-only session: welcome.html copy rewrite + index.html pass + privacy.html pass.

Phase 7A (extension fixes + bug reporting tool) must be complete and pushed before starting this session. Phase 7B references the bug reporting tool in welcome.html copy and adds documentation of the `bug_reports` Supabase table in privacy.html.

---

## Files touched in this session

- `welcome.html`
- `index.html`
- `privacy.html`

That's it. Do not touch extension files (search.js, styles.css, manifest.json, etc.) in this session.

---

## End-of-session documents — bundle close

Phase 7B is the end of the Phase 7 bundle. **All four documents update at end of session:**
1. Handover
2. Changelog
3. **Project_Briefing_Chat[N].md** — PART TWO (volatile state) always; PART ONE only if something changed
4. **Roadmap_Chat[N].md** — phase boxes checked, next-session priorities updated, known issues updated

---

## Part 1 — welcome.html copy changes

All changes are copy only. Do not restructure the page layout.

All copy below is either Melissa's exact wording or marked SUGGESTED COPY. SUGGESTED COPY must be flagged as `<!-- SUGGESTED COPY: ... -->` in the file. Melissa reviews all SUGGESTED COPY before push.

### 1a. 02 · Narrow card

Remove the line "Cut through 60 results to the 6 you want." entirely.

Replace card body with:

```
Keyword filter

Boolean search that actually works. AND, OR, NOT, quoted phrases, wildcards.

[examples]
```

For the `[examples]` block: insert 2–3 short inline examples as SUGGESTED COPY for Melissa review. Starting suggestions to flag for her:

```html
<!-- SUGGESTED COPY: Boolean search examples for 02 Narrow card:
  unscented AND pods
  "fragrance free" -sheet*
  lavender OR eucalyptus
-->
```

### 1b. 03 · Decide card

Replace card body with Melissa's exact wording:

```
Compare side by side

Send some or all of the results to the full comparison table. There you can further sort, filter, annotate and then share your shortlist in a full-page table instead of the extension panel.
```

This is final copy. Do not flag as SUGGESTED COPY.

### 1c. Brand controls section

Current copy contains "Brand controls live in a menu now" — the word "now" is wrong (almost no one saw the previous version). Reframe entirely.

Replace the existing brand controls section with this (flagged as SUGGESTED COPY for Melissa review):

```html
<!-- SUGGESTED COPY:
We try to identify and filter out garbage brand names — the kind of dropship junk that clutters Amazon results.
Click the ⋯ next to any brand name to always show or always hide it across every search.

This is still in active development. If a brand slips through that shouldn't, or gets filtered when it shouldn't —
let us know. The ⋯ menu now also has a "Report an issue" option that sends us the details.
-->
```

Flag entire section as SUGGESTED COPY.

### 1d. Wizard screen 2 — "As Amazon listed" description

Existing copy: *"'As Amazon listed' keeps Amazon's original order — useful when you're looking for a specific product."*

This is already flagged as SUGGESTED COPY in welcome.html. Leave the flag in place. Melissa reviews before push. **Do not change the control behavior.**

### 1e. Wizard screen 3 — quality thresholds hint

Existing copy: *"Most users start with 4★ or better and at least 50 reviews. These apply automatically to every search — you can override them per-search anytime."*

This is already flagged as SUGGESTED COPY in welcome.html. Leave the flag in place. Melissa reviews before push. **Do not change the control behavior.**

### 1f. Alpha/development notice — new section

Add a new section to the welcome page main content, positioned **before the wizard CTA** ("Get started" / "Skip and start shopping" buttons). Not inside the wizard.

```html
<!-- SUGGESTED COPY:
Heading: "Help us make it actually useful"
Body: Actually Useful is in active testing. Unit detection and price-per-unit math especially will still have
problems we haven't caught yet — and we'd love your help finding them. If something looks wrong on a result,
click the ⋯ next to the brand name and choose "Report an issue".
-->
```

Flag as SUGGESTED COPY. Style consistent with other welcome page sections.

---

## Part 2 — index.html pass

### 2a. Palette consistency

Audit the file for any colors not matching the coral + slate palette (§3 of Panel_Redesign_Spec.md):
- Primary: `#f25d4e`
- Primary deep: `#c2362a`
- Surface accent: `#fef2f0`
- Background: `#f8fafc`
- Inner divider: `#e2e8f0`
- Border: `#cbd5e1`
- Primary text: `#1e293b`
- Muted text: `#64748b`

Confirm all colors in the file are from this palette (or are appropriate exceptions — Amazon orange in any screenshot, etc.). Flag any non-palette colors for Melissa decision before changing.

### 2b. Sample search links — add laundry pods and laptop

Existing index.html has sample search links. Add:
- id=73 → laundry pods
- id=74 → laptop

**Before adding**, view the existing sample link block in index.html and confirm the URL structure pattern. The pattern is likely `actuallyuseful.net/compare.html?id=<N>` based on how compare.html loads via `?id=` (see Project_Briefing PART ONE §7).

If the structure is unclear, **stop and ask Melissa** — do not guess.

### 2c. Old screenshot — flag, don't replace

The screenshot on index.html is outdated (pre-Phase 6 redesign).

**Do not attempt to generate or replace the screenshot.** Add an HTML comment near the `<img>` tag flagging it for Melissa:

```html
<!-- TODO: Screenshot is pre-Phase 6 redesign. Melissa to provide updated screenshot. -->
```

Confirm to Melissa in the session that the comment is in place and remind her to swap the image file separately.

### 2d. Affiliate disclosure

Confirm the standard affiliate disclosure is present on index.html:

> *"This site contains affiliate links. If you click through and make a purchase, I may earn a commission at no additional cost to you."*

If missing, add it. Standard placement: footer area.

---

## Part 3 — privacy.html pass

### 3a. Palette consistency

Same palette audit as index.html. Flag any non-palette colors for Melissa.

### 3b. Content review — current data practices

Read privacy.html line by line. Confirm it accurately reflects:

- **Supabase comparisons table** — already documented (should be)
- **Supabase bug_reports table — NEW. Must be added.** Bug reports are sent when a user clicks "Report an issue" on a result card in the extension. Data sent: item details (URL, ASIN, price, PPU, raw data) + user notes. No personal info. Sent regardless of telemetry opt-out (active user consent via the form).
- **Telemetry opt-out** — confirm explained correctly
- **No personal data collected** — confirm stated clearly

**Bug reports section copy** (flagged as SUGGESTED COPY):

```html
<!-- SUGGESTED COPY:
"Bug reports" section:
When you click "Report an issue" on a result card in the Actually Useful extension, the extension sends us:
- The Amazon search URL you were on
- The item's ASIN, title, price, and unit information
- The raw data Actually Useful extracted from that listing
- Any notes you choose to add
- The extension version

This is separate from anonymous usage data (telemetry). Bug reports are sent only when you actively choose
to submit one, regardless of your telemetry setting. We use these reports to find and fix problems with
unit detection, price-per-unit math, brand identification, and filtering.
-->
```

### 3c. Affiliate disclosure

Confirm affiliate disclosure is present. Same text as index.html. If missing, add it.

---

## Open design conversations — out of scope for 7B

Do not touch these. If anything seems to touch them, stop and confirm with Melissa.

- Welcome page full settings — design session required
- compare.html structural pass — Phase 8
- Bug reporting on compare.html — Phase 8

---

## Testing checklist (before push)

- [ ] welcome.html — page renders, all sections visible, layout intact
- [ ] welcome.html — 02 Narrow card shows new copy, no "Cut through 60 results" line
- [ ] welcome.html — 03 Decide card shows Melissa's exact copy
- [ ] welcome.html — brand controls section reframed, no "now" wording
- [ ] welcome.html — alpha/dev notice section appears before wizard CTA
- [ ] welcome.html — wizard 4 screens still work end-to-end
- [ ] welcome.html — privacy toggle still writes to storage
- [ ] welcome.html — auto-open on install (uninstall + reinstall test profile)
- [ ] index.html — palette consistent, no non-palette colors
- [ ] index.html — laundry pods (id=73) and laptop (id=74) sample links added and clickable
- [ ] index.html — old-screenshot TODO comment in place
- [ ] index.html — affiliate disclosure present
- [ ] privacy.html — palette consistent
- [ ] privacy.html — bug_reports table documented in a Bug reports section
- [ ] privacy.html — affiliate disclosure present
- [ ] All SUGGESTED COPY blocks flagged in HTML comments for Melissa's pre-push review

---

## End-of-session checklist (Sonnet)

This is bundle close. **All four documents update.**

1. All changed files presented for download (`welcome.html`, `index.html`, `privacy.html`).
2. GitHub commit message suggested.
3. Push reminder given.
4. **Handover + Changelog + Project_Briefing_Chat[N].md + Roadmap_Chat[N].md** produced as complete files.
5. Remind Melissa to update all four documents in the Claude Project after the push.

---

## Session opener for Phase 7B

> Phase 7B coding session. Phase 7A complete and pushed. Kickoff brief: Phase7B_Kickoff_Brief_Chat76.md. Upload fresh welcome.html, index.html, privacy.html from GitHub. [Paste this brief.]

---

*End of Phase 7B kickoff brief.*
