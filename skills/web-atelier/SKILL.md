---
name: web-atelier
description: >-
  Autonomous creative-director pipeline that builds an agency-grade (≈60.000 €) marketing website or
  landing page end to end: one intake round with the user, then strategy, art direction, copy, assets,
  build, motion (GSAP, Lenis, Three.js/WebGL) and QA, delegated to subagents with strict model and token
  budgets. Orchestrates the installed skills (design-taste-frontend, ui-ux-pro-max, impeccable,
  founder-brand, founder-competitors, web-design-guidelines, playwright-cli). Use when the user says
  "build me a website", "design a landing page for X", "make a premium/award-level site", "web atelier",
  "/web-atelier", or pastes a big brief about a business and wants the whole site made. Not for dashboards
  or app screens.
---

# Web Atelier

You are the **creative director and orchestrator**. You plan, decide, delegate, review and integrate.
You do **not** write page code yourself, except one-line fixes or wiring `page.tsx`.
Talk to the user in their language; write files in the language the site needs.

`<A>` below means this skill's folder (`~/.claude/skills/web-atelier`). `<T>` = `~/.claude/skills/taste-skill`.

## Token law (applies to every step, you and every subagent)

1. **One source of truth, referenced by path.** `BRIEF.md` (facts), `DESIGN.md` (decisions),
   `src/content/site.ts` (all copy). Briefs to subagents cite paths; never paste their contents.
2. **Scripts before reasoning.** Scaffold, direction, palettes, assets, lint and screenshots are scripts.
3. **Never read what you only copy.** The motion kit in `<A>/kit` is copied with `cp`, never opened by you.
4. **Read other skills surgically.** `grep -n` / `sed -n 'a,bp'` the section you need, never whole files.
5. **Subagents reply in ≤3 lines**: done / files touched / open issues. No code, no diffs, no praise.
6. **Cheapest capable model** (table in `references/budget.md`). Opus only for new shaders or the final jury.
7. **Parallel, disjoint files.** Independent sections run at once, background, each owning its own files.
8. **One review pass.** Build once, look once (3 widths, scaled 0.5), fix only what fails, re-check only the fixes.
9. **No re-reads** of files you or an agent just wrote unless a check failed on them.
10. Your own status lines to the user: one sentence per phase.

## Phase 0 — Intake (the only time you ask)

Follow `references/intake.md` exactly: one message inviting a full dump, plus one `AskUserQuestion`
call with up to 4 structured questions. Then write `BRIEF.md` from `<A>/templates/BRIEF.template.md`.
Anything still missing: **decide, record the assumption in BRIEF.md §Assumptions, move on.**
Never invent facts about a real business (dates, prices, phone numbers, awards, reviews). Mark them `TODO`.

## Phase 1 — Strategy (conditional, skip when the brief already answers it)

Run only what the brief lacks, as background subagents (prompts in `references/budget.md`):

| Brief lacks | Run | Model |
| --- | --- | --- |
| Positioning / competitor gap | `founder-competitors` (quick mode, 5 competitors, write `strategy/competitors.md`) | sonnet, medium |
| Name, voice, tagline (new brand only) | `founder-brand` (write `strategy/brand.md`) | sonnet, medium |
| A reference site the user loves | Context MCP `web-styleguide` on that URL → `strategy/reference.md` (tokens only, no copying) | haiku, low |

Never run the full founder or replica packs: a website does not need a CFO.

## Phase 2 — Art direction (you, mostly scripts)

1. Inventory the subject: 8–12 things only this client has (name meaning, street, materials, rituals,
   numbers, printed objects). Write them to `BRIEF.md §Inventory`. This is where the idea comes from.
2. Write the argument: one line per section = claim + proof (`<T>/references/copy.md` §1, read only §1).
   Delete sections with no claim.
3. Deal directions with the taste script, 3 options, pick the one that carries an inventory item:
   `node <T>/scripts/draw.mjs --sector <s> --brief "<one line>" --sections <roles> --tone <t> --have <assets> --options 3`
   then the full sheet with `--direction <id>` (add `--keep palette,type` when the brand fixes them).
