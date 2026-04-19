import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { expectNoA11yViolations } from '$lib/test-utils/axe';

const data = {
	user: {
		id: 'u-1',
		email: 'ada@example.com',
		name: 'Ada',
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	signUpProvider: 'credential'
};

describe('/auth — account page a11y', () => {
	it('renders clean for a credential-provider user', async () => {
		render(Page, { data });
		await expectNoA11yViolations();
	});

	it('renders clean for a github-provider user', async () => {
		render(Page, { data: { ...data, signUpProvider: 'github' } });
		await expectNoA11yViolations();
	});
});
