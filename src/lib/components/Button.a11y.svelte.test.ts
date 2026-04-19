import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import Button from './Button.svelte';
import { expectNoA11yViolations } from '$lib/test-utils/axe';

function textSnippet(text: string) {
	return createRawSnippet(() => ({
		render: () => `<span>${text}</span>`
	}));
}

describe('Button a11y', () => {
	it('default variant has no violations', async () => {
		render(Button, { children: textSnippet('Click me'), silent: true });
		await expectNoA11yViolations();
	});

	it('primary variant has no violations', async () => {
		render(Button, { children: textSnippet('Next module'), variant: 'primary', silent: true });
		await expectNoA11yViolations();
	});

	it('disabled default has no violations', async () => {
		render(Button, { children: textSnippet('Submit'), disabled: true, silent: true });
		await expectNoA11yViolations();
	});

	it('disabled primary has no violations', async () => {
		render(Button, {
			children: textSnippet('Submit'),
			variant: 'primary',
			disabled: true,
			silent: true
		});
		await expectNoA11yViolations();
	});
});
