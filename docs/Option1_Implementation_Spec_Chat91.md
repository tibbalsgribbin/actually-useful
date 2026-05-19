# Option 1 Implementation Spec — Workspace Persistence for compare.html

*Chat 91 · May 19, 2026 · Opus session*

*Corrected spec replacing the flawed Chat 90 version. Architecture A: a tiny content-script bridge + page-side postMessage client. Scope unchanged from Chat 90: notes + filters + sort + column visibility persistence on compare.html, plus the rerenderTableOnly merge fix.*

---

## 0. Why this spec exists (and replaces Chat 90's)

The Chat 90 spec assumed that adding compare.html to the manifest's `content_scripts` would expose `chrome.storage` to the page's inline `<script>` block. That's wrong: content scripts run in an **isolated world** — a separate JS execution context from the page's own scripts. compare.html's existing `init()`, `scheduleNoteWrite`, and storage-listener code live in the page's world and cannot see `chrome.storage`, no matter what we put in `content_scripts`.

This spec fixes that flaw with a bridge: a small content script (`compare-bridge.js`) that owns all `chrome.storage` access, paired with a thin page-side client that talks to it via `window.postMessage`. The architectural decisions (scope, keying, debounce timings) and the storage schema from Chat 90 carry forward unchanged.

---

## 1. The problem in one paragraph

compare.html already contains code to read and write notes from `chrome.storage.local`, but that code never runs on the live page because compare.html is served from `actuallyuseful.net` as a regular web page, and regular web pages cannot access `chrome.storage`. The fix is a bridge: an extension content script that we inject into compare.html, running in its own isolated JS context where `chrome.storage` works. The page's inline script talks to the bridge via `window.postMessage` for reads, writes, and change notifications. With that bridge in place, the existing notes path comes alive and we extend the same pattern to filters, sort, and column visibility. We also fix the `rerenderTableOnly` merge gap that will surface the moment storage starts working cross-tab.

---

## 2. Architecture overview

```
┌─────────────────────────────────────────────────────────┐
│  actuallyuseful.net/compare.html  (page world)          │
│                                                          │
│  inline <script>                                         │
│    init(), rerender(), event handlers, ...               │
│    bridge client: bridgePing, bridgeGet, bridgeSet, ...  │
│         │                                                │
│         │  window.postMessage  ────────┐                 │
│         ▼                              ▼                 │
│    ─────────────── ISOLATED WORLD BOUNDARY ─────────     │
│                                                          │
│  compare-bridge.js  (content script, isolated world)    │
│    listens for postMessage, routes to chrome.storage    │
│    pushes chrome.storage.onChanged events back          │
│         │                                                │
│         │  chrome.storage.local                          │
│         ▼                                                │
│  ┌──────────────────────────────────────┐               │
│  │  au_item_notes / au_col_visibility / │               │
│  │  au_search_state                     │               │
│  └──────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

Two execution contexts on the same page. Same `window` object. Different JS globals. Linked by `window.postMessage` for explicit cross-boundary calls.

---

## 3. Architectural decisions (locked, from Chat 90)

| Decision | Resolution |
|---|---|
| Primary purpose of compare.html | Private workspace (locked Chat 89) |
| Storage layer | `chrome.storage.local` via content-script bridge |
| Per-search vs. global keying | Notes global by ASIN; column visibility global; filters and sort per-search |
| searchId for per-search state | The Supabase `id` from the URL `?id=` param (universal) |
| Storage hygiene | No pruning. Quota is 10MB; per-search state is ~1KB. Revisit if it becomes a problem. |
| Write timing | Mirror existing rerender debounce pattern. Text inputs 250ms; checkboxes/dropdowns/sort/column-toggles immediate. |
| rerenderTableOnly merge gap | Folded into Option 1. The storage-changed listener calls rerenderTableOnly directly; without the merge, notes from another tab won't render. |
| Sharing model | Deferred to Share Redesign. Out of scope. |

**New, this spec only:**

| Decision | Resolution |
|---|---|
| Delivery mechanism | Content-script bridge + page-side postMessage client (Architecture A) |
| Bridge detection timeout | 1000ms from page-side ping; fall back to no-persistence on timeout |
| Non-extension viewer UX | Inputs remain visible; writes silently no-op (same observable behavior as today, just now we know why) |
| Bridge file location | `content/page/compare-bridge.js` (new path; not co-located with Amazon-page scripts) |

---

## 4. Storage schema (unchanged from Chat 90)

Three keys total. Two new, one existing. The schema is the same regardless of how the page reaches `chrome.storage`.

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

Field names mirror existing module-level vars at compare.html lines 1072-1088 and 948-949. `shareId` is the Supabase id from `URLSearchParams.get('id')`.

---

## 5. The bridge file (new): `content/page/compare-bridge.js`

Complete file. Self-contained. ~100 lines including comments.

```javascript
// compare-bridge.js — content script that exposes chrome.storage to compare.html
// Lives in the isolated world; talks to the page via window.postMessage.
// Loaded at document_start so the page's inline script can ping it immediately.

