import { describe, it, expect } from 'vitest';
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
		modules: [
			{ type: 'exercise', id: 'mod-1', title: 'Paperclip', componentId: 'DivergentThinking', estimatedMinutes: 5, config: {} },
			{ type: 'exercise', id: 'mod-2', title: 'Brick', componentId: 'DivergentThinking', estimatedMinutes: 5, config: {} }
		],
		estimatedMinutes: 10
	},
	{
		id: 'lesson-2',
		title: 'Exploration',
		slug: 'exploration',
		description: 'Explore creative techniques.',
		modules: [
			{ type: 'exercise', id: 'mod-3', title: 'Brainstorm', componentId: 'DivergentThinking', estimatedMinutes: 5, config: {} }
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
		render(DotPath, { lessons, lessonProgress, courseId: 'creativity' });

		const buttons = page.getByRole('button');
		await expect.element(buttons.first()).toBeVisible();
		expect(await buttons.all()).toHaveLength(2);
	});

	it('shows detail card when a dot is clicked', async () => {
		render(DotPath, { lessons, lessonProgress, courseId: 'creativity' });

		await page.getByRole('button').first().click();
		await expect.element(page.getByRole('heading', { name: 'Preparation' })).toBeVisible();
		await expect.element(page.getByText('Warm up your creative muscles.')).toBeVisible();
		await expect.element(page.getByText('2 / 2 modules completed')).toBeVisible();
	});

	it('hides detail card when same dot is clicked again', async () => {
		render(DotPath, { lessons, lessonProgress, courseId: 'creativity' });

		await page.getByRole('button').first().click();
		await expect.element(page.getByText('Warm up your creative muscles.')).toBeVisible();

		await page.getByRole('button').first().click();
		await expect.element(page.getByText('Warm up your creative muscles.')).not.toBeInTheDocument();
	});

	it('shows correct button label based on status', async () => {
		render(DotPath, { lessons, lessonProgress, courseId: 'creativity' });

		// First lesson is completed
		await page.getByRole('button').first().click();
		await expect.element(page.getByText('Revise Lesson')).toBeVisible();
	});
});
