# Session Summary — April 19, 2026 (Chat 11)

*Planning session with Claude. No code changed. Opus 4.7 model.*

\---

## What this session was

An outside-perspective review. Melissa asked Claude to critique the Actually Useful project fresh — code, process, strategy, tooling. Four topics covered:

1. Code critique (after reviewing all six extension files)
2. Website strategy for monetization
3. Process improvements for how Melissa and Claude work together
4. Other tools worth considering

\---

## Part 1: Code Critique

### 🔴 Red flags — act before alpha

**1. Minimum rating filter does nothing.**
The UI, slider, and filter logic all exist — but `r.rating` is never set anywhere in `scrapeCard()`. No `parseRating()` function exists. The Chat 6 changelog claims this was added; it was likely lost in that session's revert. Users raising the slider will see no effect and assume the extension is broken. **Small fix, high priority.**

**2. Product page script is still live on every `/dp/\*` visit.**
The manifest registers `product.js` on product pages despite the Briefing stating "deferred until after alpha." If Amazon has changed any of the scraped IDs (`#sfsb\_accordion\_head`, etc.), users are seeing a broken panel right now with nobody watching. Fix: comment out the second `content\_scripts` entry in `manifest.json`.

**3. Affiliate tag machinery still in `core.js`.**
`AU\_AFFILIATE\_TAG` is empty so nothing tagged is emitted today — but the mechanism is one line away from shipping a policy violation. Remove `AU\_AFFILIATE\_TAG` and `auTagUrl` entirely. No callers exist in the current code.

**4. Version strings inconsistent across four files.**
Manifest says 6.1.2, core.js AU\_VERSION says 6.1.2, search.js header comment says v6.1.3, styles.css says v6.1.0. Not a bug, but makes debugging harder and will bite during the sub-1.0 renumbering.

**5. Logger runs in content-script world.**
Amazon's CSP may silently block outbound `fetch()` calls from injected scripts. Move `auSendLog` to background.js via `chrome.runtime.sendMessage`. Already on roadmap — flagging that log gaps are probably already happening.

### 🟡 Real problems, not urgent

* Scripts aren't IIFE-wrapped (stray indentation in search.js suggests wrapper was stripped). Not a security issue in isolated world, but reviewer-flag risk.
* `.innerHTML` on the row template — Chrome Web Store reviewers scan for this. Defer to pre-submission.
* Page fetches run sequentially back-to-back with no delay. Gemini's "9 simultaneous" concern doesn't apply exactly, but rapid-fire credentialed requests can still trip rate-limiting. Add 500–1000ms delay between fetches.
* "Start over" button doesn't reset `selectedUnit` or `showCheckedOnly`. Minor inconsistency.
* Re-scan throws away the shortlist (`checkedAsins={}`). Consider preserving it on same-term re-scans.
* Nudge fires when keyword contains `-` — "t-shirt" triggers it accidentally.
* Ko-fi link in nudge (`ko-fi.com/tibbalsgribbin`) differs from footer link (`ko-fi.com/butactuallyuseful`). Check which is correct.
* `saveSearchContext` still fires every search even though product.js is "disabled" — dead write.

### 🟢 Things done well

* Callback pattern in core.js is consistently applied
* Duplicate ASIN handling across pages is correct
* Sparse-data fallback (isSparse → price-asc) is thoughtful UX
* `unitFamilyForSort` correctly prevents cross-family PPU comparisons
* `parseDeliveryDates` handles free/fastest/cutoff/qualifier well
* Liquid-dominant inference with solid-keyword suppression is pragmatic
* Best-value star excludes container PPUs correctly
* Error panel fallback is professional — most extensions silently fail
* Position/width/height persistence saves on mouseup, not mousemove (correct)

\---

## Part 2: Website Strategy

### The extension → website handoff

A "Compare side by side (N)" button next to the existing "Open in tabs (N)" on the shortlist bar. Opens `actuallyuseful.net/compare?data=…` (or Supabase-backed `/c/x7k2m`) with the user's shortlist rendered as a comparison table.

**Why this specifically:** The shortlist is qualified decision traffic — users who've narrowed 200 results to 8. That's the highest-intent moment in the whole flow. Affiliate tags applied on the comparison page (not in the extension) are clean Associates policy. The 24-hour cookie window covers subsequent purchases.

**What the comparison page must offer to justify the click:**

* Aligned side-by-side table (title, price, PPU, delivery, rating, sold by, ships from, coupon)
* Re-sort by any column, including ones Amazon hides
* Per-item notes that persist to the URL
* Shareable links — the organic growth vector no extension can offer

