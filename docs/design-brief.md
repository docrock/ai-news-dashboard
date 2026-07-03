# Design Brief — AI Pulse dashboard restyle (for Claude Design)

Written 2026-07-02. Paste the block below into Claude Design to get a prototype. Bring the result back to a Claude Code session rooted in this repo for the build (see `HANDOFF.md` TODO about `/design-sync`).

---

## The brief (paste from here down)

**Project: restyle "Doc Rock's AI Pulse," my AI news dashboard.**

Live site to reference: https://docrock.github.io/ai-news-dashboard/

**What it is:** a twice-daily, no-jargon AI news digest I publish for my audience. It is a single-page static site. The layout and features already exist and work; I need a visual redesign using my design system, plus designs for a few new elements we are about to build.

**Who reads it:** Gen X and older Millennials (40s to 60s), solo creators and small business owners. Tech-curious but easily overwhelmed. Design implications: generous type sizes (16px+ body, larger headlines), strong contrast (WCAG AA minimum), obvious click targets, calm layout. No thin gray text, no cramped data-dense dashboard vibes.

**Use my design system for colors, type, and components.** Where the system has no matching component, invent one that fits it.

**Design one responsive page, four ways: desktop and mobile, each in light mode and dark mode.**

### Page regions, top to bottom (match this structure, it is already built)

1. **Header:** brand mark ("AI" square), site title "Doc Rock's AI Pulse," tagline "What's new in AI, explained like a human," and a light/dark theme toggle button.
2. **Status banner:** "Updated Wednesday, July 1 · 6:37 PM ET" plus a small edition badge (Morning edition / Midday edition).
3. **Controls:** a search field ("Search headlines and summaries…"), a row of category filter pills, and a "Previous editions" dropdown. The pills: All · Claude & Anthropic · Wider AI World · Tools & Tips for Creators and Small Biz · Content & Social Media Pulse · plus a NEW "⚡ Action needed" pill (see below).
4. **Four category sections**, each with a heading, an item count, and a list of news cards.
5. **Footer:** one quiet line ("Built by Doc Rock · AI news, summarized for humans · no login, no tracking, just the pulse.").

### News card anatomy (design every variant)

Base card, top to bottom:
- Small tag chip (e.g. "Product Update") and source label (e.g. "Anthropic")
- Headline (links out to the story)
- 1 to 2 sentence summary
- A "Why it matters:" callout line. This is the signature element of the whole site; make it feel special but not shouty.
- "Read more →" link

**NEW variant 1, opportunity badges:** some cards earn a badge row with one or more of: 🎬 Video idea · 📣 Post it · 🏖️ Sandbox share. These mark stories worth turning into content. They should read at a glance without making the card busy.

**NEW variant 2, act-now card:** a few cards per week flag something I need to actually go do (a platform shipped a feature I should turn on, a pricing deadline). This card gets an unmissable accent treatment plus an "⚡ Action needed:" strip containing one imperative sentence. Rule: this must be the loudest thing on the page, while everything else stays calm. Design a card that combines act-now with the badges too, since both can occur together.

### States to design

- Loading ("Fetching the latest AI news…")
- Slow-news-day empty state ("No news yet for this edition. Check back soon!")
- Error ("Couldn't load the news feed right now.")
- No search/filter results

### Hard constraints (the build target)

- Static site: plain HTML + CSS + vanilla JavaScript. No React, no framework, no build step. Everything you design must be achievable with straightforward CSS.
- Theming works by a `data-theme="dark"` attribute swap, so express colors as a token palette with a light value and a dark value for each token.
- Mobile matters as much as desktop. Cards stack in one column on phones.
- System or self-hosted-friendly fonts only, nothing that requires a paid webfont service.

### Personality

Warm, confident, Hawaii-laid-back, a little Gen X nostalgia in spirit but not literal 80s kitsch. Feels like a well-made morning paper for AI, not a corporate SaaS dashboard and not a neon crypto terminal.

### What to hand back (so my dev session can build it)

1. The four full-page comps (desktop + mobile × light + dark).
2. A card sheet: base card, badged card, act-now card, act-now + badges card.
3. The four states.
4. A design-token sheet: color palette with light and dark values, type scale, spacing scale, corner radii, and shadows, ideally named as CSS custom properties (e.g. `--color-accent`, `--space-3`) so the build maps one to one.
