// Actually Useful — content/shared/core.js
// Loaded FIRST. Provides: shortlist storage, nudge state, and shared constants.
'use strict';

// ── Version ───────────────────────────────────────────────────────────────
const AU_VERSION = '0.6.1.45'; // Matches your latest Roadmap (1).md

// ── Storage keys ──────────────────────────────────────────────────────────
const AU_SHORTLIST_KEY      = 'au_shortlist';
const AU_NUDGE_DISMISSED    = 'au_nudge_dismissed';
const AU_NUDGE_LAST_SHOWN   = 'au_nudge_last_shown';
const AU_NUDGE_DELAY_DAYS   = 30;

// ── Shortlist Management ──────────────────────────────────────────────────
function auShortlistGet(callback) {
  chrome.storage.local.get(AU_SHORTLIST_KEY, function (result) {
    callback(result[AU_SHORTLIST_KEY] || []);
  });
}

function auShortlistSet(items, callback) {
  chrome.storage.local.set({ [AU_SHORTLIST_KEY]: items }, callback || function () {});
}

// ── Nudge State (Monetization/Tips) ────────────────────────────────────────
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

function auNudgeDismissPermanently() {
  chrome.storage.local.set({ [AU_NUDGE_DISMISSED]: true });
}

// ── Shared Stub: injectStyles ─────────────────────────────────────────────
// No longer needed here as styles are in manifest, but kept to prevent 
// 'undefined' errors if referenced in older code.
function injectStyles() {}