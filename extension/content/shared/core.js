// Actually Useful — content/shared/core.js
// Loaded before search.js and product.js on every page.
// Provides: shortlist storage, nudge state, affiliate tag, shared constants.

// ── Version ───────────────────────────────────────────────────────────────
const AU_VERSION = '0.6.1.4';

// ── Storage keys ──────────────────────────────────────────────────────────
const AU_SHORTLIST_KEY      = 'au_shortlist';       // chrome.storage.local — persists across sessions
const AU_NUDGE_DISMISSED    = 'au_nudge_dismissed'; // chrome.storage.local
const AU_NUDGE_LAST_SHOWN   = 'au_nudge_last_shown';
const AU_NUDGE_DELAY_DAYS   = 30;

// ── Shortlist ─────────────────────────────────────────────────────────────
// Each item: { asin, title, href, price, ppu, unit, searchTerm, note, capturedAt }

function auShortlistGet(callback) {
  chrome.storage.local.get(AU_SHORTLIST_KEY, function (result) {
    callback(result[AU_SHORTLIST_KEY] || []);
  });
}

function auShortlistSet(items, callback) {
  chrome.storage.local.set({ [AU_SHORTLIST_KEY]: items }, callback || function () {});
}

function auShortlistAdd(item, callback) {
  auShortlistGet(function (items) {
    // Deduplicate by ASIN — update if already present
    var idx = items.findIndex(function (i) { return i.asin === item.asin; });
    if (idx !== -1) {
      items[idx] = Object.assign({}, items[idx], item, { capturedAt: new Date().toISOString() });
    } else {
      items.unshift(Object.assign({}, item, { capturedAt: new Date().toISOString() }));
    }
    auShortlistSet(items, callback);
  });
}

function auShortlistRemove(asin, callback) {
  auShortlistGet(function (items) {
    auShortlistSet(items.filter(function (i) { return i.asin !== asin; }), callback);
  });
}

function auShortlistHas(asin, callback) {
  auShortlistGet(function (items) {
    callback(items.some(function (i) { return i.asin === asin; }));
  });
}

// ── Nudge state ───────────────────────────────────────────────────────────
// Migrated from localStorage to chrome.storage.local for extension.

function auNudgeShouldShow(callback) {
  chrome.storage.local.get([AU_NUDGE_DISMISSED, AU_NUDGE_LAST_SHOWN], function (result) {
    if (result[AU_NUDGE_DISMISSED]) { callback(false); return; }
    var last = result[AU_NUDGE_LAST_SHOWN];
    if (last && (Date.now() - last) / (1000 * 60 * 60 * 24) < AU_NUDGE_DELAY_DAYS) {
      callback(false); return;
    }
    callback(true);
  });
}

function auNudgeRecordShown() {
  chrome.storage.local.set({ [AU_NUDGE_LAST_SHOWN]: Date.now() });
}

function auNudgeDismissPermanently() {
  chrome.storage.local.set({ [AU_NUDGE_DISMISSED]: true });
}

// ── Logging ───────────────────────────────────────────────────────────────
const AU_LOG_URL = 'https://script.google.com/macros/s/AKfycby0y2gsDtOKxNLXXsOoSVVx_82QYb8wKESx847_ExIBNW6_XW72CfBR4-bQnCx9V1bn/exec';

function auSendLog(data) {
  try {
    var payload = Object.assign({
      timestamp:     new Date().toISOString(),
      scriptVersion: AU_VERSION,
      searchUrl:     window.location.href,
      searchTerm:    (new URLSearchParams(window.location.search).get('k') || '').trim(),
    }, data);
    fetch(AU_LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'no-cors'
    }).catch(function () {});
  } catch (e) {}
}

// ── Shared utility: inject styles ─────────────────────────────────────────
// styles.css is injected automatically by the manifest (content_scripts.css).
// This function is a no-op in the extension — kept as a safety stub so any
// search.js code that calls injectStyles() doesn't break during porting.
function injectStyles() {}
