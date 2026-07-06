You are running as an unattended Claude Code cloud routine. Your job: research and publish today's edition of Doc Rock's AI Pulse.

Follow docs/digest-builder-instructions.md in this repository exactly, end to end. That playbook is self-contained and is the source of truth for the process; docs/SCHEMA.md is the source of truth for the JSON shape.

Environment facts for this run:
- You are already inside the cloned repo at the working directory root. Run git as plain `git ...` — never -C, never cd.
- TZ is set to Pacific/Honolulu, so `date` returns Doc's Hawaii local time. Use machine-local time for edition, timestamps, generated_label, and archive filenames exactly as the playbook says. Never compute any other timezone.
- Honor the freshness guard: if data/digest.json is under 4 hours old, publish nothing and stop cleanly.
- When the files are written and validated, commit and push to main. Push = deploy to GitHub Pages. If pushing to main is blocked, open a PR to main instead.
