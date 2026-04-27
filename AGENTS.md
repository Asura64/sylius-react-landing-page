# Repository Guidelines

## Project Structure & Module Organization
This repository is a Vite-based React 19 + TypeScript site. Application code lives in `src/`: page-level routes in `src/pages`, reusable UI in `src/components`, shared hooks in `src/hooks`, typed models in `src/types`, and SCSS tokens/base styles in `src/styles`. Content is data-driven from JSON files in `src/data`. Static assets that must be copied as-is belong in `public/`; generated prerender output lands in `prerender-dist/` and should be treated as build output, not hand-edited source.

Landing-page content is aggregated in `src/pages/LandingPage/landingPage.ts` from `src/data/global.json` and `src/data/modules.json`. Course data lives in `src/data/courses.json`, while course lookup/mapping helpers live in `src/pages/Course/courses.ts`.

## Build, Test, and Development Commands
Use `npm install` to restore dependencies from `package-lock.json`.

- `npm run dev`: start the Vite dev server on all interfaces.
- `npm run build`: create the client bundle.
- `npm run build:server`: build the SSR entry used for prerendering.
- `npm run build:prerender`: build client and SSR artifacts, then generate static pages into `prerender-dist/`.
- `npm run preview`: serve the latest build locally.
- `npm run lint`: run ESLint across the repository.

Do not run `npm run build:prerender` automatically after each content/UI change unless the user explicitly asks for it. The user usually handles final prerender/deploy manually.

## Coding Style & Naming Conventions
Follow the existing style in `src`: 2-space indentation, semicolon-free TypeScript/TSX, and named exports for components (for example `export function LandingPage()`). Keep React components in PascalCase directories with `index.tsx` and a sibling `style.scss`. Use camelCase for functions/hooks, and keep JSON content files descriptive and lowercase, such as `courses.json`. Prefer small, data-driven components over inline hard-coded page content.

Keep the HTML class names in BEM form, but write SCSS using nesting with `&__...` and `&--...` to avoid flat repetitive selectors. Do not rename markup classes just to shorten SCSS.

When editing course content:
- `chat` is the source of truth for public course content; legacy `content` may still exist in JSON but is no longer rendered on public course pages.
- `CourseItem` types are data-driven and typed in `src/types/content.ts`.
- `yaml` items use structured `object/array/scalar` data, not raw YAML strings.
- `InlineRichText` supports lightweight markdown-like syntax plus `{{ path.to.value }}` interpolation from `src/data/global.json`.

## Testing Guidelines
There is no dedicated test runner committed yet. Before opening a PR, run `npm run lint` and `npm run build:prerender` to catch type, rendering, and static-generation regressions. If you add tests, keep them next to the feature or under a local `__tests__` directory and name them `*.test.ts` or `*.test.tsx`.

For local code changes during an interactive session, prefer targeted validation and avoid expensive full prerender runs unless the change affects routing, metadata, or static generation.

## Commit & Pull Request Guidelines
Recent history uses bracketed prefixes such as `[Feature] New course publication` and `[Fix] fix yaml renderer style`. Keep that pattern: `[Feature]`, `[Fix]`, `[Chore]`, followed by a short imperative summary. PRs should describe the user-visible change, note any content or route additions, link the related issue when applicable, and include screenshots for UI changes. Mention whether `npm run lint` and `npm run build:prerender` were run.

## Content & Deployment Notes
Course pages are generated from `src/data/*.json` and prerendered through `scripts/prerender.mjs`; changes to routing or content should be verified in the generated static output. Do not edit files under `prerender-dist/` manually unless the task explicitly targets published artifacts.

Canonical and routing conventions are important for this project:
- Homepage canonical must be `https://patxi.iparaguirre.fr` (no trailing slash).
- Course URLs must use a trailing slash in generated links, canonical URLs, and sitemap entries:
  - `https://patxi.iparaguirre.fr/cours/sylius/<slug>/`
- Internal links should follow the same rule: homepage without trailing slash, course pages with trailing slash.

GitHub Pages is used with prerendered output, so route additions usually require updating:
- `src/pages/Course/index.tsx`
- `scripts/prerender.mjs`
- `public/sitemap.xml`

UI-specific conventions established in this project:
- On course pages, chat progress is shown below the current conversation, not inside timeline markers.
- Timeline completion markers on course pages use green styling with a check icon for completed courses.
- On mobile, only explicitly chosen `CourseItem` components should allow horizontal scrolling. `Yaml` and `Architecture` currently do; generic chat bubbles should not overflow the viewport.
