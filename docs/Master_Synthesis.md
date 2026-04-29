# Actually Useful — Master Advice Synthesis

*Compiled April 28, 2026 from 14 source documents: ChatGPT, Gemini (×2), Grok, Kimi (×2), DeepSeek, Pi, Bard, plus internal documents — Strategy_Summary_Apr26_Chat35, Session_Summary_2026-04-19, Session_Summary_Addendum_ClaudePro, gemini-ideas-synthesis, competitive-research-2026-04-14, Task_Overview, Chrome_Extension_Workflow_Optimization.*

---

## How to read this document

- **Topics are grouped by area:** workflow, code & quality, testers & feedback, marketing & outreach, monetization, features.
- **Each idea has my take** — payoff (1–5), difficulty (1–5), and where I land.
- **Disagreements between sources are flagged in callout boxes** — both sides shown, my reasoning given.
- **Already-done items are noted but not re-litigated.**
- **My take is opinionated.** Push back wherever it doesn't match yours.

A few patterns worth knowing before you dive in:

1. **The other AIs heavily over-recommend tooling.** Most of them suggest Cursor, Windsurf, Copilot, SonarCloud, vibe-collab, Build Together, Sentry, etc. You are one person with limited energy. The marginal value of each new tool drops sharply. Be skeptical.
2. **The other AIs heavily under-emphasize outreach.** Several gave detailed coding advice and skipped the actual problem (5 installs after 3 Reddit posts). Your Strategy_Summary is more honest here.
3. **The internal docs (Strategy_Summary, Session_Summary_2026-04-19) are stronger than most of the external AI advice.** They know the project. Trust them more.

---

## Section 1 — Workflow & Process

### 1.1 Project instructions / CLAUDE.md / system prompt

**What multiple sources said:**

- **Gemini, DeepSeek, Bard:** Create a `CLAUDE.md` file in your repo root. Put project context, coding standards, "I'm a non-coder, explain everything," anti-patterns to avoid. Claude reads it automatically.
- **Kimi:** Same idea — call it a "living system prompt" with file naming conventions, coding standards, anti-patterns the AI keeps getting wrong.
- **Session_Summary_Addendum_ClaudePro:** Set up Claude Project instructions. Short (~200 words), covering working rules, session start behavior, end-of-session checklist.
- **ChatGPT:** "Add a 'Coding Style' section to your about-me file."

> ⚠️ **Disagreement:** Gemini/DeepSeek want a `CLAUDE.md` *file in the repo*. Session_Summary_Addendum wants *Claude Project instructions in the UI*. These are different things.
>
> **My take:** You already have project instructions set up (the long preamble in this very chat is doing the job). A `CLAUDE.md` file in the repo only matters if you start using Claude Code (terminal tool). For your current chat-based workflow, the project instructions are the right layer. **Skip the repo file unless/until you adopt Claude Code.**

**My take overall:** Done. Your About_Me.md + project instructions + Briefing/Roadmap/Handover system already implements this advice better than any of these sources realize. **Payoff: already captured. Difficulty: n/a.**

---

### 1.2 The Briefing/Changelog/Roadmap/Handover system

**What sources said about it:**

- **Pi, Bard, Kimi, Gemini, ChatGPT:** Universally praised. "Gold standard." "Better than most professional developers."
- **Kimi:** Suggested adding `tech-debt.md`, `testing-checklist.md`, `bug-log.md`.
- **DeepSeek:** Suggested adding `HANDBOOK.md` and `TESTING.md` — basically renames of your existing files plus a "lessons learned" doc.
- **ChatGPT:** Suggested replacing end-of-session docs with structured checkpoints (features added, files changed, manually tested, known bugs, next step) — which is exactly what your Handover already does.
- **Pi:** Suggested adding `wins.md` for celebrating small wins. (Cute but unnecessary.)
- **Session_Summary_2026-04-19:** "The Handover is the real deliverable. A session that didn't produce a good handover is a signal the session went too long."

**My take:** Your existing 4-doc system is doing the work of all 5–7 docs the others suggest. **Don't add more files.** Resist doc sprawl.

The one piece worth considering: a **`bug-log.md`** specifically for "things Claude keeps getting wrong across sessions" (laundry sheet edge cases, mixed unit families, etc.). Not for tester bugs — for *AI-introduced* recurring patterns. **Payoff: 2/5 — Difficulty: 1/5.** Optional.

---

### 1.3 Should you use Claude Code?

This is the most-asked question across sources. There's strong disagreement.

> ⚠️ **Big disagreement:**
>
> - **Bard, Grok, Gemini:** Yes, with caveats. Bard says "use it for the heavy lift, chat for the vibe." Grok says start small, layer it in.
> - **DeepSeek:** Yes, take the 1-hour tutorial first.
> - **Kimi:** **No, not yet.** "Terminal-based, designed for developers comfortable with command-line workflows. Switching entirely could introduce friction without clear benefit for your current project scale."
> - **ChatGPT:** **No.** "Assumes more technical judgment, easier to let it make sweeping changes, less guardrails for beginners."
> - **Session_Summary_2026-04-19:** Stay on Sonnet 4.6 via Pro. Move docs into the GitHub repo, don't change the AI tool.
>
> **My take: Kimi and ChatGPT are right.** Claude Code is meaningfully more dangerous for someone who can't read code. Its core advantage is *editing files directly* — which means fewer human checkpoints between AI suggestion and disk. For someone who tests by using the thing, you don't actually want fewer checkpoints. You want more. The current "Claude proposes file → you save it → you reload extension → you test" loop is a *feature*, not a bottleneck.
>
> **Stay on Pro/Sonnet 4.6 in chat.** Revisit if and only if (a) the project hits 50+ files, (b) you're losing days to multi-file refactors, AND (c) you've gotten comfortable reading diffs in GitHub Desktop.

