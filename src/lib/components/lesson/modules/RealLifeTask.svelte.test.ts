import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RealLifeTask from './RealLifeTask.svelte';

describe('RealLifeTask', () => {
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

	it('renders the idle state with the instruction and a start button', async () => {
		const { container } = render(RealLifeTask, {
			moduleId: 'mod-t',
			instruction: 'Walk a new route home and notice one thing.',
			feedbackPrompt: 'What did you notice?'
		});

		const inst = container.querySelector('[data-testid="task-instruction"]') as HTMLElement;
		expect(inst.textContent).toContain('Walk a new route');
		const btn = container.querySelector('[data-testid="task-start"]') as HTMLButtonElement;
		expect(btn).not.toBeNull();
	});

	it('POSTs a started submission and transitions to assigned on Start', async () => {
		const { container } = render(RealLifeTask, {
			moduleId: 'mod-t',
			instruction: 'Walk a new route',
			feedbackPrompt: 'How was it?',
			courseId: 'creativity',
			lessonSlug: 'take-a-new-path'
		});

		(container.querySelector('[data-testid="task-start"]') as HTMLButtonElement).click();

		await expect
			.poll(() => container.querySelector('[data-testid="task-done"]'))
			.not.toBeNull();

		expect(fetchSpy).toHaveBeenCalledTimes(1);
		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body).toEqual({
			moduleId: 'mod-t',
			moduleType: 'real_life_task',
			courseId: 'creativity',
			lessonSlug: 'take-a-new-path',
			payload: { state: 'started' }
		});

		// Draft was written so a reload restores the assigned state.
		const draftRaw = window.sessionStorage.getItem(
			'ts:real_life_task:creativity:take-a-new-path:mod-t'
		);
		expect(draftRaw).not.toBeNull();
		expect(JSON.parse(draftRaw!)).toHaveProperty('startedAt');
	});

	it('shows an error and stays on idle when the started POST fails', async () => {
		fetchSpy.mockResolvedValueOnce(new Response('server err', { status: 500 }));
		const { container } = render(RealLifeTask, {
			moduleId: 'mod-t',
			instruction: 'Walk a new route',
			feedbackPrompt: 'How was it?',
			courseId: 'creativity',
			lessonSlug: 'take-a-new-path'
		});

		(container.querySelector('[data-testid="task-start"]') as HTMLButtonElement).click();

		await expect.poll(() => container.querySelector('[role="alert"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="task-done"]')).toBeNull();
		expect(container.querySelector('[data-testid="task-start"]')).not.toBeNull();
	});

	it('restores the assigned state from draft on mount', async () => {
		window.sessionStorage.setItem(
			'ts:real_life_task:creativity:take-a-new-path:mod-t',
			JSON.stringify({ startedAt: Date.now() - 60_000 })
		);

		const { container } = render(RealLifeTask, {
			moduleId: 'mod-t',
			instruction: 'Walk a new route',
			feedbackPrompt: 'How was it?',
			courseId: 'creativity',
			lessonSlug: 'take-a-new-path'
		});

		const doneBtn = container.querySelector(
			'[data-testid="task-done"]'
		) as HTMLButtonElement;
		expect(doneBtn).not.toBeNull();
		// Start button should not be visible.
		expect(container.querySelector('[data-testid="task-start"]')).toBeNull();
	});

	it('opens the feedback form when "I have done it" is clicked', async () => {
		window.sessionStorage.setItem(
			'ts:real_life_task:creativity:take-a-new-path:mod-t',
			JSON.stringify({ startedAt: Date.now() - 30_000 })
		);

		const { container } = render(RealLifeTask, {
			moduleId: 'mod-t',
			instruction: 'Walk a new route',
			feedbackPrompt: 'What did you notice?',
			courseId: 'creativity',
			lessonSlug: 'take-a-new-path'
		});

		(container.querySelector('[data-testid="task-done"]') as HTMLButtonElement).click();

		await expect
			.poll(() => container.querySelector('[data-testid="task-feedback"]'))
			.not.toBeNull();
		const prompt = container.querySelector('.prompt') as HTMLElement;
		expect(prompt.textContent).toContain('What did you notice?');
	});

	it('submits completed + feedback, clears the draft, and fires oncomplete', async () => {
		const key = 'ts:real_life_task:creativity:take-a-new-path:mod-t';
		window.sessionStorage.setItem(
			key,
			JSON.stringify({ startedAt: Date.now() - 30_000 })
		);
		const oncomplete = vi.fn();

		const { container } = render(RealLifeTask, {
			moduleId: 'mod-t',
			instruction: 'Walk a new route',
			feedbackPrompt: 'What did you notice?',
			courseId: 'creativity',
			lessonSlug: 'take-a-new-path',
			oncomplete
		});

		(container.querySelector('[data-testid="task-done"]') as HTMLButtonElement).click();
		await expect
			.poll(() => container.querySelector('[data-testid="task-feedback"]'))
			.not.toBeNull();

		const area = container.querySelector(
			'[data-testid="task-feedback"]'
		) as HTMLTextAreaElement;
		area.value = '  it was refreshing  ';
		area.dispatchEvent(new Event('input', { bubbles: true }));

		const submit = container.querySelector(
			'[data-testid="task-submit"]'
		) as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();

		// Two fetches now fire on completion: the submission POST and the
		// background LLM feedback POST. Submission goes first.
		expect(fetchSpy).toHaveBeenCalledTimes(2);
		expect(fetchSpy.mock.calls[0][0]).toBe('/api/submissions');
		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body.moduleId).toBe('mod-t');
		expect(body.moduleType).toBe('real_life_task');
		expect(body.payload.state).toBe('completed');
		expect(body.payload.feedback).toBe('it was refreshing');
		expect(typeof body.payload.timeSpentSeconds).toBe('number');
		expect(fetchSpy.mock.calls[1][0]).toBe('/api/feedback/real-life-task');

		// Draft cleared after successful submission.
		expect(window.sessionStorage.getItem(key)).toBeNull();

		const arg = oncomplete.mock.calls[0][0] as Record<string, unknown>;
		expect(arg.feedback).toBe('it was refreshing');
		expect(arg.charCount).toBe('it was refreshing'.length);
	});

	it('disables submit until feedback has content', async () => {
		window.sessionStorage.setItem(
			'ts:real_life_task:creativity:take-a-new-path:mod-t',
			JSON.stringify({ startedAt: Date.now() })
		);
		const { container } = render(RealLifeTask, {
			moduleId: 'mod-t',
			instruction: 'x',
			feedbackPrompt: 'y',
			courseId: 'creativity',
			lessonSlug: 'take-a-new-path'
		});

		(container.querySelector('[data-testid="task-done"]') as HTMLButtonElement).click();
		await expect
			.poll(() => container.querySelector('[data-testid="task-submit"]'))
			.not.toBeNull();

		const submit = container.querySelector(
			'[data-testid="task-submit"]'
		) as HTMLButtonElement;
		expect(submit.disabled).toBe(true);

		const area = container.querySelector(
			'[data-testid="task-feedback"]'
		) as HTMLTextAreaElement;
		area.value = '   '; // only whitespace
		area.dispatchEvent(new Event('input', { bubbles: true }));
		await expect.poll(() => submit.disabled).toBe(true);

		area.value = 'something';
		area.dispatchEvent(new Event('input', { bubbles: true }));
		await expect.poll(() => submit.disabled).toBe(false);
	});

	it('preview mode (no courseId/lessonSlug) skips both POSTs but still flows', async () => {
		const oncomplete = vi.fn();
		const { container } = render(RealLifeTask, {
			moduleId: 'mod-t',
			instruction: 'Walk a new route',
			feedbackPrompt: 'How was it?',
			oncomplete
		});

		(container.querySelector('[data-testid="task-start"]') as HTMLButtonElement).click();
		await expect
			.poll(() => container.querySelector('[data-testid="task-done"]'))
			.not.toBeNull();
		(container.querySelector('[data-testid="task-done"]') as HTMLButtonElement).click();
		await expect
			.poll(() => container.querySelector('[data-testid="task-feedback"]'))
			.not.toBeNull();

		const area = container.querySelector(
			'[data-testid="task-feedback"]'
		) as HTMLTextAreaElement;
		area.value = 'preview feedback';
		area.dispatchEvent(new Event('input', { bubbles: true }));

		const submit = container.querySelector(
			'[data-testid="task-submit"]'
		) as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('cancel from assigned returns to idle and clears the draft', async () => {
		const key = 'ts:real_life_task:creativity:take-a-new-path:mod-t';
		window.sessionStorage.setItem(key, JSON.stringify({ startedAt: Date.now() }));

		const { container } = render(RealLifeTask, {
			moduleId: 'mod-t',
			instruction: 'Walk a new route',
			feedbackPrompt: 'How was it?',
			courseId: 'creativity',
			lessonSlug: 'take-a-new-path'
		});

		(container.querySelector('[data-testid="task-cancel"]') as HTMLButtonElement).click();

		await expect
			.poll(() => container.querySelector('[data-testid="task-start"]'))
			.not.toBeNull();
		expect(window.sessionStorage.getItem(key)).toBeNull();
		// No POST should have been sent for a cancellation.
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('shows an error and does not complete when the completed POST fails', async () => {
		window.sessionStorage.setItem(
			'ts:real_life_task:creativity:take-a-new-path:mod-t',
			JSON.stringify({ startedAt: Date.now() - 30_000 })
		);
		fetchSpy.mockResolvedValueOnce(new Response('server err', { status: 500 }));

		const oncomplete = vi.fn();
		const { container } = render(RealLifeTask, {
			moduleId: 'mod-t',
			instruction: 'Walk a new route',
			feedbackPrompt: 'How was it?',
			courseId: 'creativity',
			lessonSlug: 'take-a-new-path',
			oncomplete
		});

		(container.querySelector('[data-testid="task-done"]') as HTMLButtonElement).click();
		await expect
			.poll(() => container.querySelector('[data-testid="task-feedback"]'))
			.not.toBeNull();

		const area = container.querySelector(
			'[data-testid="task-feedback"]'
		) as HTMLTextAreaElement;
		area.value = 'attempt feedback';
		area.dispatchEvent(new Event('input', { bubbles: true }));

		const submit = container.querySelector(
			'[data-testid="task-submit"]'
		) as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => container.querySelector('[role="alert"]')).not.toBeNull();
		expect(oncomplete).not.toHaveBeenCalled();
	});
});
