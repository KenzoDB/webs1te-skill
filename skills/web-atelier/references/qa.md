# QA checklist (one pass, failures only)

Run from the project root. Record only failures as `file:line — problem`.

## 1. Build & static checks
- `npm run build` — must pass (report the first error only).
- `npm run lint` — errors only, not warnings.
- `node ~/.claude/skills/taste-skill/scripts/lint.mjs src` — list violations.

## 2. Runtime (dev or `npm start`)
- `node ~/.claude/skills/taste-skill/scripts/inspect.mjs <url>` — report failed rules.
- Screenshots with playwright-cli (load the `playwright-cli` skill only if the commands are unknown):
  widths 1440, 768, 390; full page; save to `.atelier/shots/<width>.png`. Also one at 1440 with
  `prefers-reduced-motion: reduce` → `.atelier/shots/1440-reduced.png`.
- Console: zero errors, zero hydration warnings.
- No horizontal scroll at 390 (`document.documentElement.scrollWidth <= innerWidth`).
- Every `<img>` has alt; every image has dimensions or aspect-ratio (no CLS).
- Tab through the page: focus visible on every link/button, menu traps focus, Esc closes it.
- Reduced motion: all text visible, no pinned dead zones, no WebGL canvas created.

## 3. Guidelines
- Apply the `web-design-guidelines` skill to `src/` and keep only items that are real bugs
  (a11y, forms, focus, contrast, semantics), not style preferences.

## 4. Performance smoke
- Hero image ≤350 KB webp/avif with `priority`; fonts via `next/font` with `display: swap`.
- three.js only in client components loaded with `dynamic(..., { ssr: false })`.
- `npx lighthouse <url> --only-categories=performance,accessibility --quiet --chrome-flags="--headless"`
  if available: report scores < 90 only.

## 5. Content integrity
- Grep `src/` for `TODO`, `lorem`, `Lorem`, `example.com`, `+34 000` — list hits.
- Every number, date, review and name on the page exists in BRIEF.md.
