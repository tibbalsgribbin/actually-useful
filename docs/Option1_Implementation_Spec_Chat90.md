# Option 1 Implementation Spec — Workspace Persistence for compare.html

*Chat 90 · May 19, 2026 · Opus session*

*Full implementation spec ready to code from. Scope: notes + filters + sort + column visibility persistence on compare.html, plus the manifest plumbing that makes any of it work.*

---

## 1. The problem in one paragraph

compare.html already contains code to read and write notes from `chrome.storage.local`, but that code never runs on the live page. The reason: compare.html is served from `actuallyuseful.net`, which is not in the extension's `content_scripts` list. Regular web pages cannot access `chrome.storage`. The existing defensive guard (`if (window.chrome && chrome.storage && chrome.storage.local)`) evaluates false, the writes silently no-op, and notes vanish on refresh. The fix is adding a `content_scripts` entry that injects `core.js` into compare.html, which exposes the `chrome.*` extension APIs to the page's script context. With that one manifest change, the existing notes path comes alive. The rest of this spec extends the same pattern to filters, sort, and column visibility, and fixes a known rendering bug that will surface the moment storage starts working.

---

## 2. Hosting and matches

- compare.html is served from `actuallyuseful.net/compare.html`.
- The github.io URL (`tibbalsgribbin.github.io/actually-useful/compare.html`) redirects to actuallyuseful.net via a GitHub Pages custom domain.
- The browser always lands on actuallyuseful.net regardless of which URL was used.
- `https://actuallyuseful.net/*` is already in `host_permissions` (manifest line 17).
- New content_scripts entry matches `https://actuallyuseful.net/compare.html*`.

We do not add the github.io URL to `matches`. The redirect happens before content scripts run, so matching on the destination is sufficient.

---

## 3. Architectural decisions (locked)

| Decision | Resolution |
|---|---|
| Primary purpose of compare.html | Private workspace (locked Chat 89) |
| Storage layer | `chrome.storage.local` via manifest content_scripts injection |
| Per-search vs. global keying | Notes global by ASIN; column visibility global; filters and sort per-search |
| searchId for per-search state | The Supabase `id` from the URL `?id=` param (universal — confirmed Chat 90) |
| Storage hygiene | No pruning. Quota is 10MB; per-search state is ~1KB. Revisit if it becomes a problem. |
| Write timing | Mirror existing rerender debounce pattern. Text inputs share 250ms debounce; checkboxes/dropdowns/sort/column-toggles write immediately. |
| rerenderTableOnly merge gap | Folded into Option 1. Non-negotiable — the storage onChanged listener calls rerenderTableOnly directly, so without the merge, notes from another tab won't render. |
| Sharing model (always-latest vs. frozen-snapshot) | Deferred to Share Redesign. Out of scope for Option 1. |

---

## 4. Storage schema

Three keys total. Two new, one existing.

### 4.1 `au_item_notes` (existing, unchanged)

```
{
  [asin: string]: string   // note text
}
```

Global, keyed by ASIN. A note about a product follows that product across searches. Already in use by panel and existing compare.html code. No schema change.

### 4.2 `au_col_visibility` (new, global)

```
{
  price:       boolean,
  ppu:         boolean,
  delivery:    boolean,
  rating:      boolean,
  reviewCount: boolean,
  isPrime:     boolean,
  coupon:      boolean,
  retailerKey: boolean,
  brand:       boolean,
  note:        boolean
}
```

Defaults to all `true` (matches current `colVisible` initial state at compare.html line 1094). Display preference; persists across all searches.

### 4.3 `au_search_state` (new, per-search)

```
{
  [shareId: string]: {
    filters: {
      include:                   string,
      exclude:                   string,
      minReviews:                number,
      minRating:                 number,
      retailer:                  string,
      hideSponsored:             boolean,
      minPrice:                  string,
      maxPrice:                  string,
      requirePrime:              boolean,
      requireSnap:               boolean,
      requireFsaHsa:             boolean,
      requireClimatePledge:      boolean,
      requireSmallBusiness:      boolean,
      hideUnrecognizedBrands:    boolean,
      hideAmazonBrands:          boolean,
      hideSlowShipping:          boolean,
      deliveryDays:              number
    },
    sort: {
      col: string,
      dir: 'asc' | 'desc'
    }
  }
}
```

