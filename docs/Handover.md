# Session Handover — April 19, 2026 (Chat 10)

## What we did this session

Planning only — no code changed, no GitHub push needed.

1. **Gemini near-term list audited** — 4 done, 1 partial (FR badge bold but not red), 5 still outstanding including the important affiliate tag removal.

2. **Feedback form** — needs manual check to verify Gemini's three questions are present. Do this outside a session at https://forms.gle/J3AECVTDHWKDZZKE7.

3. **Website architecture decided** — GitHub Pages + Supabase. Replaces Carrd plan entirely. Full details in Roadmap and Briefing.

4. **Shareable links confirmed as essential** — implemented via Supabase short IDs. Not a nice-to-have.

5. **Price history approach decided** — Keepa links per item, not CamelCamelCamel (CCC injects their own affiliate tags; Keepa doesn't).

6. **Review integrity approach decided** — mild caution signal for improbable ratings + contextual nudge to Fakespot/ReviewMeta. No API available.

7. **Hidden data capture batch added to roadmap** — SNAP, Small Business badge, Condition, Amazon's Choice (with transparency note), Best Seller.

8. **Version numbering decided** — shifted to sub-1.0. v6.1.3 → v0.6.1.3. v1.0 = Web Store public launch, something to earn.

9. **Visual checklist format added to Handover** — see below.

---

## ⚠️ Start of next session

1. Melissa uploads `search.js`, `styles.css`, `core.js` fresh from GitHub as file uploads (not document blocks)
2. Claude confirms version strings match v0.6.1 / v0.6.1.3 before any edits
3. Ask Melissa if she has any fresh testing observations

---

## Progress snapshot

### ✅ Recently done
- Panel height resize via bottom drag handle
- Persistent filter settings per search term (sessionStorage)
- Refresh → Re-scan page (label + all messages)
- Select-all simple toggle, no confirm dialog
- Shortlist bar always visible
- System font stack
- Keyword debouncing (250ms)
- Empty state message when filters clear everything
- Frequently Returned badge — bold (red still needed)

### 🔜 Next up (short term)
- Show Selected / Clear Selection rework (wording, behavior, location)
- Frequently Returned badge — make it red
- Remove affiliate tag from core.js ⚠️ must happen before public release
- GitHub Pages setup (actuallyuseful.net)
- Supabase setup (shareable links)
- Page-fetch throttling (500ms delay between fetches)
- Move auSendLog to background.js
- Telemetry opt-out toggle

### 🔭 Further out (post-alpha)
- Marketing/landing page built and published
- Comparison page with sort/filter + shareable links
- Power search form (Jungle Search model)
- "Export to website" button in shortlist bar
- Product page re-enabled
- Cross-page shortlist persistence (chrome.storage.local)
- Two-way extension ↔ website connection
- Hidden data capture batch (SNAP, Small Business, Condition, Amazon's Choice, Best Seller)
- Review integrity signals + Keepa price history links
- Badge text on toolbar icon (shortlist count)
- Contribution nudge
- Walmart version

---

## Key reminders

- `core.js` uses callback pattern, not Promises
- Always confirm with Melissa before making file changes
- Code files are NOT in the Claude Project — upload fresh from GitHub each session
- Files must be actual file uploads, not document blocks
- Use AskUserQuestion widget for clarifying questions
- All Google tasks: InPrivate Edge + butactuallyuseful@gmail.com
- Context rot: stop and wrap up rather than pushing through
- CSS/JS rule: removing JS visibility toggle → check and fix CSS baseline too
- Version: manifest uses three-part `0.6.1`; AU_VERSION in core.js is `0.6.1.3`
- Always provide a suggested GitHub commit message at end of session
- Bundle small changes together rather than shipping each one separately
- Always include Project_Briefing.md in end-of-session documents — do not skip it

---

## Suggested next commit message
*(No code changed this session — no commit needed)*

## End-of-session checklist
- [x] Project_Briefing.md — updated
- [x] Changelog.md — updated
- [x] Roadmap.md — updated
- [x] Handover.md — written
- [ ] Melissa to update all four Project files in Claude after reviewing