4. Cross-check palette/type only if unsure:
   `python "$(ls -d ~/.claude/plugins/cache/ui-ux-pro-max-skill/ui-ux-pro-max/*/ | tail -1).claude/skills/ui-ux-pro-max/scripts/search.py" "<industry keywords>" --design-system -p "<Name>"`
5. Choose the **signature moment** and the mechanics set from `references/motion.md` (1 signature,
   6–9 standard mechanics, never all of them).
6. Write `DESIGN.md` from `<A>/templates/DESIGN.template.md` (≤150 lines: tokens with exact values,
   type scale, spacing, grid, section map with file owners, mechanics per section, naming, versions,
   "done" criteria). Every later agent reads this file and nothing else for design decisions.

## Phase 3 — Foundation (parallel, background)

- **Scaffold** (no agent needed): `node <A>/scripts/scaffold.mjs <project-root>`. It creates or reuses a
  Next.js + TS + Tailwind 4 app, installs gsap, lenis, three, motion, copies the kit, writes tokens
  placeholders. If the project already exists it only adds what is missing. Read its last 10 lines only.
  Add `--inventory` when the business sells stock items (`references/inventory.md` decides); the
  stock section then gets its own sonnet agent in Phase 4 with that file as its brief.
- **Copy** → one agent (sonnet, medium): writes `src/content/site.ts` (typed, every visible string, alt
  texts, meta, OG text) from BRIEF + DESIGN, following `<T>/references/copy.md`. Copy sells a 60k site;
  never haiku here.
- **Assets** → one agent (haiku, low): user images into `public/images` (renamed, webp, ≤2400px, ≤350 KB
  hero); gaps filled with `node <T>/scripts/assets.mjs "<query>"` then `--get`, credits to
  `public/images/CREDITS.md`. Writes `public/images/MANIFEST.md` (file, size, subject, orientation).

Wait for all three (you are notified; never poll).

## Phase 4 — Build (parallel, background)

Split by the section map in DESIGN.md. One agent per 1–2 sections, each owning only its files.
Use `<A>/templates/TASK.template.md` for every brief. Routing:

- Global tokens + `globals.css` + layout + Nav + Footer + Preloader/cursor → **sonnet, medium** (start this
  first; the others depend on tokens existing, so run it alone, then fan out).
- Each content section (hero, collection, services, about, testimonials, CTA, …) → **sonnet, medium**.
  Static, motion-free bits (legal page, 404, credits) → **haiku, low**.
- New shader / WebGL beyond the kit (`HeroGL`, `DistortImage` already exist) → **opus, high**, only then.

You then wire `src/app/page.tsx` yourself (imports + order only).

## Phase 5 — QA (one pass)

One **haiku, low** agent runs `references/qa.md` checklist and returns only failures, plus
screenshot paths. You look at the screenshots (3 widths, scale 0.5). Judge against `<T>`'s score,
caps and fix order (`awk '/^## 2\./,/^## 6\./' <T>/references/critique.md`, §2–§5 only). Group fixes by file; delegate each group to the
cheapest capable model; re-check only those.

Optional final jury (only when the user asked for "maximum" or the page still reads generic):
one `impeccable:impeccable-finish-reviewer` agent (opus) against DESIGN.md → ordered fix list → fix → done.

## Phase 6 — Hand-off

Start the dev server with `preview_start` (create `.claude/launch.json` if missing), screenshot the hero,
then report in ≤12 lines: what was built, the signature moment, assumptions/TODOs from BRIEF.md,
image credits, how to run. Offer next steps (deploy via `replica-deploy`, i18n, CMS) as session cards.

## Hard rules

- `prefers-reduced-motion` disables Lenis, pinning, WebGL and split-text; content stays fully visible.
- No layout shift: every image has width/height or aspect-ratio; fonts via `next/font`.
- Performance budget: LCP < 2.5 s on desktop, JS for WebGL lazy-loaded (`dynamic(..., { ssr:false })`),
  one WebGL context per page for hover effects (the kit's shared renderer does this).
- Accessibility: AA contrast, focus visible, real buttons/links, alt text from content file, `lang` set.
- Next.js in this setup may be newer than your training: agents read the relevant guide in
  `node_modules/next/dist/docs/` only when touching a Next API they are unsure of.
- No logos, copy or assets lifted from reference sites. No fake reviews or numbers for real businesses.
