// Actually Useful — search.js
// Content script for Amazon search results pages (/s*)
// Part of the Actually Useful Chrome/Edge extension (v0.6.1.45)
'use strict';

function auFeedbackUrl() {
  const base = 'https://docs.google.com/forms/d/1AnG9frYVy7I2KUh27Re9iIJtwwqdzpa0qceFyGxZ-pE/viewform';
  const version = (typeof AU_VERSION !== 'undefined') ? AU_VERSION : 'unknown';
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Other';
  return base + '?usp=pp_url&entry.1362282898=' + encodeURIComponent(version) + '&entry.1312500883=' + encodeURIComponent(browser);
}

const PANEL_ID = 'ppu-sorter-panel';
const AU_FILTERS_KEY = 'au_search_filters'; // persists filter state per search term within session
// SCRIPT_VERSION and LOG_URL are defined in core.js — not duplicated here.
// Nudge state and delay are managed entirely by core.js (auNudge* functions).

  // Keywords that positively identify liquid categories (search term must match)
  const LIQUID_KEYWORDS = [
    'syrup','lotion','shampoo','conditioner','soap','detergent','serum',
    'spray','juice','oil','sauce','broth','rinse','gel','cream','toner',
    'mouthwash','cleanser','moisturizer','bleach','vinegar','milk','drink',
    'beverage','liquid','fluid','wash','cologne','perfume','sanitizer',
    'water','seltzer','sparkling water'
  ];

  // Keywords that identify solid/countable categories — suppress liquid inference even if oz dominates
  const SOLID_KEYWORDS = [
    'bar','bars','wafer','wafers','cookie','cookies','cracker','crackers',
    'chip','chips','chew','chews','oat','oatmeal','cereal','granola',
    'jerky','gummy','gummies','candy','chocolate','snack','snacks',
    'powder','capsule','capsules','tablet','tablets','pill','pills',
    'supplement','vitamin','protein powder','coffee','pod','pods','k-cup','kcup',
    'sheet','sheets','strip','strips',
    'toothpaste','tooth paste'
  ];

  const LIQUID_UNITS  = ['fl oz','fluid ounce','fluid ounces','ml','milliliter','milliliters','l','liter','liters'];
  const WEIGHT_UNITS  = ['oz','g','gram','grams','kg','kilogram','kilograms','lb','lbs','pound','pounds'];
  const CONTAINER_UNITS = ['roll','rolls','box','boxes','pack','packs','package','packages','pouch','pouches','tube','tubes'];
  const LENGTH_UNITS    = ['ft','feet','foot','meter','meters','m','cm','centimeter','centimeters','inch','inches','in','yard','yards','sq ft','square feet','square foot','square meter','square meters'];
