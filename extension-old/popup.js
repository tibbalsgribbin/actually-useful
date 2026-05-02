// Actually Useful — popup.js
// Handles the extension popup: telemetry toggle, version display.

const AU_TELEMETRY_KEY = 'au_telemetry_enabled';

var toggle  = document.getElementById('au-telemetry-toggle');
var status  = document.getElementById('au-status');
var versionEl = document.getElementById('au-version');

// Display version from manifest
var manifestData = chrome.runtime.getManifest();
if (versionEl && manifestData && manifestData.version) {
  versionEl.textContent = 'v' + manifestData.version;
}

// Load current telemetry preference (default: enabled)
chrome.storage.local.get(AU_TELEMETRY_KEY, function(result) {
  var enabled = result[AU_TELEMETRY_KEY];
  // Default to true if not yet set
  toggle.checked = (enabled === undefined) ? true : !!enabled;
});

// Save on change
toggle.addEventListener('change', function() {
  var enabled = toggle.checked;
  chrome.storage.local.set({ [AU_TELEMETRY_KEY]: enabled }, function() {
    status.textContent = enabled ? 'Saved — thank you!' : 'Saved — data sharing off.';
    setTimeout(function() { status.textContent = ''; }, 2500);
  });
});
