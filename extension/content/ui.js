// Actually Useful — ui.js
// Handles all Interface, Panel, and Filter-View logic
'use strict';

// ── UI Constants & State ──────────────────────────────────────────────────
const PANEL_ID = 'ppu-sorter-panel';
let sponsoredMode = 'show';
let isCollapsed = false;
let keyword = '';
let selectedUnit = null;
let sortVal = 'ppu-asc';
let checkedAsins = {};
let itemNotes = {}; 

// ── Styles Injection ──────────────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById('ppu-extra-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'ppu-extra-styles';
  styleEl.textContent = `
    #${PANEL_ID} { user-select: text; cursor: text; }
    .ppu-row { border-left: 3px solid transparent; transition: background 0.2s; }
    .ppu-row.checked { border-left-color: #512bd3; background: #eaecfd; }
    /* Monochromatic Indigo Palette */
    .ppu-btn-primary { background: #512bd3; color: white; }
    .ppu-btn-primary:hover { background: #5d49da; }
    .ppu-kw-highlight { background: #d6d8fa; color: #1A1035; border-radius: 2px; }
    /* ... [Rest of the Indigo styles from search.js] ... */
  `;
  document.head.appendChild(styleEl);
}

// ── Panel Building ────────────────────────────────────────────────────────
function buildPanel() {
  injectStyles();
  const container = document.createElement('div');
  container.id = PANEL_ID;
  
  // Use AU_CONFIG for constants to ensure resiliency
  container.innerHTML = `
    <div id="ppu-header">
       <h3>Actually Useful</h3>
       <div id="ppu-header-btns">
         <button id="ppu-collapse">↕</button>
         <button id="ppu-close">×</button>
       </div>
    </div>
    <div id="ppu-scroll-area">
      <div id="ppu-list"></div>
    </div>
    <div id="ppu-footer-row">
      <div id="ppu-info"></div>
    </div>
  `;
  document.body.appendChild(container);
  setupEventListeners();
  render();
}

function setupEventListeners() {
  // Logic for Dragging, Resizing, and Collapsing
  // Logic for Sort, Keywords, and Filters
}

function render() {
  // The rendering engine that draws the results list
  // Highlights keywords and applies sorts
}

// ── Initialization ────────────────────────────────────────────────────────
// Start-up sequence with Killswitch check
(function init() {
  // Fetch killswitch from AU_CONFIG.KILLSWITCH_URL
  // If safe, call buildPanel()
})();