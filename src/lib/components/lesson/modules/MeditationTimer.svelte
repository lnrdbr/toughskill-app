<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	let {
		moduleId,
		durationSeconds = 120,
		style = 'breathing' as 'breathing' | 'silence',
		courseId = '',
		lessonSlug = '',
		oncomplete
	}: {
		moduleId: string;
		durationSeconds?: number;
		style?: 'breathing' | 'silence';
		courseId?: string;
		lessonSlug?: string;
		oncomplete?: (data: Record<string, unknown>) => void;
	} = $props();

	type Phase = 'idle' | 'running' | 'done';

	let phase = $state<Phase>('idle');
	let remaining = $state(0);
	let startedAt = $state(0);
	let stoppedEarly = $state(false);
	let submitting = $state(false);
	let submitError: string | null = $state(null);
	let tickHandle: ReturnType<typeof setInterval> | null = null;

	function formatTime(sec: number): string {
		const s = Math.max(0, Math.round(sec));
		const mm = Math.floor(s / 60)
			.toString()
			.padStart(1, '0');
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

	function start() {
		phase = 'running';
		startedAt = Date.now();
		remaining = durationSeconds;
		stoppedEarly = false;
		submitError = null;
		tickHandle = setInterval(tick, 250);
	}

	function stopEarly() {
		if (phase !== 'running') return;
		stoppedEarly = true;
		clearTick();
		phase = 'done';
	}

	function finishNaturally() {
		clearTick();
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
			Math.round(
				stoppedEarly
					? (Date.now() - startedAt) / 1000
					: durationSeconds
			)
		);
		const completedFull = !stoppedEarly;
		try {
			if (courseId && lessonSlug) {
				const res = await fetch('/api/submissions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						moduleId,
						moduleType: 'meditation',
						courseId,
						lessonSlug,
						payload: {
							durationSeconds,
							style,
							completedFull,
							timeSpentSeconds
						}
					})
				});
				if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
			}
			oncomplete?.({
				durationSeconds,
				style,
				completedFull,
				timeSpentSeconds
			});
		} catch (err) {
			submitError = err instanceof Error ? err.message : 'Something went wrong.';
		} finally {
			submitting = false;
		}
	}

	// Stop the interval if the component is destroyed mid-session.
	$effect(() => {
		return () => clearTick();
	});

	let elapsedSec = $derived(durationSeconds - remaining);
	let progressPct = $derived(
		durationSeconds === 0 ? 0 : Math.min(100, (elapsedSec / durationSeconds) * 100)
	);
</script>

<section class="meditation" aria-labelledby="meditation-title">
	{#if phase === 'idle'}
		<div class="idle">
			<h2 id="meditation-title" class="title">
				{#if style === 'breathing'}
					A {Math.round(durationSeconds / 60) || 1}-minute breath
				{:else}
					A {Math.round(durationSeconds / 60) || 1}-minute pause
				{/if}
			</h2>
			<p class="intro">
				{#if style === 'breathing'}
					Follow the circle. Breathe in as it grows, breathe out as it shrinks. You can stop any
					time.
				{:else}
					Just sit with it. No task, no phone, no pressure. You can stop any time.
				{/if}
			</p>
			<Button
				variant="primary"
				rounded="default"
				onclick={start}
				data-testid="meditation-start"
			>
				Begin
			</Button>
		</div>
	{:else if phase === 'running'}
		<div class="running">
			<div class="visual {style}" aria-hidden="true">
				<div class="orb"></div>
			</div>
			<div class="countdown" data-testid="meditation-remaining">
				{formatTime(remaining)}
			</div>
			<div class="track" aria-hidden="true">
				<div class="track-fill" style="width: {progressPct}%"></div>
			</div>
			<button
				type="button"
				class="stop-link"
				onclick={stopEarly}
				data-testid="meditation-stop"
			>
				Stop early
			</button>
		</div>
	{:else}
		<div class="done">
			<h2 class="title">
				{#if stoppedEarly}
					Good start.
				{:else}
					Well done.
				{/if}
			</h2>
			<p class="intro">
				{#if stoppedEarly}
					Even a few seconds of stillness counts.
				{:else}
					You stayed with it.
				{/if}
			</p>
			{#if submitError}
				<p class="error" role="alert">{submitError}</p>
			{/if}
			<Button
				variant="primary"
				rounded="default"
				disabled={submitting}
				onclick={saveAndContinue}
				data-testid="meditation-continue"
			>
				{submitting ? 'Saving…' : 'Save & continue'}
			</Button>
		</div>
	{/if}
</section>

<style>
	.meditation {
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

	.orb {
		width: 6rem;
		height: 6rem;
		border-radius: 999px;
		background: var(--color-primary-500);
		filter: drop-shadow(0 4px 8px color-mix(in srgb, var(--color-primary-700) 40%, transparent));
	}

	.visual.breathing .orb {
		animation: breathe 8s ease-in-out infinite;
	}

	.visual.silence .orb {
		animation: pulse 3.5s ease-in-out infinite;
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

	@keyframes breathe {
		0%,
		100% {
			transform: scale(0.8);
		}
		50% {
			transform: scale(1.4);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.75;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.06);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.visual.breathing .orb,
		.visual.silence .orb {
			animation: none;
		}
	}
</style>
