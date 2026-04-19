# Actually Useful — Competitive Research
*Started April 14, 2026. Add to this document as new extensions/tools are discovered.*
*Purpose: understand what others are doing well and poorly, and use that to inform Actually Useful's design and roadmap.*

---

## Extensions & Tools Researched

### 1. RealBrand Filter
**Chrome Web Store:** https://chromewebstore.google.com/detail/realbrand-filter-clean-up/pdianimbnpohlbcejpijlochmibfakob
**Website:** https://realbrandfilter.com
**Rating:** 5.0 · v1.0.0 · Developer: unknown (indie)
**Screenshots taken:** Yes (settings page, inline bar, brand lists, affiliate toggle)

#### What it does
Scans every Amazon search result against a database of 6,791 verified brands and assigns a tier:
- **Trusted** — recognized brands (Sony, Nike, KitchenAid, Levi's) — highlighted with subtle tint
- **Unknown** — not in database but passed algorithm check — dimmed (opacity adjustable via slider)
- **Suspicious** — gibberish/random letter brands, failed algorithm check — hidden by default

Inline toggle bar above results: On/Off · Hide Suspicious · Dim Unknown · Highlight Trusted · Hide Sponsored. Live result counter (✓ trusted / ? unknown / ! suspicious).

Settings page (accessed via extension options) is well-organized with sections:
- Filter Settings: Strict Mode, Hide Irrelevant Products, Hide Sponsored & Promotional Sections, Hide Suspicious, Dim Unknown, Highlight Trusted
- Display Settings: Show Trust Badges, Show Toggle Bar, Show "No Brand" Links, Dim Opacity slider (10–50%)
- Score Thresholds: Trusted Threshold slider (50–95, default 75), Suspicious Threshold slider (10–50, default 40)
- Brand Lists: Search brand database, Whitelist (Always Trusted), Blacklist (Always Hidden)
- Support Development: Affiliate Links toggle (opt-in, with disclosure), Buy Me a Coffee button
- Data Management: Export Settings, Import Settings, Reset to Defaults

#### What they're doing right
- Solves a widely-felt problem, especially in clothing
- Three-tier (trusted/unknown/suspicious) is nuanced — not binary
- Score threshold sliders let users tune sensitivity
- Affiliate link opt-in toggle is transparent and non-pushy — good model for us
- Export/Import settings is thoughtful for power users
- Inline toggle bar is low-visual-weight and immediate
- "Hide Irrelevant Products" (hides belts when searching for jeans) is interesting — essentially an automatic keyword filter

#### What they're doing wrong / gaps
- Brand database requires perpetual maintenance
- "Unknown" = dimmed may be too aggressive — most indie brands aren't in a 6,791-brand database
- No unit price, delivery, or value features
- No multi-page loading
- No shortlisting

#### Relevance to Actually Useful
- Suspicious brand filter is on our post-alpha roadmap (see roadmap)
- Our keyword exclude filter covers known exclusions; brand detection handles unknown noise — complementary
- Their affiliate opt-in toggle design is worth copying for our Associates integration
- "Hide Irrelevant Products" feature (belts when searching jeans) is essentially what our keyword filter already does — worth highlighting in our copy

---

### 2. Trusty Search Assistant for Amazon
**Chrome Web Store:** https://chromewebstore.google.com/detail/trusty-search-assistant-f/hpmchbfaebbmmhepolfecmihamjfmofl
**Rating:** 3.9 · 90 ratings · 6,000 users · v2.0.8 · Developer: Casey Woolley (indie)
**Screenshots taken:** Yes (inline bar in action)

#### What it does
Adds a minimal inline bar above Amazon search results with sliders for:
- Pages (how many pages to load — up to 50)
- Rating (minimum star rating)
- Reviews (minimum review count)
- Price (range)

Results filter/sort instantly as sliders move. Persistent filter settings. Rebuilt in Svelte (v2.0.0), Manifest V3 compliant.

#### What they're doing right
- Sliders are immediately intuitive — more so than typing a number
- Extremely minimal visual footprint — the bar is almost invisible
- Users describe it as "indispensable" and "invaluable" — strong emotional attachment
- Up to 50 pages of results is ambitious and clearly valued
- Persistent settings mean it remembers your last configuration

#### What they're doing wrong / gaps
- Breaks constantly when Amazon changes DOM — users report weeks of downtime
- Solo developer, slow to fix, users feel ignored
- No keyword filter (users explicitly requested it)
- Always-on with no way to trigger on-demand — results vanish as you're about to click (jarring)
- No unit price, delivery, shortlisting, source filtering, or coupon detection
- Slow developer response is a trust issue — users offering to pay just to get fixes

#### Relevance to Actually Useful
- Slider interaction model is worth considering for min reviews (we use a text input)
- "Always on, no way to disable gracefully" is a mistake to avoid — our collapse/close is essential
- 50-page loading is far beyond our 200-result warning — we should research quality dropoff by category before committing to a higher limit
- Their fragility (breaking on every Amazon DOM change) is partly because they modify the page itself rather than working alongside it like we do — our panel approach is more resilient

---

### 3. TrailShopper – Clean Grid View for Amazon & Walmart
**Chrome Web Store:** https://chromewebstore.google.com/detail/trailshopper-%E2%80%93-clean-grid/henpkhglblhfgjjeflnmfahablndpgba
**Rating:** 5.0 · 2 ratings · 8 users · v0.0.2 · Developer: Tiny Trail Apps
**Screenshots taken:** No

#### What it does
Replaces Amazon (and Walmart) search result layouts with a clean, simplified grid view. Toggle between clean view and original Amazon view at any time. Allows searching multiple sites at once and seeing results in a uniform format for easy comparison.

#### What they're doing right
- The toggle between clean and original view is smart — don't force a choice
- Cross-retailer format unification is a genuinely interesting concept
- Extremely early stage (8 users) but the concept is sound

#### What they're doing wrong / gaps
- Replaces Amazon's page layout directly — extremely fragile to DOM changes
- No filtering, sorting, unit price, or value features
- No shortlisting or delivery information
- Very early (v0.0.2) — not yet proven

#### Relevance to Actually Useful
- The "clean view" concept is interesting but our panel approach achieves the same goal differently — we add a panel, they restyle the page. Our approach is more resilient.
- Cross-retailer result comparison is worth noting for the long-term Walmart roadmap
- Their toggle (clean ↔ original) is a useful UX principle: always give the user an easy exit

---

### 4. Amazon Unit Price / Unit Price Shopper
**Chrome Web Store:** (two versions — Amazon Unit Price and Unit Price Shopper)
**Developer:** indie · Manifest V3
**Screenshots taken:** Yes (tutorial page, settings, panel in action, side panel option)

#### What it does
Shows unit price for every Amazon search result. Panel floats as a popup or browser side panel (user's choice). Unit type filter buttons (All / Fluid Ounce / Ounce / Count / Unit) to filter by measurement category. Search box to filter by keyword. "Add to Cart" button with quantity control directly in the panel. Multi-page loading (configurable max pages).

Features (configurable in settings):
- Auto-popup on search pages
- Compare Units By Category — normalize across weight/volume/length
- Apply Coupon/Subscription Discounts
- Apply Quantity Discounts
- Sort by Price
- SNAP Filter (show only SNAP-eligible items)
- Experimental: Infer Unit by Title, Include Delivery Fee in unit price

Unit Price Shopper (paid/premium version) also works on Walmart and Albertsons brand stores (Safeway, Vons, etc.).

Onboarding tutorial page opens on first install — covers pinning, supported sites, features, navigation icons.

#### What they're doing right
- Onboarding tutorial is excellent — exactly what we need for sideloading
- Side panel option (browser-native) is a significant differentiator — doesn't compete with page layout at all
- "Add to Cart" from the panel is bold and useful
- SNAP filter addresses a real underserved need
- Affiliate link disclosure is clear
- Settings page is functional if not beautiful

#### What they're doing wrong / gaps
- Unit type filter buttons don't convert between units — "Fluid Ounce" and "Ounce" are separate filters even though they're the same in a liquid context (we handle this correctly with liquid-dominant inference)
- No shortlisting, source filtering, delivery sorting, or keyword exclude
- Panel UI is cramped — a lot of chrome for a narrow popup
- No sponsored listing controls

#### Relevance to Actually Useful
- Native browser side panel (Chrome Side Panel API) is worth serious evaluation — it's a fundamentally different positioning model that sidesteps our floating panel collision issues entirely
- SNAP filter is a feature worth adding — underserved, low complexity, meaningful for a real audience
- Their onboarding tutorial is a direct model for our post-alpha settings/onboarding page
- "Add to Cart" from the panel is interesting for the shortlist workflow — once you've decided, why go back to Amazon?
- Their unit conversion gap is our competitive advantage — worth calling out explicitly in copy

---

### 5. Amazon Shopping Tools by DontPayFull
**Website:** https://dontpayfull.com
**Extension type:** Popup with tabs
**Screenshots taken:** Yes (Discount Finder tab)

#### What it does
Extension popup with three tabs: Discount Finder / Gift Finder / Best Sellers.

Discount Finder tab (the relevant one):
- Search by term
- Department dropdown
- Discount Range slider (% off, min to max)
- Deal Types: Today's Deal / Free Shipping / Prime / Subscribe & Save (toggleable chips)
- Price Range (min/max inputs)
- Filter by: Amazon only or All Merchants
- Customer Review (star minimum)
- Sort By (Featured / Price Asc / Price Desc / Newest / Customer Review)
- Condition (New / Used / Renewed)
- Seller (Amazon / Amazon Warehouse)
- Availability (Include Out of Stock toggle)
- "Search Discount on amazon.com" button — sends you to Amazon

#### What they're doing right
- Tabbed popup organizes a lot of options without feeling overwhelming
- Discount Range slider is something none of the others have
- Deal type chips (Today's Deal / Prime / S&S) are a clean toggle pattern
- Condition filter (New / Used / Renewed) addresses a real use case
- Amazon Warehouse as a separate seller option is smart

#### What they're doing wrong / gaps
- Sends you to Amazon — you leave the tool entirely, no companion on results page
- No unit price, shortlisting, delivery, or source filtering
- The search is a pre-filter, not an on-page filter — very different workflow

#### Relevance to Actually Useful
- The tabbed popup model is worth considering for our extension popup (currently unused)
- Discount % range filter is something none of our competitors do on-page — worth evaluating
- Condition filter (New / Used / Renewed) is low complexity and addresses a real use case
- The "form that sends you to Amazon" model is essentially what Jungle Search does — validates that approach

---

### 6. Jungle Search
**Website:** https://www.jungle-search.com/US
**Type:** Website only — no extension
**Developer:** The IQ Group, Inc. (running since 2007)
**Screenshots taken:** No

#### What it does
A form-based advanced Amazon search interface. Select a category, set criteria (keywords, brand, discount % range, price range, merchant filter, star rating, sort order, Prime/free shipping/S&S/coupon eligibility checkboxes), click "Click For Savings" — opens Amazon results in a new tab with affiliate links injected.

Supports multiple Amazon regions (US, UK, CA, DE, FR). Also has Kindle Search and Book Search sections.

#### What they're doing right
- Elegant proof that a companion website with affiliate links can stand alone — no extension needed
- Running since 2007 — the affiliate model works
- Simple, uncluttered form — every field has a clear purpose
- Category list is comprehensive
- "Click For Savings" as the CTA is warm and benefit-focused

#### What they're doing wrong / gaps
- Design looks like 2007 — no updates apparent
- No companion on the results page — once you're on Amazon, you're on your own
- No unit price, shortlisting, delivery, or on-page filtering
- The affiliate handoff means they only earn if you buy — no other monetization

#### Relevance to Actually Useful
- actuallyuseful.net could function as a power search tool that hands off to Amazon AND activates the extension if installed — best of both worlds
- Their affiliate model is a direct precedent for ours
- The form fields map well to our existing filters — we could build this as a website feature relatively easily
- "Click For Savings" tone is worth studying — benefit-focused, not feature-focused

---

### 7. Keepa
**Chrome Web Store:** (well-known, widely used)
**Reference article:** https://www.makeuseof.com/free-chrome-extension-to-get-deal-on-amazon/
**Screenshots taken:** No — research from article only

#### What it does (beyond the well-known price history chart)
Per the MakeUseOf review, Keepa has features beyond price history that are relevant to us:
- Price history chart with drop alerts
- Stock level tracking
- Deal finder
- Product rating and review history over time
- Tracks Amazon price, third-party price, and used price separately
- Available across Amazon regions

#### Relevance to Actually Useful
- Price history is outside our scope (we focus on current search results)
- Rating/review history over time is an interesting trust signal we don't address
- The "deal alert" model (notify me when price drops) is a future feature worth noting
- Keepa is established and trusted — we are not competing with them, but users may run both

---

## Feature Comparison Matrix

| Feature | RealBrand | Trusty | TrailShopper | Unit Price | DontPayFull | Jungle Search | Actually Useful |
|---|---|---|---|---|---|---|---|
| Sort by unit price | — | — | — | ✅ | — | — | ✅ |
| Sort by price | — | ✅ slider | — | ✅ | ✅ | ✅ | ✅ |
| Sort by rating | — | ✅ slider | — | — | ✅ | ✅ | ✅ |
| Sort by review count | — | ✅ slider | — | — | — | — | ✅ |
| Sort by delivery | — | — | — | — | — | — | ✅ |
| Keyword include filter | — | — | — | ✅ | ✅ | ✅ | ✅ |
| Keyword exclude filter | — | — | — | — | — | — | ✅ |
| Min review count | — | ✅ slider | — | — | — | — | ✅ (text input) |
| Min star rating | — | ✅ slider | — | — | ✅ | ✅ | ❌ |
| Price range filter | — | ✅ slider | — | — | ✅ | ✅ | ❌ |
| Discount % filter | — | — | — | — | ✅ | ✅ | ❌ |
| Sponsored filter | ✅ | — | — | — | — | — | ✅ (3-state) |
| Brand trust filter | ✅ | — | — | — | — | — | ❌ (roadmap) |
| Source/seller filter | — | — | — | — | ✅ | — | ✅ |
| Condition filter | — | — | — | — | ✅ | — | ❌ |
| SNAP eligible filter | — | — | — | ✅ | — | — | ❌ |
| Prime/free shipping filter | — | — | — | — | ✅ | ✅ | ❌ |
| Duplicate detection | — | — | — | — | — | — | ✅ |
| Coupon detection | — | — | — | ✅ | ✅ | ✅ | ✅ |
| S&S detection | — | — | — | ✅ | ✅ | ✅ | ✅ |
| Multi-page loading | — | ✅ (50 pages) | — | ✅ | — | — | ✅ (prompt) |
| Shortlist | — | — | — | — | — | — | ✅ |
| Open shortlist in tabs | — | — | — | — | — | — | ❌ (planned) |
| Add to cart from panel | — | — | — | ✅ | — | — | ❌ |
| Thumbnails | — | ✅ large | — | ✅ large | — | — | ✅ small |
| Delivery date display | — | — | — | — | — | — | ✅ |
| Floating panel | — | — | — | ✅ | — | — | ✅ |
| Inline bar | — | ✅ | ✅ | — | — | — | — |
| Native side panel | — | — | — | ✅ | — | — | ❌ |
| Draggable / resizable | — | — | — | — | — | — | ✅ |
| Persistent position | — | — | — | — | — | — | ✅ |
| Persistent filter settings | ✅ | ✅ | — | ✅ | — | — | ❌ |
| Settings page | ✅ rich | — | — | ✅ | — | — | ❌ (planned) |
| Onboarding tutorial | — | — | — | ✅ | — | — | ❌ (planned) |
| Export/import settings | ✅ | — | — | — | — | — | ❌ |
| Website companion | — | — | — | — | — | ✅ | planned |
| Multi-retailer | — | — | ✅ | ✅ | — | — | planned |
| Affiliate links | ✅ opt-in | — | — | — | ✅ | ✅ | planned |
| Ko-fi / tip jar | ✅ | — | — | — | — | — | ✅ |
| Unit type filter buttons | — | — | — | ✅ (no conversion) | — | — | ✅ (with inference) |

---

## Key Takeaways for Actually Useful

### We have more features than any individual competitor
The gap is design polish, discoverability, and a few specific features. This is an advantage, not a problem — but it means the UI work matters.

### Features worth adding (not yet on roadmap)
- **Min star rating filter** — we have min reviews but not min stars. Easy addition.
- **Price range filter** — min/max price is a basic expectation.
- **Discount % filter** — unique among on-page tools; Jungle Search and DontPayFull do it as a pre-filter but nobody does it on-page.
- **SNAP eligible filter** — underserved audience, low complexity.
- **Condition filter** (New / Used / Renewed) — low complexity, real use case.
- **Persistent filter settings** — resetting on every search is friction. Several competitors persist settings.

### Interaction model worth reconsidering
- **Sliders** for numeric controls (min reviews, min rating, price range) feel more immediate than text inputs — Trusty's most praised feature
- **Native browser side panel** (Chrome Side Panel API) — fundamentally different positioning that doesn't float over the page. Worth serious evaluation.
- **Tabs** for organizing controls — could clean up our currently stacked control rows significantly

### Design principles from the field
- Trusty: minimal visual footprint, always available, but never force it on users (we do this well with collapse/close)
- RealBrand: settings page with clear sections, sliders for thresholds, opt-in affiliate toggle
- Amazon Unit Price: onboarding tutorial on first install, side panel as alternative to floating panel
- Jungle Search: website as a companion tool with affiliate links — not just a landing page
- TrailShopper: always give an easy exit (toggle back to original view)

### Our competitive advantages to emphasize
- More features than any single competitor
- Liquid-dominant unit inference (Unit Price Shopper doesn't convert between fl oz and oz — we do)
- Keyword exclude filter (nobody else has this)
- WF delivery transparency
- Shortlisting (nobody else has this)
- Delivery date display and sorting
- Three-state sponsored filter
- We work alongside the page, not by restyling it — more resilient to Amazon DOM changes

### The website opportunity
Jungle Search has run since 2007 on affiliate revenue alone, with no extension. actuallyuseful.net could function as:
1. A landing page (current plan)
2. A power search form that hands off to Amazon with affiliate links (Jungle Search model)
3. A companion to the extension for users who prefer a website workflow

These are not mutually exclusive.

---

*Updated April 14, 2026 · Research session with Melissa*
