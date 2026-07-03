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
          "tag": "Product Update"
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

## data/archive/index.json (history list, newest first)

```json
[
  { "file": "data/archive/2026-06-30-0600.json", "label": "Tue Jun 30 · 6:00 AM ET" }
]
```

Each archive file is a full copy of a past `digest.json`. Before overwriting `data/digest.json` each run, the previous version is copied into `data/archive/<YYYY-MM-DD-HHmm>.json` and an entry is prepended to `index.json`. Keep the most recent 30 entries (~15 days at 2/day) and prune older ones.
