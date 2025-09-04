# AI/LLM development rules for the Minimal Next.js base project

1. Purpose and scope

- This file defines how AI/LLM agents must operate in this repository to keep the codebase consistent, minimal, and maintainable.
- Agents must follow these rules exactly. Deviations require human approval via a short proposal PR before implementation.
- Target audience: AI agents, automation scripts, and human collaborators who use AI-generated changes.

2. Tech baseline (do not change without approval)

- Framework: Next.js 15, App Router only. No [pages](pages) directory.
- Language: TypeScript with strict type checking enabled.
- Package manager: yarn.
- Styling: CSS Modules only. No Tailwind, no CSS-in-JS libraries.
- Linting/formatting: ESLint with next/core-web-vitals, Prettier.
- Testing: No e2e initially. Unit tests are optional at this stage.
- Git hygiene: Conventional Commits for all commits and PR titles.

3. Project structure and locations

- Routes and layouts live under [app](app).
  - Root layout: [app/layout.tsx](app/layout.tsx)
  - Root page: [app/page.tsx](app/page.tsx)
  - Route segments follow Next.js conventions. Whenever creating a new segment, consider adding [loading.tsx](app/segment/loading.tsx) and [error.tsx](app/segment/error.tsx) in that segment for UX quality.
- APIs use route handlers under [app/api](app/api) with one file per endpoint, like [app/api/hello/route.ts](app/api/hello/route.ts).
- Shared UI components go in [components](components).
- Reusable logic (non-React) goes in [lib](lib).
- Styles for a component live alongside that component as a .module.css file, for example [components/Button/Button.module.css](components/Button/Button.module.css).
- Global styles are kept minimal in [app/globals.css](app/globals.css).

4. Components and rendering rules

- Default to React Server Components. Only mark files as client when strictly necessary for interactivity (browser APIs, stateful UI, event handlers).
- Client components must include the "use client" directive at the top and be kept as small as possible; push heavy logic into server or [lib](lib).
- Prefer passing server-fetched data into client components as props rather than fetching in the client.

5. Routing and navigation rules

- Use the App Router conventions exclusively. No legacy routing patterns.
- Use Next.js navigation utilities (Link) and co-locate loading and error UI with their route segments.
- When adding a new route, include a minimal [loading.tsx](app/segment/loading.tsx) whenever the fetch is likely to take more than ~150ms.

6. Data fetching and caching

- Prefer server-side fetching in route segments or server components.
- Use Next’s fetch caching and revalidation thoughtfully:
  - Default: static with revalidate when data is not highly dynamic. Use fetch options { next: { revalidate: N } } or route segment revalidate config.
  - Use no-store or dynamic = force-dynamic only when necessary (highly dynamic data, user-specific content).
- For mutations, prefer server actions or API route handlers under [app/api](app/api). Do not embed secrets in client code.

7. CSS Modules rules

- File naming: ComponentName.module.css, colocated with the component file.
- Keep selectors local and minimal. No global overrides. Avoid :global unless there is a strong reason and an approval note in the PR.
- Avoid utility class bloat. Prefer readable, component-scoped class names.
- Use variables via CSS custom properties if needed, defined once at a minimal global layer inside [app/globals.css](app/globals.css).

8. Dependencies and third-party libraries

- Default stance is minimalism. Do not add UI libraries, state libraries, CSS-in-JS, or design systems without approval.
- Small, focused libraries that materially reduce code may be proposed, with tradeoffs documented in the PR description.

9. Linting, formatting, and types

- All changes must pass ESLint and Prettier and compile with TypeScript strict.
- Expected scripts to exist in package.json (to be added when the project is initialized):
  - format: format all files with Prettier
  - lint: run ESLint on the project
  - typecheck: run tsc without emitting

10. Git and pull requests

- Branch naming: feature/short-topic, fix/short-topic, chore/short-topic, docs/short-topic.
- Commit messages follow Conventional Commits (e.g., feat:, fix:, chore:, docs:, refactor:, test:).
- Keep PRs small and focused. One logical change per PR.
- PR description must include:
  - Summary of change
  - Screenshots or text evidence where relevant
  - Notes on performance, accessibility, and risk
  - Confirmation that lint, format, and typecheck pass

11. Environment variables and security

- Put secrets in .env.local and never commit them. Reference them server-side only.
- Do not expose server-only variables to the client.
- When using API keys, read them in server code paths (route handlers or server components) and pass only non-sensitive results to the client.

12. Accessibility and SEO

- Use semantic HTML, proper headings, and accessible labels and roles.
- All images must include alt text and use the Next.js Image component when applicable.
- Ensure keyboard navigation works for interactive elements.
- Keep metadata declarations correct in [app/layout.tsx](app/layout.tsx) and segment-specific metadata in the relevant route folders.

13. Performance and bundle size

- Prefer server rendering to keep client bundles small.
- Lazy-load heavy client-only components via dynamic import to avoid bloating the main bundle.
- Use next/font for local fonts; avoid loading unnecessary font weights.
- Avoid large runtime dependencies; prefer native Web APIs where possible.

14. File change protocol for AI agents

- Before coding:
  - Outline the intent, touched files, and risks.
  - Confirm the change aligns with the baseline and constraints in this file.
- During coding:
  - Keep diffs focused. Avoid unrelated refactors.
  - Colocate styles in a .module.css next to the component.
- After coding:
  - Run format, lint, and typecheck.
  - If applicable, add or update minimal unit tests.
  - Update documentation: if you add a pattern or convention, link to the relevant section in [AI_RULES.md](AI_RULES.md).
  - Raise a PR with the required description template.

15. Optional unit testing guidance (for later adoption)

- If unit tests are added, prefer colocating tests next to the implementation or in a **tests** folder adjacent to the code.
- Use React Testing Library for React components. Keep tests at the behavior level; avoid testing implementation details.
- Keep the test dependency footprint minimal.

16. Review checklist (must be satisfied before merge)

- The change adheres to the minimal stack and constraints.
- All new components are server components by default unless interactivity is strictly required.
- Styles are in CSS Modules with clear, local class names.
- No unnecessary dependencies added.
- Lint, format, and typecheck pass.
- Accessibility and performance considerations addressed.
- PR is small, well-described, and follows Conventional Commits.

17. Commands reference (expected once package.json is set up)

- yarn format
- yarn lint
- yarn typecheck

Version

- v1.0 (initial minimal rules)
