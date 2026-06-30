# Doc Rock's AI Pulse

A twice-daily, no-jargon AI news dashboard — Claude/Anthropic first, plus the wider AI world, creator/small-business tools, and content & social media platform news. Built for solo entrepreneurs and content creators who want to stay current without wading through tech jargon.

Live site: https://docrock.github.io/ai-news-dashboard/

## How it works

This is a fully static site (plain HTML/CSS/JS, no build step) hosted on GitHub Pages.

- `index.html`, `assets/` — the dashboard UI. Fetches `data/digest.json` and `data/archive/index.json` at load time.
- `data/digest.json` — the current edition.
- `data/archive/` — past editions, newest listed first in `index.json`.
- `docs/SCHEMA.md` — the exact JSON shape both the site and the refresh process rely on.
- `docs/digest-builder-instructions.md` — the self-contained playbook a Claude agent follows twice a day (~6:00 AM and ~12:00 PM ET) to research, write a fresh `digest.json`, archive the previous edition, and push the update. Pushing to `main` is the entire deploy step.

## Manually refreshing

To run a refresh by hand instead of waiting for the schedule, point a Claude Code session at this repo and ask it to follow `docs/digest-builder-instructions.md`.
