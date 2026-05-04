## Chat 46 — May 4, 2026

*Logging audit and recovery session. No new user-facing features.*

### Recovery
- Files uploaded at session start were from extension-old — caught before any edits
- Gemini's manifest.json rewrite (config.js/scraper.js/ui.js) was still present on disk; search.js was missing from extension/content/
- Restored search.js from extension-old, corrected manifest.json, committed to main branch

### Logging audit
- Audited all fields sent by search.js vs received by Apps Script vs Google Sheet headers
- Added 10 new fields to search.js doLog() payload:
  - snapCount, fsaHsaCount
  - snapFilterActive, fsaHsaFilterActive, climatePledgeFilterActive, smallBusinessFilterActive
  - priceFilterActive, priceFilterMin, priceFilterMax
  - sourceFilterActive
  - countPartner (was in sheet header but missing from payload)
- Updated Apps Script (Version 2) with all new fields and corrected sheet ID
- Updated Google Sheet header row — now 46 columns
- Fixed critical bug: Apps Script sheet ID was wrong — had been writing to a different spreadsheet. Corrected to 1EmTXKDTISyLG4T1k6TiDqeXYisffobTClStK8y47MXU
- Verified end-to-end: new rows logging correctly at v0.6.1.46 with all new fields populated ✅
- Bumped AU_VERSION in core.js from 0.6.1.45 to 0.6.1.46

### Protocol updates
- butactuallyuseful Chrome profile established as working profile for all AU Google tasks (replaces InPrivate Edge)
- End-of-session document delivery clarified: Claude produces complete updated files for download, not snippets or chunks
