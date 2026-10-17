# Motion kit (proven in production, copy — don't rewrite)

Installed by `scripts/scaffold.mjs` into `src/lib/gsap.ts` and `src/components/motion/`.
Requires: `gsap` (≥3.13, SplitText is free), `lenis`, `three`, `@types/three`, alias `@/*` → `src/*`.

| File | Use |
| --- | --- |
| `lib/gsap.ts` | `import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap"` — plugins registered once, client-safe. |
| `motion/SmoothScroll.tsx` | Wrap `<body>` children in `layout.tsx`: `<SmoothScroll>{children}</SmoothScroll>`. Lenis lerp 0.08 synced to ScrollTrigger; `#anchor` links scroll smoothly with 72px offset; `useLenis()` hook gives the instance (null under reduced motion). `window.__lenis` for stop/start (menus, modals). |
| `motion/gl/HeroGL.tsx` | `<HeroGL images={[{src, alt}]} interval={6000} onChange={i=>…} className="absolute inset-0" />` — full-bleed WebGL slideshow with displacement transition and slow Ken-Burns. Renders first image as plain `<img>` under reduced motion / no WebGL. Load via `dynamic(() => import(...), { ssr: false })` and put a static first image underneath for LCP. |
| `motion/gl/DistortImage.tsx` | `<DistortImage src alt sizes className />` — drop-in `<img>` with hover ripple distortion; all instances share one WebGL renderer (`distortRenderer.ts`). Falls back to CSS hover scale. Parent needs `position:relative; overflow:hidden` and an aspect ratio. |
| `motion/gl/shaders.ts` | `FULLSCREEN_VERT`, `HERO_FRAG`, `DISTORT_FRAG`. Tweak uniforms here for a different feel; new effects get a new export. |

Reveal helper pattern (write per section, ~15 lines):
```ts
useEffect(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const split = SplitText.create(ref.current!.querySelector("h2")!, { type: "lines", mask: "lines" });
    gsap.from(split.lines, { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.08,
      scrollTrigger: { trigger: ref.current, start: "top 85%", once: true } });
    return () => split.revert();
  });
  return () => mm.revert();
}, []);
```
