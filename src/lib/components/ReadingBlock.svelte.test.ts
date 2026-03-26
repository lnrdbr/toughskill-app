import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import ReadingBlock from './ReadingBlock.svelte';

describe('ReadingBlock', () => {
	it('renders the article element', async () => {
		render(ReadingBlock, { content: 'Hello world' });

		await expect.element(page.getByRole('article')).toBeVisible();
	});

	it('renders markdown bold as <strong>', async () => {
		const { container } = render(ReadingBlock, { content: '**bold text**' });

		const strong = container.querySelector('strong');
		expect(strong).not.toBeNull();
		expect(strong!.textContent).toBe('bold text');
	});

	it('renders markdown links as <a>', async () => {
		const { container } = render(ReadingBlock, {
			content: '[click here](https://example.com)'
		});

		const link = container.querySelector('a');
		expect(link).not.toBeNull();
		expect(link!.getAttribute('href')).toBe('https://example.com');
	});

	it('renders markdown lists', async () => {
		const { container } = render(ReadingBlock, {
			content: '- item one\n- item two'
		});

		const listItems = container.querySelectorAll('li');
		expect(listItems.length).toBe(2);
	});

	it('calls oncomplete when mounted', async () => {
		let called = false;
		render(ReadingBlock, {
			content: 'Read this.',
			oncomplete: () => {
				called = true;
			}
		});

		await expect.poll(() => called).toBe(true);
	});
});