(function() {
  'use strict';

  var ORIGIN = window.location.origin; // 'https://actuallyuseful.net'
  var MARKER = '__au_bridge';

  // ── Outbound: forward chrome.storage changes to the page ──────────────────
  chrome.storage.onChanged.addListener(function(changes, area) {
    if (area !== 'local') return;
    var relevant = {};
    if (changes.au_item_notes)     relevant.au_item_notes     = changes.au_item_notes.newValue     || {};
    if (changes.au_col_visibility) relevant.au_col_visibility = changes.au_col_visibility.newValue || {};
    if (changes.au_search_state)   relevant.au_search_state   = changes.au_search_state.newValue   || {};
    if (!Object.keys(relevant).length) return;
    window.postMessage({
      __au_bridge: true,
      kind: 'push',
      event: 'storageChanged',
      changes: relevant
    }, ORIGIN);
  });

  // ── Inbound: requests from the page ───────────────────────────────────────
  window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    if (event.origin !== ORIGIN) return;
    var msg = event.data;
    if (!msg || msg[MARKER] !== true || msg.kind !== 'request') return;

    handle(msg);
  });

  function respond(id, ok, data, error) {
    window.postMessage({
      __au_bridge: true,
      kind: 'response',
      id: id,
      ok: ok,
      data: data || null,
      error: error || null
    }, ORIGIN);
  }

  function handle(msg) {
    try {
      switch (msg.method) {
        case 'ping':
          respond(msg.id, true, { pong: true });
          return;

        case 'getState':
          chrome.storage.local.get(
            ['au_item_notes', 'au_col_visibility', 'au_search_state'],
            function(r) {
              respond(msg.id, true, {
                notes:     r.au_item_notes     || {},
                columns:   r.au_col_visibility || null,
                allSearch: r.au_search_state   || {}
              });
            }
          );
          return;

        case 'setNote': {
          var asin = msg.args && msg.args[0];
          var text = msg.args && msg.args[1];
          if (!asin) { respond(msg.id, false, null, 'missing asin'); return; }
          chrome.storage.local.get('au_item_notes', function(r) {
            var notes = r.au_item_notes || {};
            if (text && text.length) notes[asin] = text;
            else delete notes[asin];
            chrome.storage.local.set({ au_item_notes: notes }, function() {
              respond(msg.id, true);
            });
          });
          return;
        }

        case 'setColumns':
          chrome.storage.local.set(
            { au_col_visibility: msg.args && msg.args[0] },
            function() { respond(msg.id, true); }
          );
          return;

        case 'setSearchState': {
          var searchId = msg.args && msg.args[0];
          var state    = msg.args && msg.args[1];
          if (!searchId) { respond(msg.id, false, null, 'missing searchId'); return; }
          chrome.storage.local.get('au_search_state', function(r) {
            var all = r.au_search_state || {};
            all[searchId] = state;
            chrome.storage.local.set({ au_search_state: all }, function() {
              respond(msg.id, true);
            });
          });
          return;
        }

        default:
          respond(msg.id, false, null, 'unknown method: ' + msg.method);
      }
    } catch (e) {
      respond(msg.id, false, null, String(e));
    }
  }
})();
```

**Why this shape:**

- **`event.source !== window`** filter blocks cross-frame postMessage from anywhere else (iframes, parent windows). Only same-window messages get through.
- **`event.origin !== ORIGIN`** filter rejects anything claiming to come from another origin.
- **`__au_bridge` marker** namespaces our messages so we don't collide with other postMessage traffic (other extensions, web apps that use postMessage for their own reasons).
- **`document_start`** loading (set in manifest, §6) means the bridge's listener is attached before any page script can run, so the page's first ping always finds it.
- **No state in the bridge.** All state lives in `chrome.storage.local`. The bridge is a stateless router.
- **`getState` bundles all three keys** into one round-trip. Init can populate notes, columns, and search state in a single postMessage exchange instead of three.
- **`setNote` does read-modify-write inside the bridge** rather than asking the page to send the full notes object. Keeps the wire payload small. Same pattern for `setSearchState`.
- **`setColumns` is just a write** because the columns object is small (~10 booleans) and the page already owns the canonical copy.

---

## 6. Manifest change

### 6.1 Diff

Add one entry to the `content_scripts` array:

```json
{
  "matches": ["https://actuallyuseful.net/compare.html*"],
  "js": ["content/page/compare-bridge.js"],
  "run_at": "document_start"
}
```

### 6.2 Why this shape

- **`matches`** — pattern matches compare.html with any query string. Covers `?id=…` and any future params.
- **`js`** — only `compare-bridge.js`. We do not inject `core.js` (different concerns) or any of the Amazon-page scripts.
- **`run_at: "document_start"`** — bridge's message listener must be attached before any page script can ping it. document_start guarantees this. (Note: other content_scripts entries use `document_idle`, which is fine for them; this one is different on purpose.)
- **No CSS** — compare.html has its own styling.

### 6.3 Permission surface

- `host_permissions` for `actuallyuseful.net` is already present. No change.
- The `storage` permission is already granted. No change.
- **No new permissions required.**

### 6.4 Privacy.html implications

Out of scope for code changes, but flagged for follow-up: privacy.html should note that the extension now injects a bridge script into compare.html on actuallyuseful.net for local note/filter/sort/column persistence. The data access is `chrome.storage.local` only — no new data category, no new external surface. Small update.

---

## 7. Page-side bridge client (new code in compare.html)

A self-contained block of ~80 lines added near the top of compare.html's inline script (after the module-level `let` declarations, before the existing helper functions). Wraps `postMessage` in a Promise-returning API and feature-detects bridge presence.

### 7.1 The client

```javascript
// ── Bridge client: talks to compare-bridge.js via window.postMessage ──────
var BRIDGE_MARKER = '__au_bridge';
var BRIDGE_ORIGIN = window.location.origin;
var BRIDGE_PING_TIMEOUT_MS = 1000;
var BRIDGE_REQUEST_TIMEOUT_MS = 5000;

