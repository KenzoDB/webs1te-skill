# webs1te — links in, premium website + pitch out

A Claude Code skill pack that turns a business's links (website, Google Maps, Instagram, sites you
like) into an agency-grade website and gets it ready to sell. You get:
- editorial design with GSAP and Lenis smooth scroll, plus Three.js/WebGL image effects;
- real reviews, SEO carry-over and local-business structured data;
- **live stock** read from the business's own data, when they sell products;
- a **deploy guide** for this site;
- a short **email and Instagram DM** to pitch it to the owner.

All of it is built by token-efficient subagents.

```
/webs1te https://their-site.com https://maps.app.goo.gl/xxxx https://instagram.com/handle
```

> **New here? Read [docs/GUIDE.md](docs/GUIDE.md).** It's a step-by-step developer guide covering setup,
> making a site, editing, preview links, pitching, connecting stock, going live on the client's domain,
> hand-over and troubleshooting.

## What's inside

| Skill | Role |
| --- | --- |
| `webs1te` | The workflow. It runs research (dossiers → brief), calls web-atelier to build, then ships (SEO, JSON-LD, deploy guide, pitch). |
| `web-atelier` | The build engine: art direction, copy, assets, motion kit, live-stock kit, parallel build, QA. Usable alone via `/web-atelier`. |
| `site-to-md` | Crawls a website into one structured Markdown dossier. |
| `gmaps-to-md` | Turns a Google Maps place into a Markdown profile (facts, hours, reviews). |
| `insta-to-md` | Turns a public Instagram profile into a Markdown dossier: bio, highlights, latest posts, products and prices, stock signals, voice, visual identity. |

## How it works

1. **Research, started straight away.** `site-to-md`, `gmaps-to-md` and `insta-to-md` run in parallel
   as cheap background agents, each in its own browser session (read-only, no logins). The Next.js
   project is scaffolded at the same time.
2. **One round of questions**, asked while the research runs and covering only what the links don't
   show. That includes "show live stock?" and "your business or a client you'll pitch?".
3. **Brief.** A distiller merges everything into `BRIEF.md`. Every fact is tagged `[site]`, `[maps]`,
   `[ig]` or `[user]`, conflicts are listed, and unknowns are marked `TODO`. It also records stock
   signals and the pitch context.
4. **Build (web-atelier).**
   - Art direction from what only this client has, using taste-skill, written to `DESIGN.md`.
   - Copy in the owner's own voice, written to `site.ts`.
   - Sections built in parallel, using the motion kit (Lenis↔ScrollTrigger, SplitText, WebGL hero,
     hover distortion) and one signature effect taken from the subject.
5. **Live stock (optional).** `src/lib/inventory` reads Google Sheets, CSV, JSON, Supabase, Shopify,
   WooCommerce or Square. It refreshes every 60 s and instantly through a webhook. A stock badge shows
   in stock / last units / sold out / on order. The page still renders if the source fails.
6. **QA, one pass.** Build, lint, a taste inspector, Playwright screenshots at 390/768/1440, reduced
   motion, accessibility and performance.
7. **Ship.**
   - Metadata, redirects (no old URL 404s), sitemap and robots.
   - `LocalBusiness` JSON-LD, OG image and legal pages.
   - Pitch previews stay hidden from Google (`SITE_NOINDEX=1`).
8. **Hand-off pack.**
   - `handoff/DEPLOY.md`: this site's 10-step deploy, its variables and redirects, and an owner section
     in their language.
   - `handoff/PITCH.md`: an email, an Instagram DM and a follow-up.

   Both are printed in chat, ready to copy. **Nothing is ever sent or deployed without you.**

**Token strategy:** one source of truth per kind of information (`BRIEF.md` for facts, `DESIGN.md`
for decisions, `site.ts` for copy), referenced by path. The orchestrator never reads the raw dossiers.
Models are routed by job:
- Haiku: scraping, images, QA and the deploy guide.
- Sonnet: the build, the copy and the pitch.
- Opus: only new shaders or the final jury.

Subagents reply in 3 lines or fewer, scripts are used instead of reasoning, kits are copied rather
than rewritten, and there is a single review pass.

## Install

You need [Claude Code](https://claude.com/claude-code), Node 22+, Git, and Chrome or Edge. Full
setup is in [docs/GUIDE.md §0](docs/GUIDE.md#0-one-time-setup-30-min-once-per-computer).

```bash
git clone https://github.com/KenzoDB/webs1te-skill.git
cd webs1te-skill
./install.sh
```

On Windows PowerShell, the last line is
`powershell -ExecutionPolicy Bypass -File .\install.ps1`.

Next, install Playwright:

```bash
npm i -g @playwright/cli && playwright-cli install --skills
```

The installer copies the five skills to `~/.claude/skills/` (existing copies are backed up as
`*.bak-<date>`) and lists any dependencies that are missing:

| Dependency | Needed for | How |
| --- | --- | --- |
| `taste-skill` (design-taste-frontend) | **Required**: art direction, image search, lint/inspect | Put it in `~/.claude/skills/taste-skill` |
| `playwright-cli` | **Required**: parallel browsing and screenshots | see above |
| `web-design-guidelines` | QA (recommended) | from `vercel-labs/agent-skills` |
| `impeccable` plugin | optional final jury | `/plugin marketplace add pbakaus/impeccable` |
| `ui-ux-pro-max` plugin | optional palette cross-check | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` |
| `founder-competitors`, `founder-brand` | optional strategy for new brands | your founder skill pack |

To update, run `git pull` and then the installer again. Restart Claude Code after installing.

## Use (short version — details in the guide)

1. Create an empty folder per client. Put any photos you have in `public/images/`.
2. Open Claude Code in it and run `/webs1te <links> <anything you know>`.
3. Answer the one round of questions, then leave it to work.
4. Use what it prints: the local preview (`npm run dev` → http://localhost:3000), the **Deploy in 10
   steps**, the **email and DM**, and the `TODO` facts.
5. Deploy a preview to Vercel ([guide §4](docs/GUIDE.md#4-show-it-to-the-owner-preview-link)) and send
   the pitch yourself.
6. When they say yes: connect stock ([§6](docs/GUIDE.md#6-live-stock-in-stock--sold-out-on-the-site)) and
   go live on their domain ([§7](docs/GUIDE.md#7-go-live-on-their-domain)).

Other entry points:
- `/web-atelier`: build from a typed brief.
- `/site-to-md <url>`: a website dossier.
- `/gmaps-to-md <maps link>`: a Maps profile.
- `/insta-to-md <instagram link>`: an Instagram dossier.

## Output in a project

```
BRIEF.md · DESIGN.md                  facts (source-tagged) · design decisions
research/                             site / maps / instagram dossiers, seo-carryover.md
src/content/site.ts                   every visible string
src/components/                       sections/ shell/ signature/ motion/ inventory/
src/lib/inventory/                    live stock adapters (if included)
handoff/DEPLOY.md · handoff/PITCH.md  deploy guide · email + DM + follow-up
.atelier/shots/                       QA screenshots
```
