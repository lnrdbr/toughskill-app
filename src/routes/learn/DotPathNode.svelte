<script lang="ts">
	import Icon from '@iconify/svelte';

	let {
		status,
		icon = 'mdi:lightbulb',
		completed = 0,
		total = 1,
		selected = false,
		onclick
	}: {
		status: 'completed' | 'in-progress' | 'not-started';
		icon?: string;
		completed?: number;
		total?: number;
		selected?: boolean;
		onclick: () => void;
	} = $props();

	const RADIUS = 46;
	const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

	let fraction = $derived(total > 0 ? Math.min(Math.max(completed / total, 0), 1) : 0);
	let dashOffset = $derived(CIRCUMFERENCE * (1 - fraction));
</script>

<button
	class="dot-button h-20 w-20 rounded-full p-5"
	class:completed={status === 'completed'}
	class:in-progress={status === 'in-progress'}
	class:not-started={status === 'not-started'}
	class:selected
	{onclick}
>
	{#if status === 'in-progress'}
		<svg class="progress-ring" viewBox="0 0 100 100" aria-hidden="true">
			<circle class="progress-ring-track" cx="50" cy="50" r={RADIUS} />
			<circle
				class="progress-ring-fill"
				cx="50"
				cy="50"
				r={RADIUS}
				stroke-dasharray={CIRCUMFERENCE}
				stroke-dashoffset={dashOffset}
			/>
		</svg>
	{/if}
	<span class="dot-icon">
		{#if status === 'completed'}
			<Icon icon="mdi:check-bold" width="32" height="32" />
		{:else}
			<Icon {icon} width="32" height="32" />
		{/if}
	</span>
</button>

<style>
	.dot-button {
		position: relative;
		cursor: pointer;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		filter: drop-shadow(0px 8px 0px var(--color-primary-100));
	}
	.dot-button:hover {
		filter: drop-shadow(0px 2px 0px var(--color-primary-100));
		transform: translateY(6px);
	}

	.dot-icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.progress-ring {
		position: absolute;
		inset: -6px;
		width: calc(100% + 12px);
		height: calc(100% + 12px);
		transform: rotate(-90deg);
		pointer-events: none;
		overflow: visible;
	}
	.progress-ring circle {
		fill: none;
		stroke-width: 6;
		stroke-linecap: round;
	}
	.progress-ring-track {
		stroke: var(--color-primary-100);
	}
	.progress-ring-fill {
		stroke: var(--color-primary-600);
		transition: stroke-dashoffset 0.5s ease;
	}

	.not-started {
		background: var(--color-secondary-300);
		color: var(--color-secondary-500);
		filter: drop-shadow(0px 8px 0px var(--color-secondary-200));
	}
	.not-started:hover {
		filter: drop-shadow(0px 2px 0px var(--color-secondary-100));
	}

	.in-progress {
		background: var(--color-primary-200);
		color: var(--color-primary-700);
	}

	.completed {
		background: var(--color-primary-500);
		color: white;
	}

	.selected {
		&.completed {
			filter: drop-shadow(0px 4px 0px var(--color-primary-100));
			transform: translateY(4px);
		}
		&.in-progress {
			filter: drop-shadow(0px 4px 0px var(--color-primary-100));
			transform: translateY(4px);
		}
		&.not-started {
			filter: drop-shadow(0px 4px 0px var(--color-secondary-100));
			transform: translateY(4px);
		}
	}
</style>
