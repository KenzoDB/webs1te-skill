Build section <#> "<id>" of the site in <project-root>.

Read first (only these): `DESIGN.md` (tokens, grammar, row <#> of §Sections), `src/content/site.ts`
(key `<key>`), `public/images/MANIFEST.md`. Kit usage: `~/.claude/skills/web-atelier/kit/README.md`.
Taste blueprint: `node ~/.claude/skills/taste-skill/scripts/draw.mjs --show` (your section only).

Own ONLY: <files>. Do not edit any other file; if you need a token or global style, list it under open issues.

Implement: <layout in one line> with mechanics <M#…> exactly as DESIGN.md §Motion grammar specifies.
Responsive at 390/768/1440. Reduced motion: final state, no pinning. No hard-coded hex or copy.

Done when: `npx tsc --noEmit` passes for your files and the section renders without console errors.
Reply in ≤3 lines: done | files | open issues. No code.
