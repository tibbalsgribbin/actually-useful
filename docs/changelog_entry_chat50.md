## Chat 50 — May 4, 2026

*Brand filter Session 3. One search.js version shipped (v0.6.1.50). manifest.json updated.*

### Bundled blocklist — wired up

`loadBundledBlocklist()` fetches `extension/data/brand_blocklist.txt` at startup via `chrome.runtime.getURL()`. Parses lines, strips comment lines (#), uppercases, stores to `bundledBlocklist[]`. Check runs first inside `detectGibberishBrand` — always flags, skips heuristic scoring. `manifest.json` updated with `web_accessible_resources` entry for `data/brand_blocklist.txt` so the content script can fetch it.

### Personal blocklist — implemented

`loadPersonalBlocklist()` reads `auBlocklistBrands` from `chrome.storage.local` at startup. Stored as `personalBlocklist[]`. Check runs after bundled blocklist check in `detectGibberishBrand` — always flags. Both lists load before `tryBuild` fires.

### [•••] per-card menu — implemented

Each card with a detected brand (brand !== null) shows the brand name in small gray text below the title, followed by a `···` trigger. Clicking `···` opens a dropdown with "Hide all [Brand] forever." Clicking that button adds the brand to `personalBlocklist[]`, persists to `chrome.storage.local`, re-flags all matching items in `allData`, and triggers `render()`. Dropdowns close on outside click.

### "My blocklist" management view — implemented

"My blocklist (N)" link added to panel footer. Count updates dynamically after any add/remove. Clicking the link opens an overlay panel listing all personally blocked brands with Remove buttons. Remove reverses the flag on affected items (re-runs `detectGibberishBrand`), removes from storage, re-renders.

### High-noise banner text updated

New text: "A lot of noise in these results. Try Amazon's brand filters on the far left before loading more pages. Hiding sponsored listings (above) also helps in categories like this." Added Amazon Premium Brands filter nudge and sponsored filter nudge at Melissa's direction — rationale: sponsored and junk brands overlap heavily in noisy categories.

### Logging — 2 new fields added to doLog()

`personalBlocklistSize` (int), `personalBlocklistHits` (int). Sheet goes from 56 to 58 columns. Apps Script header row update pending.
