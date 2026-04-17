import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

const data = {
	user: {
		id: 'u-1',
		createdAt: new Date(),
		updatedAt: new Date(),
		email: 'ada@example.com',
		emailVerified: true,
		name: 'Ada'
	},
	course: {
		id: 'creativity',
		title: 'Creativity',
		slug: 'creativity',
		description: 'Warm up your creative muscles.',
		icon: 'mdi:lightbulb',
		color: 'teal',
		lessons: [
			{
				id: 'l-1',
				title: 'Preparation',
				slug: 'preparation',
				description: 'Get ready.',
				icon: 'mdi:dumbbell',
				estimatedMinutes: 5,
				modules: [
					{
						type: 'exercise' as const,
						id: 'm-1',
						title: 'Paperclip',
						componentId: 'DivergentThinking',
						estimatedMinutes: 5,
						config: {}
					}
				]
			}
		]
	},
	lessonProgress: { preparation: { completed: 0, total: 1 } }
};

describe('Learn page sidebar toggle', () => {
	it('starts with the sidebar closed', async () => {
		const { container } = render(Page, { data });

		const layout = container.querySelector('.learn-layout');
		expect(layout).not.toBeNull();
		expect(layout!.classList.contains('open')).toBe(false);

		const toggle = container.querySelector(
			'[data-testid="sidebar-toggle"]'
		) as HTMLButtonElement;
		expect(toggle.getAttribute('aria-expanded')).toBe('false');

		const sidebar = container.querySelector('[data-testid="sidebar"]') as HTMLElement;
		expect(sidebar.getAttribute('aria-hidden')).toBe('true');
		expect(sidebar.hasAttribute('inert')).toBe(true);
	});

	it('opens when the toggle is clicked and closes again on second click', async () => {
		const { container } = render(Page, { data });

		const toggle = container.querySelector(
			'[data-testid="sidebar-toggle"]'
		) as HTMLButtonElement;
		const layout = container.querySelector('.learn-layout') as HTMLElement;
		const sidebar = container.querySelector('[data-testid="sidebar"]') as HTMLElement;

		toggle.click();
		await expect.poll(() => layout.classList.contains('open')).toBe(true);
		expect(toggle.getAttribute('aria-expanded')).toBe('true');
		expect(sidebar.getAttribute('aria-hidden')).toBe('false');
		expect(sidebar.hasAttribute('inert')).toBe(false);

		toggle.click();
		await expect.poll(() => layout.classList.contains('open')).toBe(false);
		expect(toggle.getAttribute('aria-expanded')).toBe('false');
	});

	it('toggle button label flips based on open state', async () => {
		const { container } = render(Page, { data });

		const toggle = container.querySelector(
			'[data-testid="sidebar-toggle"]'
		) as HTMLButtonElement;
		expect(toggle.getAttribute('aria-label')).toBe('Open sidebar');

		toggle.click();
		await expect.poll(() => toggle.getAttribute('aria-label')).toBe('Close sidebar');
	});
});
