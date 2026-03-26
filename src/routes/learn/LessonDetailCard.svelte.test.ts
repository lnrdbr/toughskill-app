import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import LessonDetailCard from './LessonDetailCard.svelte';

const baseProps = {
	title: 'Preparation',
	description: 'Warm up your creative muscles.',
	completed: 0,
	total: 2,
	courseId: 'creativity',
	lessonSlug: 'preparation',
	status: 'not-started' as const
};

describe('LessonDetailCard', () => {
	it('renders title and description', async () => {
		render(LessonDetailCard, baseProps);

		await expect.element(page.getByText('Preparation')).toBeVisible();
		await expect.element(page.getByText('Warm up your creative muscles.')).toBeVisible();
	});

	it('shows module progress', async () => {
		render(LessonDetailCard, { ...baseProps, completed: 1, total: 3 });

		await expect.element(page.getByText('1 / 3 modules completed')).toBeVisible();
	});

	it('shows "Start Lesson" for not-started status', async () => {
		render(LessonDetailCard, baseProps);

		await expect.element(page.getByText('Start Lesson')).toBeVisible();
	});

	it('shows "Continue Lesson" for in-progress status', async () => {
		render(LessonDetailCard, { ...baseProps, status: 'in-progress', completed: 1 });

		await expect.element(page.getByText('Continue Lesson')).toBeVisible();
	});

	it('shows "Revise Lesson" for completed status', async () => {
		render(LessonDetailCard, { ...baseProps, status: 'completed', completed: 2 });

		await expect.element(page.getByText('Revise Lesson')).toBeVisible();
	});

	it('includes hidden form fields for courseId and lessonSlug', async () => {
		const { container } = render(LessonDetailCard, baseProps);

		const courseInput = container.querySelector('input[name="courseId"]') as HTMLInputElement;
		const slugInput = container.querySelector('input[name="lessonSlug"]') as HTMLInputElement;
		expect(courseInput.value).toBe('creativity');
		expect(slugInput.value).toBe('preparation');
	});
});
