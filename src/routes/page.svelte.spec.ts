import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render the start course button', async () => {
		render(Page);

		const button = page.getByRole('button', { name: /start course/i });
		await expect.element(button).toBeInTheDocument();
	});
});
