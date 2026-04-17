<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ListItem from './ListItem.svelte';
	import bulb from '$lib/assets/bulb.svg';
	const { Story } = defineMeta({
		title: 'Components/ListItem',
		component: ListItem,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<ListItem href="/" icon={bulb}>Creativity</ListItem>
	{/snippet}
</Story>
