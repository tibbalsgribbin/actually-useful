# Actually Useful — Roadmap

*actuallyuseful.net · github.com/tibbalsgribbin/actually-useful*

---

## Current version: v0.6.1.45 (Modular)

---

## Current Status: v0.6.1.45 (The Modular Refactor)

The project has successfully transitioned from a monolithic `search.js` to a modular architecture to prevent context rot and simplify development.

- [x] **Modular Architecture Rebuild**: Split monolithic logic into `config.js`, `scraper.js`, and `ui.js`.
- [x] **Selector Resilience**: Centralized Amazon CSS selectors in `config.js` for easier maintenance.
- [x] **Kill Switch Implementation**: Added remote disable functionality via `actuallyuseful.net/killswitch.json`.
- [x] **HTTPS Enforcement**: Active for `actuallyuseful.net`.
- [x] **PPU Fixes**: Recalculation for Amazon errors and solid product overrides (pods/sheets/strips).
- [x] **Badge Filtering**: Integration for SNAP, FSA/HSA, Climate Pledge, and Small Business badges.

---

## Next Session Priorities (In Order)

1. **Modular Handshake Verification**: Confirm the new file structure injects and initializes correctly on the dev machine.
2. **Onboarding / Welcome Page**: Implement `chrome.runtime.onInstalled` to open an onboarding tab for first impressions.
3. **Design Session: Weight Units**: Map out the multi-pack weight PPU logic and oz/lb normalization before coding.
4. **Selector Resilience Fallbacks**: Add multi-strategy fallback logic to `config.js` for critical fields.
5. **Verify auto-resort**: Confirm the re-sort logic fires correctly on Page-add/Re-sync.
6. **Sample Comparison Links**: Add laundry pods (id=73) and laptops (id=74) to `index.html`.

---

## Known Issues / Needs Testing

- **Multi-pack weight PPU wrong**: $/oz reported per item, not total package. (e.g., toothpaste 3x5oz).
- **Liquid Recalculation**: Contact lens solution $/fl oz unreliable when title contains stray numbers.
- **extractCount ordering**: "1 Pack (250 Sheets)" picks up 1 instead of 250.
- **Cotton Swabs**: extractCount grabbing pack count instead of swab count.
- **Pairs Ambiguity**: Socks/gloves PPU uncertainty; interim note applied.
- **Badge Detection Verification**: Verify FSA/HSA/Climate/Small Business detection on live searches.
- **Selector Resilience**: Entirely dependent on `config.js` strings; needs multi-strategy fallbacks.

---

## Release Plan

### Alpha Release — Status
- [x] Chrome Web Store submission (Unlisted)
- [x] CWS Approval Confirmed
- [x] Reddit feedback received
- [ ] Welcome page on install

### Infrastructure — Status
- [x] Custom domain pointing to GitHub Pages
- [x] Kill switch active
- [x] Supabase integration
- [x] Feedback form verified

---

## Design Principles

- Fill gaps in Amazon's interface — don't duplicate what Amazon already does well.
- Wrong numbers are worse than no numbers.
- Never drop results — sort what is rendered.
- **Fail loud at the system level, fail quiet per item.**
- **Show our work.** Surface AU interpretations (recalls/overrides) as dismissible notes.
- **Sustainability features are features.** Resilience and kill switches are high priority.
- All text in the extension interface must be selectable.
