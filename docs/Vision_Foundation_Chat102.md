# Vision foundation (Chat 102)

This is the source of truth for what Actually Useful is and why, built from a long interview during the rebuild planning. It exists so the foundation can't drift again, and so the next session resumes from a tight document instead of a long transcript.

Quoted phrases are Melissa's exact words and shouldn't be reworded. Everything else is synthesis, open to better phrasing. The last section lists what we mapped but haven't worked through yet.

A standing rule for all of this: the current build is where we ended up, not necessarily the best place. We use it as reference, never as a constraint on the foundation.

## The north star

The user is resigned, not worn down. They dislike Amazon and Bezos, but it's the biggest game and they have few real choices, so they've made their peace with it. AU's job there is leverage. **"Even the playing field. Be empowered."**

Lower mental load is how. Empowerment inside a system you can't leave is why.

The compass, the thing every decision gets tested against, is **shop on your terms**. The slogan, the three-word shorthand for a listing, is **Amazon but better**. They do different jobs and don't compete.

"Shop on your terms" runs wider than price. It means best by your definition, whatever your terms are: cheapest per unit, made by a small business, climate-friendly, squeezed for every discount. AU's real job is to make the user's own definition of best sortable and filterable.

Trust is an absolute floor for every customer, but it's a posture, not a promise of perfection, because perfection isn't deliverable and the audit proved AU misleads sometimes. The posture, in Melissa's words: **"transparent about our desire not to mislead, and to constantly improve if it does happen."** Provenance and error reporting are how that posture gets operationalized. Show the uncertainty, catch the mistake, fix it.

Lower mental load comes from clarity and completeness, not from emptiness. **"Clear can be as good as uncluttered."** **"I'd rather have more than less."** Hidden equals held-in-your-head equals more load, so minimalism can raise the burden it's meant to lower. This is "don't make me hold things in my head," moved onto the screen.

One distinction guards that principle from being misread. "More, not less" is about the tool: controls, info, the work shown. It is not about the results. The result set is still pruned hard, junk brands, irrelevant listings, ads, and unwanted sellers gone. A rich, clear panel sitting over a cleaned-up result set.

## Who it's for

Broad, and as inclusive as possible. Melissa is not the primary customer.

**"People are complex, AU is responsive to that."** The user isn't a fixed persona. They drop into modes depending on the trip. Same person, different mode each trip: a price-checker for batteries, a hard-comparison shopper for protein powder, a skeptic when the results feel fake, an overwhelmed shopper who wants things narrowed down.

Inclusive gets served by configurability done with restraint. Strong defaults that work on day one. A bounded set of feature toggles, whole capabilities on or off, not a knob at every juncture. A few starting profiles at onboarding, not a settings firehose. Tuning is there for people who want it and invisible to people who don't. The user can shape AU but never has to in order to get value, because choice is itself a cognitive load.

AU is multi-purpose where the competition is single-purpose, so it carries a learning curve. The curve gets handled as a path, not a wall: instant value on the one thing they came for, usually price, then the depth revealing itself over time until the thing they came for is the least of why they stay. Teaching everything up front would overwhelm exactly the people we're trying to include.

## What AU is

A shopping-decision service with two surfaces. The extension is the funnel. compare.html is the destination.

The governing principle, in Melissa's words: the extension is **"robust and meet the users' needs even if they never go to compare.html, but if they DO, oh man! they'll be glad they did."** The destination is an amplifier, never a gate. The extension is never crippled to herd people to the money page.

The extension is built for the search page now, and built to grow later. "Grow later" means one thing concretely: a surface-agnostic data model. A posture is a posture and a typed quantity is a typed quantity no matter which surface the input came from, so the detector core stays blind to where its input came from. Adding a surface later is a new scrape adapter feeding the same core, not a rebuild. We build zero product-page or cart machinery now.

compare.html comes into the rebuild as a first-class surface, designed alongside the extension. The same clean core data flows into both the panel and the destination.

Note: compare.html has never been audited and wasn't uploaded this session, so its current state is unknown to me as of writing.

## The journey

Amazon does some things well, and AU starts by letting it. The user applies Amazon's own good filters first, prime, shipping, the left-column options. Then the extension takes over for the wide work: load every page, include and exclude terms, set what matters for this specific trip. Then they check the survivors, a handful to hundreds, and send them to compare.html to fine-tune and decide.

