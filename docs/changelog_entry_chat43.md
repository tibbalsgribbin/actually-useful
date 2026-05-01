## **Chat 43 — May 1, 2026**

*Infrastructure and troubleshooting session. No extension code changes. No website file changes.*

### HTTPS troubleshooting
- Found and added missing TXT domain verification record in Namecheap (`_github-pages-challenge-tibbalsgribbin`)
- Verified domain in GitHub account settings (github.com/settings/pages)
- Found and deleted conflicting URL Redirect Record (`@` → `http://www.actuallyuseful.net/`) — likely root cause of stalled cert provisioning
- Rogue IP `162.255.119.244` still in DNS propagation as of session end — check dnschecker.org and re-trigger GitHub Pages once cleared

### Usage log
- Discovered two separate Google Sheets logging independently: extension (Untitled Project script) and old userscript (Actually Useful Logger script)
- Confirmed an unknown user is actively using the Tampermonkey userscript
- Merged both sheets into one; script version column retained for filtering
- Orphaned "Actually Useful Logger" Apps Script project flagged for deletion

### Planning
- Identified neurodivergent/chronic illness subreddits as outreach targets (r/ADHD, r/AutisticAdults, r/fibromyalgia, r/ChronicIllness, r/MECFS, r/disability, r/neurodivergent, r/executivefunction, r/ADHDwomen)
- Reviewed r/Frugal pricing thread — existing AU features validated; $/calorie flagged as post-alpha idea
- "Reddit comparison drops" outreach strategy added to roadmap — share real AU comparison tables in product-question threads, gated on unit consistency
