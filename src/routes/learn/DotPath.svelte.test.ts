import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import DotPath from './DotPath.svelte';
import type { Lesson } from '$lib/types/course';

const lessons: Lesson[] = [
	{
		id: 'lesson-1',
		title: 'Preparation',
		slug: 'preparation',
		description: 'Warm up your creative muscles.',
		icon: 'mdi:dumbbell',
		modules: [
			{
				type: 'exercise',
				id: 'mod-1',
				title: 'Paperclip',
				componentId: 'DivergentThinking',
				estimatedMinutes: 5,
				config: {}
			},
			{
				type: 'exercise',
				id: 'mod-2',
				title: 'Brick',
				componentId: 'DivergentThinking',
				estimatedMinutes: 5,
				config: {}
			}
		],
		estimatedMinutes: 10
	},
	{
		id: 'lesson-2',
		title: 'Exploration',
		slug: 'exploration',
		description: 'Explore creative techniques.',
		icon: 'mdi:shape-outline',
		modules: [
			{
				type: 'exercise',
				id: 'mod-3',
				title: 'Brainstorm',
				componentId: 'DivergentThinking',
				estimatedMinutes: 5,
				config: {}
			}
		],
		estimatedMinutes: 5
	}
];

const lessonProgress = {
	preparation: { completed: 2, total: 2 },
	exploration: { completed: 0, total: 1 }
};

describe('DotPath', () => {
	it('renders a dot button for each lesson', async () => {
		render(DotPath, { lessons, lessonProgress });

		const buttons = page.getByRole('button');
		await expect.element(buttons.first()).toBeVisible();
		expect(await buttons.all()).toHaveLength(2);
	});

	it('fires onSelect with the clicked lesson', async () => {
		const onSelect = vi.fn();
		render(DotPath, { lessons, lessonProgress, onSelect });

		await page.getByRole('button').first().click();
		expect(onSelect).toHaveBeenCalledWith(lessons[0]);
	});

	it('fires onSelect with null when the same dot is clicked twice', async () => {
		const onSelect = vi.fn();
		render(DotPath, { lessons, lessonProgress, onSelect });

		await page.getByRole('button').first().click();
		await page.getByRole('button').first().click();

		expect(onSelect).toHaveBeenNthCalledWith(1, lessons[0]);
		expect(onSelect).toHaveBeenNthCalledWith(2, null);
	});

	it('fires onSelect with the new lesson when switching dots', async () => {
		const onSelect = vi.fn();
		render(DotPath, { lessons, lessonProgress, onSelect });

		const buttons = await page.getByRole('button').all();
		await buttons[0].click();
		await buttons[1].click();

		expect(onSelect).toHaveBeenNthCalledWith(2, lessons[1]);
	});

	it('does not render an inline lesson detail card', async () => {
		const { container } = render(DotPath, { lessons, lessonProgress });

		await page.getByRole('button').first().click();
		// LessonDetailCard used to render a heading + description inline — it should no longer exist.
		expect(container.querySelector('.detail-card')).toBeNull();
	});
});
