# <Name> — Design brief (decisions; every agent reads this, ≤150 lines)

Facts live in `BRIEF.md`. Copy lives in `src/content/site.ts`. This file decides how it looks and moves.

## Idea
- Inventory item it comes from:
- The idea in one line:
- Signature moment (from `references/motion.md`):
- Direction dealt by taste-skill (id + one-line reason):

## Tokens (exact values; mirrored in `src/app/globals.css` `@theme`)
| token | value | use |
| --- | --- | --- |
| --color-paper | # | page background |
| --color-ink | # | body text |
| --color-muted | # | secondary text |
| --color-line | # | hairlines (sparingly) |
| --color-accent | # | the single accent: links, focus, one CTA |
| --color-tone-2 | # | alternate section background |

Contrast checked (ink/paper, muted/paper, accent/paper): __ / __ / __ (AA ≥ 4.5).

## Type
- Display: <family> (next/font/google or local), weights:
- Text: <family>, weights:
- Scale (clamp): display `clamp(…)`, h1, h2, h3, lead, body 17–18px, small, caption.
- Tracking/leading rules:

## Space & grid
- Spacing scale (px): 4 8 12 16 24 32 48 64 96 128 192
- Grid: 12 cols desktop / 6 tablet / 4 mobile, gutter, max width, side margins (≥16px mobile).
- Section vertical rhythm:

## Imagery
- Treatment (crop ratios, grain, duotone?, radius 0?):
- Required images per section and gaps to source (queries for assets.mjs):

## Motion grammar
- Easings, durations, stagger, Lenis lerp (copy from motion.md, adjust if needed):
- Mechanics chosen (M#) and where:

## Sections (order = argument) and file owners
| # | id | claim → proof | layout (taste blueprint id) | mechanics | file(s) | owner |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | shell | — | nav, footer, preloader, cursor | M1 M10 M14 | `src/components/shell/*`, `globals.css`, `layout.tsx` | agent A |
| 1 | hero | | | | `src/components/sections/Hero.tsx` | agent B |

## Conventions
- Components: `src/components/sections/<Pascal>.tsx`, `src/components/shell/*`, `src/components/signature/*`,
  kit in `src/components/motion/*` (do not edit kit except via the shell owner).
- Class naming: Tailwind utilities + tokens only; no hard-coded hex in components.
- All strings from `@/content/site`; no literals in JSX.
- Client components only where motion needs them; animations in `useGSAP`-style effects with cleanup
  (`gsap.context` + `ctx.revert()`), `matchMedia` for reduced motion and breakpoints.

## Versions
next <x> · react <x> · tailwind 4 · gsap <x> (SplitText included) · lenis <x> · three <x> · motion <x>

## Done means
- Builds, no console errors, passes `references/qa.md`.
- Looks intentional at 390 / 768 / 1440; reduced-motion version complete and readable.
