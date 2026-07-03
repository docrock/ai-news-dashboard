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

## 3.5 Score every item through Doc's lens (the `opportunity` object)

Every item that passed the section 3 quality bar gets an `opportunity` object (exact shape in `docs/SCHEMA.md`). Two ground rules before the rubric:

- **Scoring never justifies inclusion.** The include/exclude decision already happened in section 3. If you catch yourself inflating a score to make a weak item feel worth publishing, cut the item instead.
- **Be stingy.** Most items land 3–6 on most axes. An 8+ should feel like Doc would drop what he's doing. Roughly one act-now flag per day across ALL categories is normal; several per edition means the bar is too low.

### `video` (0–10) — could this carry a Doc Rock YouTube video?

Score up for: direct hits on Doc's beats (DaVinci Resolve, Ecamm / livestreaming, AI tools for content creators, YouTube platform changes); demoable on screen (he can *show* it, not just talk about it); a timely window (covering it this week beats next month); tutorial potential ("here's how to actually use this" beats "this exists").

Anchors: **8–10** = drop-what-you're-doing video. **5–7** = solid candidate or a segment in a roundup. **0–4** = not video material.

### `social` (0–10) — worth a quick take on socials?

Score up for: conversation starters, hot-off-the-press news, strong-opinion potential; things explainable in two sentences without a screen share. Big-but-generic news that every AI account will post scores mid at best — unless Doc has a distinct angle on it.

### `community` (0–10) — worth sharing in the Creator Sandbox Community?

Score up for: immediately practical for members (solo creators and small business owners in their 40s–60s); discussion-prompt potential ("has anyone tried this?"); fits a "try this this week" nudge for the Saturday Zoom crowd.

The bar is **usefulness, not newsworthiness** — a small tool update members would actually use outranks a splashy funding story.

### `act_now` + `action_note` — flag the things Doc must DO

Set `act_now: true` only when Doc should take a concrete action soon:

- A platform he uses shipped a feature he should enable or test (YouTube, Ecamm, Claude, DaVinci Resolve).
- A deadline or window: intro pricing ending, a beta opening, a deprecation landing.
- Something he relies on changed behavior in a way that affects his workflow or channel.

Qualifies: "YouTube rolls out Collaboration tags," "Fable 5 is back online," "Sonnet 5 intro pricing runs through Aug 31." Does not qualify: research papers, funding rounds, rumors, anything Doc can't act on this week.

When `act_now` is true, `action_note` is **required**: one imperative sentence naming the specific move — what to do, where, and why now (e.g. "Update Ecamm and build a vertical layout this week, then record Saturday's stream in Dual Mode."). `act_now` is independent of the three scores — it means "do something in your business," not "make content about this."

### `angle` — optional head start

When any score is 7+, add a one-line suggested content hook in `angle` (e.g. "I tested YouTube's new collab tag so you don't have to"). Written in Doc's voice, no em dashes. Omit it otherwise.

## 4. Output format — build the new digest.json

Read `docs/SCHEMA.md` for the exact JSON shape before writing anything. Key rules:

- Top-level fields: `generated_at_iso`, `generated_label`, `edition`, `categories`.
- `categories` always contains all 4 fixed category objects, in this order, even if an `items` array is empty:
  1. `{ "id": "claude-anthropic", "title": "Claude & Anthropic", "items": [...] }`
  2. `{ "id": "ai-industry", "title": "Wider AI World", "items": [...] }`
  3. `{ "id": "creator-tools", "title": "Tools & Tips for Creators and Small Biz", "items": [...] }`
  4. `{ "id": "content-social", "title": "Content & Social Media Pulse", "items": [...] }`
- Each item: `headline`, `summary`, `why_it_matters`, `link`, `source`, `tag` — all required, all strings — plus the `opportunity` object from section 3.5 (include it on every new item; the field is optional only so old archived editions keep rendering).

### Archiving step — do this BEFORE writing the new digest.json

The current `data/digest.json` (the one about to be replaced) must be preserved first:

