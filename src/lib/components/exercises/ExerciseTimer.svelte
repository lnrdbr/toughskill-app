<script lang="ts">
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
	<button class="timer-btn" onclick={toggle}>
		{running ? 'Pause' : 'Start'}
	</button>
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

	.timer-btn {
		padding: 4px 12px;
		border-radius: var(--radius-button);
		border: 2px solid var(--color-foreground);
		background: var(--color-background);
		color: var(--color-foreground);
		font-weight: 600;
		font-size: 0.75rem;
		filter: drop-shadow(2px 2px 0px var(--color-foreground));
		cursor: pointer;
		transition: all 0.3s;
	}

	.timer-btn:hover {
		transform: translate(1px, 1px);
		filter: drop-shadow(1px 1px 0px var(--color-primary-300));
		border-color: var(--color-primary-300);
		background-color: var(--color-primary-50);
	}

	.timer-btn:active {
		transform: translate(2px, 2px);
		filter: drop-shadow(0px 0px 0px var(--color-primary-400));
		background-color: var(--color-primary-200);
		border-color: var(--color-primary-400);
	}
</style>
