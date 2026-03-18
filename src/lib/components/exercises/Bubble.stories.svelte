<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Bubble from './Bubble.svelte';

	const { Story } = defineMeta({
		title: 'Exercises/Bubble',
		component: Bubble,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<div style="position: relative; width: 300px; height: 200px;">
			<Bubble text="Open a lock" x={150} y={100} />
		</div>
	{/snippet}
</Story>

<Story name="Custom Color">
	{#snippet template()}
		<div style="position: relative; width: 300px; height: 200px;">
			<Bubble text="Scratch an itch" x={150} y={100} color="var(--color-primary-100)" />
		</div>
	{/snippet}
</Story>

<Story name="Multiple Bubbles">
	{#snippet template()}
		<div style="position: relative; width: 400px; height: 300px;">
			<Bubble text="Open a lock" x={100} y={80} color="var(--color-primary-200)" />
			<Bubble text="Conduct electricity" x={250} y={120} color="var(--color-primary-100)" />
			<Bubble text="Bookmark" x={180} y={200} color="var(--color-primary-300)" />
		</div>
	{/snippet}
</Story>
