import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ChoiceBranch from './ChoiceBranch.svelte';

const OPTIONS = [
	{ id: 'a', label: 'For artists only', body: 'A popular myth.' },
	{ id: 'b', label: 'For everyone', body: 'The premise of this course.' },
	{ id: 'c', label: 'Only for kids' }
];

describe('ChoiceBranch', () => {
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

	it('renders the prompt and all options', async () => {
		const { container } = render(ChoiceBranch, {
			moduleId: 'mod-c',
			prompt: 'Creativity is:',
			options: OPTIONS
		});

		expect((container.querySelector('.prompt') as HTMLElement).textContent).toBe('Creativity is:');
		expect(container.querySelector('[data-testid="choice-option-a"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="choice-option-b"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="choice-option-c"]')).not.toBeNull();
	});

	it('multi-select: disables submit until a selection is made', async () => {
		const { container } = render(ChoiceBranch, {
			moduleId: 'mod-c',
			prompt: 'Pick one',
			options: OPTIONS,
			allowMultiple: true
		});

		const submit = container.querySelector('[data-testid="choice-submit"]') as HTMLButtonElement;
		expect(submit.disabled).toBe(true);

		(container.querySelector('[data-testid="choice-option-b"]') as HTMLButtonElement).click();
		await expect.poll(() => submit.disabled).toBe(false);
	});

	it('single-select: does not render a separate Continue button', async () => {
		const { container } = render(ChoiceBranch, {
			moduleId: 'mod-c',
			prompt: 'Pick one',
			options: OPTIONS
		});

		expect(container.querySelector('[data-testid="choice-submit"]')).toBeNull();
	});

	it('single-select: picking an option auto-submits and fires oncomplete', async () => {
		const oncomplete = vi.fn();
		const { container } = render(ChoiceBranch, {
			moduleId: 'mod-c',
			prompt: 'Pick one',
			options: OPTIONS,
			courseId: 'creativity',
			lessonSlug: 'myth-of-the-creative',
			oncomplete
		});

		(container.querySelector('[data-testid="choice-option-a"]') as HTMLButtonElement).click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		const arg = oncomplete.mock.calls[0][0] as Record<string, unknown>;
		expect(arg.selectedIds).toEqual(['a']);
	});

	it('multi-select: allows toggling multiple options', async () => {
		const { container } = render(ChoiceBranch, {
			moduleId: 'mod-c',
			prompt: 'Pick all',
			options: OPTIONS,
			allowMultiple: true
		});

		const a = container.querySelector('[data-testid="choice-option-a"]') as HTMLButtonElement;
		const b = container.querySelector('[data-testid="choice-option-b"]') as HTMLButtonElement;

		a.click();
		b.click();

		await expect.poll(() => a.getAttribute('aria-checked')).toBe('true');
		expect(b.getAttribute('aria-checked')).toBe('true');
	});

	it('multi-select: reveals the option body only while that option is selected', async () => {
		const { container } = render(ChoiceBranch, {
			moduleId: 'mod-c',
			prompt: 'Pick all',
			options: OPTIONS,
			allowMultiple: true
		});

		expect(container.querySelector('[data-testid="choice-body-a"]')).toBeNull();

		(container.querySelector('[data-testid="choice-option-a"]') as HTMLButtonElement).click();
		await expect
			.poll(() => container.querySelector('[data-testid="choice-body-a"]'))
			.not.toBeNull();

		(container.querySelector('[data-testid="choice-option-a"]') as HTMLButtonElement).click();
		await expect.poll(() => container.querySelector('[data-testid="choice-body-a"]')).toBeNull();
	});

	it('single-select: submits the selection, POSTs to /api/submissions, and fires oncomplete', async () => {
		const oncomplete = vi.fn();
		const { container } = render(ChoiceBranch, {
			moduleId: 'mod-c',
			prompt: 'Creativity is:',
			options: OPTIONS,
			courseId: 'creativity',
			lessonSlug: 'myth-of-the-creative',
			oncomplete
		});

		(container.querySelector('[data-testid="choice-option-b"]') as HTMLButtonElement).click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();

		expect(fetchSpy).toHaveBeenCalledWith(
			'/api/submissions',
			expect.objectContaining({ method: 'POST' })
		);
		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body).toEqual({
			moduleId: 'mod-c',
			moduleType: 'choice',
			courseId: 'creativity',
			lessonSlug: 'myth-of-the-creative',
			payload: {
				prompt: 'Creativity is:',
				selectedIds: ['b'],
				selectedLabels: ['For everyone']
			}
		});

		const arg = oncomplete.mock.calls[0][0] as Record<string, unknown>;
		expect(arg.selectedIds).toEqual(['b']);
		expect(arg.selectedLabels).toEqual(['For everyone']);
	});

	it('multi-select submission carries all picked ids', async () => {
		const oncomplete = vi.fn();
		const { container } = render(ChoiceBranch, {
			moduleId: 'mod-c',
			prompt: 'Pick all that apply',
			options: OPTIONS,
			allowMultiple: true,
			courseId: 'creativity',
			lessonSlug: 'how-far-you-have-come',
			oncomplete
		});

		(container.querySelector('[data-testid="choice-option-a"]') as HTMLButtonElement).click();
		(container.querySelector('[data-testid="choice-option-c"]') as HTMLButtonElement).click();

		const submit = container.querySelector('[data-testid="choice-submit"]') as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();

		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body.payload.selectedIds).toEqual(['a', 'c']);
	});

	it('does not POST when courseId/lessonSlug are missing (preview mode)', async () => {
		const oncomplete = vi.fn();
		const { container } = render(ChoiceBranch, {
			moduleId: 'mod-c',
			prompt: 'Pick one',
			options: OPTIONS,
			oncomplete
		});

		(container.querySelector('[data-testid="choice-option-a"]') as HTMLButtonElement).click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('shows an error and does not complete when the request fails', async () => {
		fetchSpy.mockResolvedValueOnce(new Response('server err', { status: 500 }));
		const oncomplete = vi.fn();
		const { container } = render(ChoiceBranch, {
			moduleId: 'mod-c',
			prompt: 'Pick one',
			options: OPTIONS,
			courseId: 'creativity',
			lessonSlug: 'myth-of-the-creative',
			oncomplete
		});

		(container.querySelector('[data-testid="choice-option-a"]') as HTMLButtonElement).click();

		await expect.poll(() => container.querySelector('[role="alert"]')).not.toBeNull();
		expect(oncomplete).not.toHaveBeenCalled();
	});

	it('restores a saved selection from sessionStorage on mount', async () => {
		window.sessionStorage.setItem(
			'ts:choice:creativity:myth-of-the-creative:mod-c',
			JSON.stringify(['b'])
		);

		const { container } = render(ChoiceBranch, {
			moduleId: 'mod-c',
			prompt: 'Pick one',
			options: OPTIONS,
			courseId: 'creativity',
			lessonSlug: 'myth-of-the-creative'
		});

		const b = container.querySelector('[data-testid="choice-option-b"]') as HTMLButtonElement;
		expect(b.getAttribute('aria-checked')).toBe('true');
	});

	it('clears the draft after a successful submission', async () => {
		const key = 'ts:choice:creativity:myth-of-the-creative:mod-c';
		const oncomplete = vi.fn();
		const { container } = render(ChoiceBranch, {
			moduleId: 'mod-c',
			prompt: 'Pick one',
			options: OPTIONS,
			courseId: 'creativity',
			lessonSlug: 'myth-of-the-creative',
			oncomplete
		});

		(container.querySelector('[data-testid="choice-option-b"]') as HTMLButtonElement).click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		expect(window.sessionStorage.getItem(key)).toBeNull();
	});
});
