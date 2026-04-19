// Actually Useful — Usage Log Apps Script
// Deploy as: Web app → Execute as: Me → Who has access: Anyone
// Paste the deployment URL into AU_LOG_URL in core.js

const SHEET_NAME = 'Sheet1';

const COLUMNS = [
  'Timestamp',
  'Script Version',
  'Search URL',
  'Search Term',
  'Total Results',
  'Results With Unit Data',
  'Results Without Unit Data',
  'Units Found',
  'Sort Method',
  'Keyword Filter',
  'Keyword Filter Active',
  'Pages Loaded',
  'Retailer Sources',
  'Count Standard',
  'Count Fresh',
  'Count Whole Foods',
  'Count Partner',
  'Count Pharmacy',
  'Liquid Dominant',
  'Selected Unit',
  'Coupon Count',
  'SNS Count',
  'Coupon Pill Count',
  'Coupon Undetected Count',
  'Coupon Undetected ASINs',
  'Sponsored Count',
  'Hide Sponsored Active',
  'Shortlist Count',
  'Min Reviews Filter',
  'Panel Moved',
  'Sort Changed',
  'Sort Changed To',
  'Session Source',
  'User Agent',
  'Event'
];

// Map from payload field names to column headers
const FIELD_MAP = {
  'timestamp':              'Timestamp',
  'scriptVersion':          'Script Version',
  'searchUrl':              'Search URL',
  'searchTerm':             'Search Term',
  'totalResults':           'Total Results',
  'resultsWithUnit':        'Results With Unit Data',
  'resultsWithoutUnit':     'Results Without Unit Data',
  'unitsFound':             'Units Found',
  'sortMethod':             'Sort Method',
  'keywordFilter':          'Keyword Filter',
  'keywordFilterActive':    'Keyword Filter Active',
  'pagesLoaded':            'Pages Loaded',
  'retailerSources':        'Retailer Sources',
  'countStandard':          'Count Standard',
  'countFresh':             'Count Fresh',
  'countWholefoods':        'Count Whole Foods',
  'countPartner':           'Count Partner',
  'countPharmacy':          'Count Pharmacy',
  'liquidDominant':         'Liquid Dominant',
  'selectedUnit':           'Selected Unit',
  'couponCount':            'Coupon Count',
  'snsCount':               'SNS Count',
  'couponPillCount':        'Coupon Pill Count',
  'couponUndetectedCount':  'Coupon Undetected Count',
  'couponUndetectedAsins':  'Coupon Undetected ASINs',
  'sponsoredCount':         'Sponsored Count',
  'hideSponsoredActive':    'Hide Sponsored Active',
  'shortlistCount':         'Shortlist Count',
  'minReviewsFilter':       'Min Reviews Filter',
  'panelMoved':             'Panel Moved',
  'sortChanged':            'Sort Changed',
  'sortChangedTo':          'Sort Changed To',
  'sessionSource':          'Session Source',
  'userAgent':              'User Agent',
  'event':                  'Event'
};

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Ensure header row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS);
    }

    // Build row in column order
    var row = COLUMNS.map(function(col) {
      var fieldName = Object.keys(FIELD_MAP).find(function(k) {
        return FIELD_MAP[k] === col;
      });
      var val = fieldName !== undefined ? data[fieldName] : '';
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function — run this manually in the editor to verify the sheet connection
function testLog() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  Logger.log('Sheet found: ' + (sheet !== null));
  Logger.log('Sheet name: ' + sheet.getName());
  Logger.log('Last row: ' + sheet.getLastRow());
}
