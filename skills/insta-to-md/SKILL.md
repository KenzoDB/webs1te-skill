---
name: insta-to-md
description: >-
  Opens a public Instagram profile link the user gives and writes everything it shows about the
  organisation into one structured Markdown file: name, handle, category, bio, link-in-bio, contact
  buttons, follower/post counts, highlights, the latest posts (captions, dates, types, likes/comments
  when visible), products and prices mentioned, recurring themes and hashtags, posting rhythm, tone of
  voice, visual style (palette, photography, typography on graphics) and what customers say in comments.
  Use when the user pastes an instagram.com link and says "analyse this Instagram", "get the info from
  this Instagram", "insta to markdown", "/insta-to-md", or when webs1te gets an Instagram link.
---

# Instagram to Markdown

Turn one public Instagram profile into a complete `.md` dossier about the **organisation** behind it.
The point is **coverage and fidelity**: everything the profile shows, nothing invented. Facts are kept
verbatim (prices, hours, addresses, phone numbers, dates).

## Input

- An Instagram profile link: `instagram.com/<handle>` (also `instagr.am/...`, or a bare `@handle`).
  A post or reel link → use its author's profile. Ask once if missing.
- Optional: number of posts (default **24**, max 36), output folder, language for headings.

## Step 1: Use a real browser, without logging in

Instagram is a JavaScript app; plain fetch returns almost nothing. Use, in order:

1. **Claude in Chrome** when available. The user's own session may already be signed in, which shows
   more. Use a new tab; never post, follow, like, comment, DM or change anything.
2. The **built-in browser** (own tab), or **Playwright** (`playwright-cli -s=insta`).
3. No browser → WebFetch on `https://www.instagram.com/<handle>/` plus a web search for
   `"<handle>" instagram` and the name; mark the dossier `partial`.

Never type credentials or create an account. If a login wall blocks the page, collect what is visible
before the wall (bio, counts, first grid row, post previews from the URL `/<handle>/` and
`/p/<code>/` pages), say coverage is partial, and tell the user they can sign in themselves in the
browser and rerun. Reject non-essential cookies. Move at human pace: open at most the requested number
of posts, no scrolling through the whole history, no bulk download.

## Step 2: Collect

**Profile header:** display name, handle, verified, category label, bio (verbatim, with emoji),
link-in-bio URL(s) (open a Linktree-style page once and list its links), contact buttons (email, call,
directions: copy the address/phone shown), followers, following, post count, account type cues
(shop tab, reels tab, guides).

**Highlights:** each title; open each one and summarise what its stories show (menu, prices, hours,
FAQ, team, reviews, events). Copy any visible text with prices, hours or addresses verbatim.

**Latest posts (default 24):** for each: date, type (photo/carousel/reel), first ~200 chars of the caption
verbatim, hashtags, location tag, likes/comments if visible, what the image shows (one line), products
and prices named, and 1–3 notable customer comments verbatim (name + text).

**Pinned posts:** flag them; they are what the owner wants seen first.

## Step 3: Analyse (from what you collected, no guessing)

- **Offer:** products/services and prices seen, best-sellers (most repeated / most liked), seasonal items.
- **Stock signals:** "sold out", "back in stock", "last units", "new arrivals", pre-orders. These show
  whether a live-availability feature would help the website.
- **Audience & social proof:** who comments, what they praise, recurring questions (FAQ material).
- **Voice:** formality, language(s), emoji use, recurring phrases, sign-offs. Give 3 caption excerpts as samples.
- **Visual identity:** dominant colours (approx. hex), photo style (light, angles, people/no people),
  typefaces on graphics, logo usage, grid pattern.
- **Rhythm:** posts per week over the sample, best-performing format.
- **Facts for the website:** address, hours, phone, email, links, events with dates.

## Step 4: Write the Markdown

Filename `<handle>-instagram.md` in the user's working/output folder (in webs1te: `research/`), unless told
otherwise. Follow `references/template.md`. Include the profile URL, the date collected, the access
mode (signed-in / public / partial) and the number of posts read.

Images: list post URLs for reference only. **Do not download or reuse the photos.** They belong to the
account (or to the people in them); a website may use them only with the owner's permission.

## Step 5: Report

Three lines: file path, coverage (posts read, highlights read, partial or not), and the 3 most useful
facts for a website.

## Safety & terms

Read-only, public information about an organisation. Do not profile private individuals: commenters
appear only as name + quote when the quote is about the business. No interaction with the account, no
login, no CAPTCHA solving, no bulk scraping.
