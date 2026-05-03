# Repository Guidelines

## Project Structure & Module Organization
This repository is now a pure Astro + Stimulus site. Application code lives in `src/`: Astro routes in `src/pages`, reusable public UI in `src/components`, client-side controllers in `src/controllers`, typed models in `src/types`, and SCSS tokens/base styles in `src/styles`. Content is data-driven from JSON files in `src/data`. Static assets that must be copied as-is belong in `public/`.

Landing-page content is aggregated in `src/pages/LandingPage/_landingPage.ts` from `src/data/global.json` and `src/data/modules.json`. Course data lives in `src/data/courses.json`, while course lookup/mapping helpers live in `src/pages/Course/_courses.ts`.

Important routing/layout files:
- `src/layouts/BaseLayout.astro`: common SEO/layout shell.
- `src/pages/index.astro`: Astro landing page.
- `src/pages/cours/sylius/[courseSlug].astro`: Astro course page route.
- `src/pages/cv.astro`: CV route.

Important architecture note:
- Files under `src/pages/**` that start with `_` are intentionally not Astro routes. They are helper/data modules only.
- Shared non-route helpers should prefer `src/lib/` to avoid Astro route warnings.

## Build, Test, and Development Commands
Use `npm install` to restore dependencies from `package-lock.json`.

- `npm run dev`: start the Astro dev server on all interfaces.
- `npm run build`: create the Astro static build in `dist/`.
- `npm run preview`: serve the latest build locally.
- `npm run deploy`: build and publish `dist/` to the GitHub Pages branch.
- `npm run lint`: run ESLint across the repository.

The public site now uses the Astro build only. Validate with `npm run build` unless the user explicitly asks for something else.

## Coding Style & Naming Conventions
Follow the existing style in `src`: 2-space indentation, semicolon-free TypeScript/Astro, and named exports for helpers. Use camelCase for functions/helpers, and keep JSON content files descriptive and lowercase, such as `courses.json`. Prefer small, data-driven components over inline hard-coded page content.

Keep the HTML class names in BEM form, but write SCSS using nesting with `&__...` and `&--...` to avoid flat repetitive selectors. Do not rename markup classes just to shorten SCSS.

Client interactivity rule:
- Public markup should be authored in Astro.
- If custom client logic is needed, isolate it in Stimulus controllers.
- Avoid introducing ad hoc inline runtime code when a controller is more maintainable.

When editing course content:
- `chat` is the source of truth for public course content; legacy `content` may still exist in JSON but is no longer rendered on public course pages.
- `CourseItem` types are data-driven and typed in `src/types/content.ts`.
- `yaml` items use structured `object/array/scalar` data, not raw YAML strings.
- `InlineRichText` supports lightweight markdown-like syntax plus `{{ path.to.value }}` interpolation from `src/data/global.json`.

## Testing Guidelines
There is no dedicated test runner committed yet. Before opening a PR, run `npm run lint` and `npm run build` to catch type, rendering, and static-generation regressions. If you add tests, keep them next to the feature or under a local `__tests__` directory and name them `*.test.ts`.

For local code changes during an interactive session, prefer targeted validation and use `npm run build` as the default final check.

## Commit & Pull Request Guidelines
Recent history uses bracketed prefixes such as `[Feature] New course publication` and `[Fix] fix yaml renderer style`. Keep that pattern: `[Feature]`, `[Fix]`, `[Chore]`, followed by a short imperative summary. PRs should describe the user-visible change, note any content or route additions, link the related issue when applicable, and include screenshots for UI changes. Mention whether `npm run lint` and `npm run build` were run.

## Content & Deployment Notes
Course pages are generated from `src/data/*.json` through Astro routes; changes to routing or content should be verified in the generated static output under `dist/`.

Current deployment/migration context:
- Astro is the public rendering path.
- Client interactivity is handled through Stimulus controllers.
- The old Vite/React pipeline has been removed from the public build path.

Canonical and routing conventions are important for this project:
- Homepage canonical must be `https://patxi.iparaguirre.fr` (no trailing slash).
- Course URLs must use a trailing slash in generated links, canonical URLs, and sitemap entries:
  - `https://patxi.iparaguirre.fr/cours/sylius/<slug>/`
- Internal links should follow the same rule: homepage without trailing slash, course pages with trailing slash.

If working on Astro routes, route additions usually require updating:
- `src/pages/**/*.astro`
- `public/sitemap.xml`
- any data lookups in `src/pages/LandingPage/_landingPage.ts`, `src/pages/Course/_courses.ts`, or `src/lib/`

UI-specific conventions established in this project:
- On course pages, chat progress is shown below the current conversation, not inside timeline markers.
- Timeline completion markers on course pages use green styling with a check icon for completed courses.
- On mobile, only explicitly chosen `CourseItem` components should allow horizontal scrolling. `Yaml` and `Architecture` currently do; generic chat bubbles should not overflow the viewport.
- The landing page timeline animation is handled by a Stimulus controller, like the course chat and course timeline behaviors.
