# Handoff: Doc Rock's AI Pulse restyle (+ opportunity badges & act-now cards)

## Overview

Visual redesign of the AI Pulse dashboard (`docrock/ai-news-dashboard`) in the Doc Rock brand: purple/red ladders over plum or near-white surfaces, Montserrat display, Bitter body. Layout and behavior of the existing site are preserved; this restyles every region and adds the two new elements from `docs/improvement-spec.md` Track A: opportunity badge rows and act-now cards, plus a new "⚡ Action needed" filter pill.

## About the design files

Everything in `design-source/` is a **design reference created in HTML** (a prototype format with inline styles), not production code. The task is to **recreate the design in the existing codebase**: plain HTML + CSS + vanilla JS, no framework, no build step, exactly like today's `index.html` / `assets/style.css` / `assets/app.js`. Most of the work is replacing values in `style.css` and adding ~3 small render branches in `app.js`. The inline styles in `design-source/*.dc.html` are the authoritative pixel values; this README repeats all of them.

## Fidelity

**High-fidelity.** Colors, type, spacing, radii, shadows, and copy are final. Recreate pixel-perfectly. All values are expressed as CSS custom properties in `pulse-tokens.css` (in this folder): `:root` holds light values, `[data-theme="dark"]` holds dark overrides, matching the site's existing theme mechanism. Load order: `assets/fonts.css` → `pulse-tokens.css` → component CSS.

## Global

- Fonts: self-hosted Montserrat (variable) + Bitter, in `assets/fonts/` with `assets/fonts.css`. `--font-display` for headings/UI, `--font-body` (Bitter) for reading text.
- Body: `background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); font-size: 16px;` (17px is fine ≥600px, never below 16). Theme swap transitions `background-color 0.3s`, `color 0.3s`.
- Content wrap: `max-width: 1080px; margin: 0 auto; padding: 0 clamp(16px, 2vw, 28px);` (masthead and dateline bar are full-bleed; their content is centered).
- Motion: `--ease: cubic-bezier(0.22, 0.61, 0.36, 1)`. Hover gesture everywhere is a 2px lift. **Transition `transform` only on elements whose background changes with state** (pills): transitioning background on a state swap briefly shows stale fills. Include the `prefers-reduced-motion` block from `pulse-tokens.css`.
- Icons: hand-drawn Lucide-style strokes, `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`. All paths used are listed at the bottom.

## Screens / regions (top to bottom)

### 1. Masthead (`.site-header`)

