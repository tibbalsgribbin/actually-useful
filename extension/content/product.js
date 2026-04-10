// Actually Useful — content/product.js
// Product detail page companion panel
// Injected on https://www.amazon.com/dp/* by manifest.json

// ─── Constants ────────────────────────────────────────────────────────────────

const PANEL_ID = 'ppu-product-panel';

// ─── ASIN extraction ──────────────────────────────────────────────────────────

function getCurrentAsin() {
  const urlMatch = location.pathname.match(/\/dp\/([A-Z0-9]{10})/);
  if (urlMatch) return urlMatch[1];
  // Fallback: look for data-asin on the main product image or buybox
  const el = document.querySelector('[data-asin]');
  return el ? el.getAttribute('data-asin') : null;
}

// ─── DOM scrapers ─────────────────────────────────────────────────────────────

function scrapeTitle() {
  const el = document.getElementById('productTitle');
  return el ? el.textContent.trim() : '';
}

function scrapePrice() {
  const el = document.querySelector('.priceToPay');
  if (!el) return '';
  // .priceToPay may contain whole + fraction as separate spans
  const whole = el.querySelector('.a-price-whole');
  const fraction = el.querySelector('.a-price-fraction');
  if (whole) {
    return '$' + whole.textContent.replace(/[^0-9]/g, '') + '.' + (fraction ? fraction.textContent.replace(/[^0-9]/g, '') : '00');
  }
  const txt = el.textContent.trim();
  return txt.startsWith('$') ? txt : '';
}

function scrapeMerchant() {
  // Primary: #sfsb_accordion_head gives "Ships from: X   Sold by: Y"
  const head = document.getElementById('sfsb_accordion_head');
  if (head) {
    const txt = head.textContent.replace(/\s+/g, ' ').trim();
    const shipsMatch = txt.match(/Ships from[:\s]+([^S]+?)(?=Sold|$)/i);
    const soldMatch = txt.match(/Sold by[:\s]+(.+?)$/i);
    return {
      shipsFrom: shipsMatch ? shipsMatch[1].trim() : '',
      soldBy: soldMatch ? soldMatch[1].trim() : '',
    };
  }
  // Fallback: read the two feature divs separately
  const shipsEl = document.getElementById('offer-display-features');
  const soldEl = document.getElementById('merchantInfoFeature_feature_div');
  return {
    shipsFrom: shipsEl ? shipsEl.textContent.replace(/\s+/g, ' ').replace(/Ships from/i, '').trim() : '',
    soldBy: soldEl ? soldEl.textContent.replace(/\s+/g, ' ').replace(/Sold by/i, '').trim() : '',
  };
}

function scrapeDelivery() {
  // Prefer the shorter, cleaner block
  const el = document.getElementById('mir-layout-DELIVERY_BLOCK') ||
             document.getElementById('deliveryBlockMessage');
  if (!el) return { text: '', isPrime: false };
  // Collapse whitespace and strip trailing noise
  let txt = el.textContent.replace(/\s+/g, ' ').trim();
  // Strip "Shorter shipping distance" and anything after
  txt = txt.replace(/Shorter shipping distance.*/i, '').trim();
  const isPrime = /FREE delivery/i.test(txt);
  return { text: txt, isPrime };
}

function scrapeRating() {
  const el = document.getElementById('acrPopover');
  if (!el) return '';
  return el.getAttribute('title') || el.textContent.trim().slice(0, 20);
}

function scrapeReviewCount() {
  const el = document.getElementById('acrCustomerReviewText');
  return el ? el.textContent.trim() : '';
}

