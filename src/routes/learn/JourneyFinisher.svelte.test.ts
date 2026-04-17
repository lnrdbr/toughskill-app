import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import JourneyFinisher from './JourneyFinisher.svelte';

const baseStats = {
	completedLessons: 0,
	totalLessons: 30,
	totalPracticeSeconds: 0,
	realLifeTasksCompleted: 0,
	allDone: false
};

describe('JourneyFinisher', () => {
	it('renders the locked state when the journey is not finished', () => {
		const { container } = render(JourneyFinisher, {
			stats: baseStats,
			courseTitle: 'Creativity'
		});

		const finisher = container.querySelector('.finisher') as HTMLElement;
		expect(finisher.classList.contains('locked')).toBe(true);
		expect(container.querySelector('.headline')?.textContent).toContain('Keep going');
	});

	it('renders the celebration state once every lesson is complete', () => {
		const { container } = render(JourneyFinisher, {
			stats: {
				completedLessons: 30,
				totalLessons: 30,
				totalPracticeSeconds: 1800,
				realLifeTasksCompleted: 7,
				allDone: true
			},
			courseTitle: 'Creativity'
		});

		const finisher = container.querySelector('.finisher') as HTMLElement;
		expect(finisher.classList.contains('locked')).toBe(false);
		expect(container.querySelector('.headline')?.textContent).toBe('You finished Creativity.');
	});

	it('shows the three stat tiles with formatted values', () => {
		const { container } = render(JourneyFinisher, {
			stats: {
				completedLessons: 12,
				totalLessons: 30,
				totalPracticeSeconds: 125,
				realLifeTasksCompleted: 3,
				allDone: false
			},
			courseTitle: 'Creativity'
		});

		const values = Array.from(container.querySelectorAll('.stat-value')).map(
			(el) => el.textContent?.trim()
		);
		expect(values).toEqual(['12 / 30', '2 min', '3']);
	});
});
