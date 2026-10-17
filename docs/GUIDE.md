# webs1te — Developer guide: from links to a live client website

This guide is for **you**, the person running the skill. It covers the setup on your computer, how
to make a site, how to change it, how to show it to the owner, how to put it live on their domain, how
to connect live stock and how to hand it over. Commands are given for Windows (PowerShell) with
macOS/Linux notes.

---

## 0. One-time setup (≈30 min, once per computer)

| # | Install | How | Check it works |
| --- | --- | --- | --- |
| 1 | **Node.js 22+** (LTS) | nodejs.org → LTS installer → Next, Next… | `node -v` shows v22 or higher |
| 2 | **Git** | git-scm.com → installer, defaults are fine | `git --version` |
| 3 | **VS Code** (to look at files) | code.visualstudio.com | opens |
| 4 | **Claude Code** | claude.com/claude-code (desktop app or `npm i -g @anthropic-ai/claude-code`) | `claude --version` |
| 5 | **GitHub account** | github.com → Sign up | you can create a repo |
| 6 | **Vercel account** | vercel.com → Sign up **with GitHub** | dashboard opens |
| 7 | **Chrome or Edge** | already on most PCs | — |
| 8 | **Python 3** (optional) | python.org | `python --version` |

Then install the skill pack and its dependencies:

```bash
git clone https://github.com/KenzoDB/webs1te-skill.git
```
```bash
cd webs1te-skill
```
Windows: `powershell -ExecutionPolicy Bypass -File .\install.ps1` · macOS/Linux: `./install.sh`

```bash
npm i -g @playwright/cli
```
```bash
playwright-cli install --skills
```

Read the installer's "Dependencies" list and install anything marked **required** (taste-skill,
playwright-cli). Then restart Claude Code. Type `/` in a new session: you should see `webs1te`,
`web-atelier`, `site-to-md`, `gmaps-to-md`, `insta-to-md`.

Optional, inside Claude Code (better final review and palettes):
```
/plugin marketplace add pbakaus/impeccable
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
```

**Instagram tip:** Instagram hides most of a profile from visitors who aren't logged in. Sign in to
Instagram yourself in Chrome (with Claude in Chrome connected) or in Claude's built-in browser before
a run. The skill only reads; it never logs in for you, likes, follows or sends DMs.

---

## 1. Make a website (≈1–3 h, mostly unattended)

1. **One folder per client**, e.g. `Desktop\clients\bakery-luna`. Empty is fine.
2. Put any photos you already have in `bakery-luna\public\images\` (create the folders). Your own or
   the owner's photos always beat found ones.
3. Open Claude Code **in that folder** (desktop app: choose the folder; terminal: `cd` there, then `claude`).
4. Type:
   ```
   /webs1te https://their-site.com https://maps.app.goo.gl/XXXX https://instagram.com/theirhandle
   ```
   Any of the three links is enough; more links give a better site. Add anything you know after the
   links ("they've been there since my childhood, the owner is Marta, they want more online orders").
5. **Answer the questions once.** You'll get one message and one multiple-choice card: scope, motion,
   images, languages, live stock, and whether this is your business or a client you'll pitch to (give
   your name, studio and contact for the pitch signature).
6. **Let it work.** It researches, writes the brief, designs, builds, tests and fixes on its own. You
   can leave. Don't edit files in the folder while it runs.
7. At the end it prints:
   - the local preview link,
   - **"Deploy in 10 steps"** for this site,
   - the **email and Instagram DM** to send the owner,
   - the list of facts still `TODO` (things nobody knew, e.g. the exact hours).

What's in the folder afterwards:

| File / folder | What it is | Edit it? |
| --- | --- | --- |
| `BRIEF.md` | Every fact about the business, with its source | Yes, to fix facts |
| `DESIGN.md` | Colours, fonts, spacing, motion, which file is which section | Only with care |
| `research/` | Raw dossiers from the website, Maps, Instagram | No (reference) |
| `src/content/site.ts` | **All the text on the site** | Yes |
| `public/images/` | Photos (+ `CREDITS.md` for found images) | Yes (keep names) |
| `src/components/sections/` | One file per section | Ask Claude |
| `src/lib/inventory/` | Live stock connection (if included) | No |
| `.env.example` / `.env.local` | Settings and secret keys | `.env.local` yes |
| `handoff/DEPLOY.md` | This site's deploy guide (yours + owner's part) | Yes |
| `handoff/PITCH.md` | Email, DM and follow-up | Yes |
| `.atelier/shots/` | Screenshots at phone/tablet/desktop width | — |

---

## 2. See it on your computer

```bash
npm run dev
```
Open http://localhost:3000. Stop with `Ctrl + C`. If port 3000 is busy it uses 3001; read the line it prints.

Test it like a customer: on your phone-sized window (browser DevTools → device toolbar), every button,
the menu, the WhatsApp/phone/email links, the map link.

---

## 3. Change things

**Easiest: ask Claude in the same folder.** Examples:
- "Change the hero headline to something about the morning bread, keep the tone."
- "Replace the photo in the about section with public/images/marta.webp."
- "The hours are Mon–Sat 8:00–14:00; update BRIEF.md and the site."
- "Make the services section calmer: less motion on mobile."
- "Add an English version."

Say what you want changed, not how to change it. It will touch only the files involved.

**By hand:**
- Text → `src/content/site.ts` (keep the quotes and commas; save; the browser updates).
- Photos → drop a `.webp` with the **same file name** in `public/images/` (or ask Claude to convert a JPG).
- Colours/fonts → ask Claude ("make the accent a deeper green"): they're tokens shared by every section.

**Check before showing anyone:** `npm run build` must finish without errors.

---

## 4. Show it to the owner (preview link)

While you're pitching, the site lives on a free `*.vercel.app` address and is **hidden from Google**
(the skill sets `SITE_NOINDEX=1`, so no copy of their business is indexed before they agree).

1. **Put the code on GitHub** (in the project folder):
   ```bash
   git init
   ```
   ```bash
   git add -A
   ```
   ```bash
   git commit -m "First version"
   ```
   Create an empty **private** repo on github.com (New → name `bakery-luna-web` → Private → no README),
   then copy the two lines GitHub shows under "push an existing repository", e.g.:
   ```bash
   git remote add origin https://github.com/YOU/bakery-luna-web.git
   ```
   ```bash
   git push -u origin main
   ```
   (If it says `master`, run `git branch -M main` first.)
2. **Vercel:** vercel.com → **Add New… → Project** → Import `bakery-luna-web` → leave settings as
   detected → **Environment Variables**: add `SITE_NOINDEX` = `1`, plus the live stock variables if any
   (see §6) → **Deploy**.
3. After 1–2 minutes you get `https://bakery-luna-web.vercel.app`. Open it on your phone. That's your
   `[PREVIEW_LINK]` for the pitch.