**Critical design constraint:** the page must work well for users who arrive from a shared link and don't have the extension. Strangling that vector strangles growth.

### The standalone search tool

Pushback on the Jungle Search framing: don't rebuild Amazon's sidebar in different colors. Build forms for queries Amazon makes hard:

* Discount range with a floor ("30%+ off")
* Condition + department (used lenses under $500)
* Small Business + high rating
* Multi-merchant comparison

**Key insight:** search URL state should be preserved so queries are bookmarkable and shareable. Jungle Search doesn't do this. Shared search URLs are a compounding SEO asset.

### How the pieces fit

The vision: `actuallyuseful.net` is a genuinely useful search-and-comparison tool *regardless* of whether you have the extension. Extension makes it more powerful; website works on its own. This means:

1. Every user becomes a potential advocate (shared links)
2. Extension and website reinforce each other
3. Hedges risk if Chrome Web Store or Manifest V4 ever breaks the extension

### Sequencing

1. **Comparison page first** — closes monetization loop, gives shortlist a destination, most likely to drive share-induced installs
2. **Supabase shareable links** second
3. **Standalone search** third — depends on the search-pain hypothesis, worth testing with real users before committing

### Monetization discipline

No ads. No paid tiers. No Pro version. The pitch is "we don't compromise on your behalf." A paid tier creates an incentive to make the free tier worse. Associates revenue compounds quietly if the product is good.

\---

## Part 3: Process Improvements

### Warm vs cold starts

Mark the handover: is Claude re-reading everything, or just the last Changelog? Same-day sessions don't need the full Briefing reload.

### The Handover is the real deliverable

More than Briefing or Roadmap. A session that didn't produce a good handover is a signal the session went too long or got scattered. Treat it as the canary.

### "One task per session" definition drift

The rule is healthy but fuzzy. Clearer framing: *one decision surface per session.* Polish items together = one surface. Architecture change = one surface. Mixing them is where sessions go wrong.

### Add confirm-before-committing

Pause between "files produced" and "push to GitHub" — test first, commit after. Catches bugs like the rating filter before they live on main.

### Add a one-line retrospective

At session end: "felt good / felt rushed / got stuck on X." Not for sharing, just for pattern recognition over time.

### Protect the stale-files protocol fiercely

It's engineered out the most common class of AI coding disasters. Don't let it get loosened for convenience.

### Add to Briefing: "How to know this session is going wrong"

Concrete warning signs — asking Melissa to hold multiple things in her head, repetition, changes landing without version bump, handover getting long. Two of those = stop.

### Design the feedback-to-action loop before alpha

Create a `Reports.md` file where tester feedback lands verbatim, read at session start. Low tech, high signal.

\---

## Part 4: Model \& Tooling

### On models

**Stay on Sonnet 4.6 via Pro.** It's the right model for your work. Opus shines on architectural/planning sessions where the whole shape is in flux (like this one) — but most of your sessions are implementation, where Sonnet is more than enough. Paying Opus rates for Sonnet-appropriate work is burning money.

**Cowork** is great but expensive because every agentic step is a full inference. Save it for specific big tasks (website scaffold, big refactors). Don't use it as a default environment.

**Max plan** is the right upgrade path if affiliate income grows — not API pricing or daily Cowork.

### Tools worth adding (one at a time)

**Top priority: move project docs into the GitHub repo.** Put Briefing, Roadmap, Changelog, Handover into a `docs/` folder alongside `extension/`. Eliminates stale-file class of problems entirely. Gives version history on the docs.

**Before alpha:**

