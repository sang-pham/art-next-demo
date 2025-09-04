# art-next-demo

Minimal Next.js 15 base project scaffolded to follow the conventions in [AI_RULES.md](AI_RULES.md).

- App Router only (no pages directory)
- TypeScript strict
- Yarn Classic (via Corepack)
- CSS Modules only
- ESLint next/core-web-vitals + Prettier
- Server Components by default

Project structure

- [app](app)
  - [app/layout.tsx](app/layout.tsx)
  - [app/page.tsx](app/page.tsx)
  - [app/globals.css](app/globals.css)
  - [app/about/page.tsx](app/about/page.tsx)
  - [app/api/health/route.ts](app/api/health/route.ts)
- [components/Nav/Nav.tsx](components/Nav/Nav.tsx)
- [components/Nav/Nav.module.css](components/Nav/Nav.module.css)
- [next.config.ts](next.config.ts)
- [tsconfig.json](tsconfig.json)
- [.eslintrc.json](.eslintrc.json)
- [.prettier.config.cjs](.prettier.config.cjs)
- [.prettierignore](.prettierignore)
- [.gitignore](.gitignore)
- [next-env.d.ts](next-env.d.ts)

Requirements

- Node.js >= 18.18.0
- Yarn Classic (managed via Corepack)

Install

If yarn isn’t available on your system, activate Yarn Classic with Corepack:

- corepack enable
- corepack prepare yarn@1.22.22 --activate

Then install dependencies:

- yarn install

Scripts

- yarn dev — start Next.js dev server
- yarn build — build production bundle
- yarn start — start production server
- yarn lint — run ESLint (next/core-web-vitals)
- yarn typecheck — run TypeScript in noEmit mode
- yarn format — format with Prettier

Development

- Start the dev server:
  - yarn dev
- Visit:
  - http://localhost:3000/ — Home ([app/page.tsx](app/page.tsx))
  - http://localhost:3000/about — About ([app/about/page.tsx](app/about/page.tsx))
  - http://localhost:3000/api/health — Health JSON ([app/api/health/route.ts](app/api/health/route.ts))

Conventions summary (see [AI_RULES.md](AI_RULES.md) for full guidance)

- Routes live in [app](app) with co-located components and optional loading/error UIs.
- Default to Server Components. Only use "use client" when strictly needed.
- CSS Modules colocated with components, no global overrides beyond [app/globals.css](app/globals.css).
- Keep dependencies minimal. Avoid UI/design/state libraries unless approved.
- Ensure accessibility: semantic HTML, proper alt text, keyboard focus.
- Keep metadata in [app/layout.tsx](app/layout.tsx) or route segments if needed.

Notes

- This scaffold pins Next.js 15 and React 18 per baseline. Adjust versions only with approval.
- After adding files, always run:
  - yarn format
  - yarn lint
  - yarn typecheck
