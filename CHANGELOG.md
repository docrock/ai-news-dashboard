# Changelog

Notable changes to Doc Rock's AI Pulse. The routine twice-daily digest data refreshes are **not** logged here — that's the site working as designed (see the git history of `data/` if you ever need them).

## 2026-07-02

### Changed
- **Timestamps now display in each visitor's own timezone**: the dashboard renders `generated_at_iso` via the browser locale, so Doc sees HST at home and whatever's local when traveling; the stored `generated_label` is only a fallback. Paired with routine fixes (PR #3): the builder playbook now uses machine-local time (no more ET math), derives edition from the local run hour (morning/midday/evening), skips runs when the digest is under 4 hours old, and uses `git -C` ground rules so unattended runs stop stalling on approval prompts.
- **Restyle built and shipped**: `index.html`, `assets/style.css`, and `assets/app.js` rebuilt against the Claude Design handoff (`UI-README.md` + `pulse-tokens.css`). New masthead with logotype, dateline bar, Montserrat/Bitter type, category icons, responsive card grid, redesigned states with skeleton loading, and Track A's UI: opportunity badges (🎬/📣/🏖️ at score ≥ 7), act-now cards with action strips, and the "⚡ Action needed" filter pill with live count. Old editions without `opportunity` data render unchanged (verified against the July 1 morning archive). Also fixed en route: `hidden` attribute vs `display:flex` conflict on state panels; edition badge now tolerates values beyond morning/midday.

### Added
- **Track A scoring in the data pipeline**: `docs/SCHEMA.md` gains the optional `opportunity` object (`video`/`social`/`community` 0–10, `act_now` + required `action_note`, optional `angle`) and the builder playbook gains §3.5, the scoring rubric that applies Doc's lens (video-worthy, social-worthy, Creator Sandbox-worthy, act-now). Runs score every item starting with the next edition; the badge and act-now UI shipped the same day and lights up automatically.
- `.claude/launch.json` — local preview server config for build verification.
- **Claude Design restyle handoff landed** (from the "Doc Rock's AI Pulse Redesign" project, exported manually and dropped into the repo):
  - `UI-README.md` — the build guide: region-by-region specs, all four card variants (base, badges, act-now, act-now + badges), states, interactions, icon paths. Authoritative for the new look, alongside `design-source/`.
  - `pulse-tokens.css` — complete design-token sheet from the Doc Rock Design System: light values in `:root`, dark overrides in `[data-theme="dark"]`, matching the site's existing theme mechanism.
  - `design-source/PulsePage.dc.html` + `design-source/PulseCard.dc.html` — prototype references in the design workspace's format (inline styles are the authoritative pixel values; not standalone-renderable pages).
  - `assets/fonts/` + `assets/fonts.css` — self-hosted Montserrat (variable) and Bitter.
  - `assets/doc-rock-logotype.png` — white logotype for the masthead.
- `docs/design-brief.md` — the brief that produced the prototype.
- `CHANGELOG.md` (this file) and `.gitignore` (macOS junk exclusions).
- **Improvement spec merged** (PR #1): `docs/improvement-spec.md` — Track A research scoring + act-now flags, Track B "Doc Rock Studio" plugin, Track C script-writer + copywriter overhaul, Track D content pipeline. The restyle handoff already includes Track A's UI (badges, act-now cards, ⚡ Action needed pill).

## 2026-07-01

### Changed
- First full day on the twice-daily automation: morning and midday editions researched, written, and published to GitHub Pages by the scheduled tasks.

## 2026-06-30

### Added
- Initial build: dashboard UI (vanilla JS/CSS, no build step), digest + archive data model (`docs/SCHEMA.md`), the digest-builder playbook (`docs/digest-builder-instructions.md`), GitHub Pages deploy.
- `HANDOFF.md` for cross-session/cross-machine continuity.
- Two local scheduled tasks: `ai-pulse-morning-refresh` (~6:00 AM ET) and `ai-pulse-midday-refresh` (~12:00 PM ET).
