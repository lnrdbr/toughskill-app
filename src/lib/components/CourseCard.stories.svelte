<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CourseCard from './CourseCard.svelte';
	const { Story } = defineMeta({
		title: 'Components/CourseCard',
		component: CourseCard,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<CourseCard>Click me</CourseCard>
	{/snippet}
</Story>
