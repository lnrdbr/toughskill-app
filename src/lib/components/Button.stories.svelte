<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/Button',
		component: Button,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<Button>Click me</Button>
	{/snippet}
</Story>

<Story name="With Emoji">
	{#snippet template()}
		<Button>Save 💾</Button>
	{/snippet}
</Story>

<Story name="Long Text">
	{#snippet template()}
		<Button>This is a button with longer text</Button>
	{/snippet}
</Story>
