import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { expectNoA11yViolations } from '$lib/test-utils/axe';

/**
 * Route-level a11y: exercises the composed page tree once for each
 * meaningful state. Scans at component scope so landmark/region rules
 * (enforced by +layout.svelte) do not false-positive in isolated rendering.
 */
describe('/ — landing page a11y', () => {
	it('renders clean under axe (default)', async () => {
		render(Page);
		await expectNoA11yViolations();
	});
});