The extension is the wide net and the first pass. compare.html is the room where the decision gets made.

A known gap in the current flow: "select all" should mean "select all the keepers," everything except the demoted items and ads. Right now it drags the rejected junk into compare.html along with everything else.

The shallow, mainstream user won't find compare.html on their own. They have to be led there.

## The destination

compare.html is a workspace you live in for a while, not a report you glance at. You cross over from Amazon and the noise drops away. No ads, no sponsored rows, no endless scroll. A clean space that's yours, built for deciding instead of selling. That quiet is half the point.

What the room holds, as imagined so far:

A comparison table that does the thinking with you. Every column sortable, columns you can add, drop, and reorder. AU marks the best value in each column so the answer surfaces without hunting. A unit lens you can flip, so protein powder re-sorts by price per serving, per gram of protein, or per pound. Tap any price-per-unit and it shows its work, where the number came from, so you can trust it or catch it.

Enrichment from the product page. More photos, the details a search card can't hold, who really sells and ships it, what the reviews say under the star average. This is the cleanest reason AU would ever touch another Amazon page: enrichment for the comparison, rather than a second place to work.

Persistence and a working set. Pin the keepers, dim the ones you've ruled out, pull in more results when the field's thin, take notes, come back tomorrow and it's still there.

Multiple active searches you switch between, which turns the destination into a desk. Several shopping projects at once, each waiting where you left it.

Tracking over time, which falls out of persistence. AU stays out of the price-tracker lane, since price history is well-done by others, and instead tracks the handful of things the user actually chose to follow. The richer vein is what Keepa can't see: a product that was 4.6 stars when shortlisted and slid to 4.1, a seller swapped out underneath a listing, a back-in-stock, a brand later flagged. The "it used to be good" signal, caught because the item was already being watched. Tracking stays calm: it waits where you left it and shows what changed when you return, rather than pinging you into a fresh anxiety.

The demoted pile stays visible with its reason shown. If AU got one wrong, the user plucks it back and AU learns they meant it. That relearning is also the implicit allowlist signal the audit found missing.

Sharing already exists on compare.html. As a foundation matter it's three things at once: something a user wants, a way AU spreads without marketing, and a place an affiliate link can honestly sit. It also touches the data line, since sharing means something leaves, so it stays the user's choice, eyes open.

Values dimensions. Amazon already shows small-business and Climate Pledge Friendly badges but won't let you act on them. Turning a passive badge into a filter or sort is the same capability AU already has, aimed at a new column, and it carries the mission further by surfacing small sellers the algorithm buries.

Honest discounts. Coupons, buy-and-save, and deep discounts change the true price per unit, so surfacing them lives inside honest PPU rather than being a new feature. AU already half-detects coupons.

Subscribe and Save, split in two. Teaching people to use it strategically is cheap, clean empowerment with no account access. The cancel-before-the-next-shipment reminder is a heavier lift, needing opt-in order data, the order-history page, and a push that bumps the calm-tracking line, so it's held as a later maybe.

## Voice

Plainspoken and direct, like Melissa. It says what it means, trusts the user to keep up.

Founder first person belongs on the narrative surfaces, the website, onboarding, the about page, where you're talking to a person who just arrived. On the functional surfaces, button labels, tooltips, errors, status, it stays plain and drops the "I."

Dry wit is a seasoning, used sparingly. It lands once and gets out. Never a running gag, never a distraction.

Err toward direct over warm. Warmth tips into condescension and false familiarity fast, especially with strangers, so respect the user's intelligence rather than reassure them. The inclusive move is clarity and respect. Clear serves everyone.

Sell the benefit, never name the problem. "Less clutter, less scrolling, less second-guessing," not "for people with brain fog."

AU is not anti-Amazon. It works with Amazon's structure, would be nothing without it, credits what Amazon does well, and never antagonizes the company that can shut it down. Cheeky is fine. Adversarial is a survival risk. AU is the resigned user's ally inside a system neither of them can leave.

The webpage block ("I made Actually Useful because I got fed up...") is a voice exemplar, true at the time it was written. Affiliate-funded-free keeps its "free, no ads, no upsells, no catch" line true going forward.

## Values and the never list

Money never bends what you're shown. No ads in results, no paid placement, rankings and filters never swayed by who pays or by commission. Sacred.

The complete search feature set is always free. A value and a monetization boundary at once. Sacred.

