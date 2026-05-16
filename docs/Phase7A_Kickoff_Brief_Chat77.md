# Phase 7A Kickoff Brief — Chat 77 Revision

*Replaces Phase7A_Kickoff_Brief_Chat76.md. Use this one.*

*May 16, 2026 — for the next Sonnet coding session.*

---

## Read first

1. **Handover_Chat77.md** — what happened, what's done, what's left.
2. **Panel_Redesign_Spec.md** — the design source of truth. Follow this religiously. Two sections are stale (flagged in handover); ignore them and follow this brief instead for those areas.
3. This brief.

---

## Scope summary

Two tasks. Both small.

1. **Strip the broken brand hint.** Code exists in the uploaded files but is broken by design. Remove it cleanly.
2. **Move bug reporting from the `⋯` menu to a footer link.** Add new "select an item to report" interaction.

Everything else for Phase 7A was already coded in the previous session. Don't re-do that work. Verify it's intact after your changes.

---

## What's already done — leave intact

The uploaded `search.js` and `styles.css` contain the following completed work. **Do not touch unless your changes interact with these areas.**

- **Version:** search.js is at v0.6.2.0 (header comment, line 1). Leave unchanged.
- **Sponsored items move to end:** `sponDemotedHtml` bucket, routes `sponDem` items there, appends at bottom with grey divider. Check that after your changes this still works.
- **Footer link CSS:** all four footer links (`#ppu-feedback`, `#ppu-coffee`, `#ppu-blocklist-link`, `#ppu-settings-link`) are normalized to 11px / `#c2362a` / no underline at rest / underline on hover. Your new "Report an issue" link must match this exact style.
- **Keyword hint selectable:** `.ppu-kw-hint` has `user-select:text; cursor:text`. Leave.
- **Unit pill size reduction:** Leave.
- **Slider tick contrast:** Leave.
- **Brand name clickable:** `.ppu-brand-name` has a click listener that opens the same popover as `⋯`. The `⋯` popover currently has FOUR items (Always show / Always hide / [bug report]). After your changes it must have THREE items (the bug report item goes away).
- **Sponsored divider CSS:** `.ppu-sponsored-divider` rule in styles.css. Leave.
- **Bug report overlay form + Supabase POST:** `openBugReportOverlay(item)` and `submitBugReport()` functions stay exactly as they are. Only the entry point changes.

---

## Task 1 — Strip the broken brand hint

### Why

The strip + tooltip pattern from Panel_Redesign_Spec.md §8.3 is being abandoned. Don't try to fix it. Remove all code for it cleanly.

### Files affected

**search.js:**

1. **Remove the brand hint IIFE.** It starts with a comment block `// ── Phase 6 — First-search brand-controls hint ────` (around line 4725). It ends with `})();` followed by a blank line, then the `catch(err)` block. Remove everything from the comment block down to and including `})();`. Leave the `catch(err)` and everything after it.

2. **Remove the `dismissBrandHint` placeholder.** Just before the `render();` call (around line 4592–4594), there are these three lines:
   ```
   // dismissBrandHint is declared here in the enclosing scope so render()'s brand hint
   // re-injection can reference it. Overwritten by the IIFE below when hint is active.
   var dismissBrandHint = function(){};
   ```
   Remove all three lines.

3. **Remove the hint re-injection from `render()`.** Inside `render()`, after `listEl.innerHTML = html;`, there's a block that starts with the comment `// Re-inject brand hint if not yet dismissed — lives in #ppu-hint-slot above the scroll area` and continues for about 25 lines, guarded by `if(!hasSeenBrandHint){...}`. Remove the entire block.

4. **Remove the `#ppu-hint-slot` div from panel HTML.** Inside `buildPanel()`, find `'<div id="ppu-hint-slot"></div>'+` (just before the `<div id="ppu-scroll-area">` line) and remove it.

5. **Keep `hasSeenBrandHint` variable, `auHasSeenBrandHint` storage key, and `loadPhase6Flags`.** Harmless. May be reused if Pattern A+B reuses the flag.

**styles.css:**

1. **Remove all brand hint CSS rules.** Find the section starting with `#ppu-brand-hint-inline {` (around line 148). Remove this rule and every following rule prefixed `.ppu-brand-hint-*`, plus `#ppu-brand-hint-tooltip` and its arrow `::after` rule, plus `.ppu-brand-hint-tip-gotit` rules, plus `.ppu-brand-menu-btn.ppu-brand-hint-highlighted` rule. Stop when you hit a rule that's NOT brand-hint-related (the next section is usually `/* ── Keyword filter row ──────` or similar).

