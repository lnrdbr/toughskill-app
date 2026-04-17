import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import StoryBuilder from './StoryBuilder.svelte';

describe('StoryBuilder', () => {
	const defaultProps = {
		prompt: 'A city where everyone can hear thoughts.',
		instruction: 'Continue the story.',
		minWords: 5,
		maxWords: 50
	};

	let fetchSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		window.sessionStorage.clear();
		fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ evaluation: {} }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);
	});

	afterEach(() => {
		fetchSpy.mockRestore();
	});

	it('renders the scenario seed', async () => {
		render(StoryBuilder, defaultProps);

		await expect
			.element(page.getByText('A city where everyone can hear thoughts.'))
			.toBeVisible();
	});

	it('renders the instruction', async () => {
		render(StoryBuilder, defaultProps);

		await expect.element(page.getByText('Continue the story.')).toBeVisible();
	});

	it('disables submit when under minimum word count', async () => {
		render(StoryBuilder, defaultProps);

		const button = page.getByRole('button', { name: "I'm Done" });
		await expect.element(button).toBeDisabled();
	});

	it('enables submit when word count is within range', async () => {
		render(StoryBuilder, defaultProps);

		const textarea = page.getByPlaceholder('Start writing...');
		await textarea.fill('one two three four five six');

		const button = page.getByRole('button', { name: "I'm Done" });
		await expect.element(button).toBeEnabled();
	});

	it('shows word count indicator', async () => {
		render(StoryBuilder, defaultProps);

		await expect.element(page.getByText(/0 \/ 5–50 words/)).toBeVisible();
	});

	it('transitions to reflecting phase on finish', async () => {
		render(StoryBuilder, defaultProps);

		const textarea = page.getByPlaceholder('Start writing...');
		await textarea.fill('one two three four five six');

		const doneButton = page.getByRole('button', { name: "I'm Done" });
		await doneButton.click();

		await expect.element(page.getByText('words written')).toBeVisible();
	});

	describe('compact mode', () => {
		it('uses tighter default word range (30–80) when caller does not override', async () => {
			render(StoryBuilder, {
				prompt: 'x',
				instruction: 'y',
				compact: true
			});

			await expect.element(page.getByText(/0 \/ 30–80 words/)).toBeVisible();
		});

		it('submits directly without a reflection phase', async () => {
			const oncomplete = vi.fn();
			render(StoryBuilder, { ...defaultProps, compact: true, oncomplete });

			const textarea = page.getByPlaceholder('Start writing...');
			await textarea.fill('one two three four five six seven eight');
			await page.getByRole('button', { name: "I'm Done" }).click();

			await expect.poll(() => oncomplete.mock.calls.length).toBeGreaterThan(0);
			expect(fetchSpy).toHaveBeenCalledWith(
				'/api/exercises/story-builder',
				expect.objectContaining({ method: 'POST' })
			);
			const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
			expect(body.reflections).toEqual({ approach: '' });
		});

		it('respects explicit minWords/maxWords overrides in compact mode', async () => {
			render(StoryBuilder, {
				prompt: 'x',
				instruction: 'y',
				compact: true,
				minWords: 10,
				maxWords: 20
			});
			await expect.element(page.getByText(/0 \/ 10–20 words/)).toBeVisible();
		});
	});

	describe('photoDataUrl', () => {
		const tinyPng =
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgAAIAAAUAAeImBZsAAAAASUVORK5CYII=';

		it('renders a photo above the prompt when provided', async () => {
			const { container } = render(StoryBuilder, {
				...defaultProps,
				photoDataUrl: tinyPng
			});
			const img = container.querySelector('[data-testid="seed-photo"]') as HTMLImageElement;
			expect(img).not.toBeNull();
			expect(img.src).toBe(tinyPng);
		});

		it('does not render the photo element when no url is provided', async () => {
			const { container } = render(StoryBuilder, defaultProps);
			expect(container.querySelector('[data-testid="seed-photo"]')).toBeNull();
		});
	});
});
