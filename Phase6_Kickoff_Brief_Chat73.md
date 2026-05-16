# Phase 6 Kickoff Brief — Panel Redesign

*For the Phase 6 coding session of the panel redesign. Hand this to Sonnet 4.6 at the start of the chat alongside Panel_Redesign_Spec.md, Handover_Chat74.md (from the close button session), and current code files (uploaded fresh from GitHub).*

*Source of truth: Panel_Redesign_Spec.md §6 + §8 + §10.2 + §10.3 (in the Claude Project). Existing mockups: `onboarding_mockup.html`, `first_search_hint_wireframe.html`. This brief is the scoped slice of those for one coding session, with additional decisions made during the Chat 73 Opus planning session.*

*Planned in: Chat 73 (Opus 4.7 planning session). Bundled with the close button session as Phase 6 (close button + onboarding). Phase 6 documents at end of THIS session cover both this and the close button session.*

---

## Note for Sonnet

This is a coding session. If a real design question comes up during this work — scope, defaults, user-facing copy, anything that wasn't already decided in the spec or this brief — **stop and tell Melissa to bring it back to Opus**. Don't make design decisions ad-hoc.

This session is the **second half** of the close button + Phase 6 bundle. The close button work shipped in the previous session (Chat 74). Verify it's working before adding Phase 6 layers on top.

---

## What we're building

Phase 6 of the panel redesign — **Onboarding refresh**. Four pieces:

1. **Welcome page rewrite** (`welcome.html`) — content matches Spec §8.1 + onboarding_mockup.html. Four-step framing: Step 0 prologue + Expand/Narrow/Decide cards + brand controls explainer + privacy/telemetry section + Personalize CTA.

2. **Personalize wizard** — 4 screens per Spec §8.2, inline on welcome.html below the welcome content. Skippable at every step. Persists to `chrome.storage.local`.

3. **First-search brand-controls hint** — inline note + tooltip per Spec §8.3 + first_search_hint_wireframe.html. Coral-warning surface. Shared `auHasSeenBrandHint` flag.

4. **New loading banner** (Spec §6) — first-time amber banner + subsequent thin coral progress strip. `auHasSeenLoadingBanner` flag. **Replaces** the existing workflow banner (at top of panel), which gets removed.

5. **Auto-open welcome.html on install** — `chrome.runtime.onInstalled` listener in `background.js`.

Phase 6 is the second half of the close button + Phase 6 bundle. End-of-bundle document updates (Changelog, Project_Briefing_Chat[N], Roadmap_Chat[N]) happen at the end of this session and cover BOTH the close button session and this one.

---

## Files in scope

**Extension:**
- `content/search.js` — first-search brand hint (inline note + tooltip), new loading banner system, REMOVE existing workflow banner, two new storage flags
- `content/styles.css` — loading banner styles, brand hint inline + tooltip styles, removal of workflow banner styles
- `background/background.js` — `chrome.runtime.onInstalled` listener that opens welcome.html in a new tab
- `manifest.json` — possibly bump for new permissions if needed (probably not — already has what we need from close button session)

**Website:**
- `welcome.html` — full content rewrite per §8.1 + wizard inline per §8.2
- `welcome.html` JavaScript — wizard state machine (4 screens, Back/Next/Skip), persistence to `chrome.storage.local` via the extension (NOT to website localStorage)

**Out of scope this phase:**
- All of Phase 7 (deferred — defined after Phase 6 ships)
- `compare.html`, `index.html`, `privacy.html` — no changes
- `core.js` — verify no impact (likely none)
- Weight unit logic, brand detection logic, keyword parser
- Logging payload

---

## Step 1 — Storage key audit (before any editing)

Same pattern as Phase 5 and the close button session. Grep all `chrome.storage.local` key reads/writes across `search.js`, `core.js`, and `background.js`. Report the full list.

**New keys this session:**

| Key | Type | Default | Purpose |
|---|---|---|---|
| `auHasSeenLoadingBanner` | boolean | `false` | First-time loading message shown |
| `auHasSeenBrandHint` | boolean | `false` | First-search brand controls hint dismissed |

**Existing key being removed:**
- `au-banner-dismissed` (localStorage, not chrome.storage.local) — the old workflow banner. Cleanup: the load/save logic goes away, but the key itself will linger in users' browsers. That's fine — no migration needed.

