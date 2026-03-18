<script lang="ts">
	import Bubble from './Bubble.svelte';
	import type { SimBubble } from './bubbleSimulation.svelte.ts';

	let {
		prompt,
		bubbles = [],
		settled = false
	}: { prompt: string; bubbles?: SimBubble[]; settled?: boolean } = $props();
</script>

<div class="cloud">
	<div class="prompt" class:settled>
		{prompt}
	</div>

	{#each bubbles as bubble (bubble.id)}
		<Bubble
			text={bubble.text}
			x={bubble.x ?? 0}
			y={bubble.y ?? 0}
			color={bubble.color}
		/>
	{/each}
</div>

<style>
	.cloud {
		position: relative;
		width: 100%;
		height: 360px;
		overflow: hidden;
	}

	.prompt {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-family: var(--font-display);
		font-size: 3rem;
		color: var(--color-foreground);
		text-align: center;
		pointer-events: none;
		transition: opacity 0.3s;
	}

	.prompt.settled {
		opacity: 0.4;
	}
</style>
