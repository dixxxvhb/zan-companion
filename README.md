# Zan's Companion — Project Status
## Saved: March 20, 2026

### What's Done
- **System prompt** (SYSTEM_PROMPT.md) — the soul of the AI companion, built from:
  - Zan's 40-page journal (January 2021 – June 2025)
  - ~3.5 hours of transcribed voice memos from the week Tammy died (FULL_TRANSCRIPTS.txt)
  - Dixon's deep knowledge of his dad's personality and situation
- **Working prototype** (zan-companion.jsx) — React chat app built in Claude, testable as an artifact
  - Cream/warm UI, Georgia serif at 19px (huge for readability)
  - Forest green accents (matches DWDC palette coincidentally)
  - Hits Anthropic API with full system prompt
  - Opens with: "Hey. I'm here whenever you want to talk..."

### What's Next (Phase 1 → Deployable PWA)
- [ ] Deploy as a Netlify project (Dixon already uses Netlify for Figgg)
- [ ] Serverless function to hold the Anthropic API key (not exposed client-side)
- [ ] PWA manifest so it installs on Zan's phone home screen
- [ ] Simple URL Dixon can text to his dad
- [ ] Test conversation — Dixon pretends to be Zan and validates the feel
- [ ] Conversation memory via localStorage or simple backend

### Future Phases
- **Phase 2: Memory & Mood** — memory prompts that surface naturally ("Tell me something about Tamara that always made you laugh"), quiet mood tracking Dixon can see from Orlando
- **Phase 3: SMS Check-ins** — Twilio integration, morning texts that reach out to Zan ("Good morning. How are you sitting today?"), links back to the web app for deeper conversation
- **Phase 4: Memory Keeper** — actively prompts stories and memories, builds a collection for the family

### Source Material (on Dixon's machine)
- Journal: uploaded to Claude as PDF (Zan_Bowles_Journals_-_Chronological_order.pdf)
- Voice memos: ~/Desktop/idaho voice memos/FULL_TRANSCRIPTS.txt
- Audio file: ~/Desktop/idaho voice memos/E_Sugar_Creek_Rd.m4a (and likely others)

### Key Design Decisions
- UI must be dead simple — Zan can text and make calls, that's about it
- No menus, no settings, no onboarding flow — just open, type, talk
- The AI earns its name through the relationship (not assigned upfront)
- No religious platitudes, no therapy-speak, no toxic positivity
- Matches Zan's register: dry humor, patient, doesn't over-talk

### Tech Stack
- React (JSX) frontend
- Netlify hosting + Netlify Functions (serverless)
- Anthropic API (Claude Sonnet)
- PWA manifest for phone install
- Same architecture as Figgg
