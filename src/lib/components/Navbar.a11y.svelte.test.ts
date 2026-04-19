import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Navbar from './Navbar.svelte';
import { expectNoA11yViolations } from '$lib/test-utils/axe';

describe('Navbar a11y', () => {
	it('logged-out state has no violations', async () => {
		render(Navbar, { user: null });
		await expectNoA11yViolations();
	});

	it('authenticated state has no violations', async () => {
		render(Navbar, { user: { id: 'u-1', name: 'Ada', email: 'ada@example.com' } });
		await expectNoA11yViolations();
	});

	it('anonymous state has no violations', async () => {
		render(Navbar, { user: { id: 'anon-1', isAnonymous: true } });
		await expectNoA11yViolations();
	});
});
