---
name: webs1te
description: >-
  The full website workflow, from links to a live site and a pitch. Give it a business's links (current
  website, Google Maps place, Instagram, sites you love) and whatever you know; it extracts every fact
  with site-to-md, gmaps-to-md and insta-to-md in parallel, merges them into one brief, asks you a
  single round of questions, then runs the web-atelier pipeline (art direction, copy, assets,
  GSAP/Lenis/Three.js build, optional live stock from the business's own data, QA) to deliver an
  agency-grade (≈60.000 €) site with SEO carry-over and local-business structured data. It ends with a
  project-specific deployment guide and a short email + Instagram DM pitching the site to the owner.
  Token-efficient: subagents per job, cheapest capable model. Use when the user says "webs1te",
  "/webs1te", "make a website for this business", "redo this site", pastes website / Google Maps /
  Instagram links and wants a site built, or asks for the full website workflow.
---

# webs1te — links in, premium site + pitch out

You are the orchestrator. This skill adds a **research front** and a **ship-and-pitch back** to
`web-atelier`; everything in between is web-atelier. Do not duplicate it: read it.

`<W>` = `~/.claude/skills/web-atelier` · `<S>` = this skill's folder. Talk in the user's language; the
site, deploy guide for the owner and pitch are in the business's language.

Token law: web-atelier's "Token law" applies to the whole run (read it once:
`sed -n '/^## Token law/,/^## Phase 0/p' <W>/SKILL.md`). Extra rule: **you never read the raw dossiers.**
A subagent distils them into `BRIEF.md`; you read only the brief.

## Stage 1 — Links and research (start work before asking anything)

1. Sort every link from the user's message into: `site`, `maps`, `instagram`, `social` (other networks),
   `refs` (sites they love), `competitors`.
2. No project yet → run `node <W>/scripts/scaffold.mjs <root>` in the background now (never overwrites;
   `--inventory` can be added later by rerunning it).
3. Launch the dossier agents **now, in background, in parallel** (prompts in `<S>/references/briefs.md`):
   - `site` → site-to-md (haiku, medium) → `research/<slug>-site.md`
   - `maps` → gmaps-to-md (haiku, medium) → `research/<slug>-gmaps.md`
   - `instagram` → insta-to-md (haiku, medium) → `research/<handle>-instagram.md`
   - each `ref` (max 2) → styleguide (haiku, low) → `research/ref-<slug>.md`
   - Maps or Instagram reveals a website/Instagram not given → that agent runs the other skill too.
   No links → skip to step 4.
4. **Same turn**: web-atelier intake (`<W>/references/intake.md`) with these changes:
   - The dump invitation says: "I'm already reading their website, Google Maps and Instagram; tell me only
     what those don't show" (story, people, goal of the site, what to never say, own photos, languages, look).
   - Drop `AskUserQuestion` items the links obviously answer. Add, when relevant:
     **"Redesign or fresh start?"** (existing site) and **"Show live stock?"** — options: "Yes, they have
     a shop system (Shopify/Woo/Square/POS)", "Yes, via a Google Sheet they update", "No".
   - Ask also (inside the dump text): "Is this for your own business or a client you'll pitch to? If a
     client: your name, studio name and contact for the pitch signature, and your price if you want it
     in the pitch."
   The user answers while the dossiers run.

## Stage 2 — The brief (one distiller, then you)

When the dossiers and answers are in, send the **distiller** (sonnet, low; `briefs.md`). It writes
`BRIEF.md` (facts tagged `[site]` `[maps]` `[ig]` `[user]` `[partial]`, §Conflicts, §Stock signals) and
`research/seo-carryover.md` when a site exists. You read `BRIEF.md` only. Resolve obvious conflicts;
ask the user in **one** line only if a conflict changes what the site says (price, hours, address).

## Stage 3 — Build: web-atelier Phases 1–5

Follow `<W>/SKILL.md` **from Phase 1** (Phase 0 is done). Extras from the research:

- **Reviews** from `[maps]` (and praise comments from `[ig]`) feed testimonials verbatim (name, source,
  date), only "…" cuts. Rating and count exactly as Maps shows them.
- **Photos**: Maps and Instagram photos belong to their uploaders: reference only for the assets
  agent's queries, unless the user confirms the owner agreed (then download the specific ones listed).
  For a pitch build (owner not yet asked) prefer open-licence images and say in the pitch that their own
  photos will replace them.
- **Voice**: the copy agent also reads `[ig]` §Voice to sound like the owner, refined.
- **Facts block** (address, hours, phone, map link) from `[maps]` via `site.ts`, never hard-coded.
- **Redesign mode**: keep every old URL that had content (route or redirect, Stage 4).
- **Live stock** if the user said yes or §Stock signals is strong: rerun scaffold with `--inventory`
  and give one sonnet agent `<W>/references/inventory.md` as its brief (source chosen per its table;
  for a pitch build use `INVENTORY_SOURCE=demo` with the real product names from `[ig]`/`[site]`).

## Stage 4 — Ship

Follow `<S>/references/ship.md`: SEO carry-over, LocalBusiness JSON-LD, OG image, icons, legal pages,
re-check of only the new parts. Then write **`handoff/DEPLOY.md`** (Stage 5). Deploying anything or
changing DNS is outward-facing: only with the user's explicit yes in chat.

## Stage 5 — Hand-off pack (deploy guide + pitch)

Two background agents in parallel:

1. **Deploy guide** (haiku, low): fills `<S>/templates/DEPLOY.template.md` → `handoff/DEPLOY.md` with
   this project's real values (domain, env vars, inventory source, legal TODOs, the old-URL redirects).
   Written for the user (the developer) with an owner-facing section in the business's language.
2. **Pitch** (sonnet, medium): prompt in `briefs.md` → `handoff/PITCH.md` (email + Instagram DM + a
   follow-up), using the founder-offer and founder-marketing principles, not the full skills.
   **Draft only. Never send a message or DM**; the user sends it.

Then **print in chat**: (a) the "Deploy in 10 steps" section of `handoff/DEPLOY.md` verbatim, (b) the
email and the DM from `handoff/PITCH.md` verbatim, ready to copy, (c) web-atelier Phase 6 report plus:
dossiers produced, TODO facts, conflicts resolved, redirects, and the local preview URL. Point to
`docs/GUIDE.md` in the webs1te-skill repo (or `<S>/GUIDE.md`) for the full development guide.

## Fallbacks

- No browser for an agent → that skill's fallback; dossier marked `partial`, facts tagged `[partial]`.
- Instagram behind a login wall → partial dossier; tell the user they can sign in to Instagram
  themselves in the built-in browser or Chrome and rerun `/insta-to-md`. Never enter credentials.
- Maps link is a list/search → the agent picks the place whose name matches; if ambiguous it reports
  candidates and you ask once.
- Cookie walls: reject non-essential.