var _bridgeAvailable = null;       // null = unknown, true/false = decided
var _bridgeReqNextId = 1;
var _bridgePending   = {};         // id → {resolve, reject, timer}
var _bridgePushHandler = null;

window.addEventListener('message', function(event) {
  if (event.source !== window) return;
  if (event.origin !== BRIDGE_ORIGIN) return;
  var msg = event.data;
  if (!msg || msg[BRIDGE_MARKER] !== true) return;

  if (msg.kind === 'response') {
    var p = _bridgePending[msg.id];
    if (!p) return;
    clearTimeout(p.timer);
    delete _bridgePending[msg.id];
    if (msg.ok) p.resolve(msg.data);
    else        p.reject(new Error(msg.error || 'bridge error'));
    return;
  }

  if (msg.kind === 'push' && msg.event === 'storageChanged') {
    if (_bridgePushHandler) _bridgePushHandler(msg.changes);
    return;
  }
});

function bridgeRequest(method, args, timeoutMs) {
  return new Promise(function(resolve, reject) {
    var id = _bridgeReqNextId++;
    var t = setTimeout(function() {
      if (_bridgePending[id]) {
        delete _bridgePending[id];
        reject(new Error('bridge timeout: ' + method));
      }
    }, timeoutMs || BRIDGE_REQUEST_TIMEOUT_MS);
    _bridgePending[id] = { resolve: resolve, reject: reject, timer: t };
    window.postMessage({
      __au_bridge: true,
      kind: 'request',
      id: id,
      method: method,
      args: args || []
    }, BRIDGE_ORIGIN);
  });
}

// Detect bridge with a short-timeout ping. Returns true/false; never throws.
function detectBridge() {
  if (_bridgeAvailable !== null) return Promise.resolve(_bridgeAvailable);
  return bridgeRequest('ping', [], BRIDGE_PING_TIMEOUT_MS)
    .then(function() { _bridgeAvailable = true;  return true; })
    .catch(function() { _bridgeAvailable = false; return false; });
}

