import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ReadingBlock from './ReadingBlock.svelte';
import { expectNoA11yViolations } from '$lib/test-utils/axe';

describe('ReadingBlock a11y', () => {
	it('plain prose has no violations', async () => {
		render(ReadingBlock, { content: 'This is a short passage of reading content.' });
		await expectNoA11yViolations();
	});

	it('markdown with links and lists has no violations', async () => {
		render(ReadingBlock, {
			content: [
				'# Heading',
				'',
				'A paragraph with **bold** and [a link](https://example.com).',
				'',
				'- first item',
				'- second item'
			].join('\n')
		});
		await expectNoA11yViolations();
	});
});
