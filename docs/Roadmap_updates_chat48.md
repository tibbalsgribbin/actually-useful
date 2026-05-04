# Roadmap updates — Chat 48

*Apply these changes to Roadmap.md*

---

## 1. Update current version line

Change:
  Current version: v0.6.1.46 (overall) · v0.6.1 (manifest) · v0.6.1.46 (search.js) ...

To:
  Current version: v0.6.1.48 (overall) · v0.6.1 (manifest) · v0.6.1.48 (search.js) · v0.6.1.46 (core.js) · v0.6.1.30 (compare.html) · v0.6.1.16 (background.js)

---

## 2. Update next session priorities

Replace existing next session priorities block with:

1. **Brand filter — Session 2: brand filter UI + hide/demote toggle** — add brand filter on/off toggle to panel, hide/demote two-button pill, results summary line, expand-to-view footer with "below the line" divider, demote rendering logic, persist state in chrome.storage.local, add logging fields to doLog(), update Apps Script + sheet. Files: search.js, styles.css. See Brand_Filter_Design.md Session 2 scope.
2. **compare.html logging** — direct fetch to Google Sheets endpoint; deferred from Chat 46
3. **Welcome page on install** — chrome.runtime.onInstalled opens onboarding tab
4. **Fix extractCount "1 Pack (250 Sheets)"** — pack/count ordering fix
5. **Verify auto-resort fires on Re-sync page-add** — investigate and fix if needed

---

## 3. Update v0.6.1.x release plan — add completed items

Add these lines to the v0.6.1.x completed checklist:

- [x] Brand filter Session 1 — scrapeBrand(), detectGibberishBrand(), brand field in item object + compare payload (Chat 48)
- [x] brand_blocklist.txt created — 70 starter brands, extension/data/ (Chat 48)

---

## 4. Update v0.7 brand filter section

Replace:
  - [ ] Session 1: brand text scraping + heuristic detector (no UI)

With:
  - [x] Session 1: brand text scraping + heuristic detector (no UI) ✅ Chat 48

---

## 5. Add to website section (post-alpha)

Add under Website:
  - [ ] "For nerds" transparency doc — explains every filter, signal, and assumption AU makes. Destination TBD (FAQ page or linked from onboarding). Drafting can start before public launch.

---

## 6. Add to pre-public-CWS-listing checklist

No changes needed — brand filter suite already listed there.
