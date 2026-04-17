import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProgressPanel from './ProgressPanel.svelte';
import type { Lesson } from '$lib/types/course';

const lesson: Lesson = {
	id: 'l-1',
	title: 'Preparation',
	slug: 'preparation',
	description: 'Warm up your creative muscles.',
	icon: 'mdi:dumbbell',
	estimatedMinutes: 10,
	modules: [
		{
			type: 'exercise',
			id: 'm-1',
			title: 'Paperclip',
			componentId: 'DivergentThinking',
			estimatedMinutes: 5,
			config: {}
		},
		{
			type: 'exercise',
			id: 'm-2',
			title: 'Brick',
			componentId: 'DivergentThinking',
			estimatedMinutes: 5,
			config: {}
		}
	]
};

describe('ProgressPanel (idle view)', () => {
	it('renders 0% when there is no progress data', async () => {
		const { container } = render(ProgressPanel, { lessonProgress: {} });

		const percent = container.querySelector('.percent');
		expect(percent).not.toBeNull();
		expect(percent!.textContent).toBe('0%');
	});

	it('computes overall percent across lessons', async () => {
		const { container } = render(ProgressPanel, {
			lessonProgress: {
				a: { completed: 2, total: 4 },
				b: { completed: 3, total: 6 }
			}
		});

		expect(container.querySelector('.percent')!.textContent).toBe('50%');
	});

	it('renders cloud and praise by default', async () => {
		const { container } = render(ProgressPanel, {
			lessonProgress: {},
			praise: 'You are doing great!'
		});

		expect(container.querySelector('[data-testid="cloud"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="praise"]')!.textContent).toContain(
			'You are doing great!'
		);
	});

	it('rotates the cloud when the scroll container scrolls', async () => {
		const scroller = document.createElement('div');
		scroller.className = 'content';
		document.body.appendChild(scroller);

		const { container } = render(ProgressPanel, { lessonProgress: {} });

		try {
			const cloud = container.querySelector('[data-testid="cloud"]') as HTMLElement;
			expect(cloud.style.transform).toContain('rotate(0deg)');

			Object.defineProperty(scroller, 'scrollTop', { value: 100, configurable: true });
			scroller.dispatchEvent(new Event('scroll', { bubbles: true }));

			await expect.poll(() => cloud.style.transform).toContain('rotate(40deg)');
		} finally {
			scroller.remove();
		}
	});

	it('has no background/box styling on the panel', async () => {
		const { container } = render(ProgressPanel, { lessonProgress: {} });
		const panel = container.querySelector('.panel') as HTMLElement;
		const bg = getComputedStyle(panel).backgroundColor;
		// "transparent" or rgba(…, 0) — anything without a solid fill.
		expect(bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent').toBe(true);
	});

	it('renders "Start exercise" CTA when no lesson has been started', async () => {
		const { container } = render(ProgressPanel, {
			lessons: [lesson],
			lessonProgress: { preparation: { completed: 0, total: 2, started: false } },
			courseId: 'creativity'
		});

		const form = container.querySelector('[data-testid="idle-cta-form"]') as HTMLFormElement;
		expect(form).not.toBeNull();
		expect(form.textContent).toContain('Start exercise');
		expect((form.querySelector('input[name="courseId"]') as HTMLInputElement).value).toBe(
			'creativity'
		);
		expect((form.querySelector('input[name="lessonSlug"]') as HTMLInputElement).value).toBe(
			'preparation'
		);
	});

	it('renders "Continue where you left off" CTA when a lesson is in progress', async () => {
		const { container } = render(ProgressPanel, {
			lessons: [lesson],
			lessonProgress: { preparation: { completed: 1, total: 2, started: true } },
			courseId: 'creativity'
		});

		const form = container.querySelector('[data-testid="idle-cta-form"]') as HTMLFormElement;
		expect(form).not.toBeNull();
		expect(form.textContent).toContain('Continue where you left off');
		// Points at the first not-completed lesson (still "preparation" here).
		expect((form.querySelector('input[name="lessonSlug"]') as HTMLInputElement).value).toBe(
			'preparation'
		);
	});

	it('omits the CTA when every lesson is complete', async () => {
		const { container } = render(ProgressPanel, {
			lessons: [lesson],
			lessonProgress: { preparation: { completed: 2, total: 2, started: true } },
			courseId: 'creativity'
		});

		expect(container.querySelector('[data-testid="idle-cta-form"]')).toBeNull();
	});
});

describe('ProgressPanel (lesson view)', () => {
	it('replaces the idle view when a lesson is selected', async () => {
		const { container } = render(ProgressPanel, {
			lessonProgress: { preparation: { completed: 1, total: 2 } },
			selectedLesson: lesson,
			courseId: 'creativity'
		});

		expect(container.querySelector('[data-testid="lesson-view"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="idle-view"]')).toBeNull();
	});

	it('shows lesson title, description, and linear progress bar', async () => {
		const { container } = render(ProgressPanel, {
			lessonProgress: { preparation: { completed: 1, total: 2 } },
			selectedLesson: lesson,
			courseId: 'creativity'
		});

		expect(container.querySelector('.lesson-title')!.textContent).toBe('Preparation');
		expect(container.querySelector('.lesson-description')!.textContent).toContain(
			'Warm up your creative muscles.'
		);

		const bar = container.querySelector('[role="progressbar"]') as HTMLElement;
		expect(bar.getAttribute('aria-valuenow')).toBe('50');
		const fill = container.querySelector('.progress-fill') as HTMLElement;
		// Fill animates from 0% to the target on mount.
		await expect.poll(() => fill.style.width).toBe('50%');
	});

	it('renders "Start lesson" for not-started and includes form fields', async () => {
		const { container } = render(ProgressPanel, {
			lessonProgress: { preparation: { completed: 0, total: 2 } },
			selectedLesson: lesson,
			courseId: 'creativity'
		});

		expect(container.textContent).toContain('Start lesson');
		expect((container.querySelector('input[name="courseId"]') as HTMLInputElement).value).toBe(
			'creativity'
		);
		expect((container.querySelector('input[name="lessonSlug"]') as HTMLInputElement).value).toBe(
			'preparation'
		);
	});

	it('renders "Continue lesson" when in progress', async () => {
		const { container } = render(ProgressPanel, {
			lessonProgress: { preparation: { completed: 1, total: 2 } },
			selectedLesson: lesson,
			courseId: 'creativity'
		});

		expect(container.textContent).toContain('Continue lesson');
	});

	it('renders "Revise lesson" when completed', async () => {
		const { container } = render(ProgressPanel, {
			lessonProgress: { preparation: { completed: 2, total: 2 } },
			selectedLesson: lesson,
			courseId: 'creativity'
		});

		expect(container.textContent).toContain('Revise lesson');
	});
});
