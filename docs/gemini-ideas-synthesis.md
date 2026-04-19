# Ideas from Gemini Conversation — Synthesis
*April 17, 2026 — For review with Claude*

---

## How to use this document

Each idea has been tagged with a rough disposition to make triage easier:
- **✅ Already done or in progress** — no action needed
- **🔜 Near-term candidate** — fits AU's current direction
- **🔭 Later** — good idea, but not now
- **⚠️ Needs caution** — real risks or caveats to understand first
- **❌ Not for AU** — doesn't fit the project or the person

These are *starting positions for discussion*, not decisions.

---

## 1. Code quality & stability

### Selector resilience ("brittle selectors")
Gemini flagged that CSS class names like `.udm-primary-delivery-message` change frequently. Suggestion: pull all selectors into a named object at the top of the file so fixes only require changing one line.
> **Disposition: 🔭 Later** — worth doing before a Web Store launch, but not urgent right now.

### Page-fetch throttling
Loading 10 pages of results fires 9 simultaneous fetch requests, which could look like a bot to Amazon.  Suggestion: add a 500ms–1000ms delay between fetches.
> **Disposition: 🔜 Near-term candidate** — low effort, reduces ban risk.

### innerHTML → safer DOM rendering
Using `.innerHTML` to build the product list can draw scrutiny from Web Store reviewers (XSS flag). Suggestion: switch to `document.createElement`.
> **Disposition: 🔭 Later** — needed before Chrome Web Store submission, not before alpha.

### Keyword debouncing
The extension re-renders on every keystroke, which feels jittery. Suggestion: wait 250ms after the user stops typing before re-filtering.
> **Disposition: 🔜 Near-term candidate** — quick polish win, improves the feel immediately.

### Collapsible section animation
`max-height` transitions can stutter. Suggestion: use dynamic `scrollHeight` in JS or a `clip-path` approach instead.
> **Disposition: 🔭 Later** — minor polish; current animation is already good.

### product.js merchant scraper fail-safe
Scraping "Sold by / Ships from" using a specific ID (`sfsb_accordion_head`) will break when Amazon A/B tests that page. Suggestion: fall back to searching for the strings "Sold by" / "Ships from" inside the Buy Box container.
> **Disposition: 🔭 Later** — good defensive coding for before Web Store launch.

---

## 2. UX & visual polish

### Empty state message
When filters remove all results, the panel goes blank — looks broken. Suggestion: show a friendly message like *"No items match your filters. Try broadening your keywords."* with a "Clear All" link.
> **Disposition: 🔜 Near-term candidate** — small effort, makes AU feel much more finished.

### Best Value badge enhancement
Current badge is pale yellow (`#fff8e1`). Gemini suggested a subtle CSS pulse animation to draw the eye to the "winner."
> **Disposition: 🔭 Later** — nice-to-have; not urgent.

### System font stack
Replace `Arial, sans-serif` with `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` so the UI feels native on both Mac and Windows.
> **Disposition: 🔜 Near-term candidate** — one-line CSS change, real polish bump.

### Loading spinner for page slider
While pages are being fetched, the UI just "jitters." A simple CSS spinner would make it feel more professional.
> **Disposition: 🔭 Later** — valid, but not the priority right now.

### "Frequently Returned" badge — make it prominent
AU already scrapes the "Frequently Returned" label. Gemini suggested making it **red and bold** in the panel so it can't be missed.
> **Disposition: 🔜 Near-term candidate** — low effort, high user value.

### Icon resolution
The extension icons should not all be the same image scaled down. The 16×16 should be a simplified version so it doesn't look like a blur in the toolbar.
> **Disposition: 🔭 Later** — needed before Web Store launch, not before alpha.

---

## 3. Extension architecture & features

### Persistent filter settings *(already #1 priority)*
Gemini confirmed this as the top near-term feature. Filters should survive page refreshes. Already on the roadmap.
> **Disposition: ✅ Already planned — next session**

### Badge text on the toolbar icon
Show the shortlist count as a badge number on the extension icon. Requires adding a `chrome.action.setBadgeText` call (best handled in `background.js`).
> **Disposition: 🔜 Near-term candidate** — satisfying feedback for users; low complexity.

### Move logging to background.js
`auSendLog` currently runs in the content script, which Amazon's CSP may block. Moving it to `background.js` (passing a message from `core.js`) makes it more reliable and cleaner.
> **Disposition: 🔜 Near-term candidate** — also fixes a potential logging reliability issue.

### Telemetry opt-out toggle
Add a checkbox in the popup: *"Help improve the extension by sharing anonymous search data."* Required for good privacy practice; likely needed for Web Store approval. Should strip any PII (names, session IDs) from URLs before logging.
> **Disposition: 🔜 Near-term candidate** — needed before any public release.

### Welcome / onboarding page
An `onInstalled` listener in `background.js` that opens a one-time welcome tab explaining the four pillars and keyword syntax. Gemini called this essential for making AU feel professional from the first second.
> **Disposition: 🔭 Later** — do this before Web Store launch, not before alpha testing.

### Shortlist cleanup function
Add automatic removal of shortlisted items older than 60 days to prevent the storage growing stale.
> **Disposition: 🔭 Later** — sensible maintenance feature; not urgent.

### Popup (browser action)
Currently the extension icon is greyed out and unclickable. Adding a `popup.html` with a basic status, settings toggle, and Ko-fi link would make AU feel like a real product.
> **Disposition: 🔭 Later** — needed before Chrome Web Store; not needed for alpha sideloading.

---

## 4. Website bridge & monetization

