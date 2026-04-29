# End-to-end testing

This document records the end-to-end (E2E) testing layer for TOUGHSKILL: what it covers, how it isolates itself from development data, and what it deliberately does not catch.

## Purpose

Component tests and story tests verify that units render and behave in isolation with mocked dependencies. They cannot prove that a signed-in user's click on a real lesson dot produces a real row in the `moduleCompletion` table. That integration — browser, SvelteKit routing, Better Auth session cookies, Drizzle writes, module-runner state machine — is only exercised end to end. The E2E layer exists to cover exactly that seam.

## What is covered

A single test, `tests/e2e/lesson-completion.spec.ts`, drives the critical path: a new user registers with email and password, lands on the account page, navigates to `/learn`, double-clicks the first lesson node in the creativity dot-path, and completes its intro module. The assertion is that the "Lesson complete" heading appears.

The test proves five things at once: sign-up succeeds, the session cookie survives the redirect to `/auth`, the auth-gated `/learn` page loads, the form-POST transition from `/learn` to `/lesson` works, and the intro module's auto-submit plus the parent's "Finish session" action produce a completed session. If any of those break, this test fails.

## Isolation

The E2E run writes to a dedicated SQLite file, `e2e.db`, not the development database. The Playwright global setup at `tests/e2e/global-setup.ts` deletes the file (and any WAL sidecars) before each run and invokes `drizzle-kit push --force` against it. Every run therefore starts with an empty schema.

The web server spawned by Playwright is `yarn dev --port 5174` with three environment overrides: `DATABASE_URL=e2e.db`, a fixed `BETTER_AUTH_SECRET`, and `ORIGIN=http://localhost:5174`. Vite's env loader does not overwrite values already present in the process environment, so these overrides win over the developer's `.env`.

Each test generates a unique email (`e2e-${Date.now()}@test.local`) to avoid colliding with any row that might persist across a botched cleanup.

## What is deliberately not covered

- **GitHub OAuth.** The test uses email and password only. Driving a real OAuth flow requires either test credentials or a mock provider; both expand scope without adding integration signal the email flow does not already provide.
- **Non-intro module types.** The test targets lesson 1 because it contains a single `intro` module that auto-submits. Exercise, reflection, and photo modules each have their own submission protocols; covering them belongs in separate tests, not this one.
- **Browser matrix.** Chromium only. Cross-browser rendering is the concern of the component and story layers.
- **Production build.** The test runs against `vite dev`, not `yarn build && node build`. Production-only regressions (adapter output, asset hashing) are out of scope here.

## Selector choices

Two selector decisions are worth recording because both encode real findings about the UI:

- **Dot-path nodes require `dblclick`.** `DotPath.svelte` binds the "start lesson" handler to `ondblclick`; single-click only selects. The test calls `firstLesson.dblclick()` accordingly.
- **Form inputs are addressed by `name` attribute, not `getByLabel`.** The login form wraps the control in a `<label>` whose visible text sits in a nested `<span class="label">`. Playwright's accessible-name resolution for that pattern timed out in practice; `input[name="..."]` is stable and mirrors the selectors Better Auth's form action reads.

## Running

```
yarn test:e2e
```

The command is also the CI entry point. `playwright.config.ts` runs one worker, zero retries, and keeps traces only on failure.

## Limits of this layer

E2E tests are expensive to run and quick to become brittle. This repo keeps exactly one E2E test on purpose: the single highest-value flow, written with stable selectors, isolated from dev data. Additional E2E coverage should be added only when a specific integration bug escapes the component and story layers — not pre-emptively.