// Convenience wrappers. All return Promises; all no-op safely if no bridge.
function bridgeGetState()                   { return bridgeRequest('getState'); }
function bridgeSetNote(asin, text)          { return bridgeRequest('setNote',        [asin, text]); }
function bridgeSetColumns(visibility)       { return bridgeRequest('setColumns',     [visibility]); }
function bridgeSetSearchState(searchId, s)  { return bridgeRequest('setSearchState', [searchId, s]); }

function bridgeOnPush(handler) { _bridgePushHandler = handler; }
```

### 7.2 Why this shape

- **`detectBridge` caches the result.** Called once at init; all subsequent storage operations check `_bridgeAvailable` instead of re-pinging.
- **`bridgeRequest` always times out.** No hung promises. 5s for normal ops, 1s for the initial ping.
- **`_bridgePushHandler` is a single function**, not a list. Only init wires it up; no need for multi-subscriber complexity.
- **No `async`/`await` syntax in the client.** Promise-based for compatibility with the existing callback-style helper patterns in compare.html. The init code (which is already `async`) can use `await` on these wrappers naturally.

---

## 8. Code changes to compare.html

### 8.1 Module-level state additions

After line 1735 (`let localNotes = {}`), add:

```javascript
let localColVisibility = {};  // overlay loaded from storage; merged onto colVisible at init
let currentShareId = '';      // Supabase id from URL — set once in init
```

(We don't need a `localSearchState` mirror; filter and sort state are already held in the existing `filter*` and `sortCol`/`sortDir` module vars. We hydrate them at init and write back on change.)

### 8.2 Helper functions for state shaping (new)

Insert after the bridge client block (§7):

```javascript
// ── Workspace state helpers ──────────────────────────────────────────────
function overlayColVisibility(stored) {
  if (!stored) return;
  Object.keys(stored).forEach(function(key) {
    if (colVisible.hasOwnProperty(key)) colVisible[key] = stored[key];
  });
}