### "Compare on Website" / Shortlist export
The biggest monetization idea in the conversation. The extension encodes the shortlisted items (ASIN, title, price, PPU) as a Base64 URL parameter and opens `actuallyuseful.net/compare?data=[encoded]`. The website decodes it and renders a comparison table — with affiliate links safely embedded *there*, not in the extension.

Gemini described two versions:
- **Alpha method (URL bridge):** Free, no backend, works up to ~5–10 items before URL length limits kick in.
- **Pro method (database):** Requires a simple backend (Supabase/Firebase); generates a shareable permanent link like `actuallyuseful.net/c/abc-123`.
> **Disposition: 🔭 Later** — this is the long-term monetization engine, but requires a functional website first. Worth keeping in mind as AU's north star for the website rebuild.

### Affiliate links — important warning ⚠️
Gemini was emphatic: **do not put affiliate tags inside the extension code.** Amazon's policy explicitly forbids it in browser extensions. The `AU_AFFILIATE_TAG` constant and `auTagUrl` function in `core.js` are a liability — Gemini called it a "smoking gun." The safe path is to only apply affiliate tags on the companion website, after the user navigates there.
> **Disposition: ⚠️ Act on this before any public release** — removing or neutralising this from `core.js` is low effort and eliminates real risk.

### "Daily Deals" page affiliate link
A lower-tech alternative: add a "Support us by shopping through our Daily Deals page" link in the popup. If the user clicks through to `actuallyuseful.net` and then to Amazon from there, that's a standard legal referral.
> **Disposition: 🔭 Later** — needs the website to exist first.

### Price drop alerts
Since shortlisted items store the ASIN and price, the extension could check daily and show a red dot on the icon when a price drops.
> **Disposition: 🔭 Later** — compelling premium feature, significant complexity.

### Cloud sync for shortlist
Pro tier feature: sync the shortlist across devices via a login. 
> **Disposition: 🔭 Later / ❌ Not for now** — high complexity, low priority for current phase.

### B2B / Amazon Seller version
Use the Google Sheets integration to market a "Pro" version to sellers or arbitrageurs who want to track competitors. 
> **Disposition: ❌ Not for AU** — this targets a completely different user than the "intentional shopper."

### Notes feature freemium gating
*Free:* save notes on up to 5 products. *Pro:* unlimited notes and "Research Folders."
> **Disposition: 🔭 Later** — a reasonable freemium hook, but not before there's a paying infrastructure.

---

## 5. Marketing & launch strategy

### Alpha tester recruitment — Reddit pitch
Gemini wrote a ready-to-use Reddit post for subreddits like r/Frugal, r/AmazonPrime, and r/BuyItForLife. The hook: *"I don't know how to code. I was fed up with Amazon. Here's what I built."* Ask for 10–15 people to help break it.
> **Disposition: 🔭 Later** — save for when the next couple of polish items are done.

### LinkedIn/Twitter "AI success story" pitch
Tag Anthropic; lead with the "non-coder built this with Claude" angle. High share potential among AI enthusiasts.
> **Disposition: 🔭 Later**

### Product Hunt launch
Gemini called it the "Super Bowl" for new apps. Best on a Tuesday or Wednesday. Getting "Product of the Day" can generate thousands of users and press coverage.
> **Disposition: 🔭 Later** — plan this carefully, only once AU is polished.

### "Enshittification" press pitch
Pitch to tech journalists at Lifehacker, CNET, ZDNet. Angle: *"I built a tool that restores Amazon search to what it used to be."*
> **Disposition: 🔭 Later**

### TikTok/Reels "satisfying cleanup" video
Screen record: cluttered Amazon → click AU → ads gone, Best Value star appears. Use satisfying audio. Gemini noted this type of content performs well.
> **Disposition: 🔭 Later**

### Feedback form questions
Gemini suggested three specific questions for alpha testers:
1. "What is one thing that confused you?"
2. "What is one feature you wish it had?"
3. "Did it break anything on the page?"
> **Disposition: ✅ Already have a feedback form** — but worth checking if these questions are in it.

### "Bug bounty" — credits on the website
Tell testers: anyone who finds a major bug gets their name in the Credits section permanently. People love this.
> **Disposition: 🔭 Later** — charming idea; costs nothing.

### Capture "Aha!" moments from testers
When a tester says something like *"I didn't realise Amazon's own brand was more expensive per ounce!"* — use that exact phrasing as marketing copy.
> **Disposition: ✅ Good practice to remember**

### Web Store SEO keywords
Use terms like "Amazon Price Tracker," "Sort by Price per Ounce," "Hide Amazon Ads," "Amazon Comparison" in the store description.
> **Disposition: 🔭 Later** — needed at submission time.

### Version number reset
Gemini suggested resetting to `1.0.0` for the Web Store launch since `6.1.1` might confuse reviewers who expect new extensions to start at 0.x.
> **Disposition: 🔭 Later / discuss** — this is worth a conversation. There are arguments both ways.

---

## Summary: ideas worth acting on soon

For easy reference, the near-term candidates pulled together:

| # | Idea | Effort |
|---|------|--------|
| 1 | Persistent filter settings | Medium (already planned) |
| 2 | Page-fetch throttling (delay between fetches) | Low |
| 3 | Keyword debouncing (250ms wait) | Low |
| 4 | Empty state message when filters clear everything | Low |
| 5 | System font stack in CSS | Trivial |
| 6 | "Frequently Returned" badge — make it red/bold | Low |
| 7 | Move `auSendLog` to background.js | Low–Medium |
| 8 | Telemetry opt-out toggle | Low–Medium |
| 9 | Badge text (shortlist count on icon) | Low |
| 10 | Neutralise/remove affiliate tag from core.js | Low — but important |
