<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DotPathNode from './DotPathNode.svelte';

	const { Story } = defineMeta({
		title: 'Components/Learn/DotPathNode',
		component: DotPathNode,
		tags: ['autodocs']
	});
</script>

<Story name="Not Started" args={{ status: 'not-started', onclick: () => {} }} />

<Story name="In Progress" args={{ status: 'in-progress', onclick: () => {} }} />

<Story name="Completed" args={{ status: 'completed', onclick: () => {} }} />

<Story name="Selected" args={{ status: 'not-started', selected: true, onclick: () => {} }} />