function applyFiltersFromStorage(f) {
  if (!f) return;
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
  if (!s) return;
  if (s.col) sortCol = s.col;
  if (s.dir) sortDir = s.dir;
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

// Debounced search-state write — coalesces rapid filter changes into one bridge write
var _searchStateWriteTimer = null;
function scheduleSearchStateWrite() {
  if (!_bridgeAvailable || !currentShareId) return;
  clearTimeout(_searchStateWriteTimer);
  _searchStateWriteTimer = setTimeout(function() {
    bridgeSetSearchState(currentShareId, {
      filters: serializeCurrentFilters(),
      sort:    { col: sortCol, dir: sortDir }
    }).catch(function() { /* swallow bridge errors; not fatal */ });
  }, 250);
}

function saveColumns() {
  if (!_bridgeAvailable) return;
  bridgeSetColumns(colVisible).catch(function() {});
}
```

### 8.3 init() changes

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
    currentSearchUrl  = parsed.searchUrl  || '';
  } catch (e) {
    main.innerHTML = renderError('load-failed');
    return;
  }
  if (!currentItems.length) { main.innerHTML = renderError('load-failed'); return; }

  // Detect bridge; hydrate state if present
  const bridgeUp = await detectBridge();
  if (bridgeUp) {
    // Wire push handler FIRST so we don't drop notifications that arrive
    // during the getState round-trip.
    bridgeOnPush(handleStoragePush);
    try {
      const state = await bridgeGetState();
      localNotes = state.notes || {};
      overlayColVisibility(state.columns);
      const entry = state.allSearch && state.allSearch[currentShareId];
      if (entry) {
        applyFiltersFromStorage(entry.filters);
        applySortFromStorage(entry.sort);
      }
    } catch (e) {
      // Bridge present but getState failed; render with defaults
    }
  }
  rerender();
  return;
}
```

**Why this shape:**

- The bridge ping happens once. Result is cached in `_bridgeAvailable`.
- One `getState` call replaces three separate reads. Less code, fewer round-trips.
- `bridgeOnPush` is wired *before* `bridgeGetState` so that any chrome.storage.onChanged event firing during the getState round-trip (from another tab, the panel, etc.) is processed instead of dropped. The push handler can safely re-apply state on top of either the default or the just-hydrated values.
- If the bridge times out (no extension), the page renders the comparison with default state. Same observable behavior as today.

### 8.4 The storage push handler (cross-tab sync)

Add after the bridge client and helper functions:

```javascript
function handleStoragePush(changes) {
  var needsTableRerender = false;
  var needsFullRerender = false;

  if (changes.au_item_notes) {
    localNotes = changes.au_item_notes;
    needsTableRerender = true;
  }
  if (changes.au_col_visibility) {
    overlayColVisibility(changes.au_col_visibility);
    needsFullRerender = true;  // column-toggle bar redraws active states
  }
  if (changes.au_search_state) {
    var entry = changes.au_search_state[currentShareId];
    if (entry) {
      applyFiltersFromStorage(entry.filters);
      applySortFromStorage(entry.sort);
      needsFullRerender = true;  // filter bar redraws with new values
    }
  }

  if (needsFullRerender) rerender();
  else if (needsTableRerender) rerenderTableOnly();
}
```

**Why this shape:**

- One handler covers all three storage keys.
- `rerenderTableOnly` for notes-only changes (cheap); `rerender` for filter/column changes (needs filter bar + column toggle bar redraw).
- Search-state changes from another tab only apply if the changed entry matches `currentShareId`. Other searches' state changes are ignored.

### 8.5 Wire saves to existing handlers

Three changes, one for each new storage path.

#### 8.5.1 Filter handlers — `attachFilterHandlers` (compare.html line 2186)

Every filter handler currently ends with `rerender()` or `rerenderTableOnly()`. Add `scheduleSearchStateWrite()` to each. Example:

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

#### 8.5.2 Sort handlers — `attachSortHandlers` (compare.html line 1768)

Add `scheduleSearchStateWrite()` after the existing rerender call:

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

#### 8.5.3 Column toggle handlers — `attachColToggleHandlers` (compare.html line 1484)

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
  saveColumns();   // ← NEW
});
```

No debounce — column toggles are discrete click events, immediate write is correct.

#### 8.5.4 Note input handler — `scheduleNoteWrite` (compare.html line 1881)

**Current (lines 1881-1898):**

```javascript
var _noteWriteTimer = null;
function scheduleNoteWrite(asin, text) {
  clearTimeout(_noteWriteTimer);
  _noteWriteTimer = setTimeout(function() {
    if (!window.chrome || !chrome.storage || !chrome.storage.local) return;
    chrome.storage.local.get('au_item_notes', function(r) {
      var notes = r.au_item_notes || {};
      if (text && text.length) notes[asin] = text;
      else delete notes[asin];
      chrome.storage.local.set({ au_item_notes: notes });
    });
  }, 250);
}
```

**Replace with:**

```javascript
var _noteWriteTimer = null;
function scheduleNoteWrite(asin, text) {
  clearTimeout(_noteWriteTimer);
  _noteWriteTimer = setTimeout(function() {
    if (!_bridgeAvailable) return;
    bridgeSetNote(asin, text).catch(function() { /* not fatal */ });
  }, 250);
}
```

The 250ms debounce stays the same. The chrome.storage read-modify-write is now done by the bridge, so the page doesn't need to do its own get-modify-set dance.

### 8.6 The rerenderTableOnly merge fix (unchanged from Chat 90)

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
  // push handler can call rerenderTableOnly directly.)
  if (Object.keys(localNotes).length) {
    currentItems.forEach(function(it) {
      if (localNotes[it.asin] !== undefined) it.note = localNotes[it.asin];
    });
  }
  const filtered = applyFilters(currentItems);
  // ... rest of function unchanged ...
```

Exact copy of compare.html lines 1786-1791 inserted at the top of `rerenderTableOnly`.

### 8.7 Remove the dead inline guards

The existing `if (window.chrome && chrome.storage && chrome.storage.local)` guard at line 2561 is removed by the init replacement in §8.3. The guard inside the old `scheduleNoteWrite` is removed by the replacement in §8.5.4. The old `chrome.storage.onChanged.addListener` block is also removed by §8.3 (replaced by the push handler in §8.4 wired through `bridgeOnPush`).

Net: every direct `chrome.storage` reference in compare.html goes away. The only chrome.* access is now in the bridge file.

---

## 9. Loading order and timing

The init sequence becomes:

1. URL parse, find shareId (instant).
2. Show "Loading comparison…" placeholder (instant).
3. `await loadComparison(shareId)` — Supabase fetch (typically 200-800ms).
4. `await detectBridge()` — 1ms if bridge present, 1000ms timeout if not.
5. If bridge present: `await bridgeGetState()` — ~5ms (postMessage round-trip + chrome.storage read).
6. Apply hydrated state to module vars.
7. `rerender()` — first paint of the table.

