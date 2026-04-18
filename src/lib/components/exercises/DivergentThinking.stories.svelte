<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DivergentThinking from './DivergentThinking.svelte';

	const { Story } = defineMeta({
		title: 'Exercises/DivergentThinking',
		component: DivergentThinking,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<DivergentThinking />
	{/snippet}
</Story>

<Story name="Custom Prompt">
	{#snippet template()}
		<DivergentThinking prompt="Brick" instruction="List unusual uses for a brick" />
	{/snippet}
</Story>

<Story name="With Timer">
	{#snippet template()}
		<DivergentThinking timerDuration={60} />
	{/snippet}
</Story>

<Story name="Pre-seeded Ideas">
	{#snippet template()}
		<DivergentThinking
			initialIdeas={['Hold papers together', 'Pick a lock', 'Bookmark', 'Conduct electricity']}
		/>
	{/snippet}
</Story>

<Story name="With Completion Handler">
	{#snippet template()}
		<DivergentThinking oncomplete={(result) => console.log('Exercise completed:', result)} />
	{/snippet}
</Story>

<Story name="Compact (no reflection)">
	{#snippet template()}
		<DivergentThinking prompt="Paperclip" instruction="How many uses can you think of?" compact />
	{/snippet}
</Story>
