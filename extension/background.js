// Actually Useful — background.js v0.6.1.19
// Manages cross-page state: passes search context from search results to product pages.
// Uses chrome.storage.session so context clears when the browser closes.

const SESSION_KEY = 'au_search_context';

// Logging endpoint — receives log payloads from content scripts and forwards them.
// Running fetch() here avoids Amazon's CSP blocking outbound requests from injected scripts.
const AU_LOG_URL = 'https://script.google.com/macros/s/AKfycby0y2gsDtOKxNLXXsOoSVVx_82QYb8wKESx847_ExIBNW6_XW72CfBR4-bQnCx9V1bn/exec';

// Error reporting endpoint — separate from AU_LOG_URL.
// Errors are reported regardless of telemetry opt-out (errors are about
// whether the extension is broken; telemetry is about usage). Payloads
// contain only diagnostic context — no URLs, search terms, ASINs, or
// user content. See auReportError in core.js for payload shape.
const AU_ERROR_URL = 'https://script.google.com/macros/s/AKfycbwG2xxSp_L1kBQLZ1Zgz94Fldn8k1_2tytmDW5hIIDpeQNrcNLrg1VSvELYBUqYqNXPCg/exec';



// Open welcome page on fresh install only (not on update or reload)
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'https://actuallyuseful.net/welcome' });
  }
});

// Toolbar icon click — restore the panel if it's hidden.
// NOTE: This only fires because manifest.json has NO default_popup set.
// If default_popup is ever added back, onClicked will stop firing and panel
// restore will silently break. The popup key was removed in Chat 74 (v0.6.1.18)
// specifically to enable this listener. Do not re-add default_popup without
// revisiting this listener.
chrome.action.onClicked.addListener(function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs || !tabs.length) return;
    chrome.tabs.sendMessage(tabs[0].id, { type: 'ppu-restore-panel' }, function() {
      // Ignore errors — user may be on a non-Amazon page where the content
      // script isn't injected. Silent failure is correct behavior.
      if (chrome.runtime.lastError) { /* intentional no-op */ }
    });
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {


  // search.js calls this to log usage data; fetch runs here to avoid Amazon CSP
  // Only fires if the user has telemetry enabled (default: on)
  // Respond synchronously before async work — the caller (auSendMessage) passes
  // a callback, so the runtime expects a response. Without this, the worker
  // can idle out before sendResponse fires and "message port closed" errors
  // surface.
  if (msg.type === 'AU_LOG') {
    sendResponse({ ok: true });
    chrome.storage.local.get('au_telemetry_enabled', function(result) {
      var enabled = result['au_telemetry_enabled'];
      if (enabled === false) return; // explicitly opted out
      fetch(AU_LOG_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg.payload),
        mode: 'no-cors'
      }).catch(function () {});
    });
    return false;
  }

  // core.js auReportError calls this. Separate endpoint from AU_LOG.
  // Fires regardless of telemetry opt-out (errors are diagnostic, not usage).
  // Payload is diagnostic-only — no URLs, search terms, ASINs, or user content.
  // Respond synchronously before async work (see AU_LOG comment).
  if (msg.type === 'AU_ERROR') {
    sendResponse({ ok: true });
    fetch(AU_ERROR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg.payload),
      mode: 'no-cors'
    }).catch(function () {});
    return false;
  }

  // search.js calls this when it finishes scraping a results page.
  // Respond synchronously before the async storage write — the caller does
  // not consume the response, and keeping the port open across a storage
  // round-trip exposes us to worker idle-out (see AU_LOG comment).
  if (msg.type === 'AU_SAVE_SEARCH_CONTEXT') {
    sendResponse({ ok: true });
    chrome.storage.session.set({ [SESSION_KEY]: msg.payload });
    return false;
  }

  // product.js calls this on load to find out if we arrived from a search
  if (msg.type === 'AU_GET_SEARCH_CONTEXT') {
    chrome.storage.session.get(SESSION_KEY, function (result) {
      sendResponse({ payload: result[SESSION_KEY] || null });
    });
    return true;
  }

  // product.js calls this when the user clicks "Start a search" or navigates
  // away, so stale context doesn't bleed into unrelated product pages.
  // Respond synchronously (see AU_SAVE_SEARCH_CONTEXT comment).
  if (msg.type === 'AU_CLEAR_SEARCH_CONTEXT') {
    sendResponse({ ok: true });
    chrome.storage.session.remove(SESSION_KEY);
    return false;
  }

  // compare.html calls this when "Send to extension" is clicked.
  // Replaces the shortlist in chrome.storage.local with the checked items.
  if (msg.type === 'AU_SET_SHORTLIST') {
    var items = (msg.items || []).map(function(item) {
      return Object.assign({}, item, { capturedAt: new Date().toISOString() });
    });
    chrome.storage.local.set({ au_shortlist: items }, function() {
      sendResponse({ ok: true });
    });
    return true;
  }
});
