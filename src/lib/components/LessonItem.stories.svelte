
<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LessonItem from './LessonItem.svelte';
	const { Story } = defineMeta({
		title: 'Components/LessonItem',
		component: LessonItem,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
				<LessonItem href="/" title="Creativity" />
		{/snippet}
</Story>
