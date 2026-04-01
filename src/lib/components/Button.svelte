<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import clickSound from '$lib/assets/clickSound.wav';

	let {
		children,
		onclick,
		variant = 'default',
		silent = false,
		rounded = 'full',
		...rest
	}: HTMLButtonAttributes & {
		children: Snippet;
		variant?: 'default' | 'primary';
		silent?: boolean;
		rounded?: 'default' | 'full';
	} = $props();

	let audio: HTMLAudioElement | undefined;

	function handleClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (!silent) {
			if (!audio) audio = new Audio(clickSound);
			audio.play().catch(() => {});
			audio.play();
		}
		if (typeof onclick === 'function') onclick.call(e.currentTarget, e);
	}
</script>

<button
	class="button {variant} {rounded === 'full' ? 'rounded-full' : 'rounded-default'}"
	{...rest}
	onclick={handleClick}
>
	{@render children()}
</button>

<style>
	.button {
		padding: 8px 20px;
		border: 2px solid var(--color-foreground);
		border-radius: var(--radius-button); /* overridden by .rounded-default */
		background: var(--color-background);
		color: var(--color-foreground);
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		filter: drop-shadow(2px 2px 0px var(--color-foreground));
		transition: all 0.3s;
	}

	.button:hover {
		transform: translate(1px, 1px);
		filter: drop-shadow(1px 1px 0px var(--color-primary-300));
		border-color: var(--color-primary-300);
		background-color: var(--color-primary-50);
		color: var(--color-primary-900);
	}

	.button:active {
		transform: translate(2px, 2px);
		filter: drop-shadow(0px 0px 0px var(--color-primary-400));
		background-color: var(--color-primary-200);
		border-color: var(--color-primary-400);
	}

	.button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		filter: none;
		transform: none;
	}

	.button:disabled:hover {
		background: var(--color-background);
		border-color: var(--color-foreground);
		color: var(--color-foreground);
		transform: none;
		filter: none;
	}

	.rounded-default {
		border-radius: 0.5rem;
	}

	.primary {
		background: var(--color-primary-500);
		color: white;
		border-color: var(--color-primary-700);
		filter: drop-shadow(2px 2px 0px var(--color-primary-700));
	}

	.primary:hover {
		background: var(--color-primary-400);
		border-color: var(--color-primary-600);
		color: white;
		filter: drop-shadow(1px 1px 0px var(--color-primary-600));
	}

	.primary:active {
		background: var(--color-primary-600);
		transform: translate(2px, 2px);
		filter: drop-shadow(0px 0px 0px var(--color-primary-700));
	}

	.primary:disabled:hover {
		background: var(--color-primary-500);
		border-color: var(--color-primary-700);
		color: white;
		transform: none;
		filter: none;
	}
</style>
