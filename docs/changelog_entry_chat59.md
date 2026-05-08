# Changelog — Chat 59 (May 8, 2026)

## Files changed
- welcome.html: created Chat 59
- background.js: v0.6.1.16 → v0.6.1.17
- search.js: v0.6.1.65 → v0.6.1.66
- styles.css: updated Chat 59

---

## welcome.html — new file

New onboarding page at actuallyuseful.net/welcome. Opens automatically on fresh install via background.js.

Sections: panel anatomy with embedded screenshot and callout list, 5-step workflow, 8 feature cards, video placeholder, compare page section, footer CTA. Matches index.html palette and typography. Panel screenshot embedded as base64.

Note: screenshot needs replacement next session (laundry pods with keyword filter active, annotated callout design with red ovals).

---

## background.js changes (v0.6.1.17)

### onInstalled welcome page
Added chrome.runtime.onInstalled listener. Opens https://actuallyuseful.net/welcome on fresh install only (details.reason === 'install'). Does not fire on update or browser restart.

---

## search.js changes (v0.6.1.66)

### Note click fix
innerHTML render path created .ppu-note-add-link and .ppu-note-edit-link spans without event listeners — clicks did nothing. Fixed by adding querySelectorAll wiring after each render, parallel to brand button pattern.

### Pages slider fill gap
updatePagesSliderFill had max hardcoded as 10 instead of 7. At value 7 the fill only reached 67% of the track. Fixed to max=7.

### Keyword smart quote fix
parseKeywords now strips curly/smart quotes (U+201C, U+201D, U+201E, U+201F, U+2033, U+2036) and straight quotes before parsing. "fragrance-free" now correctly matches fragrance-free in titles.

### Compare subtext inline color removed
Removed hardcoded color:#9ca3af from inline style on #ppu-compare-sub so CSS active-state rules can control it.

---

## styles.css changes

### Sponsored button active color
"Hidden · Show ads" button — was salmon/coral (#FFA590), now indigo (#4f46e5) to match other active states in the panel.

### Active filters dec-bar hidden
#ppu-dec-bar set to display:none. Removes the active-filter pills row (keyword, review, rating chips) to free up vertical space.

### Footer text smaller and tighter
#ppu-sort-note: font-size 11px → 10px, padding reduced, line-height 1.4 added.
#ppu-info: font-size 12px → 10.5px, padding reduced, line-height 1.4 added.

### Keyword highlight — yellow background
mark.ppu-kw-highlight background changed from white (#FFFFFF via var) to yellow (#fff176). Padding increased slightly.

### Compare subtext color rules
Added #ppu-compare-sub rule (default color #9ca3af) and #ppu-shortlist-bar.active #ppu-compare-sub rule (color #ffffff). Replaces the removed inline style.
