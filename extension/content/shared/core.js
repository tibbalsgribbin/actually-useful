// Actually Useful — content/shared/core.js
// Loaded FIRST. Provides: shortlist storage, nudge state, and shared constants.
'use strict';

// ── Version ───────────────────────────────────────────────────────────────
const AU_VERSION = '0.6.1.54';

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

// ── Notes Storage ────────────────────────────────────────────────────────────
const AU_ITEM_NOTES_KEY = 'au_item_notes';

function auNotesGet(callback) {
  chrome.storage.local.get(AU_ITEM_NOTES_KEY, function (result) {
    callback(result[AU_ITEM_NOTES_KEY] || {});
  });
}

function auNotesSet(notes, callback) {
  chrome.storage.local.set({ [AU_ITEM_NOTES_KEY]: notes }, callback || function () {});
}

function auNotesClearAll(callback) {
  chrome.storage.local.remove(AU_ITEM_NOTES_KEY, callback || function () {});
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

// ── Error Reporting ──────────────────────────────────────────────────────
// Errors are reported regardless of telemetry opt-out (option 3 in design).
// Payloads contain only diagnostic context — no URLs, search terms, ASINs,
// or user content. The privacy rationale: errors are about whether the
// extension is broken, which is in the user's interest to know about,
// separate from "how is this used" telemetry.
//
// auReportError(context, error) — log an error and POST to error endpoint.
//   context: short string naming the call site (e.g. 'sendLog', 'panelInit').
//   error: an Error object, a string, or anything stringifiable.
//
// auSendMessage(msg, context) — sendMessage wrapper that auto-handles both
// synchronous throws and chrome.runtime.lastError. Replaces the
// try/catch + manual lastError-drain pattern at every call site.
function auReportError(context, error) {
  var message = (error && error.message) ? error.message : String(error);
  var browser = navigator.userAgent.indexOf('Edg/') > -1 ? 'edge' : 'chrome';
  try { console.warn('[AU error]', context, message); } catch (e) {}
  try {
    chrome.runtime.sendMessage({
      type: 'AU_ERROR',
      payload: {
        timestamp: new Date().toISOString(),
        version: AU_VERSION,
        browser: browser,
        context: context,
        message: message
      }
    }, function () {
      // Drain lastError. If reporting itself fails we can't report that —
      // would recurse. The console.warn above is the fallback.
      if (chrome.runtime.lastError) { /* intentional no-op */ }
    });
  } catch (e) { /* console.warn above is the fallback */ }
}

function auSendMessage(msg, context) {
  try {
    chrome.runtime.sendMessage(msg, function () {
      if (chrome.runtime.lastError) {
        auReportError(context, chrome.runtime.lastError.message);
      }
    });
  } catch (e) {
    auReportError(context, e);
  }
}

// ── Shared Stub: injectStyles ─────────────────────────────────────────────
// No longer needed here as styles are in manifest, but kept to prevent 
// 'undefined' errors if referenced in older code.
function injectStyles() {}