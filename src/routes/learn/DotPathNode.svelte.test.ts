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

	it('renders a progress ring when in-progress', async () => {
		const { container } = render(DotPathNode, {
			status: 'in-progress',
			icon: 'mdi:shape-outline',
			completed: 3,
			total: 6,
			onclick: () => {}
		});

		const ring = container.querySelector('.progress-ring');
		expect(ring).not.toBeNull();

		const fill = container.querySelector('.progress-ring-fill') as SVGCircleElement | null;
		expect(fill).not.toBeNull();

		// At 50% progress, dashoffset should be half of the circumference.
		const circumference = 2 * Math.PI * 46;
		const offset = Number(fill!.getAttribute('stroke-dashoffset'));
		expect(offset).toBeCloseTo(circumference * 0.5, 1);
	});

	it('does not render a progress ring when not in-progress', async () => {
		const { container } = render(DotPathNode, {
			status: 'completed',
			icon: 'mdi:atom',
			onclick: () => {}
		});

		expect(container.querySelector('.progress-ring')).toBeNull();
	});
});
