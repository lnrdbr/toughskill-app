
<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LessonItem from './LessonItem.svelte';
	import bulb from '$lib/assets/bulb.svg'
	const { Story } = defineMeta({
		title: 'Components/LessonItem',
		component: LessonItem,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
				<LessonItem href="/" icon={bulb}>Creativity</LessonItem>
		{/snippet}
</Story>
