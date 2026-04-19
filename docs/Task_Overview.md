# Actually Useful — Task Overview
*Personal reference. Generated April 19, 2026 from Chat 10 + Chat 11 synthesis.*
*Urgency: 🔴 Before alpha · 🟡 Before Web Store · 🟢 Post-alpha*
*Difficulty: ● Easy · ●● Medium · ●●● Hard*
*Component: [EXT] Extension · [WEB-C] Comparisons page · [WEB-S] Searches page · [WEB-L] Landing page · [INFRA] Infrastructure*

---

## 🔴 Before alpha — must ship

| Task | Urgency | Difficulty | Component | Notes |
|---|---|---|---|---|
| Fix minimum rating filter — add `parseRating()`, set `r.rating` in `scrapeCard()` | 🔴 | ● | [EXT] | Filter UI exists but does nothing. Users will think it's broken. |
| Disable product.js in manifest — comment out second `content_scripts` entry | 🔴 | ● | [EXT] | Script runs on every `/dp/*` visit despite being "deferred." Nobody is watching for breakage. |
| Remove `AU_AFFILIATE_TAG` and `auTagUrl` from `core.js` | 🔴 | ● | [EXT] | Tag is empty so nothing ships today, but mechanism is a policy violation waiting to happen. No callers exist — safe to remove. |
| Align version strings across manifest, core.js, search.js, styles.css | 🔴 | ● | [EXT] | Four files, four different versions. Apply sub-1.0 renumbering at the same time. |
| Move project docs into `docs/` folder in GitHub repo | 🔴 | ● | [INFRA] | Gives version history on documents alongside code. Do at start of next coding session. |
| Verify feedback form has Gemini's three questions | 🔴 | ● | [INFRA] | Check https://forms.gle/J3AECVTDHWKDZZKE7 manually outside a session. |
| Fix Ko-fi link inconsistency — nudge vs footer | 🔴 | ● | [EXT] | Nudge uses `tibbalsgribbin`, footer uses `butactuallyuseful`. Verify which is correct. |
| Page-fetch throttling — 500ms–1000ms delay between fetches | 🔴 | ● | [EXT] | Rapid-fire credentialed requests can trip Amazon rate-limiting. |
| Move `auSendLog` to background.js via `chrome.runtime.sendMessage` | 🔴 | ●● | [EXT] | Amazon's CSP may silently block fetch() from content scripts. Log gaps are probably already happening. |
| Telemetry opt-out toggle in popup | 🔴 | ●● | [EXT] | Required before any public release. Good privacy practice; likely needed for Web Store approval. |
| Show Selected / Clear Selection rework | 🔴 | ●● | [EXT] | Wording, behavior, and location (probably moving to shortlist bar). |
| Frequently Returned badge — make it red | 🔴 | ● | [EXT] | Bold done (Chat 7). Red still needed. |
| GitHub Pages enabled on existing repo | 🔴 | ● | [INFRA] | Prerequisite for the website. |
| Marketing/landing page published | 🔴 | ●● | [WEB-L] | Must be live before alpha testers are recruited. |
| Actually Useful Comparisons — basic page working | 🔴 | ●●● | [WEB-C] | Comparison table, affiliate tags, works without extension for shared-link arrivals. |
| Supabase setup + shareable links | 🔴 | ●● | [INFRA] | One table, short IDs (`/c/x7k2m`). Shareable links are essential, not optional. |
| "Compare side by side (N)" button in shortlist bar | 🔴 | ●● | [EXT] | Opens Comparisons page with shortlist encoded in URL. |
| Test on a different setup (Mac or Chrome vs Edge) | 🔴 | ● | [INFRA] | Via a tester — catches assumptions baked into Edge/Windows development. |
| Decide: Chrome Web Store submission before or after alpha? | 🔴 | ● | [INFRA] | Decision only, no build work. |

---

## 🟡 Before Web Store — ship before public launch

