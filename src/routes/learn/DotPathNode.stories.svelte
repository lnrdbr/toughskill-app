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
	args={{
		status: 'not-started',
		label: 'Warming up',
		icon: 'mdi:dumbbell',
		onclick: () => {}
	}}
/>

<Story
	name="In Progress (half)"
	args={{
		status: 'in-progress',
		label: 'Finding shape',
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
		label: 'Making links',
		icon: 'mdi:vector-link',
		completed: 1,
		total: 4,
		onclick: () => {}
	}}
/>

<Story
	name="Completed"
	args={{
		status: 'completed',
		label: 'Atoms and ideas',
		icon: 'mdi:atom',
		onclick: () => {}
	}}
/>

<Story
	name="Selected"
	args={{
		status: 'not-started',
		label: 'Taking flight',
		icon: 'mdi:feather',
		selected: true,
		onclick: () => {}
	}}
/>