Field names mirror existing module-level vars at compare.html lines 1072-1088 and 948-949 exactly.

`shareId` is the Supabase id from `URLSearchParams.get('id')`. Universally present on every compare.html page load.

Defaults match the existing initial values in compare.html.

---

## 5. Manifest change

### 5.1 Diff

Add a new entry to the `content_scripts` array. Place it after the existing entries.

```json
{
  "matches": ["https://actuallyuseful.net/compare.html*"],
  "js": ["content/shared/core.js"],
  "run_at": "document_start"
}
```

### 5.2 Why this shape

- **`matches`** — pattern matches compare.html on any query string. The asterisk after `compare.html` covers `?id=…` and any future params.
- **`js`** — only `core.js`. compare.html has its own large inline script; we don't need search.js (Amazon-only logic) or styles.css (compare.html has its own CSS). `core.js` is small and gives us the `auReportError` and `auSendMessage` helpers as a bonus, alongside the storage helpers.
- **`run_at: "document_start"`** — runs before compare.html's inline `init()`. This matters because compare.html's init at line 2561 checks `if (window.chrome && chrome.storage && chrome.storage.local)`. We want `core.js` loaded before that check fires. Note: this is a change from the other content_scripts entries which use `document_idle`. Document_start is correct here because we need the storage API available when init runs.
- **No CSS** — compare.html has its own styling. Injecting `styles.css` would risk visual regressions.

### 5.3 Permission surface

- `host_permissions` for `actuallyuseful.net` is already present. No change.
- The `storage` permission is already granted. No change.
- **No new permissions required.** This is the smallest possible permission delta.

### 5.4 Privacy note implications

Out of scope for code changes, but flagged for follow-up: privacy.html should be updated to mention that compare.html now runs as an extension-injected page on actuallyuseful.net. The extension's data access on compare.html is `chrome.storage.local` only — same as on Amazon pages. No new data category, just a new surface. The privacy note is small.

---

## 6. Code changes to compare.html

### 6.1 Module-level state additions

After line 1735 (`let localNotes = {}`), add:

```javascript
let localColVisibility = {}; // loaded from chrome.storage.local; overlays defaults on init
let localSearchState = {};   // current page's filters + sort, loaded on init
let currentShareId = '';     // Supabase id from URL — set once in init
```

### 6.2 Helper functions (new)

Insert a new section after the `scheduleNoteWrite` helper (after line 1898):

