# Actually Useful — Roadmap

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## Current version: v0.6.1.85 (overall) · v0.6.1 (manifest) · v0.6.1.85 (search.js) · v0.6.1.53 (core.js) · v0.6.1.18 (background.js) · styles.css updated Chat 75 · welcome.html rewritten Chat 75 · welcome-bridge.js new Chat 75 · compare.html updated Chat 66 · index.html updated Chat 66 · privacy.html updated Chat 66

---

## Known issues / needs testing

- **Contact lens solution — Amazon-reported $/fl oz unreliable** — stray numbers in title cause wrong unit price; needs recalculate-and-compare check
- **Cotton swabs — extractCount grabbing pack count instead of swab count** — "500 per Pack - 2 Pack" → shows 2 ct instead of 1000 ct
- **Razor blade $0.1/ct outlier** — one item still showing one decimal despite zero-pad fix
- **Pairs ambiguity** — socks/gloves sold in pairs AND multiples; uncertainty note added as interim
- **FSA/HSA, Climate Pledge Friendly, Small Business badge detection** — not yet verified on live Amazon searches
- **"Amazon search" link in compare.html** — only works for comparisons created after v0.6.1.14
- **Delivery time on compare.html** — only correct after v0.6.1.17
- **Thumbnails on compare.html** — only populated after v0.6.1.16
- **Paid delivery on compare.html** — only available after v0.6.1.27
- **isSnap on compare.html** — only available after v0.6.1.28
- **ppuNote on compare.html** — only available after v0.6.1.29
- **isFsaHsa/isClimatePledge/isSmallBusiness on compare.html** — only available after v0.6.1.34
- **Collapsible animation gone** — snap only; post-alpha
- **Other discount types not captured** — buy-multiple deals, vague "save X%" promos; post-alpha
- **compare.html logging** — deferred; compare.html can't read telemetry opt-out from chrome.storage.local; revisit when website has more surfaces
- **Brand filter mixed-case invented names** — Floerns, Verdusa, Wenrine etc. score 0 on heuristics; accepted gap, covered partially by bundled blocklist
- **Brand filter threshold tuning** — 25% high-noise threshold needs real-world calibration
- **Outlier PPU units sorting to top** — items with unusual units ($/lb for weighted heating pad, $/ft for a cord) sort to top as "best value" when their raw PPU is small. Needs design session before fix.
- **Prime scraping — possible Amazon selector change.** Two searches in Chat 61 showed no Prime badges detected. Amazon may have changed from a "Prime" filter to "Free Shipping by Amazon." Needs investigation.
- **Amazon Basics brand column shows — on compare.html** — needs investigation.
- **Dumbbells showing $/lb** — pre-existing outlier PPU issue; isMultiPackWeight correctly returns false for dumbbells, but weight-from-title still fires for single items. Needs design session.
- **Coral vs Amazon orange** — verify coral (#f25d4e) doesn't clash with Amazon's orange (#ff9900) on a real search page. Flag and adjust hex if needed.
- **Left-edge resize handle awkward when panel is on left side of viewport** — Phase 4 design choice to keep handle on left edge always. Revisit if users report difficulty resizing a left-docked panel.
- **Welcome page copy** — all `<!-- SUGGESTED COPY: ... -->` blocks need Melissa review before CWS push. Loading banner first-time text and brand hint text in search.js also flagged.
- **index.html screenshot** — current screenshot is old; needs replacement post-Phase 6. Phase 7B adds a TODO comment in the HTML; Melissa provides new screenshot separately.
- **Ads not moving** — "Move ads to end" toggle greys items but doesn't reorder them. Fix in Phase 7A.
- **Brand hint timeout too short** — auto-dismiss fires in seconds; spec says 30s. Fix in Phase 7A.
- **Footer link formatting inconsistent** — font/size/weight/underline differs across footer links. Fix in Phase 7A.
- **Keyword hint text not selectable** — violates standing selectable-text rule. Fix in Phase 7A.
- **Unit pills too large** — CSS reduction needed. Phase 7A.
- **Pages slider tick marks hard to see** — CSS fix or add labels. Phase 7A.
- **Brand name not clickable** — only ⋯ triggers popover; brand name text should also be clickable. Phase 7A.
- **Bug reporting tool missing** — pre-alpha requirement. Phase 7A.
- **Bug reporting on cards without detected brand** — no ⋯ menu means no bug report access for those cards in Phase 7A. Revisit in Phase 8 when compare.html structural pass adds a second bug-reporting surface.
- **Keyword filter hint too verbose** — design conversation needed before any code change. Deferred.
- **"We show our working" banner too wordy** — design conversation needed. Deferred.
- **Impossible Burger math** — PPU calculation wrong on this search; investigation session needed. Deferred.

---

## Working rules

**Single agent.** Claude only. No Replit, Gemini, Figma, or other tools touching code files directly.

**Opus plans, Sonnet codes.** Opus 4.7 is used for design conversations, scope decisions, and producing kickoff briefs. Sonnet 4.6 is used for code changes. Triggers for moving between them:
- In an Opus chat, when planning is done and a kickoff brief is ready → switch to a fresh Sonnet chat and paste the brief.
- In a Sonnet chat, if a real design question comes up (scope, defaults, user-facing copy decisions) → stop, return to Opus, decide there.
- Each kickoff brief should remind Sonnet to bounce design questions back to Opus.
- **A planning session accidentally started in Sonnet should be redone in Opus.** Sonnet can produce a workable scope but tends to leave design questions unresolved in the brief, over-scope phases, and make decisions that should have been asked. Verified Chat 76.

**Confirm before coding.** Always align with Melissa on what we're building before touching any files. Do not code without explicit approval.

**One decision surface per session.**

**Context rot warning.** Long sessions degrade quality. Stop and wrap up rather than pushing through.

**Clean room protocol:** Code files are NOT stored in the Claude Project. At the start of each coding session, Melissa uploads current versions fresh from GitHub. Claude confirms version string before editing.

**File attachment rule:** If files come through as document blocks rather than actual file uploads, stop and ask Melissa to re-attach as uploads.

**CSS/JS consistency rule:** When removing JS visibility toggling from an element, always check and update the CSS baseline too.

**Template literal rule:** Never use Python heredoc string escaping for JavaScript template literals in compare.html. Use string concatenation (+).

**Brand list sync rule:** brand_blocklist.txt and amazon_brands.txt must be updated concurrently in extension/data/ AND repo root data/. Both files must always match.

**default_popup rule:** manifest.json must NOT have `default_popup` set under `action`. Removing it was required to enable the `chrome.action.onClicked` listener in background.js (toolbar-icon restore). If `default_popup` is ever re-added, the restore listener will silently stop firing. Documented in background.js comment.

**Version numbering:**
- Overall / canonical: search.js number
- Per-file versions differ intentionally — files change at different rates
- v1.0 = Web Store public launch

**Affiliate tags:** Website only — never in the extension. Every outbound Amazon link from the website carries the Associates tag.

**Affiliate disclosure:** Every page. Standing rule.

**All text in the extension interface must be selectable.**

**Commit message rule:** Always provide a commit message when a GitHub push is needed.

**Don't touch weight unit logic without a design session first.**

**Rollback rule:** 3 failed fix attempts = stop, revert to last stable commit.

**search.js stays as one file** until selector resilience is properly designed.

---

## Document update cadence

Documents update on a phase-bundle rhythm, not a session rhythm.

**Filename convention (adopted Chat 71):** `Project_Briefing.md` and `Roadmap.md` use `_Chat[N].md` suffix. Each version gets a unique filename. Coding files and uniquely-named docs (specs, mockups, briefs) are out of scope for this rule.

**Current bundles:**
- Phase 4 + Phase 5 → one bundle ✅ complete (Chat 70 + Chat 72)
- Phase 6 bundle (close button + onboarding) → one bundle ✅ complete (Chat 74 + Chat 75)
- Phase 7 bundle (7A extension + 7B website) → next bundle, scope locked Chat 76

**Every session (coding or planning) ends with:**
1. Test before producing docs (if coding)
2. Updated **Handover** (always)
3. Updated **Changelog entry** (always)
4. GitHub commit message + push reminder (if coding)
5. Reminder to update Handover and Changelog in the Claude Project after the push

**At the end of each phase bundle, additionally:**
6. Updated **Project_Briefing_Chat[N].md** — PART TWO (volatile state) always; PART ONE (stable core) only if something in it actually changed
7. Updated **Roadmap_Chat[N].md** — check phase boxes, update next-session priorities, update known-issues list

**Mid-bundle sessions** (e.g., Phase 7A, Phase 4 of the original Phase 4+5 bundle) produce only Handover + Changelog. This reduces end-of-session doc overhead.

All documents are produced as complete files. No snippets, no merge instructions.

---

## Next session priorities

**Phase 7A — Sonnet coding session, extension only.** Kickoff brief: `Phase7A_Kickoff_Brief_Chat76.md`.

Before opening the Sonnet session, Melissa must:
1. Create the `bug_reports` table in Supabase (schema in 7A brief).
2. Upload search.js and styles.css fresh from GitHub.

7A scope:
- Extension urgent fixes (ads, brand hint timeout, footer formatting, keyword hint selectable)
- Extension improvements (unit pills, slider tick marks, brand name clickable)
- Bug reporting tool (⋯ menu, overlay form, Supabase POST)
- Bumps search.js to v0.6.2.0

**Phase 7B — Sonnet coding session, website only.** Kickoff brief: `Phase7B_Kickoff_Brief_Chat76.md`. Runs after 7A is pushed.

7B scope:
- welcome.html copy rewrite (02 Narrow, 03 Decide, brand controls section, alpha/dev notice, wizard SUGGESTED COPY review)
- index.html palette + sample links + screenshot TODO + affiliate disclosure
- privacy.html palette + bug_reports documentation + affiliate disclosure

**Copy review before CWS push.** All `<!-- SUGGESTED COPY: ... -->` blocks on welcome.html and wizard. Loading banner and brand hint text in search.js. These are flagged but not locked in.

**Deferred design conversations (after Phase 7 bundle):**
- Keyword filter hint verbosity — design session required before code change
- "We show our working" banner — design session required
- Welcome page full settings — design session required
- Impossible Burger math — investigation session

**Deferred coding work (after Phase 7 bundle):**
- $/serving for protein powder — design session required
- Prime scraping investigation — check selectors against current Amazon HTML
- CWS push + Reddit posts — held pending Phase 7 completion
- **Phase 8** — compare.html structural pass + bug reporting on compare.html

---

## Panel Redesign — phase plan

Full spec: Panel_Redesign_Spec.md (in Claude Project).

- [x] Chat 64 — initial spec drafted (compare bar, filters layout, brand row, palette, settings, onboarding outline)
- [x] Chat 65 — all §10 open items locked, Step 0 added to workflow model, welcome page and wizard screen 1 rewritten, Phase 1 brief produced, onboarding mockups built
- [x] **Phase 1 — Palette migration + layout scaffold** (Chat 66) ✅
- [x] **Phase 2 — Filters overlay (Option C)** (Chat 67) ✅
- [x] **Phase 3 — Card redesign** (Chat 68) ✅
- [x] **Phase 4 — Panel chrome** (Chat 70) ✅
- [x] **Phase 5 — Settings page** (Chat 72) ✅
- [x] **Close button (Path C)** (Chat 74) ✅
- [x] **Phase 6 — Onboarding refresh** (Chat 75) ✅
- [x] **Chat 76 — Phase 7 scoping** (Opus, this session) ✅
- [ ] **Phase 7A — Extension fixes + bug reporting tool** (Sonnet session — next)
- [ ] **Phase 7B — Website polish** (Sonnet session — after 7A)
- [ ] **Phase 8 — compare.html structural pass + bug reporting on compare.html** (scope TBD)

---

## v0.6.1.x release plan

- [x] Tampermonkey → Chrome extension (Chat 22)
- [x] Popup + toggle (Chat 22)
- [x] Search context relay via background.js (Chat 22)
- [x] Panel redesign (Chat 22)
- [x] Delivery dates — free and fast (Chat 23)
- [x] Prime filter (Chat 23)
- [x] Shortlist + compare (Chats 24–26)
- [x] Screenshots taken (Chat 27)
- [x] compare.html — full redesign (Chat 28)
- [x] Chrome Web Store — published unlisted (Chat 29)
- [x] Reddit posts live (Chats 29/30)
- [x] Reddit feedback received (Chat 38)
- [x] Rating filter (Chat 31)
- [x] Delivery filter (Chat 32)
- [x] Thumbnail images in panel (Chat 33)
- [x] Paid delivery date (Chat 33)
- [x] Source filter — Amazon / Fresh / Whole Foods pills (Chat 34)
- [x] SNAP EBT badge (Chat 35)
- [x] FSA/HSA badge (Chat 36)
- [x] Climate Pledge Friendly badge (Chat 36)
- [x] Small Business badge (Chat 36)
- [x] compare.html — filter bar (Chat 37)
- [x] compare.html — sortable columns (Chat 38)
- [x] compare.html — share (Supabase) (Chat 39)
- [x] compare.html — notes (Chat 40)
- [x] index.html — full rewrite (Chat 42)
- [x] Metropolitan Market source (Chat 43)
- [x] compare.html — column toggles (Chat 44)
- [x] Logging — 63 columns (Chat 46)
- [x] compare.html — resizable columns (Chat 47)
- [x] compare.html — sticky header + sticky scrollbar (Chat 48)
- [x] Brand filter — heuristic scoring (Chats 49–53)
- [x] compare.html — brand column (Chat 54)
- [x] Shortlist object shape — brand field added (Chat 55)
- [x] Dual-handle price range slider (Chat 56)
- [x] compare.html — hide slow shipping filters (Chat 57)
- [x] High-noise banner — dismissible X added (Chat 57)
- [x] Re-sync prompt — "You had X pages loaded — reload all?" (Chat 57)
- [x] Filter layout jank fixed (Chat 58)
- [x] Welcome page on install (Chat 59)
- [x] Keyword filter — full boolean parser rewrite (Chat 60)
- [x] extractCount — pack/pk patterns moved to end (Chat 61)
- [x] compare.html — boolean keyword parser ported (Chat 61)
- [x] isMultiPackWeight() / isServingWeight() helpers (Chat 63)
- [x] Multi-pack × weight PPU (Chat 63)
- [x] Panel redesign — spec and planning (Chats 64–65)
- [x] **Phase 1 — Palette migration + layout scaffold** (Chat 66) ✅
- [x] **Phase 2 — Filters overlay (Option C)** (Chat 67) ✅
- [x] **Phase 3 — Card redesign** (Chat 68) ✅
- [x] **Phase 4 — Panel chrome** (Chat 70) ✅
- [x] **Phase 5 — Settings page** (Chat 72) ✅
- [x] **Close button (Path C)** (Chat 74) ✅
- [x] **Phase 6 — Onboarding refresh** (Chat 75) ✅
- [ ] **Phase 7A — Extension fixes + bug reporting tool** (Sonnet — next; bumps to v0.6.2.0)
- [ ] **Phase 7B — Website polish** (Sonnet — after 7A)
- [ ] **Phase 8 — compare.html structural pass + bug reporting on compare.html** (design TBD)
- [ ] $/serving for protein powder — design session required (deferred during redesign)
- [ ] Prime scraping — investigate selector change (deferred during redesign)
- [ ] Add laundry pods (id=73) and laptop (id=74) sample links to index.html (Phase 7B)

### Alpha release — status
- [x] Screenshots taken (Chat 27)
- [x] Chrome Web Store — published unlisted (Chat 29)
- [x] Reddit posts live (Chats 29/30)
- [x] Reddit feedback received (Chat 38)
- [ ] Welcome page copy review (all SUGGESTED COPY blocks)
- [ ] Bug reporting tool live (pre-alpha requirement — Phase 7A)
- [ ] r/vibecodedevs post
- [ ] Facebook post
- [ ] Test on a different setup (Mac or Chrome vs Edge)

### Infrastructure — status
- [x] GitHub Pages enabled + custom domain + HTTPS ✅
- [x] Kill switch active ✅
- [x] Supabase account + comparisons table
- [x] Chrome Web Store — published unlisted
- [x] Usage log — Google Sheet, 63 columns, fully in sync ✅
- [ ] Supabase `bug_reports` table — Melissa creates before Phase 7A Sonnet session
- [ ] Create Amazon account (prerequisite for Associates)
- [ ] Apply for Amazon Associates (after real user base)

### Chrome Web Store stats (as of May 11, 2026)
- 28 total installs · 12 weekly active users · 2 uninstalls
- 86% US · 7% Other · Germany and Italy (installs)
- 77% US · 13% Canada · 7% Italy (weekly users)
- 43% ChromeOS · 39% Windows · 18% Mac OS (installs)
- 79% Windows · 16% Mac OS · 5% ChromeOS (weekly users)

---

## Pre-public-CWS-listing checklist

- [x] SNAP EBT verified working ✅
- [x] index.html copy and CTA overhauled ✅
- [x] Kill switch in place ✅
- [x] Logging audit session ✅ (Chat 46)
- [x] Brand filter feature suite (Sessions 1–5 complete) ✅
- [x] Panel redesign spec locked (Chat 65) ✅

- [ ] Panel redesign Phases 1–7 complete
- [ ] Welcome page copy review (SUGGESTED COPY blocks)
- [ ] Bug reporting tool live (Phase 7A)
- [ ] Selector resilience refactor
- [ ] Self-test mode
- [ ] Anomaly/transparency banner audit pass
- [ ] Demo video recorded and embedded on landing page
- [ ] Bug-test spreadsheet — at least 5 categories passing
- [ ] Public-facing roadmap — GitHub Issues with roadmap label
- [ ] CWS listing description updated

---

## Post-alpha (v0.8+)

- Lazy product-page fetch architecture (Frequently Returned, variations, Sold by — progressive enrichment)
- Cross-session shortlist persistence
- "Hide this seller forever"
- "Cheaper at Whole Foods/Fresh" cross-source alerts
- Selector resilience refactor (if not completed pre-public)
- Walmart version
- Brand filter allowlist — bundled; add after telemetry shows false positives worth addressing
- compare.html logging — revisit when website has more surfaces
- Bug reporting on compare.html — Phase 8 (not post-alpha — pre-CWS-public)
- Sign in to save settings, notes, sync between extension and website

### Website (post-alpha)
- [ ] search.html — standalone search results page
- [ ] Product pages on website — per-product research surface
- [ ] Gift lists, carts, saved-for-later surfaces
- [ ] "For nerds" transparency doc
- [ ] Demo video recorded and embedded
- [ ] Affiliate tags wired into all outbound Amazon links on website

---

## Deferred / deprioritized

- product.js — disabled during alpha; re-enable post-alpha
- Per-item "Frequently Returned" badge — requires product page fetch (post-alpha)
- Variation pricing warnings — requires product page fetch (post-alpha)
- Amazon Associates — apply when 50+ weekly active installs + 500 monthly site visitors
- Show HN / Product Hunt launch — coordinate with public CWS listing
- r/InternetIsBeautiful — after polish pass
- Cross-device blocklist sync — post-alpha (chrome.storage.sync, 100KB cap)
- Keyword filter hint verbosity — design conversation required before code change
- "We show our working" banner — design conversation required
- Welcome page full settings — design conversation required
- Impossible Burger math (Impossible Burger search) — investigation session required
