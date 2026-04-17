import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import IntroBeat from './IntroBeat.svelte';

describe('IntroBeat', () => {
	let fetchSpy: ReturnType<typeof vi.spyOn>;
	let playSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		window.sessionStorage.clear();
		fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ id: 'sub-1' }), {
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

	it('renders the beat body and a continue button', async () => {
		const { container } = render(IntroBeat, {
			moduleId: 'mod-i',
			body: 'Creativity is not for artists. It is for you.'
		});

		const b = container.querySelector('[data-testid="intro-body"]') as HTMLElement;
		expect(b.textContent).toBe('Creativity is not for artists. It is for you.');
		expect(container.querySelector('[data-testid="intro-continue"]')).not.toBeNull();
	});

	it('POSTs acknowledged:true and fires oncomplete', async () => {
		const oncomplete = vi.fn();
		const { container } = render(IntroBeat, {
			moduleId: 'mod-i',
			body: 'x',
			courseId: 'creativity',
			lessonSlug: 'what-is-creativity',
			oncomplete
		});

		(container.querySelector('[data-testid="intro-continue"]') as HTMLButtonElement).click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();

		expect(fetchSpy).toHaveBeenCalledWith(
			'/api/submissions',
			expect.objectContaining({ method: 'POST' })
		);
		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body).toEqual({
			moduleId: 'mod-i',
			moduleType: 'intro',
			courseId: 'creativity',
			lessonSlug: 'what-is-creativity',
			payload: {
				acknowledged: true,
				timeSpentSeconds: expect.any(Number)
			}
		});

		const arg = oncomplete.mock.calls[0][0] as Record<string, unknown>;
		expect(arg.acknowledged).toBe(true);
	});

	it('does not POST in preview mode but still fires oncomplete', async () => {
		const oncomplete = vi.fn();
		const { container } = render(IntroBeat, {
			moduleId: 'mod-i',
			body: 'x',
			oncomplete
		});

		(container.querySelector('[data-testid="intro-continue"]') as HTMLButtonElement).click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('shows an error and does not complete when the request fails', async () => {
		fetchSpy.mockResolvedValueOnce(new Response('server err', { status: 500 }));
		const oncomplete = vi.fn();
		const { container } = render(IntroBeat, {
			moduleId: 'mod-i',
			body: 'x',
			courseId: 'creativity',
			lessonSlug: 'what-is-creativity',
			oncomplete
		});

		(container.querySelector('[data-testid="intro-continue"]') as HTMLButtonElement).click();

		await expect.poll(() => container.querySelector('[role="alert"]')).not.toBeNull();
		expect(oncomplete).not.toHaveBeenCalled();
	});
});