function scrapeCoupon() {
  // Find leaf nodes whose text starts with "Coupon price" — cleanest signal
  const candidates = document.querySelectorAll('[class*="coupon"]');
  for (const el of candidates) {
    if (el.children.length === 0) {
      const txt = el.textContent.trim();
      if (/^Coupon price/i.test(txt)) {
        // Extract price: "Coupon price $8.99" → "$8.99"
        const match = txt.match(/\$[\d.]+/);
        return match ? match[0] : txt.slice(0, 40);
      }
    }
  }
  // Secondary: look for element with both "Coupon price" and "Saving"
  for (const el of candidates) {
    const txt = el.textContent.replace(/\s+/g, ' ').trim();
    if (/Coupon price/i.test(txt) && txt.length < 80) {
      const match = txt.match(/\$([\d.]+)/);
      return match ? '$' + match[1] : '';
    }
  }
  return '';
}

function scrapeFrequentlyReturned() {
  const el = document.querySelector('[data-feature-name="frugalWidgetHeader"]') ||
             document.getElementById('frugal-widget-header');
  return el ? el.textContent.trim().slice(0, 80) : '';
}

function scrapeSubscribeAndSave() {
  // Detect presence by looking for the canonical "No fees" string in any sns element
  const candidates = document.querySelectorAll('[id*="sns"]');
  for (const el of candidates) {
    if (/No fees/i.test(el.textContent)) return true;
  }
  // Also check for the section heading
  const heading = document.querySelector('[id*="sns"] .a-accordion-item-heading');
  return !!heading;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

// Truncate a product title to a sensible search query (~6 words, drop model numbers)
function titleToSearchQuery(title) {
  if (!title) return '';
  // Remove content in parentheses (often model numbers, color variants)
  let q = title.replace(/\([^)]*\)/g, '').trim();
  // Remove long alphanumeric tokens that look like model numbers
  q = q.replace(/\b[A-Z0-9]{6,}\b/g, '').trim();
  // Take first 6 words
  const words = q.split(/\s+/).filter(Boolean);
  return words.slice(0, 6).join(' ');
}

// ─── Panel HTML builders ──────────────────────────────────────────────────────

function buildDataRow(label, value, extraClass) {
  if (!value) return '';
  return `
    <div class="ppu-product-row${extraClass ? ' ' + extraClass : ''}">
      <span class="ppu-product-label">${label}</span>
      <span class="ppu-product-value">${value}</span>
    </div>`;
}

function buildPanelFromSearch(asin, context) {
  const { term, items } = context; // items: [{ asin, title, price, ppu, ppuUnit }]

  // Find position of current ASIN in the list
  const idx = items ? items.findIndex(item => item.asin === asin) : -1;
  const position = idx >= 0 ? `Result ${idx + 1} of ${items.length}` : '';

  const listRows = (items || []).map((item, i) => {
    const isCurrent = item.asin === asin;
    const ppuStr = item.ppu ? `<span class="ppu-product-ppu">${item.ppu}/${item.ppuUnit}</span>` : '';
    return `
      <div class="ppu-product-list-row${isCurrent ? ' ppu-product-list-current' : ''}">
        <span class="ppu-product-list-title">${item.title || item.asin}</span>
        ${ppuStr}
        ${item.price ? `<span class="ppu-product-list-price">${item.price}</span>` : ''}
        ${isCurrent ? '<span class="ppu-product-list-badge">Viewing</span>' : ''}
      </div>`;
  }).join('');

  return `
    <div class="ppu-product-section ppu-product-context-header">
      <div class="ppu-product-context-label">Researching</div>
      <div class="ppu-product-context-term">${term}</div>
      ${position ? `<div class="ppu-product-context-position">${position}</div>` : ''}
    </div>
    <div class="ppu-product-section ppu-product-list-section">
      <div class="ppu-product-list-scroll">${listRows}</div>
    </div>`;
}

