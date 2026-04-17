<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DotPathNode from './DotPathNode.svelte';

	const { Story } = defineMeta({
		title: 'Components/Learn/DotPathNode',
		component: DotPathNode,
		tags: ['autodocs']
	});
</script>

<Story
	name="Not Started"
	args={{ status: 'not-started', icon: 'mdi:dumbbell', onclick: () => {} }}
/>

<Story
	name="In Progress (half)"
	args={{
		status: 'in-progress',
		icon: 'mdi:shape-outline',
		completed: 3,
		total: 6,
		onclick: () => {}
	}}
/>

<Story
	name="In Progress (quarter)"
	args={{
		status: 'in-progress',
		icon: 'mdi:vector-link',
		completed: 1,
		total: 4,
		onclick: () => {}
	}}
/>

<Story
	name="Completed"
	args={{ status: 'completed', icon: 'mdi:atom', onclick: () => {} }}
/>

<Story
	name="Selected"
	args={{ status: 'not-started', icon: 'mdi:feather', selected: true, onclick: () => {} }}
/>
