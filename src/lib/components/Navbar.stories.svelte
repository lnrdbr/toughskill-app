<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Navbar from './Navbar.svelte';

	const { Story } = defineMeta({
		title: 'Components/Navbar',
		component: Navbar,
		tags: ['autodocs']
	});
</script>

<Story name="Logged out">
	{#snippet template()}
		<Navbar user={null} />
	{/snippet}
</Story>

<Story name="Anonymous">
	{#snippet template()}
		<Navbar user={{ id: 'anon-1', isAnonymous: true }} />
	{/snippet}
</Story>

<Story name="Authenticated (name)">
	{#snippet template()}
		<Navbar user={{ id: 'u-1', name: 'Ada Lovelace', email: 'ada@example.com' }} />
	{/snippet}
</Story>

<Story name="Authenticated (email only)">
	{#snippet template()}
		<Navbar user={{ id: 'u-2', email: 'bob@example.com' }} />
	{/snippet}
</Story>