function buildPanelCold(data) {
  const { price, merchant, delivery, rating, reviewCount, coupon, frequentlyReturned, snsPresent } = data;

  const primeIndicator = delivery.isPrime
    ? '<span class="ppu-product-prime-badge">✓ prime</span>'
    : '';

  const deliveryDisplay = delivery.text
    ? `${delivery.text} ${primeIndicator}`
    : primeIndicator || '—';

  const merchantDisplay = merchant.shipsFrom && merchant.soldBy
    ? `Ships from ${merchant.shipsFrom} · Sold by ${merchant.soldBy}`
    : merchant.shipsFrom || merchant.soldBy || '—';

  const snsWarning = snsPresent
    ? `<div class="ppu-product-warning">⚠ Subscribe &amp; Save is available — check which option is pre-selected before adding to cart.</div>`
    : '';

  const frWarning = frequentlyReturned
    ? `<div class="ppu-product-warning ppu-product-warning-fr">⚠ ${frequentlyReturned}</div>`
    : '';

  const ratingDisplay = rating && reviewCount ? `${rating} ${reviewCount}` : rating || '';

  return `
    <div class="ppu-product-section">
      ${buildDataRow('Price', price)}
      ${coupon ? buildDataRow('Coupon price', coupon, 'ppu-product-coupon') : ''}
      ${buildDataRow('Seller', merchantDisplay)}
      ${buildDataRow('Delivery', deliveryDisplay)}
      ${buildDataRow('Rating', ratingDisplay)}
      <div class="ppu-product-row">
        <span class="ppu-product-label">Returns</span>
        <span class="ppu-product-value">
          <a class="ppu-product-link" href="https://www.amazon.com/gp/help/customer/display.html?nodeId=GKM69DUUYKQWKWX7" target="_blank" title="Opens in a new tab">View return policy ↗</a>
        </span>
      </div>
      ${frWarning}
      ${snsWarning}
    </div>`;
}

// ─── Shortlist section ────────────────────────────────────────────────────────

function buildShortlistSection(asin, data) {
  return `
    <div class="ppu-product-section ppu-product-shortlist-section" id="au-shortlist-section">
      <div class="ppu-product-shortlist-row">
        <button id="au-btn-shortlist" class="ppu-product-btn">☆ Save to shortlist</button>
      </div>
      <div id="au-note-area" style="display:none">
        <textarea id="au-note-input" class="ppu-product-note-input" placeholder="Add a note (optional)…" rows="2"></textarea>
        <button id="au-btn-note-save" class="ppu-product-btn ppu-product-btn-small">Save note</button>
      </div>
      <div id="au-shortlist-status" class="ppu-product-shortlist-status"></div>
    </div>`;
}

// ─── Search button ────────────────────────────────────────────────────────────

function buildSearchButton(title) {
  const query = titleToSearchQuery(title);
  return `
    <div class="ppu-product-section ppu-product-search-section">
      <button id="au-btn-start-search" class="ppu-product-btn ppu-product-btn-search"
        data-query="${query.replace(/"/g, '&quot;')}"
        title="Opens Amazon search in a new tab">
        🔍 Search: "${query}"
      </button>
    </div>`;
}

// ─── Panel shell ──────────────────────────────────────────────────────────────

function buildPanelShell(innerHtml, title) {
  return `
    <div id="${PANEL_ID}">
      <div class="ppu-product-header">
        <span class="ppu-product-header-title">Actually Useful</span>
        <button id="au-product-close" class="ppu-product-close" title="Close">×</button>
      </div>
      <div class="ppu-product-title-block">${title}</div>
      <div class="ppu-product-body">
        ${innerHtml}
      </div>
    </div>`;
}

// ─── Wire up interactions ─────────────────────────────────────────────────────

