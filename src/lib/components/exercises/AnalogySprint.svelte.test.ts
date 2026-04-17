import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import AnalogySprint from './AnalogySprint.svelte';

describe('AnalogySprint', () => {
	const defaultProps = {
		concept: 'Software testing',
		domains: ['cooking', 'nature', 'sports'],
		instruction: 'Complete the analogies.',
		timerDuration: 0
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

	it('renders the concept', async () => {
		render(AnalogySprint, defaultProps);

		await expect.element(page.getByText('Create analogies for:')).toBeVisible();
		await expect.element(page.getByText('Software testing').first()).toBeVisible();
	});

	it('renders all domain cards', async () => {
		render(AnalogySprint, defaultProps);

		await expect.element(page.getByText('cooking')).toBeVisible();
		await expect.element(page.getByText('nature')).toBeVisible();
		await expect.element(page.getByText('sports')).toBeVisible();
	});

	it('shows domain count', async () => {
		render(AnalogySprint, defaultProps);

		await expect.element(page.getByText('0 / 3 domains')).toBeVisible();
	});

	it('disables submit when no analogies filled', async () => {
		render(AnalogySprint, defaultProps);

		const button = page.getByRole('button', { name: "I'm Done" });
		await expect.element(button).toBeDisabled();
	});

	it('renders analogy prefix text for each domain', async () => {
		render(AnalogySprint, defaultProps);

		const prefixes = page.getByText('Software testing is like');
		await expect.element(prefixes.first()).toBeVisible();
	});

	describe('compact mode', () => {
		it('renders only the first domain', async () => {
			render(AnalogySprint, { ...defaultProps, compact: true });

			await expect.element(page.getByText('cooking')).toBeVisible();
			await expect.element(page.getByText('0 / 1 domains')).toBeVisible();
		});

		it('submits directly without a reflection phase', async () => {
			const oncomplete = vi.fn();
			render(AnalogySprint, { ...defaultProps, compact: true, oncomplete });

			const likeInput = page.getByPlaceholder('...').first();
			await likeInput.fill('a recipe');
			const becauseInput = page.getByPlaceholder('...').nth(1);
			await becauseInput.fill('both need steps');

			await page.getByRole('button', { name: "I'm Done" }).click();

			await expect.poll(() => oncomplete.mock.calls.length).toBeGreaterThan(0);
			expect(fetchSpy).toHaveBeenCalledWith(
				'/api/exercises/analogy-sprint',
				expect.objectContaining({ method: 'POST' })
			);
			const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
			expect(Object.keys(body.analogies)).toEqual(['cooking']);
			expect(body.reflections).toEqual({ surprising: '' });
		});
	});
});