Alternative without GitHub: `npx vercel` in the folder (log in, accept defaults), then `npx vercel --prod`.

**Every later change:** `git add -A`, `git commit -m "what changed"`, `git push`. Vercel redeploys by itself.

---

## 5. Pitch

Open `handoff/PITCH.md`. Replace `[PREVIEW_LINK]`, read it out loud once, adjust anything that doesn't
sound like you, and send it **yourself** (email or Instagram DM; the skill never sends messages).
Attach the two screenshots it recommends. If there's no answer, send the follow-up on day 4. Then stop.

When they say yes, agree in writing (an email is fine) on: price, what's included (changes, hosting,
maintenance), who owns the domain and the Vercel project, and that they give you **their own photos**
and permission to use them. Then replace any found/placeholder photos and fix the `TODO` facts with them.

---

## 6. Live stock ("in stock / sold out" on the site)

The site reads the shop's stock from where they already keep it and refreshes every minute.

| They use | What you ask them for | Variables in Vercel |
| --- | --- | --- |
| Nothing / Excel / paper | Nothing: you create a Google Sheet for them | `INVENTORY_SOURCE=sheets`, `INVENTORY_CSV_URL` |
| Shopify | A Storefront API token (Settings → Apps → Develop apps) | `INVENTORY_SOURCE=shopify`, `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN` |
| WooCommerce | A **Read** REST key (WooCommerce → Settings → Advanced → REST API) | `INVENTORY_SOURCE=woocommerce`, `WC_STORE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` |
| Square | A production access token with ITEMS_READ and INVENTORY_READ (developer.squareup.com) | `INVENTORY_SOURCE=square`, `SQUARE_ACCESS_TOKEN` |
| A POS/ERP with an API or a daily export | The JSON endpoint, or the export as a CSV URL | `json` or `csv` + the URL |

**Google Sheet setup (most small shops):**
1. Create a sheet with this first row: `id | name | category | price | quantity | status`.
2. One product per row. Use `quantity` (a number) **or** `status` (`disponible`, `últimas`, `agotado`,
   `bajo pedido`; or in English `in_stock`, `low`, `out`, `backorder`).
3. **File → Share → Publish to web** → choose that sheet → **CSV** → Publish → copy the link.
4. In Vercel → Project → Settings → Environment Variables: `INVENTORY_SOURCE` = `sheets`,
   `INVENTORY_CSV_URL` = the link → **Redeploy** (Deployments → ⋯ → Redeploy).
5. Share the sheet (edit access) with the owner. They change a cell from their phone, and the site
   updates within a minute.
