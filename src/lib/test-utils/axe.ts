import axe, { type Result, type RunOptions } from 'axe-core';
import { expect } from 'vitest';

/**
 * Axe tag set: WCAG 2.1 AA plus axe's best-practice ruleset.
 * Best-practice rules are structural (landmarks, heading order, unique ids);
 * contrast + keyboard-focus rules come from the WCAG tags.
 */
const RULE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

/**
 * Rules that only make sense at whole-page scope and must be disabled when
 * asserting against an isolated component rendered into an empty document.
 */
const PAGE_ONLY_RULES = [
	'landmark-one-main',
	'page-has-heading-one',
	'region',
	'bypass',
	'document-title',
	'html-has-lang',
	'html-lang-valid',
	'landmark-no-duplicate-banner',
	'landmark-no-duplicate-contentinfo',
	'landmark-no-duplicate-main',
	'landmark-unique'
];

export type A11yScope = 'component' | 'page';

export async function runAxe(
	container: Element | Document = document,
	scope: A11yScope = 'component'
): Promise<Result[]> {
	const options: RunOptions = {
		runOnly: { type: 'tag', values: RULE_TAGS }
	};
	if (scope === 'component') {
		options.rules = Object.fromEntries(PAGE_ONLY_RULES.map((id) => [id, { enabled: false }]));
	}
	const results = await axe.run(container, options);
	return results.violations;
}

function formatViolations(violations: Result[]): string {
	return violations
		.map((v) => {
			const nodes = v.nodes
				.map((n) => `    - ${n.html}\n      ${n.failureSummary ?? ''}`)
				.join('\n');
			return `[${v.id}] ${v.help}\n  ${v.helpUrl}\n${nodes}`;
		})
		.join('\n\n');
}

/**
 * Assert that axe finds no violations. Defaults to component scope, which
 * skips page-level structural rules (landmarks, one-h1, region).
 */
export async function expectNoA11yViolations(
	container: Element | Document = document,
	scope: A11yScope = 'component'
): Promise<void> {
	const violations = await runAxe(container, scope);
	expect(
		violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
		violations.length ? `Accessibility violations:\n\n${formatViolations(violations)}` : undefined
	).toEqual([]);
}
