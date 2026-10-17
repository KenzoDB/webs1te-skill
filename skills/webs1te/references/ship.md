# Ship checklist (one sonnet-medium agent for 1–5, then you for 6–7)

Give the agent this file's path, `BRIEF.md`, `DESIGN.md`, `src/content/site.ts` and
`research/seo-carryover.md` (if present). It owns only the files named below.

## 1. Metadata (`src/app/layout.tsx` metadata export, per-route `metadata`)
- `title` template `%s · <Name>`, description ≤155 chars from `site.meta`, `metadataBase` = domain (or
  `TODO` env `NEXT_PUBLIC_SITE_URL`), `alternates.canonical`, `openGraph`, `twitter` card large image.
- Languages: `alternates.languages` when there is more than one locale.

## 2. SEO carry-over (redesign only)
- Every old URL in `seo-carryover.md` either exists as a route or gets a permanent redirect in
  `next.config.ts` `redirects()`. No old URL may 404.
- Reuse old titles/descriptions where they ranked for the business name or service + city.

## 3. Crawl files
- `src/app/sitemap.ts` and `src/app/robots.ts` (Next metadata routes; check
  `node_modules/next/dist/docs/` for the current API if unsure).
- **Pitch switch:** when `process.env.SITE_NOINDEX === "1"`, `robots.ts` returns `disallow: "/"` and the
  root metadata sets `robots: { index: false, follow: false }`. Add `SITE_NOINDEX=1` to `.env.example`
  with a comment "set while pitching; remove at go-live". Pitch builds deploy with it on.

## 4. Structured data
- One `<script type="application/ld+json">` in the home page: the most specific schema.org
  `LocalBusiness` subtype (e.g. `BookStore`, `Bakery`, `Restaurant`), with `name`, `address`
  (PostalAddress), `geo`, `telephone`, `url`, `openingHoursSpecification`, `sameAs` (socials), `image`.
  Values only from `[maps]`/`[site]`/`[user]` facts in BRIEF.md. **No `aggregateRating` or `review`
  markup about the business itself** (Google treats self-served review stars as ineligible/spammy).

## 5. Brand files
- `src/app/opengraph-image.tsx` (1200×630, wordmark + hero photo + tagline, tokens from DESIGN.md).
- `src/app/icon.svg` or `icon.png` from the logo/wordmark; `apple-icon.png` 180px.
- Legal pages required by the brief's country (EU/Spain: Aviso legal, Política de privacidad, Cookies)
  as plain text routes with `TODO` where the company details are unknown. No cookie banner unless the
  site actually sets non-essential cookies or loads third-party trackers/embeds (a Maps embed counts:
  prefer a static map image + link).

## 6. Re-check (you, via the haiku QA agent)
Run only `~/.claude/skills/web-atelier/references/qa.md` §1, §2 (console + 390 width), §5, plus: view-source has the JSON-LD
and validates as JSON; `/sitemap.xml` and `/robots.txt` respond; every old URL returns 200 or 308.

## 7. Deploy (only after an explicit yes from the user in chat)
Offer: "Deploy to Vercel now?" If yes, follow the `replica-deploy` skill's preflight and host sections only
(skip app-store and Stripe parts). Domain/DNS changes: give the user the exact records and let them apply
them, or apply only with a second explicit yes.