Confirm `auHasSeenLoadingBanner` and `auHasSeenBrandHint` are not already in use before adding.

---

## Step 2 — Website ↔ extension communication

This is the trickiest structural piece. **Read this whole section before writing any wizard code.**

The wizard lives on `welcome.html` (the website). Its settings need to persist into the extension's `chrome.storage.local`. The website cannot write to extension storage directly — content scripts can, but pages on the public web cannot.

**Mechanism:**
- `welcome.html` has a content script injected (via `manifest.json`'s `content_scripts` — verify this is already configured for actuallyuseful.net; if not, add it)
- Wizard JavaScript on welcome.html dispatches `CustomEvent`s like `au-wizard-save` with `{ key, value }` detail
- Content script listens for these events on the page and writes to `chrome.storage.local`
- This avoids any cross-origin shenanigans and keeps the wizard self-contained

**Alternative pattern:** wizard sends `chrome.runtime.sendMessage` if the extension's manifest includes welcome.html's origin in `externally_connectable`. If `externally_connectable` is already configured for actuallyuseful.net, use that — it's cleaner. If not, use the CustomEvent + content script pattern above.

**Sonnet to verify:** check manifest.json for `externally_connectable` and any existing content script configuration for actuallyuseful.net. Report findings to Melissa before choosing the pattern.

---

## Step 3 — Verify close button work

Quickly confirm close button (from Chat 74 session) is working before stacking Phase 6 on top. Open welcome page → won't exist yet, skip. Open Amazon search → click ×. Verify panel hides, toast appears (or doesn't, if already seen). Click toolbar icon → panel restores.

If anything is broken, stop and report to Melissa before proceeding with Phase 6.

---

## Step 4 — Loading banner (Spec §6)

### 4.1 Remove the existing workflow banner

The existing banner at the top of the panel (above keyword filter, dismissible, `au-banner-dismissed` localStorage) gets fully removed. Welcome page covers this education now.

