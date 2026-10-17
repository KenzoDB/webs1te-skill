# Model routing and subagent prompts

## Routing table (Agent tool: `model`, `effort`)

| Work | model | effort | Why |
| --- | --- | --- | --- |
| Asset search/download/convert, credits, file moves, static legal/404 pages, QA checklist runner | haiku | low | Mechanical, verifiable by script |
| Reference-site styleguide extraction | haiku | low | One MCP call + summarise |
| Copy (`site.ts`), competitors, brand voice | sonnet | medium | Taste in words; cheap models write generic copy |
| Tokens/layout/nav/footer, every content section, GSAP/ScrollTrigger, Lenis, responsive, kit wiring | sonnet | medium | Main implementation |
| A fix that failed twice with sonnet | sonnet | high | Escalate effort before model |
| New GLSL shader / WebGL effect not covered by the kit | opus | high | Genuinely hard |
| Final jury (optional) | opus via `impeccable:impeccable-finish-reviewer` | default | Only when asked or page reads generic |

Rule: when in doubt, the cheaper one. Escalate one notch only after a concrete failure.

## Spawning rules

- `run_in_background: true` for everything that can run in parallel; you are notified on completion.
- Never two agents on the same file. The section map in DESIGN.md names each file's owner.
- No conversation history in briefs. Paths, task, done-criteria. That is all.
- Ask for the reply format verbatim: **"Reply in ≤3 lines: done | files | open issues. No code."**
- A failed agent: read its 3 lines, fix the brief, resend to the same agent (`SendMessage`) rather than a new one.

## Ready-made briefs (fill the <> and send as `prompt`)

### Competitors (sonnet, medium)
Use the `founder-competitors` skill in quick mode for: <one-line business + city>. Max 5 competitors,
public sources only. Write `strategy/competitors.md` (≤60 lines): table + the gap we can own + 5 phrases
customers use. Do not run any other founder skill. Reply in ≤3 lines: done | files | open issues.

### Brand (sonnet, medium)
Use the `founder-brand` skill for <business>. Inputs: `BRIEF.md`, `strategy/competitors.md` if present.
Only: name check (if new), voice (5 do / 5 don't), tagline (3 options, pick one), look brief that does not
contradict BRIEF.md §Look. Write `strategy/brand.md` ≤80 lines. Reply in ≤3 lines.

### Copy (sonnet, medium)
Write `src/content/site.ts`: a typed `export const site = {...} as const` with every visible string per
section in DESIGN.md §Sections, plus `meta` (title ≤60, description ≤155, og), image alts, CTA labels.
Sources: `BRIEF.md` (facts — never invent any), `DESIGN.md` (voice, argument). Follow
`~/.claude/skills/taste-skill/references/copy.md` (read §1–§3 only). Headlines short and concrete;
no "Welcome to", no "Discover", no triplets of adjectives. Languages: <list>; if several, one object per
locale with identical keys. Reply in ≤3 lines.

### Assets (haiku, low)
Prepare images for the site. Read `BRIEF.md §Assets` and `DESIGN.md §Imagery`. 1) Copy user images to
`public/images/` with kebab-case names. 2) For each gap listed in DESIGN.md §Imagery run
`node ~/.claude/skills/taste-skill/scripts/assets.mjs "<query>"`, choose, `--get <ref>`. 3) Convert to webp,
max 2400px long edge, hero ≤350 KB, others ≤200 KB (use `npx sharp-cli` or `ffmpeg`, whichever exists).
4) Write `public/images/MANIFEST.md` (file | WxH | KB | subject) and `public/images/CREDITS.md`
(`assets.mjs --credits`). Never use images of identifiable private people without the user's files.
Reply in ≤3 lines.

### Section build (sonnet, medium) — use templates/TASK.template.md

### QA runner (haiku, low) — "Run every check in `~/.claude/skills/web-atelier/references/qa.md` against
<url>. Return only failures as `file:line — problem` (max 25 lines) and the screenshot paths."
