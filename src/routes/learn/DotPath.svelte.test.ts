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

	it('does not fire onSelect again when clicking the already-selected dot', async () => {
		const onSelect = vi.fn();
		render(DotPath, {
			lessons,
			lessonProgress,
			selectedSlug: 'preparation',
			onSelect
		});

		await page.getByRole('button').first().click();
		expect(onSelect).not.toHaveBeenCalled();
	});

	it('fires onSelect when switching dots', async () => {
		const onSelect = vi.fn();
		const { container } = render(DotPath, {
			lessons,
			lessonProgress,
			selectedSlug: 'preparation',
			onSelect
		});

		const buttons = container.querySelectorAll('button');
		buttons[1].click();
		expect(onSelect).toHaveBeenCalledWith(lessons[1]);
	});

	it('fires onStart on double-click', async () => {
		const onStart = vi.fn();
		const { container } = render(DotPath, { lessons, lessonProgress, onStart });

		// Dispatch a native dblclick on the dot-step wrapper to exercise the handler.
		const step = container.querySelector('.dot-step') as HTMLElement;
		step.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

		expect(onStart).toHaveBeenCalledWith(lessons[0]);
	});

	it('does not render an inline lesson detail card', async () => {
		const { container } = render(DotPath, { lessons, lessonProgress });

		await page.getByRole('button').first().click();
		expect(container.querySelector('.detail-card')).toBeNull();
	});

	it('marks a lesson as in-progress when started but with zero completed modules', () => {
		const progressWithStarted = {
			preparation: { completed: 0, total: 2, started: true },
			exploration: { completed: 0, total: 1, started: false }
		};
		const { container } = render(DotPath, {
			lessons,
			lessonProgress: progressWithStarted
		});

		const buttons = container.querySelectorAll('button.dot-button');
		expect(buttons[0].classList.contains('in-progress')).toBe(true);
		expect(buttons[1].classList.contains('not-started')).toBe(true);
	});

	it('still marks completed lessons as completed even when started is true', () => {
		const progress = {
			preparation: { completed: 2, total: 2, started: true },
			exploration: { completed: 0, total: 1 }
		};
		const { container } = render(DotPath, { lessons, lessonProgress: progress });

		const buttons = container.querySelectorAll('button.dot-button');
		expect(buttons[0].classList.contains('completed')).toBe(true);
	});

	it('renders a sticky act heading for each act', () => {
		const { container } = render(DotPath, {
			lessons,
			lessonProgress,
			acts: [
				{ title: 'Awakening', startLessonSlug: 'preparation' },
				{ title: 'Unblocking', startLessonSlug: 'exploration' }
			]
		});

		const headings = container.querySelectorAll('[data-testid="act-heading"]');
		expect(headings).toHaveLength(2);
		expect(headings[0].textContent).toContain('Awakening');
		expect(headings[1].textContent).toContain('Unblocking');
		expect(getComputedStyle(headings[0] as HTMLElement).position).toBe('sticky');
	});

	it('renders no act headings when acts prop is omitted', () => {
		const { container } = render(DotPath, { lessons, lessonProgress });

		expect(container.querySelectorAll('[data-testid="act-heading"]')).toHaveLength(0);
	});

	it('groups lessons into per-act sections so headers pin within their own section', () => {
		const { container } = render(DotPath, {
			lessons,
			lessonProgress,
			acts: [
				{ title: 'Awakening', startLessonSlug: 'preparation' },
				{ title: 'Unblocking', startLessonSlug: 'exploration' }
			]
		});

		const sections = container.querySelectorAll('[data-testid="act-section"]');
		expect(sections).toHaveLength(2);
		// Each section owns only its own act's lesson labels.
		expect(sections[0].querySelectorAll('.dot-label')).toHaveLength(1);
		expect(sections[0].querySelector('.dot-label')!.textContent).toBe('Preparation');
		expect(sections[1].querySelectorAll('.dot-label')).toHaveLength(1);
		expect(sections[1].querySelector('.dot-label')!.textContent).toBe('Exploration');
	});

	it('applies the stickyTop prop as the sticky offset on each heading', () => {
		const { container } = render(DotPath, {
			lessons,
			lessonProgress,
			acts: [{ title: 'Awakening', startLessonSlug: 'preparation' }],
			stickyTop: '8rem'
		});

		const heading = container.querySelector('[data-testid="act-heading"]') as HTMLElement;
		expect(heading.style.top).toBe('8rem');
	});
});