Identical in both themes; it never swaps (a nameplate, like a paper's).

- Background: `var(--grad-masthead)` with a `var(--glow-violet)` radial overlay (absolutely positioned div, `inset: 0`, painted above the gradient, below content).
- Bottom edge: 3px full-width rule, `background: var(--grad-hot)`.
- Content: centered column, `text-align: center`, gap 10px, padding `clamp(26px, 3vw, 44px) 64px clamp(24px, 2.6vw, 38px)` (64px side padding keeps text clear of the toggle).
  - Logotype: `assets/doc-rock-logotype.png` (white version, in this folder), `height: clamp(20px, 1.4vw + 15px, 34px)`, `opacity: 0.95`, alt "doc rock".
  - Brand row (flex, centered, gap `clamp(10px, 1.2vw, 16px)`):
    - `.brand-mark` "AI": square `clamp(38px, 2vw + 30px, 54px)`, `border-radius: 12px`, `background: var(--grad-hot)`, white, Montserrat 900, `font-size: clamp(14px, 0.8vw + 11px, 20px)`, `letter-spacing: 0.04em`, `box-shadow: var(--shadow-glow)`.
    - `h1` "Doc Rock's AI Pulse": Montserrat 900, UPPERCASE, `font-size: clamp(25px, 2.1vw + 17px, 45px)`, `line-height: 1.05`, `letter-spacing: -0.01em`, white.
  - `.tagline` "What's new in AI, explained like a human": Bitter italic, `clamp(15px, 0.5vw + 13px, 19px)`, `rgba(255,255,255,0.88)`.
- `.theme-toggle`: absolute top 16 right 16, 46px circle, `background: rgba(255,255,255,0.14)`, `border: 1px solid rgba(255,255,255,0.28)`, `backdrop-filter: blur(8px)`, emoji 19px (🌙 in light, ☀️ in dark). Hover: bg to `0.24` + lift 2px. Keep the existing aria-label swap.

### 2. Status banner → dateline bar (`.status-banner`)

Full-bleed bar: `background: var(--color-surface); border-bottom: 1px solid var(--color-border);`. Inner row centered, flex-wrap, gap `10px 14px`, padding `11px 20px`:

- Status text: "UPDATED WEDNESDAY, JULY 1 · 6:37 PM ET" (uppercase via CSS), Montserrat 700, 12.5px, `letter-spacing: 0.14em`, `color: var(--color-text-muted)`.
- `.edition-badge`: pill, padding `4px 12px`, Montserrat 700, 11px, uppercase, `letter-spacing: 0.12em`, white text. Fill by edition: morning `var(--color-accent-fill)` (#8207c5), midday `var(--color-hot-fill)` (#d90816), evening/special `#35034f`. (Spec A3 asks the banner to tolerate values beyond morning/midday.)

### 3. Controls (`.controls`)

Row 1 (flex, wrap, `align-items: flex-end`, gap `12px 18px`):

- `.search-input` wrapper: `flex: 1 1 300px; min-width: 240px; position: relative;` with the search icon (18px, `color: var(--color-text-muted)`) absolute at left 14, vertically centered. Input: `min-height: 48px; padding: 12px 16px 12px 42px; font: 500 15px var(--font-display); color: var(--color-text); background: var(--color-surface); border: 1px solid var(--color-border-strong); border-radius: var(--radius-md);`. Placeholder "Search headlines and summaries…" in muted. Focus: `border-color: #bd4ef9; box-shadow: 0 0 0 3px rgba(189,78,249,0.25); outline: none;`.
- Previous editions group: `flex: 0 1 250px; min-width: 210px;` column, gap 6. `.archive-label`: Montserrat 700, 11.5px, uppercase, `letter-spacing: 0.14em`, muted. `.archive-select`: same field styling as the input (48px min-height, radius 10, border-strong). On phones both wrap to full width naturally; no media query needed.

Row 2, `.category-filters` (flex, wrap, gap 8). `.pill`:

- Resting: `min-height: 44px; padding: 9px 18px; border-radius: var(--radius-pill); border: 1px solid var(--color-border-strong); background: var(--color-surface); color: var(--color-text); font: 700 14px var(--font-display); transition: transform 0.12s var(--ease);`. Hover: lift 2px.
- `.is-active`: `background: var(--color-accent-fill); color: #fff; border-color: transparent; box-shadow: 0 6px 16px rgba(130,7,197,0.28);`.
- New `.pill--act` ("⚡ Action needed"): resting `background: var(--color-hot-soft); color: var(--color-link); border: 1px solid var(--color-hot-border);`. Active: `background: var(--color-hot); color: #fff; box-shadow: var(--shadow-glow);`. It carries a count chip: `min-width 20px; height 20px; padding 0 6px; border-radius: 999px; font: 800 11.5px var(--font-display);`, resting `background: rgba(217,8,22,0.12)` light / `rgba(249,98,108,0.20)` dark with `color: var(--color-link)`; when active `background: rgba(255,255,255,0.25); color: #fff`. Count = number of `act_now` items in the loaded edition.
- Pill order: All · the four categories · ⚡ Action needed.

### 4. Category sections (`.category-section`)

- Section spacing: `margin-bottom: clamp(28px, 3vw, 42px)`.
- `.category-heading`: flex row, gap 12, `border-bottom: 2px solid var(--color-border); padding-bottom: 10px; margin-bottom: 18px;`
  - Category icon: 22px stroke SVG, `color: var(--color-tag-text)` (paths below).
  - `h2`: Montserrat 800, UPPERCASE, `font-size: clamp(17px, 0.5vw + 15px, 21px)`, `letter-spacing: 0.04em`, `color: var(--color-heading)`.
  - `.category-count`: pill chip, padding `4px 11px`, `background: var(--color-tag-bg); color: var(--color-tag-text)`, Montserrat 700, 12px. Copy: "5 stories" / "1 story".
- `.card-list`: `display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: 18px; align-items: stretch;`. This one line gives 2-up at 1080px and 1-up on phones; the existing 700px media query can be deleted.

### 5. Footer (`.site-footer`)

`border-top: 1px solid var(--color-border); padding: 24px 0 42px; text-align: center;`. Text: Bitter italic, 14.5px, muted. Copy unchanged: "Built by Doc Rock · AI news, summarized for humans · no login, no tracking, just the pulse."

## News card (`.card`)

Base card, in DOM order:

- Shell: `background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: 22px 24px 20px; overflow: hidden; transition: transform 0.2s var(--ease);`. Hover: lift 2px. Flex column so the footer row can pin to the bottom (`margin-top: auto`) and cards in a row equalize.
- `.card-top` (flex, wrap, gap 10, margin-bottom 12):
  - `.card-tag`: `padding: 5px 10px; border-radius: var(--radius-sm); background: var(--color-tag-bg); color: var(--color-tag-text); font: 700 11.5px var(--font-display); text-transform: uppercase; letter-spacing: 0.06em;`.
  - `.card-source`: Montserrat 600, 13px, muted.
- `h3` headline: Montserrat 800, 20px, `line-height: 1.32`, `letter-spacing: -0.01em`, margin-bottom 10. Link `color: var(--color-heading)`, no underline; hover `color: var(--color-link)` + underline, `text-underline-offset: 3px`. Links open in a new tab (unchanged).
- `.card-summary`: Bitter 400, 16px, `line-height: 1.65`, `color: var(--color-text)`, margin-bottom 16.
- `.card-why` (the signature element, calm but special): `background: var(--color-why-bg); border-left: 3px solid var(--color-why-border); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; padding: 12px 16px 13px; margin-bottom: 16px;`
  - Label "WHY IT MATTERS" on its own line: Montserrat 800, 11px, `letter-spacing: 0.18em`, `color: var(--color-tag-text)`, margin-bottom 5.
  - Text: Bitter **italic**, 15.5px, `line-height: 1.6`, `color: var(--color-text)` (full contrast, not muted).
- Footer row (flex, wrap, gap 10, `align-items: center`):
  - `.card-link` "Read more →": Montserrat 700, 14px, `color: var(--color-link)`, arrow as a separate span, gap 6. Hover: underline, offset 3px. Give it `padding: 4px 0` so the hit area clears 24px.
  - `.card-badges` (NEW, right-aligned via `margin-left: auto`): see below.

### Variant: opportunity badges (`.card-badges`)

Rendered only when `item.opportunity` scores cross the threshold (≥ 7): 🎬 "Video idea" (video), 📣 "Post it" (social), 🏖️ "Sandbox share" (community). Never show raw numbers.

- Row: flex, wrap, gap 8, bottom-right of the card next to Read more.
- `.badge`: `padding: 5px 12px; border-radius: var(--radius-pill); background: var(--color-badge-bg); border: 1px solid var(--color-badge-border); color: var(--color-text); font: 700 12px var(--font-display); letter-spacing: 0.02em; white-space: nowrap;` with the emoji, then a space, then the label.
- Deliberately the quietest chips on the card: hairline border, no fill color, the emoji is the only color. Do not make them louder.

### Variant: act-now (`.card--act`)

The loudest thing on the page, by rule. Everything else stays calm so this works.

- Shell overrides: `background: var(--color-act-surface); border-left: 6px solid var(--color-hot); box-shadow: var(--shadow-glow), var(--shadow-sm);` (other three borders stay 1px `var(--color-border)`).
- `.act-strip` is the FIRST child, full-bleed inside the card (negative margins mirror the padding: `margin: -22px -24px 18px -24px; padding: 13px 24px 14px 20px;`), `background: var(--grad-strip)` (deeper stops than `--grad-hot` so white text stays AA). Layout: flex, gap 12, `align-items: flex-start`:
  - "⚡" at 20px.
  - Column, gap 3: label "ACTION NEEDED" (Montserrat 800, 11.5px, `letter-spacing: 0.16em`, uppercase, `rgba(255,255,255,0.92)`) above `action_note` (Bitter 500, 15.5px, `line-height: 1.5`, white). The note is one imperative sentence from the JSON.
- Card `overflow: hidden` clips the strip to the top radius.

### Variant: act-now + badges

Both at once is valid (e.g. the Sonnet 5 story). No special handling: strip owns the top, badges stay quiet at the bottom. Nothing else changes.

## States (`.state-message` area)

All four centered, max-width ~44ch of Bitter text. Existing copy is unchanged.

- **Loading**: pulsing 10px dot (`background: var(--color-tag-text)`, `animation: pulse-skel 1.2s infinite`) + "Fetching the latest AI news…" (Bitter 16px, muted), above 1–2 skeleton cards: normal card shell containing bars (`background: var(--color-skeleton); border-radius: 6px;` heights 22/18/12/12/46px, widths 96px/70px then 82%/100%/94%/100%), each `animation: pulse-skel 1.6s infinite` with 0.15s stagger. Keyframes: `pulse-skel { 0%,100% { opacity: .5 } 50% { opacity: 1 } }`.
- **Slow news day (empty)**: panel `background: var(--color-surface); border: 1px dashed var(--color-border-strong); border-radius: var(--radius-xl); padding: 34px 24px;` with a 34px sun icon (`color: var(--color-tag-text)`), kicker "SLOW NEWS DAY" (Montserrat 800, 11px, `letter-spacing: 0.18em`, same violet), then "No news yet for this edition. Check back soon!" (Bitter 17px).
- **Error**: same panel but `border: 1px solid var(--color-hot-border)`, 32px alert-triangle icon in `var(--color-link)`, "Couldn't load the news feed right now. Try refreshing the page in a bit." (Bitter 16.5px), and a Refresh button: pill, `min-height: 44px; padding: 10px 22px; background: var(--color-hot-soft); border: 1px solid var(--color-hot-border); color: var(--color-link); font: 800 14px var(--font-display);`, hover lift.
- **No search results**: dashed panel, 32px search icon in violet, "No stories match your search or filter. Try clearing one of them.", and a "Clear search & filters" button: pill, `background: var(--color-accent-fill); color: #fff;`, hover lift. Clicking clears the query AND resets the pill to All.

## Interactions & behavior

- Theme: `data-theme="dark"` on `<html>`, persisted (existing localStorage mechanism). Light is the default. Masthead does not change with theme.
- Search: live substring match on headline + summary, case-insensitive (existing behavior).
- Pills: single-select. Category pills filter sections; "⚡ Action needed" is an item-level filter across all categories (spec A3): show only `act_now` items, hide categories that end up empty. While any filter/search is active, hide empty sections entirely.
- Hover states: 2px lift on cards, pills, buttons, toggle; link hovers as specified. Press returns to rest.
- No new animations beyond the skeleton pulse and the lifts. Respect `prefers-reduced-motion` (block included in `pulse-tokens.css`).

## State management (unchanged from app.js, plus)

Existing: `activeCategory`, search query, theme, current edition. New: treat `"act"` as a special value of `activeCategory` next to category ids; compute the ⚡ pill count from the loaded edition; `normalizeDigest()` passes `opportunity` through (`null` when absent) so old archives render with zero badges/strips, exactly as today.

## Design tokens

`pulse-tokens.css` in this folder is the complete sheet: colors (light + dark), gradients, shadows, type scale, space scale (4px base), radii, motion. Named `--color-*`, `--space-*`, `--radius-*`, `--text-*` for a one-to-one build mapping. Notable intentional choices:

- Brand purple deepens to `#8207c5` for text/fills on light (AA); the brighter `#bd4ef9` is the dark-theme text accent.
- `--color-accent-fill` and `--color-hot-fill` are theme-constant so white text on them passes AA in both themes.
- `--grad-strip` uses deeper stops than the brand `--grad-hot` for the same reason. `--grad-hot` remains for the decorative brand mark and the masthead rule.
- All text-on-surface pairs were checked at AA (muted text included); body floor is 16px; interactive targets ≥ 44px.

## Assets (in this folder)

- `assets/doc-rock-logotype.png`: white logotype for the masthead (both themes; the masthead is always dark).
- `assets/fonts/` + `assets/fonts.css`: self-hosted Montserrat variable + Bitter.
- Icon paths (24×24, stroke 2, round caps/joins, `fill="none"`):
  - Claude & Anthropic (spark): `M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z`
  - Wider AI World (globe): `M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M3 12h18M12 3a15.3 15.3 0 0 1 0 18a15.3 15.3 0 0 1 0-18`
  - Tools & Tips (wrench): `M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z`
  - Content & Social (megaphone): `M3 11l18-5v12L3 13v-2zM11.6 16.8a3 3 0 1 1-5.8-1.6`
  - Search: `M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M16.2 16.2L21 21` (no-results adds `M8.5 11h5`)
  - Sun (empty state): `M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4`
  - Alert triangle (error): `M10.3 4.1L2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.1a2 2 0 0 0-3.4 0M12 9v5M12 17.5v.5`

## Files

- `pulse-tokens.css`: the token sheet (load after fonts.css).
- `design-source/PulsePage.dc.html`: full page reference (masthead, dateline, controls, sections, footer; the `data()` block also shows sample scored JSON items).
- `design-source/PulseCard.dc.html`: card reference with all four variants.
- In the design workspace, `AI Pulse Redesign.dc.html` shows the four full-page comps (desktop/mobile × light/dark), the card sheet, and the states side by side.

## Copy rule

No em dashes anywhere in rendered copy (brand voice canon). The design comps use commas/colons in the summaries; the digest builder playbook enforces this upstream.