2. **Remove `#ppu-hint-slot` rule.** Find `#ppu-hint-slot     { flex-shrink:0;background:var(--au-surface,#fff);overflow:hidden; }` near the top of the file (close to `#ppu-scroll-area`). Remove it.

### Verification after Task 1

- No grep hit for `brand-hint`, `brandHint`, `BrandHint`, `dismissBrand`, `hint-slot`, `ppu-hint-slot` in search.js EXCEPT: the `hasSeenBrandHint` variable, `auHasSeenBrandHint` storage key, and the load function. Those stay.
- No grep hit for `brand-hint` or `hint-slot` in styles.css.
- File still loads in DevTools without errors.
- Open Amazon search — no hint appears, no errors in console.

---

## Task 2 — Move bug reporting to a footer link

### Why

The `⋯` menu is for brand rules. The bug report is about the listing's data, not the brand. They're separate concerns.

### Sub-task 2a — Remove bug report from the `⋯` popover

**search.js:**

Inside `openBrandPopover(btn)`, find the block that creates `reportBtn` (the "Report an issue with this item" button). It looks like:

```javascript
// 4th option — bug report
var reportBtn=document.createElement('button');
reportBtn.type='button';
reportBtn.className='ppu-brand-popover-item ppu-brand-popover-item--report';
reportBtn.setAttribute('role','menuitem');
reportBtn.textContent='Report an issue with this item';
reportBtn.addEventListener('click',function(e){
  e.stopPropagation();
  closeBrandPopover();
  var row=btn.closest('.ppu-row');
  var asin=row?row.getAttribute('data-asin'):null;
  var item=asin?allData.find(function(d){return d.asin===asin;}):null;
  if(item) openBugReportOverlay(item);
});
pop.appendChild(reportBtn);
```

Remove this entire block.

**search.js inline CSS (in the style block around line 2013):**

Remove these two lines:
```
'.ppu-brand-popover-item--report{border-top:1px solid #f3f4f6;margin-top:2px;color:#6b7280;}' +
'.ppu-brand-popover-item--report:hover,.ppu-brand-popover-item--report:focus{background:#fef2f0;color:#c2362a;}' +
```

### Sub-task 2b — Add "Report an issue" footer link

**search.js:**

Find the footer links HTML in `buildPanel()`. Currently it's four links: `#ppu-feedback`, `#ppu-coffee`, `#ppu-blocklist-link`, `#ppu-settings-link`. Add a fifth between `#ppu-blocklist-link` and `#ppu-settings-link`:

```javascript
'<span id="ppu-report-link">Report an issue</span>'+
```

Style: use the same pattern as `#ppu-blocklist-link` and `#ppu-settings-link` (no inline styles — CSS handles it).

**styles.css:**

Add a CSS rule for `#ppu-report-link` matching the pattern of the other footer links:

```css
#ppu-report-link {
  font-size:11px;color:#c2362a;font-weight:400;white-space:nowrap;
  cursor:pointer;transition:color 0.15s;text-decoration:none;
}
#ppu-report-link:hover { color:#a02820;text-decoration:underline; }
```

Place it next to the other footer-link rules.

### Sub-task 2c — "Click an item to report" interaction

**search.js — add a new function and wiring:**

When the user clicks `#ppu-report-link`, the panel enters "report mode":

- A new state variable `reportMode = false` at the top of `buildPanel()` scope (near other state vars)
- A banner div is inserted at the top of `#ppu-scroll-area` (above the shortlist bar OR above the high-noise banner — your call, whichever is cleanest) with text: `<span>Click an item to report an issue.</span> <button id="ppu-report-cancel">Cancel</button>`
- All `.ppu-row` elements get a class `report-mode-target` while in report mode
- CSS for `.report-mode-target` adds an inset coral outline: `box-shadow: inset 0 0 0 2px #fcc8c3;` and `cursor: pointer`
- CSS for `.report-mode-target:hover` darkens the outline: `box-shadow: inset 0 0 0 2px #c2362a;`
- Clicking any `.ppu-row` in report mode:
  1. Extracts the ASIN from `data-asin`
  2. Looks up the item from `allData`
  3. Exits report mode (remove banner, remove class from all cards)
  4. Calls `openBugReportOverlay(item)` — this is the existing function, unchanged
