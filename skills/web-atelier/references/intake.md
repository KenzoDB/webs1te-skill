# Intake — one round, then silence

Goal: collect everything the user knows in **one** exchange. After it, you decide; you do not ask again
unless a fact that blocks the work is missing (for example: no business name at all).

## Step 1 — Look before asking (no tokens wasted on questions the disk answers)

- `ls` the project root. Existing `BRIEF.md` / `DESIGN.md` → read them, ask only about gaps.
- Existing `package.json` → note the stack; existing `public/images` → count and list names only.
- User pasted a URL of their current site → Context MCP `web-scrape` (compact) for facts, `get-brand`
  for logo/colours. A Google Maps / reviews link → extract name, address, rating, real reviews.

## Step 2 — One message: the dump invitation

Send this (translated to the user's language), as plain text, in the same turn as Step 3:

> Tell me everything you have, in any order and format — paste, list, links, voice-note transcript.
> The more real detail, the less generic the site. Useful:
> 1. **Who**: name, what it is, one sentence on why it exists, founders/team (names, roles).
> 2. **Where & when**: address, neighbourhood, hours, seasonality, what the place looks/feels like.
> 3. **What it offers**: products/services, prices if public, the one thing only you do.
> 4. **For whom**: ideal visitor/customer, what they want, what makes them hesitate.
> 5. **Goal of the site**: the one action (book, buy, call, sign up, visit) and secondary actions.
> 6. **Proof**: real reviews (with names), ratings, press, numbers, awards, clients.
> 7. **Look & feel**: brand colours/fonts/logo if any; 1–3 sites you love (and why); words it must feel
>    like and must never feel like.
> 8. **Assets**: photos/videos you own (drop them in `public/images/` or give a folder), logo files.
> 9. **Content rules**: things that must/never be said, legal notes, languages needed.
> 10. **Practical**: domain, contact details to show, forms needed and where they send, deadline.

## Step 3 — One `AskUserQuestion` call (max 4 questions, skip any the dump already answered)

1. **Scope** — header "Scope": One-page landing (Recommended) / Landing + 2–4 inner pages / Full multi-page site.
2. **Motion intensity** — header "Motion": Refined, editorial (Recommended) / Bold, immersive WebGL /
   Calm, almost static.
3. **Imagery** — header "Images": I'll provide photos / Find open-licence photos of the subject's world /
   Mix: mine + found.
4. **Languages** — header "Languages": one option per likely language set inferred from the user
   (e.g. "Spanish only", "Spanish + Catalan", "Spanish + English"), multiSelect false.

## Step 4 — Write BRIEF.md

Fill `<A>/templates/BRIEF.template.md`. Keep the user's real words in quotes where they carry voice
(reviews, how they describe themselves). Unknowns → `TODO` (facts) or §Assumptions (choices you made).
Then tell the user in one line: "Brief written; building now. I'll come back with the finished site."
From here on, work autonomously until Phase 6.
