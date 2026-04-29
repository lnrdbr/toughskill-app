# Accessibility (dissertation draft)

> Draft subsection for the Implementation and Evaluation chapters. Citation placeholders are flagged `[cite: ...]` — primary sources to be retrieved before final submission.

Automated accessibility testing is necessary but not sufficient. This section records the standards chosen for TOUGHSKILL, the layered enforcement mechanism that operationalises them, the violations found in the first full scan, and the boundary between what machine-checkable rules can guarantee and what only human evaluation establishes.

## Standard and justification

The application targets WCAG 2.1 Level AA supplemented by axe-core's best-practice rule set.

WCAG AA was chosen over Level A because AA is the legal threshold under the UK Public Sector Bodies (Accessibility) Regulations 2018 and the procurement bar in most educational contexts [cite: PSBAR 2018]. Level A omits colour contrast entirely, which would exclude the most common real-world failure mode. Level AAA demands contrast ratios (7:1 for body text) that rule out large parts of contemporary colour palettes and, for a single-developer dissertation project, impose cost without proportionate return.

The best-practice set adds structural rules — landmark uniqueness, heading order, label-in-name — that WCAG omits but that materially affect screen-reader usability. Axe's own documentation acknowledges these are stricter than WCAG conformance requires but recommends them for production use [cite: Deque axe-core rule documentation].

The accessibility-testing literature distinguishes rule-based analysis tools (axe, WAVE, HTML_CodeSniffer) from simulated-user and manual evaluation [cite: Vigo, Brajnik and Lomuscio 2013, "Benchmarking Accessibility Evaluation Tools"]. Vigo et al. found that no single rule-based tool caught more than around a third of real accessibility issues in their benchmark; the residual fraction required manual evaluation. This programme therefore treats axe as a regression floor, not a compliance ceiling.

## Enforcement architecture

Three scanning layers were implemented, each catching a different class of regression.

**Component scope.** Every interactive component has a companion test that renders the component in isolation and asserts zero axe violations. Component-scope scans disable a fixed list of page-only rules (`landmark-one-main`, `region`, `page-has-heading-one`, `bypass`, `document-title`, `html-has-lang`) because an isolated component mounted into an empty document cannot by construction satisfy rules about document-level landmarks.

**Route scope.** Each top-level route has a page-level scan that renders the composed page tree. These catch regressions that arise only when components compose — a contrast failure that appears when a button sits on a tinted panel, or a heading-order break between stacked sections. A component that passes its own scan can still fail when combined.

**Storybook integration.** Storybook's `addon-a11y` is wired into the story runner, so every component story runs axe automatically at test time. Stories capture states that are expensive to reach in route-level tests (error banners, loading states, edge-case data), and this layer exercises all of them uniformly.

A fourth test asserts the structural invariant the scanning layers cannot. The route-scope scans render pages without the layout shell, so without a dedicated layout test the single-`<main>` invariant is not automatically enforced. One terse test closes that gap.

## A scope decision worth examining

An earlier iteration scanned every component-level test at page scope against the full document. Every test failed on `landmark-one-main` and `region` because an isolated component mounted into an empty document trivially lacks a `<main>`. The fix was either to wrap each test in a synthetic landmark structure (invasive, and tests something the component does not control) or to disable page-only rules at component scope.

I chose the latter. The trade-off is narrow but real: without the layout test, a page that ships without a `<main>` landmark would pass every automated check. The explicit layout test encodes the invariant that the scanning topology cannot.

## Violations surfaced

The first full run surfaced three classes of failure. Each is recorded here because the reasoning behind the fix generalises beyond the specific instance.