| Task | Urgency | Difficulty | Component | Notes |
|---|---|---|---|---|
| IIFE wrapping of scripts | 🟡 | ●● | [EXT] | Not a security issue in isolated world, but reviewers flag it. |
| Replace `.innerHTML` row template with `document.createElement` | 🟡 | ●●● | [EXT] | Chrome Web Store reviewers scan for innerHTML. Large refactor. |
| Badge text on toolbar icon — shortlist count via `chrome.action.setBadgeText` | 🟡 | ● | [EXT] | Satisfying feedback; low complexity. Handled in background.js. |
| Selector resilience — pull all CSS selectors into a named object | 🟡 | ●● | [EXT] | Makes Amazon DOM changes easier to fix — one line per selector. |
| product.js merchant scraper fail-safe | 🟡 | ● | [EXT] | Fall back to string search for "Sold by"/"Ships from" if `#sfsb_accordion_head` breaks. |
| Icon resolution — simplified 16×16 version | 🟡 | ● | [EXT] | Current icons are all the same image scaled down. Looks blurry in toolbar. |
| Onboarding/welcome page on first install | 🟡 | ●● | [EXT] | `onInstalled` listener opens a one-time tab. Makes AU feel professional from first second. |
| Amazon account created (prerequisite for Associates) | 🟡 | ● | [INFRA] | Melissa needs her own account separate from family. |
| Apply for Amazon Associates | 🟡 | ● | [INFRA] | Deferred until real user base established. |
| Create Chrome Web Store developer account | 🟡 | ● | [INFRA] | $5 one-time fee. |
| In-extension "Report a bug" button | 🟡 | ●● | [EXT] | Pre-fills context: URL, version, browser. Much better signal than generic feedback form. |
| Daily Apps Script check — email if zero-result sessions spike | 🟡 | ●● | [INFRA] | Early warning system for silent breakage. |
| GitHub Issues for tester reports | 🟡 | ● | [INFRA] | Don't add a separate bug tracker — use what's already there. |

---

## 🟢 Post-alpha

### Extension

| Task | Difficulty | Notes |
|---|---|---|
| Product page re-enabled | ●●● | Test against current Amazon before re-enabling. |
| Cross-page shortlist state persistence (chrome.storage.local) | ●● | Currently session-scoped only. |
| Two-way extension ↔ website connection | ●●● | Website sends refined shortlist back to extension. Post-alpha confirmed. |
| Derive per-item price from total ÷ count when Amazon reports wrong unit | ●●● | Needs `diagnostic-prices.js` data first. Don't attempt blind. |
| Keyword length expression normalization ("6ft" vs "6 feet") | ●● | |
| Exclusion possessives (`-men` not matching "men's") | ●● | |
| Fix nudge firing on hyphenated keywords ("t-shirt") | ● | |
| "Start over" doesn't reset `selectedUnit` or `showCheckedOnly` | ● | Minor inconsistency. |
| Re-scan: preserve shortlist on same-term re-scans | ● | Currently throws away `checkedAsins={}`. |
| Contribution nudge | ●● | 30-day floor, usage trigger, permanent dismiss. |
| Walmart version | ●●● | Prioritized among future platforms. |
| Settings/onboarding page | ●● | |

### Website — Actually Useful Comparisons

| Task | Difficulty | Notes |
|---|---|---|
| Re-sort comparison table by any column | ●● | Including columns Amazon hides. |
| Per-item notes persisted to URL | ●● | |
| Keepa price history link per item | ● | `keepa.com/product/[ASIN]` — not CamelCamelCamel. |
| Comparisons page works for shared-link arrivals without extension | ●● | Critical design constraint — don't strangle the growth vector. |

### Website — Actually Useful Searches

| Task | Difficulty | Notes |
|---|---|---|
| Build search forms for queries Amazon makes hard | ●●● | Discount range, condition + department, Small Business + high rating, multi-merchant. |
| Search URL state preserved — bookmarkable and shareable | ●● | Compounding SEO asset. Jungle Search doesn't do this. |
| Validate with real users before committing to build | ● | Decision point, not a build task. |

### Hidden data capture batch (one code session)

| Task | Difficulty | Notes |
|---|---|---|
| SNAP eligible flag | ● | |
| Small Business badge | ● | |
| Condition (New / Used / Renewed) | ● | |
| "Amazon's Choice" label | ● | Include transparency note: paid placement, not editorial. |
| Best Seller badge + category | ● | |

### Review integrity + price history batch

| Task | Difficulty | Notes |
|---|---|---|
| Mild caution signal for improbable ratings (high stars, very low reviews) | ●● | |
| Contextual nudge to Fakespot / ReviewMeta on flagged items | ● | No API available — Fakespot closed external access after Mozilla acquisition. |
| Keepa price history link per card | ● | Already listed above — consolidate into one pass. |

---

## Decisions made — not build tasks

- **Monetization:** Free always. Associates affiliate commissions + Ko-fi tips. No paywalled features ever. No paid tier.
- **Affiliate tags:** Website only. Never in extension. Amazon policy explicitly forbids it in extensions.
- **Price history:** Keepa links only. CamelCamelCamel injects their own affiliate tags and would redirect commissions.
- **Review integrity:** No API available. Surface Fakespot/ReviewMeta links on flagged items; don't build our own.
- **Website fetching Amazon results:** Not viable. Amazon blocks external scrapers. Extension remains the Amazon-facing piece.
- **Model choice:** Stay on Sonnet 4.6 via Pro for implementation sessions. Opus for broad architecture/critique sessions only.
- **Version 1.0:** Web Store public launch. Something to earn.
- **Website names:** Actually Useful Comparisons (`compare.html`), Actually Useful Searches (`search.html`). Placeholder names — revisit when something better surfaces.
