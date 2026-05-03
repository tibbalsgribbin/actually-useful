// Actually Useful — config.js
// Centralized configuration for selectors and resilience
'use strict';

const AU_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: 'https://bnqgeguulurcrbkdpfzv.supabase.co',
  SUPABASE_KEY: 'sb_publishable_h70-MNvomO4EpJrpXgcdjw__motBOdi',

  // Fragile Amazon Selectors (Update these when Amazon breaks)
  SELECTORS: {
    productCard: '[data-component-type="s-search-result"]',
    title: 'h2 a span, h2 span',
    wholePrice: '.a-price-whole',
    fractionPrice: '.a-price-fraction',
    offscreenPrice: '.a-price .a-offscreen',
    primeIcon: '.a-icon-prime, [aria-label="Amazon Prime"], [data-component-type*="prime"]',
    unitPriceContainer: '.a-size-base.a-color-base, .a-size-base-plus.a-color-base'
  },

  // Logic Constants
  PAGES_SLIDER_MAX: 7,
  THROTTLE_MS: 750
};