import { describe, it, expect, vi } from 'vitest';
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
	lessonProgress: { preparation: { completed: 0, total: 1, started: false } },
	journeyStats: {
		completedLessons: 0,
		totalLessons: 1,
		totalPracticeSeconds: 0,
		realLifeTasksCompleted: 0,
		allDone: false
	}
};

describe('Learn page sidebar toggle', () => {
	it('starts with the sidebar closed', async () => {
		const { container } = render(Page, { data });

		const layout = container.querySelector('.learn-layout');
		expect(layout).not.toBeNull();
		expect(layout!.classList.contains('open')).toBe(false);

		const toggle = container.querySelector('[data-testid="sidebar-toggle"]') as HTMLButtonElement;
		expect(toggle.getAttribute('aria-expanded')).toBe('false');

		const sidebar = container.querySelector('[data-testid="sidebar"]') as HTMLElement;
		expect(sidebar.getAttribute('aria-hidden')).toBe('true');
		expect(sidebar.hasAttribute('inert')).toBe(true);
	});

	it('opens when the toggle is clicked and closes again on second click', async () => {
		const { container } = render(Page, { data });

		const toggle = container.querySelector('[data-testid="sidebar-toggle"]') as HTMLButtonElement;
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

		const toggle = container.querySelector('[data-testid="sidebar-toggle"]') as HTMLButtonElement;
		expect(toggle.getAttribute('aria-label')).toBe('Open sidebar');

		toggle.click();
		await expect.poll(() => toggle.getAttribute('aria-label')).toBe('Close sidebar');
	});
});

describe('Learn page lesson selection', () => {
	it('selects a lesson when a dot is clicked and shows lesson view in the panel', async () => {
		const { container } = render(Page, { data });

		expect(container.querySelector('[data-testid="idle-view"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="lesson-view"]')).toBeNull();

		const dot = container.querySelector('.dot-path button') as HTMLButtonElement;
		dot.click();

		await expect.poll(() => container.querySelector('[data-testid="lesson-view"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="idle-view"]')).toBeNull();
		expect(container.querySelector('.lesson-title')!.textContent).toBe('Preparation');
	});

	it('deselects the lesson when clicking outside the path and panel', async () => {
		const { container } = render(Page, { data });

		const dot = container.querySelector('.dot-path button') as HTMLButtonElement;
		dot.click();
		await expect.poll(() => container.querySelector('[data-testid="lesson-view"]')).not.toBeNull();

		// Click the sidebar toggle — it's outside both the path and progress columns.
		const toggle = container.querySelector('[data-testid="sidebar-toggle"]') as HTMLButtonElement;
		toggle.click();

		await expect.poll(() => container.querySelector('[data-testid="lesson-view"]')).toBeNull();
		expect(container.querySelector('[data-testid="idle-view"]')).not.toBeNull();
	});

	it('keeps the lesson selected when clicking inside the progress panel', async () => {
		const { container } = render(Page, { data });

		const dot = container.querySelector('.dot-path button') as HTMLButtonElement;
		dot.click();
		await expect.poll(() => container.querySelector('[data-testid="lesson-view"]')).not.toBeNull();

		const title = container.querySelector('.lesson-title') as HTMLElement;
		title.click();

		// Still shows lesson view
		expect(container.querySelector('[data-testid="lesson-view"]')).not.toBeNull();
	});

	it('submits the /lesson form on dot double-click', async () => {
		const submitSpy = vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

		try {
			const { container } = render(Page, { data });
			const step = container.querySelector('.dot-step') as HTMLElement;
			step.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

			await expect.poll(() => submitSpy).toHaveBeenCalled();

			// Find the submitted form and check its fields.
			const form = submitSpy.mock.instances[0] as HTMLFormElement;
			expect(form.action).toContain('/lesson');
			expect(form.method.toLowerCase()).toBe('post');
			const inputs = form.querySelectorAll('input');
			const values: Record<string, string> = {};
			inputs.forEach((i) => (values[i.name] = i.value));
			expect(values.courseId).toBe('creativity');
			expect(values.lessonSlug).toBe('preparation');

			form.remove();
		} finally {
			submitSpy.mockRestore();
		}
	});
});