```javascript
// ── Workspace state: column visibility persistence ────────────
function loadColVisibility(callback) {
  if (!hasStorage()) { callback(); return; }
  chrome.storage.local.get('au_col_visibility', function(r) {
    if (r.au_col_visibility) {
      // Overlay stored values onto current defaults
      Object.keys(r.au_col_visibility).forEach(function(key) {
        if (colVisible.hasOwnProperty(key)) {
          colVisible[key] = r.au_col_visibility[key];
        }
      });
    }
    callback();
  });
}

function saveColVisibility() {
  if (!hasStorage()) return;
  chrome.storage.local.set({ au_col_visibility: colVisible });
}

// ── Workspace state: per-search filters + sort persistence ────
function loadSearchState(callback) {
  if (!hasStorage() || !currentShareId) { callback(); return; }
  chrome.storage.local.get('au_search_state', function(r) {
    var all = r.au_search_state || {};
    var entry = all[currentShareId];
    if (entry) {
      if (entry.filters) applyFiltersFromStorage(entry.filters);
      if (entry.sort)    applySortFromStorage(entry.sort);
    }
    callback();
  });
}

// Debounced search-state write — coalesces rapid filter changes into one storage write
var _searchStateWriteTimer = null;
function scheduleSearchStateWrite() {
  if (!hasStorage() || !currentShareId) return;
  clearTimeout(_searchStateWriteTimer);
  _searchStateWriteTimer = setTimeout(function() {
    chrome.storage.local.get('au_search_state', function(r) {
      var all = r.au_search_state || {};
      all[currentShareId] = {
        filters: serializeCurrentFilters(),
        sort:    { col: sortCol, dir: sortDir }
      };
      chrome.storage.local.set({ au_search_state: all });
    });
  }, 250);
}

function serializeCurrentFilters() {
  return {
    include:                filterInclude,
    exclude:                filterExclude,
    minReviews:             filterMinReviews,
    minRating:              filterMinRating,
    retailer:               filterRetailer,
    hideSponsored:          filterHideSponsored,
    minPrice:               filterMinPrice,
    maxPrice:               filterMaxPrice,
    requirePrime:           filterRequirePrime,
    requireSnap:            filterRequireSnap,
    requireFsaHsa:          filterRequireFsaHsa,
    requireClimatePledge:   filterRequireClimatePledge,
    requireSmallBusiness:   filterRequireSmallBusiness,
    hideUnrecognizedBrands: filterHideUnrecognizedBrands,
    hideAmazonBrands:       filterHideAmazonBrands,
    hideSlowShipping:       filterHideSlowShipping,
    deliveryDays:           filterDeliveryDays
  };
}

function applyFiltersFromStorage(f) {
  if (f.include                !== undefined) filterInclude                = f.include;
  if (f.exclude                !== undefined) filterExclude                = f.exclude;
  if (f.minReviews             !== undefined) filterMinReviews             = f.minReviews;
  if (f.minRating              !== undefined) filterMinRating              = f.minRating;
  if (f.retailer               !== undefined) filterRetailer               = f.retailer;
  if (f.hideSponsored          !== undefined) filterHideSponsored          = f.hideSponsored;
  if (f.minPrice               !== undefined) filterMinPrice               = f.minPrice;
  if (f.maxPrice               !== undefined) filterMaxPrice               = f.maxPrice;
  if (f.requirePrime           !== undefined) filterRequirePrime           = f.requirePrime;
  if (f.requireSnap            !== undefined) filterRequireSnap            = f.requireSnap;
  if (f.requireFsaHsa          !== undefined) filterRequireFsaHsa          = f.requireFsaHsa;
  if (f.requireClimatePledge   !== undefined) filterRequireClimatePledge   = f.requireClimatePledge;
  if (f.requireSmallBusiness   !== undefined) filterRequireSmallBusiness   = f.requireSmallBusiness;
  if (f.hideUnrecognizedBrands !== undefined) filterHideUnrecognizedBrands = f.hideUnrecognizedBrands;
  if (f.hideAmazonBrands       !== undefined) filterHideAmazonBrands       = f.hideAmazonBrands;
  if (f.hideSlowShipping       !== undefined) filterHideSlowShipping       = f.hideSlowShipping;
  if (f.deliveryDays           !== undefined) filterDeliveryDays           = f.deliveryDays;
}

function applySortFromStorage(s) {
  if (s.col) sortCol = s.col;
  if (s.dir) sortDir = s.dir;
}

// ── Single guard for all chrome.storage access ────────────────
function hasStorage() {
  return !!(window.chrome && chrome.storage && chrome.storage.local);
}
```

**Why these shapes:**

- `loadColVisibility` *overlays* onto `colVisible` instead of replacing it. New columns added in future versions still get their defaults; only previously-seen keys load from storage.
- `loadSearchState` checks `currentShareId` before attempting to load. If there's no id (e.g., the dead `?data=` path), it skips silently.
- `scheduleSearchStateWrite` debounces at 250ms — matching the include/exclude rerender debounce at line 2199. Filters fired in rapid succession (typing in include box) coalesce into one storage write.
- `serializeCurrentFilters` / `applyFiltersFromStorage` are paired in/out functions. Adding a future filter means adding it to both — easy to keep in sync, easy to spot if missed.
- `hasStorage` replaces the scattered inline guards. Single source of truth.

### 6.3 init() changes

**Current (lines 2547-2576):**

```javascript
if (shareId) {
  // ... loads from Supabase ...
  if (window.chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get('au_item_notes', function(r) {
      localNotes = r.au_item_notes || {};
      rerender();
      chrome.storage.onChanged.addListener(function(changes, area) {
        if (area !== 'local' || !changes.au_item_notes) return;
        localNotes = changes.au_item_notes.newValue || {};
        rerenderTableOnly();
      });
    });
  } else {
    rerender();
  }
  return;
}
```

**Replace with:**

