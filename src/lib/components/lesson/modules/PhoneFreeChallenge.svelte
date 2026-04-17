<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	let {
		moduleId,
		durationSeconds = 60,
		courseId = '',
		lessonSlug = '',
		oncomplete
	}: {
		moduleId: string;
		durationSeconds?: number;
		courseId?: string;
		lessonSlug?: string;
		oncomplete?: (data: Record<string, unknown>) => void;
	} = $props();

	type Phase = 'idle' | 'running' | 'done';

	let phase = $state<Phase>('idle');
	let remaining = $state(0);
	let startedAt = $state(0);
	let stoppedEarly = $state(false);
	let peekCount = $state(0);
	let submitting = $state(false);
	let submitted = $state(false);
	let submitError: string | null = $state(null);
	let tickHandle: ReturnType<typeof setInterval> | null = null;

	function formatTime(sec: number): string {
		const s = Math.max(0, Math.round(sec));
		const mm = Math.floor(s / 60).toString();
		const ss = (s % 60).toString().padStart(2, '0');
		return `${mm}:${ss}`;
	}

	function tick() {
		const elapsed = (Date.now() - startedAt) / 1000;
		const left = Math.max(0, durationSeconds - elapsed);
		remaining = left;
		if (left <= 0) {
			finishNaturally();
		}
	}

	function clearTick() {
		if (tickHandle !== null) {
			clearInterval(tickHandle);
			tickHandle = null;
		}
	}

	function onVisibilityChange() {
		// Count every time the tab / window hides while running.
		if (phase === 'running' && document.hidden) {
			peekCount += 1;
		}
	}

	function attachVisibility() {
		document.addEventListener('visibilitychange', onVisibilityChange);
	}

	function detachVisibility() {
		document.removeEventListener('visibilitychange', onVisibilityChange);
	}

	function start() {
		phase = 'running';
		startedAt = Date.now();
		remaining = durationSeconds;
		stoppedEarly = false;
		peekCount = 0;
		submitError = null;
		tickHandle = setInterval(tick, 250);
		attachVisibility();
	}

	function stopEarly() {
		if (phase !== 'running') return;
		stoppedEarly = true;
		clearTick();
		detachVisibility();
		phase = 'done';
	}

	function finishNaturally() {
		clearTick();
		detachVisibility();
		stoppedEarly = false;
		remaining = 0;
		phase = 'done';
	}

	async function saveAndContinue() {
		if (submitting) return;
		submitting = true;
		submitError = null;
		const timeSpentSeconds = Math.max(
			0,
			Math.round(stoppedEarly ? (Date.now() - startedAt) / 1000 : durationSeconds)
		);
		const completedFull = !stoppedEarly;
		try {
			if (courseId && lessonSlug) {
				const res = await fetch('/api/submissions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						moduleId,
						moduleType: 'phone_free',
						courseId,
						lessonSlug,
						payload: {
							durationSeconds,
							completedFull,
							timeSpentSeconds,
							peekCount
						}
					})
				});
				if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
			}
			submitted = true;
			oncomplete?.({
				durationSeconds,
				completedFull,
				timeSpentSeconds,
				peekCount
			});
		} catch (err) {
			submitError = err instanceof Error ? err.message : 'Something went wrong.';
		} finally {
			submitting = false;
		}
	}

	// Clean up if the component unmounts mid-session.
	$effect(() => {
		return () => {
			clearTick();
			detachVisibility();
		};
	});

	let elapsedSec = $derived(durationSeconds - remaining);
	let progressPct = $derived(
		durationSeconds === 0 ? 0 : Math.min(100, (elapsedSec / durationSeconds) * 100)
	);
</script>

