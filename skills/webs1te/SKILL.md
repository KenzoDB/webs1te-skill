---
name: webs1te
description: >-
  The full website workflow, from links to a live site. Give it a business's links (current website,
  Google Maps place, socials, sites you love) and whatever you know; it extracts every fact with
  site-to-md and gmaps-to-md in parallel, merges them into one brief, asks you a single round of
  questions, then runs the web-atelier pipeline (art direction, copy, assets, GSAP/Lenis/Three.js build,
  QA) to deliver an agency-grade (≈60.000 €) site, with SEO carry-over, local-business structured data
  and an optional deploy. Token-efficient: subagents per job, cheapest capable model. Use when the user
  says "webs1te", "/webs1te", "make a website for this business", "redo this site", pastes a website
  and/or Google Maps link and wants a site built, or asks for the full website workflow.
---

# webs1te — links in, premium site out

You are the orchestrator. This skill adds a **research front** and a **ship back** to `web-atelier`;
everything in between is web-atelier, unchanged. Do not duplicate it: read it.

`<W>` = `~/.claude/skills/web-atelier` · `<S>` = this skill's folder. Talk in the user's language.

Token law: web-atelier's "Token law" applies to the whole run (read it once: `sed -n '/^## Token law/,/^## Phase 0/p' <W>/SKILL.md`).
The extra rule here: **you never read the raw dossiers.** A subagent distils them into `BRIEF.md`;
you read only the brief.

## Stage 1 — Links and research (start work before asking anything)

1. From the user's message, sort every link into: `site` (their current website), `maps` (Google Maps
   place), `social` (Instagram, Facebook, TikTok…), `refs` (sites they love), `competitors`.
2. Run `node <W>/scripts/scaffold.mjs <root>` in the background right away if there is no project yet
   (it never overwrites, and research does not depend on it).
3. Launch the dossier agents **now, in background, in parallel**, prompts in `<S>/references/briefs.md`:
   - `site` → site-to-md agent (haiku, medium) → `research/<slug>-site.md`
   - `maps` → gmaps-to-md agent (haiku, medium) → `research/<slug>-gmaps.md`
   - each `ref` (max 2) → styleguide agent (haiku, low) → `research/ref-<slug>.md`
   - no `site` but `maps` shows a website → the gmaps agent triggers site-to-md for it as well.
   No links at all → skip to step 4; the run then works from the user's words alone.
4. **In the same turn**, run web-atelier's intake (`<W>/references/intake.md`) with two changes:
   - The dump invitation says: "I'm already reading your website and Google Maps; tell me only what
     those don't show" (the story, the people, what they want the site to achieve, what to never say,
     photos they own, languages, the look they want).
   - Drop any `AskUserQuestion` item the links obviously answer; keep Scope, Motion, Images, Languages
     otherwise. Add, if there is an existing site: **"Redesign or fresh start?"** (keep their structure
     and URLs vs. rebuild the argument from zero).
   The user answers while the dossiers run.

## Stage 2 — The brief (one distiller, then you)

When the dossiers and the user's answers are in, send the **distiller** (sonnet, low; prompt in
`briefs.md`): it reads `research/*.md` + the user's answers (you paste only the answers, which are short)
and writes `BRIEF.md` from `<W>/templates/BRIEF.template.md`, every fact with its source tag
(`[site]`, `[maps]`, `[user]`), conflicts listed under §Conflicts (user wins, then Maps for hours/phone/
address, then site), plus `research/seo-carryover.md` (old URLs, titles, descriptions, H1s) when a site
exists.

You read `BRIEF.md` only. Resolve §Conflicts yourself if obvious; ask the user in **one** line only if a
conflict changes what the site says (price, hours, address).

## Stage 3 — Build: run web-atelier Phases 1–5

Open `<W>/SKILL.md` and follow it **from Phase 1** (Phase 0 is done: BRIEF.md exists). Extras it must
pick up from the research:

- **Real reviews** from `[maps]` feed the testimonials section verbatim (name + stars + date), never edited
  beyond "…" cuts. The rating and count appear only as Maps shows them.
- **Real photos**: the gmaps dossier lists the place's photo URLs. Those belong to Google or to whoever
  uploaded them, so they are not ours to reuse: use them only as a visual reference for the assets agent's
  queries, unless the user confirms they own them. The user's own photos and the current site's photos
  (if the user owns that site) are allowed.
- **Facts block** (address, hours, phone, map link) comes from `[maps]` and is rendered from `site.ts`,
  never hard-coded.
- **Redesign mode**: keep every old URL that had content (route or redirect, see Stage 4).

## Stage 4 — Ship

Follow `<S>/references/ship.md`: SEO carry-over (metadata, redirects, sitemap, robots), LocalBusiness
JSON-LD from the Maps facts, OG image, favicon, legal pages, final QA rerun of only the new bits, then
**ask before deploying**. Deploying (via `replica-deploy`'s preflight and host steps) and DNS changes are
outward-facing: you need the user's explicit yes in chat.

## Stage 5 — Hand-off

web-atelier Phase 6, plus in the report: the dossiers produced, facts still `TODO`, conflicts you
resolved and how, which old URLs now redirect where, and whether it is deployed (URL) or ready to deploy.

## Fallbacks

- No browser available to an agent → the skill's own fallback (WebFetch + search) and the dossier says
  "partial"; the distiller marks those facts `[partial]`.
- Maps link is a list/search → the agent picks the place whose name matches the user's business; if
  ambiguous, it stops and reports the candidates (you ask the user once).
- Cookie/consent walls: the agents choose the most privacy-preserving option (reject non-essential).
