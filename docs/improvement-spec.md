# Improvement Spec — AI Pulse + Doc Rock Content Studio

Written 2026-07-01. This is the plan for the next round of upgrades across two connected systems:

1. **This repo** (the AI Pulse dashboard) — teach the research to score itself through Doc's content lens and flag items that need action.
2. **The skills ecosystem** (lives outside this repo) — turn the copy-team "master conductor" into a proper versioned plugin, split its duties into single-purpose skills, overhaul the copywriter, and create the missing script-writer.

Read `HANDOFF.md` first for orientation. Nothing in this spec is built yet; each track below is scoped so a fresh session can pick it up cold.

---

## Current state (what the audit found)

| Piece | Where it lives | Condition |
|---|---|---|
| AI Pulse dashboard | this repo (`index.html`, `assets/app.js`, `assets/style.css`) | Working. Vanilla JS, no build step. Renders 6 fields per item, no scoring. |
| Digest builder playbook | `docs/digest-builder-instructions.md` | Good research + quality bar. No content-opportunity lens, no action flags. |
| Twice-daily automation | `~/.claude/scheduled-tasks/ai-pulse-{morning,midday}-refresh` | Working. Defers to the repo playbook, so playbook edits take effect without touching the tasks. |
| Master conductor | `~/.claude/skills/copy-team.md` (this Mac only) | Working but monolithic: 461 lines holding brand voice, framework library, 4 agents, and output formatting in one file. Not versioned, not on the other Mac. |
| Brand voice canon | `doc-rock-brand-voice` claude.ai skill | Strong and current (Big Purpose, Permission Slip, Mixtape Mindset, Effort Over Metrics, em-dash ban, avoid-list). |
| YouTube metadata lab | `youtube-metadata-lab` claude.ai skill | Strong. Transcript in, titles/thumbnail text/description/chapters/tags out. Has a 60-day freshness check pattern worth copying. |
| Script-writing skill | nowhere | **Missing entirely.** The conductor has a "YouTube Long-Form Script" outline in its platform structures, but no skill produces an actual recordable script. |

### The drift problem (why the plugin refactor matters)

`copy-team.md` inlines its own abbreviated `BRAND_VOICE` block instead of reading the canonical brand skill. The inline version is missing, at minimum:

- The **em-dash ban** (canon: "Never use em dashes... signal AI-generated text")
- The **avoid-list**: "crush it," "hustle," "passive income," "side hustle," "level up," "content creator journey"
- The full **Big Purpose** statement and **Effort Over Metrics** philosophy
- **Aloha / Mahalo** values and the thought-leader (belief first, buttons second) positioning
- The **newsletter (The Permission Slip)** format guidelines (conductor only knows generic "Email")

So the Copywriter agent can produce copy that violates rules the brand skill mandates, and the Critic scores "brand voice" against the thin version. Two sources of truth, already diverged. The fix is structural, not a patch: one canon file, everything reads it.

---

## Track A — Research scoring + action flags (this repo)

**Goal:** every digest item gets scored through Doc's lens: worth a video? worth a social post? worth sharing in the Creator Sandbox Community? And when an item requires Doc to *do something* (YouTube ships a feature he should turn on, Anthropic brings back Fable 5, a pricing deadline), it gets an unmissable act-now flag.

### A1. Schema change (`docs/SCHEMA.md`)

Add one **optional** object per item. Old archives without it must keep rendering untouched.

```json
{
  "headline": "...",
  "summary": "...",
  "why_it_matters": "...",
  "link": "https://...",
  "source": "...",
  "tag": "Product Update",
  "opportunity": {
    "video": 8,
    "social": 6,
    "community": 9,
    "act_now": true,
    "action_note": "Turn on YouTube's Collaboration tag on your next podcast upload — it puts the episode in the guest's subscriber feed.",
    "angle": "I tested YouTube's new collab tag so you don't have to"
  }
}
```

- `video`, `social`, `community`: integers 0–10.
- `act_now`: boolean. Independent of the scores; it means "do something in your business," not "make content about this."
- `action_note`: required when `act_now` is true. One sentence, imperative, specific.
- `angle`: optional. A suggested content hook when any score is 7+. Saves the script-writer a cold start.

### A2. Scoring rubric (new section in `docs/digest-builder-instructions.md`)

Insert as **section 3.5, "Score every item through Doc's lens,"** between the quality bar and the output format. The rubric the builder agent applies:

