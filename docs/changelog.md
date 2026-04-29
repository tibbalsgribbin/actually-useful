# Actually Useful — Changelog

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## **Planning session — April 28, 2026 (Chat 37)**

*No code changes. Strategy, synthesis, and outreach research session.*

### Documents produced this session
- **Master_Synthesis.md** — comprehensive synthesis of advice from 14 external AI/strategy documents, organized by topic (workflow, code quality, testers, marketing, monetization, features). Includes payoff/difficulty ratings and explicit "what to skip" list.
- **Outreach_Platform_Rules.md** — verified rules and fit assessment for all suggested outreach venues (Reddit, Show HN, Product Hunt, Indie Hackers, Mastodon, Slickdeals, Bogleheads, Buy Nothing groups, TikTok, X/Twitter, frugality blogs).
- **bug-test.md** — blank spreadsheet template for tracking search-category testing across versions.

### Decisions made
- **Outreach channels corrected:** r/Frugal, Buy Nothing groups, r/AmazonDeals, and Slickdeals confirmed as not viable for AU promotion (rules prohibit it or format is wrong). Priority outreach is r/SideProject + beta-tester subs + frugality blog email pitches.
- **Pre-public-CWS-listing checklist established** — 12-item gate before moving from unlisted to public. Includes selector resilience, kill switch, self-test mode, welcome page, logging audit, demo video, and public roadmap.
- **Demo video elevated** to highest-priority marketing action. Loom recommended.
- **Welcome page on install elevated** to near-equal priority with the demo video.
- **Anomaly/transparency banners added** as a design direction — "show our work" principle; accessibility framing.
- **Logging audit** added as a pre-public-listing item — compare.html logging is currently a gap.
- **Public-facing roadmap** added as a pre-public-listing item — GitHub Issues with roadmap label + "won't do" section.
- **Three new design principles added:** Fail loud at system level / fail quiet per item; Show our work; Sustainability features are features.
- **Rollback rule added** to working rules: 3 failed bug-fix attempts = stop and revert to last stable commit.

### Changes to project documents
- Project_Briefing.md: new known issues (no selector resilience, no kill switch, no self-test mode); four new design principles; end-of-session checklist clarified (push only needed when code changed)
- Roadmap.md: rollback rule added; next session priorities updated; pre-public-CWS-listing checklist added; post-alpha section updated with new items (welcome page, onboarding overlay, anomaly banners, hasVariations flag, hide-seller feature, outreach specifics); design principles updated; outreach section corrected with verified channel list

---

## **v0.6.1.28 — April 27, 2026 (Chat 36)**

### search.js — SNAP EBT detection and filter
- `detectSnap(el)` function added — checks `aria-label` attributes and leaf-node text for "SNAP EBT"; returns boolean
- `isSnap` stored on each scraped item and included in compare payload
- "SNAP EBT eligible" note line added to panel row display (green, same pattern as coupon/S&S notes)
- "SNAP EBT eligible only" checkbox added to price range row in Filters section
- Checkbox only appears when at least one result in the current set has `isSnap: true`
- `snapOnly` filter hides non-SNAP items and excludes them from best-value star calculation
- Resets on Clear all

### compare.html — SNAP EBT pill and filter
- Green `pill-snap` style added (green background, dark green text)
- `renderCouponCell` reworked to build pills as an array — SNAP EBT pill appends alongside coupon/S&S pills when present
- Both inline render paths updated to match
- "SNAP EBT only" checkbox added to filter bar — only renders when at least one item in the comparison has `isSnap: true`
- Wired into `applyFilters`, `attachFilterHandlers`, and Clear filters

### compare.html — default sort changed to PPU ascending
- `sortCol` now initialises to `'ppu'` — table loads sorted lowest PPU first on every page load
- Items without PPU data sort to the bottom (existing `Infinity` fallback)
- Clear filters resets to PPU sort rather than unsorted

---

## **v0.6.1.29 — April 25, 2026 (Chat 34)**

### compare.html — coupon column simplified
- `renderCouponCell` no longer shows with-coupon price or was-price — coupons now display "Coupon" pill only
- Price column already shows full coupon pricing; duplication removed
- S&S: unchanged — still shows actual discount string (e.g. `15% with S&S`)
- `couponPillOnly` label changed from "Coupon — check Amazon" to "Check Amazon" for consistency
- Both render paths (renderTable inline block + renderCouponCell) now consistent

### compare.html — column hide toggles added
- "Show columns:" toggle bar added above the table
- Hideable columns: Price, Per unit, Delivery, Rating, Reviews, Prime, Coupon / promo, Source, Notes
- Always visible: checkbox, thumbnail, Product
- Active columns shown as filled indigo buttons; hidden columns shown as white/muted
- Clicking a button toggles that column's `th` and all its `td`s via `display:none`
- State is per-session only (resets on page reload)
- Both render paths updated; `attachColToggleHandlers` + `applyColVisibility` wired into rerender and rerenderTableOnly