```javascript
if (shareId) {
  currentShareId = shareId;
  main.innerHTML = '<p style="text-align:center;padding:3rem;color:#64748b;">Loading comparison…</p>';
  try {
    const parsed = await loadComparison(shareId);
    currentItems = parsed.items || [];
    currentSearchTerm = parsed.searchTerm || '';
    currentSearchUrl = parsed.searchUrl || '';
  } catch (e) {
    main.innerHTML = renderError('load-failed');
    return;
  }
  if (!currentItems.length) { main.innerHTML = renderError('load-failed'); return; }

  // Load all workspace state from chrome.storage.local in parallel, then render once
  if (hasStorage()) {
    var pending = 3;
    var done = function() { if (--pending === 0) { rerender(); attachStorageListener(); } };

    chrome.storage.local.get('au_item_notes', function(r) {
      localNotes = r.au_item_notes || {};
      done();
    });
    loadColVisibility(done);
    loadSearchState(done);
  } else {
    rerender();
  }
  return;
}
```

**Why this shape:**

- All three reads happen in parallel. We render once when all three return.
- The `pending` counter is a simple barrier — cleaner than nested callbacks or Promise.all (which would require promisifying chrome.storage.get).
- `attachStorageListener` is split out (next section) — moves the cross-tab sync logic out of init.

### 6.4 The storage listener (cross-tab sync)

After init, add:

```javascript
function attachStorageListener() {
  if (!hasStorage()) return;
  chrome.storage.onChanged.addListener(function(changes, area) {
    if (area !== 'local') return;
    var needsTableRerender = false;
    var needsFullRerender = false;

    if (changes.au_item_notes) {
      localNotes = changes.au_item_notes.newValue || {};
      needsTableRerender = true;
    }
    if (changes.au_col_visibility) {
      Object.keys(changes.au_col_visibility.newValue || {}).forEach(function(key) {
        if (colVisible.hasOwnProperty(key)) {
          colVisible[key] = changes.au_col_visibility.newValue[key];
        }
      });
      needsFullRerender = true; // col-toggle bar needs to redraw active states
    }
    if (changes.au_search_state) {
      var entry = (changes.au_search_state.newValue || {})[currentShareId];
      if (entry) {
        if (entry.filters) applyFiltersFromStorage(entry.filters);
        if (entry.sort)    applySortFromStorage(entry.sort);
        needsFullRerender = true; // filter bar needs to redraw with new values
      }
    }

    if (needsFullRerender) rerender();
    else if (needsTableRerender) rerenderTableOnly();
  });
}
```

**Why this shape:**

- One listener handles all three storage keys. Avoids three separate listeners.
- Distinguishes rerenderTableOnly (notes — table cells only) from rerender (filters and column visibility — need to redraw the filter bar and column toggle bar).
- Filter changes from another tab only apply if the changed entry matches `currentShareId` — other searches' state changes are ignored.

### 6.5 Wire saves to existing handlers

Three changes, one for each new storage path.

#### 6.5.1 Filter handlers — `attachFilterHandlers` (compare.html line 2186)

Every filter handler currently ends with `rerender()` or `rerenderTableOnly()`. Add `scheduleSearchStateWrite()` to each. Example (line 2207):

**Before:**
```javascript
rerenderTableOnly();
```

**After:**
```javascript
rerenderTableOnly();
scheduleSearchStateWrite();
```

Apply to every line that mutates a `filter*` var. That's lines 2207, 2217, 2227, 2236, 2245, 2254, 2263, 2272, 2281, 2290, 2299, 2308, 2317, 2325, 2334, 2343, 2351, 2377. (18 locations total.)

#### 6.5.2 Sort handlers — `attachSortHandlers` (compare.html line 1768)

Look at the existing handler and add `scheduleSearchStateWrite()` after the rerender call. Specifically:

```javascript
function attachSortHandlers() {
  document.querySelectorAll('#compare-table thead th[data-col]').forEach(function(th) {
    th.addEventListener('click', function() {
      const col = th.dataset.col;
      // ... existing sort logic ...
      rerender();
      scheduleSearchStateWrite();   // ← NEW
    });
  });
}
```

#### 6.5.3 Column toggle handlers — `attachColToggleHandlers` (compare.html line 1484)

