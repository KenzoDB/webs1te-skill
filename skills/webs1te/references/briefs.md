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
Rules: only facts present in the sources; tag each `[site]`, `[maps]`, `[user]` or `[partial]`; keep
numbers, hours, phone, address, prices and review text verbatim; pick the 6–10 strongest reviews
(specific, varied, recent) for §Proof; missing → `TODO`; contradictions → a `## Conflicts` section
(fact | site says | maps says | user says). Max 180 lines. If `## URL inventory` exists in a site
dossier, also write `<root>/research/seo-carryover.md`: old URL | title | description | H1 | proposed
new route. Reply in ≤3 lines: done | files | number of TODOs and conflicts.