---

## **v0.6.1.28 — April 25, 2026 (Chat 33)**

### compare.html — delivery column improved
- `formatDeliveryDate` updated to accept `windowEnd` parameter — free delivery now shows full window range (e.g. `Tuesday, 5 PM–10 PM`)
- Fast delivery line now shows order-by cutoff when present: `(order by 3 PM)`
- Paid express delivery shown as third line in amber: e.g. `$4.99 delivery Tomorrow (order by 8 PM)`
- Both render paths (renderTable + rerenderTableOnly) updated

### compare.html — coupon/promo column switched to full renderCouponCell
- Table rows previously used a simplified inline block showing just "S&S" or "Coupon" pills
- Now uses the existing `renderCouponCell` function: S&S shows actual discount string (e.g. `15% with S&S`), coupons show with-coupon price and strikethrough was-price
- Both render paths updated

### compare.html — Prime only filter added
- New "Prime only" checkbox in filter bar
- `filterRequirePrime` state variable added; wired into `applyFilters`, `attachFilterHandlers`, and clear handler
- Persists through rerenders; resets on Clear filters

### styles.css — paid delivery color rule added
- `.ppu-delivery.paid { color: #b45309; }` added after `.ppu-delivery.wf-fee`

---

## **v0.6.1.27 — April 25, 2026 (Chat 32)**

### Paid express delivery scraped and displayed (search.js)
- `parseDeliveryDates` now detects paid express delivery lines ("Or $4.99 delivery in 3 hours")
- Stored as `paidDate`, `paidCutoff`, `paidPrice` on each item
- Displayed in panel row below free delivery line: e.g. `$4.99: in 3 hrs`
- Factored into "Soonest ANY delivery" sort alongside free and fastest dates

### Free delivery window shown as range (search.js)
- New `parseDeliveryWindowEnd` function captures end of delivery window
- New `formatWindowRange` combines start–end: `5 PM–10 PM`
- `formatWindowMinutes` no longer prepends "by " — now a pure time formatter
- Display updated to use `formatWindowRange(r.freeWindowMinutes, r.freeWindowEnd)`

### Compare payload expanded (search.js)
- Added: `freeWindowEnd`, `fastCutoff`, `paidDate`, `paidCutoff`, `paidPrice`
- Available to compare.html for comparisons created from v0.6.1.27 forward

---

## **v0.6.1.22–26 — April 25, 2026 (Chat 32)**

### Solid product unit override (search.js)
- When item title contains a countable-solid keyword (pod, pac, fling, tab, sheet, strip, load) and Amazon reports a weight unit (lb, oz, g) or a whole-package $/ct, override to `price/count` using guessed count unit
- Fixes laundry pods showing $/lb; fixes sheets/pacs showing $/ct at full price

### extractCount gains new patterns (search.js)
- Added: `(\d+)\s+loads?`, `(\d+)\s*-?\s*sheets?`, `(\d+)\s*-?\s*strips?`
- Catches "1000 Loads Mega Pack", "40 Loads", "30 Count Sheets" etc.

### normalizeUnit gains laundry compound units (search.js)
- `load`, `loads`, `sheet per load`, `sheets per load`, `load of laundry` → `load`

### guessCountUnit gains load and strip (search.js)
- Titles with `\d+ loads?` → `load`; `\d+ strips?` → `strip`

### SOLID_KEYWORDS expanded (search.js)
- Added: `sheet`, `sheets`, `strip`, `strips`

---

## **v0.6.1.21 — April 25, 2026 (Chat 31)**

### Font sizes bumped (styles.css)
- Section headers (Display as, Sort, Filters, Sources): 10px → 12px
- Slider labels (Minimum Reviews, Minimum Rating): 11px → 13px
- Pages to load label: 12px → 13px
- Buttons (Clear all, filter pills, source/unit pills): 11px → 12px
- Status text (56/60 have unit data, pages status): 11px → 12px
- Price min/max inputs unchanged (reference size)

### Workflow banner added (search.js, styles.css)
- Appears at top of panel above Keywords row
- Text: "New to Actually Useful? For best results: set Amazon's filters first, then load more pages to expand your results, then use Actually Useful filters and sorting to find the best value. When you're ready, shortlist items and compare. Learn more ↗"
- Dismissed via X button; state saved to localStorage (`au-banner-dismissed`)
- Resets when user clicks Clear all
- Text is selectable (user-select:text)
- Indigo left border, surface background — visible but not alarming

### Old keyword hint removed (search.js, styles.css)
- "Actually Useful works best in conjunction with Amazon's existing filters…" div removed — redundant with workflow banner
- `#ppu-keyword-hint` CSS rule removed

