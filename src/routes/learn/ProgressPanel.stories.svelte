<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProgressPanel from './ProgressPanel.svelte';

	const { Story } = defineMeta({
		title: 'Learn/ProgressPanel',
		component: ProgressPanel,
		tags: ['autodocs']
	});
</script>

<Story name="Empty">
	{#snippet template()}
		<ProgressPanel lessonProgress={{}} />
	{/snippet}
</Story>

<Story name="In progress">
	{#snippet template()}
		<ProgressPanel
			lessonProgress={{
				preparation: { completed: 2, total: 4 },
				ideation: { completed: 1, total: 5 }
			}}
		/>
	{/snippet}
</Story>

<Story name="Complete">
	{#snippet template()}
		<ProgressPanel
			lessonProgress={{
				preparation: { completed: 4, total: 4 },
				ideation: { completed: 5, total: 5 }
			}}
			praise="Outstanding! Keep going 🚀"
		/>
	{/snippet}
</Story>

<Story name="Selected lesson (not started)">
	{#snippet template()}
		<ProgressPanel
			lessonProgress={{ preparation: { completed: 0, total: 4 } }}
			courseId="creativity"
			selectedLesson={{
				id: 'l-1',
				title: 'Preparation',
				slug: 'preparation',
				description: 'Warm up your creative muscles before diving into the main exercises.',
				icon: 'mdi:dumbbell',
				estimatedMinutes: 10,
				modules: [
					{
						type: 'exercise',
						id: 'm-1',
						title: 'A',
						componentId: 'DivergentThinking',
						estimatedMinutes: 5,
						config: {}
					},
					{
						type: 'exercise',
						id: 'm-2',
						title: 'B',
						componentId: 'DivergentThinking',
						estimatedMinutes: 5,
						config: {}
					},
					{
						type: 'exercise',
						id: 'm-3',
						title: 'C',
						componentId: 'DivergentThinking',
						estimatedMinutes: 5,
						config: {}
					},
					{
						type: 'exercise',
						id: 'm-4',
						title: 'D',
						componentId: 'DivergentThinking',
						estimatedMinutes: 5,
						config: {}
					}
				]
			}}
		/>
	{/snippet}
</Story>

<Story name="Selected lesson (in progress)">
	{#snippet template()}
		<ProgressPanel
			lessonProgress={{ preparation: { completed: 2, total: 4 } }}
			courseId="creativity"
			selectedLesson={{
				id: 'l-1',
				title: 'Preparation',
				slug: 'preparation',
				description: 'Warm up your creative muscles before diving into the main exercises.',
				icon: 'mdi:dumbbell',
				estimatedMinutes: 10,
				modules: [
					{
						type: 'exercise',
						id: 'm-1',
						title: 'A',
						componentId: 'DivergentThinking',
						estimatedMinutes: 5,
						config: {}
					},
					{
						type: 'exercise',
						id: 'm-2',
						title: 'B',
						componentId: 'DivergentThinking',
						estimatedMinutes: 5,
						config: {}
					},
					{
						type: 'exercise',
						id: 'm-3',
						title: 'C',
						componentId: 'DivergentThinking',
						estimatedMinutes: 5,
						config: {}
					},
					{
						type: 'exercise',
						id: 'm-4',
						title: 'D',
						componentId: 'DivergentThinking',
						estimatedMinutes: 5,
						config: {}
					}
				]
			}}
		/>
	{/snippet}
</Story>
