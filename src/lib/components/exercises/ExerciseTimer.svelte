<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	let props: { duration: number; onexpire?: () => void } = $props();

	let remaining = $state(props.duration);
	let running = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = $state(null);

	function start() {
		if (running || remaining <= 0) return;
		running = true;
		intervalId = setInterval(() => {
			remaining -= 1;
			if (remaining <= 0) {
				remaining = 0;
				pause();
				props.onexpire?.();
			}
		}, 1000);
	}

	function pause() {
		running = false;
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function toggle() {
		if (running) pause();
		else start();
	}

	function reset() {
		pause();
		remaining = props.duration;
	}

	function formatTime(s: number) {
		const mins = Math.floor(s / 60);
		const secs = s % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	export { remaining, running, start, pause, reset };
</script>

<div class="timer">
	<span class="time">{formatTime(remaining)}</span>
	<Button onclick={toggle}>
		{running ? 'Pause' : 'Start'}
	</Button>
</div>

<style>
	.timer {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.time {
		font-size: 1.125rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--color-foreground);
		min-width: 3.5rem;
	}
</style>
