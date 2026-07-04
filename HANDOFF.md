# Handoff — Doc Rock's AI Pulse

Read this first if you're picking up this project cold (new session, new machine, or after a break).

## What this is

A daily, no-jargon AI news dashboard for Doc Rock's audience (Gen X / older Millennial solo entrepreneurs and content creators): Claude/Anthropic news first, plus wider AI industry, creator/small-biz tools, and content & social platform news. Static site, no backend.

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
| `docs/routine-prompt.md` | The exact text pasted into the cloud routine's Instructions box. |
| `README.md` | Quick orientation + manual-refresh instructions. |
| `UI-README.md` | Build guide for the brand restyle (Claude Design handoff). Region specs, card variants, states, icons. |
| `pulse-tokens.css` | Design-token sheet from the Doc Rock Design System — light `:root` + `[data-theme="dark"]` overrides. Load after `assets/fonts.css`. |
| `design-source/` | Prototype references from Claude Design (`*.dc.html`, inline styles = authoritative pixel values; not standalone pages). |
| `assets/fonts/` + `assets/fonts.css` | Self-hosted Montserrat (variable) + Bitter. `assets/doc-rock-logotype.png` is the masthead logotype. |
| `docs/improvement-spec.md` | The four-track upgrade plan (scoring, studio plugin, script-writer, pipeline). |
| `CHANGELOG.md` | Notable changes, newest first. Routine digest refreshes are deliberately excluded. |

## Automation

**Source of truth (as of 2026-07-04): a Claude Code cloud routine.** The routine clones this repo fresh, follows `docs/digest-builder-instructions.md` end to end (freshness guard, local-time stamps, live web search, archive, score, validate), then commits + pushes to `main`. Push = deploy. The routine's Instructions box is the exact text of `docs/routine-prompt.md`.

Routine configuration:

- **Repo:** `docrock/ai-news-dashboard`
- **Schedule:** daily at **~3:07 AM HST**
- **Environment variable:** `TZ=Pacific/Honolulu` — so `date` in the cloud container returns Doc's Hawaii local time and the playbook's machine-local-time rules keep working unchanged
- **Network access:** **Full** — the playbook fetches arbitrary news domains to verify every link; the default "Trusted" policy returns 403 for those
- **Permissions:** "Allow unrestricted branch pushes" enabled for this repo, so the run can push straight to `main` (push = deploy). Leaving it off is a valid alternative: each edition then lands as a PR for review instead.
- **Model:** Doc's choice (set when creating/editing the routine)
- **Connectors:** none — remove all connectors from the routine's environment

### Deprecated: the local Desktop scheduled task

The previous automation — the macOS Desktop scheduled task **`ai-pulse-morning-refresh`** (under `~/.claude/scheduled-tasks/`, 3:05 AM HST) plus the **user-level permission wildcards** in `~/.claude/settings.json` that kept it unattended — is **deprecated**. It only fired while the Claude app was open on Doc's Mac, rooted its session in the unrelated `travel-marketplace` repo (so this repo's permission rules were never consulted), and needed a pile of workarounds (`git -C` absolute-path anchoring, user-level wildcards, a disabled second task, DST cron nudges). **Remove both after the first green cloud run**: delete the `ai-pulse-morning-refresh` task and strip the AI-Pulse wildcards from `~/.claude/settings.json`. (`ai-pulse-midday-refresh` was already disabled 2026-07-03.)

### Downstream coupling: doc-rock-studio reads digest.json

The `doc-rock-studio` "content sprint" (in `docrock/docrock-marketplace`) reads this dashboard's `digest.json`. Now that the digest is published from the cloud instead of written into a local clone, the studio should read the **published URL** — `https://docrock.github.io/ai-news-dashboard/data/digest.json` — not a local clone, which will go stale. This also makes the studio machine-independent.

- [ ] **TODO (in `docrock/docrock-marketplace` — that repo is not on this machine):** point the content sprint at `https://docrock.github.io/ai-news-dashboard/data/digest.json` instead of the local clone's `data/digest.json`.

## Open TODOs

### For Doc to review

- **Create the cloud routine** (claude.ai/code/routines → New → Remote, or `/schedule`) with the configuration in the Automation section above, pasting `docs/routine-prompt.md` as the Instructions. Run it once, read the transcript (green ≠ success), confirm a commit hit `main` and the site updated — then delete the local `ai-pulse-morning-refresh` task and remove the AI-Pulse permission wildcards from `~/.claude/settings.json`.
- ~~Do a one-time "Run now" on `ai-pulse-morning-refresh`~~ — superseded by the cloud routine migration (2026-07-04); the whole Desktop-task approach is deprecated.

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
