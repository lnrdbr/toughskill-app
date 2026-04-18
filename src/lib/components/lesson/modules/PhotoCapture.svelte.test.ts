import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PhotoCapture from './PhotoCapture.svelte';

// Minimal valid 2x2 PNG for tests.
const TEST_PNG_DATA_URL =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAHElEQVQIW2NkYGD4z8DAwMgABXAGNgGsasACAFJ1Aw5uPqHJAAAAAElFTkSuQmCC';

// Capture the real fetch once before any spies are installed, so data: URL
// fetches for test-file creation never recurse through the mock.
const REAL_FETCH = window.fetch.bind(window);

async function makeTestFile(name = 'test.png'): Promise<File> {
	const res = await REAL_FETCH(TEST_PNG_DATA_URL);
	const blob = await res.blob();
	return new File([blob], name, { type: 'image/png' });
}

async function pickFile(container: HTMLElement, file: File): Promise<void> {
	const input = container.querySelector('[data-testid="photo-input"]') as HTMLInputElement;
	const dt = new DataTransfer();
	dt.items.add(file);
	input.files = dt.files;
	input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('PhotoCapture', () => {
	let fetchSpy: ReturnType<typeof vi.spyOn>;
	let playSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		window.sessionStorage.clear();
		fetchSpy = vi.spyOn(window, 'fetch').mockImplementation((async (
			input: RequestInfo | URL,
			init?: RequestInit
		) => {
			const url = typeof input === 'string' ? input : (input as Request).url;
			if (url.startsWith('data:')) {
				return REAL_FETCH(input as RequestInfo, init);
			}
			return new Response(JSON.stringify({ id: 'sub-1' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		}) as typeof window.fetch);
		playSpy = vi
			.spyOn(HTMLMediaElement.prototype, 'play')
			.mockImplementation(() => Promise.resolve());
	});

	afterEach(() => {
		fetchSpy.mockRestore();
		playSpy.mockRestore();
	});

	it('renders the prompt and pick-photo button in the empty state', async () => {
		const { container } = render(PhotoCapture, {
			moduleId: 'mod-ph',
			prompt: 'Photograph one ordinary thing.'
		});

		const p = container.querySelector('[data-testid="photo-prompt"]') as HTMLElement;
		expect(p.textContent).toContain('one ordinary thing');
		expect(container.querySelector('[data-testid="photo-pick"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="photo-submit"]')).toBeNull();
	});

	it('shows preview + caption field after a file is picked', async () => {
		const { container } = render(PhotoCapture, {
			moduleId: 'mod-ph',
			prompt: 'Photograph one thing.'
		});

		await pickFile(container as HTMLElement, await makeTestFile());

		await expect
			.poll(() => container.querySelector('[data-testid="photo-preview"]'))
			.not.toBeNull();
		expect(container.querySelector('[data-testid="photo-caption"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="photo-submit"]')).not.toBeNull();
	});

	it('disables submit until a caption is entered', async () => {
		const { container } = render(PhotoCapture, {
			moduleId: 'mod-ph',
			prompt: 'Photograph one thing.'
		});

		await pickFile(container as HTMLElement, await makeTestFile());
		await expect.poll(() => container.querySelector('[data-testid="photo-submit"]')).not.toBeNull();

		const submit = container.querySelector('[data-testid="photo-submit"]') as HTMLButtonElement;
		expect(submit.disabled).toBe(true);

		const area = container.querySelector('[data-testid="photo-caption"]') as HTMLTextAreaElement;
		area.value = 'a caption';
		area.dispatchEvent(new Event('input', { bubbles: true }));
		await expect.poll(() => submit.disabled).toBe(false);
	});

	it('submits photo + caption and fires oncomplete with summary fields', async () => {
		const oncomplete = vi.fn();
		const { container } = render(PhotoCapture, {
			moduleId: 'mod-ph',
			prompt: 'Photograph one thing.',
			courseId: 'creativity',
			lessonSlug: 'the-hidden-detail',
			oncomplete
		});

		await pickFile(container as HTMLElement, await makeTestFile());
		await expect.poll(() => container.querySelector('[data-testid="photo-submit"]')).not.toBeNull();

		const area = container.querySelector('[data-testid="photo-caption"]') as HTMLTextAreaElement;
		area.value = '  the corner of my desk  ';
		area.dispatchEvent(new Event('input', { bubbles: true }));

		const submit = container.querySelector('[data-testid="photo-submit"]') as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();

		const submissionCall = (fetchSpy.mock.calls as unknown[][]).find(
			(c) => typeof c[0] === 'string' && c[0] === '/api/submissions'
		);
		expect(submissionCall).toBeDefined();
		const body = JSON.parse((submissionCall![1] as RequestInit).body as string);
		expect(body.moduleId).toBe('mod-ph');
		expect(body.moduleType).toBe('photo');
		expect(body.courseId).toBe('creativity');
		expect(body.lessonSlug).toBe('the-hidden-detail');
		expect(body.payload.caption).toBe('the corner of my desk');
		expect(body.payload.prompt).toBe('Photograph one thing.');
		expect(typeof body.payload.photoDataUrl).toBe('string');
		expect(body.payload.photoDataUrl.startsWith('data:image/jpeg')).toBe(true);
		expect(typeof body.payload.width).toBe('number');
		expect(typeof body.payload.height).toBe('number');

		const arg = oncomplete.mock.calls[0][0] as Record<string, unknown>;
		expect(arg.caption).toBe('the corner of my desk');
		expect(arg.charCount).toBe('the corner of my desk'.length);
	});

	it('preview mode skips the POST but still fires oncomplete', async () => {
		const oncomplete = vi.fn();
		const { container } = render(PhotoCapture, {
			moduleId: 'mod-ph',
			prompt: 'Photograph one thing.',
			oncomplete
		});

		await pickFile(container as HTMLElement, await makeTestFile());
		await expect.poll(() => container.querySelector('[data-testid="photo-submit"]')).not.toBeNull();

		const area = container.querySelector('[data-testid="photo-caption"]') as HTMLTextAreaElement;
		area.value = 'nice shot';
		area.dispatchEvent(new Event('input', { bubbles: true }));

		const submit = container.querySelector('[data-testid="photo-submit"]') as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		const submissionCall = (fetchSpy.mock.calls as unknown[][]).find(
			(c) => typeof c[0] === 'string' && c[0] === '/api/submissions'
		);
		expect(submissionCall).toBeUndefined();
	});

	it('retake clears the preview and returns to the pick state', async () => {
		const { container } = render(PhotoCapture, {
			moduleId: 'mod-ph',
			prompt: 'Photograph one thing.',
			courseId: 'creativity',
			lessonSlug: 'the-hidden-detail'
		});

		await pickFile(container as HTMLElement, await makeTestFile());
		await expect.poll(() => container.querySelector('[data-testid="photo-retake"]')).not.toBeNull();

		(container.querySelector('[data-testid="photo-retake"]') as HTMLButtonElement).click();

		await expect.poll(() => container.querySelector('[data-testid="photo-pick"]')).not.toBeNull();
		expect(container.querySelector('[data-testid="photo-preview"]')).toBeNull();
		expect(
			window.sessionStorage.getItem('ts:photo:creativity:the-hidden-detail:mod-ph')
		).toBeNull();
	});

	it('restores photo + caption from draft on mount', async () => {
		const draft = {
			photoDataUrl: 'data:image/jpeg;base64,AAAA',
			width: 40,
			height: 60,
			caption: 'saved caption'
		};
		window.sessionStorage.setItem(
			'ts:photo:creativity:the-hidden-detail:mod-ph',
			JSON.stringify(draft)
		);

		const { container } = render(PhotoCapture, {
			moduleId: 'mod-ph',
			prompt: 'Photograph one thing.',
			courseId: 'creativity',
			lessonSlug: 'the-hidden-detail'
		});

		const img = container.querySelector('[data-testid="photo-preview"]') as HTMLImageElement;
		expect(img).not.toBeNull();
		expect(img.src).toBe(draft.photoDataUrl);
		const area = container.querySelector('[data-testid="photo-caption"]') as HTMLTextAreaElement;
		expect(area.value).toBe('saved caption');
	});

	it('clears the draft after a successful submission', async () => {
		const key = 'ts:photo:creativity:the-hidden-detail:mod-ph';
		const oncomplete = vi.fn();
		const { container } = render(PhotoCapture, {
			moduleId: 'mod-ph',
			prompt: 'Photograph one thing.',
			courseId: 'creativity',
			lessonSlug: 'the-hidden-detail',
			oncomplete
		});

		await pickFile(container as HTMLElement, await makeTestFile());
		await expect
			.poll(() => container.querySelector('[data-testid="photo-caption"]'))
			.not.toBeNull();

		const area = container.querySelector('[data-testid="photo-caption"]') as HTMLTextAreaElement;
		area.value = 'a clean caption';
		area.dispatchEvent(new Event('input', { bubbles: true }));

		// Draft should exist now.
		await expect.poll(() => window.sessionStorage.getItem(key)).not.toBeNull();

		const submit = container.querySelector('[data-testid="photo-submit"]') as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		expect(window.sessionStorage.getItem(key)).toBeNull();
	});

	it('shows an error and does not complete when the request fails', async () => {
		fetchSpy.mockImplementation((async (input: RequestInfo | URL, init?: RequestInit) => {
			const url = typeof input === 'string' ? input : (input as Request).url;
			if (url.startsWith('data:')) return REAL_FETCH(input as RequestInfo, init);
			return new Response('server err', { status: 500 });
		}) as typeof window.fetch);

		const oncomplete = vi.fn();
		const { container } = render(PhotoCapture, {
			moduleId: 'mod-ph',
			prompt: 'Photograph one thing.',
			courseId: 'creativity',
			lessonSlug: 'the-hidden-detail',
			oncomplete
		});

		await pickFile(container as HTMLElement, await makeTestFile());
		await expect
			.poll(() => container.querySelector('[data-testid="photo-caption"]'))
			.not.toBeNull();

		const area = container.querySelector('[data-testid="photo-caption"]') as HTMLTextAreaElement;
		area.value = 'caption';
		area.dispatchEvent(new Event('input', { bubbles: true }));

		const submit = container.querySelector('[data-testid="photo-submit"]') as HTMLButtonElement;
		await expect.poll(() => submit.disabled).toBe(false);
		submit.click();

		await expect.poll(() => container.querySelector('[role="alert"]')).not.toBeNull();
		expect(oncomplete).not.toHaveBeenCalled();
	});
});