### Buttons renamed (search.js)
- "Start over" → "Clear all" with tooltip: "Clears all filters, sorting, and returns to page 1 results."
- "Re-scan page" → "Re-sync" with tooltip: "Re-syncs with the Amazon page. Use this if you changed Amazon's filters or categories. Extra pages loaded will be lost."
- All stale "Re-scan page" references in error messages updated to "Re-sync"

### Re-sync moved to Pages section (search.js)
- Re-sync button removed from sort/controls row
- Now lives in the pages row, right of the pages status span
- Logically grouped with the pages slider — both are data actions, not filter actions

### Re-sort button removed; auto re-sort on page load (search.js)
- `ppu-btn-resort` removed from HTML and all JS references cleaned up
- Results now re-sort automatically when pages finish loading

### Clear all fixed — actually clears everything (search.js)
- Root cause: `buildPanel()` was re-reading sessionStorage and restoring old filter state after reset
- Fix: `sessionStorage.removeItem(getFilterStorageKey(searchTerm))` called before `buildPanel()`
- Now clears: keywords, sort, min reviews, min rating, min/max price, source filters, sponsored mode; returns to page 1

---

## **v0.6.1.20 — April 24, 2026 (Chat 30)**

### Pages slider clipping fixed (search.js)
- `setupCollapsible` rewritten to use `maxHeight: none` when open instead of `scrollHeight` measurement

### Ko-fi nudge removed (search.js)
- All `maybeShowNudge()` call sites removed

### Rating/review count restored to row display (search.js)
- Now displays below delivery info: e.g. `4.5★ (1,234 reviews)`

---

## **v0.6.1.19 — April 22, 2026 (Chat 27)**
### Pages slider always visible (search.js)

## **v0.6.1.18 — April 22, 2026 (Chat 27)**
### Pages slider show/hide fix — partial (search.js)

## **index.html — April 22, 2026 (Chat 27)**
### Content updates — shortlist blurb, affiliate disclaimer, feedback form URL

## **v0.6.1.17 — April 22, 2026 (Chat 26)**
### Delivery time fixed on compare.html (search.js, compare.html)

## **v0.6.1.16 — April 22, 2026 (Chat 26)**
### Notes field reworked — link/preview pattern (search.js); imgUrl added to compare payload

## **v0.6.1.15 — April 21, 2026 (Chat 25)**
### Notes field, price range filter, expanded compare payload, compare table updates

## **v0.6.1.14 — April 21, 2026 (Chat 23)**
### Compare payload expanded; compare table and filters fixed

## **v0.6.1.13 — April 21, 2026 (Chat 22)**
### Compare payload expanded; compare table updated; filter bar added

## **v0.6.1.12 — April 21, 2026 (Chat 21)**
### Supabase compare — no item limit; error states split; Lavender Fields palette

## **v0.6.1.11 — April 21, 2026 (Chat 20)**
### Keyword filter bug fixed; Chrome Web Store prep; privacy.html

## **v0.6.1.10 — April 20, 2026 (Chat 19)**
### Feedback form pre-fill · Affiliate note reordered

## **v0.6.1.9 — April 20, 2026 (Chat 18)**
### Supabase shareable links · Best-value tie handling

## **v0.6.1.8 — April 20, 2026 (Chat 17)**
### Compare button · Gmail select-all · NaN fix

## **v0.6.1.7 — April 20, 2026 (Chat 16)**
### compare.html phase 1

## **v0.6.1.6 — April 20, 2026 (Chat 15)**
### Manifest warning · Landing page · Feedback form

## **v0.6.1.5 — April 19, 2026 (Chat 14)**
### Ko-fi fix · Page-fetch throttling · auSendLog → background.js · Telemetry opt-out

## **v0.6.1.4 — April 19, 2026 (Chat 13)**
### Rating filter · product.js disabled · Affiliate tag removed · Show Selected rework

## **v0.6.1.3 — April 19, 2026 (Chat 12)**
### Collapse bug · Version strings aligned · docs/ folder

## **v6.1.3 — April 18, 2026 (Chat 9)**
### Panel height resize · Persistent filter settings · Re-scan

## **v6.1.2 — April 18, 2026 (Chats 7–8)**
### Select-all rework · Shortlist bar · System font · Debouncing · Empty state

## **v6.1.1 — April 17, 2026 (Chat 5)**
### Collapsible sections · Footer · Keyword hint

## **v6.1.1 — April 16, 2026 (Chat 4)**
### Panel layout · Collapsible filters · Shortlist bar

## **v6.1.0 — April 14, 2026**
### Full visual redesign · Sliders · Sponsored button · Footer · Logging · Error panel

## **v6.0.x — March/April 2026**
*(Full history in archive-roadmap-history.md)*
