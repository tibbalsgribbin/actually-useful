// Actually Useful — search.js
// Content script for Amazon search results pages (/s*)
// Part of the Actually Useful Chrome/Edge extension (v6.0.0)

'use strict';

const PANEL_ID = 'ppu-sorter-panel';
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

  // ── Search Context Persistence (v6.0.0) ───────────────────────────────────
  // Saves current search term and ASINs to background service worker via
  // chrome.runtime.sendMessage so product.js can read them on the next page.
  function saveSearchContext(term, asins) {
    if (!term) return;
    try {
      chrome.runtime.sendMessage({
        type: 'AU_SAVE_SEARCH_CONTEXT',
        payload: { term: term, asins: asins || [] }
      });
    } catch(e) {}
  }

  // sendLog → delegates to auSendLog from core.js
  function sendLog(data) {
    try {
      auSendLog(Object.assign({
        searchUrl: window.location.href,
        searchTerm: (new URLSearchParams(window.location.search).get('k')||'').trim(),
      }, data));
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
    // v5.19: also show per-item pill when any items have derived per-item prices
    var hasAltPPU = data.some(function(r){ return r.altPPU!=null; });

    if (hasLiquidUnit) {
      pills.push({ unit:'fl oz', label:'fl oz', isRecommended: isLiqDom });
      pills.push({ unit:'ml',    label:'ml',    isRecommended: false });
    }
    if (hasWeightUnit) {
      pills.push({ unit:'oz', label:'oz (weight)', isRecommended: false });
      pills.push({ unit:'g',  label:'g',  isRecommended: false });
    }
    // Show per-item pill when count units exist alongside weight/liquid units,
    // OR when derived per-item prices are available (v5.19)
    // Suppress in liquid-dominant mode (where ct items may be convertible to fl oz)
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
    // udm-primary-delivery-message: "FREE delivery Overnight 4 AM - 8 AM on $25 of qualifying items"
    // udm-secondary-delivery-message: "Or $4.99 delivery in 3 hours"
    // udm-badge-block: Prime badge label e.g. "Overnight"
    var deliverySelectors = [
      '.udm-primary-delivery-message',
      '.udm-secondary-delivery-message',
      '.udm-badge-block',
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
    // Exclusions against title (word-boundary) AND cardText (substring).
    // Note: cardText now includes delivery info, so e.g. "-free" will suppress free-delivery cards.
    for (var i=0; i<parsed.exclusions.length; i++) {
      var word = parsed.exclusions[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var re = new RegExp('\\b' + word + '\\b', 'i');
      if (re.test(nt)) return false;
      if (nc.toLowerCase().includes(parsed.exclusions[i])) return false;
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

  // ── Delivery window start time ────────────────────────────────────────────
  // Parses the start time from a primary delivery message window like
  // "FREE delivery Today 10 AM - 3 PM" → 600 (minutes since midnight).
  // Used as a tiebreaker when two cards share the same delivery date.
  // Only reads .udm-primary-delivery-message to avoid the paid secondary option.
  // Returns Infinity if no window found (sorts to bottom within same date).
  function parseDeliveryWindowMinutes(el) {
    var msgEl = el.querySelector('.udm-primary-delivery-message');
    if (!msgEl) return Infinity;
    var text = msgEl.textContent || '';
    // Match "10 AM - 3 PM" or "5 PM - 10 PM" — capture start hour and meridiem
    var m = text.match(/(\d{1,2})\s*(AM|PM)\s*[-–]\s*\d{1,2}\s*(?:AM|PM)/i);
    if (!m) return Infinity;
    var hour = parseInt(m[1], 10);
    var meridiem = m[2].toUpperCase();
    if (meridiem === 'AM') {
      return hour === 12 ? 0 : hour * 60;
    } else {
      return hour === 12 ? 720 : (hour + 12) * 60;
    }
  }

  // Converts minutes-since-midnight back to a readable "by 10 AM" label
  function formatWindowMinutes(mins) {
    if (mins === Infinity || mins == null) return '';
    var h = Math.floor(mins / 60);
    var meridiem = h < 12 ? 'AM' : 'PM';
    var display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return 'by ' + display + ' ' + meridiem;
  }

  // Extracts qualifying condition from primary delivery message, e.g. "on $25 of qualifying items"
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
  // Nudge — delegates directly to core.js callback-based functions.
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
            '<a id="ppu-nudge-yes" href="https://ko-fi.com/tibbalsgribbin" target="_blank">Contribute \u2665</a>'+
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


  // CSS lives in content/shared/styles.css — injected automatically by manifest.json.
  function injectStyles() { /* no-op in extension */ }

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
      /(\d[\d,]*)\s*-?\s*count/i,/(\d[\d,]*)\s*ct\b/i,
      /(\d[\d,]*)\s*-?\s*bags?/i,/(\d[\d,]*)\s*-?\s*pcs\.?/i,
      /(\d[\d,]*)\s*-?\s*pieces?/i,/(\d[\d,]*)\s*-?\s*pack/i,/(\d[\d,]*)\s*-?\s*rolls?/i,
      /(\d[\d,]*)\s*-?\s*bars?\b/i,
      /pack\s+of\s+(\d[\d,]*)/i,/box\s+of\s+(\d[\d,]*)/i,
      // Looser: number + up to 3 words + unit (e.g. "12 Individually Wrapped Bars")
      /(\d[\d,]*)\s+\w+\s+\w+\s+bars?\b/i,
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
    if(/\d[\d,]*\s*-?\s*bars?/i.test(text))     return 'ct';
    // pack and count now both return 'ct' — per-item, not per-pack
    if(/\d[\d,]*\s*-?\s*pack/i.test(text))      return 'ct';
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
    var freeWindowMinutes=parseDeliveryWindowMinutes(el);
    var freeQualifier=parseDeliveryQualifier(el);
    var base={title,href,asin,price,count,page,grocery,wfFreeFlag,isSponsored,hasCoupon,
              cardText,reviewCount,originalIndex:originalIndex||0,
              freeDate:delivery.freeDate,fastDate:delivery.fastDate,
              freeCutoff:delivery.freeCutoff,fastCutoff:delivery.fastCutoff,
              freeWindowMinutes:freeWindowMinutes,freeQualifier:freeQualifier};

    // ── Amazon reported a unit price ────────────────────────────────────────
    if(ap&&ITEM_UNITS.includes(ap.unit)) {
      // v5.14: if Amazon says ct but we have price and count, recalculate to
      // confirm, and in liquid-dominant context attempt fl oz conversion
      if(ap.unit==='ct'&&count&&price) {
        var perItem=price/count;
        // Use Amazon's ct price as-is (it may reflect per-can, etc.)
        return Object.assign(base,{ppu:ap.ppu,unit:'ct',source:'amazon'});
      }
      // v5.19: when Amazon reports weight/liquid unit but title has count,
      // derive per-item price so ct pill works for these items
      if(count&&price&&ap.unit!=='ct') {
        var altUnit=guessCountUnit(title)||guessUnitFromTitle(title)||'ct';
        return Object.assign(base,{ppu:ap.ppu,unit:ap.unit,source:'amazon',altPPU:price/count,altUnit:altUnit});
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
  var sponsoredMode    = 'show'; // 'show' | 'demote' | 'hide'
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
        couponCount,sponsoredCount,hideSponsoredActive:sponsoredMode,
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

    // v6.0.0: Save search context to background service worker so product.js
    // knows what search we came from when the user clicks through to a product page.
    var searchTerm=(new URLSearchParams(window.location.search).get('k')||'').trim();
    saveSearchContext(searchTerm, allData.map(function(r){return r.asin;}));

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
          '<button id="ppu-btn-hide-sponsored">Demote ads</button>'+
          '<button id="ppu-btn-reset-filters">Start over</button>'+
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
      document.addEventListener('mousemove',function(e){if(!isDrag)return;panel.style.width=Math.min(900,Math.max(280,sW+(sX-e.clientX)))+'px';});
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
    var resetFiltersBtn=document.getElementById('ppu-btn-reset-filters');
    var minReviewsInput=document.getElementById('ppu-min-reviews');

    if(keyword){kwInput.classList.add('active');clearKw.style.display='block';}
    if(minReviews>0) minReviewsInput.classList.add('active');
    if(hasSponsored){
      hideSponsoredBtn.style.display='block';
      if(sponsoredMode==='demote'){hideSponsoredBtn.classList.add('active');hideSponsoredBtn.textContent='Hide ads';}
      else if(sponsoredMode==='hide'){hideSponsoredBtn.classList.add('active');hideSponsoredBtn.textContent='Show ads';}
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

      var anyFilterActive = keyword.trim().length>0 || minReviews>0 ||
        Object.keys(srcFilter).some(function(k){ return !srcFilter[k]; }) ||
        sortVal!=='ppu-asc' || sponsoredMode!=='show';
      resetFiltersBtn.classList.toggle('active',anyFilterActive);

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
          var dateDiff=(a.freeDate||a.fastDate||FAR)-(b.freeDate||b.fastDate||FAR);
          if(dateDiff!==0) return dateDiff;
          // Tiebreaker: earlier delivery window start time wins
          return (a.freeWindowMinutes||Infinity)-(b.freeWindowMinutes||Infinity);
        }
        if(effectiveSort==='delivery-any'){
          var da=a.freeDate&&a.fastDate?new Date(Math.min(a.freeDate,a.fastDate)):a.freeDate||a.fastDate||FAR;
          var db=b.freeDate&&b.fastDate?new Date(Math.min(b.freeDate,b.fastDate)):b.freeDate||b.fastDate||FAR;
          var dateDiffAny=da-db;
          if(dateDiffAny!==0) return dateDiffAny;
          // Tiebreaker: earlier delivery window start time wins
          return (a.freeWindowMinutes||Infinity)-(b.freeWindowMinutes||Infinity);
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
      if(sponsoredMode==='demote'&&sponCount>0) info+=' \u00b7 '+sponCount+' ads demoted';
      if(sponsoredMode==='hide'&&sponCount>0)   info+=' \u00b7 '+sponCount+' ads hidden';
      if(revHiddenCt>0)            info+=' \u00b7 '+revHiddenCt+' below min reviews';
      // v5.14: delivery sort caveat
      if(sortVal==='delivery-free'||sortVal==='delivery-any')
        info+=' \u00b7 \u26a0\ufe0f same-day & conditional free delivery may not appear';
      document.getElementById('ppu-info').textContent=info;

      var sortNoteEl=document.getElementById('ppu-sort-note');
      if(isSparse){sortNoteEl.style.display='block';sortNoteEl.textContent='Too few unit prices to sort by value \u2014 showing by price instead';}
      else sortNoteEl.style.display='none';

      var COUNT_PILL_UNITS = ['ct','count','each','pc','piece','pieces','pcs','unit','units','pad','pads','sheet','sheets','wipe','wipes','tablet','tablets','capsule','cap','roll','bag'];
      function getCompPPU(r) {
        if(r.ppu==null) return null;
        if(selectedUnit){
          // v5.19: if user selected a count-type pill and item has a derived per-item price, use it
          if(r.altPPU!=null && COUNT_PILL_UNITS.indexOf(selectedUnit)!==-1) {
            return r.altPPU;
          }
          var from=(isLiquidDominant&&r.unit==='oz')?'fl oz':r.unit;
          return convertPPU(r.ppu,from,selectedUnit);
        }
        return normalizePPUForSort(r.ppu,r.unit,isLiquidDominant);
      }

      var ppuVals=displayData.filter(function(r){
        return r.ppu!=null&&r.source!=='amazon-container'&&r.kwMatch&&srcFilter[r.grocery]&&
               !(sponsoredMode==='hide'&&r.isSponsored)&&
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
        var sponHid=sponsoredMode==='hide'&&r.isSponsored;
        var sponDem=sponsoredMode==='demote'&&r.isSponsored;
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
            // v5.19: use derived per-item price when count pill selected
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
            var ftParts=[formatDate(r.freeDate)];
            if(r.freeWindowMinutes!==Infinity) ftParts.push('<span style="font-size:12px;">'+formatWindowMinutes(r.freeWindowMinutes)+'</span>');
            else if(r.freeCutoff) ftParts.push('<span style="font-size:12px;">'+r.freeCutoff+'</span>');
            if(r.freeQualifier) ftParts.push('<span style="font-size:12px;">'+r.freeQualifier+'</span>');
            var ft=ftParts.join(' <span style="font-size:12px;">·</span> ');
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
        var sponC=sponHid?' sponsored-hidden':(sponDem?' sponsored-demoted':'');
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
    resetFiltersBtn.addEventListener('click',function(){
      if(!this.classList.contains('active')) return;
      // Reset all filters to defaults
      kwInput.value=''; keyword='';
      kwInput.classList.remove('active'); clearKw.style.display='none';
      minReviews=0; minReviewsInput.value='';
      minReviewsInput.classList.remove('active');
      srcFilter={'standard':true,'fresh':true,'whole-foods':true};
      panel.querySelectorAll('.ppu-source-toggle').forEach(function(btn){
        btn.classList.remove('off');
      });
      sponsoredMode='show';
      hideSponsoredBtn.classList.remove('active');
      hideSponsoredBtn.textContent='Demote ads';
      sortVal='ppu-asc'; sortEl.value='ppu-asc';
      render();
    });

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
      if(sponsoredMode==='show')       sponsoredMode='demote';
      else if(sponsoredMode==='demote') sponsoredMode='hide';
      else                              sponsoredMode='show';
      this.classList.toggle('active',sponsoredMode!=='show');
      if(sponsoredMode==='show')       this.textContent='Demote ads';
      else if(sponsoredMode==='demote') this.textContent='Hide ads';
      else                              this.textContent='Show ads';
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