# Deploy guide — <Business name>

Project folder: `<root>` · Stack: Next.js <version>, Tailwind 4, GSAP, Lenis, Three.js
Domain: <domain or TODO> · Live stock: <source or "not included"> · Generated: <date>

---

# Part A — For you (developer)

## Deploy in 10 steps (Vercel, free Hobby plan for a preview / Pro for commercial use)

1. **Check it builds:** in the project folder run `npm run build`. It must end with no errors.
2. **Create a GitHub repo:** github.com → New repository → name `<slug>-web` → Private → Create.
3. **Push the code:**
   ```bash
   git init
   git add -A
   git commit -m "First version"
   git branch -M main
   git remote add origin https://github.com/<you>/<slug>-web.git
   git push -u origin main
   ```
4. **Import in Vercel:** vercel.com → Add New → Project → pick the repo → Framework "Next.js" is detected →
   don't change build settings.
5. **Environment variables:** in the import screen (or Project → Settings → Environment Variables) add
   `SITE_NOINDEX` = `1` (hides the pitch preview from Google; remove it at go-live) and:
   <table of every variable from .env.example that has a real value, with where to get it>
6. **Deploy:** click Deploy. Wait ~1–2 min. You get `https://<slug>-web.vercel.app` → this is the
   **preview link** for the pitch.
7. **Test the live preview:** open it on your phone and desktop; check the hero, menu, every CTA link
   (WhatsApp/email/phone), the map link, the legal pages, and `/sitemap.xml`.
8. **Add the domain** (after the owner says yes): Project → Settings → Domains → add `<domain>` and
   `www.<domain>` → Vercel shows the DNS records.
9. **DNS at the registrar** (<registrar or TODO>): add exactly the records Vercel shows, usually
   `A  @  76.76.21.21` and `CNAME  www  cname.vercel-dns.com`. Remove old A/AAAA records for `@` that
   point to the previous host. **Do not touch MX records** (email). Propagation: minutes to 24 h.
10. **Final checks:** delete `SITE_NOINDEX` in Vercel and Redeploy, HTTPS padlock on both domains, old URLs redirect (list below), submit
    `https://<domain>/sitemap.xml` in Google Search Console, and update the website link on Google Maps
    (Business Profile) and the Instagram bio.

## Redirects carried over (only if redesign)
<old URL → new route list, already in next.config.ts>

## Live stock (only if included)
- Source: <source>. Setup for the owner: Part B §Stock.
- Variables: <list>. Refresh: every <n> s. Instant updates: webhook URL
  `https://<domain>/api/inventory/revalidate?secret=<INVENTORY_WEBHOOK_SECRET>` → set it up in <source>
  as described in `web-atelier/references/inventory.md` §Instant updates.
- Test: change one item in the source → reload the site after <n> s (or instantly with the webhook).

## Things still TODO before going live
<every TODO from BRIEF.md and legal pages: who must provide it>

## Updating the site later
- Text: `src/content/site.ts` · Photos: `public/images/` (same file names, webp) · Colours/type:
  `DESIGN.md` tokens → `src/app/globals.css`.
- Every `git push` to `main` redeploys automatically. Preview a change first on a branch: Vercel gives
  each branch its own URL.

## Handing the site over to the owner (choose one)
- **You host it** (maintenance plan): keep the Vercel project on your account, bill monthly.
- **They own it**: they create a Vercel account → you Settings → "Transfer project" to their team
  (or they import the GitHub repo after you transfer it). Domain stays in their name.

## Costs to tell the owner
- Domain ~10–20 €/year (registrar). Hosting: Vercel Hobby is free but **non-commercial only**; a
  business site should use Pro (~20 $/month per member) or another host (Netlify, Cloudflare Pages).
- Stock source: Google Sheets free; Shopify/Square/Woo use their existing plan.

---

# Part B — For the owner (<business language>)

## What you have
<3 lines: the site, what customers can do on it, where it lives>

## How to change things yourself
<only what applies: edit the Google Sheet for stock, send photos to the developer, etc.>

## Stock (only if included)
<step-by-step for their source, e.g. Google Sheet: columns, how to mark sold out, "changes appear within a minute">

## Who to call
<user's name/contact from BRIEF §Pitch context>