**Insufficient colour contrast on interactive elements.** The primary button variant used a teal at the 500 tier of the palette (#14b8a6) with white text, producing a contrast ratio of 2.48:1 against the 4.5:1 WCAG AA threshold for body text. Error and info status colours failed at 3.76:1 and 3.68:1 respectively. WebAIM's annual survey reports contrast as the most common WCAG violation by a large margin — 81 per cent of the million home pages sampled in 2024 contained at least one contrast failure [cite: WebAIM 2024 Million Report]. Moving the primary button to the 700 tier (#0f766e) and the status colours to the 600–700 tier yielded ratios between 4.83:1 and 8.55:1. The cost is a darker, less saturated palette; the benefit is structural.

**Missing accessible names on custom controls.** The lesson-selection dots used unlabelled `<button>` elements wrapping `aria-hidden` icons. A screen-reader user received only the state ("button, in progress") with no indication of which lesson the button referenced. This is the canonical failure mode for icon-only controls and an instance of WCAG 2.1 SC 4.1.2 (Name, Role, Value). The fix introduced a required `label` prop and derived an `aria-label` of the form `${label} — ${status}`, together with `aria-pressed` reflecting selection. The component signature now makes the label impossible to omit at compile time rather than catching the omission at scan time.

**Role overrides stripping native semantics.** A multiple-choice component wrapped its options in `<ul>/<li>` while also setting each button to `role="radio"` inside a `role="radiogroup"` container. The ARIA role override strips the `<li>` elements of their implicit `listitem` role, and axe flagged them as orphan list items. The fix was to remove the list wrapper: the ARIA roles already provided the grouping semantics that the list was redundantly encoding. This illustrates a broader principle — ARIA overrides silently replace rather than augment native semantics, and combining the two without attending to precedence produces structures worse than either alone [cite: W3C ARIA in HTML specification, §rules for native host language semantics].

## An incident worth documenting: silent test failure

Between Storybook 8 and 10.3 the integration between `addon-a11y` and `addon-vitest` changed. Earlier versions required an explicit `setProjectAnnotations` call in the test setup; from 10.3 onward this is auto-wired, and calling it explicitly prevents the auto-wiring from running. The initial implementation included the call. Every Storybook test passed. On suspicion that the result was too clean for a first run, I injected a deliberate violation — an `<img>` without alt text inside a Button story — and the run still passed. The checks were not running at all.

The lesson is methodological rather than technical: a green test suite proves nothing unless the suite has been verified to fail on a known-bad input. This mirrors a principle established in mutation-testing literature — test suites that pass against correct code frequently do not exercise the logic they appear to [cite: Jia and Harman 2011, "An Analysis and Survey of the Development of Mutation Testing"]. For every new test layer added to this project, I now inject a deliberate failure during bootstrap before trusting subsequent green runs. This practice was not specified at the outset; it was learned from an incident that, had it persisted, would have produced an unfalsifiable accessibility compliance claim.

## Limits of automated testing

Axe covers the machine-checkable fraction of WCAG. It does not judge whether alt text is meaningful, whether focus order matches visual order, whether a form error message is actionable, or whether a keyboard-only user can complete a task end to end. Several WCAG criteria admit only manual validation:

- **SC 2.4.3 Focus Order** requires tab-walking each flow and judging whether the sequence matches user expectation.
- **SC 1.3.2 Meaningful Sequence** requires reading the DOM aloud against the visual layout.
- **SC 3.3.3 Error Suggestion** requires a human judgement on whether the suggested fix identifies the problem and proposes an actionable remedy.
- **SC 1.4.1 Use of Colour** requires confirming that no information is conveyed by colour alone.
- **SC 2.1.1 Keyboard** is only partially automatable; axe catches unreachable controls but cannot verify that a custom interaction — the dot-path selection, for example — is operable without a pointing device.

A full WCAG 2.1 AA conformance claim therefore requires three additions on top of the automated programme: a screen-reader pass on the two combinations most common among assistive-technology users (VoiceOver with Safari, NVDA with Firefox, per the WebAIM screen-reader user survey [cite: WebAIM Screen Reader User Survey #10]); a keyboard-only pass for each user flow; and user testing with at least one participant who relies on assistive technology daily. The work recorded here establishes a reliable regression floor. The conformance claim itself requires the manual layer above it, and the dissertation claims no more than the floor unless that layer is also completed.

## Summary

The accessibility programme has three operational layers (component, route, Storybook) and one structural guard (the layout-landmark test). The first full scan found three classes of failure — contrast, accessible names, role-override collisions — and each was fixed at source rather than with ARIA patches. The silent-failure incident with the Storybook wiring yielded a testable practice: every new test layer is verified against a known-bad input before its green runs are trusted. The programme does not claim full WCAG 2.1 AA conformance; it claims a machine-verifiable subset that will catch most regressions most of the time, and names the manual work needed to turn that into a conformance claim.
