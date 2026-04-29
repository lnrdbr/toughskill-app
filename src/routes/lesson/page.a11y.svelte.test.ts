import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import type { PageData } from './$types';
import { expectNoA11yViolations } from '$lib/test-utils/axe';

const emptyData = { sessionType: 'empty', modules: [], user: null } as unknown as PageData;

describe('/lesson — lesson page a11y', () => {
	it('renders clean in the empty-session state', async () => {
		render(Page, { data: emptyData, form: null });
		await expectNoA11yViolations();
	});

	it('renders clean in the error state', async () => {
		render(Page, {
			data: emptyData,
			form: { error: 'Lesson not found.' }
		});
		await expectNoA11yViolations();
	});
});
