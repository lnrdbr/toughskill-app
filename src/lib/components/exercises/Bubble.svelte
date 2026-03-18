<script>
	let { text, x = 0, y = 0, color = 'var(--color-primary-200)' } = $props();
</script>

<div class="bubble" style:left="{x}px" style:top="{y}px" style:--bubble-color={color}>
	{text}
</div>

<style>
	.bubble {
		position: absolute;
		transform: translate(-50%, -50%);
		padding: 6px 14px;
		border-radius: var(--radius-button);
		background: var(--bubble-color);
		color: var(--color-foreground);
		border: 2px solid var(--color-foreground);
		filter: drop-shadow(2px 2px 0px var(--color-foreground));
		font-size: 0.875rem;
		font-weight: 600;
		white-space: nowrap;
		user-select: none;
		pointer-events: none;
		transition:
			left 0.15s ease-out,
			top 0.15s ease-out;
	}
</style>
