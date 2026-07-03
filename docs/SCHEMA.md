# Data schema for the dashboard

## data/digest.json (the current/latest edition)

```json
{
  "generated_at_iso": "2026-06-30T06:00:00-04:00",
  "generated_label": "Tuesday, June 30 · 6:00 AM ET",
  "edition": "morning",
  "categories": [
    {
      "id": "claude-anthropic",
      "title": "Claude & Anthropic",
      "items": [
        {
          "headline": "Short, plain-English headline",
          "summary": "1-2 sentence plain-English summary, no jargon",
          "why_it_matters": "1 sentence on what this means for a beginner, small business owner, or content creator",
          "link": "https://...",
          "source": "Anthropic Blog",
          "tag": "Product Update",
          "opportunity": {
            "video": 8,
            "social": 6,
            "community": 9,
            "act_now": true,
            "action_note": "One imperative sentence: what to do, where, and why now.",
            "angle": "Suggested content hook (only when a score is 7+)"
          }
        }
      ]
    },
    { "id": "ai-industry", "title": "Wider AI World", "items": [] },
    { "id": "creator-tools", "title": "Tools & Tips for Creators and Small Biz", "items": [] },
    { "id": "content-social", "title": "Content & Social Media Pulse", "items": [] }
  ]
}
```

Notes:
- `edition` is `"morning"`, `"midday"`, or `"evening"` — derived from the run's local hour (see instructions §5), never from the schedule slot name.
- `generated_at_iso` is the authoritative timestamp (full ISO 8601 with the run machine's local UTC offset). The dashboard converts it to each visitor's own timezone in the browser; `generated_label` is only a text fallback.
- Category ids are fixed (always all 4 present, even if an item list is empty).
- `tag` is a short label like "Product Update", "Research", "Tutorial", "Platform Change", "Opinion/Analysis".
- Every item MUST have a working `link`.
- `opportunity` is **optional and backward compatible** — items and whole editions without it render exactly as before (no badges, no act-now treatment). All NEW editions should include it on every item, scored per instructions §3.5:
  - `video`, `social`, `community`: integers 0–10, Doc's content-opportunity lens. The dashboard shows quiet badges at score ≥ 7 (🎬 Video idea / 📣 Post it / 🏖️ Sandbox share) and never displays the raw numbers.
  - `act_now`: boolean, independent of the scores — it means "Doc should DO something soon," not "make content about this." When `true`, `action_note` is **required**: one imperative sentence (what to do, where, why now). The dashboard renders it as the loud "⚡ Action needed" strip.
  - `angle`: optional one-line suggested content hook; include it when any score is 7+.

## data/archive/index.json (history list, newest first)

```json
[
  { "file": "data/archive/2026-06-30-0600.json", "label": "Tue Jun 30 · 6:00 AM ET" }
]
```

Each archive file is a full copy of a past `digest.json`. Before overwriting `data/digest.json` each run, the previous version is copied into `data/archive/<YYYY-MM-DD-HHmm>.json` and an entry is prepended to `index.json`. Keep the most recent 30 entries (~15 days at 2/day) and prune older ones.