6. Only public information in that sheet (it's published): no cost prices, suppliers or customer data.

**Instant updates (optional):** set `INVENTORY_WEBHOOK_SECRET` to a long random string and register
`https://THEIR-DOMAIN/api/inventory/revalidate?secret=THAT-STRING` as a webhook in Shopify, WooCommerce,
Square or Supabase (details in `web-atelier/references/inventory.md`).

**Test:** mark one product as sold out in the source, wait a minute, reload the site.

Locally, put the same variables in `.env.local` (never commit that file; it's in `.gitignore`).

---

## 7. Go live on their domain

1. **The domain.** If they have one, you need access to their registrar (DonDominio, IONOS, GoDaddy,
   Namecheap, Cloudflare, Arsys…) or they do these steps with you on a call. If they don't, they buy it
   **in their name** (~10–20 €/year).
2. **Vercel:** Project → Settings → **Domains** → add `theirdomain.com` and `www.theirdomain.com`.
   Vercel shows the exact DNS records to create.
3. **At the registrar → DNS settings:** create exactly what Vercel shows. Usually:
   - `A` record, host `@`, value `76.76.21.21`
   - `CNAME` record, host `www`, value `cname.vercel-dns.com`

   Delete old `A`/`AAAA`/`CNAME` records for `@`/`www` that point to the old host.
   **Never delete or change `MX`, `TXT (SPF/DKIM)` records**: those are their email.
4. Wait (minutes to 24 h). Vercel shows "Valid Configuration" and creates HTTPS by itself.
5. **Remove `SITE_NOINDEX`** in Vercel → Environment Variables → Redeploy. Now Google may index it.
6. **Tell Google:** search.google.com/search-console → add the domain → verify (DNS TXT) → Sitemaps →
   `https://theirdomain.com/sitemap.xml`.
7. **Update links everywhere:** Google Business Profile (website field), Instagram bio, Facebook,
   WhatsApp Business profile.
8. If they had an old site, open 3–4 old URLs: they must land on the new pages (redirects are in
   `next.config.ts` and listed in `handoff/DEPLOY.md`).
9. If the old site was on another host, cancel that hosting **only after** everything works for a week
   (and not the email, if it's bundled).

---

## 8. Hand-over and maintenance

- **Who owns what:** domain → always the owner. Code and Vercel project → either you keep them (you
  host it and charge for maintenance) or you transfer them (Vercel → Project → Settings → Transfer;
  GitHub → repo Settings → Transfer ownership).
- **Hosting cost:** Vercel's free Hobby plan is for **non-commercial** use. For a business site use
  Vercel Pro, or deploy the same repo on Netlify or Cloudflare Pages (both have plans that allow
  commercial use; the setup is the same: import repo → add env vars → deploy).
- Give the owner `handoff/DEPLOY.md` **Part B** (written in their language): what they have, how to
  change stock, who to call.
- Monthly: `npm outdated` → ask Claude "update dependencies safely and check the build"; renewals
  (domain) on their calendar.

---

## 9. Troubleshooting

| Problem | Fix |
| --- | --- |
| `/webs1te` doesn't appear | Restart Claude Code; check `~/.claude/skills/webs1te/SKILL.md` exists; rerun the installer. |
| Instagram dossier says "partial" | Log in to Instagram yourself in the browser Claude uses, then run `/insta-to-md <link>` and ask Claude to update BRIEF.md from it. |
| Google Maps data missing | Use the full place link (open the place → Share → Copy link), not a search link. |
| `npm run dev` error "port in use" | Another server is running: close it, or use the port it suggests. |
| `npm run build` fails | Copy the first error line to Claude: "fix this build error". |
| Vercel build fails but local works | An environment variable is missing in Vercel; compare with `.env.local`. |
| Stock shows nothing | Wrong `INVENTORY_SOURCE` or URL; open the CSV link in a browser: you should see text, not a login page. Check Vercel → Logs for "inventory:" errors. |
| Stock doesn't update | Wait the refresh time (60 s), or set up the webhook; after changing env vars always **Redeploy**. |
| Domain "Invalid configuration" | DNS records don't match Vercel's exactly, or an old `A` record is still there. |
| Site looks different on iPhone | Ask Claude: "check the site at 390px width and fix what's off" (it takes screenshots itself). |
| Animations feel too much | "Reduce motion intensity by half; keep only the hero and the signature effect." |

---

## 10. Rules that keep you out of trouble

- Facts on the site come only from the business's own website, Maps, Instagram or the owner. Unknown → `TODO`, never invented.
- Reviews are real and quoted as written; no review stars in Google markup about the business itself.
- Photos from their Instagram/Maps are reference only until the owner says you may use them.
- A pitch site stays `noindex` and private-ish until the owner agrees; don't use their logo or name to
  advertise your own services without permission.
- Legal pages (privacy, legal notice, cookies) must have the owner's real company details before going live.
