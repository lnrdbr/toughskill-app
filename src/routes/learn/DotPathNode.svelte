<script lang="ts">
	import Icon from '@iconify/svelte';

	let {
		status,
		selected = false,
		onclick
	}: {
		status: 'completed' | 'in-progress' | 'not-started';
		selected?: boolean;
		onclick: () => void;
	} = $props();
</script>

<button
	class="dot-button h-20 w-20 rounded-full p-5 text-white"
	class:completed={status === 'completed'}
	class:in-progress={status === 'in-progress'}
	class:not-started={status === 'not-started'}
	class:selected
	{onclick}
>
	{#if status === 'completed'}
		<Icon icon="mdi:check-bold" width="32" height="32" />
	{:else if status === 'not-started'}
		<Icon icon="mdi:lightbulb" width="32" height="32" />
	{/if}
</button>

<style>
	.dot-button {
		cursor: pointer;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		/* transform: skew(20deg); */
		filter: drop-shadow(0px 8px 0px var(--color-primary-100));
	}
	.dot-button:hover {
		filter: drop-shadow(0px 2px 0px var(--color-primary-100));
		transform: translateY(6px);
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
	}

	.completed {
		background: var(--color-primary-500);
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