function wirePanel(asin, pageData) {
  // Close button
  document.getElementById('au-product-close').addEventListener('click', () => {
    const panel = document.getElementById(PANEL_ID);
    if (panel) panel.remove();
  });

  // Search button
  const searchBtn = document.getElementById('au-btn-start-search');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const query = searchBtn.getAttribute('data-query');
      if (query) {
        window.open('https://www.amazon.com/s?k=' + encodeURIComponent(query), '_blank');
      }
    });
  }

  // Shortlist button
  const shortlistBtn = document.getElementById('au-btn-shortlist');
  if (shortlistBtn) {
    // Check if already shortlisted
    auShortlistHas(asin, (alreadyIn) => {
      if (alreadyIn) {
        shortlistBtn.textContent = '★ Shortlisted';
        shortlistBtn.classList.add('ppu-product-btn-active');
      }
    });

    shortlistBtn.addEventListener('click', () => {
      auShortlistHas(asin, (alreadyIn) => {
        if (alreadyIn) {
          // Toggle off
          auShortlistRemove(asin, () => {
            shortlistBtn.textContent = '☆ Save to shortlist';
            shortlistBtn.classList.remove('ppu-product-btn-active');
            document.getElementById('au-note-area').style.display = 'none';
            document.getElementById('au-shortlist-status').textContent = '';
          });
        } else {
          // Show note area before saving
          const noteArea = document.getElementById('au-note-area');
          noteArea.style.display = 'block';
          shortlistBtn.textContent = '★ Shortlisted';
          shortlistBtn.classList.add('ppu-product-btn-active');
          // Save immediately without note; note save button updates it
          saveToShortlist(asin, pageData, '');
        }
      });
    });

    // Note save button
    const noteSaveBtn = document.getElementById('au-btn-note-save');
    if (noteSaveBtn) {
      noteSaveBtn.addEventListener('click', () => {
        const note = document.getElementById('au-note-input').value.trim();
        saveToShortlist(asin, pageData, note);
        document.getElementById('au-shortlist-status').textContent = 'Note saved.';
        setTimeout(() => {
          document.getElementById('au-shortlist-status').textContent = '';
        }, 2000);
      });
    }
  }

  // Scroll list to highlighted item if in search context mode
  const currentRow = document.querySelector('.ppu-product-list-current');
  if (currentRow) {
    currentRow.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

function saveToShortlist(asin, pageData, note) {
  const item = {
    asin,
    title: pageData.title,
    price: pageData.price,
    ppu: '',       // not available on product page in v6.0
    ppuUnit: '',
    shipsFrom: pageData.merchant ? pageData.merchant.shipsFrom : '',
    soldBy: pageData.merchant ? pageData.merchant.soldBy : '',
    prime: pageData.delivery ? pageData.delivery.isPrime : false,
    delivery: pageData.delivery ? pageData.delivery.text : '',
    rating: pageData.rating,
    reviewCount: pageData.reviewCount,
    coupon: pageData.coupon,
    note,
    timestamp: Date.now(),
    url: auTagUrl(location.href),
  };
  auShortlistAdd(item, () => {
    // Callback fires when saved — nothing more needed here
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function init() {
  // Don't run if panel already exists
  if (document.getElementById(PANEL_ID)) return;

  const asin = getCurrentAsin();
  if (!asin) return; // Not a product page we can identify

  // Scrape everything we need from the page now
  const pageData = {
    asin,
    title: scrapeTitle(),
    price: scrapePrice(),
    merchant: scrapeMerchant(),
    delivery: scrapeDelivery(),
    rating: scrapeRating(),
    reviewCount: scrapeReviewCount(),
    coupon: scrapeCoupon(),
    frequentlyReturned: scrapeFrequentlyReturned(),
    snsPresent: scrapeSubscribeAndSave(),
  };

  // Ask background worker if we arrived from a search
  chrome.runtime.sendMessage({ type: 'AU_GET_SEARCH_CONTEXT' }, (context) => {
    let bodyHtml = '';

    if (context && context.term && context.items && context.items.length > 0) {
      // Arrived from search — show research mode
      bodyHtml = buildPanelFromSearch(asin, context);
    } else {
      // Cold arrival — standalone evaluation mode
      bodyHtml = buildPanelCold(pageData);
    }

    // Both modes get the shortlist section and search button
    bodyHtml += buildShortlistSection(asin, pageData);
    bodyHtml += buildSearchButton(pageData.title);

    // Build and inject panel
    const shell = buildPanelShell(bodyHtml, pageData.title);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = shell;
    document.body.appendChild(wrapper.firstElementChild);

    // Wire up all interactions
    wirePanel(asin, pageData);
  });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
