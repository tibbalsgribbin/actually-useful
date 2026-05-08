## Chat 56 — May 7, 2026

*Strategy and docs session — no code changes.*

### Website strategy framing
Added Section 3 (Website Strategy) to Project Briefing. Documents the long-term vision: the extension is the data bridge; the website is where Actually Useful is fully realized as a shopping research platform. Planned surfaces: compare.html (live), search.html (post-alpha standalone search), product pages, gift lists, carts, saved-for-later. Affiliate tags on all outbound Amazon links from the website.

### Positioning update (Section 2)
Replaced "two-stage story" as the lead framing with "extension-to-website arc" — the extension captures, the website delivers. Two-stage story retained as supporting copy.

### search.html description updated
Website Architecture section now describes search.html as a standalone search results page — AU features without being on Amazon; clean, ad-free alternative to tools like jungle-search.com.

### compare.html logging — deferred
Confirmed that compare.html can't read the user's telemetry opt-out from chrome.storage.local (website/extension storage boundary). Logging deferred until the website has more surfaces and the opt-out question is worth solving. Noted in Section 10 of Briefing and in Roadmap.

### Affiliate policy clarified
Working rules and Monetization section now explicitly state: every outbound Amazon link from the website carries the Associates tag. Extension never carries tags. This is unchanged policy, now stated more precisely.

### Next session priorities updated
compare.html logging moved off the top slot (deferred). New order: (1) search.js scrapeBrand() fix, (2) welcome page on install, (3) extractCount "1 Pack (250 Sheets)" fix, (4) auto-resort verification, (5) compare.html logging (deferred).
