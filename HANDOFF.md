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

**One** local scheduled task (stored under `~/.claude/scheduled-tasks/`), as of 2026-07-03:

- **`ai-pulse-morning-refresh`** — daily at **3:05 AM HST** (cron `0 3 * * *`, local time). Publishes one edition; the edition value (morning/midday/evening) is derived from the local hour by the playbook.
- **`ai-pulse-midday-refresh`** — **disabled** 2026-07-03. Two tasks were fighting over the edition field on late fires; one reliable daily run is simpler. It can be re-enabled later via the `scheduled-tasks` tools if a second slot is ever wanted.

Each run drives git with `git -C ~/Docrock/ai-news-dashboard ...` (never `cd`), follows `docs/digest-builder-instructions.md` (freshness guard, local-time stamps, live web search, archive, score, validate), then commits + pushes to `main`. Push = deploy.

### Why the runs kept stopping for approval (root cause, fixed 2026-07-03)

The scheduled task session roots in **`~/claude-plugins/travel-marketplace`**, not this repo (the scheduler has no per-task working-directory control). Claude Code evaluates permission rules against the *session's* project settings, so the good rules in this repo's `.claude/settings.json` were **never consulted** — and travel-marketplace's `settings.local.json` had only literal, timestamp-embedded grants that never match twice. Fix:

- **Authoritative permission rules now live at USER level** (`~/.claude/settings.json`), so they apply no matter which directory the task roots in. They're wildcarded (`git -C ~/Docrock/ai-news-dashboard commit -m:*`, `cp … data/archive/:*`, `python3 -m json.tool:*`, `WebFetch`, `Edit/Write` scoped to `…/ai-news-dashboard/data/**`) so timestamped commands stop re-prompting. Every git rule is `-C`-scoped to this one repo, so the global scope is still tight.
- The AI Pulse remnants (26 of them) were stripped out of `travel-marketplace/.claude/settings.local.json` so the two projects are no longer commingled.
- The task prompt was rewritten: standalone commands only (no `&&`/`;`/`if-then`, which never match allow rules), unattended-aware, Sonnet 5 / High mode requested.

**Caveats:**
- The task only fires while the Claude app is open on this Mac. Closed at 3 AM → runs on next launch.
- After these changes, do a one-time **"Run now"** on the task once (the scheduler also stores per-task approvals) to seed anything the user-level rules don't already cover, then it should be fully hands-off.
- **Model:** the prompt requests Sonnet 5 / High. Scheduled runs otherwise use the app's model at fire time — there's no per-task model field in the scheduler, so if a run must be Sonnet 5, set the app's model accordingly.

## Open TODOs

### For Doc to review

- **Do a one-time "Run now" on `ai-pulse-morning-refresh`** so it seeds any last per-task approvals, then confirm the next 3 AM run's summary shows no permission stops. The 2026-07-03 fix (see Automation → root cause) moved the permission rules to user level and de-commingled travel-marketplace, which the earlier 2026-07-02 project-level allowlist couldn't fix (the task never roots in this repo).

Earlier (2026-07-02) routine-QA items — PR #3 (routine fixes) and PR #2 (restyle + viewer-local timestamps) merged and live; the project-level allowlist was committed but turned out to be in the wrong scope (superseded by the user-level rules above); the "Morning · 11:12 PM ET" mislabel self-heals on the next run.

### Backlog

- [ ] **Build out `docs/improvement-spec.md`** (written 2026-07-01): only **Track D** (content-pipeline conveniences + weekly review of whether scoring predicts what Doc makes) remains. Track A shipped in full 2026-07-02 (UI + schema/rubric). Track B shipped 2026-07-02 as `doc-rock-studio@docrock-marketplace` (repo: `~/claude-plugins/docrock-marketplace`, private GitHub `docrock/docrock-marketplace`) — a conductor (`studio`) + `script-writer`, with Doc's standing order enforced: **all public-facing copy routes through the copy-doctor plugin**. Track C's script-writer shipped inside the studio; its "copywriter overhaul" was superseded by the copy-doctor plugin Doc built the same day.
- [ ] **Clone/install on Darth Nihilus** (Doc's other Mac): `git clone https://github.com/docrock/ai-news-dashboard.git ~/Docrock/ai-news-dashboard`, then `/plugin marketplace add docrock/docrock-marketplace`, `/plugin install copy-doctor@docrock-marketplace`, `/plugin install doc-rock-studio@docrock-marketplace`.
- [x] ~~Nudge the two scheduled-task cron times by 1 hour when DST ends (~2026-11-01)~~ — obsolete once PR #3 lands: editions derive from the run's local hour, so cron drift relative to ET no longer mislabels anything. The cron times themselves can stay put.

Done:
- ~~Restyle prototype via Claude Design~~ — produced in the "Doc Rock's AI Pulse Redesign" project and hand-exported into this repo 2026-07-02 (`/design-login` isn't available in non-interactive sessions, so the files came over manually; see `UI-README.md`).
- ~~Build the brand restyle~~ — shipped 2026-07-02: `index.html` / `assets/style.css` / `assets/app.js` rebuilt per `UI-README.md`, including Track A's UI (badges, act-now cards, ⚡ pill). Verified light/dark/mobile + old archives in a local preview.

## Working-directory note

This project used to get built from inside the unrelated `travel-marketplace` repo by accident. Fix: open Claude Code sessions for this project **rooted at `~/Docrock/ai-news-dashboard`** going forward, not from `travel-marketplace` or any other folder — keeps the two projects from bleeding into each other.

## Relationship to HQ

This repo is a **sibling** of `~/Docrock/HQ`, not nested inside it — HQ's `mirror.sh` iCloud sync is scoped strictly to `HQ/`, so this folder is untouched by it, and its own `.git` never collides with HQ's `.git` (the "one repo, one robot" rule).
