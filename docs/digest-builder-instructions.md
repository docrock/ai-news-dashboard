# Digest Builder Instructions

This document is the complete, self-contained playbook for refreshing **Doc Rock's AI Pulse** dashboard. It is meant to be run by a Claude agent session that has **no memory of any prior conversation** — everything you need to do the job correctly is written here. You will be invoked twice a day (roughly 6:00 AM ET and 12:00 PM ET) starting from a fresh clone of this repo.

If anything here conflicts with `docs/SCHEMA.md`, **SCHEMA.md wins** — it's the source of truth for the JSON shape. This doc explains the *process*; SCHEMA.md defines the *data format*.

## 0. Who this is for (read this first)

The dashboard's owner is Doc Rock, a YouTuber who teaches DaVinci Resolve editing, livestreaming (Ecamm), and AI tools for content creators. His audience is Gen X / older Millennial (40s-60s) solo entrepreneurs and small business owners — interested in AI but easily overwhelmed by jargon. Write for them:

- Plain English. If you use a technical term (e.g. "context window," "fine-tuning," "API"), briefly explain it in the same sentence.
- Practical framing over hype. Every item answers "what does this mean for me?" not "isn't this amazing?"
- Do not use the phrase "creator economy" anywhere, ever. Use "content & social" or "content creators and small businesses" instead.
- Skip deep academic/technical AI research news (e.g. a new benchmark paper, a niche architecture tweak) unless it has an obvious, immediate practical angle for this audience.

## 1. Figure out what's already been covered

Before searching, establish your starting point so you don't duplicate old news:

1. Read `data/digest.json` and note its `generated_at_iso` timestamp and `edition` value. This tells you when the last edition ran and whether it was "morning" or "midday."
2. Optionally skim `data/archive/index.json` (newest first) and open the most recent one or two archive files if you want more historical context on what's already been reported.
3. Your job is to find what's **new since that timestamp** — typically the last ~6-18 hours of news, but use judgment: if a major story broke and was only partially covered, it's fine to include a meaningful follow-up.
4. Don't re-report the same headline already in the current `digest.json` unless there's a significant update (e.g. a feature went from "announced" to "actually shipped").

## 2. What to search for, per category

Run live web searches (and fetch source pages to confirm details) for each of the four fixed categories. Use today's actual date in queries when helpful (e.g. "this week," or the actual month/year — don't assume a date, check what today's date is in your environment).

### Category 1: `claude-anthropic` — "Claude & Anthropic" (PRIMARY FOCUS — search this hardest)

This is Doc's top priority. Look for: new Claude model releases or updates, new product features (e.g. Claude Code, Claude in Chrome, Projects, Artifacts, Cowork), API/pricing changes, research papers with mainstream relevance, policy announcements, enterprise/partnership news.

Search starting points:
- `site:anthropic.com/news`
- `site:anthropic.com/blog` (or "Anthropic blog" / "Anthropic announces")
- "Anthropic Claude release notes"
- "Claude AI update [current month/year]"
- "Anthropic announcement [current month/year]"
- Check Anthropic's official X/Twitter account coverage via search if useful
- Reputable tech press covering Anthropic: TechCrunch, The Verge, Ars Technica — search "Anthropic" + outlet name

### Category 2: `ai-industry` — "Wider AI World"

Broader AI news, but filtered hard for SMB/creator/beginner relevance. Good: a major model launch from OpenAI/Google/Meta/xAI that regular people will hear about, a new consumer AI app, pricing changes to popular tools, an AI policy/regulation story with real-world impact. Bad: a new training technique, a benchmark leaderboard shuffle, academic papers with no consumer angle.

Search starting points:
- "AI news this week [current month/year]"
- "OpenAI announcement", "Google Gemini update", "Meta AI news"
- TechCrunch AI section, The Verge AI section, Ars Technica AI section (search `site:techcrunch.com AI`, etc.)
- Ask: "would a 50-year-old small business owner care about this, or only an ML researcher?" If only the latter, skip it.

### Category 3: `creator-tools` — "Tools & Tips for Creators and Small Biz"

New or updated AI tools that are genuinely useful for beginners, solo creators, and small business owners — video/photo editing AI, AI writing/marketing tools, automation tools, voice/avatar tools, useful tutorials on applying AI to content creation or small business workflows.

Search starting points:
- "new AI tool for content creators [current month/year]"
- "AI tool small business [current month/year]"
- "AI video editing update" / "AI tool YouTubers"
- Product Hunt AI category ("site:producthunt.com AI")
- Look for beginner-friendly tutorials/guides on applying a new AI feature (not just press releases)

### Category 4: `content-social` — "Content & Social Media Pulse"

Platform-level news: algorithm changes, monetization changes, new creator-facing features, livestreaming platform news, on YouTube, TikTok, Instagram, Facebook, LinkedIn, X, Twitch, etc.

Search starting points:
- "YouTube algorithm update [current month/year]"
- "YouTube creator update" / "YouTube Partner Program changes"
- "TikTok algorithm" / "TikTok creator tools"
- "Instagram new feature creators"
- "[platform name] monetization update"
- Official sources: YouTube Creator Blog/Insider, TikTok Newsroom, Meta Newsroom