* In-extension "Report a bug" button that pre-fills context (URL, version, browser)
* Daily Apps Script check that emails if zero-result sessions spike
* GitHub Issues for tester reports (don't add a separate bug tracker)

**Tools to specifically not add right now:**

* Notion / Obsidian / Linear (you already have the right stack)
* More AI tools beyond Claude + occasional Gemini
* Figma or design tools (not at that stage)
* Slack / Discord (no community yet)
* Analytics beyond simple page views
* Bug tracker other than GitHub Issues

### Use Claude for outside perspective

"Act as a Chrome Web Store reviewer." "You're a user who just installed this — walk me through what you'd try." "Argue against this plan." Free, effective, no interface switching.

\---

## Next Steps (priority order)

### This week

1. **Move project docs into GitHub repo** — put Briefing, Roadmap, Changelog, Handover into `docs/` folder. Single source of truth.

### Next coding session (Chat 12)

2. Fix the rating filter — add `parseRating()` and set `r.rating` in `scrapeCard()`
3. Disable `product.js` in manifest until it's been tested against current Amazon
4. Remove `AU\_AFFILIATE\_TAG` and `auTagUrl` from `core.js`
5. Align version strings across manifest, core.js, search.js, styles.css — and apply the sub-1.0 renumbering at the same time

### Before alpha

6. Move `auSendLog` to background.js (CSP reliability)
7. Add page-fetch throttling (500–1000ms between fetches)
8. Add "Report a bug" button that captures context
9. Verify feedback form has Gemini's three questions
10. Build comparison page on GitHub Pages
11. Supabase setup for shareable links
12. Test extension on a different setup (Mac, or Chrome vs Edge) via a tester

### Post-alpha

13. Standalone search form — only after validating which queries users actually want
14. Hidden data capture batch (SNAP, Small Business, Condition, etc.)
15. Review integrity signals + Keepa links
16. Two-way extension ↔ website connection

\---

## Key things to remember

* The rating filter bug is real and present in v6.1.2 — users raising the slider see nothing happen
* The product.js script is running on every `/dp/\*` visit despite being "disabled" in docs
* The comparison page is the highest-ROI next build because it closes the monetization loop
* The website must work for users who arrive via shared link without the extension
* Stay on Pro + Sonnet. Cowork is a specific-task tool, not a daily environment.
* Moving docs into the repo is the one tool change worth making right now.
* Outside perspective doesn't require another subscription — prompting Claude as a reviewer / user / skeptic works well.

\# Addendum — Claude Pro features review



\*Added to the April 19 session summary. Covers instructions, skills, connectors, preferences, styles, and memory.\*



\---



\## Project instructions — worth doing



Project-level custom instructions load into every session automatically, before Claude reads any documents. Would save tokens and ensure core working rules are never missed.



Keep it short (\~200 words). Should cover:

\- Who Melissa is, briefly (retired, Seattle, autistic, fibromyalgia — the context that shapes communication)

\- Core working rules (AskUserQuestion widget, confirm before coding, Melissa's wording for UI copy, code files not in project)

\- Session start behavior (read latest Handover first, fill in from Briefing/Roadmap as needed)

\- Session end checklist (Briefing, Changelog, Roadmap, Handover, commit message, push reminder)



About\_Me.md remains the deep reference. Instructions are the "always remember this" layer.



\*\*One session's work, benefits every future session. Do this week.\*\*



\## Skills — skip



Anthropic's built-in skills (docx, pdf, pptx, xlsx, frontend-design, etc.) already trigger when relevant. Nothing in Actually Useful's workflow needs a custom skill. The document templates are stable enough that they live in the existing documents themselves.



\## Connectors — don't add new ones



\- \*\*GitHub connector\*\* (if available): tempting but adds a new failure mode. Current upload-at-session-start protocol is low-tech but bulletproof. Revisit if Anthropic ships a clearly better GitHub integration.

\- \*\*Google Drive, Gmail, Calendar\*\*: already connected, not relevant to Actually Useful. Each connector adds a small amount of ambient prompt-injection risk. No reason to disconnect — just don't lean on them for this project.



\## User preferences — worth tightening



Currently just "I'm retired." User preferences apply globally across all Claude conversations, so should be universal, not project-specific.



Worth adding:

\- Preference for AskUserQuestion widget over prose questions

\- Preference for structured, direct communication with minimal fluff

\- Brain fog days — Claude should adjust pacing when signaled



Don't add: Actually Useful-specific content (belongs in project), long explanations.



Optional but useful if Claude is used for other tasks beyond this project.



\## Styles — not useful



Fixed writing voice would get in the way. Communication needs change per task.



\## Memory — leave off



Auto-memory would compete with the deliberate handover system. Might mix versions across revised decisions. The curated Handover.md pattern is better than auto-memory for this project.



\## Past chats search — exists, use when needed



Claude has a `conversation\_search` tool that can search across past chats in the project. Not a setting to configure — just a capability to know about. Ask Claude to search when "I feel like we talked about this before."



\---



\## Consolidated action



\*\*One thing to do this week: set up project instructions.\*\* Short, focused, covering working rules. Everything else in this list: skip.



The biggest gains won't come from more features. They'll come from the discipline already in place.

\---

*Session ran on Opus 4.7 because the broad critique was exactly the kind of task Opus handles better. Implementation work should go back to Sonnet.*

