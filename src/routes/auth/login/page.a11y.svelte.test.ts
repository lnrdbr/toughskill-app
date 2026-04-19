import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { expectNoA11yViolations } from '$lib/test-utils/axe';

/**
 * Route-level a11y for the login page. Scans the sign-in tab (default),
 * the sign-up tab (extra name field + different form action), and the
 * error state (role=alert banner) so the validation path is covered too.
 */
describe('/auth/login — login page a11y', () => {
	it('renders clean in sign-in mode (default)', async () => {
		render(Page, { form: null });
		await expectNoA11yViolations();
	});

	it('renders clean in sign-up mode', async () => {
		const { container } = render(Page, { form: null });
		const registerTab = container.querySelectorAll('[role="tab"]')[1] as HTMLButtonElement;
		registerTab.click();
		await new Promise((r) => requestAnimationFrame(() => r(null)));
		await expectNoA11yViolations();
	});

	it('renders clean with a form error message', async () => {
		render(Page, { form: { message: 'Invalid email or password.' } });
		await expectNoA11yViolations();
	});
});