- Remove the banner HTML injection from `buildPanel` (or wherever it's added)
- Remove the dismiss handler and the `au-banner-dismissed` localStorage check
- Remove the related CSS in styles.css (`.au-workflow-banner` or whatever it's called)
- Remove any "reset banner on Clear all" logic

### 4.2 Build the new loading banner

Per Spec §6, the loading banner appears **between the compare bar and the keyword filter section** when `pages > 1` and pages are being fetched. The slot is always reserved (stable footprint) — when no loading is happening, the slot is empty but takes up no height; when loading starts, content appears.

**First-time copy** (when `auHasSeenLoadingBanner` is falsy):

Background `#fef3c7`, text `#78350f`, 11px, spinner icon. Border-bottom matching amber border.

> ⟳ **Loading {N} pages of results** — this is what makes Actually Useful, you know, actually useful. About 8–12 seconds. You can start checking items as they appear.

Where `{N}` is the current `userDefaults.pages` value (or whatever the actual page count being loaded is).

**Subsequent-load copy** (when `auHasSeenLoadingBanner` is `true`):

Thin progress strip:
- Height: ~4px
- Background: `#fef3c7`
- Progress bar fills coral (`#f25d4e`) as pages load (e.g. 1/4 loaded = 25%)
- Tiny text inside the strip: "Loading {N} pages..." (10px, `#78350f`)
- When loading completes, the strip slides away (transition: opacity 200ms or transform: scaleX(0))
- Slot stays reserved (stable footprint)

**State transitions:**
- New search starts → strip reappears (resetting progress)
- Loading completes → strip slides away
- First-time message dismisses itself when loading completes, sets `auHasSeenLoadingBanner = true`
- First-time message has no manual dismiss button — it's tied to load completion

**Sonnet to identify:** where in the existing search.js the page-fetching logic lives. The loading banner state needs to be tied to that lifecycle. There's an existing pages slider that probably has some progress signal — check.

---

## Step 5 — First-search brand-controls hint (Spec §8.3 + wireframe)

Both surfaces appear together on the user's first search after install. Reference `first_search_hint_wireframe.html` for exact layout.

### 5.1 Inline note

**Location:** top of the results list, between the compare bar and the first result card. If a loading banner is present, the inline note goes below the loading banner.

**Style:** coral-warning surface (`#fef3c7` background, `#78350f` text, matching amber border-bottom). No icon, no emoji. Same visual language as the loading banner.

**Copy (locked from spec §8.3):**
> **Brand controls** — click the ⋯ next to any brand name to always show or always hide that brand. Manage your rules from [My brand rules] at the bottom.

"My brand rules" is a deep-coral underlined link that scrolls to / opens the existing My brand rules footer link's destination.

**Dismissal:** "Got it" button OR small × on the right. Either sets `auHasSeenBrandHint = true`.

### 5.2 Tooltip on first ⋯

**Location:** points at the first ⋯ icon on the first result card that has a detected brand (skip cards where brand is null/unknown).

**Visual:** the ⋯ itself gets highlighted — coral-warning surface background, coral border, pulsing animation (see wireframe CSS). Tooltip is dark (slate-700 background, white text) with a pointing arrow toward the ⋯.

**Copy (locked from spec §8.3):**
> **Always show or always hide this brand.** Your rule applies to every search until you change it.

**Dismissal:** "Got it" button on the tooltip. Sets `auHasSeenBrandHint = true`.

### 5.3 Shared dismissal logic

One flag, `auHasSeenBrandHint`, controls both surfaces.

**Sets to `true` when:**
- Either Got it button is clicked
- The inline note × is clicked
- The user actually clicks any ⋯ menu (even without dismissing the hints first — interacting with the feature counts as discovery)
- 30 seconds elapse from when both surfaces appeared

**Once `true`:** neither surface ever shows again. Both surfaces also disappear immediately if shown when the flag flips to true (e.g. if 30 seconds elapse with both visible, both fade out).

### 5.4 When the hints appear

Only on the user's first search where:
- `auHasSeenBrandHint` is falsy
- The current page has at least one result card with a detected brand (otherwise the tooltip has nothing to point at — show the inline note alone? Or skip both? **Decision: show the inline note alone if no brand-detected card exists. Tooltip is skipped silently. Flag still gets set when inline note is dismissed.**)
- Results have finished loading (don't show during loading state)

If the page has no detected brands at all (rare), the inline note alone is shown.

---

## Step 6 — Welcome page rewrite (Spec §8.1 + onboarding_mockup.html)

Full content rewrite of `welcome.html`. Use `onboarding_mockup.html` in the project as the reference design and layout — it's already coral + slate palette per Phase 1.

### 6.1 Content sections (top to bottom)

1. **Brand eyebrow** — small uppercase: "ACTUALLY USEFUL"

2. **Headline** — "Amazon, but actually useful." (italicized "actually useful" per mockup)

3. **Tagline** — one sentence describing what AU does. (Use existing tagline if there is one — Sonnet to check current welcome.html. If unclear, flag to Melissa.)

4. **Step 0 prologue** — coral-bordered callout above the feature cards. Copy from Spec §8.1:
   > **Step 0 — Start in Amazon's own sidebar.** Department, brand, price, Prime, 'ships from Amazon' — Amazon does these well. The more you narrow there, the more powerful Actually Useful's next three steps become.

5. **Three power feature cards** — Steps 1–3, one card each:
   - **01 · Expand — Load up to 7 pages.** *Amazon shows one page at a time. Actually Useful loads up to seven.*
   - **02 · Narrow — Keyword filter.** *Boolean search: AND, OR, NOT, quoted phrases, wildcards.*
   - **03 · Decide — Compare side by side.** *Check items, send to the comparison workspace.*

6. **Brand controls explainer** — small two-column section: text on left, visual on right (mockup uses an inline panel preview with ⋯ highlighted). Copy:
   > **Brand controls live in a menu now.** Click the ⋯ next to any brand name on a result to always show or always hide that brand. Manage all your rules from the My brand rules page in the panel footer.

7. **Privacy/telemetry section** — own labeled section. Header: "Privacy". Body explains what telemetry does. Toggle for "Share anonymous usage data" (default On per §7.4), plus link "Read full privacy policy →" pointing to `/privacy.html`. Copy from §7.4 + welcome-page-specific framing:
   > **Privacy.** Actually Useful sends anonymous usage data to help us improve — what searches happen, what filters get used, what errors occur. No personal info, no purchase history, no Amazon account details.
   >
   > [Toggle: Share anonymous usage data — default On]
   >
   > [Read full privacy policy →]

8. **CTAs** — primary "Get started" button that scrolls to the wizard. Secondary "Skip and start shopping" link that opens amazon.com in the same tab. Buttons styled per mockup.

### 6.2 Copy I'm flagging as suggestions (Melissa decides)

These are user-facing strings I'm proposing — flag in implementation as `<!-- SUGGESTED COPY: ... -->` HTML comments so Melissa can find them easily:

- The headline tagline (if existing welcome.html doesn't have one to keep)
- The "Boolean search: AND, OR, NOT..." subtitle on Step 02 — exact phrasing
- The Privacy section body — exact phrasing
- "Get started" and "Skip and start shopping" button text

Sonnet: do NOT change any copy that's explicitly locked in the spec (the Step 0 prologue, the feature card numbered titles, the brand controls hint copy). Those are Melissa's exact words. Flag only the new copy I'm proposing in this brief.

### 6.3 Visual reference

Use `onboarding_mockup.html` palette, typography, spacing, and component patterns. The mockup is not the production file but is the closest existing reference. Build production HTML/CSS from scratch using the mockup as the design source.

If anything in the mockup conflicts with the spec, **the spec wins**. Flag the conflict to Melissa rather than picking silently.

---

## Step 7 — Personalize wizard (Spec §8.2 + onboarding_mockup.html)

Wizard lives inline on `welcome.html` below the main welcome content. "Get started" button scrolls to it. Each screen is full-width with progress dots at top, content in middle, footer with Skip/Back/Next.

### 7.1 Screen 1 — Loading expectations + Step 0 framing

**Eyebrow:** Step 1 of 4
**Heading:** "How Actually Useful loads results"
**Lede paragraph:** (suggested copy, flag for Melissa)
> Most of what makes AU useful happens after results load. Step 0 — Amazon's own sidebar filters — gives you the cleanest input. AU then expands that focused list across multiple pages, so when you filter and sort, you're working with a complete picture instead of just page one.

No controls on this screen. Pure framing.

### 7.2 Screen 2 — Default sort + page count

**Eyebrow:** Step 2 of 4
**Heading:** "Sort and load defaults"

**Row 1 — Default sort:**
- Select dropdown: Best value ↑ (default), Price low → high, Price high → low, Rating, As Amazon listed
- Label: "Default sort"
- Hint: "How results are ordered when a search loads."

**Row 2 — Pages to load:**
- Number input, 1–7, default 4
- Label: "Pages to load by default"
- Hint: "Loading more pages takes longer — but it's also what gives you a complete picture before you start filtering. If you plan to send your shortlist to the comparison page, you'll probably want more pages, not fewer."
- Live "About {X} seconds" estimate next to the input. Rough estimate: 2 seconds per page. So 4 pages = ~8 seconds. Update on input change.

### 7.3 Screen 3 — Quality thresholds

**Eyebrow:** Step 3 of 4
**Heading:** "Hide weak results across every search"
**Lede paragraph:** (locked from mockup)
> Most users start with 4★ or better and at least 50 reviews. These apply automatically to every search — you can override them per-search anytime.

**Row 1 — Minimum rating:** Select (Any, 3★+, 4★+, 4.5★+). Default 4★+. Hint: "Hide items below this rating."

**Row 2 — Minimum reviews:** Number input, default 50. Hint: "Hides items with fewer reviews. Useful for filtering brand-new junk listings."

### 7.4 Screen 4 — Card density

**Eyebrow:** Step 4 of 4
**Heading:** "How much space each result takes up"
**Lede paragraph:** (suggested copy, flag for Melissa)
> Dense fits more on screen; comfortable gives each result more room to breathe.

Two side-by-side cards (visual previews of dense vs comfortable density). Default selection: Comfortable. Clicking either card selects it.

### 7.5 Wizard footer

Every screen has:
- Left: "Skip personalization" link (small, muted, goes to end-state)
- Right: "← Back" button (hidden on screen 1) + "Next →" or "Done" (screen 4) button

### 7.6 Wizard end-state

After screen 4 "Done" or any "Skip personalization":
- Header changes to a confirmation: "All set." (or similar — suggested copy, flag for Melissa)
- Body: "Open any Amazon search to start using Actually Useful."
- Single CTA: "Start shopping →" → goes to amazon.com

### 7.7 Wizard persistence

Each control change writes immediately to `chrome.storage.local` via the mechanism chosen in Step 2 (CustomEvent + content script, OR `externally_connectable`).

**Storage keys written by wizard:**

| Key | Maps to which setting |
|---|---|
| `auDefaultSort` | Default sort |
| `auDefaultPages` | Pages to load by default |
| `auDefaultMinRating` | Minimum rating |
| `auDefaultMinReviews` | Minimum reviews |
| `auDefaultDensity` | Card density |
| `au_telemetry_enabled` | Privacy toggle (set from welcome page section, not the wizard) |

These keys already exist from Phase 5. Wizard writes to the same keys. Settings page and wizard are two views into the same data.

**Skip behavior:** if the user skips, NOTHING gets written. Built-in defaults remain active. The user can change settings later via the Settings page.

---

## Step 8 — Auto-open welcome page on install

`background.js` adds:

```js
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'https://www.actuallyuseful.net/welcome.html' });
  }
});
```

**Sonnet to verify:** correct welcome URL. Check existing background.js or manifest for the website hostname. If unsure, ask Melissa.

**Do NOT trigger on `update`** — only on first install. Updates should not re-open welcome. (`details.reason === 'install'` handles this.)

---

## Step 9 — Removal of workflow banner

(Already covered in §4.1 above — listed here as its own deliverable for the checklist.)

Search.js and styles.css both lose code for the workflow banner. The `au-banner-dismissed` localStorage key is orphaned in users' browsers — that's fine, no migration.

---

## Storage keys — full list this session

**New:**

| Key | Type | Default | Purpose |
|---|---|---|---|
| `auHasSeenLoadingBanner` | boolean | `false` | First-time loading message has been completed |
| `auHasSeenBrandHint` | boolean | `false` | First-search brand hint dismissed |

**Removed:**
- `au-banner-dismissed` (localStorage) — orphaned, no cleanup

**Touched (existing, written by wizard):**
- `auDefaultSort`, `auDefaultPages`, `auDefaultMinRating`, `auDefaultMinReviews`, `auDefaultDensity`, `au_telemetry_enabled`

---

## Test plan — what to check before producing docs

### Welcome page
1. Fresh install of extension (uninstall + reinstall, or use a fresh Edge profile). Welcome.html opens automatically in a new tab.
2. All content sections render correctly: brand eyebrow, headline, Step 0 callout, 3 feature cards, brand explainer, privacy section, CTAs.
3. Privacy toggle works — toggling it writes to `chrome.storage.local`. Reload welcome.html — toggle reflects saved state.
4. "Read full privacy policy →" opens `/privacy.html`.
5. "Skip and start shopping" opens `amazon.com`.
6. "Get started" scrolls smoothly to the wizard.

### Wizard
7. Screen 1: progress dots show 1 of 4 active. Lede paragraph reads correctly. No controls visible.
8. Screen 1 → 2: Next button advances. Progress dots update. Back button now visible.
9. Screen 2: sort dropdown changes write to `auDefaultSort` immediately. Pages input changes write to `auDefaultPages`. Live "about X seconds" estimate updates.
10. Screen 2 → 3: advance.
11. Screen 3: rating select and reviews input both write immediately.
12. Screen 3 → 4: advance.
13. Screen 4: density cards selectable. Selection writes immediately.
14. Screen 4: "Done" → end-state with "Start shopping →" CTA.
15. From any screen: "Skip personalization" → end-state, nothing written.
16. Back button on screen 2/3/4 returns to previous screen, retains data.

### Loading banner
17. New install profile (or clear `auHasSeenLoadingBanner`). Open Amazon search with default pages = 4. First-time amber banner appears between compare bar and keyword filter.
18. Banner text shows the right page count (4).
19. Pages finish loading. Banner disappears. Check `auHasSeenLoadingBanner = true`.
20. Reload page or do another search. Subsequent thin coral progress strip appears, fills as pages load, slides away on complete.
21. Stable footprint: when no loading is happening, the slot is collapsed (no visual gap above keyword filter).

### Brand hint
22. Fresh install. Search a category that returns branded items (e.g. "laundry detergent"). Inline note appears at top of results. Tooltip points at first ⋯ on first card with a detected brand. ⋯ is highlighted/pulsing.
23. Click "Got it" on inline note. Both surfaces disappear. `auHasSeenBrandHint = true`.
24. Reload, new search. Neither surface appears.
25. Reset flag. Reload. Click × on inline note this time. Both disappear, flag set.
26. Reset flag. Reload. Click a ⋯ menu directly (don't dismiss hints first). Both disappear, flag set.
27. Reset flag. Reload. Wait 30 seconds. Both fade out, flag set.
28. Search for a category with no detected brands (rare — try a weird query). Inline note appears alone, tooltip skipped. Dismissal still sets flag.

### Workflow banner removal
29. Confirm the old workflow banner at top of panel no longer appears. No "Get the best results: Set Amazon's filters first..." copy anywhere.

### Auto-open on install
30. Fresh install (uninstall + reinstall in butactuallyuseful profile). Welcome.html opens in new tab automatically.
31. Reload extension (chrome://extensions, click reload). Welcome.html does NOT re-open — only on install, not update.

### Close button regression check
32. Close button still works (from Chat 74 session). × hides panel. Toolbar icon restores.
33. Phase 1–5 features all intact.

### JS syntax check
34. `node -c` (or equivalent) passes on search.js, background.js, welcome.html JS.

---

## Definition of done

1. Welcome.html fully rewritten per §6 of this brief.
2. Personalize wizard inline on welcome.html, 4 screens, working state machine, persistence to `chrome.storage.local`.
3. Loading banner system implemented per §4, replacing the old workflow banner.
4. First-search brand hint (inline note + tooltip) implemented per §5.
5. `chrome.runtime.onInstalled` listener opens welcome.html on install.
6. Two new storage keys added and loaded on startup.
7. Old workflow banner fully removed from search.js and styles.css.
8. No regressions in close button or Phase 1–5 features.
9. JS syntax check passes.
10. All suggested copy flagged with `<!-- SUGGESTED COPY: ... -->` comments for Melissa's review.

---

## What this session does NOT do

- Phase 7 (deferred — defined after Phase 6 ships)
- `compare.html`, `index.html`, `privacy.html` changes
- `core.js` changes
- Anything in weight unit logic, brand detection, keyword parser
- New logging fields

---

## Document deliverables this session

**Full end-of-bundle cadence** — covers both the close button session (Chat 74) and this session (Chat 75 or whatever it ends up being).

1. Test on real Amazon search + fresh install on welcome.html before producing docs
2. Updated **Handover_Chat[N].md** — covers this session only
3. Updated **Changelog entry** — single combined entry covering BOTH close button session AND this session (because we deferred the changelog from Chat 74)
4. Updated **Project_Briefing_Chat[N].md** — PART TWO always; PART ONE only if something changed
5. Updated **Roadmap_Chat[N].md** — check Phase 6 box, define Phase 7 scope, update next-session priorities, update known-issues
6. GitHub commit message + push reminder
7. Reminder to update all four docs in the Claude Project after the push

---

## Version bump

Suggested:
- `search.js` → v0.6.1.85 (loading banner + brand hint + workflow banner removal)
- `styles.css` → updated Chat [N]
- `background.js` → v0.6.1.19 (onInstalled listener)
- `welcome.html` → no version number; just note "rewritten Chat [N]" in Handover
- `manifest.json` → bump if content_scripts or externally_connectable changed; otherwise unchanged

Overall version stays at v0.6.1.

---

## Out of scope (don't touch)

- Weight unit logic
- Brand detection logic
- Keyword parser
- Logging payload
- compare.html, index.html, privacy.html
- Anything in Phase 7 (TBD)

---

## Suggested session opener (for Melissa to paste)

> Phase 6 of the panel redesign — Onboarding refresh. The brief is `Phase6_Kickoff_Brief_Chat73.md` in the Project. Panel_Redesign_Spec.md is the full reference. Handover_Chat74.md has the close button session state (close button is done — verify it's working before stacking on top). I'm uploading current code files fresh from GitHub. Confirm scope before touching anything.

First message back from Sonnet should:
1. Confirm receipt of code files and versions
2. Restate Phase 6 scope in one paragraph
3. **Storage key audit** per Step 1
4. **Website ↔ extension communication audit** per Step 2 — report `externally_connectable` and content scripts config
5. **Close button verification** per Step 3 — confirm Chat 74 work intact
6. Ask clarifying questions via widget if needed
7. Wait for explicit go-ahead before editing files

---

*End of brief.*
