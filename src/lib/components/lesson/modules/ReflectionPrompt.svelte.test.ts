import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ReflectionPrompt from './ReflectionPrompt.svelte';

describe('ReflectionPrompt', () => {
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
		// The shared Button plays a click sound; silence it in tests to avoid unhandled rejections.
		playSpy = vi
			.spyOn(HTMLMediaElement.prototype, 'play')
			.mockImplementation(() => Promise.resolve());
	});

	afterEach(() => {
		fetchSpy.mockRestore();
		playSpy.mockRestore();
	});

	it('renders the prompt and an empty textarea', async () => {
		const { container } = render(ReflectionPrompt, {
			moduleId: 'mod-1',
			prompt: 'What does creativity mean to you?'
		});

		expect(container.querySelector('.prompt')!.textContent).toBe(
			'What does creativity mean to you?'
		);
		const area = container.querySelector('[data-testid="reflection-input"]') as HTMLTextAreaElement;
		expect(area.value).toBe('');
	});

	it('disables the submit button when text is empty', async () => {
		const { container } = render(ReflectionPrompt, {
			moduleId: 'mod-1',
			prompt: 'Write something'
		});

		const btn = container.querySelector('[data-testid="reflection-submit"]') as HTMLButtonElement;
		expect(btn.disabled).toBe(true);
	});

	it('enables submit once minLength is met and shows char counter', async () => {
		const { container } = render(ReflectionPrompt, {
			moduleId: 'mod-1',
			prompt: 'Write something',
			minLength: 10
		});

		const area = container.querySelector('[data-testid="reflection-input"]') as HTMLTextAreaElement;
		area.value = 'too short';
		area.dispatchEvent(new Event('input', { bubbles: true }));

		const btn = container.querySelector('[data-testid="reflection-submit"]') as HTMLButtonElement;
		await expect.poll(() => btn.disabled).toBe(true);

		area.value = 'long enough text here';
		area.dispatchEvent(new Event('input', { bubbles: true }));

		await expect.poll(() => btn.disabled).toBe(false);
		const count = container.querySelector('[data-testid="char-count"]') as HTMLElement;
		expect(count.textContent).toContain('21 / 10');
	});

	it('submits text, calls /api/submissions, and fires oncomplete with the text', async () => {
		const oncomplete = vi.fn();
		const { container } = render(ReflectionPrompt, {
			moduleId: 'mod-r',
			prompt: 'Reflect',
			courseId: 'creativity',
			lessonSlug: 'preparation',
			oncomplete
		});

		const area = container.querySelector('[data-testid="reflection-input"]') as HTMLTextAreaElement;
		area.value = '  this is my reflection  ';
		area.dispatchEvent(new Event('input', { bubbles: true }));

		const btn = container.querySelector('[data-testid="reflection-submit"]') as HTMLButtonElement;
		await expect.poll(() => btn.disabled).toBe(false);
		btn.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();

		expect(fetchSpy).toHaveBeenCalledWith(
			'/api/submissions',
			expect.objectContaining({ method: 'POST' })
		);
		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body).toEqual({
			moduleId: 'mod-r',
			moduleType: 'reflection',
			courseId: 'creativity',
			lessonSlug: 'preparation',
			payload: { text: 'this is my reflection' }
		});

		const completionArg = oncomplete.mock.calls[0][0] as Record<string, unknown>;
		expect(completionArg.text).toBe('this is my reflection');
		expect(completionArg.charCount).toBe('this is my reflection'.length);
	});

	it('does not POST when courseId/lessonSlug are missing (preview mode)', async () => {
		const oncomplete = vi.fn();
		const { container } = render(ReflectionPrompt, {
			moduleId: 'mod-r',
			prompt: 'Reflect',
			oncomplete
		});

		const area = container.querySelector('[data-testid="reflection-input"]') as HTMLTextAreaElement;
		area.value = 'hello';
		area.dispatchEvent(new Event('input', { bubbles: true }));

		const btn = container.querySelector('[data-testid="reflection-submit"]') as HTMLButtonElement;
		await expect.poll(() => btn.disabled).toBe(false);
		btn.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('shows an error and does not complete when the request fails', async () => {
		fetchSpy.mockResolvedValueOnce(new Response('server err', { status: 500 }));
		const oncomplete = vi.fn();
		const { container } = render(ReflectionPrompt, {
			moduleId: 'mod-r',
			prompt: 'Reflect',
			courseId: 'creativity',
			lessonSlug: 'preparation',
			oncomplete
		});

		const area = container.querySelector('[data-testid="reflection-input"]') as HTMLTextAreaElement;
		area.value = 'some reflection';
		area.dispatchEvent(new Event('input', { bubbles: true }));

		const btn = container.querySelector('[data-testid="reflection-submit"]') as HTMLButtonElement;
		await expect.poll(() => btn.disabled).toBe(false);
		btn.click();

		await expect.poll(() => container.querySelector('[role="alert"]')).not.toBeNull();
		expect(oncomplete).not.toHaveBeenCalled();
	});

	it('restores the draft from sessionStorage on mount', async () => {
		window.sessionStorage.setItem(
			'ts:reflection:creativity:preparation:mod-r',
			JSON.stringify('saved draft text')
		);

		const { container } = render(ReflectionPrompt, {
			moduleId: 'mod-r',
			prompt: 'Reflect',
			courseId: 'creativity',
			lessonSlug: 'preparation'
		});

		const area = container.querySelector('[data-testid="reflection-input"]') as HTMLTextAreaElement;
		expect(area.value).toBe('saved draft text');
	});

	it('clears the draft after a successful submission', async () => {
		const key = 'ts:reflection:creativity:preparation:mod-r';
		const oncomplete = vi.fn();
		const { container } = render(ReflectionPrompt, {
			moduleId: 'mod-r',
			prompt: 'Reflect',
			courseId: 'creativity',
			lessonSlug: 'preparation',
			oncomplete
		});

		const area = container.querySelector('[data-testid="reflection-input"]') as HTMLTextAreaElement;
		area.value = 'final text';
		area.dispatchEvent(new Event('input', { bubbles: true }));

		// The effect writes to the draft on change.
		await expect.poll(() => window.sessionStorage.getItem(key)).not.toBeNull();

		const btn = container.querySelector('[data-testid="reflection-submit"]') as HTMLButtonElement;
		await expect.poll(() => btn.disabled).toBe(false);
		btn.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		expect(window.sessionStorage.getItem(key)).toBeNull();
	});
});
