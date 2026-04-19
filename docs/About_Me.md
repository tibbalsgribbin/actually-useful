# About Melissa

## Who I am

Retired since 2005 due to disability. Based in Seattle. Former tech support (Windows 95/IE era) and church office manager — comfortable with MS Office including Publisher, but I don't write code.

I'm autistic: I deep-dive, love research, ask a lot of questions, and prefer helping people at a distance (through a product, not face-to-face). I also have fibromyalgia, which causes brain fog and memory issues on bad days.

Outside this project: I'm caregiving my mom and working with my very smart Pomchi dog, who is learning to communicate with buttons.

---

## My project: Actually Useful

A free Chrome/Edge browser extension that travels with the user across the entire Amazon experience — search results, product pages, cart, order history, and beyond. It's a persistent shopping research companion that offers features Amazon deliberately withholds: price-per-unit sorting, keyword filtering, delivery sorting, source filtering, shortlisting, and decision support.

**Tagline:** Actually Useful: Amazon but better.

**Why I built it:** A slow build of frustration — I usually know exactly what I want, but Amazon's filters and assumptions get in the way. The target user is someone like me.

**Long-term vision:** Grow to other platforms — Walmart, Target, and beyond.

**What success looks like:** A stranger saying it changed how they shop. A well-built thing. A real user community. All three.

**What energizes me:** Seeing it work correctly in real life.

---

## How I work

- **I test, I don't read code.** Claude does all the coding. I provide direction, confirm decisions, and verify by using the thing — not by reading the source.
- **One major task per session.** Don't let sessions sprawl.
- **I work according to plan but pivot when needed.** I can be deliberate or fast depending on stakes and circumstances.
- **Confirm before coding.** Always align with me on what we're building before touching any files.
- **I have many Google accounts.** For all Actually Useful Google tasks, use InPrivate Edge signed into butactuallyuseful@gmail.com only. Don't assume I'm in the right account.

---

## What I need from Claude

**Communicate directly and structurally.** No fluff, no over-softening. Plain language, numbered steps, clear sections. Ambiguity is frustrating.

**Use the AskUserQuestion widget.** I strongly prefer it over prose questions — it's easier for me to respond to options than to compose an answer from scratch. Use it whenever you need to clarify something before proceeding. This is one of my favorite features.

**Never assume without asking.** This is the thing most likely to go wrong. When uncertain, make a recommendation and then ask — don't proceed silently.

**My wording is my wording.** For UI copy, disclaimers, labels, and feature descriptions, use my exact wording. Don't paraphrase or rewrite without flagging it first. Suggestions are always welcome — but run them by me and I'll decide. This applies especially to anything the user will see.

**Push back when you see a real problem.** I want your honest opinion, even if it contradicts mine.

**Don't make me hold things in my head.** Guide the process proactively. I shouldn't have to track where we are or what comes next — that's your job.

**When I'm struggling, I'll signal it.** If brain fog is bad, I'll say so — or I'll walk away and come back. You pick up where we left off without making it a thing.

**The #1 quality I want from you: reliability.** Consistent, predictable, no bad surprises.

---

## Session rhythm

Sessions start with a handover prompt from the previous session. Read it, ask any questions, and check if anything has come up since last time.

Sessions end with: updated Briefing, Changelog, and Roadmap; a handover prompt saved for next session; and a GitHub push reminder. Don't skip any of these.

Code changes are pushed to GitHub at the end of sessions via GitHub Desktop: pull → stage → commit → push. Always remind me and walk me through it — don't assume I'll remember.

---

## Working in Claude chat

Claude delivers file edits as outputs I download and place myself.

**What this means in practice:** After any file edit, tell me the filename, where to put it, and what to do next (e.g. reload the extension in Edge). If the step sequence isn't obvious, spell it out — I'd rather have the extra sentence than make a wrong assumption.

**Project files:** Project documents (Briefing, Roadmap, etc.) live in the Claude Project and are read-only for Claude — I upload updated versions manually. Extension code lives at `C:\Users\tibba\GitHub\actually-useful\extension\` and is pushed to GitHub via GitHub Desktop after each session.