In the common case (extension installed), total added latency vs. today is roughly 5-10ms — imperceptible.

In the no-extension case, the 1000ms ping timeout adds a visible delay before the table appears. **This is the main UX cost of Architecture A.** Mitigation options if it becomes a problem:

- Shorten the timeout (500ms is probably enough; 200ms might be).
- Render the table first with defaults, then upgrade once the bridge responds. More complex, breaks the "no flash of unfiltered content" property.

Recommend: start with 1000ms, watch for it being noticeable in non-extension shared-link viewing, tune down if needed.

---

## 10. Migration: existing Supabase shares (unchanged from Chat 90)

No migration code required. Behavior:

| Recipient has note for ASIN? | Shared comparison has note for ASIN? | Result |
|---|---|---|
| Yes | Yes | Recipient's local note wins (overlay logic in `rerender`) |
| Yes | No | Recipient's local note wins (already in `it.note`) |
| No | Yes | Shared note shows (already in `parsed.items[].note`) |
| No | No | Empty (correct) |

The include-notes UX (Approach 4 from Chat 87) determines whether `parsed.items[].note` is populated at all. Independent of Option 1.

---

## 11. Non-extension viewers

People who receive a shared compare link but don't have the extension installed:

- `detectBridge` times out at 1000ms.
- `_bridgeAvailable` becomes false.
- All `bridge*` calls in event handlers short-circuit on the `!_bridgeAvailable` check; no errors.
- Note inputs remain visible. Typing in them updates the local `it.note` field (already current behavior) but writes are silent no-ops.
- Filter and column changes apply in-session but don't persist across refresh.