Never use the phrase "creator economy" in any copy for this category (or any category).

## 3. Quality bar — what makes an item good enough to include

Every single item you publish must have:

1. **A real, working link** you actually found via search/fetch — never invent or guess a URL. If you can't verify the link resolves, don't include the item.
2. **A plain-English `summary`** (1-2 sentences, no unexplained jargon).
3. **A `why_it_matters` line** written specifically for a beginner / small business owner / content creator — not generic hype.
4. **A credible source.** Prefer primary sources (official blogs, official newsrooms) or well-known tech press. Skip rumor blogs, unverified leaks, and anonymous-tip articles.
5. **No pure speculation.** "Sources say X might launch a new model" with no confirmation is out. Confirmed announcements, ships, launches, and official statements are in.

Aim for roughly 4-7 items per category where the news genuinely supports it. It is completely fine — expected, even — for a category to have fewer items (even zero) on a slow news day. **Never pad a category with filler, recycled old news, or borderline-relevant stories just to hit a number.** Quality and relevance beat quantity every time.

Each item also needs a short `tag` — reuse one of: "Product Update", "Research", "Tutorial", "Platform Change", "Opinion/Analysis", "Pricing", "Policy" — or another short (1-3 word) label in the same style if none of those fit.

## 4. Output format — build the new digest.json

Read `docs/SCHEMA.md` for the exact JSON shape before writing anything. Key rules:

- Top-level fields: `generated_at_iso`, `generated_label`, `edition`, `categories`.
- `categories` always contains all 4 fixed category objects, in this order, even if an `items` array is empty:
  1. `{ "id": "claude-anthropic", "title": "Claude & Anthropic", "items": [...] }`
  2. `{ "id": "ai-industry", "title": "Wider AI World", "items": [...] }`
  3. `{ "id": "creator-tools", "title": "Tools & Tips for Creators and Small Biz", "items": [...] }`
  4. `{ "id": "content-social", "title": "Content & Social Media Pulse", "items": [...] }`
- Each item: `headline`, `summary`, `why_it_matters`, `link`, `source`, `tag` — all required, all strings.

### Archiving step — do this BEFORE writing the new digest.json

The current `data/digest.json` (the one about to be replaced) must be preserved first:

1. Read the current `data/digest.json` in full.
2. Determine its timestamp from its own `generated_at_iso` field and format a filename as `data/archive/<YYYY-MM-DD-HHmm>.json` (24-hour clock, ET time, e.g. `2026-06-30-0600.json`).
3. Write a copy of the current digest's exact content to that new archive file path.
4. Read `data/archive/index.json` (an array). Prepend a new entry to the **front** of the array:
   `{ "file": "data/archive/<YYYY-MM-DD-HHmm>.json", "label": "<short label, e.g. 'Tue Jun 30 · 6:00 AM ET'>" }`
5. Keep only the most recent 30 entries in `index.json` (newest first) — drop older ones beyond 30. (You do not need to delete the corresponding old archive JSON files from disk, just prune the index list.)
6. Write the updated `index.json` back.
7. **Only after** steps 1-6 are done, overwrite `data/digest.json` with the freshly built edition.

Skip the archiving step only if `data/digest.json` does not exist yet (i.e., this truly is the very first run ever) — in that case there's nothing to archive.

## 5. Setting `edition` and `generated_label`

- Determine the actual current date/time in US Eastern time when you run.
- If your run is the ~6:00 AM ET job: `"edition": "morning"`.
- If your run is the ~12:00 PM ET job: `"edition": "midday"`.
- `generated_at_iso`: full ISO 8601 timestamp with ET offset, e.g. `"2026-06-30T06:00:00-04:00"` (use `-04:00` for EDT / `-05:00` for EST depending on time of year) or the closest accurate timestamp to actual run time.
- `generated_label`: human-friendly, format `"<Weekday>, <Month> <Day> · <H:MM AM/PM> ET"`, e.g. `"Tuesday, June 30 · 6:00 AM ET"` for morning or `"Tuesday, June 30 · 12:00 PM ET"` for midday.
- Use the same date/time basis for the archive filename and label described in section 4.

## 6. Validate before finishing

- Confirm `data/digest.json` is valid JSON (all 4 categories present, every item has all 6 required fields).
- Confirm `data/archive/index.json` is valid JSON (an array, newest entry first, ≤30 entries).
- Confirm every `link` in the new digest is a real URL you fetched/saw in search results — not guessed.
- Spot-check that no item copy contains the phrase "creator economy."

## 7. Commit and push

Once the files are written and validated:

```bash
git add data/digest.json data/archive/index.json data/archive/<YYYY-MM-DD-HHmm>.json
git commit -m "Refresh AI news digest — <generated_label>"
git push origin main
```

Example commit message: `Refresh AI news digest — Tuesday, June 30 · 12:00 PM ET`

This is a static GitHub Pages site with no backend, so pushing to `main` is the entire deployment step — no build, no server restart needed.
