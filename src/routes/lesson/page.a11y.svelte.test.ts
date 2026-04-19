import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { expectNoA11yViolations } from '$lib/test-utils/axe';

/**
 * Route-level a11y for the lesson player. Covers the two states that
 * do not require full module fixtures: the empty session (no lesson
 * picked yet) and the error state. The module-running state is already
 * covered by component-level a11y scans on each module.
 */
describe('/lesson — lesson page a11y', () => {
	it('renders clean in the empty-session state', async () => {
		render(Page, { data: { sessionType: 'empty' }, form: null });
		await expectNoA11yViolations();
	});

	it('renders clean in the error state', async () => {
		render(Page, {
			data: { sessionType: 'empty' },
			form: { error: 'Lesson not found.' }
		});
		await expectNoA11yViolations();
	});
});
