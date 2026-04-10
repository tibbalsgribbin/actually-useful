// Actually Useful — background.js
// Manages cross-page state: passes search context from search results to product pages.
// Uses chrome.storage.session so context clears when the browser closes.

const SESSION_KEY = 'au_search_context';

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

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
});
