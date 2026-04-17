import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import DivergentThinking from './DivergentThinking.svelte';

describe('DivergentThinking', () => {
	let fetchSpy: ReturnType<typeof vi.spyOn>;
	let playSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		window.sessionStorage.clear();
		fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ evaluation: {}, communityIdeas: [] }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		playSpy = vi
			.spyOn(HTMLMediaElement.prototype, 'play')
			.mockImplementation(() => Promise.resolve());
	});

	afterEach(() => {
		fetchSpy.mockRestore();
		playSpy.mockRestore();
	});

	it('renders the instruction', async () => {
		render(DivergentThinking, {
			moduleId: 'dt-1',
			prompt: 'Brick',
			instruction: 'Uses for a brick?'
		});
		await expect.element(page.getByText('Uses for a brick?')).toBeVisible();
	});

	it('disables "I\'m Done" until at least one idea is added', async () => {
		render(DivergentThinking, { moduleId: 'dt-2' });
		const done = page.getByRole('button', { name: "I'm Done" });
		await expect.element(done).toBeDisabled();
	});

	describe('default (reflection) mode', () => {
		it('transitions to reflecting phase when finishing', async () => {
			render(DivergentThinking, { moduleId: 'dt-3', initialIdeas: ['bookmark'] });
			await page.getByRole('button', { name: "I'm Done" }).click();
			await expect.element(page.getByText('ideas generated')).toBeVisible();
		});
	});

	describe('compact mode', () => {
		it('skips the reflecting phase and submits immediately', async () => {
			const oncomplete = vi.fn();
			render(DivergentThinking, {
				moduleId: 'dt-4',
				compact: true,
				initialIdeas: ['bookmark', 'lock pick'],
				oncomplete
			});

			await page.getByRole('button', { name: "I'm Done" }).click();

			await expect.element(page.getByText('ideas submitted')).toBeVisible();
			await expect.poll(() => oncomplete.mock.calls.length).toBeGreaterThan(0);
		});

		it('still POSTs to the evaluation endpoint with empty reflections', async () => {
			const oncomplete = vi.fn();
			render(DivergentThinking, {
				moduleId: 'dt-5',
				compact: true,
				initialIdeas: ['a'],
				oncomplete
			});

			await page.getByRole('button', { name: "I'm Done" }).click();
			await expect.poll(() => fetchSpy.mock.calls.length).toBeGreaterThan(0);

			const call = fetchSpy.mock.calls[0];
			expect(call[0]).toBe('/api/exercises/divergent-thinking');
			const body = JSON.parse((call[1] as RequestInit).body as string);
			expect(body.reflections).toEqual({ surprisingIdea: '', patterns: '' });
			expect(body.ideas).toEqual(['a']);
		});
	});
});
