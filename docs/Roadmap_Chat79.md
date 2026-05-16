# Actually Useful — Roadmap

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## Current version: v0.6.2.0 (overall) · v0.6.1 (manifest) · v0.6.2.0 (search.js) · v0.6.1.53 (core.js) · v0.6.1.18 (background.js) · styles.css updated Chat 78 · welcome.html updated Chat 79 · welcome-bridge.js new Chat 75 · compare.html updated Chat 66 · index.html updated Chat 79 · privacy.html updated Chat 79

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
- **Welcome page copy** — all `<!-- SUGGESTED COPY: ... -->` blocks need Melissa review before CWS push. Loading banner first-time text in search.js also flagged. "Report an issue" banner text in search.js (`enterReportMode()`) flagged as `// <!-- SUGGESTED COPY -->`.
- **index.html screenshot** — current screenshot is old; needs replacement post-Phase 6. TODO comment in HTML. Melissa provides new screenshot separately.
- **index.html sample links id=73, id=74** — confirm Supabase rows exist before pushing. If not, revert those links.
- **Panel_Redesign_Spec.md** — §8.3 (brand hint pattern) and §5.7 (brand-row ⋯ popover — formerly 3-4 items) are stale after Phase 7A decisions. Update in a separate careful pass.
- **"Always hide" semantics** — popover label says "Always hide" but implementation demotes to bottom at 50% opacity. Pre-existing UX question. Track for a future UX session.
- **Bug reporting on cards without detected brand** — footer link fills this gap (any card is reportable). But reporting a brand-less card sends null brand — verify Supabase accepts this gracefully.
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
- **A planning session accidentally started in Sonnet should be redone in Opus.** Verified Chat 76.

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
- Phase 7 bundle (7A extension + 7B website) → ✅ complete (Chats 76–79)

**Every session (coding or planning) ends with:**
1. Test before producing docs (if coding)
2. Updated **Handover** (always)
3. Updated **Changelog entry** (always)
4. GitHub commit message + push reminder (if coding)
5. Reminder to update Handover and Changelog in the Claude Project after the push

**At the end of each phase bundle, additionally:**
6. Updated **Project_Briefing_Chat[N].md** — PART TWO (volatile state) always; PART ONE (stable core) only if something in it actually changed
7. Updated **Roadmap_Chat[N].md** — check phase boxes, update next-session priorities, update known-issues list

All documents are produced as complete files. No snippets, no merge instructions.

---

## Next session priorities

**Phase 8 — compare.html structural pass + bug reporting on compare.html.** Design session required before coding. No kickoff brief yet.

Before opening Phase 8 Opus design session:
1. Push Phase 7B website files (welcome.html, index.html, privacy.html) to GitHub
2. Update Claude Project documents (Handover, Changelog, Roadmap, Briefing)
3. Confirm id=73 and id=74 Supabase rows exist (or revert those links first)
4. Review all SUGGESTED COPY blocks on welcome.html before CWS push

---

## Phase checklist

- [x] Chat 64 — Panel redesign spec drafted
- [x] Chat 65 — all §10 open items locked, Step 0 workflow model, Phase 1 brief produced, onboarding mockups built
- [x] **Phase 1 — Palette migration + layout scaffold** (Chat 66) ✅
- [x] **Phase 2 — Filters overlay (Option C)** (Chat 67) ✅
- [x] **Phase 3 — Card redesign** (Chat 68) ✅
- [x] **Phase 4 — Panel chrome** (Chat 70) ✅
- [x] **Phase 5 — Settings page** (Chat 72) ✅
- [x] **Close button (Path C)** (Chat 74) ✅
- [x] **Phase 6 — Onboarding refresh** (Chat 75) ✅
- [x] **Phase 7A — Extension fixes + bug reporting tool** (Chats 76–78) ✅ — v0.6.2.0
- [x] **Phase 7B — Website polish** (Chat 79) ✅
- [ ] **Phase 8 — compare.html structural pass + bug reporting on compare.html** (design TBD)
- [ ] $/serving for protein powder — design session required (deferred during redesign)
- [ ] Prime scraping — investigate selector change (deferred during redesign)

### Alpha release — status
- [x] Screenshots taken (Chat 27)
- [x] Chrome Web Store — published unlisted (Chat 29)
- [x] Reddit posts live (Chats 29/30)
- [x] Reddit feedback received (Chat 38)
- [x] Bug reporting tool live ✅ (Phase 7A — Chat 78)
- [x] Website polish ✅ (Phase 7B — Chat 79)
- [ ] Confirm Supabase `bug_reports` table exists + id=73/id=74 rows exist
- [ ] Welcome page copy review (all SUGGESTED COPY blocks — including new report banner in search.js)
- [ ] r/vibecodedevs post
- [ ] Facebook post
- [ ] Test on a different setup (Mac or Chrome vs Edge)

### Infrastructure — status
- [x] GitHub Pages enabled + custom domain + HTTPS ✅
- [x] Kill switch active ✅
- [x] Supabase account + comparisons table
- [x] Chrome Web Store — published unlisted
- [x] Usage log — Google Sheet, 63 columns, fully in sync ✅
- [ ] Supabase `bug_reports` table — create before testing bug reporting flow
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

- [ ] Panel redesign Phases 1–8 complete
- [ ] Welcome page copy review (SUGGESTED COPY blocks)
- [ ] Bug reporting tool live + Supabase `bug_reports` table created + copy reviewed
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
- Pattern A+B (`(?)` icons + Help drawer) — future phase, see Pattern_AB_Note.md