- Clicking `#ppu-report-cancel` exits report mode without opening the overlay
- Pressing ESC exits report mode without opening the overlay
- Exiting report mode: remove the banner, remove `.report-mode-target` class from all cards

**Important interaction details:**

- While in report mode, normal card interactions (checkbox, brand name click, `⋯` click) should be suppressed. The click handler at the row level should preventDefault/stopPropagation if `reportMode === true`.
- The banner should be sticky to the top of the scroll area so it's always visible.
- The banner has the same coral-warning visual treatment as other banners in the panel — use the existing surface accent (`var(--au-surface-accent)` or `#fef2f0`) with a coral border.

**Banner styling (suggested CSS — Melissa to confirm if she wants to change):**

```css
#ppu-report-banner {
  position:sticky;top:0;z-index:10;
  background:#fef2f0;border-bottom:1px solid #fcc8c3;
  padding:8px 14px;font-size:12px;color:#c2362a;
  display:flex;align-items:center;justify-content:space-between;gap:12px;
}
#ppu-report-cancel {
  background:none;border:none;color:#c2362a;font-size:12px;
  cursor:pointer;text-decoration:underline;padding:0;font-family:inherit;
}
#ppu-report-cancel:hover { color:#a02820; }
```

**Flag for Melissa:** the banner text "Click an item to report an issue." is a suggestion. She may want to tweak it. Use the suggested copy and flag it with a `<!-- SUGGESTED COPY -->` comment in the JS string so she sees it.

### Verification after Task 2

- `⋯` popover shows exactly two items: "Always show [brand]" and "Always hide [brand]"
- Footer shows five links in order: Give feedback · Buy me a coffee · My brand rules · Report an issue · Settings
- All five links match the same visual style
- Clicking "Report an issue" puts the panel in report mode (banner + outlined cards)
- Clicking a card opens the bug overlay for that item
- Clicking Cancel exits the mode
- Pressing ESC exits the mode
- Existing bug overlay still works exactly as before

---

## Rules — non-negotiable

These come from Melissa's preferences and the project's standing rules. Violating any of these is a failure.

1. **Follow Panel_Redesign_Spec.md.** It is the design source of truth. Don't improvise. If the spec doesn't say how something should look, use the closest existing pattern in the panel. Examples: footer links all match each other; banners all use the coral surface accent; buttons all use the existing button styles.

2. **Don't invent new colors, font sizes, or spacing tokens.** Use existing CSS variables and existing values. The palette is in §3 of the spec.

3. **Don't add new patterns when an existing pattern fits.** The bug report banner reuses the existing banner visual language. The report link reuses the existing footer link pattern. The card outline reuses coral surface accent.

4. **Don't change anything that isn't explicitly in this brief.** If you spot a bug, flag it for Melissa — don't fix it silently. If you think the spec is wrong, flag it — don't deviate silently.

5. **Don't add commentary, console.logs, or debug code in production.** Clean files only.

6. **All user-facing text uses Melissa's exact wording where given.** Anywhere this brief gives "SUGGESTED COPY," flag it for review with an HTML/JS comment so she sees it.

7. **Preserve all selectable text.** Hint text, notes, item titles — all must be selectable. This is a standing rule.

8. **Test mentally before writing.** Walk through each interaction: what does the user see, what happens on click, what happens on cancel, what happens on ESC. If any step is unclear, ask Melissa via the AskUserQuestion widget — don't guess.

---

## End-of-session checklist (your responsibility)

- [ ] Phase 7A coding complete per Tasks 1 and 2
- [ ] All carried-over completed work still intact
- [ ] Files presented for Melissa to download
- [ ] Updated Handover document (for next session)
- [ ] Updated Changelog entry
- [ ] Updated Roadmap (Phase 7A → done; Phase 7B → next)
- [ ] Updated Project Briefing (only if anything changed structurally)
- [ ] GitHub commit message suggested
- [ ] Push reminder given
- [ ] Reminder to update Claude Project docs after push

---

## Don't do these things

- Don't restore the brand hint in any form
- Don't add a third item to the `⋯` popover (it stays at two until "Hide this seller forever" is built later)
- Don't change the bug report overlay form, its CSS, its Supabase POST, or the success/error handling
- Don't bump the version
- Don't touch any file other than `search.js` and `styles.css`
- Don't update the Panel_Redesign_Spec.md (that's a separate, careful task)

---

*End of brief.*
