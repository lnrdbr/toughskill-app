import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import Layout from './+layout.svelte';

/**
 * Layout-structure test: the page-scope axe tests run without the layout
 * shell, so they cannot verify that production pages have a single `<main>`
 * landmark. This test closes that gap by asserting the layout renders
 * exactly one `<main>` element for assistive tech to land on.
 */
describe('+layout.svelte — structural landmarks', () => {
	it('renders exactly one <main> landmark', () => {
		const children = createRawSnippet(() => ({
			render: () => '<div data-testid="child">child</div>'
		}));
		render(Layout, { data: { user: null }, children });
		const mains = document.querySelectorAll('main');
		expect(mains.length).toBe(1);
	});
});