**Before (lines 1486-1494):**
```javascript
btn.addEventListener('click', function() {
  var key = this.getAttribute('data-col');
  colVisible[key] = !colVisible[key];
  var active = colVisible[key];
  this.style.background = active ? '#f25d4e' : '#fff';
  this.style.color      = active ? '#ffffff' : '#64748b';
  this.style.border     = active ? '1px solid #f25d4e' : '1px solid #e2e8f0';
  applyColVisibility();
});
```

**After:**
```javascript
btn.addEventListener('click', function() {
  var key = this.getAttribute('data-col');
  colVisible[key] = !colVisible[key];
  var active = colVisible[key];
  this.style.background = active ? '#f25d4e' : '#fff';
  this.style.color      = active ? '#ffffff' : '#64748b';
  this.style.border     = active ? '1px solid #f25d4e' : '1px solid #e2e8f0';
  applyColVisibility();
  saveColVisibility();   // ← NEW
});
```

No debounce — column toggles are click events, not keystroke events.

### 6.6 The rerenderTableOnly merge fix

**Current (compare.html line 1966):**

```javascript
function rerenderTableOnly() {
  const filtered = applyFilters(currentItems);
  // ... rest of function ...
```

**Replace with:**

```javascript
function rerenderTableOnly() {
  // Merge any locally-stored notes into currentItems before rendering
  // (mirrors the same block in rerender() — needed because the storage
  // onChanged listener can call rerenderTableOnly directly.)
  if (Object.keys(localNotes).length) {
    currentItems.forEach(function(it) {
      if (localNotes[it.asin] !== undefined) it.note = localNotes[it.asin];
    });
  }
  const filtered = applyFilters(currentItems);
  // ... rest of function unchanged ...
```

Exact copy of compare.html lines 1786-1791 inserted at the top of rerenderTableOnly.

### 6.7 Replace the dead inline storage guard

The existing guard `if (window.chrome && chrome.storage && chrome.storage.local)` at line 2561 is removed by the init replacement in 6.3 above. The remaining inline guards inside `scheduleNoteWrite` (line 1888) can be left alone or simplified to `if (!hasStorage()) return;` for consistency. **Recommended:** simplify for consistency. One guard helper, used everywhere.

---

## 7. Loading order and timing

A subtle issue worth flagging. The current init flow at line 2541-2543 does:

```javascript
const [blocklist, amazonlist] = await Promise.all([
  fetchBrandList('https://actuallyuseful.net/data/brand_blocklist.txt'),
  fetchBrandList('https://actuallyuseful.net/data/amazon_brands.txt')
]);
```

This fetch happens before the Supabase load. The new state-load happens after the Supabase load. The page shows "Loading comparison…" during the Supabase fetch. So the user-visible state on first render already reflects loaded notes, filters, sort, and column visibility — no flash of unfiltered content. Good.

One risk: if `loadSearchState` is slow (it shouldn't be — it's local storage), the user sees the loading message slightly longer. In practice chrome.storage.local reads are sub-millisecond. Not a real concern.

---

## 8. Migration: existing Supabase shares

No migration code required. Behavior:

| Recipient already has note for ASIN? | Shared comparison has note for ASIN? | Result |
|---|---|---|
| Yes | Yes | Recipient's local note wins (overlay logic in `rerender`) |
| Yes | No | Recipient's local note wins (already in `it.note`) |
| No | Yes | Shared note shows (already in `parsed.items[].note`) |
| No | No | Empty (correct) |

This is the right behavior for "recipient is viewing someone else's link." The recipient's own private notes never get clobbered by a shared comparison.

**Worth noting for the sharing redesign later:** the include-notes UX (Approach 4 from Chat 87) determines whether `parsed.items[].note` is populated at all. That decision is independent of Option 1 and remains as-is.

---

## 9. Open questions and deferred decisions

| Question | Status |
|---|---|
| Sharing model: always-latest vs. frozen-snapshot | Deferred to Share Redesign |
| Turn-based collaboration (Option 5) | Parked. Not dead. |
| Storage pruning | Deferred. Revisit if quota approaches. |
| Privacy.html update for compare.html injection | Out of scope for code; flagged as follow-up |
| Test 1 panel textarea regression | Independent. Pick up any session. |

---

## 10. Test plan

### 10.1 Smoke tests (must pass)

