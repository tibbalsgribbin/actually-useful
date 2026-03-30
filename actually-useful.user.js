// ==UserScript==
// @name         Actually Useful v4.9
// @namespace    http://tampermonkey.net/
// @version      4.9
// @description  Shop on your terms instead of Amazon's.
// @author       Claude / Melissa (ko-fi.com/tibbalsgribbin)
// @match        https://www.amazon.com/s*
// @match        https://smile.amazon.com/s*
// @grant        none
// @run-at       document-idle
// @updateURL    https://github.com/tibbalsgribbin/actually-useful/raw/refs/heads/main/actually-useful.user.js
// @downloadURL  https://github.com/tibbalsgribbin/actually-useful/raw/refs/heads/main/actually-useful.user.js
// ==/UserScript==

(function () {
  'use strict';

  const PANEL_ID = 'ppu-sorter-panel';

  // ── Passive logging endpoint ──────────────────────────────────────────────
  const LOG_URL = 'https://script.google.com/macros/s/AKfycbwIgxS_WSeFFSq50Vaa2O1wRhMbmQagWNn-S9pwFT-MR0tgOnNr3wugOMXx9N0QJ-M/exec';

  // Send a log entry silently — never blocks or alerts the user
  function sendLog(data) {
    try {
      var payload = Object.assign({
        timestamp: new Date().toISOString(),
        searchUrl: window.location.href,
        searchTerm: (new URLSearchParams(window.location.search).get('k') || '').trim(),
      }, data);
      fetch(LOG_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'  // avoids CORS errors; response won't be readable but delivery works
      }).catch(function() {}); // swallow any network errors silently
    } catch(e) {}
  }

  const CONTAINER_UNITS = ['roll', 'rolls', 'box', 'boxes', 'pack', 'packs',
                           'package', 'packages', 'pouch', 'pouches', 'tube', 'tubes'];

  const ITEM_UNITS = ['count', 'ct', 'bag', 'bags', 'piece', 'pieces',
                      'pcs', 'pc', 'each', 'unit', 'units', 'pad', 'pads',
                      'sheet', 'sheets', 'wipe', 'wipes', 'tablet', 'tablets',
                      'oz', 'fl oz', 'fluid ounce', 'fluid ounces',
                      'lb', 'lbs', 'pound', 'pounds',
                      'g', 'gram', 'grams', 'kg', 'kilogram', 'kilograms',
                      'ml', 'milliliter', 'milliliters', 'l', 'liter', 'liters'];

  // ── Format price-per-unit ─────────────────────────────────────────────────
  // Always use dollar format to avoid confusing cent display (2.00¢ looks like $2.00)
  // Under $0.10: show 3 decimal places ($0.023), otherwise 2 ($0.29, $1.29)
  function formatPPU(ppu) {
    if (ppu < 0.10) return '$' + ppu.toFixed(3).replace(/0+$/, '').replace(/\.$/, '0');
    return '$' + ppu.toFixed(2);
  }

  // ── Normalize unit labels for consistent display ─────────────────────────
  function normalizeUnit(unit) {
    if (!unit) return unit;
    var u = unit.toLowerCase().trim();
    if (u === 'fluid ounce' || u === 'fluid ounces' || u === 'fl. oz' || u === 'fl. oz.') return 'fl oz';
    if (u === 'ounce' || u === 'ounces') return 'oz';
    if (u === 'count') return 'ct';
    if (u === 'pound' || u === 'pounds') return 'lb';
    if (u === 'gram' || u === 'grams') return 'g';
    if (u === 'kilogram' || u === 'kilograms') return 'kg';
    if (u === 'milliliter' || u === 'milliliters') return 'ml';
    if (u === 'liter' || u === 'liters') return 'l';
    if (u === 'piece' || u === 'pieces') return 'pc';
    if (u === 'tablet' || u === 'tablets') return 'tab';
    if (u === 'capsule' || u === 'capsules') return 'cap';
    return u;
  }

  // ── Parse delivery dates from a result card ───────────────────────────────
  function parseDeliveryDates(el) {
    var result = { freeDate: null, fastDate: null };
    var blocks = el.querySelectorAll('.udm-secondary-delivery-message, .a-color-base.a-text-normal');
    var deliveryDivs = el.querySelectorAll('[class*="delivery"]');
    var columns = el.querySelectorAll('.a-column.a-span12');
    var allDivs = Array.from(blocks).concat(Array.from(deliveryDivs)).concat(Array.from(columns));
    var seen = new Set();

    allDivs.forEach(function(div) {
      if (seen.has(div)) return;
      seen.add(div);
      var text = div.textContent || '';
      var boldEl = div.querySelector('.a-text-bold');
      var dateStr = boldEl ? boldEl.textContent.trim() : '';
      if (!dateStr) return;
      var lower = text.toLowerCase();
      var parsed = parseDateString(dateStr);
      if (!parsed) return;

      if (lower.includes('free') || lower.includes('free delivery')) {
        if (!result.freeDate) result.freeDate = parsed;
      } else if (lower.includes('fastest') || lower.includes('or fastest')) {
        if (!result.fastDate) result.fastDate = parsed;
      }
    });

    return result;
  }

  // ── Parse date string ─────────────────────────────────────────────────────
  function parseDateString(str) {
    if (!str) return null;
    var s = str.trim();
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (/today/i.test(s)) return today;
    if (/tomorrow/i.test(s)) {
      var t = new Date(today); t.setDate(t.getDate() + 1); return t;
    }
    var months = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
    var m = s.match(/([a-z]{3})\s+(\d+)/i);
    if (m) {
      var mon = months[m[1].toLowerCase()];
      if (mon === undefined) return null;
      var day = parseInt(m[2], 10);
      var year = now.getFullYear();
      var d = new Date(year, mon, day);
      if (d < today && (today - d) > 7 * 86400000) d.setFullYear(year + 1);
      return d;
    }
    return null;
  }

  // ── Format date for display ───────────────────────────────────────────────
  function formatDate(d) {
    if (!d) return '';
    var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return days[d.getDay()] + ' ' + mons[d.getMonth()] + ' ' + d.getDate();
  }

  // ── Detect grocery source ─────────────────────────────────────────────────
  function detectSource(el) {
    if (el.querySelector('img[alt="Whole Foods Market"]')) return 'whole-foods';
    if (el.querySelector('img[alt="Amazon Fresh"]'))      return 'fresh';
    return 'standard';
  }

  // ── CSS ───────────────────────────────────────────────────────────────────
  const CSS = `
    #${PANEL_ID} {
      position: fixed;
      top: 80px;
      right: 16px;
      width: 390px;
      min-width: 280px;
      max-width: 700px;
      max-height: calc(100vh - 100px);
      overflow: hidden;
      background: #fff;
      border: 1px solid #d5d9d9;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      z-index: 99999;
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: #0f1111;
      transition: max-height 0.2s;
      display: flex;
      flex-direction: column;
    }
    #${PANEL_ID}.collapsed {
      width: 220px !important;
      max-height: 41px;
    }
    #ppu-controls-wrap { flex-shrink: 0; }
    #ppu-scroll-area { flex: 1; overflow-y: auto; overflow-x: hidden; }
    #ppu-header {
      background: #232f3e;
      color: #fff;
      padding: 10px 14px;
      border-radius: 8px 8px 0 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      user-select: none;
    }

    #${PANEL_ID}.collapsed #ppu-header { border-radius: 8px; }
    #ppu-header h3 { margin: 0; font-size: 14px; font-weight: 700; }
    #ppu-header-btns { display: flex; gap: 6px; align-items: center; }
    #ppu-collapse, #ppu-close {
      background: none; border: none; color: #fff;
      font-size: 16px; cursor: pointer; line-height: 1; padding: 0 3px;
    }
    #ppu-coffee {
      font-size: 12px; text-decoration: none; color: #ffd700;
      padding: 2px 6px; border: 1px solid rgba(255,215,0,0.4);
      border-radius: 4px; opacity: 0.9; transition: opacity 0.15s;
      white-space: nowrap;
    }
    #ppu-coffee:hover { opacity: 1; }
    #ppu-controls {
      padding: 8px 14px;
      background: #f0f2f2;
      border-bottom: 1px solid #d5d9d9;
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      }
    #ppu-controls label { font-size: 12px; color: #565959; }
    #ppu-sort {
      font-size: 12px; padding: 3px 6px;
      border: 1px solid #aaa; border-radius: 4px;
      background: #fff; cursor: pointer;
    }
    #ppu-btn-hide, #ppu-btn-refresh, #ppu-btn-resort,
    #ppu-btn-show-checked, #ppu-btn-clear-checked {
      font-size: 11px; padding: 3px 8px;
      border: 1px solid #aaa; border-radius: 4px;
      background: #fff; cursor: pointer;
    }
    #ppu-btn-resort { border-color: #007185; color: #007185; display: none; }
    #ppu-btn-show-checked { border-color: #e47911; color: #e47911; display: none; }
    #ppu-btn-clear-checked { display: none; }
    #ppu-filter-row {
      padding: 6px 14px;
      background: #f7f7f7;
      border-bottom: 1px solid #e8e8e8;
      display: flex;
      gap: 6px;
      align-items: center;
      }
    #ppu-filter-row label { font-size: 12px; color: #565959; white-space: nowrap; }
    #ppu-keyword {
      flex: 1; min-width: 0;
      font-size: 12px; padding: 3px 6px;
      border: 1px solid #aaa; border-radius: 4px; background: #fff;
    }
    #ppu-keyword.active {
      border-color: #e47911; outline: none;
      box-shadow: 0 0 0 2px rgba(228,121,17,0.25);
    }
    #ppu-btn-clear-kw {
      font-size: 13px; padding: 1px 5px;
      border: 1px solid #aaa; border-radius: 4px;
      background: #fff; cursor: pointer; color: #555; display: none;
    }
    #ppu-unit-row {
      padding: 6px 14px;
      background: #f7f7f7;
      border-bottom: 1px solid #d5d9d9;
      display: flex;
      gap: 6px;
      align-items: center;
      }
    #ppu-unit-row label { font-size: 12px; color: #565959; white-space: nowrap; }
    #ppu-unit-override {
      flex: 1; min-width: 0;
      font-size: 12px; padding: 3px 6px;
      border: 1px solid #aaa; border-radius: 4px; background: #fff;
    }
    #ppu-unit-override.active {
      border-color: #007185; outline: none;
      box-shadow: 0 0 0 2px rgba(0,113,133,0.2);
    }
    #ppu-btn-clear-unit {
      font-size: 13px; padding: 1px 5px;
      border: 1px solid #aaa; border-radius: 4px;
      background: #fff; cursor: pointer; color: #555; display: none;
    }
    #ppu-source-row {
      padding: 6px 14px;
      background: #f7f7f7;
      border-bottom: 1px solid #d5d9d9;
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      }
    #ppu-source-row span.label { font-size: 12px; color: #565959; white-space: nowrap; }
    .ppu-source-toggle {
      font-size: 11px; padding: 2px 8px;
      border-radius: 10px; cursor: pointer;
      border: 1px solid currentColor;
      transition: all 0.15s;
      user-select: none;
      font-weight: 600;
    }
    .ppu-source-toggle.src-standard { color: #232f3e; background: #e8eaf0; }
    .ppu-source-toggle.src-fresh     { color: #005f7a; background: #e0f4fb; }
    .ppu-source-toggle.src-wf        { color: #006400; background: #e8f5e8; }
    .ppu-source-toggle.off {
      color: #aaa; background: #f5f5f5; border-color: #ddd;
      text-decoration: line-through; font-weight: normal;
    }
    #ppu-info {
      font-size: 11px; color: #888;
      padding: 5px 14px;
      border-bottom: 1px solid #f0f2f2;
    }
    #ppu-sort-note {
      font-size: 11px; color: #e47911; font-style: italic;
      padding: 3px 14px 4px;
      border-bottom: 1px solid #f0f2f2;
      display: none;
    }
    #ppu-list { padding: 4px 0; }
    .ppu-row {
      padding: 6px 10px 6px 8px;
      border-bottom: 1px solid #f5f5f5;
      transition: opacity 0.15s;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    .ppu-row:last-child { border-bottom: none; }
    .ppu-row.kw-mismatch { opacity: 0.28; }
    .ppu-row.src-hidden   { display: none; }
    .ppu-row.checked { background: #fffbf0; }
    .ppu-cb-wrap { padding-top: 2px; flex-shrink: 0; }
    .ppu-cb { cursor: pointer; width: 14px; height: 14px; }
    .ppu-row-content { flex: 1; min-width: 0; }
    .ppu-row a {
      font-size: 12px; color: #007185; text-decoration: none;
      display: block;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-bottom: 3px;
    }
    .ppu-row a:hover { text-decoration: underline; }
    .ppu-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .ppu-price { font-weight: 700; color: #B12704; font-size: 14px; }
    .ppu-count { font-size: 11px; color: #666; }
    .ppu-badge {
      font-size: 12px; font-weight: 600;
      padding: 2px 6px; border-radius: 4px;
      background: #e8f5e9; border: 1px solid #a5d6a7; color: #2e7d32;
    }
    .ppu-badge.best {
      background: #fff8e1; border-color: #ffc107; color: #e65100;
    }
    .ppu-delivery { font-size: 11px; color: #007600; margin-top: 2px; }
    .ppu-delivery.fast { color: #007185; }
    .ppu-delivery.wf-fee { color: #B12704; }
    .ppu-nodata { font-size: 11px; color: #bbb; font-style: italic; }
    .ppu-src-tag {
      font-size: 10px; padding: 1px 4px; border-radius: 3px;
      font-weight: 600; margin-bottom: 2px; display: inline-block;
    }
    .ppu-src-wf { background: #e8f5e8; color: #006400; border: 1px solid #a5d6a7; }
    .ppu-src-fr { background: #e0f4fb; color: #005f7a; border: 1px solid #81d4f7; }
    .ppu-divider {
      padding: 5px 14px;
      background: #e8f0fe;
      border-top: 1px solid #c5d0e8;
      border-bottom: 1px solid #c5d0e8;
      font-size: 11px; font-weight: 600; color: #3c4a6e;
    }
    #ppu-load-more-row {
      padding: 10px 14px; text-align: center;
      border-top: 1px solid #f0f2f2;
    }
    #ppu-btn-load-more {
      font-size: 12px; padding: 5px 14px;
      border: 1px solid #007185; border-radius: 4px;
      background: #fff; cursor: pointer; color: #007185; width: 100%;
    }
    #ppu-btn-load-more:hover { background: #f0f9fa; }
    #ppu-btn-load-more:disabled { opacity: 0.5; cursor: default; }
    #ppu-btn-resort-bottom {
      font-size: 11px; padding: 3px 8px; margin-top: 6px;
      border: 1px solid #007185; border-radius: 4px;
      background: #fff; cursor: pointer; color: #007185;
      width: 100%; display: none;
    }
    #ppu-drag-handle {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 6px;
      cursor: ew-resize;
      background: linear-gradient(to right, rgba(0,0,0,0.06), transparent);
      border-radius: 8px 0 0 8px;
      z-index: 100;
    }
    #ppu-drag-handle:hover { background: linear-gradient(to right, rgba(0,113,133,0.2), transparent); }
    #${PANEL_ID} { position: fixed; }
    #ppu-delivery-note {
      font-size: 10px; color: #aaa; font-style: italic;
      padding: 3px 14px 4px; border-bottom: 1px solid #f0f2f2;
    }
  `;

  function injectStyles() {
    if (document.getElementById('ppu-styles')) return;
    var s = document.createElement('style');
    s.id = 'ppu-styles'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ── Clean product link ────────────────────────────────────────────────────
  function cleanHref(rawHref, card) {
    var asin = card && card.getAttribute('data-asin');
    if (asin) return 'https://www.amazon.com/dp/' + asin;
    if (rawHref) {
      var m = rawHref.match(/\/dp\/([A-Z0-9]{10})/);
      if (m) return 'https://www.amazon.com/dp/' + m[1];
    }
    return rawHref || '#';
  }

  // ── Parse Amazon's unit price string ─────────────────────────────────────
  // Handles two DOM structures:
  // 1. Simple: ($0.05/count) all in one text node
  // 2. Split: "(" + <a-price span> + "/fluid ounce)" across multiple nodes
  //    (used for grocery/Fresh items) — a-offscreen span causes price to
  //    appear twice in innerText, so we deduplicate before matching
  function parseAmazonUnitPrice(el) {
    // Strategy 1: try the split DOM structure first
    var containers = el.querySelectorAll('.a-size-base.a-color-base, .a-size-base-plus.a-color-base');
    for (var i = 0; i < containers.length; i++) {
      var cont = containers[i];
      var fullText = cont.textContent || '';
      var trimmed = fullText.trim();
      if (!trimmed.startsWith('(') || !trimmed.includes('/') || !trimmed.endsWith(')')) continue;
      var priceSpan = cont.querySelector('.a-price.a-text-price .a-offscreen');
      if (!priceSpan) continue;
      var priceStr = priceSpan.textContent.replace(/[$,]/g, '').trim();
      var price = parseFloat(priceStr);
      if (isNaN(price) || price <= 0) continue;
      var unitMatch = trimmed.match(/\/\s*([^)]+)\)\s*$/);
      if (unitMatch) {
        var unit = normalizeUnit(unitMatch[1].trim());
        return { ppu: price, unit: unit };
      }
    }

    // Strategy 2: fallback — look for the classic ($0.05/count) pattern in innerText
    var text = (el.innerText || '').replace(/\$([\d.]+)\$\1/g, '$$$1');
    var dollarPat = /\(\$\s*([\d.]+)\s*\/\s*([^)\n,]+)\)/i;
    var centPat   = /\(¢\s*([\d.]+)\s*\/\s*([^)\n,]+)\)/i;
    var m = text.match(dollarPat);
    if (m) return { ppu: parseFloat(m[1]), unit: normalizeUnit(m[2].trim()) };
    m = text.match(centPat);
    if (m) return { ppu: parseFloat(m[1]) / 100, unit: normalizeUnit(m[2].trim()) };
    return null;
  }

  // ── Extract count from title ──────────────────────────────────────────────
  function extractCount(text) {
    var pats = [
      /(\d[\d,]*)\s*-?\s*count/i, /(\d[\d,]*)\s*-?\s*bags?/i,
      /(\d[\d,]*)\s*-?\s*pcs\.?/i, /(\d[\d,]*)\s*-?\s*pieces?/i,
      /(\d[\d,]*)\s*-?\s*pack/i, /(\d[\d,]*)\s*-?\s*rolls?/i,
      /pack\s+of\s+(\d[\d,]*)/i, /box\s+of\s+(\d[\d,]*)/i,
    ];
    for (var i=0; i<pats.length; i++) {
      var m = text.match(pats[i]);
      if (m) { var n = parseInt(m[1].replace(/,/g,''),10); if (n>1&&n<10000) return n; }
    }
    return null;
  }

  // ── Guess what the COUNT in the title refers to ─────────────────────────
  function guessCountUnit(text) {
    if (/\d[\d,]*\s*-?\s*rolls?/i.test(text)) return 'roll';
    if (/\d[\d,]*\s*-?\s*bags?/i.test(text)) return 'bag';
    if (/\d[\d,]*\s*-?\s*sheets?/i.test(text)) return 'sheet';
    if (/\d[\d,]*\s*-?\s*wipes?/i.test(text)) return 'wipe';
    if (/\d[\d,]*\s*-?\s*pads?/i.test(text)) return 'pad';
    if (/\d[\d,]*\s*-?\s*tablets?/i.test(text)) return 'tablet';
    if (/\d[\d,]*\s*-?\s*pills?/i.test(text)) return 'pill';
    if (/\d[\d,]*\s*-?\s*capsules?/i.test(text)) return 'capsule';
    if (/\d[\d,]*\s*-?\s*pcs\.?/i.test(text)) return 'pc';
    if (/\d[\d,]*\s*-?\s*pieces?/i.test(text)) return 'piece';
    if (/\d[\d,]*\s*-?\s*pack/i.test(text)) return 'pack';
    if (/pack\s+of\s+\d/i.test(text)) return 'pack';
    if (/\d[\d,]*\s*-?\s*count/i.test(text)) return 'ct';
    if (/box\s+of\s+\d/i.test(text)) return 'box';
    return null;
  }

  // ── Guess product-level unit from title ──────────────────────────────────
  function guessUnitFromTitle(text) {
    var lower = text.toLowerCase();
    if (/\bbags?\b/.test(lower)) return 'bag';
    if (/\bwipes?\b/.test(lower)) return 'wipe';
    if (/\bsheets?\b/.test(lower)) return 'sheet';
    if (/\bpads?\b/.test(lower)) return 'pad';
    if (/\btablets?\b/.test(lower)) return 'tablet';
    if (/\bpills?\b/.test(lower)) return 'pill';
    if (/\bcapsules?\b/.test(lower)) return 'capsule';
    if (/\bpcs\b|pieces?\b/.test(lower)) return 'pc';
    return null;
  }

  // ── Parse price ───────────────────────────────────────────────────────────
  function parsePrice(el) {
    var whole = el.querySelector('.a-price-whole');
    var frac  = el.querySelector('.a-price-fraction');
    if (whole) {
      var w = whole.textContent.replace(/[^0-9]/g,'');
      var f = frac ? frac.textContent.replace(/[^0-9]/g,'').slice(0,2).padEnd(2,'0') : '00';
      var val = parseFloat(w+'.'+f);
      if (!isNaN(val) && val>0) return val;
    }
    var off = el.querySelector('.a-price .a-offscreen');
    if (off) { var m2 = off.textContent.replace(/,/g,'').match(/([\d]+\.?\d*)/); if (m2) return parseFloat(m2[1]); }
    return null;
  }

  // ── Scrape one card ───────────────────────────────────────────────────────
  function scrapeCard(el, pageNum) {
    var titleEl  = el.querySelector('h2 a span, h2 span');
    var title    = titleEl ? titleEl.textContent.trim() : '(no title)';
    var linkEl   = el.querySelector('h2 a');
    var href     = cleanHref(linkEl ? linkEl.href : null, el);
    var asin     = el.getAttribute('data-asin') || href;
    var price    = parsePrice(el);
    var ap       = parseAmazonUnitPrice(el);
    var count    = extractCount(title);
    var page     = pageNum || 1;
    var grocery  = detectSource(el);
    var delivery = parseDeliveryDates(el);
    var wfFreeFlag = (grocery === 'whole-foods') && !!delivery.freeDate;

    var base = { title, href, asin, price, count, page, grocery, wfFreeFlag,
                 freeDate: delivery.freeDate, fastDate: delivery.fastDate };

    if (ap && ITEM_UNITS.includes(ap.unit))
      return Object.assign(base, { ppu: ap.ppu, unit: ap.unit, source: 'amazon' });
    if (ap && CONTAINER_UNITS.includes(ap.unit) && count && price) {
      var unit = guessCountUnit(title) || guessUnitFromTitle(title);
      return Object.assign(base, { ppu: price/count, unit: unit, source: 'calc',
               note: 'Amazon said '+formatPPU(ap.ppu)+'/'+ap.unit });
    }
    if (ap && CONTAINER_UNITS.includes(ap.unit))
      return Object.assign(base, { ppu: ap.ppu, unit: ap.unit, source: 'amazon-container',
               note: 'Per '+ap.unit+', not per item' });
    if (ap)
      return Object.assign(base, { ppu: ap.ppu, unit: ap.unit, source: 'amazon' });
    if (count && price) {
      var unit2 = guessCountUnit(title) || guessUnitFromTitle(title);
      return Object.assign(base, { ppu: price/count, unit: unit2, source: 'calc' });
    }
    return Object.assign(base, { ppu: null, unit: null, source: 'none' });
  }

  // ── Keyword filter ────────────────────────────────────────────────────────
  function titleMatchesKeywords(title, kwRaw) {
    var lower = title.toLowerCase();
    var terms = kwRaw.trim().toLowerCase().split(/\s+/).filter(Boolean);
    for (var i=0; i<terms.length; i++) {
      var term = terms[i];
      if (term.startsWith('-')) { if (term.length>1 && lower.includes(term.slice(1))) return false; }
      else { if (!lower.includes(term)) return false; }
    }
    return true;
  }

  // ── Next page URL ─────────────────────────────────────────────────────────
  function getNextPageUrl() {
    var nextBtn = document.querySelector('.s-pagination-next:not(.s-pagination-disabled)');
    if (!nextBtn) return null;
    var href = nextBtn.getAttribute('href');
    if (!href) return null;
    return href.startsWith('http') ? href : 'https://www.amazon.com' + href;
  }

  // ── Fetch page ────────────────────────────────────────────────────────────
  function fetchPage(url, pageNum) {
    return fetch(url, { credentials: 'include' })
      .then(function(res) { return res.text(); })
      .then(function(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var cards = doc.querySelectorAll('[data-component-type="s-search-result"]');
        var seen = {};
        var rows = Array.from(cards).reduce(function(acc, c) {
          var row = scrapeCard(c, pageNum);
          if (row.asin && seen[row.asin]) return acc;
          if (row.asin) seen[row.asin] = true;
          if (allData.some(function(r) { return r.asin && r.asin === row.asin; })) return acc;
          acc.push(row);
          return acc;
        }, []);
        var nextA = doc.querySelector('.s-pagination-next:not(.s-pagination-disabled)');
        var nextUrl = nextA ? ('https://www.amazon.com' + nextA.getAttribute('href')) : null;
        return { rows: rows, nextUrl: nextUrl };
      });
  }

  // ── State ─────────────────────────────────────────────────────────────────
  var hideNoData      = false;
  var isCollapsed     = false;
  var keyword         = '';
  var unitOverride    = '';
  var sortVal         = 'ppu-asc';
  var checkedAsins    = {};
  var showCheckedOnly = false;
  var allData         = [];
  var loadedPages     = 1;
  var nextPageUrl     = null;
  var needsResort     = false;
  var srcFilter       = { 'standard': true, 'fresh': true, 'whole-foods': true };
  var logTimer        = null;

  // ── Schedule a log send (debounced — waits 5s after last change) ──────────
  function scheduleLog() {
    if (logTimer) clearTimeout(logTimer);
    logTimer = setTimeout(function() { doLog(); }, 5000);
  }

  // ── Collect and send log data ─────────────────────────────────────────────
  function doLog() {
    try {
      var withUnit = allData.filter(function(r) { return r.ppu != null; });
      var withoutUnit = allData.filter(function(r) { return r.ppu == null; });

      // Collect distinct units found
      var unitCounts = {};
      withUnit.forEach(function(r) {
        if (r.unit) unitCounts[r.unit] = (unitCounts[r.unit] || 0) + 1;
      });
      var unitsFound = Object.keys(unitCounts).sort(function(a,b) {
        return unitCounts[b] - unitCounts[a];
      }).map(function(u) {
        return u + '(' + unitCounts[u] + ')';
      }).join(', ');

      // Collect grocery sources present
      var sources = [];
      if (allData.some(function(r) { return r.grocery === 'standard'; })) sources.push('standard');
      if (allData.some(function(r) { return r.grocery === 'fresh'; })) sources.push('fresh');
      if (allData.some(function(r) { return r.grocery === 'whole-foods'; })) sources.push('whole-foods');

      sendLog({
        totalResults:   allData.length,
        withUnitData:   withUnit.length,
        withoutUnitData: withoutUnit.length,
        unitsFound:     unitsFound,
        sortMethod:     sortVal,
        keywordFilter:  keyword.trim() || '',
        pagesLoaded:    loadedPages,
        grocerySources: sources.join(', ')
      });
    } catch(e) {}
  }

  // ── Build panel ───────────────────────────────────────────────────────────
  function buildPanel() {
    injectStyles();
    var cards = document.querySelectorAll('[data-component-type="s-search-result"]');
    if (!cards.length) { console.log('[PPU] No result cards found.'); return; }

    var seenAsins = {};
    allData = Array.from(cards).reduce(function(acc, c) {
      var row = scrapeCard(c, 1);
      if (row.asin && seenAsins[row.asin]) return acc;
      if (row.asin) seenAsins[row.asin] = true;
      acc.push(row);
      return acc;
    }, []);
    loadedPages = 1;
    nextPageUrl = getNextPageUrl();
    needsResort = false;

    var hasFresh   = allData.some(function(r) { return r.grocery === 'fresh'; });
    var hasWF      = allData.some(function(r) { return r.grocery === 'whole-foods'; });
    var hasGrocery = hasFresh || hasWF;
    var hasDelivery = allData.some(function(r) { return r.freeDate || r.fastDate; });

    var unitDataCount = allData.filter(function(r) { return r.ppu != null; }).length;
    var unitDataSparse = unitDataCount < Math.ceil(allData.length * 0.1);

    var existing = document.getElementById(PANEL_ID);
    if (existing) existing.remove();

    var panel = document.createElement('div');
    panel.id = PANEL_ID;
    if (isCollapsed) panel.classList.add('collapsed');

    panel.style.position = 'fixed';
    panel.innerHTML =
      '<div id="ppu-drag-handle"></div>' +
      '<div id="ppu-controls-wrap">' +
      '<div id="ppu-header">' +
        '<h3>\uD83D\uDCB0 Actually Useful</h3>' +
        '<div id="ppu-header-btns">' +
          '<a id="ppu-coffee" href="https://ko-fi.com/tibbalsgribbin" target="_blank">\u2615 buy me a coffee</a>' +
          '<button id="ppu-collapse" title="Collapse/expand">\u2195</button>' +
          '<button id="ppu-close" title="Close">\u00d7</button>' +
        '</div>' +
      '</div>' +
      '<div id="ppu-controls">' +
        '<label for="ppu-sort">Sort:</label>' +
        '<select id="ppu-sort">' +
          '<option value="ppu-asc">Best value \u2191</option>' +
          '<option value="ppu-desc">Worst value \u2193</option>' +
          '<option value="price-asc">Price low\u2192high</option>' +
          '<option value="price-desc">Price high\u2192low</option>' +
          '<option value="delivery-free">Soonest FREE delivery</option>' +
          '<option value="delivery-any">Soonest ANY delivery</option>' +
        '</select>' +
        '<button id="ppu-btn-hide">Hide no-data</button>' +
        '<button id="ppu-btn-refresh">\u21ba Refresh</button>' +
        '<button id="ppu-btn-resort">Re-sort all \u21c5</button>' +
        '<button id="ppu-btn-show-checked">Show selected (0)</button>' +
        '<button id="ppu-btn-clear-checked">Clear selection</button>' +
      '</div>' +
      '<div id="ppu-filter-row">' +
        '<label for="ppu-keyword">Must include:</label>' +
        '<input id="ppu-keyword" type="text" placeholder="e.g. handles" value="' + keyword.replace(/"/g,'&quot;') + '">' +
        '<button id="ppu-btn-clear-kw" title="Clear">\u00d7</button>' +
      '</div>' +
      '<div id="ppu-unit-row">' +
        '<label for="ppu-unit-override">Show per:</label>' +
        '<input id="ppu-unit-override" type="text" placeholder="auto (e.g. oz, lb)" value="' + unitOverride.replace(/"/g,'&quot;') + '">' +
        '<button id="ppu-btn-clear-unit" title="Clear">\u00d7</button>' +
      '</div>' +
      (hasGrocery ?
        '<div id="ppu-source-row">' +
          '<span class="label">Sources:</span>' +
          '<span class="ppu-source-toggle src-standard' + (!srcFilter['standard'] ? ' off' : '') + '" data-src="standard">Amazon</span>' +
          (hasFresh ? '<span class="ppu-source-toggle src-fresh' + (!srcFilter['fresh'] ? ' off' : '') + '" data-src="fresh">Fresh</span>' : '') +
          (hasWF    ? '<span class="ppu-source-toggle src-wf' + (!srcFilter['whole-foods'] ? ' off' : '') + '" data-src="whole-foods">Whole Foods</span>' : '') +
        '</div>' : '') +
      (hasDelivery ? '<div id="ppu-delivery-note">\u26a0\ufe0f Delivery dates are estimates · Whole Foods "FREE" delivery requires a separate fee</div>' : '') +
      '<div id="ppu-sort-note"></div>' +
      '</div>' +
      '<div id="ppu-scroll-area">' +
      '<div id="ppu-info"></div>' +
      '<div id="ppu-list"></div>' +
      '<div id="ppu-load-more-row" style="' + (nextPageUrl ? '' : 'display:none') + '">' +
        '<button id="ppu-btn-load-more">\u2193 Load page 2 results</button>' +
        '<button id="ppu-btn-resort-bottom">Re-sort all \u21c5</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(panel);

    // ── Left-edge drag to resize ──────────────────────────────────────────
    var dragHandle = document.getElementById('ppu-drag-handle');
    if (dragHandle) {
      var isDragging = false;
      var startX, startWidth;
      dragHandle.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        startWidth = panel.offsetWidth;
        document.body.style.userSelect = 'none';
        e.preventDefault();
      });
      document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        var delta = startX - e.clientX;
        var newWidth = Math.min(700, Math.max(280, startWidth + delta));
        panel.style.width = newWidth + 'px';
      });
      document.addEventListener('mouseup', function() {
        if (isDragging) { isDragging = false; document.body.style.userSelect = ''; }
      });
    }

    // Restore sort selection
    var sortEl = document.getElementById('ppu-sort');
    sortEl.value = sortVal;

    var kwInput      = document.getElementById('ppu-keyword');
    var clearKw      = document.getElementById('ppu-btn-clear-kw');
    var unitInput    = document.getElementById('ppu-unit-override');
    var clearUnit    = document.getElementById('ppu-btn-clear-unit');
    var resortBtn    = document.getElementById('ppu-btn-resort');
    var resortBtnBot = document.getElementById('ppu-btn-resort-bottom');
    var showChkBtn   = document.getElementById('ppu-btn-show-checked');
    var clearChkBtn  = document.getElementById('ppu-btn-clear-checked');
    var sortNote     = document.getElementById('ppu-sort-note');

    if (keyword)      { kwInput.classList.add('active');   clearKw.style.display   = 'block'; }
    if (unitOverride) { unitInput.classList.add('active'); clearUnit.style.display = 'block'; }

    // ── Render ──────────────────────────────────────────────────────────────
    function render() {
      sortVal = document.getElementById('ppu-sort').value;
      var kw        = kwInput.value;
      var unitLabel = unitInput.value.trim() || null;
      var checkedCount = Object.keys(checkedAsins).length;

      showChkBtn.style.display  = checkedCount > 0 ? 'block' : 'none';
      clearChkBtn.style.display = checkedCount > 0 ? 'block' : 'none';
      showChkBtn.textContent    = showCheckedOnly
        ? 'Show all (' + checkedCount + ' selected)'
        : 'Show selected (' + checkedCount + ')';
      resortBtn.style.display    = (needsResort && !showCheckedOnly) ? 'block' : 'none';
      resortBtnBot.style.display = (needsResort && !showCheckedOnly) ? 'block' : 'none';

      var effectiveSortVal = sortVal;
      var unitDataAvailable = allData.filter(function(r) { return r.ppu != null; }).length;
      var isSparseForSort = (sortVal === 'ppu-asc' || sortVal === 'ppu-desc') &&
                            unitDataAvailable < Math.ceil(allData.length * 0.1);
      if (isSparseForSort) {
        effectiveSortVal = sortVal === 'ppu-asc' ? 'price-asc' : 'price-desc';
        sortNote.style.display = 'block';
        sortNote.textContent = 'Too few unit prices to sort by value \u2014 showing by price instead';
      } else {
        sortNote.style.display = 'none';
      }

      var displayData = showCheckedOnly
        ? allData.filter(function(r) { return checkedAsins[r.asin]; })
        : allData.slice();

      var FAR_FUTURE = new Date(9999, 0, 1);

      function sortFn(a, b) {
        if (effectiveSortVal === 'ppu-asc') {
          if (a.ppu==null && b.ppu==null) return 0;
          if (a.ppu==null) return 1; if (b.ppu==null) return -1;
          return a.ppu - b.ppu;
        } else if (effectiveSortVal === 'ppu-desc') {
          if (a.ppu==null && b.ppu==null) return 0;
          if (a.ppu==null) return 1; if (b.ppu==null) return -1;
          return b.ppu - a.ppu;
        } else if (effectiveSortVal === 'price-asc') {
          return (a.price==null?Infinity:a.price) - (b.price==null?Infinity:b.price);
        } else if (effectiveSortVal === 'price-desc') {
          return (b.price==null?-Infinity:b.price) - (a.price==null?-Infinity:a.price);
        } else if (effectiveSortVal === 'delivery-free') {
          var aVal = a.freeDate ? 0 : (a.fastDate ? 1 : 2);
          var bVal = b.freeDate ? 0 : (b.fastDate ? 1 : 2);
          if (aVal !== bVal) return aVal - bVal;
          var da = a.freeDate || a.fastDate || FAR_FUTURE;
          var db = b.freeDate || b.fastDate || FAR_FUTURE;
          return da - db;
        } else if (effectiveSortVal === 'delivery-any') {
          var da2 = a.freeDate && a.fastDate ? new Date(Math.min(a.freeDate, a.fastDate))
                  : a.freeDate || a.fastDate || FAR_FUTURE;
          var db2 = b.freeDate && b.fastDate ? new Date(Math.min(b.freeDate, b.fastDate))
                  : b.freeDate || b.fastDate || FAR_FUTURE;
          return da2 - db2;
        }
        return 0;
      }

      if (!needsResort || showCheckedOnly) {
        displayData.sort(sortFn);
      } else {
        var pages = {};
        displayData.forEach(function(r) { if (!pages[r.page]) pages[r.page]=[]; pages[r.page].push(r); });
        var pageNums = Object.keys(pages).map(Number).sort(function(a,b){return a-b;});
        displayData = [];
        pageNums.forEach(function(pg) { pages[pg].sort(sortFn); displayData = displayData.concat(pages[pg]); });
      }

      if (hideNoData) displayData = displayData.filter(function(r) { return r.ppu!=null; });

      var hasKw = kw.trim().length > 0;
      displayData = displayData.map(function(r) {
        return Object.assign({}, r, { kwMatch: !hasKw || titleMatchesKeywords(r.title, kw) });
      });
      if (hasKw && !showCheckedOnly) {
        var matched    = displayData.filter(function(r) { return r.kwMatch; });
        var mismatched = displayData.filter(function(r) { return !r.kwMatch; });
        displayData = matched.concat(mismatched);
      }

      // Info bar
      var withData   = allData.filter(function(r) { return r.ppu!=null; }).length;
      var warnings   = allData.filter(function(r) { return r.source==='amazon-container'; }).length;
      var hiddenSrc  = allData.filter(function(r) { return !srcFilter[r.grocery]; }).length;
      var matchCount = hasKw ? displayData.filter(function(r) { return r.kwMatch; }).length : null;
      var infoText   = withData+'/'+allData.length+' have unit data';
      if (loadedPages > 1) infoText += ' \u00b7 '+loadedPages+' pages';
      if (warnings > 0)    infoText += ' \u00b7 \u26a0\ufe0f '+warnings+' per-container';
      if (hasKw)           infoText += ' \u00b7 \uD83D\uDD0D '+matchCount+' match filter';
      if (hiddenSrc > 0)   infoText += ' \u00b7 '+hiddenSrc+' source-hidden';
      if (unitLabel)       infoText += ' \u00b7 per: '+unitLabel;
      if (showCheckedOnly) infoText += ' \u00b7 '+displayData.length+' selected';
      document.getElementById('ppu-info').textContent = infoText;

      // Best PPU
      var ppuVals = displayData
        .filter(function(r) { return r.ppu!=null && r.source!=='amazon-container' && r.kwMatch && srcFilter[r.grocery]; })
        .map(function(r) { return r.ppu; });
      var bestPPU = ppuVals.length ? Math.min.apply(null, ppuVals) : null;

      var html = '';
      var currentPage = 0;

      displayData.forEach(function(r) {
        if (needsResort && !showCheckedOnly && r.page !== currentPage) {
          if (r.page > 1) html += '<div class="ppu-divider">\u2500\u2500 Page '+r.page+' results \u2500\u2500</div>';
          currentPage = r.page;
        }

        var srcHidden   = !srcFilter[r.grocery];
        var priceStr    = r.price!=null ? '$'+r.price.toFixed(2) : '\u2014';
        var countStr    = r.count ? r.count+' ct' : '';
        var displayUnit = unitLabel || r.unit;
        var badge = '', noteStr = '', deliveryStr = '', srcTag = '';
        var isChecked = !!checkedAsins[r.asin];

        if (r.grocery === 'whole-foods')
          srcTag = '<span class="ppu-src-tag ppu-src-wf">Whole Foods</span><br>';
        else if (r.grocery === 'fresh')
          srcTag = '<span class="ppu-src-tag ppu-src-fr">Fresh</span><br>';

        if (r.ppu!=null) {
          var isBest = bestPPU!=null && r.kwMatch && r.source!=='amazon-container' &&
            srcFilter[r.grocery] && Math.abs(r.ppu-bestPPU)<0.00001;
          var isContainer = r.source==='amazon-container';
          var ppuStr = formatPPU(r.ppu);
          var warn = isContainer ? ' <span style="font-size:10px;color:#aaa;">\u26a0\ufe0f per-container</span>' : '';
          var unitDisplay = displayUnit ? '/'+displayUnit : '';
          badge = '<span class="ppu-badge'+(isBest?' best':'')+(isContainer?' container':'')+'">'
            +ppuStr+unitDisplay+(isBest?' \u2605':'')+' </span>'+warn;
          if (r.note && r.source==='calc')
            noteStr = '<div style="font-size:10px;color:#aaa;margin-top:2px;">was: '+r.note+'</div>';
        } else {
          badge = '<span class="ppu-nodata">no unit data</span>';
        }

        if (r.freeDate || r.fastDate) {
          var parts = [];
          if (r.freeDate) {
            var freeClass = r.wfFreeFlag ? 'ppu-delivery wf-fee' : 'ppu-delivery';
            var freeLabel = r.wfFreeFlag
              ? '<span title="Whole Foods delivery has a separate fee — not free with Prime">FREE✳: </span>'
              : 'FREE: ';
            parts.push('<span class="'+freeClass+'">'+freeLabel+formatDate(r.freeDate)+'</span>');
          }
          if (r.fastDate) parts.push('<span class="ppu-delivery fast">Fastest: '+formatDate(r.fastDate)+'</span>');
          deliveryStr = '<div class="ppu-meta" style="margin-top:2px;">'+parts.join(' &nbsp; ')+'</div>';
        }

        var dimClass  = (!r.kwMatch && hasKw) ? ' kw-mismatch' : '';
        var srcClass  = srcHidden ? ' src-hidden' : '';
        var chkClass  = isChecked ? ' checked' : '';
        var safeTitle = r.title.replace(/"/g,'&quot;');
        var safeAsin  = r.asin.replace(/"/g,'&quot;');

        html +=
          '<div class="ppu-row'+dimClass+srcClass+chkClass+'" data-asin="'+safeAsin+'">' +
            '<div class="ppu-cb-wrap"><input type="checkbox" class="ppu-cb"'+(isChecked?' checked':'')+' title="Add to shortlist"></div>' +
            '<div class="ppu-row-content">' +
              '<a href="'+r.href+'" target="_blank" title="'+safeTitle+'">'+r.title+'</a>' +
              srcTag +
              '<div class="ppu-meta">' +
                '<span class="ppu-price">'+priceStr+'</span>' +
                (countStr ? '<span class="ppu-count">'+countStr+'</span>' : '') +
                badge +
              '</div>' +
              deliveryStr + noteStr +
            '</div>' +
          '</div>';
      });

      document.getElementById('ppu-list').innerHTML = html;

      document.querySelectorAll('.ppu-cb').forEach(function(cb) {
        cb.addEventListener('change', function() {
          var row  = this.closest('.ppu-row');
          var asin = row.getAttribute('data-asin');
          if (this.checked) { checkedAsins[asin] = true; row.classList.add('checked'); }
          else { delete checkedAsins[asin]; row.classList.remove('checked'); }
          var cnt = Object.keys(checkedAsins).length;
          showChkBtn.style.display  = cnt > 0 ? 'block' : 'none';
          clearChkBtn.style.display = cnt > 0 ? 'block' : 'none';
          showChkBtn.textContent = showCheckedOnly
            ? 'Show all ('+cnt+' selected)' : 'Show selected ('+cnt+')';
        });
      });

      // Schedule a log after render settles
      scheduleLog();

    } // end render

    // ── Events ────────────────────────────────────────────────────────────
    document.getElementById('ppu-sort').addEventListener('change', function() {
      sortVal = this.value;
      if (needsResort) needsResort = false;
      render();
    });

    function doResort() { needsResort = false; render(); }
    resortBtn.addEventListener('click', doResort);
    resortBtnBot.addEventListener('click', doResort);

    showChkBtn.addEventListener('click', function() { showCheckedOnly = !showCheckedOnly; render(); });
    clearChkBtn.addEventListener('click', function() { checkedAsins = {}; showCheckedOnly = false; render(); });

    kwInput.addEventListener('input', function() {
      keyword = this.value;
      this.classList.toggle('active', this.value.trim().length > 0);
      clearKw.style.display = this.value.trim().length > 0 ? 'block' : 'none';
      render();
    });
    clearKw.addEventListener('click', function() {
      kwInput.value=''; keyword=''; kwInput.classList.remove('active');
      clearKw.style.display='none'; kwInput.focus(); render();
    });

    unitInput.addEventListener('input', function() {
      unitOverride = this.value.trim();
      this.classList.toggle('active', unitOverride.length > 0);
      clearUnit.style.display = unitOverride.length > 0 ? 'block' : 'none';
      render();
    });
    clearUnit.addEventListener('click', function() {
      unitInput.value=''; unitOverride=''; unitInput.classList.remove('active');
      clearUnit.style.display='none'; unitInput.focus(); render();
    });

    panel.querySelectorAll('.ppu-source-toggle').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var src = this.getAttribute('data-src');
        srcFilter[src] = !srcFilter[src];
        this.classList.toggle('off', !srcFilter[src]);
        render();
      });
    });

    document.getElementById('ppu-collapse').addEventListener('click', function(e) {
      e.stopPropagation(); isCollapsed = !isCollapsed;
      panel.classList.toggle('collapsed', isCollapsed);
    });
    document.getElementById('ppu-close').addEventListener('click', function(e) {
      e.stopPropagation(); panel.remove();
    });
    document.getElementById('ppu-btn-hide').addEventListener('click', function() {
      hideNoData = !hideNoData;
      this.textContent = hideNoData ? 'Show all' : 'Hide no-data';
      render();
    });
    document.getElementById('ppu-btn-refresh').addEventListener('click', function() {
      var btn = this;
      btn.textContent = 'Refreshing…';
      btn.disabled = true;
      checkedAsins = {}; showCheckedOnly = false;
      setTimeout(function() { buildPanel(); }, 100);
    });

    // Load more
    var loadMoreBtn = document.getElementById('ppu-btn-load-more');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function() {
        if (!nextPageUrl) return;
        var btn = this;
        btn.disabled = true;
        btn.textContent = 'Loading\u2026';
        var fetchingPage = loadedPages + 1;
        var fetchUrl = nextPageUrl;

        fetchPage(fetchUrl, fetchingPage)
          .then(function(result) {
            allData = allData.concat(result.rows);
            loadedPages = fetchingPage;
            needsResort = true;
            nextPageUrl = result.nextUrl;
            var lmRow = document.getElementById('ppu-load-more-row');
            if (nextPageUrl && lmRow) {
              btn.disabled = false;
              btn.textContent = '\u2193 Load page '+(loadedPages+1)+' results';
            } else if (lmRow) {
              lmRow.style.display = 'none';
            }
            render();
          })
          .catch(function(err) {
            console.log('[PPU] Load more failed:', err);
            btn.textContent = 'Load failed \u2014 try Refresh';
            btn.disabled = false;
          });
      });
    }

    render();
  } // end buildPanel

  function tryBuild(attemptsLeft) {
    var cards = document.querySelectorAll('[data-component-type="s-search-result"]');
    if (cards.length > 0) { buildPanel(); }
    else if (attemptsLeft > 0) { setTimeout(function() { tryBuild(attemptsLeft-1); }, 800); }
    else { console.log('[PPU] Timed out.'); }
  }

  setTimeout(function() { tryBuild(15); }, 1500);

})();