Same observable behavior as today (notes don't persist for non-extension viewers, never have). The difference is the 1000ms detection delay at page load. Acceptable to start; tune later if needed.

**Possible future polish (not this spec):** when `_bridgeAvailable === false`, show a small note like "Install the extension to save notes and filter preferences." Out of scope.

---

## 12. Open questions and deferred decisions (unchanged from Chat 90)

| Question | Status |
|---|---|
| Sharing model: always-latest vs. frozen-snapshot | Deferred to Share Redesign |
| Turn-based collaboration (Option 5) | Parked. Not dead. |
| Storage pruning | Deferred. Revisit if quota approaches. |
| Privacy.html update | Out of scope for code; flagged as follow-up |
| Test 1 panel textarea regression | Independent. Pick up any session. |
| Non-extension viewer messaging | Polish. Out of scope. |

---

## 13. Test plan

### 13.1 Smoke tests (must pass)

1. **Manifest reload doesn't break Amazon panel.** Reload the extension. Open an Amazon search. Panel renders normally.
2. **compare.html still opens.** Click the panel's Compare button. compare.html opens with `?id=…`. Items render.
3. **No console errors on compare.html load.** Open devtools. Load a compare page. No red errors. Check both page console and (in extension's "Inspect" view) the content-script console.
4. **Bridge ping succeeds.** With extension installed, in compare.html's page console: `window.postMessage({__au_bridge:true, kind:'request', id:99, method:'ping'}, location.origin)`. Within 1s, a response message should appear in the listener. (Easiest verification: temporarily add `console.log` to the bridge client's push/response handler.)

### 13.2 Notes persistence (the original bug)

5. **Type a note. Refresh. Note survives.** This is the bug Option 1 exists to fix.
6. **Open same compare URL in second tab. Note appears in second tab.** Cross-tab sync via bridge push.
7. **Edit note in tab 1. Tab 2 updates within ~300ms.** Debounced write (250ms) + push latency.
8. **Notes typed on panel appear on compare.html.** Existing cross-surface sync via storage onChanged → bridge push.

### 13.3 Filter persistence

9. **Set include = "wireless". Refresh. Include is still "wireless" and filtered view shows.**
10. **Set min reviews = 100. Refresh. Still 100.**
11. **Toggle hide-sponsored. Refresh. Stays toggled.**
12. **Open a *different* compare URL. Filters are at defaults, not the previous URL's values.** Per-search isolation.

### 13.4 Sort persistence

13. **Click "Price" column to sort ascending. Refresh. Still sorted ascending by Price.**
14. **Click again to flip to descending. Refresh. Still descending.**

### 13.5 Column visibility persistence

15. **Hide "Coupon" column. Refresh. Column stays hidden.**
16. **Open a *different* compare URL. Column is still hidden.** Global, not per-search.
17. **Re-show "Coupon". Refresh. Column reappears.**

### 13.6 Cross-tab sync for filters/columns

18. **Open same compare URL in two tabs. Change include filter in tab 1. Tab 2 reflects new filter within ~300ms.**
19. **Hide a column in tab 1. Tab 2 hides it too.**

### 13.7 The merge-gap fix

20. **In tab 1, type a note. In tab 2 (same URL), notes update in the table cell** even when no other code path causes a full rerender. This specifically tests the `rerenderTableOnly` merge fix.

### 13.8 No-bridge fallback (defensive)

21. **Open compare.html in a browser/profile without the extension installed.** Page loads, renders items, no console errors. State doesn't persist (expected). The 1000ms bridge detection delay should be tolerable.
22. **Disable the extension and refresh compare.html.** Same as above. No bridge → no persistence → no errors.

### 13.9 Message protocol security

23. **Inject a hostile postMessage from devtools.** In compare.html's page console: `window.postMessage({__au_bridge:true, kind:'request', id:999, method:'setNote', args:['B00FAKE','injected']}, '*')`. This should *succeed* (it comes from the same window and origin) — that's expected for legitimate-looking same-origin messages. Confirms the marker filtering works. A user with devtools access can already do anything; the security boundary is that *other origins* cannot fake messages.
24. **Bogus markers ignored.** `window.postMessage({someOtherMarker:true}, location.origin)` — bridge ignores; no console errors.

---

## 14. Files changed

| File | Change |
|---|---|
| `manifest.json` | Add one entry to `content_scripts` |
| `compare.html` | Remove direct chrome.storage usage; add bridge client + helpers; update init; update four event-handler call sites; fix `rerenderTableOnly` merge |
| `content/page/compare-bridge.js` | **NEW.** ~100 lines. Content-script bridge between page and chrome.storage. |

Three files. One new file. No changes to `core.js`, `background.js`, `search.js`, or `styles.css`.

---

## 15. Version bumps

- `manifest.json` version → `0.6.2` (minor — new content_scripts entry + new file)
- `compare.html` `COMPARE_VERSION` → `compare-v1.1.0` (minor — workspace persistence feature)
- `compare-bridge.js` — start at `bridge-v1.0.0` (new file)

---

## 16. What this spec deliberately does NOT do

- Does not change the sharing model. Frozen-snapshot vs. always-latest is a Share Redesign decision.
- Does not prune storage. Per-search entries accumulate forever (until quota becomes a real concern).
- Does not migrate or transform existing Supabase share records. They keep working as-is.
- Does not add new permissions. The permission surface is unchanged.
- Does not touch privacy.html. Small follow-up; separate task.
- Does not touch search.js or the panel. Notes infrastructure on the panel side is already correct.
- Does not fix Test 1 (panel textarea regression). Independent issue.
- Does not show a "no extension" message to non-extension viewers. Possible future polish.

---

## 17. Implementation order

1. **Create `content/page/compare-bridge.js`** with the full content from §5.
2. **Update `manifest.json`** with the new content_scripts entry from §6.1. Reload extension. Verify Amazon panel still works (smoke 1). Verify compare.html still opens (smoke 2).
3. **Verify bridge presence on compare.html.** Devtools console. Run the ping snippet from smoke test 4. Confirm a response within 1s.
4. **Add the bridge client block to compare.html** (§7.1). Reload. No-op so far; just available code. Smoke 3 still passes.
5. **Add state-shaping helpers** (§8.2). Still no-op. Smoke 3 still passes.
6. **Apply the `rerenderTableOnly` merge fix** (§8.6). Smallest standalone change. Easy to verify.
7. **Replace init's storage block** (§8.3) and add the push handler (§8.4). Now state loads at init.
8. **Replace `scheduleNoteWrite`** (§8.5.4). Notes flow comes alive. Test 5-8.
9. **Wire column toggles to `saveColumns`** (§8.5.3). Test 15-17.
10. **Wire filter handlers to `scheduleSearchStateWrite`** (§8.5.1). 18 call sites. Test 9-12.
11. **Wire sort handler to `scheduleSearchStateWrite`** (§8.5.2). Test 13-14.
12. **Cross-tab and merge-gap tests.** Test 18-20.
13. **No-bridge fallback verification.** Test 21-22.

Each step has its own smoke test. Don't proceed past a failing test.

---

*End of spec.*
