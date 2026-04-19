# Addendum — Claude Pro features review

*Added to the April 19 session summary. Covers instructions, skills, connectors, preferences, styles, and memory.*

---

## Project instructions — worth doing

Project-level custom instructions load into every session automatically, before Claude reads any documents. Would save tokens and ensure core working rules are never missed.

Keep it short (~200 words). Should cover:
- Who Melissa is, briefly (retired, Seattle, autistic, fibromyalgia — the context that shapes communication)
- Core working rules (AskUserQuestion widget, confirm before coding, Melissa's wording for UI copy, code files not in project)
- Session start behavior (read latest Handover first, fill in from Briefing/Roadmap as needed)
- Session end checklist (Briefing, Changelog, Roadmap, Handover, commit message, push reminder)

About_Me.md remains the deep reference. Instructions are the "always remember this" layer.

**One session's work, benefits every future session. Do this week.**

## Skills — skip

Anthropic's built-in skills (docx, pdf, pptx, xlsx, frontend-design, etc.) already trigger when relevant. Nothing in Actually Useful's workflow needs a custom skill. The document templates are stable enough that they live in the existing documents themselves.

## Connectors — don't add new ones

- **GitHub connector** (if available): tempting but adds a new failure mode. Current upload-at-session-start protocol is low-tech but bulletproof. Revisit if Anthropic ships a clearly better GitHub integration.
- **Google Drive, Gmail, Calendar**: already connected, not relevant to Actually Useful. Each connector adds a small amount of ambient prompt-injection risk. No reason to disconnect — just don't lean on them for this project.

## User preferences — worth tightening

Currently just "I'm retired." User preferences apply globally across all Claude conversations, so should be universal, not project-specific.

Worth adding:
- Preference for AskUserQuestion widget over prose questions
- Preference for structured, direct communication with minimal fluff
- Brain fog days — Claude should adjust pacing when signaled

Don't add: Actually Useful-specific content (belongs in project), long explanations.

Optional but useful if Claude is used for other tasks beyond this project.

## Styles — not useful

Fixed writing voice would get in the way. Communication needs change per task.

## Memory — leave off

Auto-memory would compete with the deliberate handover system. Might mix versions across revised decisions. The curated Handover.md pattern is better than auto-memory for this project.

## Past chats search — exists, use when needed

Claude has a `conversation_search` tool that can search across past chats in the project. Not a setting to configure — just a capability to know about. Ask Claude to search when "I feel like we talked about this before."

---

## Consolidated action

**One thing to do this week: set up project instructions.** Short, focused, covering working rules. Everything else in this list: skip.

The biggest gains won't come from more features. They'll come from the discipline already in place.
