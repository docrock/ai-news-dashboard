# Handoff — Doc Rock's AI Pulse

Read this first if you're picking up this project cold (new session, new machine, or after a break).

## What this is

A twice-daily, no-jargon AI news dashboard for Doc Rock's audience (Gen X / older Millennial solo entrepreneurs and content creators): Claude/Anthropic news first, plus wider AI industry, creator/small-biz tools, and content & social platform news. Static site, no backend.

- **Live site:** https://docrock.github.io/ai-news-dashboard/
- **Repo:** https://github.com/docrock/ai-news-dashboard (public, standalone — separate `.git` from HQ)
- **Local path (same on every Mac):** `~/Docrock/ai-news-dashboard`

## Where things live

| File | Purpose |
|---|---|
| `index.html`, `assets/style.css`, `assets/app.js` | The dashboard UI — vanilla JS, no build step, no framework. Fetches `data/digest.json` and `data/archive/index.json`. |
| `data/digest.json` | Current edition. |
| `data/archive/` + `data/archive/index.json` | Past editions, newest first, capped at 30. |
| `docs/SCHEMA.md` | Exact JSON shape for digest + archive files. Source of truth if anything conflicts. |
| `docs/digest-builder-instructions.md` | Self-contained playbook a fresh Claude session follows to research and publish a new edition. |
| `README.md` | Quick orientation + manual-refresh instructions. |
| `UI-README.md` | Build guide for the brand restyle (Claude Design handoff). Region specs, card variants, states, icons. |
| `pulse-tokens.css` | Design-token sheet from the Doc Rock Design System — light `:root` + `[data-theme="dark"]` overrides. Load after `assets/fonts.css`. |
| `design-source/` | Prototype references from Claude Design (`*.dc.html`, inline styles = authoritative pixel values; not standalone pages). |
| `assets/fonts/` + `assets/fonts.css` | Self-hosted Montserrat (variable) + Bitter. `assets/doc-rock-logotype.png` is the masthead logotype. |
| `docs/improvement-spec.md` | The four-track upgrade plan (scoring, studio plugin, script-writer, pipeline). |
| `CHANGELOG.md` | Notable changes, newest first. Routine digest refreshes are deliberately excluded. |

## Automation

Two local scheduled tasks (managed via the `schedule` skill, stored under `~/.claude/scheduled-tasks/`):

- **`ai-pulse-morning-refresh`** — ~12:05 AM HST (≈6:00 AM ET). `edition: "morning"`.
- **`ai-pulse-midday-refresh`** — ~6:00 AM HST (≈12:00 PM ET). `edition: "midday"`.

Each run: `cd ~/Docrock/ai-news-dashboard && git pull`, follow `docs/digest-builder-instructions.md` (live web search, archive old edition, write new `digest.json`), then commit + push to `main`. Push = deploy (GitHub Pages serves `main` root automatically).

**Caveats:**
- These only fire while the Claude app is open on this Mac. Closed at fire time → runs on next launch instead.
- Cron times are Hawaii-local, computed from ET. **They'll need a 1-hour nudge when US DST changes** (next: 2026-11-01).
- First runs may pause for tool-permission prompts (web search, git push) — click "Run now" on each task once to pre-approve.

## Open TODOs

- [ ] **Build the brand restyle** (next up): recreate the Claude Design prototype in `index.html` / `assets/style.css` / `assets/app.js`, following `UI-README.md` exactly. Tokens: `pulse-tokens.css`; fonts: `assets/fonts.css` (load fonts → tokens → component CSS); comps: `design-source/`. Includes Track A's UI: opportunity badges (≥7 threshold), act-now cards, the "⚡ Action needed" pill, and the new loading/empty/error/no-results states. Verify old archive editions still render (no `opportunity` fields → zero badges/strips).
- [ ] **Build out `docs/improvement-spec.md`** (written 2026-07-01): Track A's remaining half = schema (`docs/SCHEMA.md`) + scoring rubric in the builder playbook, so the automation starts producing scored editions (the UI half ships with the restyle above). Track B = "Doc Rock Studio" plugin with a single brand canon; Track C = script-writer skill + copywriter overhaul; Track D = content pipeline.
- [ ] **Clone the repo on Darth Nihilus** (Doc's other Mac): `git clone https://github.com/docrock/ai-news-dashboard.git ~/Docrock/ai-news-dashboard` — hasn't happened yet as of 2026-06-30.
- [ ] Nudge the two scheduled-task cron times by 1 hour when DST ends (~2026-11-01).

Done: ~~Restyle prototype via Claude Design~~ — produced in the "Doc Rock's AI Pulse Redesign" project and hand-exported into this repo 2026-07-02 (`/design-login` isn't available in non-interactive sessions, so the files came over manually; see `UI-README.md`).

## Working-directory note

This project used to get built from inside the unrelated `travel-marketplace` repo by accident. Fix: open Claude Code sessions for this project **rooted at `~/Docrock/ai-news-dashboard`** going forward, not from `travel-marketplace` or any other folder — keeps the two projects from bleeding into each other.

## Relationship to HQ

This repo is a **sibling** of `~/Docrock/HQ`, not nested inside it — HQ's `mirror.sh` iCloud sync is scoped strictly to `HQ/`, so this folder is untouched by it, and its own `.git` never collides with HQ's `.git` (the "one repo, one robot" rule).
