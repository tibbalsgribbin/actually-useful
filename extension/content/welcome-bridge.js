// Actually Useful — welcome-bridge.js
// Content script injected on actuallyuseful.net/welcome*
// Bridges the personalize wizard (website) to chrome.storage.local (extension).
//
// The welcome page cannot write to chrome.storage.local directly — it's a public
// website, not an extension page. This content script runs in the extension context
// on that page and listens for CustomEvents dispatched by the wizard JS.
//
// Event contract:
//   event name:   'au-wizard-save'
//   event detail: { key: string, value: any }
//
// The wizard dispatches one event per setting change (on change, not on submit).

window.addEventListener('au-wizard-save', function(e) {
  if (!e.detail || typeof e.detail.key !== 'string') return;
  var obj = {};
  obj[e.detail.key] = e.detail.value;
  try {
    chrome.storage.local.set(obj);
  } catch(err) {
    // Extension context may not be available in rare edge cases (e.g. extension
    // disabled mid-session). Silent failure is correct — wizard still navigates,
    // user just loses that setting.
  }
});