**Payoff of switching: probably negative right now. Difficulty: high. Skip.**

---

### 1.4 Should you use Cursor / Windsurf / GitHub Copilot?

- **Kimi:** Recommends Windsurf (free tier) as most beginner-friendly agentic IDE.
- **Grok:** Suggests Windsurf or Cursor; v0 by Vercel for the website.
- **Bard, Gemini:** Don't recommend these.
- **ChatGPT, Session_Summary_2026-04-19:** Explicitly recommend *not* adding more tools.

**My take:** Same logic as Claude Code. These tools assume you can read code and judge whether the AI's edits are sane. You can't (yet). Adding them now creates a new failure mode without solving an existing one.

**If you ever do add one:** Cursor, not Windsurf. Wider adoption, better community, more material when you get stuck.

**Skip. Payoff: 1/5 right now. Difficulty: 4/5 (real learning curve).**

---

### 1.5 Other workflow tools the AIs suggested

| Tool | Suggested by | What it does | My take |
|---|---|---|---|
| **VS Code** | Grok | Local code editor | You don't edit code. Skip. |
| **Sentry** | Gemini | Error monitoring — pings you when extension crashes on a user's machine | **Worth considering** when you have 100+ users. Not now. **Payoff: 4/5 later, 1/5 now. Difficulty: 3/5.** |
| **ESLint + Prettier** | ChatGPT, Kimi, Grok, Pi | Code linting / formatting | Asking Claude to "format this cleanly" achieves 80% of the value with 0 setup. Skip. |
| **Jest tests** | ChatGPT, Grok | Automated testing | You test by using the thing. Automated tests would require you to maintain code you can't read. Skip. |
| **Playwright smoke tests** | Gemini | Weekly automated check that your panel still appears | **Tempting but premature.** Builds on a stack you don't own. Skip until post-alpha. |
| **SonarCloud** | DeepSeek | Automated code review on every commit | Free for open source. **Maybe worth one experiment** to see if it surfaces real issues vs. noise. **Payoff: 3/5. Difficulty: 2/5.** |
| **vibe-collab** | DeepSeek | Multi-AI orchestration | "For a solo developer with one AI, this is overkill" — DeepSeek's own caveat. Skip. |
| **Build Together (MCP)** | DeepSeek | Project tracker that AI can read/write | You already have a project tracker (your roadmap.md). Skip. |
| **Gitingest / Repo2txt** | Gemini | Dump your codebase into one text file for AI context | You already upload files at session start. Skip. |
| **GitHub Issues** | Gemini, Kimi, Session_Summary_2026-04-19 | Use for tester bug reports | **Worth setting up.** You'll need a place for bug triage when feedback ramps up. **Payoff: 3/5. Difficulty: 1/5.** |
| **Branches in Git** | ChatGPT, Pi, Kimi | Feature branches instead of working on main | **Worth doing for risky changes.** GitHub Desktop makes this one click. Use a branch when you're trying something experimental. Don't bother for small fixes. **Payoff: 2/5. Difficulty: 1/5.** |
| **Loom** | Strategy_Summary_Apr26 | For the demo video | **Yes** — already in your strategy doc. **Payoff: 5/5. Difficulty: 2/5.** |

---

### 1.6 Process improvements that aren't tools

**"Definition of done" before each feature** (ChatGPT)
> Before any feature, ask: "What does success look like? Button appears, click triggers X, data saved, no console errors." Then verify manually.

My take: **Worth adopting as a habit.** You already do "I test, I don't read code" — formalizing the test criteria upfront makes that more rigorous. **Payoff: 4/5. Difficulty: 1/5.**

**"One decision surface per session"** (Session_Summary_2026-04-19)
> Polish items together = one surface. Architecture change = one surface. Mixing them is where sessions go wrong.

My take: **Already in your Roadmap.md working rules.** Trust it.

**Confirm-before-committing pause** (Session_Summary_2026-04-19)
> Pause between "files produced" and "push to GitHub." Test first, commit after.

My take: **Already in your Roadmap.md.** Trust it.

**End-of-session retrospective** (Session_Summary_2026-04-19)
> One line: "felt good / felt rushed / got stuck on X." For pattern recognition.

My take: **Worth trying.** A single sentence in the Handover. Costs nothing. **Payoff: 2/5. Difficulty: 1/5.**

**Reset context periodically** (ChatGPT)
> Every few sessions, ask: "Summarize current architecture in plain English." If it sounds messy → it is messy.

My take: **Worth doing once a month.** Surface check on whether the codebase has drifted into spaghetti. **Payoff: 3/5. Difficulty: 1/5.**

**Visual debugging — paste screenshots of broken UI** (Gemini)
> Take a screenshot of the extension's broken state and upload it with your prompt.

My take: **Already standard practice for you.** Trust it.

**Force scope tightness in prompts** (ChatGPT)
> "Modify only X file. Do not change unrelated logic. Explain changes before applying."

My take: **Already in your standing rules** ("targeted str_replace edits, not full rewrites"). Trust it.

---

## Section 2 — Code, Quality & Resilience

### 2.1 Selector resilience — the single biggest code risk

This came up in **almost every external doc** — and it's the same point you've been internalizing.

