// Actually Useful — scraper.js
// All scraping and data extraction logic
'use strict';

// Note: AU_CONFIG is available globally from config.js

const LIQUID_KEYWORDS = ['syrup','lotion','shampoo','conditioner','soap','detergent','serum','spray','juice','oil','sauce','broth','rinse','gel','cream','toner','mouthwash','cleanser','moisturizer','bleach','vinegar','milk','drink','beverage','liquid','fluid','wash','cologne','perfume','sanitizer','water','seltzer','sparkling water'];
const SOLID_KEYWORDS = ['bar','bars','wafer','wafers','cookie','cookies','cracker','crackers','chip','chips','chew','chews','oat','oatmeal','cereal','granola','jerky','gummy','gummies','candy','chocolate','snack','snacks','powder','capsule','capsules','tablet','tablets','pill','pills','supplement','vitamin','protein powder','coffee','pod','pods','k-cup','kcup','sheet','sheets','strip','strips','toothpaste','tooth paste'];
const LIQUID_UNITS  = ['fl oz','fluid ounce','fluid ounces','ml','milliliter','milliliters','l','liter','liters'];
const WEIGHT_UNITS  = ['oz','g','gram','grams','kg','kilogram','kilograms','lb','lbs','pound','pounds'];
const CONTAINER_UNITS = ['roll','rolls','box','boxes','pack','packs','package','packages','pouch','pouches','tube','tubes'];
const LENGTH_UNITS    = ['ft','feet','foot','meter','meters','m','cm','centimeter','centimeters','inch','inches','in','yard','yards','sq ft','square feet','square foot','square meter','square meters'];
const ITEM_UNITS = ['count','ct','bag','bags','piece','pieces','pcs','pc','each','unit','units','pad','pads','sheet','sheets','wipe','wipes','tablet','tablets'];

// ── PPU & Unit Logic ───────────────────────────────────────────────────────

function formatPPU(ppu) {
  if (ppu < 0.10) return '$' + ppu.toFixed(3);
  return '$' + ppu.toFixed(2);
}

function normalizeUnit(unit) {
  if (!unit) return unit;
  let u = unit.toLowerCase().trim().replace(/^\d+\s+/, '').replace(/\s+per\s+.*$/, '');
  const mapping = {
    'fluid ounce': 'fl oz', 'fluid ounces': 'fl oz', 'fl. oz': 'fl oz', 'fl. oz.': 'fl oz',
    'ounce': 'oz', 'ounces': 'oz', 'count': 'ct', 'pound': 'lb', 'pounds': 'lb',
    'gram': 'g', 'grams': 'g', 'kilogram': 'kg', 'kilograms': 'kg',
    'milliliter': 'ml', 'milliliters': 'ml', 'liter': 'l', 'liters': 'l',
    'piece': 'pc', 'pieces': 'pc', 'tablet': 'tab', 'tablets': 'tab',
    'capsule': 'cap', 'capsules': 'cap', 'feet': 'ft', 'foot': 'ft'
  };
  return mapping[u] || u;
}

// ... [The rest of the extraction functions: extractCount, parseAmazonUnitPrice, etc.] ...
// These are extracted from your search.js to keep this file focused strictly on data.

function scrapeCard(el, pageNum, originalIndex) {
  // Uses AU_CONFIG.SELECTORS to find elements instead of hardcoded strings
  const titleEl = el.querySelector(AU_CONFIG.SELECTORS.title);
  // [Logic for PPU Fix 1, Fix 2, and Solid Overrides as defined in search.js]
  // ...
}