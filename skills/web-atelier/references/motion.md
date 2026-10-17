# Motion menu — what makes it feel like a 60.000 € site

Expensive sites are not busier. They have **one signature moment** taken from the subject, a small set
of mechanics executed perfectly, consistent easing, and nothing that fights the content.

## Global motion grammar (put these exact values in DESIGN.md)

- Easings: `expo.out` (reveals), `power3.inOut` (transitions), `none` (scrub). CSS: `cubic-bezier(.16,1,.3,1)`.
- Durations: micro 0.25 s · reveal 1.1–1.4 s · page/hero transition 1.6–2.2 s. Stagger 0.06–0.09 s per line.
- Lenis `lerp: 0.08`. ScrollTrigger reveals start at `top 85%`, `once: true`.
- Max 1 pinned section per ~3 screens. Max 1 WebGL canvas visible at a time (+ shared hover renderer).
- Everything degrades: reduced motion → instant states; no WebGL → CSS fallback already in the kit.

## The kit (already built, copy don't rewrite) — see `kit/README.md`

`lib/gsap.ts` (gsap + ScrollTrigger + SplitText registered) · `SmoothScroll` (Lenis ↔ ScrollTrigger,
anchor scrolling, reduced-motion aware) · `gl/HeroGL` (WebGL slideshow, displacement transition, slow
Ken-Burns) · `gl/DistortImage` (hover ripple distortion, one shared renderer for all thumbnails).

## Standard mechanics — pick 6–9

| # | Mechanic | Recipe |
| --- | --- | --- |
| M1 | Preloader → hero hand-off | counter or wordmark mask, ≤1.6 s, skipped on repeat visit (sessionStorage) |
| M2 | Line-by-line headline reveal | SplitText `type:"lines", mask:"lines"`, yPercent 110→0, stagger 0.08 |
| M3 | Clip-path image reveal | `clip-path: inset(100% 0 0 0)` → `inset(0)`, inner img scale 1.25→1 |
| M4 | Parallax depth | image inside overflow-hidden frame, yPercent -12→12 scrubbed |
| M5 | Pinned horizontal gallery | pin section, translate track `-(scrollWidth - innerWidth)`, scrub 1; vertical stack on mobile |
| M6 | Pinned storytelling | pin + step through 3–4 states (text swaps, image crossfade) |
| M7 | WebGL hero slideshow | `HeroGL` |
| M8 | Hover distortion on thumbnails | `DistortImage` (desktop pointer: fine only) |
| M9 | Marquee | CSS keyframes, pauses on hover, speed tied to scroll velocity (optional) |
| M10 | Magnetic CTA + subtle cursor | follower dot with mix-blend, only on `pointer: fine`; never hide native cursor |
| M11 | Section colour shift | body background tweens between 2–3 token tones as sections enter |
| M12 | Big footer wordmark | oversized type revealed with M2, clipped at the bottom edge |
| M13 | Counter / numbers | snap-tween real numbers from BRIEF only |
| M14 | Menu overlay | full-screen, staggered links, focus-trapped, Esc closes |

## Signature moments — choose ONE from the subject (or invent one in this spirit)

| Subject | Signature |
| --- | --- |
| Books, editorial, library, publisher | Page turn on scroll (CSS 3D `rotateY` on a pinned spread, scrubbed) or **ink-on-paper text reveal** (SVG turbulence mask / per-char opacity + blur scrubbed) |
| Food, bakery, coffee | Steam/heat shimmer shader on the hero; ingredients assembling on scroll |
| Architecture, interiors, real estate | Blueprint lines drawing (SVG stroke-dashoffset) then photo fades in behind |
| Fashion, beauty | Fabric/cloth shader on hover; mask reveals shaped like the product |
| Hotel, travel | Time-of-day shift: the page light warms as you scroll (M11 + hero tint) |
| Music, events | Waveform/beat-synced reveals; ticket-stub tear for the CTA |
| Craft, workshop | Stamp/emboss press on headings; grain texture moving with scroll |
| Tech, SaaS (premium) | Product UI assembled from parts in a pinned section |
| Wellness, nature | Slow breathing scale on hero (4 s in / 6 s out); water-ripple hover |

The signature gets its own agent and its own file (`src/components/signature/*`).
