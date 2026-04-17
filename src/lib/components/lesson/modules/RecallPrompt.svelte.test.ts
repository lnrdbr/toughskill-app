import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RecallPrompt from './RecallPrompt.svelte';

describe('RecallPrompt', () => {
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

	it('finish-quote: matches a normalized answer and celebrates', async () => {
		const oncomplete = vi.fn();
		const { container } = render(RecallPrompt, {
			moduleId: 'mod-r',
			prompt: 'Creativity is…',
			mode: 'finish-quote',
			expected: 'for everyone',
			courseId: 'creativity',
			lessonSlug: 'finish-the-quote',
			oncomplete
		});

		const input = container.querySelector(
			'[data-testid="recall-input"]'
		) as HTMLInputElement;
		input.value = '  For  EVERYONE!  ';
		input.dispatchEvent(new Event('input', { bubbles: true }));

		const submit = container.querySelector(
			'[data-testid="recall-submit"]'
		) as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		const feedback = container.querySelector('[data-testid="recall-feedback"]') as HTMLElement;
		expect(feedback.textContent).toContain('remembered');

		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body.moduleType).toBe('recall');
		expect(body.payload.mode).toBe('finish-quote');
		expect(body.payload.userAnswer).toBe('For  EVERYONE!');
		expect(body.payload.matched).toBe(true);
		expect(body.payload.expected).toBe('for everyone');

		const arg = oncomplete.mock.calls[0][0] as Record<string, unknown>;
		expect(arg.matched).toBe(true);
	});

	it('finish-quote: mismatch shows the expected answer (but still advances)', async () => {
		const oncomplete = vi.fn();
		const { container } = render(RecallPrompt, {
			moduleId: 'mod-r',
			prompt: 'Creativity is…',
			mode: 'finish-quote',
			expected: 'for everyone',
			courseId: 'creativity',
			lessonSlug: 'finish-the-quote',
			oncomplete
		});

		const input = container.querySelector(
			'[data-testid="recall-input"]'
		) as HTMLInputElement;
		input.value = 'something else entirely';
		input.dispatchEvent(new Event('input', { bubbles: true }));

		const submit = container.querySelector(
			'[data-testid="recall-submit"]'
		) as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		const feedback = container.querySelector('[data-testid="recall-feedback"]') as HTMLElement;
		expect(feedback.textContent).toContain('for everyone');

		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body.payload.matched).toBe(false);
	});

	it('open-recall: accepts any non-empty answer and reveals the hint if provided', async () => {
		const oncomplete = vi.fn();
		const { container } = render(RecallPrompt, {
			moduleId: 'mod-r',
			prompt: 'What do you remember about creativity?',
			mode: 'open-recall',
			expected: 'it was about noticing and combining.',
			courseId: 'creativity',
			lessonSlug: 'remember-what-is-creativity',
			oncomplete
		});

		const input = container.querySelector(
			'[data-testid="recall-input"]'
		) as HTMLTextAreaElement;
		input.value = 'something about seeing things differently';
		input.dispatchEvent(new Event('input', { bubbles: true }));

		const submit = container.querySelector(
			'[data-testid="recall-submit"]'
		) as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		const feedback = container.querySelector('[data-testid="recall-feedback"]') as HTMLElement;
		expect(feedback.textContent).toContain('it was about noticing');

		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body.payload.mode).toBe('open-recall');
		expect(body.payload.userAnswer).toBe('something about seeing things differently');
	});

	it('multi-check: lets user toggle options and submits the selection', async () => {
		const oncomplete = vi.fn();
		const { container } = render(RecallPrompt, {
			moduleId: 'mod-r',
			prompt: 'Which have you tried?',
			mode: 'multi-check',
			options: ['The paperclip test', 'Writing with one rule', 'Taking a new path'],
			courseId: 'creativity',
			lessonSlug: 'how-far-you-have-come',
			oncomplete
		});

		const buttons = container.querySelectorAll(
			'[data-testid="recall-option"]'
		) as NodeListOf<HTMLButtonElement>;
		expect(buttons.length).toBe(3);
		buttons[0].click();
		buttons[2].click();

		const submit = container.querySelector(
			'[data-testid="recall-submit"]'
		) as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body.payload).toEqual({
			mode: 'multi-check',
			selected: ['The paperclip test', 'Taking a new path']
		});
	});

	it('disables submit until there is input (all three modes)', async () => {
		const { container: c1 } = render(RecallPrompt, {
			moduleId: 'mod-fq',
			prompt: 'q',
			mode: 'finish-quote',
			expected: 'hi'
		});
		expect(
			(c1.querySelector('[data-testid="recall-submit"]') as HTMLButtonElement).disabled
		).toBe(true);

		const { container: c2 } = render(RecallPrompt, {
			moduleId: 'mod-or',
			prompt: 'q',
			mode: 'open-recall'
		});
		expect(
			(c2.querySelector('[data-testid="recall-submit"]') as HTMLButtonElement).disabled
		).toBe(true);

		const { container: c3 } = render(RecallPrompt, {
			moduleId: 'mod-mc',
			prompt: 'q',
			mode: 'multi-check',
			options: ['a', 'b']
		});
		expect(
			(c3.querySelector('[data-testid="recall-submit"]') as HTMLButtonElement).disabled
		).toBe(true);
	});

	it('does not POST when courseId/lessonSlug are missing (preview mode)', async () => {
		const oncomplete = vi.fn();
		const { container } = render(RecallPrompt, {
			moduleId: 'mod-r',
			prompt: 'Finish the quote',
			mode: 'finish-quote',
			expected: 'hi',
			oncomplete
		});

		const input = container.querySelector(
			'[data-testid="recall-input"]'
		) as HTMLInputElement;
		input.value = 'hi';
		input.dispatchEvent(new Event('input', { bubbles: true }));

		const submit = container.querySelector(
			'[data-testid="recall-submit"]'
		) as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('shows an error and does not complete when the request fails', async () => {
		fetchSpy.mockResolvedValueOnce(new Response('server err', { status: 500 }));
		const oncomplete = vi.fn();
		const { container } = render(RecallPrompt, {
			moduleId: 'mod-r',
			prompt: 'q',
			mode: 'finish-quote',
			expected: 'hi',
			courseId: 'creativity',
			lessonSlug: 'finish-the-quote',
			oncomplete
		});

		const input = container.querySelector(
			'[data-testid="recall-input"]'
		) as HTMLInputElement;
		input.value = 'hi';
		input.dispatchEvent(new Event('input', { bubbles: true }));

		const submit = container.querySelector(
			'[data-testid="recall-submit"]'
		) as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => container.querySelector('[role="alert"]')).not.toBeNull();
		expect(oncomplete).not.toHaveBeenCalled();
	});

	it('restores a text draft for finish-quote on mount', async () => {
		window.sessionStorage.setItem(
			'ts:recall:creativity:finish-the-quote:mod-r',
			JSON.stringify('saved answer')
		);

		const { container } = render(RecallPrompt, {
			moduleId: 'mod-r',
			prompt: 'q',
			mode: 'finish-quote',
			expected: 'hi',
			courseId: 'creativity',
			lessonSlug: 'finish-the-quote'
		});

		const input = container.querySelector(
			'[data-testid="recall-input"]'
		) as HTMLInputElement;
		expect(input.value).toBe('saved answer');
	});

	it('restores a multi-check draft on mount', async () => {
		window.sessionStorage.setItem(
			'ts:recall:creativity:how-far-you-have-come:mod-r',
			JSON.stringify(['a', 'c'])
		);

		const { container } = render(RecallPrompt, {
			moduleId: 'mod-r',
			prompt: 'Which?',
			mode: 'multi-check',
			options: ['a', 'b', 'c'],
			courseId: 'creativity',
			lessonSlug: 'how-far-you-have-come'
		});

		const buttons = container.querySelectorAll(
			'[data-testid="recall-option"]'
		) as NodeListOf<HTMLButtonElement>;
		expect(buttons[0].getAttribute('aria-checked')).toBe('true');
		expect(buttons[1].getAttribute('aria-checked')).toBe('false');
		expect(buttons[2].getAttribute('aria-checked')).toBe('true');
	});

	it('clears the draft after a successful submission', async () => {
		const key = 'ts:recall:creativity:finish-the-quote:mod-r';
		const oncomplete = vi.fn();
		const { container } = render(RecallPrompt, {
			moduleId: 'mod-r',
			prompt: 'q',
			mode: 'finish-quote',
			expected: 'hi',
			courseId: 'creativity',
			lessonSlug: 'finish-the-quote',
			oncomplete
		});

		const input = container.querySelector(
			'[data-testid="recall-input"]'
		) as HTMLInputElement;
		input.value = 'hi';
		input.dispatchEvent(new Event('input', { bubbles: true }));

		await expect.poll(() => window.sessionStorage.getItem(key)).not.toBeNull();

		const submit = container.querySelector(
			'[data-testid="recall-submit"]'
		) as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		expect(window.sessionStorage.getItem(key)).toBeNull();
	});
});
