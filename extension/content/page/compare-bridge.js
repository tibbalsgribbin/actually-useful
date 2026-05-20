// compare-bridge.js — bridge-v1.0.0
// Content script that exposes chrome.storage to compare.html.
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
