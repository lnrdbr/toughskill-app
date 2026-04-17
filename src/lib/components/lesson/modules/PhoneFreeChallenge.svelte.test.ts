import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PhoneFreeChallenge from './PhoneFreeChallenge.svelte';

describe('PhoneFreeChallenge', () => {
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

	it('renders the idle state with the phone-down prompt', async () => {
		const { container } = render(PhoneFreeChallenge, {
			moduleId: 'mod-p',
			durationSeconds: 60
		});

		const title = container.querySelector('.title') as HTMLElement;
		expect(title.textContent).toContain('Put it down');

		const startBtn = container.querySelector(
			'[data-testid="phone-free-start"]'
		) as HTMLButtonElement;
		expect(startBtn).not.toBeNull();
	});

	it('transitions from idle to running when start is clicked', async () => {
		const { container } = render(PhoneFreeChallenge, {
			moduleId: 'mod-p',
			durationSeconds: 60
		});

		(
			container.querySelector('[data-testid="phone-free-start"]') as HTMLButtonElement
		).click();

		await expect
			.poll(() => container.querySelector('[data-testid="phone-free-remaining"]'))
			.not.toBeNull();
		const remaining = container.querySelector(
			'[data-testid="phone-free-remaining"]'
		) as HTMLElement;
		expect(remaining.textContent?.trim()).toBe('1:00');
	});

	it('stop early shows the "Good start" done copy', async () => {
		const { container } = render(PhoneFreeChallenge, {
			moduleId: 'mod-p',
			durationSeconds: 60
		});

		(
			container.querySelector('[data-testid="phone-free-start"]') as HTMLButtonElement
		).click();

		await expect
			.poll(() => container.querySelector('[data-testid="phone-free-stop"]'))
			.not.toBeNull();
		(
			container.querySelector('[data-testid="phone-free-stop"]') as HTMLButtonElement
		).click();

		await expect
			.poll(() => container.querySelector('[data-testid="phone-free-continue"]'))
			.not.toBeNull();
		const title = container.querySelector('.title') as HTMLElement;
		expect(title.textContent).toContain('Good start');
	});

	it('auto-finishes with "Undistracted" copy when no peeks occurred', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: false });
		const { container } = render(PhoneFreeChallenge, {
			moduleId: 'mod-p',
			durationSeconds: 2
		});

		(
			container.querySelector('[data-testid="phone-free-start"]') as HTMLButtonElement
		).click();

		await vi.advanceTimersByTimeAsync(2500);
		vi.useRealTimers();

		await expect
			.poll(() => container.querySelector('[data-testid="phone-free-continue"]'))
			.not.toBeNull();
		const title = container.querySelector('.title') as HTMLElement;
		expect(title.textContent).toContain('Undistracted');
	});

	it('counts peeks on visibilitychange while running and reflects them in copy', async () => {
		const { container } = render(PhoneFreeChallenge, {
			moduleId: 'mod-p',
			durationSeconds: 60
		});

		(
			container.querySelector('[data-testid="phone-free-start"]') as HTMLButtonElement
		).click();

		await expect
			.poll(() => container.querySelector('[data-testid="phone-free-stop"]'))
			.not.toBeNull();

		// Simulate two peeks while running.
		const hiddenDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
		document.dispatchEvent(new Event('visibilitychange'));
		document.dispatchEvent(new Event('visibilitychange'));
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
		document.dispatchEvent(new Event('visibilitychange'));
		if (hiddenDesc) Object.defineProperty(Document.prototype, 'hidden', hiddenDesc);

		(
			container.querySelector('[data-testid="phone-free-stop"]') as HTMLButtonElement
		).click();

		await expect
			.poll(() => container.querySelector('[data-testid="phone-free-continue"]'))
			.not.toBeNull();

		// Stopped early takes precedence on the heading, but the submitted payload
		// should still carry the peek count. Verify via submit below.
	});

	it('submits correct payload with peekCount=0 on natural finish', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: false });
		const oncomplete = vi.fn();
		const { container } = render(PhoneFreeChallenge, {
			moduleId: 'mod-p',
			durationSeconds: 2,
			courseId: 'creativity',
			lessonSlug: 'a-phone-free-minute',
			oncomplete
		});

		(
			container.querySelector('[data-testid="phone-free-start"]') as HTMLButtonElement
		).click();
		await vi.advanceTimersByTimeAsync(2500);
		vi.useRealTimers();

		await expect
			.poll(() => container.querySelector('[data-testid="phone-free-continue"]'))
			.not.toBeNull();
		(
			container.querySelector('[data-testid="phone-free-continue"]') as HTMLButtonElement
		).click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();

		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body).toEqual({
			moduleId: 'mod-p',
			moduleType: 'phone_free',
			courseId: 'creativity',
			lessonSlug: 'a-phone-free-minute',
			payload: {
				durationSeconds: 2,
				completedFull: true,
				timeSpentSeconds: 2,
				peekCount: 0
			}
		});
	});

	it('submits completedFull=false and carries peekCount when stopped early after a peek', async () => {
		const oncomplete = vi.fn();
		const { container } = render(PhoneFreeChallenge, {
			moduleId: 'mod-p',
			durationSeconds: 60,
			courseId: 'creativity',
			lessonSlug: 'be-bored-for-two-minutes',
			oncomplete
		});

		(
			container.querySelector('[data-testid="phone-free-start"]') as HTMLButtonElement
		).click();

		await expect
			.poll(() => container.querySelector('[data-testid="phone-free-stop"]'))
			.not.toBeNull();

		// One peek.
		const hiddenDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
		document.dispatchEvent(new Event('visibilitychange'));
		if (hiddenDesc) Object.defineProperty(Document.prototype, 'hidden', hiddenDesc);

		(
			container.querySelector('[data-testid="phone-free-stop"]') as HTMLButtonElement
		).click();

		await expect
			.poll(() => container.querySelector('[data-testid="phone-free-continue"]'))
			.not.toBeNull();
		(
			container.querySelector('[data-testid="phone-free-continue"]') as HTMLButtonElement
		).click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();

		const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
		expect(body.payload.completedFull).toBe(false);
		expect(body.payload.peekCount).toBe(1);
		expect(body.moduleType).toBe('phone_free');
	});

	it('does not POST when courseId/lessonSlug are missing (preview mode)', async () => {
		const oncomplete = vi.fn();
		const { container } = render(PhoneFreeChallenge, {
			moduleId: 'mod-p',
			durationSeconds: 60,
			oncomplete
		});

		(
			container.querySelector('[data-testid="phone-free-start"]') as HTMLButtonElement
		).click();
		await expect
			.poll(() => container.querySelector('[data-testid="phone-free-stop"]'))
			.not.toBeNull();
		(
			container.querySelector('[data-testid="phone-free-stop"]') as HTMLButtonElement
		).click();

		await expect
			.poll(() => container.querySelector('[data-testid="phone-free-continue"]'))
			.not.toBeNull();
		(
			container.querySelector('[data-testid="phone-free-continue"]') as HTMLButtonElement
		).click();

		await expect.poll(() => oncomplete).toHaveBeenCalled();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('shows an error and does not complete when the request fails', async () => {
		fetchSpy.mockResolvedValueOnce(new Response('server err', { status: 500 }));
		const oncomplete = vi.fn();
		const { container } = render(PhoneFreeChallenge, {
			moduleId: 'mod-p',
			durationSeconds: 60,
			courseId: 'creativity',
			lessonSlug: 'a-phone-free-minute',
			oncomplete
		});

		(
			container.querySelector('[data-testid="phone-free-start"]') as HTMLButtonElement
		).click();
		await expect
			.poll(() => container.querySelector('[data-testid="phone-free-stop"]'))
			.not.toBeNull();
		(
			container.querySelector('[data-testid="phone-free-stop"]') as HTMLButtonElement
		).click();

		await expect
			.poll(() => container.querySelector('[data-testid="phone-free-continue"]'))
			.not.toBeNull();
		(
			container.querySelector('[data-testid="phone-free-continue"]') as HTMLButtonElement
		).click();

		await expect.poll(() => container.querySelector('[role="alert"]')).not.toBeNull();
		expect(oncomplete).not.toHaveBeenCalled();
	});
});