**Video score (0–10)** — could this carry a Doc Rock YouTube video?
- +hits Doc's beats directly: DaVinci Resolve, Ecamm/livestreaming, AI tools for creators, YouTube platform changes
- +demoable: Doc can show it on screen, not just talk about it
- +timely window: covering it this week beats covering it next month
- +tutorial potential: "here's how to actually use this" beats "this exists"
- 8–10 = drop-what-you're-doing video; 5–7 = solid candidate / segment in a roundup; 0–4 = not video material

**Social score (0–10)** — worth a quick take on socials?
- +conversation starter, hot-off-the-press, strong opinion potential
- +explainable in two sentences without a screen share
- News that's big but generic (every AI account will post it) scores mid unless Doc has a distinct angle

**Community score (0–10)** — worth sharing in the Creator Sandbox Community?
- +immediately practical for members (solo creators, small biz owners, 40s–60s)
- +discussion prompt potential: "has anyone tried this?"
- +fits a "try this this week" nudge, especially for the Saturday Zoom crowd
- The bar is usefulness, not newsworthiness. A small tool update members would actually use outranks a splashy funding story.

**Act-now flag** — set `act_now: true` only when Doc should take a concrete action soon:
- A platform shipped a feature he should enable or test (YouTube, Ecamm, Claude, Resolve)
- A deadline or window: intro pricing ends, a beta opens, a deprecation lands
- Something he uses changed behavior in a way that affects his workflow or channel
- Examples that qualify: "YouTube rolls out Collaboration tags," "Anthropic brings back Fable 5," "Sonnet 5 intro pricing through Aug 31." Examples that don't: a research paper, a funding round, a rumor.
- When true, write `action_note` as the specific move: what to do, where, and why now.

Scoring guidance for the builder: score every item, be stingy with 8+, and never inflate a weak item's score to justify including it — the include/exclude decision still belongs to section 3's quality bar.

### A3. Dashboard UI (`assets/app.js`, `assets/style.css`, `index.html`)

