# TOUGHSKILL

Implementation accompanying the dissertation "TOUGHSKILL: a gamified soft-skills learning platform grounded in Self-Determination Theory". This repository contains the production application (a SvelteKit 2 + Svelte 5 web app) together with the empirical artefacts referenced from the dissertation chapters.

## Scope

The application is a single-developer dissertation project, not a product release. It targets three skill areas (Communication, Creativity, Work Ethic) and operationalises a small set of design commitments described in the dissertation: content gamification rather than points-and-badges layering, informational feedback in place of tangible rewards, and a flow-oriented module-runner architecture. Features explicitly avoided (streaks, leaderboards, variable reward schedules) are documented in `Code/CLAUDE.md` alongside the rationale.

## Stack

- **SvelteKit 2** with **Svelte 5** runes (`$state`, `$derived`, `$props`).
- **Tailwind CSS v4** configured via CSS (`src/routes/layout.css`); no JS config file.
- **Better Auth** for email/password and GitHub OAuth, with sessions injected into `event.locals` by `src/hooks.server.ts`.
- **Drizzle ORM** + `better-sqlite3`. The application schema lives in `src/lib/server/db/schema.ts`; the auth schema is regenerated from the auth config and must not be edited by hand.
- **Vitest** with three projects (`server`, `client`, `storybook`) and **Playwright** for end-to-end coverage. `requireAssertions: true` prevents accidental no-op tests.
- **Storybook 10** with `addon-a11y` wired into the test runner so every story is scanned by axe at test time.

## Repository layout

```
Code/
  src/lib/components/        Shared components (Button, CourseCard, ListItem, …)
  src/lib/components/lesson/ Module-runner and lesson-module components
  src/lib/server/            Auth and database
  src/routes/                Pages, route-specific components, route-level tests
  tests/e2e/                 Playwright end-to-end suite
  docs/                      Engineering and study documentation
    accessibility-dissertation.md   Accessibility chapter draft
    e2e-testing.md                  E2E testing rationale and limits
    reliability-study/              Pre-registered LLM-evaluator study
```

The dissertation document itself lives outside this directory; `BachelorDissertation.pdf` in the repository root is a symlink to the build output of the LaTeX/Typst source held in a sibling directory.

## Running locally

```sh
yarn install
cp .env.example .env          # then fill in DATABASE_URL, BETTER_AUTH_SECRET, ORIGIN, GitHub OAuth keys
yarn db:push                  # apply the Drizzle schema to the SQLite file
yarn dev                      # Vite dev server on the default port
```

Required environment variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `ORIGIN`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`. The `MISTRAL_API_KEY` variable is required only to reproduce the reliability study; the application itself does not depend on it at runtime.

## Commands

| Command            | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `yarn dev`         | Vite development server                     |
| `yarn build`       | Production build                            |
| `yarn check`       | `svelte-kit sync && svelte-check`           |
| `yarn lint`        | Prettier check followed by ESLint           |
| `yarn format`      | Prettier write                              |
| `yarn test`        | Vitest single run across all three projects |
| `yarn test:unit`   | Vitest watch mode                           |
| `yarn test:e2e`    | Playwright end-to-end suite                 |
| `yarn storybook`   | Storybook on port 6006                      |
| `yarn db:push`     | Push schema to SQLite                       |
| `yarn db:studio`   | Drizzle Studio (browser UI)                 |
| `yarn auth:schema` | Regenerate the Better Auth Drizzle schema   |

A single test file can be run with `npx vitest run path/to/file.test.ts`; a single project with `npx vitest --project client` (or `server`, `storybook`).

## Testing layers

The test suite is layered to match the cost and reach of each kind of bug. Component tests render units in isolation with mocked dependencies. Story tests exercise the same components through their stories under axe, capturing states that are awkward to reach in route-level tests. Route-level tests render composed page trees and catch regressions that emerge only at the seams. A single end-to-end test in `tests/e2e/` drives the highest-value flow (sign-up, session, lesson start, completion) through a real browser against a disposable SQLite file. The reasoning behind the E2E layer's scope and what it deliberately does not cover is documented in `docs/e2e-testing.md`.

Accessibility scans run at three levels. Components scan themselves with a fixed list of page-only rules disabled. Routes scan the composed page tree. Stories run the addon-a11y rules through the Vitest runner. A separate layout test asserts the structural invariants the scanning topology cannot. The full programme (standards chosen, violations surfaced, limits) is set out in `docs/accessibility-dissertation.md`.

## Reliability study

`docs/reliability-study/` contains the artefacts for the pre-registered evaluation of the LLM-based grader: pre-registered submissions, the two prompt variants, the runner and analysis scripts, the raw JSONL results, the metrics output, and three SVG figures. The study answers three questions for two exercise types: test–retest reliability, criterion validity against pre-registered tier rank, and a rubric-versus-naive prompt ablation at matched output schema. `docs/reliability-study/README.md` documents the reproduction procedure and the scope decisions that bound the study.

## Continuous integration

`.github/workflows/ci.yml` runs lint, type check, build, server tests, component tests, and Storybook tests on every push and pull request to `main`. The end-to-end suite is run locally and is not yet part of the CI matrix; this is a deliberate choice given the cost of a full Playwright environment relative to the marginal coverage one E2E test adds over the component, story, and route layers.

## Citation

If referencing this implementation in academic work, cite the accompanying dissertation rather than this repository.