1. **Manifest reload doesn't break Amazon panel.** Reload the extension. Open an Amazon search. Panel renders normally.
2. **compare.html still opens.** Click the panel's Compare button. compare.html opens with `?id=…`. Items render.
3. **No console errors on compare.html load.** Open devtools. Load a compare page. No red errors.

### 10.2 Notes persistence (the original bug)

4. **Type a note. Refresh. Note survives.** This is the bug Option 1 exists to fix.
5. **Open same compare URL in second tab. Note appears in second tab.** Cross-tab sync via storage listener.
6. **Edit note in tab 1. Tab 2 updates within ~300ms.** Debounced write + storage listener.
7. **Notes typed on panel appear on compare.html.** Existing cross-surface sync still works.

### 10.3 Filter persistence

8. **Set include = "wireless". Refresh. Include is still "wireless" and filtered view shows.**
9. **Set min reviews = 100. Refresh. Still 100.**
10. **Toggle hide-sponsored. Refresh. Stays toggled.**
11. **Open a *different* compare URL. Filters are at defaults, not the previous URL's values.** Per-search isolation.

### 10.4 Sort persistence

12. **Click "Price" column to sort ascending. Refresh. Still sorted ascending by Price.**
13. **Click again to flip to descending. Refresh. Still descending.**

### 10.5 Column visibility persistence

14. **Hide "Coupon" column. Refresh. Column stays hidden.**
15. **Open a *different* compare URL. Column is still hidden.** Global, not per-search.
16. **Re-show "Coupon". Refresh. Column reappears.**

### 10.6 Cross-tab sync for filters/columns

17. **Open same compare URL in two tabs. Change include filter in tab 1. Tab 2 reflects new filter within ~300ms.**
18. **Hide a column in tab 1. Tab 2 hides it too.**

### 10.7 The merge-gap fix

19. **In tab 1, type a note. In tab 2 (same URL), notes update in the table cell** even when no other code path causes a full rerender. This specifically tests the `rerenderTableOnly` merge fix.

### 10.8 No-storage fallback (defensive)

20. **Open compare.html in incognito with the extension disabled there.** Page loads, renders items, no console errors. State doesn't persist (expected). The `hasStorage()` guard short-circuits cleanly.

---

## 11. Files changed

| File | Change |
|---|---|
| `manifest.json` | Add one entry to `content_scripts` |
| `compare.html` | Add state vars, helper functions, update init, update three event-handler call sites, fix rerenderTableOnly merge |

Two files. No new files created. No changes to `core.js`, `background.js`, `search.js`, or `styles.css`.

---

## 12. Version bumps

- `manifest.json` version → `0.6.2` (minor — new content_scripts entry)
- `compare.html` `COMPARE_VERSION` → `compare-v1.1.0` (minor — workspace persistence feature)

---

## 13. What this spec deliberately does NOT do

- Does not change the sharing model. Frozen-snapshot vs. always-latest is a Share Redesign decision.
- Does not prune storage. Per-search entries accumulate forever (until quota becomes a real concern).
- Does not migrate or transform existing Supabase share records. They keep working as-is.
- Does not add new permissions. The permission surface is unchanged.
- Does not touch privacy.html. The privacy note is small but is a separate task.
- Does not touch search.js or the panel. Notes infrastructure on the panel side is already correct.
- Does not fix Test 1 (panel textarea regression). Independent issue.

---

## 14. Implementation order for next session

When coding starts, this is the order that maximizes chance of catching issues early:

1. **Manifest change first.** Reload extension. Verify Amazon panel still works (smoke 1).
2. **Verify storage access on compare.html.** Open devtools console on compare.html. Type `chrome.storage.local.get('au_item_notes', console.log)`. Should return notes object, not undefined or error.
3. **rerenderTableOnly merge fix.** Smallest change. Easy to verify.
4. **Notes flow.** This is now the existing code path coming alive. Test 4-7.
5. **Column visibility persistence.** Simpler than filters (global, no per-search keying).
6. **Filter persistence.** The biggest code surface (18 call sites + serialize/deserialize).
7. **Sort persistence.** Smallest of the per-search state changes.
8. **Storage listener.** Cross-tab sync — test last because it depends on everything else working.

Each step has its own smoke test. Don't proceed past a failing test.

---

*End of spec.*
