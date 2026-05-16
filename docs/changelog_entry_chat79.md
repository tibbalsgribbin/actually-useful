# Changelog — Chat 79 (Phase 7B complete)

*May 16, 2026 — Phase 7B, bundle close. Push after this session.*

---

## This session

Phase 7B complete. Website-only session: copy changes to welcome.html, sample links added to index.html, Bug reports section added to privacy.html. Phase 7 bundle is closed.

---

## Files changed

### welcome.html

- **02 Narrow card:** Removed "Cut through 60 results to the 6 you want." Body is now: "Boolean search that actually works. AND, OR, NOT, quoted phrases, wildcards." Boolean examples added as `<!-- SUGGESTED COPY -->` comment for Melissa to decide which to show inline.
- **03 Decide card:** Replaced with Melissa's exact wording: "Send some or all of the results to the full comparison table. There you can further sort, filter, annotate and then share your shortlist in a full-page table instead of the extension panel." (Final — not flagged as SUGGESTED COPY.)
- **Brand explainer section:** Full reframe. Heading changed from "Brand controls live in a menu now" to "Brand controls". Two-paragraph body, both flagged as `<!-- SUGGESTED COPY -->`. Bug reporting reference uses corrected wording (footer link, not ⋯ menu). Popover visual retains 3 items (including "Hide this seller (coming soon)") to signal roadmap; HTML comment added noting this is roadmap, not yet built.
- **Alpha/dev notice:** New section added before the CTA buttons, using `.prologue` class. Flagged as `<!-- SUGGESTED COPY -->`. Calls out active testing and the "Report an issue" footer link.

### index.html

- **Sample comparison links:** Added laundry pods (id=73) and laptops (id=74) links alongside existing id=72 googly eyes link.
- **Screenshot TODO:** Comment added above the compare links: "replace id=72 googly eyes screenshot/link with a more illustrative example once unit display is verified."

### privacy.html

- **CSS variable names:** Cleaned up stale `--navy`, `--teal`, `--teal-mid` names (left over from old palette naming). Hex values unchanged. Aliases kept for backward compatibility.
- **Bug reports section:** New `policy-section` added between "The comparison page" and "Affiliate links" sections. Flagged as `<!-- SUGGESTED COPY -->`. Documents the `bug_reports` Supabase table: what's sent, when, and why. Notes that bug reports send regardless of telemetry setting.

---

## Decisions / flags

- **id=73 and id=74 links are live.** Confirm these Supabase rows exist before pushing index.html, or revert to id=72 only.
- **Brief copy stale:** Phase7B_Kickoff_Brief_Chat76.md referenced "The ⋯ menu now also has a 'Report an issue' option" — corrected to footer link in the actual copy.
- **All SUGGESTED COPY blocks** on welcome.html require Melissa review before CWS push.

---

## No version bump

Website files do not carry version numbers. Extension files not touched.

---

## Deliverables

- `welcome.html` — updated
- `index.html` — updated
- `privacy.html` — updated
- `changelog_entry_chat79.md` — this file
- `Handover_Chat79.md` — produced
- `Project_Briefing_Chat79.md` — produced (bundle close)
- `Roadmap_Chat79.md` — produced (bundle close)

---

*End of changelog entry.*