1. Read the current `data/digest.json` in full.
2. Determine its timestamp from its own `generated_at_iso` field and format a filename as `data/archive/<YYYY-MM-DD-HHmm>.json` (24-hour clock, in that timestamp's own local time as written, e.g. `2026-07-02-1745.json`).
3. Write a copy of the current digest's exact content to that new archive file path.
4. Read `data/archive/index.json` (an array). Prepend a new entry to the **front** of the array:
   `{ "file": "data/archive/<YYYY-MM-DD-HHmm>.json", "label": "<short label, e.g. 'Tue Jun 30 · 6:00 AM ET'>" }`
5. Keep only the most recent 30 entries in `index.json` (newest first) — drop older ones beyond 30. (You do not need to delete the corresponding old archive JSON files from disk, just prune the index list.)
6. Write the updated `index.json` back.
7. **Only after** steps 1-6 are done, overwrite `data/digest.json` with the freshly built edition.

Skip the archiving step only if `data/digest.json` does not exist yet (i.e., this truly is the very first run ever) — in that case there's nothing to archive.

## 5. Setting `edition`, timestamps, and labels — machine-local time, no timezone math

**Never compute US Eastern time (or any other remote timezone).** Run `date` and use the machine's own local time everywhere below. The dashboard converts `generated_at_iso` into each visitor's own timezone in their browser, so the stored label is only a fallback for very old browsers.

- `generated_at_iso`: the actual current date/time of the run, full ISO 8601 **with the machine's local UTC offset** (`date +%Y-%m-%dT%H:%M:%S%z` gives it directly), e.g. `"2026-07-02T17:45:00-10:00"`. Never round or fake this to match a schedule slot — it must be honest.
- `edition`: derive from the **local hour** of the run, regardless of which scheduled task fired:
  - before 11:00 → `"morning"`
  - 11:00–16:59 → `"midday"`
  - 17:00 or later → `"evening"`
  A morning-slot task that fires late in the evening publishes an `"evening"` edition. The task name never overrides the clock.
- `generated_label`: human-friendly, from the same local time: `"<Weekday>, <Month> <Day> · <H:MM AM/PM> <TZ>"`, e.g. `"Thursday, July 2 · 5:45 PM HST"` (`date +%Z` gives the timezone abbreviation).
- The archive filename and label in section 4 use this same local-time basis.

### 5.1 Freshness guard — skip instead of double-publishing

**Before doing any research**: read the current `data/digest.json` `generated_at_iso`. If it is **less than 4 hours old**, stop and publish nothing — no commit, no edits to the existing digest (do not "fix" its `edition` field). A late-fired schedule catching up right behind another edition simply skips its turn; that is designed behavior, not a failure. The only exception is a truly major breaking story that cannot wait — in that case publish a normal, complete new edition per all the rules above.

### 5.2 Git ground rules (every git command in this playbook)

- Always invoke git as `git -C ~/Docrock/ai-news-dashboard <subcommand>` — never `cd` into the repo first (a `cd`-prefixed compound command triggers an extra safety prompt on unattended runs).
- Before touching anything: `git -C ~/Docrock/ai-news-dashboard switch main` then `git -C ~/Docrock/ai-news-dashboard pull origin main`. If the working copy was left on some other branch by an interactive session, switching to main is the fix — never commit digest data to any branch except `main`, and leave other branches exactly as you found them.
- Keep commands simple and standalone (one git command per shell invocation, no `&&` chains) — chained commands defeat the pre-approved permission rules and each one triggers a fresh prompt.

## 6. Validate before finishing

Use simple, standalone commands (one per shell invocation — no `&&` chains, no `cd`), e.g. `python3 -m json.tool data/digest.json` and `grep -ri "creator economy" data/`:

- Confirm `data/digest.json` is valid JSON (all 4 categories present, every item has all 6 required fields).
- Confirm every item's `opportunity` object is well-formed: `video`/`social`/`community` are integers 0–10, and wherever `act_now` is `true` there is a non-empty imperative `action_note` (section 3.5).
- Confirm `data/archive/index.json` is valid JSON (an array, newest entry first, ≤30 entries).
- Confirm every `link` in the new digest is a real URL you fetched/saw in search results — not guessed.
- Spot-check that no item copy contains the phrase "creator economy" (the grep above should return nothing).

## 7. Commit and push

Once the files are written and validated, run these as three separate commands (per the git ground rules in section 5.2 — no `cd`, no chaining):

```bash
git -C ~/Docrock/ai-news-dashboard add data/digest.json data/archive/index.json data/archive/<YYYY-MM-DD-HHmm>.json
git -C ~/Docrock/ai-news-dashboard commit -m "Refresh AI news digest — <generated_label>"
git -C ~/Docrock/ai-news-dashboard push origin main
```

Example commit message: `Refresh AI news digest — Thursday, July 2 · 5:45 PM HST`

This is a static GitHub Pages site with no backend, so pushing to `main` is the entire deployment step — no build, no server restart needed.
