import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MeditationTimer from './MeditationTimer.svelte';

describe('MeditationTimer', () => {
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
		vi.useRealTimers();
	});

	it('renders the idle state with breathing copy by default', async () => {
		const { container } = render(MeditationTimer, {
			moduleId: 'mod-m',
			durationSeconds: 120,
			style: 'breathing'
		});

		const title = container.querySelector('.title') as HTMLElement;
		expect(title.textContent).toContain('2-minute breath');

		const startBtn = container.querySelector(
			'[data-testid="meditation-start"]'
		) as HTMLButtonElement;
		expect(startBtn).not.toBeNull();
	});

	it('renders silence copy when style is silence', async () => {
		const { container } = render(MeditationTimer, {
			moduleId: 'mod-m',
			durationSeconds: 120,
			style: 'silence'
		});

		const title = container.querySelector('.title') as HTMLElement;
		expect(title.textContent).toContain('2-minute pause');
	});

	it('transitions from idle to running when start is clicked', async () => {
		const { container } = render(MeditationTimer, {
			moduleId: 'mod-m',
			durationSeconds: 120
		});

		const startBtn = container.querySelector(
			'[data-testid="meditation-start"]'
		) as HTMLButtonElement;
		startBtn.click();

		await expect
			.poll(() => container.querySelector('[data-testid="meditation-remaining"]'))
			.not.toBeNull();
		const remaining = container.querySelector(
			'[data-testid="meditation-remaining"]'
		) as HTMLElement;
		expect(remaining.textContent?.trim()).toBe('2:00');
	});

	it('stop early shows the "Good start" done state', async () => {
		const { container } = render(MeditationTimer, {
			moduleId: 'mod-m',
			durationSeconds: 120
		});

		(container.querySelector('[data-testid="meditation-start"]') as HTMLButtonElement).click();

		await expect
			.poll(() => container.querySelector('[data-testid="meditation-stop"]'))
			.not.toBeNull();
		(container.querySelector('[data-testid="meditation-stop"]') as HTMLButtonElement).click();

		await expect
			.poll(() => container.querySelector('[data-testid="meditation-continue"]'))
			.not.toBeNull();
		const title = container.querySelector('.title') as HTMLElement;
		expect(title.textContent).toContain('Good start');
	});

	it('auto-finishes when timer reaches zero with "Well done" copy', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: false });
		const { container } = render(MeditationTimer, {
			moduleId: 'mod-m',
			durationSeconds: 2
		});

		(container.querySelector('[data-testid="meditation-start"]') as HTMLButtonElement).click();

		// Advance past duration so tick() sees elapsed >= durationSeconds.
		await vi.advanceTimersByTimeAsync(2500);

		vi.useRealTimers();

		await expect
			.poll(() => container.querySelector('[data-testid="meditation-continue"]'))
			.not.toBeNull();
		const title = container.querySelector('.title') as HTMLElement;
		expect(title.textContent).toContain('Well done');
	});

	it('submits completedFull=true when auto-finished and fires oncomplete', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: false });
		const oncomplete = vi.fn();
		const { container } = render(MeditationTimer, {
			moduleId: 'mod-m',
			durationSeconds: 2,
			style: 'breathing',
			courseId: 'creativity',
			lessonSlug: 'a-2-minute-pause',
			oncomplete
		});

		(container.querySelector('[data-testid="meditation-start"]') as HTMLButtonElement).click();
		await vi.advanceTimersByTimeAsync(2500);
		vi.useRealTimers();

		await expect
			.poll(() => container.querySelector('[data-testid="meditation-continue"]'))
			.not.toBeNull();

		(container.querySelector('[data-testid="meditation-continue"]') as HTMLButtonElement).click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();

		expect(fetchSpy).toHaveBeenCalledWith(
			'/api/submissions',
			expect.objectContaining({ method: 'POST' })
		);
		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body).toEqual({
			moduleId: 'mod-m',
			moduleType: 'meditation',
			courseId: 'creativity',
			lessonSlug: 'a-2-minute-pause',
			payload: {
				durationSeconds: 2,
				style: 'breathing',
				completedFull: true,
				timeSpentSeconds: 2
			}
		});

		const arg = oncomplete.mock.calls[0][0] as Record<string, unknown>;
		expect(arg.completedFull).toBe(true);
		expect(arg.style).toBe('breathing');
		expect(arg.durationSeconds).toBe(2);
	});

	it('submits completedFull=false when stopped early', async () => {
		const oncomplete = vi.fn();
		const { container } = render(MeditationTimer, {
			moduleId: 'mod-m',
			durationSeconds: 120,
			style: 'silence',
			courseId: 'creativity',
			lessonSlug: 'silence-as-fuel',
			oncomplete
		});

		(container.querySelector('[data-testid="meditation-start"]') as HTMLButtonElement).click();
		await expect
			.poll(() => container.querySelector('[data-testid="meditation-stop"]'))
			.not.toBeNull();
		(container.querySelector('[data-testid="meditation-stop"]') as HTMLButtonElement).click();

		await expect
			.poll(() => container.querySelector('[data-testid="meditation-continue"]'))
			.not.toBeNull();
		(container.querySelector('[data-testid="meditation-continue"]') as HTMLButtonElement).click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();

		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body.payload.completedFull).toBe(false);
		expect(body.payload.style).toBe('silence');
		expect(body.moduleType).toBe('meditation');
	});

	it('does not POST when courseId/lessonSlug are missing (preview mode)', async () => {
		const oncomplete = vi.fn();
		const { container } = render(MeditationTimer, {
			moduleId: 'mod-m',
			durationSeconds: 120,
			oncomplete
		});

		(container.querySelector('[data-testid="meditation-start"]') as HTMLButtonElement).click();
		await expect
			.poll(() => container.querySelector('[data-testid="meditation-stop"]'))
			.not.toBeNull();
		(container.querySelector('[data-testid="meditation-stop"]') as HTMLButtonElement).click();

		await expect
			.poll(() => container.querySelector('[data-testid="meditation-continue"]'))
			.not.toBeNull();
		(container.querySelector('[data-testid="meditation-continue"]') as HTMLButtonElement).click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('shows an error and does not complete when the request fails', async () => {
		fetchSpy.mockResolvedValueOnce(new Response('server err', { status: 500 }));
		const oncomplete = vi.fn();
		const { container } = render(MeditationTimer, {
			moduleId: 'mod-m',
			durationSeconds: 120,
			courseId: 'creativity',
			lessonSlug: 'a-2-minute-pause',
			oncomplete
		});

		(container.querySelector('[data-testid="meditation-start"]') as HTMLButtonElement).click();
		await expect
			.poll(() => container.querySelector('[data-testid="meditation-stop"]'))
			.not.toBeNull();
		(container.querySelector('[data-testid="meditation-stop"]') as HTMLButtonElement).click();

		await expect
			.poll(() => container.querySelector('[data-testid="meditation-continue"]'))
			.not.toBeNull();
		(container.querySelector('[data-testid="meditation-continue"]') as HTMLButtonElement).click();

		await expect.poll(() => container.querySelector('[role="alert"]')).not.toBeNull();
		expect(oncomplete).not.toHaveBeenCalled();
	});
});