// ITEM_UNITS: count-type units only. Weight/liquid units removed so they fall
// through to Fix 2 (weight-context check) instead of being accepted blindly.
// Prevents \$/oz on garden hoses, blood pressure monitors, etc.
const ITEM_UNITS = [
    'count','ct','bag','bags','piece','pieces','pcs','pc','each','unit','units',
    'pad','pads','sheet','sheets','wipe','wipes','tablet','tablets'
  ];

  // ── Search Context Persistence ────────────────────────────────────────────
  function saveSearchContext(term, searchUrl, items) {
    if (!term) return;
    try {
      chrome.runtime.sendMessage({
        type: 'AU_SAVE_SEARCH_CONTEXT',
        payload: { term: term, searchUrl: searchUrl, items: items || [] }
      });
    } catch(e) {}
  }

  function sendLog(data) {
    try {
      var payload = Object.assign({
        timestamp:     new Date().toISOString(),
        scriptVersion: AU_VERSION,
        searchUrl:     window.location.href,
        searchTerm:    (new URLSearchParams(window.location.search).get('k')||'').trim(),
      }, data);
      chrome.runtime.sendMessage({ type: 'AU_LOG', payload: payload });
    } catch(e) {}
  }

  // ── Filter persistence (session-scoped per search term) ───────────────────
  // Filters are saved to sessionStorage keyed by search term.
  // chrome.storage.local is for cross-session data (shortlist, panel position).
  // Filters intentionally reset when the search term changes.

  function getFilterStorageKey(term) {
    return AU_FILTERS_KEY + ':' + (term || '').trim().toLowerCase();
  }

  function saveFilters(searchTerm) {
    try {
      var key = getFilterStorageKey(searchTerm);
      var state = {
        keyword:       keyword,
        sortVal:       sortVal,
        minReviews:    minReviews,
        minRating:     minRating,
        minPrice:      minPrice,
        maxPrice:      maxPrice,
        sponsoredMode: sponsoredMode,
        selectedUnit:  selectedUnit,
        srcFilter:     srcFilter
      };
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch(e) {}
  }

  function loadFilters(searchTerm, callback) {
    try {
      var key = getFilterStorageKey(searchTerm);
      var raw = sessionStorage.getItem(key);
      if (raw) {
        var state = JSON.parse(raw);
        callback(state);
      } else {
        callback(null);
      }
    } catch(e) {
      callback(null);
    }
  }

  // ── Unit conversion ───────────────────────────────────────────────────────
  function convertPPU(ppu, fromUnit, toUnit) {
    if (!ppu || !fromUnit || !toUnit) return null;
    var from = fromUnit.toLowerCase().trim();
    var to   = toUnit.toLowerCase().trim();
    if (from === to) return ppu;
    var toFlOz = {
      'fl oz':1,'oz':1,'fluid ounce':1,'fluid ounces':1,
      'ml':1/29.5735,'milliliter':1/29.5735,'milliliters':1/29.5735,
      'l':33.814,'liter':33.814,'liters':33.814
    };
    var toOz = {
      'oz':1,'g':1/28.3495,'gram':1/28.3495,'grams':1/28.3495,
      'kg':35.274,'kilogram':35.274,'kilograms':35.274,
      'lb':16,'lbs':16,'pound':16,'pounds':16
    };
    if (toFlOz[from]!==undefined && toFlOz[to]!==undefined) return ppu/toFlOz[from]*toFlOz[to];
    if (toOz[from]!==undefined   && toOz[to]!==undefined)   return ppu/toOz[from]*toOz[to];
    return null;
  }

  function normalizePPUForSort(ppu, unit, isLiqDom) {
    if (!ppu || !unit) return ppu;
    var u = unit.toLowerCase().trim();
    if (LIQUID_UNITS.indexOf(u) !== -1)       return convertPPU(ppu, u, 'fl oz') || ppu;
    if (isLiqDom && u === 'oz')               return ppu;
    if (WEIGHT_UNITS.indexOf(u) !== -1)       return convertPPU(ppu, u, 'oz')    || ppu;
    return ppu;
  }

  function unitFamilyForSort(unit, isLiqDom) {
    if (!unit) return null;
    var u = unit.toLowerCase().trim();
    if (LIQUID_UNITS.indexOf(u) !== -1)  return 'liquid';
    if (isLiqDom && u === 'oz')          return 'liquid';
    if (WEIGHT_UNITS.indexOf(u) !== -1)  return 'weight';
    return null;
  }

  function formatPPU(ppu) {
    if (ppu < 0.10) return '$'+ppu.toFixed(3);
    return '$'+ppu.toFixed(2);
  }

  function normalizeUnit(unit) {
    if (!unit) return unit;
    var u = unit.toLowerCase().trim();
    // Strip leading "N " prefix from Amazon unit strings like "100 sheets", "50 count"
    // so they normalize to the base unit and compare correctly.
    u = u.replace(/^\d+\s+/, '');
    // Strip "per ..." suffix from Amazon compound labels like "pack per load", "pod per wash"
    u = u.replace(/\s+per\s+.*$/, '');
    if (u==='fluid ounce'||u==='fluid ounces'||u==='fl. oz'||u==='fl. oz.') return 'fl oz';
    if (u==='ounce'||u==='ounces') return 'oz';
    if (u==='count') return 'ct';
    if (u==='pound'||u==='pounds') return 'lb';
    if (u==='load'||u==='loads'||u==='sheet per load'||u==='sheets per load'||u==='load of laundry') return 'load';
    if (u==='gram'||u==='grams') return 'g';
    if (u==='kilogram'||u==='kilograms') return 'kg';
    if (u==='milliliter'||u==='milliliters') return 'ml';
    if (u==='liter'||u==='liters') return 'l';
    if (u==='piece'||u==='pieces') return 'pc';
    if (u==='tablet'||u==='tablets') return 'tab';
    if (u==='capsule'||u==='capsules') return 'cap';
    if (u==='feet'||u==='foot') return 'ft';
    return u;
  }

  // ── Liquid-dominant inference ─────────────────────────────────────────────
  function inferLiquidDominant(data) {
    var searchTerm = (new URLSearchParams(window.location.search).get('k')||'').toLowerCase();
    for (var s=0; s<SOLID_KEYWORDS.length; s++) {
      if (searchTerm.includes(SOLID_KEYWORDS[s])) return false;
    }
    var termIsLiquid = false;
    for (var i=0; i<LIQUID_KEYWORDS.length; i++) {
      if (searchTerm.includes(LIQUID_KEYWORDS[i])) { termIsLiquid=true; break; }
    }
    var liquidCount=0, weightCount=0;
    data.forEach(function(r){
      if (!r.unit) return;
      var u = r.unit.toLowerCase();
      if (LIQUID_UNITS.indexOf(u) !== -1) liquidCount++;
      else if (termIsLiquid && u === 'oz') liquidCount++;
      else if (WEIGHT_UNITS.indexOf(u) !== -1) weightCount++;
    });
    var total = liquidCount+weightCount;
    return termIsLiquid && total>0 && liquidCount/total >= 0.6;
  }

  function extractFlOzFromTitle(title) {
    var m = title.match(/(\d+(?:\.\d+)?)\s*(?:fl\.?\s*oz|fluid\s*ounces?)/i);
    if (m) return parseFloat(m[1]);
    return null;
  }

  // ── Weight-dominant inference ─────────────────────────────────────────────
  // True when results contain two or more distinct weight units (e.g. oz + lb),
  // meaning items were calculated from different title formats and need normalizing.
  function inferWeightDominant(data) {
    var weightUnits = {};
    data.forEach(function(r) {
      if (!r.unit || !r.ppu) return;
      var u = r.unit.toLowerCase();
      if (WEIGHT_UNITS.indexOf(u) !== -1) weightUnits[u] = (weightUnits[u]||0)+1;
    });
    return Object.keys(weightUnits).length >= 2;
  }

  // ── Unit pill generation ──────────────────────────────────────────────────
  function generateUnitPills(data, isLiqDom, isWeightDom) {
    var unitCounts = {};
    data.forEach(function(r){
      if (!r.unit||!r.ppu) return;
      var u = r.unit.toLowerCase();
      unitCounts[u] = (unitCounts[u]||0)+1;
    });
    var pills = [];
    var hasLiquidUnit = Object.keys(unitCounts).some(function(u){
      return LIQUID_UNITS.indexOf(u)!==-1 || (isLiqDom && u==='oz');
    });
    var hasWeightUnit = Object.keys(unitCounts).some(function(u){
      return WEIGHT_UNITS.indexOf(u)!==-1 && !(isLiqDom && u==='oz');
    });
    var COUNT_UNIT_KEYS = ['ct','count','each','pc','piece','pieces','pcs','unit','units','pad','pads','sheet','sheets','wipe','wipes','tablet','tablets','capsule','cap'];
    var hasCountUnit = Object.keys(unitCounts).some(function(u){ return COUNT_UNIT_KEYS.indexOf(u)!==-1; });
    var hasAltPPU = data.some(function(r){ return r.altPPU!=null; });
    if (hasLiquidUnit) {
      pills.push({ unit:'fl oz', label:'fl oz', isRecommended: isLiqDom });
      pills.push({ unit:'ml',    label:'ml',    isRecommended: false });
    }
    if (hasWeightUnit) {
      pills.push({ unit:'oz', label:'oz', isRecommended: !!isWeightDom });
      pills.push({ unit:'lb', label:'lb', isRecommended: false });
      pills.push({ unit:'g',  label:'g',  isRecommended: false });
      pills.push({ unit:'kg', label:'kg', isRecommended: false });
    }
    if ((hasCountUnit || hasAltPPU) && (hasLiquidUnit || hasWeightUnit) && !isLiqDom) {
      pills.push({ unit:'ct', label:'per item', isRecommended: false });
    }
    var convertibleCount = Object.keys(unitCounts).filter(function(u){
      return LIQUID_UNITS.indexOf(u)!==-1 || WEIGHT_UNITS.indexOf(u)!==-1 || (isLiqDom && u==='oz');
    }).length;
    var hasMinorityUnits = Object.keys(unitCounts).length > 1;
    if (convertibleCount < 2 && !isLiqDom && !hasMinorityUnits) pills = [];
    pills.push({ unit: null, label:'As listed', isRecommended: false });
    return pills;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function normalizeDimensions(str) {
    var s = str.replace(/["\u2018\u2019\u201c\u201d\u2033\u2032]/g,'');
    return s.replace(/(\d+(?:\.\d+)?)\s*[xX\u00d7]\s*(\d+(?:\.\d+)?)/g,'$1x$2');
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Card text scraping ────────────────────────────────────────────────────
  function scrapeCardText(el, hasCoupon, freeDate, fastDate) {
    var parts = [];
    var badgeSelectors = ['.s-badge-text','[data-component-type="s-status-badge-component"]','.a-badge-text','.s-coupon-highlight-color','.s-promotional-deal-badge'];
    badgeSelectors.forEach(function(sel){
      el.querySelectorAll(sel).forEach(function(node){
        var t = (node.textContent||'').trim();
        if (t && t.length < 200) parts.push(t);
      });
    });
    var discountSelectors = ['.s-coupon-unclipped','.s-coupon-clipped','[data-component-type="s-coupon-component"]','.a-color-success'];
    discountSelectors.forEach(function(sel){
      el.querySelectorAll(sel).forEach(function(node){
        if (node.closest('.a-price')) return;
        var t = (node.textContent||'').trim();
        if (t && t.length < 200) parts.push(t);
      });
    });
    var deliverySelectors = ['.udm-primary-delivery-message','.udm-secondary-delivery-message','.udm-badge-block','[data-component-type="s-delivery-component"] .a-color-base'];
    deliverySelectors.forEach(function(sel){
      el.querySelectorAll(sel).forEach(function(node){
        if (node.closest('.a-price')) return;
        if (node.closest('h2')) return;
        var t = (node.textContent||'').trim();
        if (t && t.length < 150) parts.push(t);
      });
    });
    if (hasCoupon) parts.push('coupon');
    if (el.querySelector('.a-icon-prime,[aria-label="Amazon Prime"],[data-component-type*="prime"]')) parts.push('prime');
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    var deliveryDate = freeDate || fastDate;
    if (deliveryDate) {
      if (deliveryDate.toDateString() === today.toDateString())    parts.push('today');
      if (deliveryDate.toDateString() === tomorrow.toDateString()) parts.push('tomorrow');
    }
    return parts.join(' ').toLowerCase();
  }

  // ── Keyword parsing ───────────────────────────────────────────────────────
  function parseKeywords(kwRaw) {
    var segments = kwRaw.trim().split(/\s+OR\s+|\|/i);
    var exclusions = [];
    var branches = [];
    segments.forEach(function(seg) {
      var nk = normalizeDimensions(seg.trim().toLowerCase());
      var terms = nk.split(/\s+/).filter(Boolean);
      var positive = [];
      terms.forEach(function(t) {
        if (t.startsWith('-') && t.length > 1) { exclusions.push(t.slice(1)); }
        else if (!t.startsWith('-')) { positive.push(t); }
      });
      if (positive.length > 0) branches.push(positive);
    });
    if (branches.length === 0) branches.push([]);
    return { branches: branches, exclusions: exclusions };
  }

  function titleMatchesKeywords(title, cardText, kwRaw) {
    var nt = normalizeDimensions(title.toLowerCase());
    var nc = cardText || '';
    var parsed = parseKeywords(kwRaw);
    for (var i=0; i<parsed.exclusions.length; i++) {
      var word = parsed.exclusions[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var re = new RegExp('\\b' + word + '\\b', 'i');
      if (re.test(nt)) return false;
      if (nc.toLowerCase().includes(parsed.exclusions[i])) return false;
    }
    for (var b=0; b<parsed.branches.length; b++) {
      var branch = parsed.branches[b];
      var branchMatch = true;
      for (var j=0; j<branch.length; j++) {
        var term = branch[j];
        if (!nt.includes(term) && !nc.includes(term)) { branchMatch = false; break; }
      }
      if (branchMatch) return true;
    }
    return false;
  }

  function highlightKeywords(title, cardText, kwRaw) {
    if (!kwRaw||!kwRaw.trim()) return escapeHtml(title);
    var normTitle = normalizeDimensions(title.toLowerCase());
    var nc = cardText || '';
    var parsed = parseKeywords(kwRaw);
    var matchingBranch = null;
    for (var b=0; b<parsed.branches.length; b++) {
      var branch = parsed.branches[b];
      var branchMatch = branch.length > 0;
      for (var j=0; j<branch.length; j++) {
        if (!normTitle.includes(branch[j]) && !nc.includes(branch[j])) { branchMatch = false; break; }
      }
      if (branchMatch) { matchingBranch = branch; break; }
    }
    if (!matchingBranch || matchingBranch.length === 0) return escapeHtml(title);
    var titleTerms = matchingBranch.filter(function(t){ return normTitle.includes(t); });
    if (!titleTerms.length) return escapeHtml(title);
    var ranges = [];
    titleTerms.forEach(function(term){
      var idx=0;
      while(true){
        var found=normTitle.indexOf(term,idx);
        if(found===-1) break;
        ranges.push({start:found,end:found+term.length}); idx=found+1;
      }
    });
    ranges.sort(function(a,b){return a.start-b.start;});
    var merged=[];
    ranges.forEach(function(r){
      if(merged.length&&r.start<=merged[merged.length-1].end)
        merged[merged.length-1].end=Math.max(merged[merged.length-1].end,r.end);
      else merged.push({start:r.start,end:r.end});
    });
    var result='',pos=0;
    merged.forEach(function(r){
      result+=escapeHtml(title.slice(pos,r.start));
      result+='<mark class="ppu-kw-highlight">'+escapeHtml(title.slice(r.start,r.end))+'</mark>';
      pos=r.end;
    });
    return result+escapeHtml(title.slice(pos));
  }

  // ── Delivery date parsing ─────────────────────────────────────────────────
  function parseDeliveryDates(el) {
    var result={freeDate:null,fastDate:null,freeCutoff:null,fastCutoff:null,paidDate:null,paidCutoff:null,paidPrice:null};
    var allDivs=Array.from(el.querySelectorAll('.udm-secondary-delivery-message,.a-color-base.a-text-normal,[class*="delivery"],.a-column.a-span12'));
    var seen=new Set();
    allDivs.forEach(function(div){
      if(seen.has(div)) return; seen.add(div);
      var text=div.textContent||'';
      var lower=text.toLowerCase();
      // Paid express delivery: "Or $4.99 delivery in N hours" — no bold date, relative time
      if(!result.paidDate && lower.includes('delivery') && !lower.includes('free') && !lower.includes('fastest')) {
        var priceM=text.match(/\$(\d+(?:\.\d+)?)\s+delivery/i);
        var hoursM=text.match(/in\s+(\d+)\s+hours?/i);
        if(priceM && hoursM) {
          var hrs=parseInt(hoursM[1],10);
          result.paidDate=new Date(Date.now()+hrs*3600000);
          result.paidCutoff='in '+hrs+' hr'+(hrs!==1?'s':'');
          result.paidPrice='$'+parseFloat(priceM[1]).toFixed(2);
          return;
        }
      }
      var boldEl=div.querySelector('.a-text-bold');
      var dateStr=boldEl?boldEl.textContent.trim():'';
      if(!dateStr) return;
      var parsed=parseDateString(dateStr);
      if(!parsed) return;
      var cutoff=null;
      var byM=text.match(/by\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/i);
      var withinM=text.match(/within\s+(\d+\s*hr[s]?)/i);
      if(byM) cutoff='by '+byM[1]; else if(withinM) cutoff=withinM[1];
      if(lower.includes('free')&&!lower.includes('fastest')){
        if(!result.freeDate){result.freeDate=parsed;result.freeCutoff=cutoff;}
      } else if(lower.includes('fastest')||lower.includes('or fastest')){
        if(!result.fastDate){result.fastDate=parsed;result.fastCutoff=cutoff;}
      }
    });
    return result;
  }

  function parseDeliveryWindowMinutes(el) {
    var msgEl = el.querySelector('.udm-primary-delivery-message');
    if (!msgEl) return Infinity;
    var text = msgEl.textContent || '';
    var m = text.match(/(\d{1,2})\s*(AM|PM)\s*[-–]\s*\d{1,2}\s*(?:AM|PM)/i);
    if (!m) return Infinity;
    var hour = parseInt(m[1], 10);
    var meridiem = m[2].toUpperCase();
    if (meridiem === 'AM') { return hour === 12 ? 0 : hour * 60; }
    else { return hour === 12 ? 720 : (hour + 12) * 60; }
  }

  function parseDeliveryWindowEnd(el) {
    var msgEl = el.querySelector('.udm-primary-delivery-message');
    if (!msgEl) return null;
    var text = msgEl.textContent || '';
    var m = text.match(/\d{1,2}\s*(?:AM|PM)\s*[-–]\s*(\d{1,2})\s*(AM|PM)/i);
    if (!m) return null;
    var hour = parseInt(m[1], 10);
    var meridiem = m[2].toUpperCase();
    if (meridiem === 'AM') { return hour === 12 ? 0 : hour * 60; }
    else { return hour === 12 ? 720 : (hour + 12) * 60; }
  }

  function formatWindowMinutes(mins) {
    if (mins === Infinity || mins == null) return '';
    var h = Math.floor(mins / 60);
    var meridiem = h < 12 ? 'AM' : 'PM';
    var display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return display + ' ' + meridiem;
  }

  function formatWindowRange(startMins, endMins) {
    if (startMins === Infinity || startMins == null) return '';
    var start = formatWindowMinutes(startMins);
    if (endMins == null) return start;
    var end = formatWindowMinutes(endMins);
    return start + '–' + end;
  }

  function parseDeliveryQualifier(el) {
    var msgEl = el.querySelector('.udm-primary-delivery-message');
    if (!msgEl) return null;
    var text = msgEl.textContent || '';
    var m = text.match(/\bon\s+(\$\d+\s+of\s+qualifying\s+items)/i);
    return m ? 'on ' + m[1] : null;
  }

  function parseDateString(str) {
    if(!str) return null;
    var s=str.trim(), now=new Date();
    var today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    if(/today/i.test(s)) return today;
    if(/tomorrow/i.test(s)){var t=new Date(today);t.setDate(t.getDate()+1);return t;}
    var months={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
    var m=s.match(/([a-z]{3})\s+(\d+)/i);
    if(m){
      var mon=months[m[1].toLowerCase()]; if(mon===undefined) return null;
      var d=new Date(now.getFullYear(),mon,parseInt(m[2],10));
      if(d<today&&(today-d)>7*86400000) d.setFullYear(now.getFullYear()+1);
      return d;
    }
    return null;
  }

  function formatDate(d) {
    if(!d) return '';
    var days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var mons=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    var tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);
    if(d.toDateString()===today.toDateString()) return 'Today';
    if(d.toDateString()===tomorrow.toDateString()) return 'Tomorrow';
    return days[d.getDay()]+' '+mons[d.getMonth()]+' '+d.getDate();
  }

  // ── Known retailer partners ───────────────────────────────────────────────
  var KNOWN_RETAILERS = {
    'Amazon Fresh':       { key: 'fresh',              label: 'Fresh' },
    'Whole Foods Market': { key: 'whole-foods',        label: 'Whole Foods' },
    'Metropolitan Market':{ key: 'metropolitan-market',label: 'Metropolitan Market' },
    'Bristol Farms':      { key: 'bristol-farms',      label: 'Bristol Farms' },
    'Cardenas Markets':   { key: 'cardenas',           label: 'Cardenas' },
    'Lucky':              { key: 'lucky',              label: 'Lucky' },
    'FoodMaxx':           { key: 'foodmaxx',           label: 'FoodMaxx' },
    'Food Maxx':          { key: 'foodmaxx',           label: 'FoodMaxx' },
    'Save Mart':          { key: 'save-mart',          label: 'Save Mart' },
    'Weis Markets':       { key: 'weis',               label: 'Weis Markets' },
    'Winn-Dixie':         { key: 'winn-dixie',         label: 'Winn-Dixie' },
    'Amazon Pharmacy':    { key: 'pharmacy',           label: 'Amazon Pharmacy' },
  };

  function retailerNameToKey(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  }

  function detectSource(el) {
    if(el.querySelector('a[href*="pharmacy.amazon.com"]')) return { key: 'pharmacy', label: 'Amazon Pharmacy' };
    var logo = el.querySelector('img.s-image-logo-alm');
    if(logo) {
      var alt = (logo.getAttribute('alt') || '').trim();
      if(alt) {
        var known = KNOWN_RETAILERS[alt];
        if(known) return { key: known.key, label: known.label };
        return { key: retailerNameToKey(alt), label: alt };
      }
    }
    return { key: 'standard', label: 'Amazon' };
  }

  function parseReviewCount(el) {
    var countEl = el.querySelector('[aria-label*="ratings"],[aria-label*="reviews"]');
    if (countEl) {
      var lbl = countEl.getAttribute('aria-label')||'';
      var m = lbl.replace(/,/g,'').match(/(\d+)/);
      if (m) return parseInt(m[1],10);
    }
    var links = el.querySelectorAll('a span.a-size-base');
    for (var i=0;i<links.length;i++) {
      var t=(links[i].textContent||'').trim().replace(/,/g,'');
      if(/^\d+$/.test(t)){
        var n=parseInt(t,10);
        if(n>0&&n<10000000){
          var par=links[i].closest('a');
          if(par&&/rating|review|star/i.test(par.getAttribute('href')||'')) return n;
        }
      }
    }
    return null;
  }

  function parseRating(el) {
    var starEl = el.querySelector('[aria-label*="out of 5 stars"],[aria-label*="out of 5 star"]');
    if (starEl) {
      var lbl = starEl.getAttribute('aria-label') || '';
      var m = lbl.match(/([\d.]+)\s+out of/);
      if (m) return parseFloat(m[1]);
    }
    return null;
  }

  // ── Nudge ─────────────────────────────────────────────────────────────────
  var nudgeTriggeredThisSession=false;
  function maybeShowNudge() {
    if(nudgeTriggeredThisSession) return;
    auNudgeShouldShow(function(show) {
      if(!show) return;
      nudgeTriggeredThisSession=true;
      auNudgeRecordShown();
      var existing=document.getElementById('ppu-nudge');
      if(existing) existing.remove();
      var nudge=document.createElement('div');
      nudge.id='ppu-nudge';
      nudge.innerHTML=
        '<div id="ppu-nudge-inner">'+
          '<button id="ppu-nudge-close" title="Dismiss for now">\u00d7</button>'+
          '<div id="ppu-nudge-msg">\u2615 Actually Useful is free \u2014 but it takes real time to build and maintain. If it\'s saving you money, a small tip means a lot.</div>'+
          '<div id="ppu-nudge-btns">'+
            '<a id="ppu-nudge-yes" href="https://ko-fi.com/butactuallyuseful" target="_blank">Contribute \u2665</a>'+
            '<button id="ppu-nudge-did">I already did \u2713</button>'+
            '<button id="ppu-nudge-no">Don\'t ask again</button>'+
          '</div>'+
        '</div>';
      document.body.appendChild(nudge);
      document.getElementById('ppu-nudge-close').addEventListener('click',function(){nudge.remove();});
      document.getElementById('ppu-nudge-yes').addEventListener('click',function(){nudge.remove();});
      document.getElementById('ppu-nudge-did').addEventListener('click',function(){auNudgeDismissPermanently();nudge.remove();});
      document.getElementById('ppu-nudge-no').addEventListener('click',function(){auNudgeDismissPermanently();nudge.remove();});
    });
  }

  function cleanHref(rawHref,card) {
    var asin=card&&card.getAttribute('data-asin');
    if(asin) return 'https://www.amazon.com/dp/'+asin;
    if(rawHref){var m=rawHref.match(/\/dp\/([A-Z0-9]{10})/);if(m) return 'https://www.amazon.com/dp/'+m[1];}
    return rawHref||'#';
  }

  function parseCouponPrice(el) {
    var text=el.textContent||'';
    var m=text.match(/you\s+pay\s+\$\s*([\d,]+\.?\d*)\s+with\s+coupon/i);
    if(m){var v=parseFloat(m[1].replace(/,/g,''));if(!isNaN(v)&&v>0) return v;}
    m=text.match(/coupon\s*price\s*\$\s*([\d,]+\.?\d*)/i);
    if(m){var v2=parseFloat(m[1].replace(/,/g,''));if(!isNaN(v2)&&v2>0) return v2;}
    return null;
  }

  function detectCouponPill(el) {
    var leaves=Array.from(el.querySelectorAll('*')).filter(function(e){return e.children.length===0;});
    for(var i=0;i<leaves.length;i++){
      var t=leaves[i].textContent.trim();
      if(/coupon\s*price/i.test(t)||/clip\s*coupon/i.test(t)) return true;
    }
    return false;
  }

  function detectSnap(el) {
    // Check aria-label attributes first (most reliable)
    var snapAttr=el.querySelector('[aria-label*="SNAP"],[aria-label*="snap ebt"]');
    if(snapAttr) return true;
    // Fall back to text scan for "SNAP EBT" in leaf nodes
    var leaves=Array.from(el.querySelectorAll('*')).filter(function(e){return e.children.length===0;});
    for(var i=0;i<leaves.length;i++){
      if(/snap\s+ebt/i.test(leaves[i].textContent)) return true;
    }
    return false;
  }

  function detectFsaHsa(el) {
    var attr=el.querySelector('[aria-label*="FSA"],[aria-label*="HSA"],[aria-label*="fsa"],[aria-label*="hsa"]');
    if(attr) return true;
    var leaves=Array.from(el.querySelectorAll('*')).filter(function(e){return e.children.length===0;});
    for(var i=0;i<leaves.length;i++){
      if(/fsa\s+or\s+hsa\s+eligible/i.test(leaves[i].textContent)) return true;
    }
    return false;
  }

  function detectClimatePledge(el) {
    var attr=el.querySelector('[aria-label*="Climate Pledge"],[aria-label*="climate pledge"]');
    if(attr) return true;
    var leaves=Array.from(el.querySelectorAll('*')).filter(function(e){return e.children.length===0;});
    for(var i=0;i<leaves.length;i++){
      if(/climate\s+pledge\s+friendly/i.test(leaves[i].textContent)) return true;
    }
    return false;
  }

  function detectSmallBusiness(el) {
    var attr=el.querySelector('[aria-label*="Small Business"],[aria-label*="small business"]');
    if(attr) return true;
    var leaves=Array.from(el.querySelectorAll('*')).filter(function(e){return e.children.length===0;});
    for(var i=0;i<leaves.length;i++){
      if(/small\s+business/i.test(leaves[i].textContent)) return true;
    }
    return false;
  }

  function parseSnS(el) {
    var fullText=el.textContent||'';
    if(!/when you subscribe/i.test(fullText)) return null;
    var mp=fullText.match(/extra\s+([\d.]+%)\s+off/i);
    if(mp) return mp[1]+' off';
    var md=fullText.match(/extra\s+\$([\d.,]+)\s+off/i);
    if(md) return '$'+md[1]+' off';
    return 'unknown';
  }

  function parseSavings(el) {
    var leaves=Array.from(el.querySelectorAll('*')).filter(function(e){return e.children.length===0;});
    for(var i=0;i<leaves.length;i++){
      var t=leaves[i].textContent.trim();
      var m=t.match(/get\s+(\d+)\s+for\s+the\s+price\s+of\s+(\d+)/i);
      if(m) return 'Get '+m[1]+' for the price of '+m[2];
    }
    return null;
  }

  function parseAmazonUnitPrice(el) {
    var containers=el.querySelectorAll('.a-size-base.a-color-base,.a-size-base-plus.a-color-base');
    for(var i=0;i<containers.length;i++){
      var cont=containers[i],trimmed=(cont.textContent||'').trim();
      if(!trimmed.startsWith('(')||!trimmed.includes('/')||!trimmed.endsWith(')')) continue;
      var ps=cont.querySelector('.a-price.a-text-price .a-offscreen');
      if(!ps) continue;
      var price=parseFloat(ps.textContent.replace(/[$,]/g,'').trim());
      if(isNaN(price)||price<=0) continue;
      var um=trimmed.match(/\/\s*([^)]+)\)\s*$/);
      if(um) return {ppu:price,unit:normalizeUnit(um[1].trim())};
    }
    var text=(el.innerText||'').replace(/\$([\d.]+)\$\1/g,'$$$1');
    var m=text.match(/\(\$\s*([\d.]+)\s*\/\s*([^)\n,]+)\)/i);
    if(m) return {ppu:parseFloat(m[1]),unit:normalizeUnit(m[2].trim())};
    m=text.match(/\(¢\s*([\d.]+)\s*\/\s*([^)\n,]+)\)/i);
    if(m) return {ppu:parseFloat(m[1])/100,unit:normalizeUnit(m[2].trim())};
    return null;
  }

  function extractCount(text) {
    var pats=[
      /(\d[\d,]*)\s*-?\s*count/i,/(\d[\d,]*)\s*ct\b/i,
      /(\d[\d,]*)\s*-?\s*bags?/i,/(\d[\d,]*)\s*-?\s*pcs\.?/i,
      /(\d[\d,]*)\s*-?\s*pieces?/i,/(\d[\d,]*)\s*-?\s*pack/i,/(\d[\d,]*)\s*-?\s*pk\b/i,/(\d[\d,]*)\s*-?\s*rolls?/i,
      /(\d[\d,]*)\s*-?\s*bars?\b/i,
      /pack\s+of\s+(\d[\d,]*)/i,/box\s+of\s+(\d[\d,]*)/i,
      /(\d[\d,]*)\s+\w+\s+\w+\s+bars?\b/i,
      /(\d[\d,]*)\s+loads?\b/i,
      /(\d[\d,]*)\s*-?\s*sheets?/i,           // "100 sheets", "40-sheet"
      /(\d[\d,]*)\s+\w+\s+sheets?\b/i,        // "100 Scrapbook Sheets"
      /(\d[\d,]*)\s*-?\s*strips?\b/i,
      /(\d[\d,]*)\s*-?\s*pairs?\b/i,          // "6 pairs", "3-pair"
      // "4 Mini Tubes", "2 Lip Sticks", "3 Travel Bottles", "5 Small Jars"
      /(?<![.\d])(\d[\d,]*)(?!\.\d)\s+\w+\s+tubes?\b/i,
      /(?<![.\d])(\d[\d,]*)(?!\.\d)\s+\w+\s+sticks?\b/i,
      /(?<![.\d])(\d[\d,]*)(?!\.\d)\s+\w+\s+bottles?\b/i,
      /(?<![.\d])(\d[\d,]*)(?!\.\d)\s+\w+\s+jars?\b/i,
    ];
    for(var i=0;i<pats.length;i++){var m=text.match(pats[i]);if(m){var n=parseInt(m[1].replace(/,/g,''),10);if(n>1&&n<10000)return n;}}
    // Footage extraction: min 5ft, not preceded by fraction digit (avoids 5/8")
    var ftm = text.match(/(?<![\d\/])(\d+)\s*(?:ft|feet)\b/i);
    if(ftm){var fn=parseInt(ftm[1],10);if(fn>=5&&fn<10000)return fn;}
    return null;
  }

  function guessCountUnit(text) {
    if(/\d[\d,]*\s*-?\s*rolls?/i.test(text))    return 'roll';
    if(/\d[\d,]*\s*-?\s*bags?/i.test(text))     return 'bag';
    if(/(\d[\d,]*)\s+\w+\s+sheets?\b/i.test(text)) return 'sheet'; // "100 Scrapbook Sheets"
    if(/\d[\d,]*\s*-?\s*sheets?/i.test(text))   return 'sheet';
    if(/\d[\d,]*\s*-?\s*strips?\b/i.test(text)) return 'strip';
    if(/\d[\d,]*\s+loads?\b/i.test(text))       return 'load';
    if(/\d[\d,]*\s*-?\s*wipes?/i.test(text))    return 'wipe';
    if(/\d[\d,]*\s*-?\s*pads?/i.test(text))     return 'pad';
    if(/\d[\d,]*\s*-?\s*tablets?/i.test(text))  return 'tablet';
    if(/\d[\d,]*\s*-?\s*pills?/i.test(text))    return 'pill';
    if(/\d[\d,]*\s*-?\s*capsules?/i.test(text)) return 'capsule';
    if(/\d[\d,]*\s*-?\s*pcs\.?/i.test(text))    return 'pc';
    if(/\d[\d,]*\s*-?\s*pieces?/i.test(text))   return 'piece';
    if(/\d[\d,]*\s*-?\s*pairs?\b/i.test(text))  return 'pair';  // "6 pairs", "3-pair"
    if(/(?<![\d\/])(\d+)\s*(?:ft|feet)\b/i.test(text)) return 'ft'; // "25ft", "50 feet" 
    if(/\d[\d,]*\s*-?\s*bars?/i.test(text))     return 'ct';
    if(/\d[\d,]*\s*-?\s*pack/i.test(text))      return 'ct';
    if(/\d[\d,]*\s*-?\s*pk\b/i.test(text))      return 'ct';
    if(/pack\s+of\s+\d/i.test(text))            return 'ct';
    if(/\d[\d,]*\s*-?\s*count/i.test(text))     return 'ct';
    if(/\d[\d,]*\s*ct\b/i.test(text))            return 'ct';
    if(/box\s+of\s+\d/i.test(text))             return 'ct';
    return null;
  }

  function guessUnitFromTitle(text) {
    var lower=text.toLowerCase();
    if(/\bpack\b|\bpacks\b|\broll\b|\brolls\b|\bbag\b|\bbags\b/.test(lower)) return null;
    if(/\bwipes?\b/.test(lower))    return 'wipe';
    if(/\bsheets?\b/.test(lower))   return 'sheet';
    if(/\bpads?\b/.test(lower))     return 'pad';
    if(/\btablets?\b/.test(lower))  return 'tablet';
    if(/\bpills?\b/.test(lower))    return 'pill';
    if(/\bcapsules?\b/.test(lower)) return 'capsule';
    if(/\bpcs\b|pieces?\b/.test(lower)) return 'pc';
    return null;
  }

  function parsePrice(el) {
    var whole=el.querySelector('.a-price-whole'),frac=el.querySelector('.a-price-fraction');
    if(whole){
      var w=whole.textContent.replace(/[^0-9]/g,'');
      var f=frac?frac.textContent.replace(/[^0-9]/g,'').slice(0,2).padEnd(2,'0'):'00';
      var val=parseFloat(w+'.'+f); if(!isNaN(val)&&val>0) return val;
    }
    var off=el.querySelector('.a-price .a-offscreen');
    if(off){var m2=off.textContent.replace(/,/g,'').match(/([\d]+\.?\d*)/);if(m2)return parseFloat(m2[1]);}
    return null;
  }

  // ── Pairs uncertainty note ────────────────────────────────────────────────
  // Applied post-assembly: if title says "X pairs" and PPU came from Amazon's
  // reported unit price, we can't tell if Amazon means per-pair or per-item.
  function applyPairsNote(result, title) {
    if(!result.ppu || result.source !== 'amazon') return result;
    if(/\bpairs?\b/i.test(title)) {
      var note = result.note ? result.note + ' ' : '';
      result.note = note + 'Sold in pairs \u2014 PPU is Amazon\u2019s figure and may be per pair or per item. Check the listing to compare accurately.';
      // Use 'pair' as unit label so the display reads $/pair not $/ct
      if(result.unit === 'ct' || !result.unit) result.unit = 'pair';
    }
    return result;
  }

  // ── Weight quantity parser ───────────────────────────────────────────────────
  // Returns the weight quantity in the given unit found in the title.
  // Used to sanity-check Amazon's reported unit price (e.g. Amazon says $5/oz
  // but item is $9.99 for 32 oz — detect and recalculate).
  function parseTitleWeightQty(title, unit) {
    var ozM = title.match(/\b(\d+(?:\.\d+)?)\s*(?:oz|ounce|ounces)\b/i);
    var lbM = title.match(/\b(\d+(?:\.\d+)?)\s*[-\s]*(?:lb\.?|lbs\.?|pound|pounds)\b/i);
    var gM  = title.match(/\b(\d+(?:\.\d+)?)\s*(?:g|gram|grams)\b/i);
    var kgM = title.match(/\b(\d+(?:\.\d+)?)\s*(?:kg|kilogram|kilograms)\b/i);
    if (unit === 'oz') {
      if (ozM) return parseFloat(ozM[1]);
      if (lbM) return parseFloat(lbM[1]) * 16;
    }
    if (unit === 'lb') {
      if (lbM) return parseFloat(lbM[1]);
      if (ozM) return parseFloat(ozM[1]) / 16;
    }
    if (unit === 'g')  { if (gM)  return parseFloat(gM[1]);  }
    if (unit === 'kg') { if (kgM) return parseFloat(kgM[1]); }
    return 0;
  }

    // ── Scrape one card ───────────────────────────────────────────────────────
  function scrapeCard(el,pageNum,originalIndex) {
    var h2El=el.querySelector('h2[aria-label]')||el.querySelector('h2');
    var brandEl=el.querySelector('h2.a-size-mini span,h2[class*="a-size-mini"] span');
    var brandRaw=brandEl?brandEl.textContent.trim():'';
    var isSponsored=brandRaw.toLowerCase().includes('sponsor');
    if(!isSponsored){var sE=el.querySelector('.s-label-popover-default,[data-component-type="s-status-badge-component"]');if(sE&&/sponsor/i.test(sE.textContent))isSponsored=true;}
    if(!isSponsored){var aB=el.querySelector('.puis-sponsored-label-text,.s-sponsored-label-text');if(aB)isSponsored=true;}
    var brandName=(brandRaw&&!isSponsored)?brandRaw:'';
    var titleEl=el.querySelector('h2 a span,h2 span');
    var rawTitle=(h2El&&h2El.getAttribute('aria-label'))?h2El.getAttribute('aria-label').trim():(titleEl?titleEl.textContent.trim():'(no title)');
    rawTitle=rawTitle.replace(/^sponsored\s+ad\s*[-–]\s*/i,'').trim();
    var title=(brandName&&!rawTitle.toLowerCase().startsWith(brandName.toLowerCase()))?brandName+' '+rawTitle:rawTitle;
    var linkEl=el.querySelector('h2 a');
    var href=cleanHref(linkEl?linkEl.href:null,el);
    var asin=el.getAttribute('data-asin')||href;
    var couponPrice=parseCouponPrice(el);
    var listPrice=parsePrice(el);
    var price=couponPrice!==null?couponPrice:listPrice;
    var hasCoupon=couponPrice!==null;
    var couponPillOnly=!hasCoupon&&detectCouponPill(el);
    var sns=parseSnS(el);
    var savings=parseSavings(el);
    var ap=parseAmazonUnitPrice(el);
    var count=extractCount(title);
    var page=pageNum||1;
    var retailer=detectSource(el);
    var delivery=parseDeliveryDates(el);
    var wfFreeFlag=(retailer.key==='whole-foods')&&!!delivery.freeDate;
    var reviewCount=parseReviewCount(el);
    var rating=parseRating(el);
    var cardText=scrapeCardText(el,hasCoupon,delivery.freeDate,delivery.fastDate);
    var freeWindowMinutes=parseDeliveryWindowMinutes(el);
    var freeWindowEnd=parseDeliveryWindowEnd(el);
    var freeQualifier=parseDeliveryQualifier(el);
    var imgEl=el.querySelector('img.s-image');
    var imgUrl=imgEl?imgEl.src:'';
    var isSnap=detectSnap(el);
    var isFsaHsa=detectFsaHsa(el);
    var isClimatePledge=detectClimatePledge(el);
    var isSmallBusiness=detectSmallBusiness(el);
    var base={title,href,asin,price,listPrice,count,page,retailer,wfFreeFlag,isSponsored,hasCoupon,
              couponPillOnly,sns,savings,cardText,reviewCount,rating,originalIndex:originalIndex||0,
              freeDate:delivery.freeDate,fastDate:delivery.fastDate,
              freeCutoff:delivery.freeCutoff,fastCutoff:delivery.fastCutoff,
              freeWindowMinutes:freeWindowMinutes,freeWindowEnd:freeWindowEnd,freeQualifier:freeQualifier,imgUrl:imgUrl,
              paidDate:delivery.paidDate,paidCutoff:delivery.paidCutoff,paidPrice:delivery.paidPrice,isSnap:isSnap,
              isFsaHsa:isFsaHsa,isClimatePledge:isClimatePledge,isSmallBusiness:isSmallBusiness};

    // Override: if Amazon reported a weight unit but the item title indicates a countable
    // solid product (pods, sheets, strips, loads, etc.), ignore the weight unit and
    // calculate from count instead. Fixes $/lb appearing on laundry pods/sheets.
    var COUNTABLE_SOLID_TITLE_KEYWORDS = [
      'pod','pods','pac','pacs','fling','flings','tab','tabs',
      'sheet','sheets','strip','strips','load','loads'
    ];
    var titleLower = title.toLowerCase();
    var titleIsSolid = COUNTABLE_SOLID_TITLE_KEYWORDS.some(function(kw){ return new RegExp('\\b' + kw + '\\b', 'i').test(title); });
    var solidUnitIsWrong = ap && titleIsSolid && count && price && (
      WEIGHT_UNITS.includes(ap.unit) ||
      LIQUID_UNITS.includes(ap.unit) ||
      (Math.abs(ap.ppu - price) / price < 0.01)
    );
    if(solidUnitIsWrong) {
      var solidUnit = guessCountUnit(title) || guessUnitFromTitle(title) || 'ct';
      return Object.assign(base,{ppu:price/count,unit:solidUnit,source:'calc',note:'Amazon said '+formatPPU(ap.ppu)+'/'+ap.unit+'; overridden (solid product)'});
    }

    if(ap&&ITEM_UNITS.includes(ap.unit)) {
      if(ap.unit==='ct'&&count&&price) {
        // Fix 1: if Amazon's reported $/ct ≈ the full item price, it's a whole-package unit.
        // Recalculate from count so we get $/sheet, $/wipe, $/bandage, etc.
        var apPpuIsFullPrice = Math.abs(ap.ppu - price) / price < 0.01;
        if(apPpuIsFullPrice && count > 1) {
          var recalcUnit = guessCountUnit(title) || guessUnitFromTitle(title) || 'ct';
          return Object.assign(base,{ppu:price/count,unit:recalcUnit,source:'calc',
            note:'Amazon\u2019s unit price was per package \u2014 recalculated from count in title.'});
        }
        return applyPairsNote(Object.assign(base,{ppu:ap.ppu,unit:'ct',source:'amazon'}),title);
      }
      if(count&&price&&ap.unit!=='ct') {
        var altUnit=guessCountUnit(title)||guessUnitFromTitle(title)||'ct';
        return applyPairsNote(Object.assign(base,{ppu:ap.ppu,unit:ap.unit,source:'amazon',altPPU:price/count,altUnit:altUnit}),title);
      }
      if(!count&&price&&(LIQUID_UNITS.includes(ap.unit)||WEIGHT_UNITS.includes(ap.unit))) {
        return applyPairsNote(Object.assign(base,{ppu:ap.ppu,unit:ap.unit,source:'amazon',altPPU:price,altUnit:'ct'}),title);
      }
      return applyPairsNote(Object.assign(base,{ppu:ap.ppu,unit:ap.unit,source:'amazon'}),title);
    }
    if(ap&&LENGTH_UNITS.includes(ap.unit)&&count&&price){
      var unit=guessCountUnit(title)||guessUnitFromTitle(title)||'ct';
      return Object.assign(base,{ppu:price/count,unit,source:'calc',note:'Amazon said '+formatPPU(ap.ppu)+'/'+ap.unit});
    }
    if(ap&&LENGTH_UNITS.includes(ap.unit)) return Object.assign(base,{ppu:null,unit:null,source:'none'});
    if(ap&&CONTAINER_UNITS.includes(ap.unit)&&count&&price){
      var unit=guessCountUnit(title)||guessUnitFromTitle(title)||'ct';
      return Object.assign(base,{ppu:price/count,unit,source:'calc',note:'Amazon said '+formatPPU(ap.ppu)+'/'+ap.unit});
    }
    if(ap&&CONTAINER_UNITS.includes(ap.unit)) return Object.assign(base,{ppu:ap.ppu,unit:ap.unit,source:'amazon-container',note:'Per '+ap.unit+', not per item'});
    // Fix 2: Amazon reported a weight/liquid unit but the title has no weight quantity.
    // Before suppressing, check if we can calculate $/ft from footage in the title instead.
    if(ap&&(WEIGHT_UNITS.includes(ap.unit)||LIQUID_UNITS.includes(ap.unit))) {
      var titleHasWeightQty=/\b\d+(?:\.\d+)?[-\s]*(?:lb\.?|lbs\.?|pound|pounds|oz\.?|ounce|ounces|g\b|kg|ml|fl\s*oz|litre|liter)/i.test(title);
      if(!titleHasWeightQty) {
        // If title has footage (e.g. "25ft hose"), calculate $/ft instead of suppressing
        var ftMatch=title.match(/(?<![\d\/])(\d+)\s*(?:ft|feet)\b/i);
        var ftCount=ftMatch?parseInt(ftMatch[1],10):null;
        if(ftCount&&ftCount>=5&&price) {
          return Object.assign(base,{ppu:price/ftCount,unit:'ft',source:'calc',
            note:'Amazon reported \u2019/'+ap.unit+'\u2019 (item weight); calculated from footage in title instead.'});
        }
        if(price) return Object.assign(base,{ppu:price,unit:'ct',source:'calc-single',
          note:'No weight or count data found; showing price per item.'});
        return Object.assign(base,{ppu:null,unit:null,source:'none',
          note:'PPU hidden \u2014 Amazon reported a weight/volume unit but this item doesn\u2019t appear to be sold by weight.'});
      }
      // Weight sanity check: if Amazon's $/unit × weight-in-title ≠ item price, recalculate.
      // Catches listings where Amazon reports a wrong unit price (e.g. $5/oz on a $9.99/32oz item).
      if(WEIGHT_UNITS.includes(ap.unit) && price) {
        var wQty = parseTitleWeightQty(title, ap.unit) * (count || 1);
        if(wQty > 0 && Math.abs(ap.ppu * wQty - price) / price > 0.10) {
          return Object.assign(base,{ppu:price/wQty,unit:ap.unit,source:'calc',
            note:'Amazon\u2019s unit price didn\u2019t add up \u2014 recalculated from weight in title.'});
        }
      }
    }
    if(ap) return applyPairsNote(Object.assign(base,{ppu:ap.ppu,unit:ap.unit,source:'amazon'}),title);
    if(count&&price){
      var unit2=guessCountUnit(title)||guessUnitFromTitle(title)||'ct';
      return Object.assign(base,{ppu:price/count,unit:unit2,source:'calc'});
    }
    // Weight-from-title: when Amazon gives no unit price and title has a weight,
    // calculate $/unit instead of falling back to price/ct.
    // Handles single-bag rice, dog food bags, etc.
    if(price) {
      var wtUnit=null,wtQty=0;
      var ozM2=title.match(/\b(\d+(?:\.\d+)?)\s*(?:oz|ounce|ounces)\b/i);
      var lbM2=title.match(/\b(\d+(?:\.\d+)?)\s*[-\s]*(?:lb\.?|lbs\.?|pound|pounds)\b/i);
      var gM2 =title.match(/\b(\d+(?:\.\d+)?)\s*(?:g|gram|grams)\b/i);
      var kgM2=title.match(/\b(\d+(?:\.\d+)?)\s*(?:kg|kilogram|kilograms)\b/i);
      if(ozM2){wtQty=parseFloat(ozM2[1]);wtUnit='oz';}
      else if(lbM2){wtQty=parseFloat(lbM2[1]);wtUnit='lb';}
      else if(gM2){wtQty=parseFloat(gM2[1]);wtUnit='g';}
      else if(kgM2){wtQty=parseFloat(kgM2[1]);wtUnit='kg';}
      if(wtQty>0&&wtUnit)
        return Object.assign(base,{ppu:price/wtQty,unit:wtUnit,source:'calc-weight',
          note:'No Amazon unit price \u2014 calculated from weight in title.'});
      return Object.assign(base,{ppu:price,unit:'ct',source:'calc-single'});
    }
    if(!price) return Object.assign(base,{ppu:null,unit:null,source:'unavailable'});
    return Object.assign(base,{ppu:null,unit:null,source:'none'});
  }

  // ── Liquid-dominant ct→fl oz conversion ──────────────────────────────────
  function applyLiquidCtConversion(data) {
    data.forEach(function(r) {
      if (!r.unit || r.unit !== 'ct') return;
      if (!r.price || !r.ppu) return;
      var perItemFlOz = extractFlOzFromTitle(r.title);
      if (!perItemFlOz) return;
      r.ppu = r.ppu / perItemFlOz;
      r.unit = 'fl oz';
      r.source = 'calc-liquid';
      r.note = 'converted from per-can price';
    });
  }

  function getNextPageUrl() {
    var nb=document.querySelector('.s-pagination-next:not(.s-pagination-disabled)');
    if(!nb) return null;
    var href=nb.getAttribute('href'); if(!href) return null;
    return href.startsWith('http')?href:'https://www.amazon.com'+href;
  }

  function fetchPage(url,pageNum,startIndex) {
    return fetch(url,{credentials:'include'}).then(function(r){return r.text();}).then(function(html){
      var doc=new DOMParser().parseFromString(html,'text/html');
      var cards=doc.querySelectorAll('[data-component-type="s-search-result"]');
      var seen={},idx=startIndex||0;
      var rows=Array.from(cards).reduce(function(acc,c){
        var row=scrapeCard(c,pageNum,idx++);
        if(row.asin&&seen[row.asin]) return acc;
        if(row.asin) seen[row.asin]=true;
        if(allData.some(function(r){return r.asin&&r.asin===row.asin;})) return acc;
        acc.push(row); return acc;
      },[]);
      var na=doc.querySelector('.s-pagination-next:not(.s-pagination-disabled)');
      var nextUrl=na?('https://www.amazon.com'+na.getAttribute('href')):null;
      return {rows,nextUrl};
    });
  }

  // ── State ─────────────────────────────────────────────────────────────────
  var sponsoredMode    = 'show';
  var isCollapsed      = false;
  var keyword          = '';
  var selectedUnit     = null;
  var sortVal          = 'ppu-asc';
  var checkedAsins     = {};
  var itemNotes        = {};   // asin → note string
  var minPrice         = '';
  var maxPrice         = '';
  var allData          = [];
  var loadedPages      = 1;
  var nextPageUrl      = null;
  var needsResort      = false;
  var srcFilter        = {};
  var logTimer         = null;
  var kwDebounceTimer  = null;
  var minReviews       = 0;
  var minRating        = 0;
  var snapOnly         = false;
  var fsaHsaOnly       = false;
  var climatePledgeOnly= false;
  var smallBusinessOnly= false;
  var isLiquidDominant = false;
  var isWeightDominant = false;
  var unitPills        = [];
  var panelMoved       = false;
  var sortChanged      = false;
  var sortChangedTo    = null;
  var sessionSource    = 'search-only';

  function scheduleLog() {
    if(logTimer) clearTimeout(logTimer);
    logTimer=setTimeout(function(){doLog();},5000);
  }

  function doLog() {
    try {
      var withUnit=allData.filter(function(r){return r.ppu!=null;});
      var unitCounts={};
      withUnit.forEach(function(r){if(r.unit)unitCounts[r.unit]=(unitCounts[r.unit]||0)+1;});
      var unitsFound=Object.keys(unitCounts).sort(function(a,b){return unitCounts[b]-unitCounts[a];}).map(function(u){return u+'('+unitCounts[u]+')';}).join(', ');
      var sourceCounts={};
      allData.forEach(function(r){var k=r.retailer?r.retailer.key:'standard';sourceCounts[k]=(sourceCounts[k]||0)+1;});
      var countStandard=sourceCounts['standard']||0;
      var countFresh=sourceCounts['fresh']||0;
      var countWF=sourceCounts['whole-foods']||0;
      var countPharmacy=sourceCounts['pharmacy']||0;
      var retailerSources=Object.keys(sourceCounts).join(', ');
      var couponCount=allData.filter(function(r){return r.hasCoupon;}).length;
      var snsCount=allData.filter(function(r){return r.sns;}).length;
      var couponPillItems=allData.filter(function(r){return r.couponPillOnly;});
      var couponPillCount=couponPillItems.length;
      var couponUndetectedCount=couponPillCount;
      var couponUndetectedAsins=couponPillItems.map(function(r){return r.asin;}).join(',');
      var sponsoredCount=allData.filter(function(r){return r.isSponsored;}).length;
      var shortlistCount=Object.keys(checkedAsins).length;
      var ua='';try{ua=navigator.userAgent||'';}catch(e){}
      sendLog({
        totalResults:allData.length,withUnitData:withUnit.length,
        withoutUnitData:allData.length-withUnit.length,unitsFound,
        sortMethod:sortVal,keywordFilterActive:keyword.trim().length>0,
        keywordFilter:keyword.trim()||'',
        pagesLoaded:loadedPages,retailerSources,
        countStandard,countFresh,countWholeFoods:countWF,countPharmacy,
        liquidDominant:isLiquidDominant,selectedUnit:selectedUnit||'as-listed',
        couponCount,snsCount,couponPillCount,couponUndetectedCount,
        couponUndetectedAsins,sponsoredCount,hideSponsoredActive:sponsoredMode,
        shortlistCount,minReviewsFilter:minReviews||0,minRatingFilter:minRating||0,
        panelMoved,sortChanged,sortChangedTo:sortChangedTo||'',
        sessionSource,userAgent:ua
      });
    } catch(e){}
  }

  function updateSponsoredBtn(btn, mode) {
    btn.classList.remove('mode-demote','mode-hide');
    if (mode === 'show')        { btn.textContent = 'Move ads to end of results'; }
    else if (mode === 'demote') { btn.textContent = '\u2713 Moved \u00b7 Hide ads'; btn.classList.add('mode-demote'); }
    else                        { btn.textContent = '\u2713 Hidden \u00b7 Show ads'; btn.classList.add('mode-hide'); }
  }

  function updateLoadMoreRow() {
    var lmRow = document.getElementById('ppu-load-more-row');
    var lmBtn = document.getElementById('ppu-btn-load-more');
    if (!lmRow) return;
    if (nextPageUrl) {
      lmRow.style.display = '';
      if (lmBtn) lmBtn.textContent = '\u2193 Load page '+(loadedPages+1)+' results';
    } else {
      lmRow.style.display = 'none';
    }
    var pagesSlider = document.getElementById('ppu-pages-slider');
    var labelEl = document.getElementById('ppu-pages-label');
    if (pagesSlider) {
      pagesSlider.disabled = !nextPageUrl;
      pagesSlider.value = loadedPages;
      var pct = ((loadedPages - 1) / 9) * 100;
      pagesSlider.style.setProperty('--fill', pct + '%');
      pagesSlider.classList.toggle('active', loadedPages > 1);
      if (labelEl) labelEl.innerHTML = nextPageUrl ? 'Pages to load: <em>' + loadedPages + '</em>' : 'No more pages available';
      var warnEl = document.getElementById('ppu-pages-warning');
      if (warnEl) warnEl.style.display = loadedPages >= 7 ? 'block' : 'none';
    } else {
      if (labelEl) labelEl.innerHTML = nextPageUrl ? 'Pages to load: <em>1</em>' : 'No more pages available';
    }
  }

  // ── Build panel ───────────────────────────────────────────────────────────
  function buildPanel() {
    injectStyles();
    var cards=document.querySelectorAll('[data-component-type="s-search-result"]');
    if(!cards.length){console.log('[PPU] No result cards found.');return;}

    try {

    var seenAsins={},idx=0;
    allData=Array.from(cards).reduce(function(acc,c){
      if(c.offsetParent===null) return acc;
      var row=scrapeCard(c,1,idx++);
      if(row.asin&&seenAsins[row.asin]) row.isDuplicate=true;
      if(row.asin) seenAsins[row.asin]=true;
      acc.push(row); return acc;
    },[]);
    loadedPages=1; nextPageUrl=getNextPageUrl(); needsResort=false;

    var searchTerm=(new URLSearchParams(window.location.search).get('k')||'').trim();
    saveSearchContext(searchTerm, window.location.href, allData.map(function(r){
      return {asin:r.asin,title:r.title,price:r.price?'$'+r.price.toFixed(2):'',ppu:r.ppu?formatPPU(r.ppu):'',ppuUnit:r.unit||''};
    }));

    // ── Restore filters for this search term ──────────────────────────────
    var savedFilters = null;
    try {
      var fkey = getFilterStorageKey(searchTerm);
      var fraw = sessionStorage.getItem(fkey);
      if (fraw) savedFilters = JSON.parse(fraw);
    } catch(e) {}

    if (savedFilters) {
      keyword       = savedFilters.keyword       || '';
      sortVal       = savedFilters.sortVal       || 'ppu-asc';
      minReviews    = savedFilters.minReviews    || 0;
      minRating     = savedFilters.minRating     || 0;
      minPrice      = savedFilters.minPrice      || '';
      maxPrice      = savedFilters.maxPrice      || '';
      sponsoredMode = savedFilters.sponsoredMode || 'show';
      selectedUnit  = savedFilters.selectedUnit  || null;
      // srcFilter restored after detectedRetailers is built below
    } else {
      // Fresh search — reset all filters
      keyword       = '';
      sortVal       = 'ppu-asc';
      minReviews    = 0;
      minRating     = 0;
      minPrice      = '';
      maxPrice      = '';
      sponsoredMode = 'show';
      selectedUnit  = null;
    }

    isLiquidDominant=inferLiquidDominant(allData);
    if(isLiquidDominant) applyLiquidCtConversion(allData);
    isLiquidDominant=inferLiquidDominant(allData);
    isWeightDominant=inferWeightDominant(allData);
    unitPills=generateUnitPills(allData,isLiquidDominant,isWeightDominant);

    var detectedRetailers = {};
    allData.forEach(function(r) {
      var k = r.retailer ? r.retailer.key : 'standard';
      var l = r.retailer ? r.retailer.label : 'Amazon';
      if(!detectedRetailers[k]) detectedRetailers[k] = l;
    });

    // Restore srcFilter from saved state, or initialise fresh
    if (savedFilters && savedFilters.srcFilter) {
      srcFilter = {};
      Object.keys(detectedRetailers).forEach(function(k) {
        srcFilter[k] = (savedFilters.srcFilter[k] !== undefined) ? savedFilters.srcFilter[k] : true;
      });
    } else {
      Object.keys(detectedRetailers).forEach(function(k) { if(!(k in srcFilter)) srcFilter[k] = true; });
      Object.keys(srcFilter).forEach(function(k) { if(!(k in detectedRetailers)) delete srcFilter[k]; });
    }

    var hasNonStandard = Object.keys(detectedRetailers).some(function(k){ return k !== 'standard'; });
    var hasSnap = allData.some(function(r){ return !!r.isSnap; });
    var hasFsaHsa = allData.some(function(r){ return !!r.isFsaHsa; });
    var hasClimatePledge = allData.some(function(r){ return !!r.isClimatePledge; });
    var hasSmallBusiness = allData.some(function(r){ return !!r.isSmallBusiness; });
    var hasWholeFoods=allData.some(function(r){return r.retailer&&r.retailer.key==='whole-foods';});
    var hasSponsored=allData.some(function(r){return r.isSponsored;});
    var hasPills=unitPills.length>1;

    sessionSource = 'search-only';
    chrome.runtime.sendMessage({type:'AU_GET_SEARCH_CONTEXT'}, function(ctx) {
      if(ctx && ctx.payload && ctx.payload.items && ctx.payload.items.length > 0) sessionSource = 'from-product';
    });

    if(selectedUnit!==null&&!unitPills.some(function(p){return p.unit===selectedUnit;})) selectedUnit=null;

    var existing=document.getElementById(PANEL_ID);
    if(existing) existing.remove();

    var panel=document.createElement('div');
    panel.id=PANEL_ID;
    if(isCollapsed) panel.classList.add('collapsed');
    panel.style.position='fixed';

    var pillHtml='';
    if(hasPills){
      pillHtml='<div id="ppu-unit-pill-row"><span class="pill-label">Per:</span>';
      unitPills.forEach(function(p){
        var isActive=(p.unit===selectedUnit);
        var cls='ppu-unit-pill'+(isActive?' active':(!isActive&&p.isRecommended?' recommended':''));
        pillHtml+='<span class="'+cls+'" data-unit="'+(p.unit||'')+'">'+p.label+'</span>';
      });
      pillHtml+='</div>';
    }

    var sortOpen    = true;
    var filtersOpen = true;

    panel.innerHTML=
      '<div id="ppu-drag-handle"></div>'+
      '<div id="ppu-bottom-handle"></div>'+
      '<div id="ppu-controls-wrap">'+
        '<div id="ppu-header">'+
          '<div id="ppu-header-brand">'+
            '<span id="ppu-header-mark">AU</span>'+
            '<h3>Actually Useful</h3>'+
          '</div>'+
          '<div id="ppu-header-btns">'+
            '<a id="ppu-help" href="https://actuallyuseful.net" target="_blank" title="Help &amp; instructions">?</a>'+
            '<button id="ppu-collapse" title="Collapse/expand">\u2195</button>'+
            '<button id="ppu-close" title="Close">\u00d7</button>'+
          '</div>'+
        '</div>'+
        (localStorage.getItem('au-banner-dismissed')==='1' ? '' :
        '<div id="ppu-workflow-banner">'+
          '<div id="ppu-workflow-banner-dot"></div>'+
          '<div id="ppu-workflow-banner-text">'+
            '<strong>New here?</strong> Set Amazon\u2019s filters first, then load more pages, then sort &amp; filter here.'+
            '&ensp;<a href="https://actuallyuseful.net" target="_blank" id="ppu-workflow-learn">Learn more \u2197</a>'+
          '</div>'+
          '<button id="ppu-workflow-dismiss" title="Dismiss">\u00d7</button>'+
        '</div>')+
        '<div id="ppu-filter-row">'+
          '<div class="ppu-kw-wrap">'+
            '<input id="ppu-keyword" type="text" placeholder="Keyword filter \u00b7 e.g. organic -refill" value="'+keyword.replace(/"/g,'&quot;')+'">'+
            '<button id="ppu-btn-clear-kw" title="Clear">\u00d7</button>'+
          '</div>'+
          '<button id="ppu-btn-reset-filters" class="ppu-btn" title="Clears all filters, sorting, and returns to page 1 results.">Clear all</button>'+
        '</div>'+
        pillHtml+
        '<div class="ppu-section-divider ppu-collapsible-toggle" id="ppu-sort-toggle" data-target="ppu-sort-collapsible">'+
          '<span>Sort <span id="ppu-sort-label-text"></span><span class="ppu-chevron"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span></span>'+
        '</div>'+
        '<div id="ppu-sort-collapsible" class="ppu-collapsible-section">'+
          '<div id="ppu-controls">'+
            '<select id="ppu-sort" class="ppu-sort-select" title="Sort products by different criteria">'+
              '<option value="ppu-asc">Best value \u2191</option>'+
              '<option value="price-asc">Price low\u2192high</option>'+
              '<option value="delivery-free">Soonest FREE delivery</option>'+
              '<option value="delivery-any">Soonest ANY delivery</option>'+
              '<option value="default">As shown in Amazon results</option>'+
            '</select>'+
            '<button id="ppu-btn-hide-sponsored" class="ppu-btn" title="Control how sponsored products appear in results">Move ads to end of results</button>'+
          '</div>'+
          '<div id="ppu-pages-row">'+
            '<span id="ppu-pages-label">'+(nextPageUrl?'Pages: <b>1</b>':'No more pages available')+'</span>'+
            '<div class="ppu-slider-wrap">'+
              '<span class="ppu-slider-startlabel">1</span>'+
              '<div class="ppu-slider-track-wrap">'+
                '<input id="ppu-pages-slider" type="range" class="ppu-slider" min="1" max="7" step="1" value="1"'+(nextPageUrl?'':' disabled')+'>'+
                '<div class="ppu-slider-ticks">'+
                  '<span class="major"></span><span class="minor"></span><span class="minor"></span><span class="major"></span><span class="minor"></span><span class="minor"></span><span class="major"></span>'+
                '</div>'+
              '</div>'+
              '<span class="ppu-slider-endlabel">7</span>'+
            '</div>'+
            '<span id="ppu-pages-status"></span>'+
            '<button id="ppu-btn-refresh" class="ppu-btn" style="margin-left:6px;flex-shrink:0;" title="Re-syncs with the Amazon page. Use this if you changed Amazon\u2019s filters or categories. Extra pages loaded will be lost.">\u21ba Re-sync</button>'+
          '</div>'+
          '<div id="ppu-pages-warning" style="margin:0 14px 6px;display:none;">\u26a0\ufe0f Amazon sometimes limits results beyond 7 pages, and those results may be less relevant to your search.</div>'+
        '</div>'+
        '<div class="ppu-section-divider ppu-collapsible-toggle" id="ppu-filters-toggle" data-target="ppu-filters-collapsible">'+
          '<span>Filters <span id="ppu-filters-count" style="display:none"></span><span class="ppu-chevron"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span></span>'+
        '</div>'+
        '<div id="ppu-filters-collapsible" class="ppu-collapsible-section">'+
          '<div id="ppu-sliders-row">'+
            '<div class="ppu-slider-half">'+
              '<span class="ppu-slider-label" title="Hide products with fewer reviews">Minimum reviews: <em id="ppu-min-reviews-val">'+(minReviews||0)+'</em></span>'+
              '<div class="ppu-slider-wrap">'+
                '<span class="ppu-slider-startlabel">0</span>'+
                '<div class="ppu-slider-track-wrap">'+
                  '<input id="ppu-min-reviews-slider" type="range" class="ppu-slider" min="0" max="1000" step="100" value="'+(minReviews||0)+'">'+
                  '<div class="ppu-slider-ticks">'+
                    '<span class="major"></span><span class="minor"></span><span class="major"></span><span class="minor"></span><span class="major"></span>'+
                    '<span class="minor"></span><span class="major"></span><span class="minor"></span><span class="major"></span><span class="minor"></span><span class="major"></span>'+
                  '</div>'+
                '</div>'+
                '<span class="ppu-slider-endlabel">1000</span>'+
              '</div>'+
            '</div>'+
            '<div class="ppu-slider-half">'+
              '<span class="ppu-slider-label" title="Hide products below this star rating">Minimum rating: <em id="ppu-min-rating-val">'+(minRating>0?(minRating+'\u2605'):'Any')+'</em></span>'+
              '<div class="ppu-slider-wrap">'+
                '<span class="ppu-slider-startlabel">0</span>'+
                '<div class="ppu-slider-track-wrap">'+
                  '<input id="ppu-min-rating-slider" type="range" class="ppu-slider" min="0" max="5" step="0.5" value="'+(minRating||0)+'">'+
                  '<div class="ppu-slider-ticks">'+
                    '<span class="major"></span><span class="minor"></span><span class="major"></span><span class="minor"></span><span class="major"></span>'+
                    '<span class="minor"></span><span class="major"></span><span class="minor"></span><span class="major"></span><span class="minor"></span><span class="major"></span>'+
                  '</div>'+
                '</div>'+
                '<span class="ppu-slider-endlabel">5\u2605</span>'+
              '</div>'+
            '</div>'+
          '</div>'+
          '<div id="ppu-price-range-row">'+
            '<span class="ppu-slider-label" title="Filter products by price range">Price: </span>'+
            '<span class="ppu-price-prefix">$</span><input id="ppu-min-price" type="number" class="ppu-price-input" min="0" placeholder="min" value="'+(minPrice||'')+'">'+
            '<span class="ppu-price-sep">\u2013</span>'+
            '<span class="ppu-price-prefix">$</span><input id="ppu-max-price" type="number" class="ppu-price-input" min="0" placeholder="max" value="'+(maxPrice||'')+'">'+
          '</div>'+
          ((hasSnap||hasFsaHsa||hasClimatePledge||hasSmallBusiness)?
            '<div id="ppu-badge-filter-row">'+
              (hasSnap?'<label class="ppu-badge-label"><input type="checkbox" id="ppu-snap-only"'+(snapOnly?' checked':'')+'>SNAP EBT eligible only</label>':'')+
              (hasFsaHsa?'<label class="ppu-badge-label"><input type="checkbox" id="ppu-fsa-only"'+(fsaHsaOnly?' checked':'')+'>FSA or HSA eligible only</label>':'')+
              (hasClimatePledge?'<label class="ppu-badge-label"><input type="checkbox" id="ppu-climate-only"'+(climatePledgeOnly?' checked':'')+'>Climate Pledge Friendly only</label>':'')+
              (hasSmallBusiness?'<label class="ppu-badge-label"><input type="checkbox" id="ppu-sb-only"'+(smallBusinessOnly?' checked':'')+'>Small Business only</label>':'')+
            '</div>':'')+
          (hasNonStandard?
            '<div id="ppu-source-row">'+
              '<span class="label">Sources:</span>'+
              Object.keys(detectedRetailers).map(function(k){
                var label=detectedRetailers[k];
                var cls='ppu-source-toggle'+
                  (k==='standard'?' src-standard':k==='fresh'?' src-fresh':k==='whole-foods'?' src-wf':k==='pharmacy'?' src-pharmacy':' src-partner')+
                  (!srcFilter[k]?' off':'');
                return '<span class="'+cls+'" data-src="'+k+'">'+label+'</span>';
              }).join('')+
            '</div>':'')+
        '</div>'+
      '<div id="ppu-dec-bar">'+
        '<span class="ppu-dc-none">No filters or custom sort applied</span>'+
      '</div>'+
      '</div>'+
      '<div id="ppu-scroll-area">'+
        '<div id="ppu-shortlist-bar">'+
          '<div id="ppu-select-all-wrap">'+
            '<span id="ppu-select-all-box"></span>'+
            '<button id="ppu-select-all-arrow" title="Selection options">&#9660;</button>'+
            '<div id="ppu-select-all-menu">'+
              '<div class="ppu-select-menu-item" data-action="all">All</div>'+
              '<div class="ppu-select-menu-item" data-action="none">None</div>'+
            '</div>'+
          '</div>'+
          '<span id="ppu-compare-hint"><span id="ppu-compare-main">Check items to compare</span><span id="ppu-compare-sub" style="display:block;font-size:10px;color:#9ca3af;margin-top:1px;font-weight:400;">Click for the full comparison table, more filters, and to save &amp; share your results</span></span>'+
          '<button id="ppu-btn-compare" class="ppu-btn ppu-btn-primary" title="View side-by-side comparison table">Compare</button>'+
        '</div>'+
        '<div id="ppu-list"></div>'+
        '<div id="ppu-load-more-row" style="'+(nextPageUrl?'':'display:none')+'">'+
          '<button id="ppu-btn-load-more">\u2193 Load page '+(loadedPages+1)+' results</button>'+
        '</div>'+
      '</div>'+
      '<div id="ppu-wf-note" style="display:none">\u26a0\ufe0f Whole Foods delivery is not included in your Prime membership. Free pickup or $9.95 delivery.</div>'+
      '<div id="ppu-mixed-units-banner" style="display:none"><span class="ppu-mixed-msg"></span><button class="ppu-mixed-dismiss" title="Dismiss">\u00d7</button></div>'+
      '<div id="ppu-footer-row">'+
        '<div id="ppu-sort-note"></div>'+
        '<div id="ppu-info"></div>'+
        '<div id="ppu-footer-links">'+
          '<a id="ppu-feedback" href="' + auFeedbackUrl() + '" target="_blank">Give feedback</a>'+
          '<a id="ppu-coffee" href="https://ko-fi.com/butactuallyuseful" target="_blank">Buy me a coffee</a>'+
        '</div>'+
      '</div>';

    document.body.appendChild(panel);

    // Inject styles for elements added in v0.6.1.15 (price range, notes, price-hidden)
    // These belong in styles.css but are injected here to avoid a separate file upload
    if (!document.getElementById('ppu-extra-styles')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'ppu-extra-styles';
      styleEl.textContent =
        '.price-hidden{display:none!important}' +
        '#ppu-price-range-row{display:flex;align-items:center;gap:6px;padding:4px 14px 6px;flex-wrap:wrap;}' +
        '.ppu-price-input{width:72px;padding:3px 6px;border:1px solid #c8c0e8;border-radius:4px;font-size:13px;background:#fff;color:#351E45;}' +
        '.ppu-price-prefix{font-size:13px;color:#351E45;}' +
        '.ppu-price-sep{font-size:13px;color:#877891;margin:0 2px;}' +
        '.ppu-note-widget{margin-top:5px;}' +
        '.ppu-note-add-link{font-size:11px;color:#877891;cursor:pointer;text-decoration:none;user-select:none;}' +
        '.ppu-note-add-link:hover{color:#CF6DFC;}' +
        '.ppu-note-preview{font-size:11px;color:#351E45;font-style:italic;margin-right:6px;word-break:break-word;}' +
        '.ppu-note-edit-link{font-size:11px;color:#877891;cursor:pointer;text-decoration:none;user-select:none;white-space:nowrap;}' +
        '.ppu-note-edit-link:hover{color:#CF6DFC;}' +
        '.ppu-item-note{display:block;width:100%;margin-top:4px;padding:4px 6px;border:1px solid #c8c0e8;border-radius:4px;font-size:12px;font-family:inherit;resize:vertical;color:#351E45;background:#fff;min-height:38px;box-sizing:border-box;}' +
        '.ppu-item-note:focus{outline:none;border-color:#CF6DFC;}' +
        '.snap-hidden{display:none!important}' +
        '.ppu-note-snap{color:#0a7c3e;}' +
        '.ppu-note-fsa{color:#1558b0;}' +
        '.ppu-note-climate{color:#2d6a4f;}' +
        '.ppu-note-sb{color:#c45500;}' +
        '#ppu-badge-filter-row{display:flex;flex-wrap:wrap;gap:5px;padding:4px 12px 8px;}' +
        '.ppu-badge-label{font-size:11px;font-weight:500;padding:4px 10px;border-radius:6px;border:1px solid #e5e5ea;background:#f9f9fc;color:#6b7280;cursor:pointer;user-select:none;display:inline-flex;align-items:center;gap:0;transition:all .12s;}' +
        '.ppu-badge-label input[type=checkbox]{display:none;}' +
        '.ppu-badge-label:hover{border-color:#d4d4d8;color:#3f3f46;background:#f3f3f6;}' +
        '.ppu-badge-label:has(input:checked){background:#eef2ff;border-color:#c7d2fe;color:#3730a3;font-weight:600;}' +
        '#ppu-mixed-units-banner{display:none;padding:7px 12px 7px 14px;background:#f5f3ff;border-left:3px solid #7b76e5;font-size:11px;color:#4a3f7a;line-height:1.5;display:flex;align-items:flex-start;gap:8px;}' +
        '.ppu-mixed-msg{flex:1;user-select:text;cursor:text;}' +
        '.ppu-mixed-dismiss{flex-shrink:0;background:none;border:none;font-size:14px;color:#877891;cursor:pointer;padding:0;line-height:1;}';
      document.head.appendChild(styleEl);
    }

    // ── Position panel ────────────────────────────────────────────────────
    var DEFAULT_WIDTH  = 390;
    var DEFAULT_HEIGHT = null; // null = natural height (max-height from CSS)
    var DEFAULT_TOP    = 80;
    var MIN_HEIGHT     = 200;

    function applyPosition(top, left, width, height) {
      panel.style.top   = top   + 'px';
      panel.style.left  = left  + 'px';
      panel.style.width = width + 'px';
      if (height) {
        panel.style.maxHeight = height + 'px';
        panel.style.height    = height + 'px';
      }
    }

    function defaultLeft() { return window.innerWidth - DEFAULT_WIDTH - 16; }

    chrome.storage.local.get('au_search_panel_pos', function(result) {
      var pos = result['au_search_panel_pos'];
      if (pos && typeof pos.top === 'number' && typeof pos.left === 'number' && typeof pos.width === 'number') {
        applyPosition(pos.top, pos.left, pos.width, pos.height || null);
      } else {
        applyPosition(DEFAULT_TOP, defaultLeft(), DEFAULT_WIDTH, null);
      }
    });

    // ── Drag to move (header) ─────────────────────────────────────────────
    var header = document.getElementById('ppu-header');
    if (header) {
      var isDragMove = false, moveStartX, moveStartY, moveStartLeft, moveStartTop;
      header.addEventListener('mousedown', function(e) {
        if (e.target.closest('button,a')) return;
        isDragMove = true;
        var rect = panel.getBoundingClientRect();
        moveStartX=e.clientX; moveStartY=e.clientY; moveStartLeft=rect.left; moveStartTop=rect.top;
        document.body.style.userSelect = 'none';
        e.preventDefault();
      });
      document.addEventListener('mousemove', function(e) {
        if (!isDragMove) return;
        var newLeft = Math.max(-panel.offsetWidth + 60, Math.min(moveStartLeft + (e.clientX - moveStartX), window.innerWidth - 60));
        var newTop  = Math.max(0, Math.min(moveStartTop + (e.clientY - moveStartY), window.innerHeight - 40));
        panel.style.left = newLeft + 'px';
        panel.style.top  = newTop  + 'px';
      });
      document.addEventListener('mouseup', function(e) {
        if (!isDragMove) return;
        isDragMove = false; panelMoved = true; document.body.style.userSelect = '';
        var rect = panel.getBoundingClientRect();
        var curHeight = panel.style.height ? panel.offsetHeight : null;
        chrome.storage.local.set({ 'au_search_panel_pos': { top: rect.top, left: rect.left, width: panel.offsetWidth, height: curHeight } });
      });
    }

    // ── Drag to resize (left edge handle) ────────────────────────────────
    var dh = document.getElementById('ppu-drag-handle');
    if (dh) {
      var isDragResize = false, fixedRight;
      dh.addEventListener('mousedown', function(e) {
        isDragResize = true;
        fixedRight = panel.getBoundingClientRect().right;
        document.body.style.userSelect = 'none';
        e.preventDefault();
      });
      document.addEventListener('mousemove', function(e) {
        if (!isDragResize) return;
        var newWidth = Math.min(900, Math.max(280, fixedRight - e.clientX));
        panel.style.width = newWidth + 'px';
        panel.style.left  = (fixedRight - newWidth) + 'px';
      });
      document.addEventListener('mouseup', function() {
        if (!isDragResize) return;
        isDragResize = false; document.body.style.userSelect = '';
        var rect = panel.getBoundingClientRect();
        var curHeight = panel.style.height ? panel.offsetHeight : null;
        chrome.storage.local.set({ 'au_search_panel_pos': { top: rect.top, left: rect.left, width: panel.offsetWidth, height: curHeight } });
      });
    }

    // ── Drag to resize (bottom edge handle — height) ──────────────────────
    var bh = document.getElementById('ppu-bottom-handle');
    if (bh) {
      var isDragBottom = false, fixedTop, startHeight;
      bh.addEventListener('mousedown', function(e) {
        isDragBottom = true;
        fixedTop = panel.getBoundingClientRect().top;
        startHeight = panel.offsetHeight;
        document.body.style.userSelect = 'none';
        e.preventDefault();
      });
      document.addEventListener('mousemove', function(e) {
        if (!isDragBottom) return;
        var newHeight = Math.min(window.innerHeight - fixedTop - 10, Math.max(MIN_HEIGHT, e.clientY - fixedTop));
        panel.style.height    = newHeight + 'px';
        panel.style.maxHeight = newHeight + 'px';
      });
      document.addEventListener('mouseup', function() {
        if (!isDragBottom) return;
        isDragBottom = false; document.body.style.userSelect = '';
        var rect = panel.getBoundingClientRect();
        chrome.storage.local.set({ 'au_search_panel_pos': { top: rect.top, left: rect.left, width: panel.offsetWidth, height: panel.offsetHeight } });
      });
    }

    var sortEl=document.getElementById('ppu-sort'); sortEl.value=sortVal;
    var kwInput=document.getElementById('ppu-keyword');
    var clearKw=document.getElementById('ppu-btn-clear-kw');
    var hideSponsoredBtn=document.getElementById('ppu-btn-hide-sponsored');
    var resetFiltersBtn=document.getElementById('ppu-btn-reset-filters');
    var minReviewsSlider=document.getElementById('ppu-min-reviews-slider');
    var minRatingSlider=document.getElementById('ppu-min-rating-slider');
    var pagesSlider=document.getElementById('ppu-pages-slider');
    var shortlistBar=document.getElementById('ppu-shortlist-bar');
    var selectAllBox=document.getElementById('ppu-select-all-box');
    var selectAllArrow=document.getElementById('ppu-select-all-arrow');
    var selectAllMenu=document.getElementById('ppu-select-all-menu');
    var compareBtn=document.getElementById('ppu-btn-compare');
    var compareHint=document.getElementById('ppu-compare-hint');

    if(keyword){kwInput.classList.add('active');clearKw.style.display='flex';}
    updateSliderFill(minReviewsSlider,0,1000);
    updateSliderFill(minRatingSlider,0,5);
    if(hasSponsored){
      hideSponsoredBtn.style.display='block';
      updateSponsoredBtn(hideSponsoredBtn,sponsoredMode);
    }

    // ── Helper: save filters ──────────────────────────────────────────────
    function persistFilters() {
      saveFilters(searchTerm);
    }

    // ── Note widget helper ───────────────────────────────────────────────
    function auShowNoteTextarea(widget, asin) {
      widget.innerHTML = '';
      var ta = document.createElement('textarea');
      ta.className = 'ppu-item-note';
      ta.setAttribute('data-asin', asin);
      ta.placeholder = 'Add a note…';
      ta.rows = 2;
      ta.value = itemNotes[asin] || '';
      ta.addEventListener('input', function() { itemNotes[asin] = ta.value; });
      ta.addEventListener('click', function(e) { e.stopPropagation(); });
      ta.addEventListener('blur', function() {
        itemNotes[asin] = ta.value;
        auRefreshNoteWidget(widget, asin);
      });
      widget.appendChild(ta);
      ta.focus();
    }

    function auRefreshNoteWidget(widget, asin) {
      var note = itemNotes[asin] || '';
      widget.innerHTML = '';
      if (note) {
        var preview = note.length > 80 ? note.slice(0, 80) + '…' : note;
        var previewSpan = document.createElement('span');
        previewSpan.className = 'ppu-note-preview';
        previewSpan.textContent = preview;
        var editLink = document.createElement('span');
        editLink.className = 'ppu-note-edit-link';
        editLink.textContent = 'Edit';
        editLink.addEventListener('click', function(e) { e.stopPropagation(); auShowNoteTextarea(widget, asin); });
        widget.appendChild(previewSpan);
        widget.appendChild(editLink);
      } else {
        var addLink = document.createElement('span');
        addLink.className = 'ppu-note-add-link';
        addLink.textContent = '＋ Add a note…';
        addLink.addEventListener('click', function(e) { e.stopPropagation(); auShowNoteTextarea(widget, asin); });
        widget.appendChild(addLink);
      }
    }

    function auInjectNoteWidget(row, asin) {
      var widget = document.createElement('div');
      widget.className = 'ppu-note-widget';
      auRefreshNoteWidget(widget, asin);
      row.querySelector('.ppu-row-content').appendChild(widget);
    }

    // ── Render ────────────────────────────────────────────────────────────
    function render() {
      sortVal=sortEl.value;
      var kw=kwInput.value;
      var cc=Object.keys(checkedAsins).length;
      var allAsins=allData.map(function(r){return r.asin;});
      var checkedCount=allAsins.filter(function(a){return checkedAsins[a];}).length;
      if(selectAllBox){
        selectAllBox.textContent = checkedCount===0 ? '' : checkedCount===allAsins.length ? '\u2713' : '\u2013';
        selectAllBox.className = 'ppu-select-box'+(checkedCount===0?' empty': checkedCount===allAsins.length?' checked':' indeterminate');
      }

      if(compareBtn){ compareBtn.textContent=cc>0?'Compare ('+cc+')':'Compare'; }
      if(compareHint){ compareHint.style.display='block'; }
      if(shortlistBar){ shortlistBar.classList.toggle('active',cc>0); }
      var sortLabels={'ppu-asc':'best value','price-asc':'price','delivery-free':'soonest free delivery','delivery-any':'soonest delivery','default':'Amazon order'};

      var anyFilterActive = keyword.trim().length>0 || minReviews>0 || minRating>0 ||
        minPrice!=='' || maxPrice!=='' ||
        Object.keys(srcFilter).some(function(k){ return !srcFilter[k]; }) ||
        sortVal!=='ppu-asc' || sponsoredMode!=='show';
      resetFiltersBtn.classList.toggle('btn-danger',anyFilterActive);

      var unitDataAvail=allData.filter(function(r){return r.ppu!=null;}).length;
      var isSparse=sortVal==='ppu-asc'&&unitDataAvail<Math.ceil(allData.length*0.1);
      var effectiveSort=isSparse?'price-asc':sortVal;

      var displayData=allData.slice();
      var FAR=new Date(9999,0,1);

      function sortFn(a,b) {
        if(effectiveSort==='ppu-asc'){
          var aP=a.ppu!=null?normalizePPUForSort(a.ppu,a.unit,isLiquidDominant):null;
          var bP=b.ppu!=null?normalizePPUForSort(b.ppu,b.unit,isLiquidDominant):null;
          if(aP==null&&bP==null)return 0; if(aP==null)return 1; if(bP==null)return -1;
          var aF=unitFamilyForSort(a.unit,isLiquidDominant),bF=unitFamilyForSort(b.unit,isLiquidDominant);
          if(aF!==bF&&aF!==null&&bF!==null) return a.ppu-b.ppu;
          return aP-bP;
        }
        if(effectiveSort==='price-asc') return (a.price==null?Infinity:a.price)-(b.price==null?Infinity:b.price);
        if(effectiveSort==='delivery-free'){
          var aFree=a.wfFreeFlag?null:a.freeDate, bFree=b.wfFreeFlag?null:b.freeDate;
          var aFast=a.wfFreeFlag?null:a.fastDate, bFast=b.wfFreeFlag?null:b.fastDate;
          var av=aFree?0:(aFast?1:2),bv=bFree?0:(bFast?1:2);
          if(av!==bv)return av-bv;
          var dateDiff=(aFree||aFast||FAR)-(bFree||bFast||FAR);
          if(dateDiff!==0) return dateDiff;
          return (a.freeWindowMinutes||Infinity)-(b.freeWindowMinutes||Infinity);
        }
        if(effectiveSort==='delivery-any'){
          var aDates=[a.freeDate,a.fastDate,a.paidDate].filter(Boolean);
          var bDates=[b.freeDate,b.fastDate,b.paidDate].filter(Boolean);
          var da=aDates.length?new Date(Math.min.apply(null,aDates)):FAR;
          var db=bDates.length?new Date(Math.min.apply(null,bDates)):FAR;
          var dateDiffAny=da-db;
          if(dateDiffAny!==0) return dateDiffAny;
          return (a.freeWindowMinutes||Infinity)-(b.freeWindowMinutes||Infinity);
        }
        if(effectiveSort==='default') return a.originalIndex-b.originalIndex;
        return 0;
      }

      if(!needsResort){
        displayData.sort(sortFn);
      }

      var hasKw=kw.trim().length>0;
      displayData=displayData.map(function(r){return Object.assign({},r,{kwMatch:!hasKw||titleMatchesKeywords(r.title,r.cardText,kw)});});
      if(hasKw)
        displayData=displayData.filter(function(r){return r.kwMatch;}).concat(displayData.filter(function(r){return !r.kwMatch;}));

      var withData=allData.filter(function(r){return r.ppu!=null;}).length;
      var hiddenSrc=allData.filter(function(r){return !srcFilter[r.retailer?r.retailer.key:'standard'];}).length;
      var sponCount=allData.filter(function(r){return r.isSponsored;}).length;
      var revHiddenCt=minReviews>0?allData.filter(function(r){return r.reviewCount!=null&&r.reviewCount<minReviews;}).length:0;
      var ratingHiddenCt=minRating>0?allData.filter(function(r){return r.rating!=null&&r.rating<minRating;}).length:0;
      var minPriceF=minPrice!==''?parseFloat(minPrice):null;
      var maxPriceF=maxPrice!==''?parseFloat(maxPrice):null;
      var priceHiddenCt=(minPriceF!=null||maxPriceF!=null)?allData.filter(function(r){
        if(r.price==null)return false;
        if(minPriceF!=null&&r.price<minPriceF)return true;
        if(maxPriceF!=null&&r.price>maxPriceF)return true;
        return false;
      }).length:0;
      var matchCt=hasKw?displayData.filter(function(r){return r.kwMatch;}).length:null;
      var badgeFilterActive=snapOnly||fsaHsaOnly||climatePledgeOnly||smallBusinessOnly;
      var badgeHiddenCt=badgeFilterActive?allData.filter(function(r){
        return (snapOnly&&!r.isSnap)||(fsaHsaOnly&&!r.isFsaHsa)||
               (climatePledgeOnly&&!r.isClimatePledge)||(smallBusinessOnly&&!r.isSmallBusiness);
      }).length:0;
      var info=withData+'/'+allData.length+' have unit data';
      if(loadedPages>1){
        if(nextPageUrl) info+=' \u00b7 '+loadedPages+' pages';
        else            info+=' \u00b7 '+loadedPages+' pages loaded \u2014 no more available';
      }
      if(hasKw)                    info+=' \u00b7 \uD83D\uDD0D '+matchCt+' match filter';
      if(hiddenSrc>0)              info+=' \u00b7 '+hiddenSrc+' source-hidden';
      if(selectedUnit)             info+=' \u00b7 showing in '+selectedUnit;
      if(isLiquidDominant&&!selectedUnit) info+=' \u00b7 liquid category (oz\u2248fl oz)';
      if(isWeightDominant&&!selectedUnit) info+=' \u00b7 weight mix \u2014 click \u201coz\u201d to compare all items in the same unit';
      if(sponsoredMode==='demote'&&sponCount>0) info+=' \u00b7 '+sponCount+' ads demoted';
      if(sponsoredMode==='hide'&&sponCount>0)   info+=' \u00b7 '+sponCount+' ads hidden';
      if(revHiddenCt>0)            info+=' \u00b7 '+revHiddenCt+' below min reviews';
      if(ratingHiddenCt>0)         info+=' \u00b7 '+ratingHiddenCt+' below min rating';
      if(priceHiddenCt>0)          info+=' \u00b7 '+priceHiddenCt+' outside price range';
      if(badgeHiddenCt>0)          info+=' \u00b7 '+badgeHiddenCt+' hidden by badge filter';
      document.getElementById('ppu-info').textContent=info;

      var sortNoteEl=document.getElementById('ppu-sort-note');
      if(isSparse){sortNoteEl.style.display='block';sortNoteEl.textContent='Too few unit prices to sort by value \u2014 showing by price instead';}
      else sortNoteEl.style.display='none';

      var wfNoteEl=document.getElementById('ppu-wf-note');
      if(wfNoteEl){
        var isDeliverySort=effectiveSort==='delivery-free'||effectiveSort==='delivery-any';
        wfNoteEl.style.display=(hasWholeFoods&&isDeliverySort)?'block':'none';
      }

      // Mixed-units transparency banner: fires when any item had its unit overridden or
      // recalculated. Dismissible per search, logged for telemetry.
      var overriddenItems=allData.filter(function(r){return r.note&&(r.source==='calc'||r.source==='none');});
      var mixedBannerEl=document.getElementById('ppu-mixed-units-banner');
      if(mixedBannerEl){
        if(overriddenItems.length>0){
          mixedBannerEl.style.display='block';
          var mixedUnits=overriddenItems.map(function(r){return r.unit||'?';}).filter(function(u,i,a){return a.indexOf(u)===i;}).join(', ');
          var mixedMsg=mixedBannerEl.querySelector('.ppu-mixed-msg');
          if(mixedMsg) mixedMsg.textContent='This search has '+overriddenItems.length+' item'+(overriddenItems.length!==1?'s':'')+' where we had to interpret or recalculate the unit price. Units involved: '+mixedUnits+'. We show our working in each row \u2014 look for the \u2139 note. When in doubt, check the listing.';
        } else {
          mixedBannerEl.style.display='none';
        }
      }

      var COUNT_PILL_UNITS = ['ct','count','each','pc','piece','pieces','pcs','unit','units','pad','pads','sheet','sheets','wipe','wipes','tablet','tablets','capsule','cap','roll','bag'];
      function getCompPPU(r) {
        if(r.ppu==null) return null;
        if(selectedUnit){
          if(r.altPPU!=null && COUNT_PILL_UNITS.indexOf(selectedUnit)!==-1) return r.altPPU;
          var from=(isLiquidDominant&&r.unit==='oz')?'fl oz':r.unit;
          return convertPPU(r.ppu,from,selectedUnit);
        }
        return normalizePPUForSort(r.ppu,r.unit,isLiquidDominant);
      }

      var ppuVals=displayData.filter(function(r){
        return r.ppu!=null&&r.source!=='amazon-container'&&r.kwMatch&&srcFilter[r.retailer?r.retailer.key:'standard']&&
               !(sponsoredMode==='hide'&&r.isSponsored)&&
               !(minReviews>0&&r.reviewCount!=null&&r.reviewCount<minReviews)&&
               !(minRating>0&&r.rating!=null&&r.rating<minRating)&&
               !(minPriceF!=null&&r.price!=null&&r.price<minPriceF)&&
               !(maxPriceF!=null&&r.price!=null&&r.price>maxPriceF)&&
               getCompPPU(r)!=null;
      }).map(function(r){return getCompPPU(r);});
      var bestPPU=ppuVals.length?Math.min.apply(null,ppuVals):null;

      var html='',curPage=0;
      displayData.forEach(function(r){
        var srcHid=(r.retailer&&!srcFilter[r.retailer.key]);
        var sponHid=sponsoredMode==='hide'&&r.isSponsored;
        var sponDem=sponsoredMode==='demote'&&r.isSponsored;
        var revHid=minReviews>0&&r.reviewCount!=null&&r.reviewCount<minReviews;
        var ratingHid=minRating>0&&r.rating!=null&&r.rating<minRating;
        var priceHid=(minPriceF!=null&&r.price!=null&&r.price<minPriceF)||(maxPriceF!=null&&r.price!=null&&r.price>maxPriceF);
        var snapHid=snapOnly&&!r.isSnap;
        var fsaHid=fsaHsaOnly&&!r.isFsaHsa;
        var climateHid=climatePledgeOnly&&!r.isClimatePledge;
        var sbHid=smallBusinessOnly&&!r.isSmallBusiness;
        var priceStr=r.price!=null?'$'+r.price.toFixed(2):'\u2014';
        var countStr=r.count?r.count+' ct':'';
        var badge='',noteStr='',deliveryStr='',srcTag='';
        var isChecked=!!checkedAsins[r.asin];

        var rKey=r.retailer?r.retailer.key:'standard';
        var rLabel=r.retailer?r.retailer.label:'Amazon';
        if(rKey==='whole-foods')   srcTag='<span class="ppu-src-tag ppu-src-wf">'+rLabel+'</span><br>';
        else if(rKey==='fresh')    srcTag='<span class="ppu-src-tag ppu-src-fr">'+rLabel+'</span><br>';
        else if(rKey==='pharmacy') srcTag='<span class="ppu-src-tag ppu-src-rx">'+rLabel+'</span><br>';
        else if(rKey!=='standard') srcTag='<span class="ppu-src-tag ppu-src-pt">'+rLabel+'</span><br>';
        if(r.isSponsored) srcTag+='<span class="ppu-src-tag" style="background:#f0f0f0;color:#888;border:1px solid #ddd;">Ad</span><br>';
        if(r.isDuplicate) srcTag+='<span class="ppu-src-tag ppu-src-dup">Shown again by Amazon</span><br>';

        if(r.ppu!=null){
          var compPPU=getCompPPU(r);
          var isBest=bestPPU!=null&&r.kwMatch&&r.source!=='amazon-container'&&
            srcFilter[r.retailer?r.retailer.key:'standard']&&!sponHid&&!revHid&&!ratingHid&&!priceHid&&!snapHid&&!fsaHid&&!climateHid&&!sbHid&&
            compPPU!=null&&Math.abs(compPPU-bestPPU)<0.000001;
          var isCont=r.source==='amazon-container';
          var warn=isCont?' <span style="font-size:10px;color:#aaa;" title="Amazon is reporting the price per container (box/pack), not per item \u2014 actual per-item cost may differ">\u26a0\ufe0f price is per pack, not per item</span>':'';
          var dPPU=r.ppu,dUnit=r.unit,convNote='';
          if(selectedUnit){
            if(r.altPPU!=null && COUNT_PILL_UNITS.indexOf(selectedUnit)!==-1) {
              dPPU=r.altPPU;dUnit=r.altUnit||'ct';
              convNote='<span class="ppu-converted">('+formatPPU(r.ppu)+'/'+r.unit+')</span>';
            } else {
              var fromU=(isLiquidDominant&&r.unit==='oz')?'fl oz':r.unit;
              var conv=convertPPU(r.ppu,fromU,selectedUnit);
              if(conv!=null){
                dPPU=conv;dUnit=selectedUnit;
                if(r.unit!==selectedUnit) convNote='<span class="ppu-converted">('+formatPPU(r.ppu)+'/'+r.unit+')</span>';
              } else {
                convNote='<span class="ppu-converted" style="color:#e47911;">(\u00b7 can\'t convert to '+selectedUnit+')</span>';
              }
            }
          }
          var uDisp=dUnit?'/'+dUnit:'';
          badge='<span class="ppu-badge'+(isBest?' best':'')+(isCont?' container':'')+'"'+(isBest?' title="Best value among comparable results"':'')+'>'+formatPPU(dPPU)+uDisp+(isBest?' \u2605':'')+' </span>'+warn+convNote;
          if(r.note&&(r.source==='calc'||r.source==='calc-liquid')) noteStr='<div class="ppu-note">ℹ '+r.note+'</div>';
          else if(r.note&&r.source==='amazon') noteStr='<div class="ppu-note">ℹ '+r.note+'</div>';
        } else {
          badge = r.source==='unavailable' ? '<span class="ppu-nodata">unavailable</span>' : '<span class="ppu-nodata">no unit data</span>';
          if(r.note&&r.source==='none') noteStr='<div class="ppu-note">ℹ '+r.note+'</div>';
        }

        if(r.hasCoupon) noteStr+='<div class="ppu-note-deal">\uD83C\uDFF7\uFE0F $'+r.price.toFixed(2)+' with coupon <span class="ppu-note-was">(was $'+r.listPrice.toFixed(2)+')</span></div>';
        if(r.couponPillOnly) noteStr+='<div class="ppu-note-deal">\uD83C\uDFF7\uFE0F Coupon detected \u2014 check Amazon for details</div>';
        if(r.sns&&r.sns!=='unknown') noteStr+='<div class="ppu-note-deal ppu-note-sns">\uD83D\uDCE6 '+r.sns+' with Subscribe &amp; Save</div>';
        else if(r.sns==='unknown') noteStr+='<div class="ppu-note-deal ppu-note-sns">\uD83D\uDCE6 Subscribe &amp; Save available \u2014 check Amazon for amount</div>';
        if(r.savings) noteStr+='<div class="ppu-note-deal ppu-note-sns">\uD83C\uDF81 '+r.savings+'</div>';
        if(r.isSnap) noteStr+='<div class="ppu-note-deal ppu-note-snap">SNAP EBT eligible</div>';
        if(r.isFsaHsa) noteStr+='<div class="ppu-note-deal ppu-note-fsa">FSA or HSA eligible</div>';
        if(r.isClimatePledge) noteStr+='<div class="ppu-note-deal ppu-note-climate">Climate Pledge Friendly</div>';
        if(r.isSmallBusiness) noteStr+='<div class="ppu-note-deal ppu-note-sb">Small Business</div>';

        if(r.freeDate||r.fastDate||r.paidDate){
          var parts=[];
          if(r.freeDate){
            var fc=r.wfFreeFlag?'ppu-delivery wf-fee':'ppu-delivery';
            var ftParts=[formatDate(r.freeDate)];
            if(r.freeWindowMinutes!==Infinity) ftParts.push('<span style="font-size:12px;">'+formatWindowRange(r.freeWindowMinutes,r.freeWindowEnd)+'</span>');
            else if(r.freeCutoff) ftParts.push('<span style="font-size:12px;">'+r.freeCutoff+'</span>');
            if(r.freeQualifier) ftParts.push('<span style="font-size:12px;">'+r.freeQualifier+'</span>');
            var ft=ftParts.join(' <span style="font-size:12px;">·</span> ');
            if(r.wfFreeFlag){
              parts.push('<span class="'+fc+'">'+ft+' <span class="ppu-wf-inline">\u2014 Whole Foods delivery is not included in your Prime membership. Free pickup or $9.95 delivery.</span></span>');
            } else {
              parts.push('<span class="'+fc+'">FREE: '+ft+'</span>');
            }
          }
          if(r.fastDate){
            var fst=formatDate(r.fastDate)+(r.fastCutoff?' <span style="font-size:10px;color:#888;">('+r.fastCutoff+')</span>':'');
            parts.push('<span class="ppu-delivery fast">Fastest: '+fst+'</span>');
          }
          if(r.paidDate){
            var pst=r.paidCutoff||formatDate(r.paidDate);
            parts.push('<span class="ppu-delivery paid">'+r.paidPrice+': '+pst+'</span>');
          }
          deliveryStr='<div class="ppu-meta" style="margin-top:2px;">'+parts.join(' &nbsp; ')+'</div>';
        } else if(effectiveSort==='delivery-free'||effectiveSort==='delivery-any'){
          deliveryStr='<div class="ppu-meta ppu-no-delivery" style="margin-top:2px;">No delivery date found \u2014 check product page for details.</div>';
        }

        var ratingStr='';
        if(r.rating||r.reviewCount){
          var parts=[];
          if(r.rating) parts.push(r.rating+'\u2605');
          if(r.reviewCount) parts.push('('+r.reviewCount.toLocaleString()+' reviews)');
          ratingStr='<div class="ppu-meta ppu-rating-row">'+parts.join(' ')+'</div>';
        }

        var dimC=(!r.kwMatch&&hasKw)?' kw-mismatch':'';
        var srcC=srcHid?' src-hidden':'';
        var sponC=sponHid?' sponsored-hidden':(sponDem?' sponsored-demoted':'');
        var revC=revHid?' reviews-hidden':'';
        var ratingC=ratingHid?' rating-hidden':'';
        var priceC=priceHid?' price-hidden':'';
        var snapC=snapHid?' snap-hidden':'';
        var fsaC=fsaHid?' snap-hidden':'';
        var climateC=climateHid?' snap-hidden':'';
        var sbC=sbHid?' snap-hidden':'';
        var chkC=isChecked?' checked':'';
        var wfC=(r.wfFreeFlag&&effectiveSort==='delivery-free')?' wf-excluded':'';
        var safeAsin=r.asin.replace(/"/g,'&quot;');
        var titleHtml=(hasKw&&r.kwMatch)?highlightKeywords(r.title,r.cardText,kw):escapeHtml(r.title);
        var thumbHtml=r.imgUrl?'<img class="ppu-thumb" src="'+r.imgUrl+'" loading="lazy" alt="">':'';
        var noteFieldHtml='';
        if(isChecked){
          var existingNote=itemNotes[r.asin]||'';
          if(existingNote){
            var preview=existingNote.length>80?existingNote.slice(0,80)+'\u2026':existingNote;
            noteFieldHtml='<div class="ppu-note-widget"><span class="ppu-note-preview">'+escapeHtml(preview)+'</span><span class="ppu-note-edit-link" data-asin="'+safeAsin+'">Edit</span></div>';
          } else {
            noteFieldHtml='<div class="ppu-note-widget"><span class="ppu-note-add-link" data-asin="'+safeAsin+'">＋ Add a note…</span></div>';
          }
        }
        html+=
          '<div class="ppu-row'+dimC+srcC+sponC+revC+ratingC+priceC+snapC+fsaC+climateC+sbC+chkC+wfC+'" data-asin="'+safeAsin+'">'+
            '<div class="ppu-cb-wrap"><input type="checkbox" class="ppu-cb"'+(isChecked?' checked':'')+' title="Add to shortlist"></div>'+
            '<div class="ppu-thumb-wrap">'+thumbHtml+'</div>'+
            '<div class="ppu-row-content">'+
              '<a href="'+r.href+'" target="_blank" title="'+escapeHtml(r.title)+'">'+titleHtml+'</a>'+
              srcTag+
              '<div class="ppu-meta"><span class="ppu-price">'+priceStr+'</span>'+(countStr?'<span class="ppu-count">'+countStr+'</span>':'')+badge+'</div>'+
              deliveryStr+ratingStr+noteStr+
              noteFieldHtml+
            '</div>'+
          '</div>';
      });

      if(hasKw&&matchCt===0){html='<div class="ppu-empty-kw">No results match your keyword(s)</div>'+html;}
      document.getElementById('ppu-list').innerHTML=html;
      document.querySelectorAll('.ppu-cb').forEach(function(cb){
        cb.addEventListener('change',function(){
          var row=this.closest('.ppu-row'),asin=row.getAttribute('data-asin');
          if(this.checked){
            checkedAsins[asin]=true;
            row.classList.add('checked');
            // Inject note widget directly — no re-render needed
            if(!row.querySelector('.ppu-note-widget')){
              auInjectNoteWidget(row,asin);
            }
          } else{
            // Preserve note before removing textarea
            var ta=row.querySelector('.ppu-item-note');
            if(ta){itemNotes[asin]=ta.value;ta.parentNode.removeChild(ta);}
            delete checkedAsins[asin];
            row.classList.remove('checked');
          }
          var cnt=Object.keys(checkedAsins).length;
          var total=allData.length;
          if(selectAllBox){
            selectAllBox.textContent = cnt===0?'':cnt===total?'\u2713':'\u2013';
            selectAllBox.className = 'ppu-select-box'+(cnt===0?' empty':cnt===total?' checked':' indeterminate');
          }
          if(compareBtn){ compareBtn.textContent=cnt>0?'Compare ('+cnt+')':'Compare'; }
          if(compareHint){ compareHint.style.display='block'; }
          if(shortlistBar){ shortlistBar.classList.toggle('active',cnt>0); }
          updateActiveIndicators();
        });
      });
            scheduleLog();
      persistFilters();
      updateActiveIndicators();
    } // end render

    // ── Active state indicators ──────────────────────────────────────────
    function updateActiveIndicators() {
      // Filter count chip (shows when section is collapsed)
      var activeCount = 0;
      if (minReviews > 0) activeCount++;
      if (minRating > 0) activeCount++;
      if (minPrice) activeCount++;
      if (maxPrice) activeCount++;
      var filterCount = document.getElementById('ppu-filters-count');
      if (filterCount) {
        if (activeCount > 0) {
          filterCount.textContent = activeCount + ' active';
          filterCount.className = 'ppu-sec-chip ppu-sec-chip-amber';
          filterCount.style.display = 'inline-flex';
        } else {
          filterCount.style.display = 'none';
        }
      }
      // Sort chip (shows when section is collapsed)
      var sortLabel = document.getElementById('ppu-sort-label-text');
      if (sortLabel) {
        var sortChip = '';
        if (sortVal === 'ppu-asc')            sortChip = 'Best value \u2191';
        else if (sortVal === 'price-asc')     sortChip = 'Price \u2191';
        else if (sortVal === 'delivery-free') sortChip = 'Free delivery';
        else if (sortVal === 'delivery-any')  sortChip = 'Soonest delivery';
        sortLabel.textContent = sortChip;
        sortLabel.className = sortChip ? 'ppu-sec-chip ppu-sec-chip-indigo' : '';
      }
      // Active decisions bar
      var decBar = document.getElementById('ppu-dec-bar');
      if (decBar) {
        var chips = [];
        var sortNames = {'price-asc':'Price \u2191','delivery-free':'Free delivery','delivery-any':'Soonest delivery','default':'Amazon order'};
        if (sortVal !== 'ppu-asc') chips.push('<span class="ppu-dc ppu-dc-s">' + (sortNames[sortVal] || sortVal) + '</span>');
        if (keyword.trim()) chips.push('<span class="ppu-dc ppu-dc-k">\u201c' + keyword.trim().slice(0,20) + (keyword.trim().length > 20 ? '\u2026' : '\u201d') + '</span>');
        if (minReviews > 0) chips.push('<span class="ppu-dc ppu-dc-f">\u2265' + minReviews + ' reviews</span>');
        if (minRating > 0)  chips.push('<span class="ppu-dc ppu-dc-f">\u2265' + minRating + '\u2605</span>');
        if (minPrice || maxPrice) {
          var lo = minPrice ? '$' + parseFloat(minPrice).toFixed(0) : '';
          var hi = maxPrice ? '$' + parseFloat(maxPrice).toFixed(0) : '';
          chips.push('<span class="ppu-dc ppu-dc-p">' + (lo && hi ? lo + '\u2013' + hi : lo ? lo + '+' : '\u2264' + hi) + '</span>');
        }
        decBar.innerHTML = chips.length > 0 ? chips.join('') : '<span class="ppu-dc-none">No filters or custom sort applied</span>';
      }
    }

    // ── Helper: slider fill track ────────────────────────────────────────
    function updateSliderFill(el, min, max) {
      if (!el) return;
      var pct = ((parseFloat(el.value) - min) / (max - min)) * 100;
      var filled = pct.toFixed(1) + '%';
      el.style.background = 'linear-gradient(to right,#4f46e5 ' + filled + ',#e5e5ea ' + filled + ')';
    }
    function updatePagesSliderFill(el) { if (el) updateSliderFill(el, 1, 10); }
    function updatePagesLabel() {
      var labelEl = document.getElementById('ppu-pages-label');
      if (!labelEl || !pagesSlider) return;
      var v = parseInt(pagesSlider.value, 10);
      labelEl.innerHTML = 'Pages: <b>' + v + '</b>';
      var warnEl = document.getElementById('ppu-pages-warning');
      if (warnEl) warnEl.style.display = v >= 7 ? 'block' : 'none';
    }

    // ── Events ────────────────────────────────────────────────────────────
    sortEl.addEventListener('change',function(){
      sortVal=this.value;
      if(sortVal!=='ppu-asc'){ sortChanged=true; sortChangedTo=sortVal; }
      if(needsResort)needsResort=false;
      render();
    });

    resetFiltersBtn.addEventListener('click',function(){
      kwInput.value=''; keyword='';
      kwInput.classList.remove('active'); clearKw.style.display='none';
      minReviews=0;
      if(minReviewsSlider){ minReviewsSlider.value=0; updateSliderFill(minReviewsSlider,0,1000); }
      var rvLabel=document.getElementById('ppu-min-reviews-val');
      if(rvLabel) rvLabel.textContent='0';
      minRating=0;
      if(minRatingSlider){ minRatingSlider.value=0; updateSliderFill(minRatingSlider,0,5); }
      var rtLabel=document.getElementById('ppu-min-rating-val');
      if(rtLabel) rtLabel.textContent='Any';
      minPrice=''; maxPrice='';
      var minPriceEl=document.getElementById('ppu-min-price');
      var maxPriceEl=document.getElementById('ppu-max-price');
      if(minPriceEl) minPriceEl.value='';
      if(maxPriceEl) maxPriceEl.value='';
      Object.keys(srcFilter).forEach(function(k){ srcFilter[k]=true; });
      panel.querySelectorAll('.ppu-source-toggle').forEach(function(btn){ btn.classList.remove('off'); });
      sponsoredMode='show';
      updateSponsoredBtn(hideSponsoredBtn,sponsoredMode);
      snapOnly=false;
      fsaHsaOnly=false;
      climatePledgeOnly=false;
      smallBusinessOnly=false;
      sortVal='ppu-asc'; sortEl.value='ppu-asc';
      try{ localStorage.removeItem('au-banner-dismissed'); }catch(e){}
      try{ sessionStorage.removeItem(getFilterStorageKey(searchTerm)); }catch(e){}
      checkedAsins={};
      buildPanel();
    });

    // ── Price range inputs ────────────────────────────────────────────────
    var minPriceInput=document.getElementById('ppu-min-price');
    var maxPriceInput=document.getElementById('ppu-max-price');
    if(minPriceInput){
      minPriceInput.addEventListener('input',function(){
        minPrice=this.value.trim();
        render();
      });
    }
    if(maxPriceInput){
      maxPriceInput.addEventListener('input',function(){
        maxPrice=this.value.trim();
        render();
      });
    }

    // ── SNAP EBT filter ──────────────────────────────────────────────────
    var snapChk=document.getElementById('ppu-snap-only');
    if(snapChk){
      snapChk.addEventListener('change',function(){
        snapOnly=this.checked;
        render();
      });
    }

    // ── FSA/HSA filter ───────────────────────────────────────────────────
    var fsaChk=document.getElementById('ppu-fsa-only');
    if(fsaChk){
      fsaChk.addEventListener('change',function(){
        fsaHsaOnly=this.checked;
        render();
      });
    }

    // ── Climate Pledge filter ─────────────────────────────────────────────
    var climateChk=document.getElementById('ppu-climate-only');
    if(climateChk){
      climateChk.addEventListener('change',function(){
        climatePledgeOnly=this.checked;
        render();
      });
    }

    // ── Small Business filter ─────────────────────────────────────────────
    var sbChk=document.getElementById('ppu-sb-only');
    if(sbChk){
      sbChk.addEventListener('change',function(){
        smallBusinessOnly=this.checked;
        render();
      });
    }


    function applySelectAll(action){
      var allAsins=allData.map(function(r){return r.asin;});
      if(action==='all'){ allAsins.forEach(function(a){checkedAsins[a]=true;}); }
      else { checkedAsins={}; }
      render();
    }

    if(selectAllBox){
      selectAllBox.addEventListener('click',function(){
        var allAsins=allData.map(function(r){return r.asin;});
        var checkedCount=allAsins.filter(function(a){return checkedAsins[a];}).length;
        applySelectAll(checkedCount===0?'all':'none');
      });
    }

    if(selectAllArrow){
      selectAllArrow.addEventListener('click',function(e){
        e.stopPropagation();
        var isOpen=selectAllMenu.classList.contains('open');
        selectAllMenu.classList.toggle('open',!isOpen);
      });
    }

    if(selectAllMenu){
      selectAllMenu.querySelectorAll('.ppu-select-menu-item').forEach(function(item){
        item.addEventListener('click',function(){
          applySelectAll(this.getAttribute('data-action'));
          selectAllMenu.classList.remove('open');
        });
      });
    }

    document.addEventListener('click',function(){
      if(selectAllMenu) selectAllMenu.classList.remove('open');
    });

    // ── Shortlist bar: compare side by side ───────────────────────────────
    var AU_SUPABASE_URL = 'https://bnqgeguulurcrbkdpfzv.supabase.co';
    var AU_SUPABASE_KEY = 'sb_publishable_h70-MNvomO4EpJrpXgcdjw__motBOdi';

    if(compareBtn){
      compareBtn.addEventListener('click',function(){
        var asins=Object.keys(checkedAsins);
        var items=asins.map(function(asin){
          var r=allData.find(function(d){return d.asin===asin;});
          if(!r) return null;
          var el=document.querySelector('[data-asin="'+r.asin+'"]');
          var isPrime=!!(el&&el.querySelector('.a-icon-prime,[aria-label="Amazon Prime"],[data-component-type*="prime"]'));
          return {
            asin:        r.asin,
            title:       r.title||'',
            price:       (r.price!=null&&!isNaN(r.price))?r.price:null,
            listPrice:   (r.listPrice!=null&&!isNaN(r.listPrice))?r.listPrice:null,
            ppu:         (r.ppu!=null&&!isNaN(r.ppu))?r.ppu:null,
            ppuUnit:     r.unit||'',
            isPrime:     isPrime,
            isSponsored: !!r.isSponsored,
            hasCoupon:   !!r.hasCoupon,
            couponPillOnly: !!r.couponPillOnly,
            sns:         r.sns||'',
            savings:     r.savings||'',
            freeDate:    r.freeDate?r.freeDate.toLocaleDateString('en-US',{month:'short',day:'numeric'}):'',
            fastDate:    r.fastDate?r.fastDate.toLocaleDateString('en-US',{month:'short',day:'numeric'}):'',
            freeDateTs:  r.freeDate?r.freeDate.getTime():null,
            fastDateTs:  r.fastDate?r.fastDate.getTime():null,
            freeWindowMinutes: (r.freeWindowMinutes!=null&&r.freeWindowMinutes!==Infinity)?r.freeWindowMinutes:null,
            freeQualifier: r.freeQualifier||'',
            retailerKey: r.retailer?r.retailer.key:'standard',
            rating:      r.rating||'',
            reviewCount: r.reviewCount||'',
            note:        itemNotes[r.asin]||'',
            ppuNote:     r.note||'',
            imgUrl:      r.imgUrl||'',
            isSnap:      !!r.isSnap,
            isFsaHsa:    !!r.isFsaHsa,
            isClimatePledge: !!r.isClimatePledge,
            isSmallBusiness: !!r.isSmallBusiness
          };
        }).filter(Boolean);

        var searchTerm=(new URLSearchParams(window.location.search).get('k')||'').trim();
        var searchUrl=window.location.href;
        var payload=JSON.stringify({items:items,searchTerm:searchTerm,searchUrl:searchUrl});

        // Show loading state
        var originalLabel=compareBtn.textContent;
        compareBtn.textContent='Opening\u2026';
        compareBtn.disabled=true;

        // POST to Supabase, open compare page with returned id
        fetch(AU_SUPABASE_URL+'/rest/v1/comparisons',{
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'apikey':AU_SUPABASE_KEY,
            'Authorization':'Bearer '+AU_SUPABASE_KEY,
            'Prefer':'return=representation'
          },
          body:JSON.stringify({data:payload})
        })
        .then(function(res){
          if(!res.ok) throw new Error('Supabase error '+res.status);
          return res.json();
        })
        .then(function(rows){
          var id=rows&&rows[0]&&rows[0].id;
          if(!id) throw new Error('No id returned');
          window.open('https://tibbalsgribbin.github.io/actually-useful/compare.html?id='+id,'_blank');
          compareBtn.textContent=originalLabel;
          compareBtn.disabled=false;
        })
        .catch(function(){
          compareBtn.textContent=originalLabel;
          compareBtn.disabled=false;
          if(compareHint){
            var mainEl=document.getElementById('ppu-compare-main');
            if(mainEl){ mainEl.textContent='Couldn\u2019t open comparison \u2014 check your connection and try again.'; }
            compareHint.style.color='#c94b2e';
            setTimeout(function(){
              if(mainEl){ mainEl.textContent='Check items to compare'; }
              compareHint.style.color='';
            },4000);
          }
        });
      });
    }


    kwInput.addEventListener('input',function(){
      keyword=this.value;
      this.classList.toggle('active',this.value.trim().length>0);
      clearKw.style.display=this.value.trim().length>0?'flex':'none';
      clearTimeout(kwDebounceTimer);
      kwDebounceTimer=setTimeout(function(){render();},250);
    });
    clearKw.addEventListener('click',function(){kwInput.value='';keyword='';kwInput.classList.remove('active');clearKw.style.display='none';kwInput.focus();render();});

    panel.querySelectorAll('.ppu-unit-pill').forEach(function(pill){
      pill.addEventListener('click',function(){
        var raw=this.getAttribute('data-unit');
        selectedUnit=(raw==='')?null:raw;
        panel.querySelectorAll('.ppu-unit-pill').forEach(function(p){
          var pu=p.getAttribute('data-unit');
          var pUnit=(pu==='')?null:pu;
          var active=(pUnit===selectedUnit);
          p.classList.toggle('active',active);
          var puNorm=pu===''?null:pu;
          var def=unitPills.find(function(x){return x.unit===puNorm;});
          p.classList.toggle('recommended',!active&&!!(def&&def.isRecommended));
        });
        render();
      });
    });

    if(minReviewsSlider){
      minReviewsSlider.addEventListener('input',function(){
        minReviews=parseInt(this.value,10)||0;
        updateSliderFill(this,0,1000);
        var lbl=document.getElementById('ppu-min-reviews-val');
        if(lbl) lbl.textContent=minReviews;
        render();
      });
    }

    if(minRatingSlider){
      minRatingSlider.addEventListener('input',function(){
        minRating=parseFloat(this.value)||0;
        updateSliderFill(this,0,5);
        var lbl=document.getElementById('ppu-min-rating-val');
        if(lbl) lbl.textContent=minRating>0?(minRating+'\u2605'):'Any';
        render();
      });
    }

    panel.querySelectorAll('.ppu-source-toggle').forEach(function(btn){
      btn.addEventListener('click',function(){
        var src=this.getAttribute('data-src');
        srcFilter[src]=!srcFilter[src];
        this.classList.toggle('off',!srcFilter[src]);
        render();
      });
    });

    hideSponsoredBtn.addEventListener('click',function(){
      if(sponsoredMode==='show')       sponsoredMode='demote';
      else if(sponsoredMode==='demote') sponsoredMode='hide';
      else                              sponsoredMode='show';
      updateSponsoredBtn(hideSponsoredBtn,sponsoredMode);
      render();
    });

    // ── Collapsible section dividers ──────────────────────────────────────
    function setupCollapsible(toggleId, sectionId, openFlag) {
      var toggle  = document.getElementById(toggleId);
      var section = document.getElementById(sectionId);
      if (!toggle || !section) return;
      section.style.maxHeight = openFlag ? 'none' : '0';
      toggle.addEventListener('click', function() {
        openFlag = !openFlag;
        var chevron = toggle.querySelector('.ppu-chevron');
        if (openFlag) {
          section.style.maxHeight = 'none';
          if (chevron) chevron.style.transform = '';
          toggle.classList.remove('collapsed');
        } else {
          section.style.maxHeight = '0';
          if (chevron) chevron.style.transform = 'rotate(-90deg)';
          toggle.classList.add('collapsed');
        }
        if (toggleId === 'ppu-sort-toggle')    sortOpen    = openFlag;
        if (toggleId === 'ppu-filters-toggle') filtersOpen = openFlag;
      });
    }
    setupCollapsible('ppu-sort-toggle',    'ppu-sort-collapsible',    sortOpen);
    setupCollapsible('ppu-filters-toggle', 'ppu-filters-collapsible', filtersOpen);

    document.getElementById('ppu-collapse').addEventListener('click',function(e){
      e.stopPropagation();
      isCollapsed = !isCollapsed;
      panel.classList.toggle('collapsed', isCollapsed);
      if (isCollapsed) {
        // Clear inline height so the CSS collapsed rule (max-height:41px) can take effect
        panel.style.height    = '';
        panel.style.maxHeight = '';
      } else {
        // Restore saved height if one exists
        chrome.storage.local.get('au_search_panel_pos', function(r) {
          var pos = r['au_search_panel_pos'];
          if (pos && pos.height) {
            panel.style.height    = pos.height + 'px';
            panel.style.maxHeight = pos.height + 'px';
          }
        });
      }
    });
    document.getElementById('ppu-close').addEventListener('click',function(e){e.stopPropagation();panel.remove();});
    var workflowDismiss=document.getElementById('ppu-workflow-dismiss');
    if(workflowDismiss){
      workflowDismiss.addEventListener('click',function(){
        var banner=document.getElementById('ppu-workflow-banner');
        if(banner) banner.remove();
        try{ localStorage.setItem('au-banner-dismissed','1'); }catch(e){}
      });
    }
    var mixedDismissBtn=document.querySelector('.ppu-mixed-dismiss');
    if(mixedDismissBtn){
      mixedDismissBtn.addEventListener('click',function(){
        var b=document.getElementById('ppu-mixed-units-banner');
        if(b) b.style.display='none';
      });
    }
    document.getElementById('ppu-btn-refresh').addEventListener('click',function(){
      this.textContent='Re-syncing\u2026';this.disabled=true;
      checkedAsins={};
      setTimeout(function(){buildPanel();},100);
    });

    var coffeeLink=document.getElementById('ppu-coffee');
    if(coffeeLink) coffeeLink.addEventListener('click',function(){sendLog({event:'kofi_click'});});

    // ── Pages slider ─────────────────────────────────────────────────────
    if(pagesSlider){
      updatePagesSliderFill(pagesSlider);
      updatePagesLabel();
      pagesSlider.addEventListener('input',function(){ updatePagesSliderFill(this); updatePagesLabel(); });
      pagesSlider.addEventListener('change',function(){
        var target=parseInt(this.value,10);
        if(target<=loadedPages||!nextPageUrl) return;
        var statusEl=document.getElementById('ppu-pages-status');
        if(statusEl){statusEl.style.display='block';statusEl.textContent='Loading\u2026';}
        pagesSlider.disabled=true;
        function loadNext(remaining){
          if(remaining===0||!nextPageUrl){
            pagesSlider.disabled=false;
            if(statusEl) statusEl.style.display='none';
            needsResort=false; updateLoadMoreRow(); render(); return;
          }
          var fp=loadedPages+1,si=allData.length;
          if(statusEl) statusEl.textContent='Loading page '+fp+'\u2026';
          fetchPage(nextPageUrl,fp,si).then(function(result){
            allData=allData.concat(result.rows);loadedPages=fp;nextPageUrl=result.nextUrl;
            isLiquidDominant=inferLiquidDominant(allData);
            if(isLiquidDominant) applyLiquidCtConversion(result.rows);
            isLiquidDominant=inferLiquidDominant(allData);
            isWeightDominant=inferWeightDominant(allData);
            unitPills=generateUnitPills(allData,isLiquidDominant,isWeightDominant);
            if(result.nextUrl&&remaining>1){
              setTimeout(function(){loadNext(remaining-1);},750);
            } else {
              loadNext(result.nextUrl?remaining-1:0);
            }
          }).catch(function(err){
            console.log('[PPU] Pages slider load failed:',err);
            pagesSlider.disabled=false;
            if(statusEl){statusEl.textContent='Load failed \u2014 try Re-sync';setTimeout(function(){statusEl.style.display='none';},3000);}
          });
        }
        loadNext(target-loadedPages);
      });
    }

    // ── Bottom load-more button ───────────────────────────────────────────
    var lmBtn=document.getElementById('ppu-btn-load-more');
    if(lmBtn){
      lmBtn.addEventListener('click',function(){
        if(!nextPageUrl) return;
        var btn=this;btn.disabled=true;btn.textContent='Loading\u2026';
        var fp=loadedPages+1,si=allData.length;
        fetchPage(nextPageUrl,fp,si).then(function(result){
          allData=allData.concat(result.rows);loadedPages=fp;needsResort=false;nextPageUrl=result.nextUrl;
          isLiquidDominant=inferLiquidDominant(allData);
          if(isLiquidDominant) applyLiquidCtConversion(result.rows);
          isLiquidDominant=inferLiquidDominant(allData);
          isWeightDominant=inferWeightDominant(allData);
          unitPills=generateUnitPills(allData,isLiquidDominant,isWeightDominant);
          btn.disabled=false; updateLoadMoreRow(); render();
        }).catch(function(err){console.log('[PPU] Load more failed:',err);btn.textContent='Load failed \u2014 try Re-sync';btn.disabled=false;});
      });
    }

    render();

    } catch(err) {
      console.error('[PPU] Panel build failed:', err);
      var existing=document.getElementById(PANEL_ID);
      if(existing) existing.remove();
      var errPanel=document.createElement('div');
      errPanel.id=PANEL_ID;
      errPanel.style.cssText='position:fixed;top:80px;right:20px;width:320px;z-index:99999;';
      errPanel.innerHTML=
        '<div id="ppu-controls-wrap">'+
          '<div id="ppu-header">'+
            '<h3>Actually Useful</h3>'+
            '<div id="ppu-header-btns">'+
              '<button id="ppu-close-err" title="Close">\u00d7</button>'+
            '</div>'+
          '</div>'+
          '<div style="padding:12px 16px;">'+
            '<p style="margin:0 0 8px;color:#c0392b;font-weight:600;">\u26a0 Something went wrong</p>'+
            '<p style="margin:0 0 12px;font-size:13px;">The panel couldn\u2019t load. Try refreshing the page. If this keeps happening, please let us know.</p>'+
            '<button id="ppu-err-refresh">\u21ba Re-sync</button>'+
          '</div>'+
        '</div>';
      document.body.appendChild(errPanel);
      document.getElementById('ppu-close-err').addEventListener('click',function(){errPanel.remove();});
      document.getElementById('ppu-err-refresh').addEventListener('click',function(){location.reload();});
    }
  }

  function tryBuild(n){
    var cards=document.querySelectorAll('[data-component-type="s-search-result"]');
    if(cards.length>0) buildPanel();
    else if(n>0) setTimeout(function(){tryBuild(n-1);},800);
    else console.log('[PPU] Timed out.');
  }

  (function(){
    var KS_URL='https://actuallyuseful.net/killswitch.json';
    var proceeded=false;
    function proceed(){
      if(proceeded)return;
      proceeded=true;
      setTimeout(function(){tryBuild(15);},1500);
    }
    var ksTimeout=setTimeout(proceed,3000);
    fetch(KS_URL,{cache:'no-store'})
      .then(function(r){return r.json();})
      .then(function(data){
        clearTimeout(ksTimeout);
        if(data&&data.disabled){
          var msg=data.message||'Actually Useful is temporarily unavailable. Check actuallyuseful.net for updates.';
          var banner=document.createElement('div');
          banner.style.cssText='position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#b91c1c;color:#fff;padding:10px 16px;font-family:sans-serif;font-size:14px;font-weight:500;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.3);';
          banner.textContent='\u26a0\ufe0f '+msg;
          document.body.appendChild(banner);
        } else {
          proceed();
        }
      })
      .catch(function(){
        clearTimeout(ksTimeout);
        proceed();
      });
  })();