<section class="phone-free" aria-labelledby="phone-free-title">
	{#if phase === 'idle'}
		<div class="idle">
			<h2 id="phone-free-title" class="title">Put it down.</h2>
			<p class="intro">
				Place your phone face-down. We'll start a {Math.round(durationSeconds / 60) || 1}-minute
				timer. Try not to touch it.
			</p>
			<Button
				variant="primary"
				rounded="default"
				onclick={start}
				data-testid="phone-free-start"
			>
				Begin
			</Button>
		</div>
	{:else if phase === 'running'}
		<div class="running">
			<div class="visual" aria-hidden="true">
				<div class="phone-icon"></div>
			</div>
			<div class="countdown" data-testid="phone-free-remaining">
				{formatTime(remaining)}
			</div>
			<div class="track" aria-hidden="true">
				<div class="track-fill" style="width: {progressPct}%"></div>
			</div>
			<button
				type="button"
				class="stop-link"
				onclick={stopEarly}
				data-testid="phone-free-stop"
			>
				Stop early
			</button>
		</div>
	{:else}
		<div class="done">
			<h2 class="title">
				{#if stoppedEarly}
					Good start.
				{:else if peekCount === 0}
					Undistracted.
				{:else}
					You noticed.
				{/if}
			</h2>
			<p class="intro" data-testid="phone-free-summary">
				{#if stoppedEarly}
					Even a few seconds off your phone counts.
				{:else if peekCount === 0}
					You stayed off your phone the whole time.
				{:else if peekCount === 1}
					One peek. Just noticing the pull is already progress.
				{:else}
					{peekCount} peeks. Even counting them is awareness.
				{/if}
			</p>
			{#if submitError}
				<p class="error" role="alert">{submitError}</p>
			{/if}
			{#if !submitted}
				<Button
					variant="primary"
					rounded="default"
					disabled={submitting}
					onclick={saveAndContinue}
					data-testid="phone-free-continue"
				>
					{submitting ? 'Saving…' : 'Save & continue'}
				</Button>
			{/if}
		</div>
	{/if}
</section>

<style>
	.phone-free {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		max-width: 28rem;
		margin: 0 auto;
		text-align: center;
	}

	.title {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0;
		color: var(--color-foreground);
	}

	.intro {
		margin: 0;
		font-size: 1rem;
		line-height: 1.5;
		color: var(--color-muted-foreground);
	}

	.idle,
	.running,
	.done {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		width: 100%;
	}

	.visual {
		position: relative;
		width: 12rem;
		height: 12rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.phone-icon {
		width: 4.5rem;
		height: 7rem;
		border: 3px solid var(--color-foreground);
		border-radius: 1rem;
		background: var(--color-background);
		filter: drop-shadow(4px 4px 0 var(--color-foreground));
		position: relative;
		transform: rotate(-6deg);
		animation: rest 6s ease-in-out infinite;
	}

	.phone-icon::before {
		content: '';
		position: absolute;
		top: 0.6rem;
		left: 50%;
		transform: translateX(-50%);
		width: 1.5rem;
		height: 0.25rem;
		background: var(--color-foreground);
		border-radius: 999px;
		opacity: 0.6;
	}

	.countdown {
		font-variant-numeric: tabular-nums;
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-foreground);
		letter-spacing: 0.05em;
	}

	.track {
		width: 80%;
		height: 0.5rem;
		background: color-mix(in srgb, var(--color-foreground) 8%, transparent);
		border-radius: 999px;
		overflow: hidden;
	}

	.track-fill {
		height: 100%;
		background: var(--color-primary-500);
		border-radius: 999px;
		transition: width 0.25s linear;
	}

	.stop-link {
		background: none;
		border: none;
		color: var(--color-muted-foreground);
		font-size: 0.9rem;
		text-decoration: underline;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
	}

	.stop-link:hover {
		color: var(--color-foreground);
	}

	.error {
		color: var(--color-error);
		font-weight: 600;
		margin: 0;
	}

	@keyframes rest {
		0%,
		100% {
			transform: rotate(-6deg) translateY(0);
		}
		50% {
			transform: rotate(-6deg) translateY(-4px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.phone-icon {
			animation: none;
		}
	}
</style>
