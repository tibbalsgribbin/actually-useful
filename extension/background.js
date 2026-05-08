// Actually Useful — background.js v0.6.1.17
// Manages cross-page state: passes search context from search results to product pages.
// Uses chrome.storage.session so context clears when the browser closes.

const SESSION_KEY = 'au_search_context';

// Logging endpoint — receives log payloads from content scripts and forwards them.
// Running fetch() here avoids Amazon's CSP blocking outbound requests from injected scripts.
const AU_LOG_URL = 'https://script.google.com/macros/s/AKfycby0y2gsDtOKxNLXXsOoSVVx_82QYb8wKESx847_ExIBNW6_XW72CfBR4-bQnCx9V1bn/exec';



// Open welcome page on fresh install only (not on update or reload)
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'https://actuallyuseful.net/welcome' });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {


  // search.js calls this to log usage data; fetch runs here to avoid Amazon CSP
  // Only fires if the user has telemetry enabled (default: on)
  if (msg.type === 'AU_LOG') {
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
    // no sendResponse needed — fire and forget
    return false;
  }

  // search.js calls this when it finishes scraping a results page
  if (msg.type === 'AU_SAVE_SEARCH_CONTEXT') {
    chrome.storage.session.set({ [SESSION_KEY]: msg.payload }, function () {
      sendResponse({ ok: true });
    });
    return true; // keep channel open for async response
  }

  // product.js calls this on load to find out if we arrived from a search
  if (msg.type === 'AU_GET_SEARCH_CONTEXT') {
    chrome.storage.session.get(SESSION_KEY, function (result) {
      sendResponse({ payload: result[SESSION_KEY] || null });
    });
    return true;
  }

  // product.js calls this when the user clicks "Start a search" or navigates
  // away, so stale context doesn't bleed into unrelated product pages
  if (msg.type === 'AU_CLEAR_SEARCH_CONTEXT') {
    chrome.storage.session.remove(SESSION_KEY, function () {
      sendResponse({ ok: true });
    });
    return true;
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

  // compare.html calls this when a note textarea is edited.
  // Updates the note on the matching shortlist item without replacing the whole list.
  if (msg.type === 'AU_UPDATE_NOTE') {
    var asin = msg.asin;
    var note = msg.note;
    chrome.storage.local.get('au_shortlist', function(result) {
      var list = result['au_shortlist'] || [];
      list.forEach(function(item) {
        if (item.asin === asin) item.note = note;
      });
      chrome.storage.local.set({ au_shortlist: list });
    });
    return false;
  }
});
