# webs1te — links in, premium website out

A Claude Code skill pack that turns a business's links (website, Google Maps, socials, sites you like)
into an agency-grade website: editorial design, GSAP + Lenis smooth scroll, Three.js/WebGL image
effects, real reviews, SEO carry-over and local-business structured data, built by token-efficient
subagents.

```
/webs1te https://their-site.com https://maps.app.goo.gl/xxxx  "anything else you know"
```

## What's inside

| Skill | Role |
| --- | --- |
| `webs1te` | The workflow. Research front (dossiers → brief) and ship back (SEO, JSON-LD, deploy). |
| `web-atelier` | The build engine: art direction, copy, assets, motion kit, parallel build, QA. Usable alone via `/web-atelier`. |
| `site-to-md` | Crawls a website into one structured Markdown dossier. |
| `gmaps-to-md` | Turns a Google Maps place into one structured Markdown profile (facts, hours, reviews). |

## How it works

1. **Research, started straight away.** Your links are sorted, and `site-to-md` and `gmaps-to-md` run in
   parallel as cheap background agents. Each uses its own Playwright browser session. The Next.js
   project is scaffolded at the same time.
2. **One round of questions**, asked while the research runs and covering only what your site and Maps
   don't show: your story, goals, things never to say, photos you own, languages, motion level.
3. **Brief.** A distiller agent merges everything into `BRIEF.md`. Every fact is tagged `[site]`,
   `[maps]` or `[user]`, conflicts are listed, nothing is invented, and unknown facts are marked `TODO`.
4. **Build (web-atelier).** It inventories what only this client has, picks an art direction with
   taste-skill and writes `DESIGN.md`. The copy goes in `site.ts`, then sections are built in parallel,
   one agent per file. Motion comes from a proven kit: Lenis↔ScrollTrigger, SplitText reveals, a WebGL
   hero slideshow and hover distortion. One signature effect is taken from the subject (page turn, ink
   reveal…).
5. **QA, one pass.** Build, lint, a taste inspector, Playwright screenshots at 390/768/1440, reduced
   motion, accessibility and performance. Only what fails gets fixed.
6. **Ship.**
   - Metadata, plus redirects so no old URL 404s, and the sitemap and robots files.
   - `LocalBusiness` JSON-LD.
   - OG image, icons and legal pages.
   - Deploying needs your explicit **yes**.

**Token strategy:** one source of truth per kind of information (`BRIEF.md` for facts, `DESIGN.md` for
decisions, `site.ts` for copy), referenced by path. The orchestrator never reads the raw dossiers.
Models are routed by job:
- Haiku: mechanical work (scraping, images, the QA checklist).
- Sonnet: the build and the copy.
- Opus: only new shaders or the final jury.

Subagents reply in 3 lines or fewer, scripts are used instead of reasoning, the kit is copied rather
than rewritten, and there is a single review pass.

## Install

Requirements: [Claude Code](https://claude.com/claude-code), Node 22+, Git, and Chrome/Edge or Chromium
for screenshots.

```bash
git clone https://github.com/KenzoDB/webs1te-skill.git
cd webs1te-skill
./install.sh
```

On Windows PowerShell:

```powershell
git clone https://github.com/KenzoDB/webs1te-skill.git
cd webs1te-skill
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

The installer copies the four skills to `~/.claude/skills/` (existing copies are backed up as
`*.bak-<date>`) and lists any dependencies that are missing:

| Dependency | Needed for | How |
| --- | --- | --- |
| `taste-skill` (design-taste-frontend) | **Required**: art direction, image search, lint/inspect | Put it in `~/.claude/skills/taste-skill` |
| `playwright-cli` | **Required**: parallel browsing and screenshots | `npm i -g @playwright/cli` then `playwright-cli install --skills` |
| `web-design-guidelines` | QA (recommended) | from `vercel-labs/agent-skills` |
| `impeccable` plugin | optional final jury | `/plugin marketplace add pbakaus/impeccable` |
| `ui-ux-pro-max` plugin | optional palette cross-check | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` |
| `founder-competitors`, `founder-brand` | optional strategy for new brands | your founder skill pack |
| `replica-deploy` | optional deploy step | your replica skill pack |

Manual install: copy each folder in `skills/` to `~/.claude/skills/`.

To update, run `git pull` and then the installer again.

## Use

Open Claude Code **in an empty folder** (or in an existing Next.js project to redesign it) and start a
new session:

```
/webs1te https://example.com https://maps.app.goo.gl/abc123
```

or just say *"make a website for this business"* and paste the links. Then:

1. Answer the one round of questions. The research runs while you type.
2. Wait. It works on its own and you get a report with the running site, a list of `TODO`s, the
   conflicts it resolved and the redirects.
3. Say *"deploy it"* when you're happy.

Other entry points:
- `/web-atelier`: build from a brief you type out yourself, with no links.
- `/site-to-md <url>`: a website dossier only.
- `/gmaps-to-md <maps link>`: a Maps profile only.

Tips:
- Put your own photos in `public/images/` before starting. They always beat stock or found images.
- Say "maximum quality" to add the Opus final-review pass.
- Everything it knows lives in `BRIEF.md`. Edit it and ask for a rebuild of any section.

## Output in your project

```
BRIEF.md            facts (source-tagged)
DESIGN.md           tokens, type, grid, motion grammar, section owners
research/           site/maps dossiers, seo-carryover.md
src/content/site.ts every visible string
src/components/     sections/, shell/, signature/, motion/ (kit)
.atelier/shots/     QA screenshots
```
