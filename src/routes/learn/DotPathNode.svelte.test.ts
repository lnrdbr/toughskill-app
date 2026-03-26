import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import DotPathNode from './DotPathNode.svelte';

describe('DotPathNode', () => {
	it('renders a button with not-started status', async () => {
		render(DotPathNode, { status: 'not-started', onclick: () => {} });

		const button = page.getByRole('button');
		await expect.element(button).toBeVisible();
		await expect.element(button).toHaveClass('not-started');
	});

	it('renders a button with completed status', async () => {
		render(DotPathNode, { status: 'completed', onclick: () => {} });

		const button = page.getByRole('button');
		await expect.element(button).toHaveClass('completed');
	});

	it('renders a button with in-progress status', async () => {
		render(DotPathNode, { status: 'in-progress', onclick: () => {} });

		const button = page.getByRole('button');
		await expect.element(button).toHaveClass('in-progress');
	});

	it('applies selected class when selected', async () => {
		render(DotPathNode, { status: 'not-started', selected: true, onclick: () => {} });

		const button = page.getByRole('button');
		await expect.element(button).toHaveClass('selected');
	});

	it('calls onclick when clicked', async () => {
		const handler = vi.fn();
		render(DotPathNode, { status: 'not-started', onclick: handler });

		await page.getByRole('button').click();
		expect(handler).toHaveBeenCalledOnce();
	});
});
