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

- [ ] **Build out `docs/improvement-spec.md`** (written 2026-07-01): Track A = score digest items for video/social/community potential + act-now flags; Track B = turn the copy-team skill into a "Doc Rock Studio" plugin with a single brand canon; Track C = create the script-writer skill + copywriter overhaul; Track D = wire the full content pipeline. Start with Track A.
- [ ] **Clone the repo on Darth Nihilus** (Doc's other Mac): `git clone https://github.com/docrock/ai-news-dashboard.git ~/Docrock/ai-news-dashboard` — hasn't happened yet as of 2026-06-30.
- [ ] Nudge the two scheduled-task cron times by 1 hour when DST ends (~2026-11-01).
- [ ] Run `/design-sync` in a Claude Code session rooted here to pull Doc's design system in and restyle the dashboard to match his brand once it's set up in Claude Design.

## Working-directory note

This project used to get built from inside the unrelated `travel-marketplace` repo by accident. Fix: open Claude Code sessions for this project **rooted at `~/Docrock/ai-news-dashboard`** going forward, not from `travel-marketplace` or any other folder — keeps the two projects from bleeding into each other.

## Relationship to HQ

This repo is a **sibling** of `~/Docrock/HQ`, not nested inside it — HQ's `mirror.sh` iCloud sync is scoped strictly to `HQ/`, so this folder is untouched by it, and its own `.git` never collides with HQ's `.git` (the "one repo, one robot" rule).
