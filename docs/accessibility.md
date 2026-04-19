# Accessibility

This document records the accessibility programme for TOUGHSKILL: the standards it targets, the tooling that enforces them, the concrete violations that existed before the programme began, and the limits of what automated testing can guarantee.

## Standard

The application targets **WCAG 2.1 Level AA** plus axe-core's **best-practice** rule set. WCAG AA is the bar most public-sector and education procurement contracts require; best-practice adds structural rules (landmark uniqueness, heading order, label-in-name) that WCAG does not mandate but that materially affect screen-reader usability.

Concretely this means the following rule tags are enforced at every scan: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice`.

## How accessibility is enforced

Three layers, each catching a different class of regression:

1. **Component-level axe scans.** Every interactive component has a companion `*.svelte.test.ts` that renders the component and calls `expectNoA11yViolations()`. The helper lives at `src/lib/test-utils/axe.ts`. Component scope disables a fixed list of page-only rules (`landmark-one-main`, `region`, `page-has-heading-one`, etc.) so that an isolated component mounted into an empty document is not false-flagged for lacking a `<main>` landmark.

2. **Route-level axe scans.** Each top-level route has a `page.a11y.svelte.test.ts` that renders the composed page tree and scans at component scope. These tests catch regressions that arise only when components compose — for example, a contrast failure that only appears when a button sits on a secondary-tinted panel, or a heading-order break that only appears when two sections are stacked. Files: `src/routes/page.a11y.svelte.test.ts`, `src/routes/courses/page.a11y.svelte.test.ts`, `src/routes/learn/page.a11y.svelte.test.ts`, `src/routes/auth/page.a11y.svelte.test.ts`, `src/routes/auth/login/page.a11y.svelte.test.ts`, `src/routes/lesson/page.a11y.svelte.test.ts`.

3. **Storybook integration.** `@storybook/addon-a11y` is wired into the story runner in `.storybook/preview.ts` with `a11y.test: 'error'`. Every story runs axe as part of `yarn test`. The page-only rules are disabled at preview scope so story isolation does not produce false landmark failures.

A fourth test — `src/routes/layout.a11y.svelte.test.ts` — verifies that the production layout renders exactly one `<main>` landmark. This is the structural invariant the page-scope tests cannot assert, because they render pages without the layout shell.

## Scope choice: why component scope rather than page scope

An earlier iteration ran axe against the whole document at page scope. Every component-level test failed on `landmark-one-main`, `region`, and `page-has-heading-one` — rules that only make sense when scanning an entire HTML document. Component-scope scans disable those rules explicitly rather than wrapping each test in a synthetic landmark.

The trade-off is real but narrow: automated scans will not catch a regression in which a page ships without a `<main>` landmark. The layout structure test closes that specific gap. If the layout ever renders zero or more than one `<main>`, the test fails.

## Remediation log

The first full axe run surfaced three classes of failure. Each is fixed; each fix is recorded here because the reasoning matters more than the diff.

**Colour contrast on the primary button.** The `.primary` variant used `--color-primary-500` (#14b8a6) as its background with white text. The contrast ratio was 2.48:1, well below the WCAG AA requirement of 4.5:1 for body text. I moved the default background to `--color-primary-700` (#0f766e), which yields 4.84:1. Hover and active states moved to `primary-800` and `primary-900` respectively, preserving the existing press-in interaction while keeping every state above the threshold. `src/lib/components/Button.svelte:96-122` documents the contrast ratios in a comment so future palette changes are tested against the same bar.

**Colour contrast on status text.** `--color-error` was `#ef4444`, producing 3.76:1 against the background — insufficient for body text. It is now `#dc2626` (4.83:1). `--color-info` was `#3b82f6` (3.68:1); it is now `#1d4ed8` (8.55:1). These changes sit in `src/routes/layout.css` next to a comment explaining the contrast bar, so future additions to the semantic palette are checked against the same requirement.

**Missing accessible names on dot-path buttons.** Each lesson dot was an unlabelled `<button>` with an `aria-hidden` icon. A screen-reader user received only the status as announcement ("button, in progress"), not which lesson. `DotPathNode` now takes a required `label` prop and derives an `aria-label` of the form `"${label} — ${status text}"` plus `aria-pressed={selected}`. `src/routes/learn/DotPathNode.svelte:18-30` shows the derivation.

**List semantics stripped by role override.** `ChoiceBranch` wrapped its options in `<ul><li>` but set each `<button>` to `role="radio"` with the parent container as `role="radiogroup"`. The radio-group role override stripped the `<li>` elements of their listitem semantics and axe flagged them as orphans. Removing the `<ul><li>` wrapper and using a plain `<div>` was the correct fix — the ARIA roles already provide the semantics the list was duplicating. See `src/lib/components/lesson/modules/ChoiceBranch.svelte:99-122`.

## Storybook wiring: a silent-failure incident worth documenting

Between Storybook 8 and 10.3 the integration between `@storybook/addon-a11y` and `@storybook/addon-vitest` changed. `setProjectAnnotations` used to be required in `.storybook/vitest.setup.ts`; from 10.3 onward it is auto-wired, and calling it explicitly prevents the auto-wiring from running. The initial implementation included the call. Every Storybook test passed. An axe violation deliberately injected to verify the pipeline (an `<img>` without alt text inside a `<Button>` story) also passed — the checks were not running at all.

The fix was to remove the call and leave `.storybook/vitest.setup.ts` as `export {};`. The next run surfaced 47 real violations. The lesson is that a green test suite proves nothing unless the suite has been verified to fail on a known-bad input. Before declaring this layer reliable, I injected the same deliberate violation again and confirmed the pipeline caught it.

## What automated testing does not cover

Axe catches a fraction of WCAG — the machine-checkable fraction. It does not judge whether an image's alt text is meaningful, whether focus order matches visual order, whether a form error message is actually helpful, or whether a keyboard-only user can actually complete a task without getting stuck. Several WCAG success criteria can only be validated by manual testing:

- **2.4.3 Focus Order.** Must be verified by tab-walking each flow.
- **1.3.2 Meaningful Sequence.** Must be verified by reading the DOM order out loud.
- **3.3.1 Error Identification** and **3.3.3 Error Suggestion.** Requires a reviewer to read the error text and judge whether it identifies the field and suggests a fix.
- **1.4.1 Use of Color.** Requires checking that no information is conveyed by colour alone.
- **2.1.1 Keyboard.** Axe can spot unreachable interactive elements but cannot verify that a custom interaction (like the dot-path selection) is keyboard operable end-to-end.

A claim of full WCAG 2.1 AA compliance would additionally require: (i) a screen-reader pass with VoiceOver on Safari and NVDA on Firefox, the two combinations WebAIM surveys identify as most common; (ii) a keyboard-only pass for every user flow; (iii) user testing with at least one participant who uses assistive technology daily. Automated testing is a floor, not a ceiling.

## Running the tests

```bash
yarn test                                # full suite: client + server + storybook
npx vitest run --project client          # component + route a11y scans
npx vitest run --project storybook       # story a11y scans
```

A single file:

```bash
npx vitest run src/lib/components/Button.svelte.test.ts
```

## Adding a new component

Every new interactive component requires a companion `*.svelte.test.ts` that, at minimum, renders the component in each meaningful state and calls `expectNoA11yViolations()`. The helper signature is:

```ts
expectNoA11yViolations(container?: Element | Document, scope?: 'component' | 'page'): Promise<void>
```

Default scope is `component`, which skips the page-only rules. Pass `'page'` only when scanning a full document that includes a layout with landmarks.