Never mislead, as the posture above, not a promise of perfection.

Data: never sell, full stop. The user can opt in to share data for a feature they switched on, which is a separate, consented thing. The default is data stays put, never silent, never automatic.

Never bloat past clarity. This is really the clarity principle holding as the product grows. The limit is clarity, not size, and configurability is how growth happens without losing it.

## Money

Affiliate-funded-free. Everything stays free. No freemium tier.

The model is the funnel and the destination: the extension is free and complete, and affiliate income lives on compare.html. It answers to the first never: money can add features, money never bends the core of what's shown. The affiliate tag rides the outbound buy-link for whatever the user already chose on honest merits, disclosed plainly. Best value sorts first because it is the best value.

Affiliate also aligns AU with Amazon, since it sends sales their way, which makes AU a partner rather than a parasite, useful for longevity. The Amazon Associates terms for extensions need a real check before building.

The honest tension to hold: the better the standalone extension, the fewer people bother crossing to the destination, so affiliate income rests on compare.html being so good for hard comparisons that people want to be there. The money follows real added value. compare.html can't be an afterthought.

## Durability and operability

AU has to survive and be managed over time, not just work the day it ships.

Resilience to Amazon change. The scrape layer sits behind a clean seam, with selectors held as updatable data instead of hardcoded through the code, so a break is a one-place fix. Scrape-health telemetry, the gap the audit found, so a break shows up the day it happens instead of looking like a clean search.

The killswitch grows from a binary on/off into a tiered remote status channel: full stop with a message, a non-blocking notice while AU keeps working, and remote selector or list updates, all without a Chrome Web Store review.

Error reporting in two layers. Behind the scenes, automatic capture so Melissa learns AU broke. User-specific, a way for a user to flag "this is wrong," feeding the improvement loop and obeying the data line.

Modularity. One clear responsibility per module: types, each detector as a pure function, the pipeline runner, the scrape layer, telemetry, config, the render adapter. A bug in unit detection never makes you open brand detection, a session loads one module instead of 5000 lines, and a smaller model can do the mechanical work. The ditch to avoid is a hundred tiny files with so much indirection nothing can be followed.

## Name and findability

Keep Actually Useful. It carries the whole thesis in two words, it enables the voice and the joke, and it's platform-agnostic for a future beyond Amazon. Its weakness is ownability and search: a common laudatory phrase is weak to trademark and hard to rank for.

Findability is carried by copy, not the name. The name holds the voice, a descriptor holds the category, and they sit side by side. The store title can be more than the name, "Actually Useful – Amazon Price-Per-Unit, Filter & Sort," with a keyword-dense short and long description. Reviews and installs are the ranking engine over time, fed by a quiet in-product nudge once someone's gotten value. The website should rank for the problem, "how to see price per unit on Amazon," not for the brand name.

Append the descriptor to the manifest name now, keep the in-product name "Actually Useful" via default_title and the panel, and shorten back to the bare brand later once installs come from name search and referral. The exact store-title character limit gets confirmed when we draft the manifest.

## What's still open

The territories we mapped but haven't worked through. This is the resume list.

Decide with confidence. How AU actually helps someone land a decision, beyond filter, sort, and PPU. The center of gravity, and the recommended next topic.

The extension surface and onboarding. Where the UI tightening lives, and the learning-curve arc from first value to mastery. Upload compare.html, the panel UI, and styles.css before this one, held as reference, not constraint.

Trust made visible. The honesty posture turned into something the user can see in the interface.

The feature set and priorities. Enumerate the candidate features, narrow hard to roughly 8 to 10, then rank them by pairwise comparison, all pairs, tallied by the Copeland count. The bridge from vision to what we build.

Success. Opened, never landed. Candidates: a stranger says it changed how they shop, a well-built thing, a real user community, it sustains itself, it stays yours. Which one leads is the open question, because the lead decides tradeoffs.

## Method notes

Relitigating settled things is welcome. It helps confirm whether a value still holds or has changed.

Files seen so far: the detector internals (search.js, core.js, background.js, manifest, compare-bridge.js) and the project docs and mockups. Not seen: compare.html, styles.css, the welcome and onboarding pages, the panel as rendered. Upload those when we reach the surfaces.

The pairwise method for features: narrow the list first, because all-pairs cost grows as n times n-minus-one over two. A short list makes full all-pairs worth it, and the contradictions it surfaces are informative.
