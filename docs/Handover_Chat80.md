# Handover — Chat 80 → Chat 81

*May 16, 2026*

*Planning session — Opus. No code. Phase 7B confirmed pushed.*

---

## What happened this session

Planning conversation only. Three items surfaced for pre-Phase-8 work:

1. **Text-size setting** — parked. Friend with poor eyesight reports general issue with Ctrl+/- on overlays. Melissa observed AU panel scales less per Ctrl-press than the underlying page. Decision: wait until Melissa sits with her friend in person and observes actual use. Outcome may be a fix to Ctrl-zoom behavior on the panel, or an explicit Small/Medium/Large setting — don't decide before observing.

2. **Brand detection** — multiple failing cases identified. Distinct from the known "mixed-case invented names" gap. New cases:
   - Truncation: Amazon Basics → "Amazon"; Arm & Hammer → "Arm"
   - Not detected at all: 9 Elements (laundry); Asus, Logitech (keyboards); zero brands on laptop searches
   - Likely root causes: first-word-of-title fallback firing where the byline should win; category-wide byline-selector failure on laptops
   - Open question: are there external brand lists we can pull from?

3. **Notes** — promoted from side-issue to pre-Phase-8 design item. Current state poorly documented. Open: where notes live, what they're for, privacy when synced to Supabase, sharing semantics.

Sequencing locked: brand research → notes design → Phase 8 design brief → Phase 8 execution.

---

## Files pushed this session

None. Project docs only.

---

## Phase 7B status

**Pushed.** Welcome.html, index.html, privacy.html are live in GitHub.

SUGGESTED COPY blocks on welcome.html and the report-banner copy in search.js remain unreviewed and are still flagged for review before any CWS push.

---

## Open items / deferred

Carried forward from Chat 79:
- **SUGGESTED COPY review** — all flagged blocks on welcome.html need Melissa decision before CWS push
- **Banner text in search.js** — `// <!-- SUGGESTED COPY -->` in `enterReportMode()` — review before CWS push
- **Panel_Redesign_Spec.md updates** — §8.3 and §5.7 stale; separate careful pass
- **Pattern A+B** (`(?)` icons + Help drawer) — see Pattern_AB_Note.md; future phase
- **"Always hide" semantics** — demotes instead of hides; pre-existing UX question
- **Keyword filter hint verbosity** — deferred, design conversation required
- **Impossible Burger math** — deferred, investigation session required
- **Prime scraping selector change** — deferred
- **Coral vs Amazon orange** — verify #f25d4e doesn't clash with Amazon's #ff9900 on live page
- All other known issues in Roadmap

New this session:
- **Text-size — observation session with friend** (no design until observed)
- **Brand research session** (Opus, research doc deliverable)
- **Notes design session** (Opus, design doc deliverable)
- **Phase 8 design brief** (Opus, after both research sessions)

---

## Version state

| File | Version | Status |
|---|---|---|
| `search.js` | **v0.6.2.0** | Pushed Chat 78 |
| `styles.css` | updated Chat 78 | Pushed Chat 78 |
| `core.js` | v0.6.1.53 | Unchanged |
| `background.js` | v0.6.1.18 | Unchanged |
| `manifest.json` | v0.6.1 | Unchanged — will not bump until CWS push |
| `welcome.html` | updated Chat 79 | Pushed Chat 79 |
| `index.html` | updated Chat 79 | Pushed Chat 79 |
| `privacy.html` | updated Chat 79 | Pushed Chat 79 |

---

## What's next — Brand research session

Open a **fresh Opus chat**. Deliverable is a research document, not code, not a kickoff brief yet.

The research doc must answer three questions:

**1. What's actually getting scraped today?**
- For each failing case, which of `scrapeBrand()`'s three strategies fires (or do all return null)?
- Where does the real brand live in the DOM on those cards?
- Is the byline selector wrong, missing, or just absent on those cards?

**2. What can rules realistically fix?**
- Multi-word compound brands (Amazon Basics, Arm & Hammer, 9 Elements, Up & Up, Honest Co, etc.) — explicit list of compound names that should not be truncated by the first-word fallback
- Category-specific byline-selector failures (laptops in particular) — different HTML pattern?
- The boundary between "fixable with rules" and "needs an external list"

**3. What external brand lists exist, and how would we use them?**
- Wikipedia category pages ("List of laptop brands," etc.) — usually clean, exhaustive, easy to copy
- Open Brands / Wikidata brand entities
- Mosley list (already considered for allowlist; reconsider for broader use)
- Trademark/USPTO databases (likely too broad — note as researched-but-rejected if so)
- Amazon's own `/stores/[Brand]/page/...` URLs (canonical brand names, but scraping is its own project)
- Decision criteria: license, size, freshness, false-positive rate

Deliverable proposes 2–3 viable approaches with tradeoffs. Decision at end: what becomes Phase 9 (or wherever brand work lands).

**Melissa to bring to the research session:**
- Instant Data Scraper exports from 3–4 failing Amazon searches (laptops, keyboards, laundry detergent + one working category as control)
- Current `search.js` (fresh upload from GitHub)
- Current `brand_blocklist.txt`
- Current `amazon_brands.txt`

---

## Then — Notes design session

Open another fresh Opus chat after the brand research lands. Deliverable is a design document.

Document the current state first (storage, sharing, edit-back behavior, what `note` does today vs. what `ppuNote` does). Then design the target behavior. Privacy implications of notes-on-Supabase need explicit thought.

**Melissa to bring:**
- Current `search.js`
- Current `compare.html`
- Anything else storage-related (core.js if relevant)

---

## Then — Phase 8 kickoff brief

Open a third fresh Opus chat. Produce kickoff brief for compare.html structural pass + bug reporting on compare.html, now informed by brand research and notes design outputs.

Sonnet executes from the brief.

---

*End of handover.*
