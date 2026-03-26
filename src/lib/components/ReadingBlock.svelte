<script lang="ts">
	import { marked } from 'marked';

	let {
		content,
		oncomplete = undefined as ((data: Record<string, unknown>) => void) | undefined
	}: {
		content: string;
		oncomplete?: (data: Record<string, unknown>) => void;
	} = $props();

	const html = $derived(marked.parse(content, { async: false }) as string);

	$effect(() => {
		oncomplete?.({});
	});
</script>

<div class="reading-wrapper">
	<article class="reading-block prose rounded-lg border-2 p-6">
		{@html html}
	</article>
</div>

<style>
	.reading-wrapper {
		display: flex;
		justify-content: center;
		padding: 32px 24px;
	}

	.reading-block {
		max-width: 640px;
		filter: drop-shadow(4px 4px 0px var(--color-foreground));
		background: var(--color-background);
		color: var(--color-foreground);
		border-color: var(--color-foreground);
	}
</style>