- `normalizeDigest()` passes `opportunity` through when present, `null` when absent (backward compatible with all existing archives).
- `renderCard()` adds a badge row when thresholds hit: 🎬 **Video idea** (video ≥ 7), 📣 **Post it** (social ≥ 7), 🏖️ **Sandbox share** (community ≥ 7). Badges only — the raw numbers stay in the JSON, not on the cards. Keeps the dashboard calm.
- **Act-now treatment:** when `act_now` is true, the card gets an accent border + a ⚡ **Action needed** strip showing `action_note`. This must be the loudest thing on the page.
- New filter pill **"⚡ Action needed"** in the pill row: shows only `act_now` items across all categories. (It's an item-level filter rather than a category filter, so it needs a small special case next to `activeCategory` in `render()`.)
- `renderStatusBanner()` nice-to-have: tolerate editions beyond morning/midday (the July 1 edition ran at 6:37 PM ET labeled "midday" — allow an `"evening"`/`"special"` value so late manual runs don't wear the wrong badge).

### A4. Acceptance criteria

- An old archive edition (no `opportunity` fields) renders pixel-identical to today.
- A new edition with mixed scored/unscored items renders badges only where earned.
- The Action-needed pill shows only flagged items and shows an empty-friendly state when none exist.
- The builder playbook produces valid scored JSON on the next scheduled run with zero changes to the scheduled-task prompts (they already defer to the repo playbook).

**Size:** one session. Schema + playbook edits are small; UI is ~60 lines of JS + CSS.

---

## Track B — Conductor becomes a plugin, skills get single jobs

**Goal:** move the copy-team monolith into a versioned, installable Claude Code plugin ("Doc Rock Studio") where each skill has one job, everything reads one brand canon, and both Macs stay in sync via git.

### B1. Plugin layout

New standalone repo (recommend `docrock/doc-rock-studio`, sibling of HQ and this repo — same "one repo, one robot" rule as `HANDOFF.md`):

```
doc-rock-studio/
  .claude-plugin/
    plugin.json              # name, version, description
    marketplace.json         # so /plugin marketplace add docrock/doc-rock-studio works
  references/                # shared canon, read by every skill
    brand-voice.md           # THE single source of truth (see B3)
    frameworks.md            # the 7 verified frameworks, moved out of the conductor
    platform-structures.md   # YouTube/IG/community/newsletter/sales formats
    voice-guardrails.md      # em-dash ban, AI-tells list, banned words (borrowed from metadata-lab)
  skills/
    conductor/SKILL.md       # thin router (keeps /copy-team as an alias)
    researcher/SKILL.md      # audience intelligence for a topic
    copywriter/SKILL.md      # short/mid-form platform copy
    script-writer/SKILL.md   # NEW — see Track C
    critic/SKILL.md          # scoring + rewrite pass, shared rubric
  README.md                  # install instructions for both Macs
```

Install on each Mac: `claude plugin marketplace add docrock/doc-rock-studio` then install the plugin; updates ship by `git push` + plugin update. This retires the single-machine `~/.claude/skills/copy-team.md` (delete after migration; keep a one-line tombstone pointing at the plugin).

### B2. Duty separation — highest and best use

| Skill | Its ONE job | Explicitly not its job |
|---|---|---|
| **conductor** | Take a request ("promo post for Tuesday's video"), decide which specialists run in what order, assemble the Workflow, format the final delivery | Writing anything itself; holding brand/framework content inline |
| **researcher** | Audience intelligence: pain points, objections, hooks, competitor gap for a topic | Picking frameworks; writing copy |
| **copywriter** | Finished platform copy: social, community, newsletter, email, sales | Video scripts; strategy decisions |
| **script-writer** | Recordable video scripts, long-form and Shorts | Titles/descriptions/tags (that's metadata-lab's job, post-record) |
| **critic** | Score any draft on a shared rubric, rewrite the weakest element | Generating from scratch |
| **brand canon** (`references/brand-voice.md`) | Define who Doc is, voice rules, audience, philosophies | Being duplicated — everything reads it, nothing copies it |

The conductor becomes genuinely thin: collect inputs, inject `references/*.md` into each agent prompt, run the pipeline (researcher + strategist decisions fold into the conductor's routing step or stay as a strategist agent — decide during build), deliver formatted output. Today's pipeline shape (parallel research/strategy → write → critique) is good; it survives the split intact.

`youtube-metadata-lab` and `doc-rock-brand-voice` stay as claude.ai skills for now (they work, and Cowork sessions use them). Revisit folding metadata-lab into the plugin in Phase 4.

### B3. Canon strategy (the important decision)

**Recommendation: the plugin repo is the canon.** `references/brand-voice.md` starts as a copy of the current `doc-rock-brand-voice` claude.ai skill (it's the freshest version), and from then on edits happen in git. The claude.ai skill gets a note at the top: "Canonical version lives in the doc-rock-studio repo; update this copy when that changes." Manual sync on change, with a checklist line in the plugin README. Not perfect, but honest — git gives diffs, history, and both-Mac distribution, which the claude.ai skill can't.

### B4. Migration steps

1. Scaffold the repo + plugin.json + marketplace.json.
2. Extract `BRAND_VOICE` → replace with full canon from the claude.ai brand skill. Extract `FRAMEWORK_LIBRARY` → `references/frameworks.md` + `platform-structures.md`.
3. Port the Workflow script into `skills/conductor/SKILL.md`, with agent prompts now assembled from the reference files.
4. Add `voice-guardrails.md` (em-dash ban, AI-tells, banned-word list) and inject it into **every** writing agent's prompt, not just hope the brand doc covers it.
5. Install on this Mac, run a real piece of copy through it, compare against the old output.
6. Install on Darth Nihilus (pairs with the existing HANDOFF TODO to clone this repo there).
7. Delete `~/.claude/skills/copy-team.md`.

**Size:** one session for scaffold + migration; the content mostly exists and moves.

---

## Track C — Copywriter overhaul + Script-writer creation

### C1. Copywriter: concrete fixes (beyond inheriting the full canon via Track B)

1. **Voice guardrails in the prompt** — the em-dash ban, banned-word list, and AI-tells list (negative parallelism, rule-of-three stacking, hollow transitions) become hard constraints in the copywriter agent prompt. Today they're absent.
2. **Newsletter becomes a first-class platform** — The Permission Slip has its own format rules in canon (one core idea, letter-from-a-friend, "hit reply" endings). Add it to platform structures; retire generic "Email" or keep it only for sales sequences.
3. **Value-first becomes a scored dimension** — see critic rubric below. Every piece must give before it asks.
4. **Personal-lens input** — the conductor collects an optional "Doc's take" input (what he actually did/thinks about the topic) and passes it to researcher + copywriter. Copy written from Doc's actual experience beats copy written from the void.
5. **Never fabricate Doc's experience** — hard rule in the copywriter prompt: if no personal take was provided, don't invent one; write around it or leave a marked `[DOC: your take]` slot.

### C2. Script-writer skill (new — the big build)

**Job:** turn a topic, or an AI Pulse item, into a recordable video script in Doc's voice, value-first, with his personal lens baked in.

**Inputs** (conductor collects, or direct invocation asks):
- Topic **or** a pasted Pulse item (headline/summary/link/angle from Track A flows straight in — this is the pipeline payoff)
- Format: `long-form tutorial` | `news reaction / talking head` | `short` (< 60s)
- Target length (minutes) — drives word budget at ~150 wpm
- **Doc's take (required step, not optional):** before writing, the skill asks up to three quick questions: Have you tried it? What happened? What's your one-sentence opinion? Answers become the spine of the personal lens. If Doc says "no hands-on yet," the script gets explicit `[DOC: record your reaction here]` slots instead of invented anecdotes. **Fabricating personal experience is the one unforgivable failure mode.**

**Structural rules (long-form):**
- **Hook (0–15s):** bold claim, question, or surprising statement. The payoff promise, not a channel intro.
- **Open loop:** "by the end you'll know exactly how to..."
- **Stakes:** why this matters *for Creative Chris*, not for Doc's credentials
- **Value delivered early:** the first real teach moment lands inside the first 90 seconds; no long preamble
- **Body:** teach blocks, each with production cues in a second column: `[SCREEN]`, `[B-ROLL]`, `[TALKING HEAD]`
- **Mid-roll CTA** at 30–40% through, one line, never interrupting a teach block mid-thought
- **Close:** callback to the hook + deliver the promised payoff + forward momentum ("Let's get to work" energy), ONE end CTA

**Shorts mode:** hook (0–3s, verbal + visual simultaneously) → rapid value → one CTA; 140–160 words total.

**Output artifacts:**
- The full script (word-for-word), production-cue column alongside
- Estimated runtime from word count
- An open-loop map (where loops open and close — retention self-check)
- A suggested pinned comment (Permission Slip callback territory)
- A handoff note: "after recording, run the transcript through youtube-metadata-lab"

**Voice requirements (inherited from canon + guardrails, enforced by critic):** conversational Doc, 80s/90s references where natural, no jargon without an analogy, no em dashes, Permission Slip / Mixtape Mindset callbacks where they fit and nowhere they don't.

### C3. Critic: shared rubric, extended

Current rubric (hook, clarity, brand voice, CTA) plus:

| New dimension | What it checks |
|---|---|
| **Value-first (1–10)** | Does it give before it asks? Is the first teach moment early? Would Chris learn something even if he never clicks? |
| **Authenticity (1–10)** | Would Doc actually say this out loud? Any fabricated personal claims? (Auto-fail if yes.) Any banned words or em dashes? (Auto-flag.) |
| **Audience fit (1–10)** | Written for Creative Chris (40s–60s, tech-wary), not for other creators or for the algorithm? |

For scripts, the critic additionally checks promise-payoff integrity (the hook's promise is actually delivered) and retention structure (open loops close).

**Size:** the script-writer is the largest single build in this spec — one to two sessions including a real end-to-end test (pick a real Pulse item, produce a script Doc would actually record).

---

## Track D — The pipeline (how it all clicks together)

Once A–C exist, the flywheel:

```
AI Pulse item (video ≥ 7 or act_now)
   → "make this a video" → conductor
   → researcher + script-writer (using the item's angle + Doc's take)
   → Doc records
   → transcript → youtube-metadata-lab (titles, thumbnail text, description, chapters, tags)
   → copywriter (community post + social promo + newsletter blurb, all from the same video)
```

Phase 4 conveniences (build only after the tracks above are real):
- A conductor mode that reads today's `digest.json` and proposes a content sprint from the top-scored items
- Metadata-lab optionally joins the plugin so the whole chain versions together
- A "weekly review" pass: which scored items did Doc actually make content from (closes the loop on whether the scoring rubric predicts well)

---

## Build order

| Phase | What | Why first/next | Est. |
|---|---|---|---|
| 1 | Track A (scoring + action flags) | Immediate daily value; zero dependencies; the automation picks it up on its next run | 1 session |
| 2 | Track B (plugin + canon extraction) | Unblocks C; kills the brand-drift problem; gets skills onto both Macs | 1 session |
| 3 | Track C (script-writer + copywriter/critic overhaul) | The biggest capability gap; needs B's canon to build on | 1–2 sessions |
| 4 | Track D (pipeline conveniences) | Only valuable once 1–3 are real | as-desired |

## Open decisions for Doc

1. **Plugin repo name:** `doc-rock-studio` is the working name. Better ideas welcome (it'll be typed rarely, seen often).
2. **Strategist agent:** keep it as a fourth agent in the pipeline, or fold framework-selection into the conductor's routing step? (Recommend: keep it — one decisive framework pick per piece has been working.)
3. **Badge thresholds:** badges at score ≥ 7 is the proposal. Tune after a week of scored editions.
4. **Community naming:** the spec uses "Creator Sandbox Community" for the community score. Confirm that's the label wanted on the dashboard badge (currently proposed as "Sandbox share").
