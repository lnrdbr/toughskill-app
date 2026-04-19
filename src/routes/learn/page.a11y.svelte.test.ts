import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { expectNoA11yViolations } from '$lib/test-utils/axe';

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

/**
 * Route-level a11y: the learn page has two visually distinct states (idle
 * vs. a lesson selected) so both tree shapes are scanned.
 */
describe('/learn — learn page a11y', () => {
	it('renders clean in the idle state (no lesson selected)', async () => {
		render(Page, { data });
		await expectNoA11yViolations();
	});

	it('renders clean with a lesson selected', async () => {
		const { container } = render(Page, { data });
		const dot = container.querySelector('.dot-path button') as HTMLButtonElement;
		dot.click();
		// Give the selection render a tick before scanning.
		await new Promise((r) => requestAnimationFrame(() => r(null)));
		await expectNoA11yViolations();
	});
});
