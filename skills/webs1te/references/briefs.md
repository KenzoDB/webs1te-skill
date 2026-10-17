# Subagent prompts (fill the <>; send as `prompt`, `run_in_background: true`)

Every prompt ends with: **"Reply in ≤3 lines: done | file | coverage gaps. No content in the reply."**
Parallel browser use: each agent uses its own named Playwright session (`playwright-cli -s=<name>`)
or its own new tab in the built-in browser, never the user's current tab.

## site-to-md agent (haiku, medium)
Use the `site-to-md` skill on <url>. Browser: `playwright-cli -s=site` (load the playwright-cli skill
only if you don't know the commands), else the skill's fallbacks. Page limit 30. Save to
`<root>/research/<domain-slug>-site.md`. Also list every crawled URL with its <title>, meta description
and H1 in a final "## URL inventory" table (needed for redirects and SEO). Reject non-essential cookies.
Reply in ≤3 lines: done | file | coverage gaps. No content in the reply.

## gmaps-to-md agent (haiku, medium)
Use the `gmaps-to-md` skill on <maps-link>. Browser: `playwright-cli -s=gmaps`, else the skill's
fallbacks. Collect all reviews the panel shows, sorted by "Most relevant", up to 40, verbatim with
reviewer name, stars and date; and the list of photo URLs (reference only). Save to
`<root>/research/<place-slug>-<city-slug>-gmaps.md`. If the place lists a website and no site dossier is
being made (<yes/no>), also run the `site-to-md` skill on it with session `-s=site2`.
Reply in ≤3 lines: done | file | coverage gaps. No content in the reply.

## insta-to-md agent (haiku, medium)
Use the `insta-to-md` skill on <instagram-url>. Browser: Claude in Chrome in a new tab if available
(read-only: never like, follow, comment or DM), else `playwright-cli -s=insta`, else the skill's
fallbacks. Never log in or enter credentials. 24 latest posts + all highlights. Save to
`<root>/research/<handle>-instagram.md`. If the bio links a website and no site dossier is being made
(<yes/no>), also run the `site-to-md` skill on it with session `-s=site3`.
Reply in ≤3 lines: done | file | coverage (posts read, partial or not).

## Reference-style agent (haiku, low)
For <url>: call the Context MCP `web-styleguide` tool (load it with ToolSearch "web-styleguide"); if it
is unavailable, open the page with `playwright-cli -s=ref` and read computed styles of body, h1, h2,
buttons. Write `<root>/research/ref-<slug>.md` ≤40 lines: palette (hex + role), type families and
sizes, spacing feel, layout patterns, motion observed, what makes it feel premium in 3 bullets. This is
inspiration only; nothing gets copied. Reply in ≤3 lines.

## Distiller (sonnet, low)
Write `<root>/BRIEF.md` using the template `~/.claude/skills/web-atelier/templates/BRIEF.template.md`.
Sources: every file in `<root>/research/` and these user answers:
<<<
<paste the user's answers verbatim>
>>>
Rules: only facts present in the sources; tag each `[site]`, `[maps]`, `[ig]`, `[user]` or `[partial]`;
keep numbers, hours, phone, address, prices and review text verbatim; pick the 6–10 strongest reviews
(specific, varied, recent) for §Proof; missing → `TODO`; contradictions → a `## Conflicts` section
(fact | site | maps | ig | user). Add `## Voice` (3 owner caption samples from [ig]), `## Products`
(name | price | source) and `## Stock signals` (quotes about sold out / restocks / "do you have…?"
questions, with a yes/no recommendation for live stock). Add `## Pitch context`: who the user is
(own business or client, signature, price if given) and the 3 sharpest weaknesses of the current online
presence (no site, slow/old site, hours missing, no booking…) each with its source. Max 200 lines. If `## URL inventory` exists in a site
dossier, also write `<root>/research/seo-carryover.md`: old URL | title | description | H1 | proposed
new route. Reply in ≤3 lines: done | files | number of TODOs and conflicts.

## Deploy-guide agent (haiku, low)
Fill `~/.claude/skills/webs1te/templates/DEPLOY.template.md` into `<root>/handoff/DEPLOY.md`. Real values
from `<root>/BRIEF.md`, `<root>/.env.example`, `<root>/research/seo-carryover.md` (if present),
`<root>/next.config.ts`, `<root>/package.json`. Replace every <placeholder>; unknown → `TODO (who decides)`.
Keep the template's steps and order; delete sections marked "only if" that don't apply. Part B in
<business language>. Reply in ≤3 lines.

## Pitch agent (sonnet, medium)
Write `<root>/handoff/PITCH.md` in <business language>. Read only `<root>/BRIEF.md` (§Inventory, §Proof,
§Voice, §Pitch context) and `<root>/DESIGN.md` §Idea. Apply these principles (from founder-offer and
founder-marketing; do not run those skills): lead with one specific thing about *their* business (a
review phrase, their street, a product), name one concrete problem of their current online presence
(from §Pitch context, factual, never insulting), show the result (what a customer can now do on the
site: see stock, book, find hours), make the next step tiny (reply "yes" to see it live / a 10-minute
call), remove risk (no commitment; it's already built). No hype words ("revolutionary", "stunning",
"take your business to the next level"), no fake urgency, no invented numbers.
Output, each ready to copy:
1. **Email** — subject ≤45 chars; body ≤110 words; signature from §Pitch context; P.S. with one line about
   the signature moment. Placeholders only `[PREVIEW_LINK]` and, if a price was given, the price.
2. **Instagram DM** — ≤55 words, no links in the first message unless the user wants (DMs with links get
   filtered), ends with a yes/no question.
3. **Follow-up** (day 4) — ≤40 words, adds one new detail, no guilt.
4. **Attach** — which 2 screenshots from `.atelier/shots/` to attach (hero + the most specific section).
Reply in ≤3 lines.