- **ChatGPT:** Most detailed treatment. "Stop targeting brittle selectors. Anchor to stable patterns: `data-*` attributes, ARIA labels, text patterns ('$', 'per', 'ounce'), relative structure. Build a layered extraction system: raw → parsed → validated. Multi-strategy extraction with fallbacks." This is the single best piece of technical advice in any of the docs.
- **Strategy_Summary_Apr26:** "CSS selectors and class names from Amazon. Your scraping relies on `.priceToPay`, `.a-price-whole`, etc. Amazon changes these every few months. Each change breaks scraping silently. Add a self-test mode."
- **Bard:** "Manifest V3 Knowledge: permissions live in manifest.json."
- **Gemini, gemini-ideas-synthesis:** Pull all selectors into a named object at the top of the file.
- **Session_Summary_2026-04-19:** Same — selector resilience listed as Web Store prep.

**My take:** This is the most important technical work on the horizon, and it's been a "🟡 Before Web Store" item for a while. You don't have to do all of ChatGPT's layered extraction architecture — but you should:

1. **Add a self-test mode** (Strategy_Summary's idea). On a known search ("paper towels"), verify N results with prices/units. If not, banner: "Actually Useful may be out of date." **Payoff: 5/5. Difficulty: 3/5.** Highest-leverage quality work you can do.
2. **Pull all selectors into a named object.** When Amazon changes, you fix in one place. **Payoff: 4/5. Difficulty: 2/5.**
3. **Multi-strategy extraction (fallback selectors).** Try `.priceToPay`, fall back to `.a-price`, fall back to `[data-cy="price-recipe"]`. **Payoff: 4/5. Difficulty: 3/5.**

> **One session, just for this, post-SNAP testing.** It's the difference between "Actually Useful broke today" and "Actually Useful gracefully degraded today." The hardest part of running an Amazon-scraping extension is *staying alive*.

---

### 2.2 Fail loud at system level, fail quiet per item

**ChatGPT:** "Fail loud at the system level, fail quiet per item. 90% parse, 10% don't = normal. 90% don't parse = user needs to know."

**Strategy_Summary_Apr26:** Same principle.

**My take:** You already partially do this (sparse-data fallback to price-asc). Codifying it as an explicit threshold + banner is the natural next step. Pairs naturally with the self-test mode above.

**Payoff: 4/5. Difficulty: 2/5 (combine with self-test session).**

---

### 2.3 Code organization / refactoring

- **Strategy_Summary_Apr26:** "search.js does parsing, scraping, sorting, rendering, and state. Amazon changes one thing, you edit in five places. Post-alpha, separate the 'scrape one card → object' function from everything else."
- **DeepSeek:** "Watch for over-engineering. Every few sessions, ask Claude: 'Look at our largest file. Can any of this be deleted or simplified without breaking functionality?'"
- **ChatGPT:** "Keep your parsing rules explicit (not magical). Avoid giant regex blobs Claude keeps rewriting. Small named functions: parseOunces(), parseCount(), parseMultiPack()."

**My take:** Real concern. search.js is large and does too many things. But this is **post-alpha work** — a refactor session right now risks regressions for no user-visible benefit. Park it. Revisit after feature freeze.

**Payoff: 3/5 (long-term sustainability). Difficulty: 4/5. Defer to post-alpha.**

---

### 2.4 The "Golden Snapshot" / safe rollback

- **Bard:** Tag stable commits in GitHub Desktop. If Claude fails to fix a bug after 3 attempts, roll back. Don't keep trying.
- **Pi:** "Use branches… if something breaks, you can switch back to main safely."

**My take:** Solid. The "rollback after 3 failed attempts" rule is genuinely useful — better than your current "try again, frustrated" pattern. Tag your last known-good commits. **Payoff: 3/5. Difficulty: 1/5.**

The mechanic in GitHub Desktop:
1. Right-click the commit you want to mark stable
2. "Create tag" → name it (e.g., `stable-pre-snap`)
3. Push tags

When something breaks: right-click that commit → "Reset to this commit."

---

### 2.5 Multi-model code review

- **Gemini:** "Every 2 weeks, take your core logic file and feed it to Gemini 1.5 Pro or GPT-5. Ask: 'I built this with Claude. Can you find any math errors or performance bottlenecks?'"
- **Bard:** Same — start a fresh chat with a different model and ask for a security audit.
- **DeepSeek:** Recommends automated review tools (SonarCloud, Codacy AI Reviewer).

**My take:** **Worth doing once.** Take your search.js, paste it to Gemini or ChatGPT, ask: "What are the top 5 bugs or vulnerabilities you can find?" One session, a free outside opinion. If it surfaces real issues, repeat occasionally. If it's just noise, drop it.

**Payoff: 3/5 (one-time experiment). Difficulty: 1/5.**

---

### 2.6 Specific bugs flagged in external docs

| Bug / Concern | Source | Status |
|---|---|---|
| Affiliate tag in core.js was a "smoking gun" | Gemini, Session_Summary_2026-04-19 | ✅ Fixed Chat 13 |
| Rating filter not working | Session_Summary_2026-04-19 | ✅ Fixed Chat 13 |
| product.js running on every /dp/* | Session_Summary_2026-04-19 | ✅ Disabled Chat 13 |
| Page-fetch throttling needed | Gemini, Session_Summary_2026-04-19 | ✅ Done Chat 14 (750ms) |
| auSendLog blocked by CSP | Session_Summary_2026-04-19 | ✅ Moved to background.js Chat 14 |
| Mixed unit families in same sort | Roadmap, Briefing | 🟡 Open issue |
| Laundry sheet edge cases | Roadmap | 🟡 Post-alpha |
| Other discount types not captured | Roadmap | 🟡 Post-alpha |

All previously-flagged red-flag bugs are closed. Outstanding items are known.

---

### 2.7 Variation pricing & "Frequently Returned"

- **Strategy_Summary_Apr26 (very thorough):** Variation pricing — partial detection on search page is feasible. Just detect that variations exist and show "⚠ Has size/color variants." 2-hour change. Frequently Returned — product page only, deferred until product.js re-enabled.

**My take:** Strategy_Summary already covers this well. The `hasVariations` quick-win is probably worth one session post-SNAP-testing. **Payoff: 3/5. Difficulty: 2/5.**

---

### 2.8 Persistent storage for shortlist (cross-session)

This is on your post-alpha roadmap and isn't really debated — it's just a "later" item.

**Strategy_Summary_Apr26:** "Cross-session shortlist persistence — bigger than it sounds. Real shoppers research over days."

**My take:** Agree this is bigger than it sounds. Probably the single most impactful post-alpha extension feature. **Payoff: 5/5. Difficulty: 3/5. Post-alpha.**

---

## Section 3 — Testers & Feedback

### 3.1 The honest core diagnosis

**Strategy_Summary_Apr26:** "Five installs after three Reddit posts means your channels are wrong, not your product." This is the most important thing in any of the documents and the rest of this section flows from it.

You've been advertising to developers (r/ClaudeAI, r/chrome_extensions, r/vibecodingcommunity). Your target users are frugal shoppers, not developers.

---

### 3.2 Where to find actual testers

> ⚠️ **Sources broadly agree but emphasize different communities:**

**Strategy_Summary_Apr26 (most thorough):**
- r/Frugal (2M+) — strict no-self-promo, but answer questions organically
- r/PennyPinching, r/Coupons, r/AmazonDeals
- r/Parenting, r/Disability, r/HomeAutomation
- r/assistive_technology
- The Non-Consumer Advocate, The Frugal Girl (bloggers)
- Buy Nothing Facebook groups (local)
- Mastodon #frugal and #accessibility tags
- **Subs that allow project posts:** r/SideProject, r/alphaandbetausers, r/betatests, r/TestMyApp, r/somethingimade, r/InternetIsBeautiful, r/coolgithubprojects
- **Bigger one-shots:** Show HN, Product Hunt, Indie Hackers

**Kimi:** r/amazon, r/Frugal, r/BuyItForLife, Show HN (skeptical of AI tools, leads with problem), Indie Hackers.

**Bard:** r/chrome_extensions, r/AmazonPrime, r/Preppers, r/SideProject, X with #Vibecoding. Slickdeals, Bogleheads.

**Gemini:** r/Agent_AI, r/ClaudeAI (already done), r/ChromeExtensions, X #VibeCoding/#BuildInPublic, Slickdeals, r/Frugal.

**Grok:** r/vibecoding, r/ClaudeAI.

**My take:** Strategy_Summary has the best list. The key insight all the AI docs miss except Strategy_Summary: **frugal shoppers, not developers.** Bard's Slickdeals/Bogleheads suggestions are the second-best because they're high-volume Amazon shoppers obsessed with unit prices.

**Priority order:**
1. **r/SideProject** with the demo video. Built for "I built this" posts. **Payoff: 4/5. Difficulty: 1/5.**
2. **r/alphaandbetausers** specifically asking for testers. **Payoff: 3/5. Difficulty: 1/5.**
3. **Slickdeals or r/Frugal** — answer questions organically over time, mention your tool when relevant. Long game. **Payoff: 5/5. Difficulty: 3/5.**
4. **Email Frugal Girl / Non-Consumer Advocate** with the demo video, pitch the accessibility/retiree angle. **Payoff: 4/5. Difficulty: 2/5.**
5. **Show HN / Product Hunt** — only when polished and ready for one shot. Do not waste these. **Payoff: 5/5. Difficulty: 2/5 (the post itself; high stakes).**

---

### 3.3 The friction problem

**Strategy_Summary_Apr26:** "Even motivated frugal shoppers won't install an unlisted Chrome Web Store extension from a stranger on Reddit. Two things help: (1) demo video, (2) public CWS listing."

**My take:** This is the single most important diagnostic in any document. **Demo video is highest-leverage thing on your list.** Public CWS listing is the second.

You are stuck in a loop right now: can't get installs because unlisted/no-video, can't justify going public because no installs to validate quality. The demo video breaks it.

**Demo video — Payoff: 5/5. Difficulty: 3/5 (about 2 hours of work, 1 hour real recording, on a clear day).**

---

### 3.4 What testers should actually test

- **Strategy_Summary_Apr26:** Lists ~100 stress-test searches across categories: tools/hardware, crafts/office, pet supplies, personal care small sizes, baby/kids, health/medical, single-unit categories, international/metric, title-mess categories.
- **DeepSeek:** Specific test checklist for testers — "price-per-unit sorting across 5+ pages, excluding -bundle, unit conversion, delivery sorting."
- **Gemini:** Test laundry detergent "price per load" — "the Final Boss of Amazon unit-sorting bugs."
- **Pi:** Five categories of tester questions (broken/confusing UI, math accuracy, keyword filters, persistence, mobile/responsiveness).

> ⚠️ **Disagreement on what "testing" means:**
>
> **Strategy_Summary_Apr26:** *You* test these categories yourself, build a bug-test spreadsheet, log results.
>
> **DeepSeek/Pi:** Provide a structured checklist *to testers*.
>
> **My take:** Both. Use Strategy_Summary's category list to test internally before you ship to testers. Then a shorter 4-5 item checklist for testers. You can't ask testers to do 100 searches — they won't. But you CAN do 100 searches yourself, one category per session.

**My take:** **Strategy_Summary's "one category per test session" approach is exactly right.** Build a bug-test spreadsheet. **Payoff: 4/5. Difficulty: 2/5.**

For tester guidance, use a tighter list: 4-5 items maximum, with a console-error capture instruction (DeepSeek's idea — paste any red console errors).

---

### 3.5 Structured feedback

- **Pi:** Structure the form with categories (bug report / UI suggestion / feature request / just saying hi).
- **DeepSeek:** Require fields — what page, what clicked before, what expected, what happened, console screenshot.
- **Gemini:** Ask for screenshots, especially of console (F12).
- **Strategy_Summary_Apr26:** Build a bug-test spreadsheet (search term, expected, actual, version, status).

**My take:** Your current form is fine for now. The version field auto-pre-fills, which is the most important capture. **Don't redesign the form yet — wait for actual feedback patterns.** Once you have 10+ submissions and they cluster around the same gaps (e.g., people not knowing what was on screen when it broke), then add fields.

For internal tracking, **a simple Google Sheet (search term / expected / actual / version / status) is the right move when feedback starts coming in.** GitHub Issues is the alternative, slightly more friction but better long-term.

**Payoff: 3/5 internal tracking, 1/5 form changes for now. Difficulty: 1/5.**

---

### 3.6 Patterns in tester feedback ("Aha moments")

- **Pi:** "Capture aha moments verbatim — when a tester says 'I didn't realize Amazon's own brand was more expensive per ounce!' — use that exact phrasing as marketing copy."
- **gemini-ideas-synthesis:** Same.

**My take:** Solid. Add a section to your Handover or a separate `aha.md` for tester quotes. **Payoff: 3/5. Difficulty: 1/5.**

---

### 3.7 "Bug bounty" / Tester Hall of Fame

- **gemini-ideas-synthesis, DeepSeek:** Tester credit on the website. Costs nothing.

**My take:** Cute. Skip until you have 5+ active testers. Premature now.

**Payoff: 1/5 now, 2/5 later. Difficulty: 1/5.**

---

## Section 4 — Marketing, Outreach & Positioning

### 4.1 The accessibility / retiree angle

> ⚠️ **Disagreement worth flagging:**
>
> - **Kimi:** Hesitant. "'Built by a retired non-coder using Claude' is a great authenticity hook for some audiences, but test whether it builds trust or undermines it. Some users will think 'this is impressive,' others will think 'this might break.'"
> - **Strategy_Summary_Apr26:** Lean in. "'Built by an autistic, disabled retiree who got fed up with Amazon' resonates with frugal communities, accessibility communities, and tech press."
> - **Bard, Gemini, Pi:** All recommend leaning into the angle for marketing.
>
> **My take: Strategy_Summary is right.** The audiences you're targeting (frugal shoppers, accessibility communities, indie hackers) **specifically respond well to authentic personal stories.** Where Kimi is right: don't lead with it on the CWS listing or for tech-savvy audiences who'll wonder about quality. Lead with the *problem* and the *features* there.
>
> **Two different copy versions:**
> - **For r/SideProject, Show HN, Product Hunt, frugal blogs:** lead with the story.
> - **For CWS listing, X/Twitter posts to dev community:** lead with the features.

---

### 4.2 The demo video

This is **the single most-recommended action across all documents combined**, and Strategy_Summary_Apr26 has the most thorough treatment of it (entire dedicated section).

**Universal advice across docs:**
- 60–90 seconds (Strategy_Summary), 75 seconds target
- Show: problem → open extension → sort → filter → shortlist → compare → CTA
- Use Loom (recommended by Strategy_Summary) or Windows Game Bar (free)
- Don't apologize on camera
- End with `actuallyuseful.net` on screen
- Host on YouTube unlisted + Loom + embedded on landing page

**My take: this is the highest-leverage item on your entire roadmap.** Everything compounds off it. Outreach without it underperforms; outreach with it converts. **Payoff: 5/5. Difficulty: 3/5 (about 2 hours including breaks; emotionally non-trivial).**

---

### 4.3 Copy / positioning for non-developer audiences

- **Strategy_Summary_Apr26:** "Lead with a specific saving, not a feature list. Pattern: 'Sort 200 Amazon results by real price-per-unit, even when Amazon won't' / 'See coupons and Subscribe & Save discounts factored into the actual price' / 'Find the cheapest [laundry pods / coffee / anything].'"
- **gemini-ideas-synthesis:** Web Store SEO keywords — "Amazon Price Tracker," "Sort by Price per Ounce," "Hide Amazon Ads."
- **competitive-research:** "Click For Savings as the CTA is warm and benefit-focused" (Jungle Search) — worth studying that tone.

**My take:** Your current copy is more abstract than it needs to be. The frugal shopper version is concrete. Worth a copywriting session to update:
- CWS listing description
- index.html landing page hero text
- Reddit post templates
- Demo video script

**Payoff: 4/5. Difficulty: 2/5.**

---

### 4.4 Public CWS listing

- **Strategy_Summary_Apr26:** Submit to public CWS listing when 50 weekly active installs + 500 monthly site visitors.
- **Kimi:** "You're past the point where you can easily yank a bad build."

**My take:** Strategy_Summary's threshold is reasonable. Public listing makes the demo video work harder (people can find it themselves, read reviews). But Kimi's caveat is real — once public, a bad release lives in the wild. **Pair the public-listing decision with the self-test mode + selector resilience work.** Don't go public on shaky scraping.

**Payoff: 4/5. Difficulty: 1/5 (one CWS dashboard click, plus screenshots).**

---

### 4.5 Feature flag / "kill switch" infrastructure

- **Kimi:** "Consider adding a simple feature flag system — a way to disable new features remotely if they break for users, without pushing a new extension version through review. Even a JSON file on GitHub Pages that the extension checks on load can work as a poor man's kill switch."
- **Strategy_Summary_Apr26:** "Can you revoke a bad version? CWS lets you take a version down, but old installs keep it. Plan for 'this version has a bug — please reload.'"

**My take:** Underrated. CWS review is 1–3 days, which is slow when you have users. A simple JSON kill-switch (extension checks `actuallyuseful.net/status.json` on load; banner if disabled) is **a 1-session feature with significant safety value.** Consider before going public.

**Payoff: 4/5 (post-public). Difficulty: 2/5.**

---

### 4.6 Specific marketing tactics — ranked

| Tactic | Source | My take |
|---|---|---|
| Demo video | All docs | **#1 priority. Payoff 5/5.** |
| r/SideProject post with video | Strategy_Summary, Bard | **#2. Payoff 4/5.** |
| Email frugal bloggers (Frugal Girl, Non-Consumer Advocate) | Strategy_Summary | **#3. Payoff 4/5.** |
| Public CWS listing + reviews | Strategy_Summary, Kimi | **#4 (after self-test mode). Payoff 4/5.** |
| Show HN | Strategy_Summary, Kimi | **One-shot when polished. Payoff 5/5.** |
| Product Hunt | Strategy_Summary, gemini-ideas-synthesis | **One-shot when polished. Payoff 5/5.** |
| LinkedIn / X "built with Claude" angle | gemini-ideas-synthesis, Bard | **Payoff 3/5.** Tag Anthropic. Different audience than frugal shoppers. |
| Tech press (Lifehacker, CNET) "enshittification" angle | gemini-ideas-synthesis | **Payoff 3/5.** Pitch only when polished. |
| TikTok / Reels satisfying-cleanup video | gemini-ideas-synthesis, Strategy_Summary (skip) | **Skip for now.** Different format, different production work. |
| Slickdeals / r/Frugal organic answers | Bard, Strategy_Summary | **Long game. Payoff 5/5 over 6+ months. Difficulty 3/5 (sustained effort).** |
| Mastodon #frugal #accessibility | Strategy_Summary | **Low effort. Payoff 2/5.** |
| Buy Nothing Facebook groups | Strategy_Summary | **Local relevance. Payoff 2/5 (only if comfortable).** |
| Bug bounty / Tester Hall of Fame | gemini-ideas-synthesis | **Skip until 5+ testers.** |

---

### 4.7 The single highest-leverage action

**Strategy_Summary_Apr26's closing line is correct:** "Make the demo video. Everything else compounds off it."

Repeating because every document essentially agrees and it's worth saying again.

---

## Section 5 — Monetization, Affiliate, Website

### 5.1 Amazon Associates timing

- **Strategy_Summary_Apr26 (most thorough):** "Not yet, and probably not for a while. Amazon rejects no-traffic applications and terminates accounts that don't generate three qualifying sales in 180 days."
  - Apply when: 50+ weekly active installs AND ~500+ monthly site visitors AND credible path to 3+ sales/month.
  - In meantime: create Amazon account (no cost), draft application narrative, don't put placeholder affiliate tags in code.
- **gemini-ideas-synthesis:** Affiliate links in extension are a "smoking gun" Amazon policy violation. ✅ Already removed from core.js.
- **Kimi:** "Make sure your CWS listing and privacy policy clearly disclose this future plan."

**My take:** Strategy_Summary's framework is exactly right. Three concrete actions:

1. **Create the Amazon account** (prerequisite, no cost). **Payoff: 2/5 now. Difficulty: 1/5.**
2. **Draft the Associates application narrative.** Have it ready. **Payoff: 2/5 now (high payoff later). Difficulty: 2/5.**
3. **Don't apply until thresholds met.** A rejected application is worse than no application.

---

### 5.2 The website / compare page

This was **a major discussion topic in Session_Summary_2026-04-19** and remains your monetization engine. Already mostly built. Three things on your roadmap that are worth re-examining:

**Lazy product-page fetch architecture** (from Strategy_Summary_Apr26)
> "User sees table immediately with search data. Background fetches enrich progressively (Frequently Returned, variation warnings, Sold by populate as they arrive). Partial failures degrade gracefully."

My take: Best path forward for adding "Frequently Returned" without re-enabling product.js as content_script. **Payoff: 4/5. Difficulty: 4/5. Post-alpha.**

**Inline notes editing on compare.html** (already on roadmap)
**Payoff: 3/5. Difficulty: 2/5. Post-alpha.**

**Standalone power search form on website** (Session_Summary_2026-04-19, Jungle Search precedent)
- The Jungle Search model proves a website-only affiliate tool can stand alone
- competitive-research: "actuallyuseful.net could function as a power search tool that hands off to Amazon AND activates the extension if installed"

My take: **Park this for now.** It's the third branch of the website (compare ✓, search ?) and post-alpha territory. The compare page is where intent traffic is highest; the search page is speculative.

---

### 5.3 What never to do

Universal across docs and confirmed by Amazon's actual policy:
- **Affiliate tags inside the extension:** Forbidden. ✅ Removed.
- **Paywalled features:** Multiple AIs suggested freemium ("notes feature freemium gating," "cloud sync as Pro tier"). **Skip.** Free always is part of your brand. A paid tier creates an incentive to make the free tier worse. (Session_Summary_2026-04-19 explicitly nailed this.)
- **Ads:** Same.
- **Selling user data:** Same.

---

### 5.4 Ko-fi / tipping

Already in place. No real disagreement among sources.
- **gemini-ideas-synthesis:** Ko-fi nudge timing — 30-day floor, usage trigger, permanent dismiss.
- **Roadmap.md:** Currently removed; redesign post-alpha.

**My take:** Trust the roadmap. Nudge mechanic was annoying users. Redesign carefully when post-alpha.

---

## Section 6 — Feature Ideas

### 6.1 The feature freeze recommendation

**Strategy_Summary_Apr26:** "After SNAP EBT ships, **stop adding features for 30 days** and put that energy into outreach. Features without users is a hobby; users without features is a startup."

**My take: this is the most important strategic line in any of the docs.** I want to flag it because it's easy to read and forget.

The temptation when faced with "the product needs more polish" is to keep adding. The actual gap is **users → feedback → directional clarity on what to build next.** Without users, you're guessing about every feature priority.

---

### 6.2 Features specifically suggested by external docs

| Feature | Source | My take |
|---|---|---|
| **Hide this seller forever** | Strategy_Summary | **Differentiating, doesn't exist anywhere else.** Post-alpha. **Payoff: 4/5. Difficulty: 3/5.** |
| **Price-per-serving for food** | Strategy_Summary | When title contains "X servings." **Payoff: 3/5. Difficulty: 3/5.** Post-alpha. |
| **"Cheaper at Whole Foods/Fresh" alert** | Strategy_Summary | Cross-source price flagging. **Payoff: 4/5. Difficulty: 4/5.** Post-alpha. |
| **Persistent ignored ASINs** | Strategy_Summary | Hide specific products permanently. **Payoff: 3/5. Difficulty: 2/5.** Post-alpha. |
| **First-install welcome page** | Strategy_Summary, gemini-ideas-synthesis, competitive-research, Bard | **Strong consensus.** **Payoff: 4/5. Difficulty: 2/5.** Within 1 month. |
| **Onboarding pointer overlay on first install** | Strategy_Summary | Bigger lift than welcome page. **Payoff: 4/5. Difficulty: 4/5.** Post-alpha. |
| **Climate Pledge Friendly badge** | Strategy_Summary | **Payoff: 2/5. Difficulty: 2/5.** Post-alpha. |
| **Small Business badge** | Strategy_Summary, Task_Overview | **Payoff: 2/5. Difficulty: 2/5.** Post-alpha. |
| **Lightning Deals countdown** | Strategy_Summary | **Payoff: 2/5. Difficulty: 3/5.** Post-alpha. |
| **Add to Cart from panel** | competitive-research (Unit Price Shopper does this) | **Skip.** You've already decided "not sure" — keep there. |
| **Wishlist integration** | Strategy_Summary | **Skip.** Amazon API needed. |
| **Price history (Keepa link)** | gemini-ideas-synthesis, Task_Overview | Link out to Keepa, don't build. **Payoff: 3/5. Difficulty: 1/5.** Post-alpha. |
| **Variation pricing detection** | Strategy_Summary | "⚠ Has variants" footnote. ~one session. **Payoff: 3/5. Difficulty: 2/5.** Post-alpha. |
| **Discount % range filter** | competitive-research, gemini-ideas-synthesis | Unique among on-page tools. **Payoff: 3/5. Difficulty: 3/5.** Post-alpha. |
| **Min star rating filter** | competitive-research | **Already done.** ✅ |
| **Price range filter** | competitive-research | **Already done.** ✅ |
| **SNAP eligible filter** | competitive-research, gemini-ideas-synthesis | **Already done.** ✅ |
| **Condition filter (New/Used/Renewed)** | competitive-research | **Payoff: 2/5. Difficulty: 2/5.** Post-alpha. |
| **Cross-session shortlist persistence** | Strategy_Summary, Roadmap | **Payoff: 5/5. Difficulty: 3/5.** Post-alpha priority. |
| **"Frequently Returned" badge** | gemini-ideas-synthesis, Roadmap | Deferred until product.js. Or: lazy compare-page fetch. **Payoff: 4/5. Difficulty: 4/5.** Post-alpha. |
| **Native browser side panel** | competitive-research | Fundamentally different positioning. **Payoff: 3/5. Difficulty: 4/5.** Worth evaluating but not priority. |
| **Sliders for numeric controls** | competitive-research, gemini-ideas-synthesis | Already partially done (pages, rating). **Payoff: 2/5. Difficulty: 2/5.** |
| **Keyword filter on category pages** | DeepSeek tester pattern | If browse pages aren't supported, a frequent confusion. Verify scope. |
| **Price drop alerts on shortlist** | gemini-ideas-synthesis | High complexity. **Skip / post-1.0.** |

---

### 6.3 Things multiple AIs suggested that I think are wrong

**Settings page before users (Pi, gemini-ideas-synthesis suggests; Strategy_Summary correctly counter-suggests)**
> Strategy_Summary: "Don't build a settings page before you have users. Classic over-engineering trap."

**Skip.**

**Cloud sync / login system (gemini-ideas-synthesis, DeepSeek)**
> High complexity, low priority for current phase, contradicts "no paid tier."

**Skip.**

**B2B / Amazon Seller version (gemini-ideas-synthesis)**
> Different user, different product.

**Skip.**

**Notes freemium gating (gemini-ideas-synthesis)**
> Contradicts free-always positioning.

**Skip.**

---

## Section 7 — What "Done Enough" Looks Like

### 7.1 Strategy_Summary_Apr26's two questions

These deserve a dedicated section because nothing else in the source documents asks them, and they're the most important questions on the page:

> **"What does sustainable look like at 100 users? At 1,000?"**
>
> **"What does 'done enough' look like? 'I'll keep adding features forever' is the trap most solo projects fall into. Pick a v1.0 feature freeze line and stick to it."**

**My take:** Both questions are real and currently unanswered. Some loose framing, not as decisions but as starting positions:

**For sustainability at scale:** The biggest cost as users grow isn't features. It's:
- Bug reports per week
- Support emails
- Amazon-DOM-change emergency fixes (this is the real load)

**At 100 users:** Probably manageable as you currently work. Bugs might come weekly.

**At 1,000 users:** Without selector resilience and a kill switch, a single Amazon DOM change could mean 1,000 users seeing a broken extension while you sleep. **The self-test mode + kill switch are sustainability features, not just polish features.**

**For v1.0 feature freeze:** A reasonable working definition might be:
- Public CWS listing
- Cross-session shortlist persistence
- Self-test mode + multi-strategy extraction
- Welcome page on install
- Demo video on landing page
- Public actuallyuseful.net domain
- Affiliate links on compare page

That's a finite list. Anything beyond that — Walmart support, search page, advanced features — goes to v2.0.

This is your call. But I'd encourage you to write down a v1.0 list **before** you start building toward it, not after.

---

## Section 8 — Top 10 Recommendations Ranked

If you took only ten things from this entire document, in priority order:

| # | Action | Payoff | Difficulty | When |
|---|---|---|---|---|
| 1 | **Make the demo video.** | 5/5 | 3/5 | Within 1 week of SNAP testing |
| 2 | **Test SNAP EBT detection on real grocery searches.** | 4/5 | 1/5 | Next session |
| 3 | **Build self-test mode + multi-strategy selectors.** Highest-leverage code work. | 5/5 | 3/5 | Within 1 month |
| 4 | **Post on r/SideProject + r/alphaandbetausers with the demo video.** | 4/5 | 1/5 | After demo video |
| 5 | **Build the bug-test spreadsheet** + run Strategy_Summary's category checklist. | 4/5 | 2/5 | Within 1 week |
| 6 | **Email Frugal Girl + Non-Consumer Advocate** with demo video. | 4/5 | 2/5 | After demo video |
| 7 | **Add a kill switch** (JSON status check) before public CWS listing. | 4/5 | 2/5 | Within 1 month |
| 8 | **Create Amazon account + draft Associates narrative.** No-cost prep. | 2/5 now / 5/5 later | 2/5 | This month |
| 9 | **Write down a v1.0 feature-freeze list and stick to it.** | 4/5 | 1/5 | This week |
| 10 | **Update copy** (CWS, landing page, Reddit templates) to lead with concrete savings, not feature lists. | 4/5 | 2/5 | Within 1 month |

---

## Section 9 — What to Skip

Saying no is harder than saying yes. These are the items I'd actively recommend **not** doing:

- **Claude Code / Cursor / Windsurf / GitHub Copilot.** Not yet. Maybe never. Adds risk without solving a current problem.
- **More Markdown docs** (tech-debt, testing-checklist, bug-log, handbook, wins, testers, aha — every AI suggested at least one). Your current 4 docs are sufficient. The optional `aha.md` for marketing copy is the only addition I'd consider.
- **Automated testing frameworks** (Jest, Playwright, ESLint enforcement). You can't read or maintain the test code. The cost-benefit is wrong.
- **Multi-AI orchestration** (vibe-collab, Build Together, etc.). Solo dev with one AI = overkill.
- **A settings page** before alpha users. Classic over-engineering.
- **Cloud sync / login systems.** Contradicts free-always.
- **Freemium gating on any feature.** Contradicts brand positioning.
- **TikTok content.** Different format, different production effort, wrong audience for now.
- **Bug bounty / Tester Hall of Fame.** Premature when you have <5 active testers.
- **B2B / Amazon Seller pivot.** Different product entirely.
- **Daily Apps Script monitoring.** Premature; logs aren't reliable enough yet to drive alarms.

---

## Section 10 — Source Document Notes

**Internal documents (highest credibility — they know the project):**
- **Strategy_Summary_Apr26_Chat35** — Best document in the set. Strategic clarity, specific actions, honest diagnosis.
- **Session_Summary_2026-04-19** — Strong code review, strong process advice.
- **Session_Summary_Addendum_ClaudePro** — Concise on Claude features.
- **gemini-ideas-synthesis** — Triaged Gemini ideas with disposition. Saves time.
- **competitive-research-2026-04-14** — Competitive matrix is the unique value here.
- **Task_Overview / Task_Overview (1)** — Task lists, mostly outdated.

**External AI documents (general advice — varies in usefulness):**
- **ChatGPT** — Best on code resilience and selector strategy. Specific. Earned.
- **Strategy_Summary already-incorporated wisdom** — much external advice is downstream of internal docs.
- **Kimi** — Most balanced on tool recommendations. Honest about Claude Code tradeoffs.
- **Gemini** — Mix of good (sentry, screenshots) and over-engineered (canary tests).
- **Bard** — Strong on community/tester suggestions. Solid rollback advice.
- **Grok** — Heavy on tool name-drops (Cursor, Windsurf, OBS). Less differentiated.
- **DeepSeek** — Claims about specific tools (vibe-collab, Build Together, Conductor) feel generated; one-line caveats hidden in long pitches.
- **Pi** — Warm tone, occasionally substantive, mostly cheerleading.

---

*End of synthesis. Push back wherever this doesn't match how you see things — your judgment trumps mine.*
