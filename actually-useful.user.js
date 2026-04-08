// ==UserScript==
// @name         Actually Useful Amazon Search
// @namespace    http://tampermonkey.net/
// @version      5.15.0
// @description  Shop on your terms instead of Amazon's.
// @author       Claude / Melissa (ko-fi.com/tibbalsgribbin)
// @license      All Rights Reserved
// @match        https://www.amazon.com/s*
// @match        https://smile.amazon.com/s*
// @grant        none
// @run-at       document-idle
// @antifeature  tracking  Anonymous usage data (search term, result counts, sort method) is logged to help improve the script. No personal information is collected.
// @updateURL    https://github.com/tibbalsgribbin/actually-useful/raw/refs/heads/main/actually-useful.user.js
// @downloadURL  https://github.com/tibbalsgribbin/actually-useful/raw/refs/heads/main/actually-useful.user.js
// ==/UserScript==

(function () {
  'use strict';

  const PANEL_ID = 'ppu-sorter-panel';
  const SCRIPT_VERSION = '5.15.0';
  const LOG_URL = 'https://script.google.com/macros/s/AKfycbwIgxS_WSeFFSq50Vaa2O1wRhMbmQagWNn-S9pwFT-MR0tgOnNr3wugOMXx9N0QJ-M/exec';

  const NUDGE_DISMISSED_KEY  = 'ppu_nudge_dismissed';
  const NUDGE_LAST_SHOWN_KEY = 'ppu_nudge_last_shown';
  const NUDGE_DELAY_DAYS     = 30;

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
    'supplement','vitamin','protein powder','coffee','pod','pods','k-cup','kcup'
  ];

  const LIQUID_UNITS  = ['fl oz','fluid ounce','fluid ounces','ml','milliliter','milliliters','l','liter','liters'];
  const WEIGHT_UNITS  = ['oz','g','gram','grams','kg','kilogram','kilograms','lb','lbs','pound','pounds'];
  const CONTAINER_UNITS = ['roll','rolls','box','boxes','pack','packs','package','packages','pouch','pouches','tube','tubes'];
  const LENGTH_UNITS    = ['ft','feet','foot','meter','meters','m','cm','centimeter','centimeters','inch','inches','in','yard','yards'];
  const ITEM_UNITS = [
    'count','ct','bag','bags','piece','pieces','pcs','pc','each','unit','units',
    'pad','pads','sheet','sheets','wipe','wipes','tablet','tablets',
    'oz','fl oz','fluid ounce','fluid ounces','lb','lbs','pound','pounds',
    'g','gram','grams','kg','kilogram','kilograms','ml','milliliter','milliliters','l','liter','liters'
  ];

  function sendLog(data) {
    try {
      var payload = Object.assign({
        timestamp: new Date().toISOString(), scriptVersion: SCRIPT_VERSION,
        searchUrl: window.location.href,
        searchTerm: (new URLSearchParams(window.location.search).get('k')||'').trim(),
      }, data);
      fetch(LOG_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),mode:'no-cors'}).catch(function(){});
    } catch(e) {}
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
    if (ppu < 0.10) return '$'+ppu.toFixed(3).replace(/0+$/,'').replace(/\.$/,'0');
    return '$'+ppu.toFixed(2);
  }

  function normalizeUnit(unit) {
    if (!unit) return unit;
    var u = unit.toLowerCase().trim();
    if (u==='fluid ounce'||u==='fluid ounces'||u==='fl. oz'||u==='fl. oz.') return 'fl oz';
    if (u==='ounce'||u==='ounces') return 'oz';
    if (u==='count') return 'ct';
    if (u==='pound'||u==='pounds') return 'lb';
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

  // ── Extract per-item fl oz from title (for liquid-dominant ct conversion) ──
  // Looks for patterns like "12 Fl Oz" or "11.15 fl oz" in product title.
  // Used to convert ct-unit items to fl oz in liquid-dominant categories.
  function extractFlOzFromTitle(title) {
    var m = title.match(/(\d+(?:\.\d+)?)\s*(?:fl\.?\s*oz|fluid\s*ounces?)/i);
    if (m) return parseFloat(m[1]);
    return null;
  }

  // ── Unit pill generation ──────────────────────────────────────────────────
  function generateUnitPills(data, isLiqDom) {
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

    if (hasLiquidUnit) {
      pills.push({ unit:'fl oz', label:'fl oz', isRecommended: isLiqDom });
      pills.push({ unit:'ml',    label:'ml',    isRecommended: false });
    }
    if (hasWeightUnit) {
      pills.push({ unit:'oz', label:'oz (weight)', isRecommended: false });
      pills.push({ unit:'g',  label:'g',  isRecommended: false });
    }
    // Only show per-item pill when count units exist alongside weight/liquid units
    // AND we are NOT in liquid-dominant mode (where ct items may be convertible to fl oz)
    if (hasCountUnit && (hasLiquidUnit || hasWeightUnit) && !isLiqDom) {
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

  // ── Dimension normalisation & keyword helpers ─────────────────────────────
  function normalizeDimensions(str) {
    var s = str.replace(/["\u2018\u2019\u201c\u201d\u2033\u2032]/g,'');
    return s.replace(/(\d+(?:\.\d+)?)\s*[xX\u00d7]\s*(\d+(?:\.\d+)?)/g,'$1x$2');
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Card text scraping ────────────────────────────────────────────────────
  // v5.15: Captures additional card text beyond the title for keyword matching.
  // Includes deal/promo badges, discount labels, delivery window strings,
  // plus synthetic tokens from structured data: 'coupon', 'prime', 'today', 'tomorrow'.
  // Deliberately excludes: title (already in r.title), price strings,
  // review counts, image alt text, hidden/offscreen elements.
  function scrapeCardText(el, hasCoupon, freeDate, fastDate) {
    var parts = [];

    // Deal and promo badge text (e.g. "Limited time deal", "10% off")
    var badgeSelectors = [
      '.s-badge-text',
      '[data-component-type="s-status-badge-component"]',
      '.a-badge-text',
      '.s-coupon-highlight-color',
      '.s-promotional-deal-badge',
    ];
    badgeSelectors.forEach(function(sel){
      el.querySelectorAll(sel).forEach(function(node){
        var t = (node.textContent||'').trim();
        if (t && t.length < 200) parts.push(t);
      });
    });

    // Discount/subscribe rows (e.g. "10% off on any 4 qualifying items")
    var discountSelectors = [
      '.s-coupon-unclipped',
      '.s-coupon-clipped',
      '[data-component-type="s-coupon-component"]',
      '.a-color-success',
    ];
    discountSelectors.forEach(function(sel){
      el.querySelectorAll(sel).forEach(function(node){
        if (node.closest('.a-price')) return; // skip price elements
        var t = (node.textContent||'').trim();
        if (t && t.length < 200) parts.push(t);
      });
    });

    // Delivery window text — cutoff times like "10 AM - 3 PM", "in 3 hours"
    var deliverySelectors = [
      '.udm-secondary-delivery-message',
      '[data-component-type="s-delivery-component"] .a-color-base',
    ];
    deliverySelectors.forEach(function(sel){
      el.querySelectorAll(sel).forEach(function(node){
        if (node.closest('.a-price')) return;
        if (node.closest('h2')) return; // skip title area
        var t = (node.textContent||'').trim();
        if (t && t.length < 150) parts.push(t);
      });
    });

    // Synthetic tokens from structured data
    if (hasCoupon) parts.push('coupon');

    // Prime badge detection
    if (el.querySelector('.a-icon-prime,[aria-label="Amazon Prime"],[data-component-type*="prime"]')) {
      parts.push('prime');
    }

    // Today / tomorrow derived from parsed delivery dates
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

  // ── Keyword parsing — supports OR / | syntax ──────────────────────────────
  // v5.15: OR keyword filtering. Pipe (|) and uppercase OR (space-bounded) are
  // branch separators. Exclusions (-term) are global. A title passes if it
  // satisfies ANY branch AND none of the global exclusions.
  // Split happens BEFORE lowercasing so ' OR ' is always recognised and never
  // accidentally becomes a search term.
  function parseKeywords(kwRaw) {
    var segments = kwRaw.trim().split(/\s+OR\s+|\|/i);
    var exclusions = [];
    var branches = [];
    segments.forEach(function(seg) {
      var nk = normalizeDimensions(seg.trim().toLowerCase());
      var terms = nk.split(/\s+/).filter(Boolean);
      var positive = [];
      terms.forEach(function(t) {
        if (t.startsWith('-') && t.length > 1) {
          exclusions.push(t.slice(1));
        } else if (!t.startsWith('-')) {
          positive.push(t);
        }
      });
      if (positive.length > 0) branches.push(positive);
    });
    // If only exclusions were typed, single empty branch means "all pass unless excluded"
    if (branches.length === 0) branches.push([]);
    return { branches: branches, exclusions: exclusions };
  }

  // ── Keyword matching ──────────────────────────────────────────────────────
  // v5.15: searches both title and cardText.
  // Inclusion terms: substring match against title OR cardText.
  // Exclusion terms: word-boundary match against title only — we don't want
  // "-free" to suppress a card because "free delivery" is in cardText.
  function titleMatchesKeywords(title, cardText, kwRaw) {
    var nt = normalizeDimensions(title.toLowerCase());
    var nc = cardText || '';
    var parsed = parseKeywords(kwRaw);
    // Exclusions against title only (word-boundary)
    for (var i=0; i<parsed.exclusions.length; i++) {
      var word = parsed.exclusions[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var re = new RegExp('\\b' + word + '\\b', 'i');
      if (re.test(nt)) return false;
    }
    // Branches: pass if ANY branch fully matches (title OR cardText)
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

  // ── Keyword highlighting — highlights terms from matching branch only ──────
  // Title-only: cardText matches are silent (nothing to mark in the title).
  function highlightKeywords(title, cardText, kwRaw) {
    if (!kwRaw||!kwRaw.trim()) return escapeHtml(title);
    var normTitle = normalizeDimensions(title.toLowerCase());
    var nc = cardText || '';
    var parsed = parseKeywords(kwRaw);
    // Find the first branch that matched
    var matchingBranch = null;
    for (var b=0; b<parsed.branches.length; b++) {
      var branch = parsed.branches[b];
      var branchMatch = branch.length > 0;
      for (var j=0; j<branch.length; j++) {
        var term = branch[j];
        if (!normTitle.includes(term) && !nc.includes(term)) { branchMatch = false; break; }
      }
      if (branchMatch) { matchingBranch = branch; break; }
    }
    if (!matchingBranch || matchingBranch.length === 0) return escapeHtml(title);
    // Only highlight terms that actually appear in the title
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
    var result={freeDate:null,fastDate:null,freeCutoff:null,fastCutoff:null};
    var allDivs=Array.from(el.querySelectorAll('.udm-secondary-delivery-message,.a-color-base.a-text-normal,[class*="delivery"],.a-column.a-span12'));
    var seen=new Set();
    allDivs.forEach(function(div){
      if(seen.has(div)) return; seen.add(div);
      var text=div.textContent||'';
      var boldEl=div.querySelector('.a-text-bold');
      var dateStr=boldEl?boldEl.textContent.trim():'';
      if(!dateStr) return;
      var lower=text.toLowerCase();
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

  function detectSource(el) {
    if(el.querySelector('img[alt="Whole Foods Market"]')) return 'whole-foods';
    if(el.querySelector('img[alt="Amazon Fresh"]'))      return 'fresh';
    return 'standard';
  }

  // ── Review count ──────────────────────────────────────────────────────────
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

  // ── Nudge ─────────────────────────────────────────────────────────────────
  function shouldShowNudge() {
    try {
      if(localStorage.getItem(NUDGE_DISMISSED_KEY)==='true') return false;
      var last=localStorage.getItem(NUDGE_LAST_SHOWN_KEY);
      if(last&&(Date.now()-parseInt(last,10))/(1000*60*60*24)<NUDGE_DELAY_DAYS) return false;
      return true;
    } catch(e){return false;}
  }
  function recordNudgeShown()        {try{localStorage.setItem(NUDGE_LAST_SHOWN_KEY,String(Date.now()));}catch(e){}}
  function dismissNudgePermanently() {try{localStorage.setItem(NUDGE_DISMISSED_KEY,'true');}catch(e){}}

  var nudgeTriggeredThisSession=false;
  function maybeShowNudge() {
    if(nudgeTriggeredThisSession||!shouldShowNudge()) return;
    nudgeTriggeredThisSession=true; recordNudgeShown();
    var existing=document.getElementById('ppu-nudge');
    if(existing) existing.remove();
    var nudge=document.createElement('div');
    nudge.id='ppu-nudge';
    nudge.innerHTML=
      '<div id="ppu-nudge-inner">'+
        '<button id="ppu-nudge-close" title="Dismiss for now">\u00d7</button>'+
        '<div id="ppu-nudge-msg">\u2615 Actually Useful is free \u2014 but it takes real time to build and maintain. If it\'s saving you money, a small tip means a lot.</div>'+
        '<div id="ppu-nudge-btns">'+
          '<a id="ppu-nudge-yes" href="https://ko-fi.com/tibbalsgribbin" target="_blank">Contribute \u2665</a>'+
          '<button id="ppu-nudge-did">I already did \u2713</button>'+
          '<button id="ppu-nudge-no">Don\'t ask again</button>'+
        '</div>'+
      '</div>';
    document.body.appendChild(nudge);
    document.getElementById('ppu-nudge-close').addEventListener('click',function(){nudge.remove();});
    document.getElementById('ppu-nudge-yes').addEventListener('click',function(){nudge.remove();});
    document.getElementById('ppu-nudge-did').addEventListener('click',function(){dismissNudgePermanently();nudge.remove();});
    document.getElementById('ppu-nudge-no').addEventListener('click',function(){dismissNudgePermanently();nudge.remove();});
  }

  // ── CSS ───────────────────────────────────────────────────────────────────
  const CSS = `
    #${PANEL_ID} {
      position:fixed;top:80px;right:16px;width:390px;min-width:280px;max-width:700px;
      max-height:calc(100vh - 100px);overflow:hidden;background:#fff;
      border:1px solid #d5d9d9;border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.18);
      z-index:99999;font-family:Arial,sans-serif;font-size:13px;color:#0f1111;
      transition:max-height 0.2s;display:flex;flex-direction:column;
    }
    #${PANEL_ID}.collapsed { width:420px !important; max-height:41px; }
    #ppu-controls-wrap { flex-shrink:0; }
    #ppu-scroll-area   { flex:1;overflow-y:auto;overflow-x:hidden; }
    #ppu-header {
      background:#232f3e;color:#fff;padding:8px 10px;border-radius:8px 8px 0 0;
      display:flex;align-items:center;justify-content:space-between;
      position:sticky;top:0;user-select:none;gap:8px;white-space:nowrap;
    }
    #${PANEL_ID}.collapsed #ppu-header { border-radius:8px; }
    #ppu-header h3  { margin:0;font-size:14px;font-weight:700;flex-shrink:0; }
    #ppu-header-btns{ display:flex;gap:6px;align-items:center;flex-shrink:0; }
    #ppu-collapse,#ppu-close {
      background:none;border:none;color:#fff;font-size:16px;cursor:pointer;line-height:1;padding:0 3px;flex-shrink:0;
    }
    #ppu-coffee {
      font-size:12px;text-decoration:none;color:#ffd700;padding:2px 6px;
      border:1px solid rgba(255,215,0,0.4);border-radius:4px;opacity:0.9;
      transition:opacity 0.15s;white-space:nowrap;flex-shrink:0;
    }
    #ppu-coffee:hover { opacity:1; }
    #ppu-controls {
      padding:8px 14px;background:#f0f2f2;border-bottom:1px solid #d5d9d9;
      display:flex;gap:8px;align-items:center;flex-wrap:wrap;
    }
    #ppu-controls label { font-size:12px;color:#565959; }
    #ppu-sort { font-size:12px;padding:3px 6px;border:1px solid #aaa;border-radius:4px;background:#fff;cursor:pointer; }
    #ppu-btn-refresh,#ppu-btn-resort,
    #ppu-btn-show-checked,#ppu-btn-clear-checked,#ppu-btn-hide-sponsored {
      font-size:11px;padding:3px 8px;border:1px solid #aaa;border-radius:4px;background:#fff;cursor:pointer;
    }
    #ppu-btn-resort       { border-color:#007185;color:#007185;display:none; }
    #ppu-btn-show-checked { border-color:#e47911;color:#e47911;display:none; }
    #ppu-btn-clear-checked  { display:none; }
    #ppu-btn-hide-sponsored { display:none; }
    #ppu-btn-hide-sponsored.active { background:#eee;border-color:#888; }
    #ppu-filter-row {
      padding:6px 14px;background:#f7f7f7;border-bottom:1px solid #e8e8e8;
      display:flex;gap:6px;align-items:center;
    }
    #ppu-filter-row label { font-size:12px;color:#565959;white-space:nowrap; }
    #ppu-keyword {
      flex:1;min-width:0;font-size:12px;padding:3px 6px;
      border:1px solid #aaa;border-radius:4px;background:#fff;
    }
    #ppu-keyword.active { border-color:#e47911;outline:none;box-shadow:0 0 0 2px rgba(228,121,17,0.25); }
    #ppu-btn-clear-kw {
      font-size:13px;padding:1px 5px;border:1px solid #aaa;border-radius:4px;
      background:#fff;cursor:pointer;color:#555;display:none;
    }
    #ppu-unit-pill-row {
      padding:6px 14px;background:#f7f7f7;border-bottom:1px solid #d5d9d9;
      display:flex;gap:6px;align-items:center;flex-wrap:wrap;
    }
    #ppu-unit-pill-row .pill-label { font-size:12px;color:#565959;white-space:nowrap; }
    .ppu-unit-pill {
      font-size:11px;padding:2px 10px;border-radius:10px;cursor:pointer;
      border:1px solid #bbb;background:#fff;color:#444;transition:all 0.15s;user-select:none;
    }
    .ppu-unit-pill:hover { border-color:#007185;color:#007185; }
    .ppu-unit-pill.active { background:#007185;color:#fff;border-color:#007185;font-weight:600; }
    .ppu-unit-pill.recommended { border-color:#007185;color:#007185; }
    .ppu-unit-pill.recommended::after { content:' \u2713';font-size:10px; }
    #ppu-filter-extra-row {
      padding:6px 14px;background:#f7f7f7;border-bottom:1px solid #d5d9d9;
      display:flex;gap:8px;align-items:center;flex-wrap:wrap;
    }
    #ppu-filter-extra-row label { font-size:12px;color:#565959;white-space:nowrap; }
    #ppu-min-reviews { width:60px;font-size:12px;padding:3px 6px;border:1px solid #aaa;border-radius:4px;background:#fff; }
    #ppu-min-reviews.active { border-color:#007185;outline:none;box-shadow:0 0 0 2px rgba(0,113,133,0.2); }
    #ppu-source-row {
      padding:6px 14px;background:#f7f7f7;border-bottom:1px solid #d5d9d9;
      display:flex;gap:8px;align-items:center;flex-wrap:wrap;
    }
    #ppu-source-row span.label { font-size:12px;color:#565959;white-space:nowrap; }
    .ppu-source-toggle {
      font-size:11px;padding:2px 8px;border-radius:10px;cursor:pointer;
      border:1px solid currentColor;transition:all 0.15s;user-select:none;font-weight:600;
    }
    .ppu-source-toggle.src-standard { color:#232f3e;background:#e8eaf0; }
    .ppu-source-toggle.src-fresh    { color:#005f7a;background:#e0f4fb; }
    .ppu-source-toggle.src-wf       { color:#006400;background:#e8f5e8; }
    .ppu-source-toggle.off { color:#aaa;background:#f5f5f5;border-color:#ddd;text-decoration:line-through;font-weight:normal; }
    #ppu-info { font-size:0.82rem;color:#888;padding:5px 14px;border-bottom:1px solid #f0f2f2; }
    #ppu-sort-note {
      font-size:0.82rem;color:#e47911;font-style:italic;
      padding:3px 14px 4px;border-bottom:1px solid #f0f2f2;display:none;
    }
    #ppu-list { padding:4px 0; }
    .ppu-row {
      padding:6px 10px 6px 8px;border-bottom:1px solid #f5f5f5;
      transition:opacity 0.15s;display:flex;gap:8px;align-items:flex-start;
    }
    .ppu-row:last-child         { border-bottom:none; }
    .ppu-row.kw-mismatch        { opacity:0.28; }
    .ppu-row.src-hidden         { display:none; }
    .ppu-row.sponsored-hidden   { display:none; }
    .ppu-row.reviews-hidden     { display:none; }
    .ppu-row.checked            { background:#fffbf0; }
    .ppu-cb-wrap     { padding-top:2px;flex-shrink:0; }
    .ppu-cb          { cursor:pointer;width:14px;height:14px; }
    .ppu-row-content { flex:1;min-width:0; }
    .ppu-row a {
      font-size:0.9rem;color:#007185;text-decoration:none;display:block;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;
    }
    .ppu-row a:hover { text-decoration:underline; }
    .ppu-meta  { display:flex;gap:8px;align-items:center;flex-wrap:wrap; }
    .ppu-price { font-weight:700;color:#B12704;font-size:14px; }
    .ppu-count { font-size:0.82rem;color:#666; }
    .ppu-badge { font-size:12px;font-weight:600;padding:2px 6px;border-radius:4px;background:#e8f5e9;border:1px solid #a5d6a7;color:#2e7d32; }
    .ppu-badge.best { background:#fff8e1;border-color:#ffc107;color:#e65100; }
    .ppu-converted  { font-size:0.78rem;color:#999;font-style:italic;margin-left:2px; }
    .ppu-delivery   { font-size:0.82rem;color:#007600;margin-top:2px; }
    .ppu-delivery.fast   { color:#007185; }
    .ppu-delivery.wf-fee { color:#B12704; }
    .ppu-nodata { font-size:0.82rem;color:#bbb;font-style:italic; }
    .ppu-note   { font-size:0.78rem;color:#aaa;margin-top:2px; }
    .ppu-src-tag { font-size:0.78rem;padding:1px 4px;border-radius:3px;font-weight:600;margin-bottom:2px;display:inline-block; }
    .ppu-src-wf  { background:#e8f5e8;color:#006400;border:1px solid #a5d6a7; }
    .ppu-src-fr  { background:#e0f4fb;color:#005f7a;border:1px solid #81d4f7; }
    .ppu-divider {
      padding:5px 14px;background:#e8f0fe;border-top:1px solid #c5d0e8;
      border-bottom:1px solid #c5d0e8;font-size:0.82rem;font-weight:600;color:#3c4a6e;
    }
    mark.ppu-kw-highlight { background:#ffc400;color:#000;border-radius:2px;padding:0 1px; }
    #ppu-load-more-row { padding:10px 14px;text-align:center;border-top:1px solid #f0f2f2; }
    #ppu-btn-load-more {
      font-size:12px;padding:5px 14px;border:1px solid #007185;border-radius:4px;
      background:#fff;cursor:pointer;color:#007185;width:100%;
    }
    #ppu-btn-load-more:hover    { background:#f0f9fa; }
    #ppu-btn-load-more:disabled { opacity:0.5;cursor:default; }
    #ppu-btn-resort-bottom {
      font-size:11px;padding:3px 8px;margin-top:6px;border:1px solid #007185;
      border-radius:4px;background:#fff;cursor:pointer;color:#007185;width:100%;display:none;
    }
    #ppu-drag-handle {
      position:absolute;left:0;top:0;bottom:0;width:6px;cursor:ew-resize;
      background:linear-gradient(to right,rgba(0,0,0,0.06),transparent);
      border-radius:8px 0 0 8px;z-index:100;
    }
    #ppu-drag-handle:hover { background:linear-gradient(to right,rgba(0,113,133,0.2),transparent); }
    #${PANEL_ID} { position:fixed; }
    #ppu-delivery-note { font-size:0.82rem;color:#aaa;font-style:italic;padding:3px 14px 4px;border-bottom:1px solid #f0f2f2; }
    #ppu-nudge {
      position:fixed;bottom:24px;right:16px;z-index:100000;width:340px;
      background:#232f3e;color:#fff;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);
      font-family:Arial,sans-serif;font-size:1rem;animation:ppu-nudge-in 0.3s ease;
    }
    @keyframes ppu-nudge-in { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
    #ppu-nudge-inner { padding:14px 16px;position:relative; }
    #ppu-nudge-close {
      position:absolute;top:8px;right:10px;background:none;border:none;
      color:#aaa;font-size:1.1rem;cursor:pointer;line-height:1;padding:2px 4px;
    }
    #ppu-nudge-close:hover { color:#fff; }
    #ppu-nudge-msg   { margin-bottom:12px;margin-right:20px;line-height:1.5;color:#e0e0e0;font-size:0.95rem; }
    #ppu-nudge-btns  { display:flex;gap:8px;flex-wrap:wrap; }
    #ppu-nudge-yes { font-size:0.85rem;padding:5px 12px;border-radius:4px;cursor:pointer;background:#e47911;color:#fff;border:none;text-decoration:none;font-weight:600; }
    #ppu-nudge-yes:hover { background:#c96d0a; }
    #ppu-nudge-did,#ppu-nudge-no { font-size:0.85rem;padding:5px 10px;border-radius:4px;cursor:pointer;background:transparent;color:#ccc;border:1px solid #666; }
    #ppu-nudge-did:hover,#ppu-nudge-no:hover { color:#fff;border-color:#888; }
  `;

  function injectStyles() {
    if(document.getElementById('ppu-styles')) return;
    var s=document.createElement('style'); s.id='ppu-styles'; s.textContent=CSS;
    document.head.appendChild(s);
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
      /(\d[\d,]*)\s*-?\s*count/i,/(\d[\d,]*)\s*-?\s*bags?/i,/(\d[\d,]*)\s*-?\s*pcs\.?/i,
      /(\d[\d,]*)\s*-?\s*pieces?/i,/(\d[\d,]*)\s*-?\s*pack/i,/(\d[\d,]*)\s*-?\s*rolls?/i,
      /pack\s+of\s+(\d[\d,]*)/i,/box\s+of\s+(\d[\d,]*)/i,
    ];
    for(var i=0;i<pats.length;i++){var m=text.match(pats[i]);if(m){var n=parseInt(m[1].replace(/,/g,''),10);if(n>1&&n<10000)return n;}}
    return null;
  }

  // ── guessCountUnit: always returns ct when item is a pack/count ───────────
  // FIX v5.14: pack/count titles now return 'ct' not 'pack', so unit label
  // reflects per-item pricing rather than per-pack (which is meaningless).
  function guessCountUnit(text) {
    if(/\d[\d,]*\s*-?\s*rolls?/i.test(text))    return 'roll';
    if(/\d[\d,]*\s*-?\s*bags?/i.test(text))     return 'bag';
    if(/\d[\d,]*\s*-?\s*sheets?/i.test(text))   return 'sheet';
    if(/\d[\d,]*\s*-?\s*wipes?/i.test(text))    return 'wipe';
    if(/\d[\d,]*\s*-?\s*pads?/i.test(text))     return 'pad';
    if(/\d[\d,]*\s*-?\s*tablets?/i.test(text))  return 'tablet';
    if(/\d[\d,]*\s*-?\s*pills?/i.test(text))    return 'pill';
    if(/\d[\d,]*\s*-?\s*capsules?/i.test(text)) return 'capsule';
    if(/\d[\d,]*\s*-?\s*pcs\.?/i.test(text))    return 'pc';
    if(/\d[\d,]*\s*-?\s*pieces?/i.test(text))   return 'piece';
    // pack and count now both return 'ct' — per-item, not per-pack
    if(/\d[\d,]*\s*-?\s*pack/i.test(text))      return 'ct';
    if(/pack\s+of\s+\d/i.test(text))            return 'ct';
    if(/\d[\d,]*\s*-?\s*count/i.test(text))     return 'ct';
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
    var price=couponPrice!==null?couponPrice:parsePrice(el);
    var hasCoupon=couponPrice!==null;
    var ap=parseAmazonUnitPrice(el);
    var count=extractCount(title);
    var page=pageNum||1;
    var grocery=detectSource(el);
    var delivery=parseDeliveryDates(el);
    var wfFreeFlag=(grocery==='whole-foods')&&!!delivery.freeDate;
    var reviewCount=parseReviewCount(el);
    var cardText=scrapeCardText(el,hasCoupon,delivery.freeDate,delivery.fastDate);
    var base={title,href,asin,price,count,page,grocery,wfFreeFlag,isSponsored,hasCoupon,
              cardText,reviewCount,originalIndex:originalIndex||0,
              freeDate:delivery.freeDate,fastDate:delivery.fastDate,
              freeCutoff:delivery.freeCutoff,fastCutoff:delivery.fastCutoff};

    // ── Amazon reported a unit price ────────────────────────────────────────
    if(ap&&ITEM_UNITS.includes(ap.unit)) {
      // v5.14: if Amazon says ct but we have price and count, recalculate to
      // confirm, and in liquid-dominant context attempt fl oz conversion
      if(ap.unit==='ct'&&count&&price) {
        var perItem=price/count;
        // Use Amazon's ct price as-is (it may reflect per-can, etc.)
        return Object.assign(base,{ppu:ap.ppu,unit:'ct',source:'amazon'});
      }
      return Object.assign(base,{ppu:ap.ppu,unit:ap.unit,source:'amazon'});
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
    if(ap) return Object.assign(base,{ppu:ap.ppu,unit:ap.unit,source:'amazon'});

    // ── No Amazon unit price — calculate from count ─────────────────────────
    if(count&&price){
      var unit2=guessCountUnit(title)||guessUnitFromTitle(title)||'ct';
      return Object.assign(base,{ppu:price/count,unit:unit2,source:'calc'});
    }

    // ── v5.14: Single item — default to 1 ct when price is available ────────
    // This allows single-item listings to be compared against multipacks.
    // Only applies when there is no count in the title and no Amazon unit price.
    if(price) {
      return Object.assign(base,{ppu:price,unit:'ct',source:'calc-single'});
    }

    if(!price) return Object.assign(base,{ppu:null,unit:null,source:'unavailable'});
    return Object.assign(base,{ppu:null,unit:null,source:'none'});
  }

  // ── Liquid-dominant ct→fl oz conversion ──────────────────────────────────
  // v5.14: After scraping, in liquid-dominant mode, attempt to convert ct
  // items to fl oz using per-item volume stated in title.
  // e.g. "La Croix 12 Fl Oz (Pack of 8)" reported as ct → convert to fl oz.
  function applyLiquidCtConversion(data) {
    data.forEach(function(r) {
      if (!r.unit || r.unit !== 'ct') return;
      if (!r.price || !r.ppu) return;
      var perItemFlOz = extractFlOzFromTitle(r.title);
      if (!perItemFlOz) return;
      // ppu is currently price-per-can (ct). Convert to price-per-fl-oz.
      var newPPU = r.ppu / perItemFlOz;
      r.ppu = newPPU;
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
  var hideSponsored    = false;
  var isCollapsed      = false;
  var keyword          = '';
  var selectedUnit     = null;
  var sortVal          = 'ppu-asc';
  var checkedAsins     = {};
  var showCheckedOnly  = false;
  var allData          = [];
  var loadedPages      = 1;
  var nextPageUrl      = null;
  var needsResort      = false;
  var srcFilter        = {'standard':true,'fresh':true,'whole-foods':true};
  var logTimer         = null;
  var minReviews       = 0;
  var isLiquidDominant = false;
  var unitPills        = [];

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
      var countStandard=allData.filter(function(r){return r.grocery==='standard';}).length;
      var countFresh=allData.filter(function(r){return r.grocery==='fresh';}).length;
      var countWF=allData.filter(function(r){return r.grocery==='whole-foods';}).length;
      var sources=[];
      if(countStandard>0) sources.push('standard');
      if(countFresh>0)    sources.push('fresh');
      if(countWF>0)       sources.push('whole-foods');
      var couponCount=allData.filter(function(r){return r.hasCoupon;}).length;
      var sponsoredCount=allData.filter(function(r){return r.isSponsored;}).length;
      var shortlistCount=Object.keys(checkedAsins).length;
      var ua='';try{ua=navigator.userAgent||'';}catch(e){}
      sendLog({
        totalResults:allData.length,withUnitData:withUnit.length,
        withoutUnitData:allData.length-withUnit.length,unitsFound,
        sortMethod:sortVal,keywordFilterActive:keyword.trim().length>0,
        keywordFilter:keyword.trim()||'',
        pagesLoaded:loadedPages,grocerySources:sources.join(', '),
        countStandard,countFresh,countWholeFoods:countWF,
        liquidDominant:isLiquidDominant,selectedUnit:selectedUnit||'as-listed',
        couponCount,sponsoredCount,hideSponsoredActive:hideSponsored,
        shortlistCount,minReviewsFilter:minReviews||0,
        userAgent:ua
      });
    } catch(e){}
  }

  // ── Build panel ───────────────────────────────────────────────────────────
  function buildPanel() {
    injectStyles();
    var cards=document.querySelectorAll('[data-component-type="s-search-result"]');
    if(!cards.length){console.log('[PPU] No result cards found.');return;}

    var seenAsins={},idx=0;
    allData=Array.from(cards).reduce(function(acc,c){
      if(c.offsetParent===null) return acc;
      var row=scrapeCard(c,1,idx++);
      if(row.asin&&seenAsins[row.asin]) return acc;
      if(row.asin) seenAsins[row.asin]=true;
      acc.push(row); return acc;
    },[]);
    loadedPages=1; nextPageUrl=getNextPageUrl(); needsResort=false;

    // Liquid inference first pass (before ct conversion)
    isLiquidDominant=inferLiquidDominant(allData);

    // v5.14: in liquid-dominant mode, convert ct items to fl oz where possible
    if(isLiquidDominant) applyLiquidCtConversion(allData);

    // Regenerate liquid dominance after conversion (unit distribution may have changed)
    isLiquidDominant=inferLiquidDominant(allData);
    unitPills=generateUnitPills(allData,isLiquidDominant);

    var hasFresh=allData.some(function(r){return r.grocery==='fresh';});
    var hasWF=allData.some(function(r){return r.grocery==='whole-foods';});
    var hasDelivery=allData.some(function(r){return r.freeDate||r.fastDate;});
    var hasSponsored=allData.some(function(r){return r.isSponsored;});
    var hasPills=unitPills.length>1;

    if(selectedUnit!==null&&!unitPills.some(function(p){return p.unit===selectedUnit;})) selectedUnit=null;

    var existing=document.getElementById(PANEL_ID);
    if(existing) existing.remove();

    var panel=document.createElement('div');
    panel.id=PANEL_ID;
    if(isCollapsed) panel.classList.add('collapsed');
    panel.style.position='fixed';

    var pillHtml='';
    if(hasPills){
      pillHtml='<div id="ppu-unit-pill-row"><span class="pill-label">Display as:</span>';
      unitPills.forEach(function(p){
        var isActive=(p.unit===selectedUnit);
        var cls='ppu-unit-pill'+(isActive?' active':(!isActive&&p.isRecommended?' recommended':''));
        pillHtml+='<span class="'+cls+'" data-unit="'+(p.unit||'')+'">'+p.label+'</span>';
      });
      pillHtml+='</div>';
    }

    panel.innerHTML=
      '<div id="ppu-drag-handle"></div>'+
      '<div id="ppu-controls-wrap">'+
        '<div id="ppu-header">'+
          '<h3>Actually Useful</h3>'+
          '<div id="ppu-header-btns">'+
            '<a id="ppu-coffee" href="https://ko-fi.com/tibbalsgribbin" target="_blank">\u2615 buy me a coffee</a>'+
            '<button id="ppu-collapse" title="Collapse/expand">\u2195</button>'+
            '<button id="ppu-close" title="Close">\u00d7</button>'+
          '</div>'+
        '</div>'+
        '<div id="ppu-controls">'+
          '<label for="ppu-sort">Sort:</label>'+
          '<select id="ppu-sort">'+
            '<option value="ppu-asc">Best value \u2191</option>'+
            '<option value="price-asc">Price low\u2192high</option>'+
            '<option value="delivery-free">Soonest FREE delivery</option>'+
            '<option value="delivery-any">Soonest ANY delivery</option>'+
            '<option value="default">Default order</option>'+
          '</select>'+
          '<button id="ppu-btn-refresh">\u21ba Refresh</button>'+
          '<button id="ppu-btn-resort">Re-sort all \u21c5</button>'+
          '<button id="ppu-btn-hide-sponsored">Hide ads</button>'+
          '<button id="ppu-btn-show-checked">Show selected (0)</button>'+
          '<button id="ppu-btn-clear-checked">Clear selection</button>'+
        '</div>'+
        '<div id="ppu-filter-row">'+
          '<label for="ppu-keyword">Keyword filter:</label>'+
          '<input id="ppu-keyword" type="text" placeholder="e.g. unscented OR fragrance-free -refill" value="'+keyword.replace(/"/g,'&quot;')+'">'+
          '<button id="ppu-btn-clear-kw" title="Clear">\u00d7</button>'+
        '</div>'+
        pillHtml+
        '<div id="ppu-filter-extra-row">'+
          '<label for="ppu-min-reviews">Min reviews:</label>'+
          '<input id="ppu-min-reviews" type="number" min="0" step="50" placeholder="0" value="'+(minReviews||'')+'">'+
        '</div>'+
        (hasFresh||hasWF?
          '<div id="ppu-source-row">'+
            '<span class="label">Sources <span style="font-weight:normal;color:#888;">(click to show/hide)</span>:</span>'+
            '<span class="ppu-source-toggle src-standard'+(!srcFilter['standard']?' off':'')+'" data-src="standard">Amazon</span>'+
            (hasFresh?'<span class="ppu-source-toggle src-fresh'+(!srcFilter['fresh']?' off':'')+'" data-src="fresh">Fresh</span>':'')+
            (hasWF?'<span class="ppu-source-toggle src-wf'+(!srcFilter['whole-foods']?' off':'')+'" data-src="whole-foods">Whole Foods</span>':'')+
          '</div>':'')+
        (hasDelivery?'<div id="ppu-delivery-note">\u26a0\ufe0f Delivery dates shown where available \u00b7 Same-day and conditional free delivery may not appear \u00b7 Whole Foods "FREE" requires a separate fee</div>':'')+
        '<div id="ppu-sort-note"></div>'+
      '</div>'+
      '<div id="ppu-scroll-area">'+
        '<div id="ppu-info"></div>'+
        '<div id="ppu-list"></div>'+
        '<div id="ppu-load-more-row" style="'+(nextPageUrl?'':'display:none')+'">'+
          '<button id="ppu-btn-load-more">\u2193 Load page 2 results</button>'+
          '<button id="ppu-btn-resort-bottom">Re-sort all \u21c5</button>'+
        '</div>'+
      '</div>';

    document.body.appendChild(panel);

    var dh=document.getElementById('ppu-drag-handle');
    if(dh){
      var isDrag=false,sX,sW;
      dh.addEventListener('mousedown',function(e){isDrag=true;sX=e.clientX;sW=panel.offsetWidth;document.body.style.userSelect='none';e.preventDefault();});
      document.addEventListener('mousemove',function(e){if(!isDrag)return;panel.style.width=Math.min(700,Math.max(280,sW+(sX-e.clientX)))+'px';});
      document.addEventListener('mouseup',function(){if(isDrag){isDrag=false;document.body.style.userSelect='';}});
    }

    var sortEl=document.getElementById('ppu-sort'); sortEl.value=sortVal;
    var kwInput=document.getElementById('ppu-keyword');
    var clearKw=document.getElementById('ppu-btn-clear-kw');
    var resortBtn=document.getElementById('ppu-btn-resort');
    var resortBtnBot=document.getElementById('ppu-btn-resort-bottom');
    var showChkBtn=document.getElementById('ppu-btn-show-checked');
    var clearChkBtn=document.getElementById('ppu-btn-clear-checked');
    var hideSponsoredBtn=document.getElementById('ppu-btn-hide-sponsored');
    var minReviewsInput=document.getElementById('ppu-min-reviews');

    if(keyword){kwInput.classList.add('active');clearKw.style.display='block';}
    if(minReviews>0) minReviewsInput.classList.add('active');
    if(hasSponsored){
      hideSponsoredBtn.style.display='block';
      if(hideSponsored){hideSponsoredBtn.classList.add('active');hideSponsoredBtn.textContent='Show ads';}
    }

    // ── Render ────────────────────────────────────────────────────────────
    function render() {
      sortVal=sortEl.value;
      var kw=kwInput.value;
      var cc=Object.keys(checkedAsins).length;
      showChkBtn.style.display=cc>0?'block':'none';
      clearChkBtn.style.display=cc>0?'block':'none';
      showChkBtn.textContent=showCheckedOnly?'Show all ('+cc+' selected)':'Show selected ('+cc+')';
      resortBtn.style.display=(needsResort&&!showCheckedOnly)?'block':'none';
      resortBtnBot.style.display=(needsResort&&!showCheckedOnly)?'block':'none';

      var unitDataAvail=allData.filter(function(r){return r.ppu!=null;}).length;
      var isSparse=sortVal==='ppu-asc'&&unitDataAvail<Math.ceil(allData.length*0.1);
      var effectiveSort=isSparse?'price-asc':sortVal;

      var displayData=showCheckedOnly?allData.filter(function(r){return checkedAsins[r.asin];}):allData.slice();
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
          var av=a.freeDate?0:(a.fastDate?1:2),bv=b.freeDate?0:(b.fastDate?1:2);
          if(av!==bv)return av-bv;
          return (a.freeDate||a.fastDate||FAR)-(b.freeDate||b.fastDate||FAR);
        }
        if(effectiveSort==='delivery-any'){
          var da=a.freeDate&&a.fastDate?new Date(Math.min(a.freeDate,a.fastDate)):a.freeDate||a.fastDate||FAR;
          var db=b.freeDate&&b.fastDate?new Date(Math.min(b.freeDate,b.fastDate)):b.freeDate||b.fastDate||FAR;
          return da-db;
        }
        if(effectiveSort==='default') return a.originalIndex-b.originalIndex;
        return 0;
      }

      if(!needsResort||showCheckedOnly){
        displayData.sort(sortFn);
      } else {
        var pages={};
        displayData.forEach(function(r){if(!pages[r.page])pages[r.page]=[];pages[r.page].push(r);});
        displayData=[];
        Object.keys(pages).map(Number).sort(function(a,b){return a-b;}).forEach(function(pg){pages[pg].sort(sortFn);displayData=displayData.concat(pages[pg]);});
      }

      var hasKw=kw.trim().length>0;
      displayData=displayData.map(function(r){return Object.assign({},r,{kwMatch:!hasKw||titleMatchesKeywords(r.title,r.cardText,kw)});});
      if(hasKw&&!showCheckedOnly)
        displayData=displayData.filter(function(r){return r.kwMatch;}).concat(displayData.filter(function(r){return !r.kwMatch;}));

      var withData=allData.filter(function(r){return r.ppu!=null;}).length;
      var warnings=allData.filter(function(r){return r.source==='amazon-container';}).length;
      var hiddenSrc=allData.filter(function(r){return !srcFilter[r.grocery];}).length;
      var sponCount=allData.filter(function(r){return r.isSponsored;}).length;
      var revHiddenCt=minReviews>0?allData.filter(function(r){return r.reviewCount!=null&&r.reviewCount<minReviews;}).length:0;
      var matchCt=hasKw?displayData.filter(function(r){return r.kwMatch;}).length:null;
      var info=withData+'/'+allData.length+' have unit data';
      if(loadedPages>1)            info+=' \u00b7 '+loadedPages+' pages';
      if(warnings>0)               info+=' \u00b7 \u26a0\ufe0f '+warnings+' per-container';
      if(hasKw)                    info+=' \u00b7 \uD83D\uDD0D '+matchCt+' match filter';
      if(hiddenSrc>0)              info+=' \u00b7 '+hiddenSrc+' source-hidden';
      if(selectedUnit)             info+=' \u00b7 showing in '+selectedUnit;
      if(isLiquidDominant&&!selectedUnit) info+=' \u00b7 liquid category (oz\u2248fl oz)';
      if(showCheckedOnly)          info+=' \u00b7 '+displayData.length+' selected';
      if(hideSponsored&&sponCount>0) info+=' \u00b7 '+sponCount+' ads hidden';
      if(revHiddenCt>0)            info+=' \u00b7 '+revHiddenCt+' below min reviews';
      // v5.14: delivery sort caveat
      if(sortVal==='delivery-free'||sortVal==='delivery-any')
        info+=' \u00b7 \u26a0\ufe0f same-day & conditional free delivery may not appear';
      document.getElementById('ppu-info').textContent=info;

      var sortNoteEl=document.getElementById('ppu-sort-note');
      if(isSparse){sortNoteEl.style.display='block';sortNoteEl.textContent='Too few unit prices to sort by value \u2014 showing by price instead';}
      else sortNoteEl.style.display='none';

      function getCompPPU(r) {
        if(r.ppu==null) return null;
        if(selectedUnit){
          var from=(isLiquidDominant&&r.unit==='oz')?'fl oz':r.unit;
          return convertPPU(r.ppu,from,selectedUnit);
        }
        return normalizePPUForSort(r.ppu,r.unit,isLiquidDominant);
      }

      var ppuVals=displayData.filter(function(r){
        return r.ppu!=null&&r.source!=='amazon-container'&&r.kwMatch&&srcFilter[r.grocery]&&
               !(hideSponsored&&r.isSponsored)&&
               !(minReviews>0&&r.reviewCount!=null&&r.reviewCount<minReviews)&&
               getCompPPU(r)!=null;
      }).map(function(r){return getCompPPU(r);});
      var bestPPU=ppuVals.length?Math.min.apply(null,ppuVals):null;

      var html='',curPage=0;
      displayData.forEach(function(r){
        if(needsResort&&!showCheckedOnly&&r.page!==curPage){
          if(r.page>1) html+='<div class="ppu-divider">\u2500\u2500 Page '+r.page+' results \u2500\u2500</div>';
          curPage=r.page;
        }
        var srcHid=(r.grocery&&!srcFilter[r.grocery]);
        var sponHid=hideSponsored&&r.isSponsored;
        var revHid=minReviews>0&&r.reviewCount!=null&&r.reviewCount<minReviews;
        var priceStr=r.price!=null?'$'+r.price.toFixed(2):'\u2014';
        var countStr=r.count?r.count+' ct':'';
        var badge='',noteStr='',deliveryStr='',srcTag='';
        var isChecked=!!checkedAsins[r.asin];

        if(r.grocery==='whole-foods') srcTag='<span class="ppu-src-tag ppu-src-wf">Whole Foods</span><br>';
        else if(r.grocery==='fresh')  srcTag='<span class="ppu-src-tag ppu-src-fr">Fresh</span><br>';
        if(r.isSponsored) srcTag+='<span class="ppu-src-tag" style="background:#f0f0f0;color:#888;border:1px solid #ddd;">Ad</span><br>';

        if(r.ppu!=null){
          var compPPU=getCompPPU(r);
          var isBest=bestPPU!=null&&r.kwMatch&&r.source!=='amazon-container'&&
            srcFilter[r.grocery]&&!sponHid&&!revHid&&
            compPPU!=null&&Math.abs(compPPU-bestPPU)<0.000001;
          var isCont=r.source==='amazon-container';
          var warn=isCont?' <span style="font-size:10px;color:#aaa;">\u26a0\ufe0f per-container</span>':'';

          var dPPU=r.ppu,dUnit=r.unit,convNote='';
          if(selectedUnit){
            var fromU=(isLiquidDominant&&r.unit==='oz')?'fl oz':r.unit;
            var conv=convertPPU(r.ppu,fromU,selectedUnit);
            if(conv!=null){
              dPPU=conv;dUnit=selectedUnit;
              if(r.unit!==selectedUnit) convNote='<span class="ppu-converted">('+formatPPU(r.ppu)+'/'+r.unit+')</span>';
            } else {
              convNote='<span class="ppu-converted" style="color:#e47911;">(\u00b7 can\'t convert to '+selectedUnit+')</span>';
            }
          }

          var uDisp=dUnit?'/'+dUnit:'';
          badge='<span class="ppu-badge'+(isBest?' best':'')+(isCont?' container':'')+'"'+(isBest?' title="Best value among comparable results"':'')+'>'+formatPPU(dPPU)+uDisp+(isBest?' \u2605':'')+' </span>'+warn+convNote;
          // v5.14: note text bumped to 0.78rem via .ppu-note class
          if(r.note&&(r.source==='calc'||r.source==='calc-liquid')) noteStr='<div class="ppu-note">was: '+r.note+'</div>';
        } else {
          badge = r.source==='unavailable'
            ? '<span class="ppu-nodata">unavailable</span>'
            : '<span class="ppu-nodata">no unit data</span>';
        }

        if(r.hasCoupon) noteStr+='<div style="font-size:10px;color:#007600;margin-top:2px;">\uD83C\uDFF7\uFE0F Coupon price applied</div>';

        if(r.freeDate||r.fastDate){
          var parts=[];
          if(r.freeDate){
            var fc=r.wfFreeFlag?'ppu-delivery wf-fee':'ppu-delivery';
            var fl=r.wfFreeFlag?'<span title="Whole Foods delivery has a separate fee \u2014 not free with Prime">FREE\u2733: </span>':'FREE: ';
            var ft=formatDate(r.freeDate)+(r.freeCutoff?' <span style="font-size:10px;color:#888;">('+r.freeCutoff+')</span>':'');
            parts.push('<span class="'+fc+'">'+fl+ft+'</span>');
          }
          if(r.fastDate){
            var fst=formatDate(r.fastDate)+(r.fastCutoff?' <span style="font-size:10px;color:#888;">('+r.fastCutoff+')</span>':'');
            parts.push('<span class="ppu-delivery fast">Fastest: '+fst+'</span>');
          }
          deliveryStr='<div class="ppu-meta" style="margin-top:2px;">'+parts.join(' &nbsp; ')+'</div>';
        }

        var dimC=(!r.kwMatch&&hasKw)?' kw-mismatch':'';
        var srcC=srcHid?' src-hidden':'';
        var sponC=sponHid?' sponsored-hidden':'';
        var revC=revHid?' reviews-hidden':'';
        var chkC=isChecked?' checked':'';
        var safeAsin=r.asin.replace(/"/g,'&quot;');
        var titleHtml=(hasKw&&r.kwMatch)?highlightKeywords(r.title,r.cardText,kw):escapeHtml(r.title);

        html+=
          '<div class="ppu-row'+dimC+srcC+sponC+revC+chkC+'" data-asin="'+safeAsin+'">'+
            '<div class="ppu-cb-wrap"><input type="checkbox" class="ppu-cb"'+(isChecked?' checked':'')+' title="Add to shortlist"></div>'+
            '<div class="ppu-row-content">'+
              '<a href="'+r.href+'" target="_blank" title="'+escapeHtml(r.title)+'">'+titleHtml+'</a>'+
              srcTag+
              '<div class="ppu-meta"><span class="ppu-price">'+priceStr+'</span>'+(countStr?'<span class="ppu-count">'+countStr+'</span>':'')+badge+'</div>'+
              deliveryStr+noteStr+
            '</div>'+
          '</div>';
      });

      document.getElementById('ppu-list').innerHTML=html;
      document.querySelectorAll('.ppu-cb').forEach(function(cb){
        cb.addEventListener('change',function(){
          var row=this.closest('.ppu-row'),asin=row.getAttribute('data-asin');
          if(this.checked){checkedAsins[asin]=true;row.classList.add('checked');maybeShowNudge();}
          else{delete checkedAsins[asin];row.classList.remove('checked');}
          var cnt=Object.keys(checkedAsins).length;
          showChkBtn.style.display=cnt>0?'block':'none';
          clearChkBtn.style.display=cnt>0?'block':'none';
          showChkBtn.textContent=showCheckedOnly?'Show all ('+cnt+' selected)':'Show selected ('+cnt+')';
        });
      });
      scheduleLog();
    } // end render

    // ── Events ────────────────────────────────────────────────────────────
    sortEl.addEventListener('change',function(){sortVal=this.value;if(needsResort)needsResort=false;render();});
    function doResort(){needsResort=false;render();}
    resortBtn.addEventListener('click',doResort);
    resortBtnBot.addEventListener('click',doResort);
    showChkBtn.addEventListener('click',function(){showCheckedOnly=!showCheckedOnly;render();});
    clearChkBtn.addEventListener('click',function(){checkedAsins={};showCheckedOnly=false;render();});

    kwInput.addEventListener('input',function(){
      keyword=this.value;
      this.classList.toggle('active',this.value.trim().length>0);
      clearKw.style.display=this.value.trim().length>0?'block':'none';
      if(keyword.includes('-')) maybeShowNudge();
      render();
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

    minReviewsInput.addEventListener('input',function(){
      var val=parseInt(this.value,10);
      minReviews=isNaN(val)||val<=0?0:val;
      this.classList.toggle('active',minReviews>0);
      render();
    });

    panel.querySelectorAll('.ppu-source-toggle').forEach(function(btn){
      btn.addEventListener('click',function(){
        var src=this.getAttribute('data-src');
        srcFilter[src]=!srcFilter[src];
        this.classList.toggle('off',!srcFilter[src]);
        render();
      });
    });

    hideSponsoredBtn.addEventListener('click',function(){
      hideSponsored=!hideSponsored;
      this.classList.toggle('active',hideSponsored);
      this.textContent=hideSponsored?'Show ads':'Hide ads';
      render();
    });

    document.getElementById('ppu-collapse').addEventListener('click',function(e){e.stopPropagation();isCollapsed=!isCollapsed;panel.classList.toggle('collapsed',isCollapsed);});
    document.getElementById('ppu-close').addEventListener('click',function(e){e.stopPropagation();panel.remove();});
    document.getElementById('ppu-btn-refresh').addEventListener('click',function(){this.textContent='Refreshing\u2026';this.disabled=true;checkedAsins={};showCheckedOnly=false;setTimeout(function(){buildPanel();},100);});

    var lmBtn=document.getElementById('ppu-btn-load-more');
    if(lmBtn){
      lmBtn.addEventListener('click',function(){
        if(!nextPageUrl) return;
        var btn=this;btn.disabled=true;btn.textContent='Loading\u2026';
        var fp=loadedPages+1,si=allData.length;
        fetchPage(nextPageUrl,fp,si).then(function(result){
          allData=allData.concat(result.rows);loadedPages=fp;needsResort=true;nextPageUrl=result.nextUrl;
          isLiquidDominant=inferLiquidDominant(allData);
          if(isLiquidDominant) applyLiquidCtConversion(result.rows);
          isLiquidDominant=inferLiquidDominant(allData);
          unitPills=generateUnitPills(allData,isLiquidDominant);
          var lmRow=document.getElementById('ppu-load-more-row');
          if(nextPageUrl&&lmRow){btn.disabled=false;btn.textContent='\u2193 Load page '+(loadedPages+1)+' results';}
          else if(lmRow) lmRow.style.display='none';
          maybeShowNudge();render();
        }).catch(function(err){console.log('[PPU] Load more failed:',err);btn.textContent='Load failed \u2014 try Refresh';btn.disabled=false;});
      });
    }

    render();
  }

  function tryBuild(n){
    var cards=document.querySelectorAll('[data-component-type="s-search-result"]');
    if(cards.length>0) buildPanel();
    else if(n>0) setTimeout(function(){tryBuild(n-1);},800);
    else console.log('[PPU] Timed out.');
  }

  setTimeout(function(){tryBuild(15);},1500);

})();
