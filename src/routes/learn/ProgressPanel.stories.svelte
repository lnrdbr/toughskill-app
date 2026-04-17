<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProgressPanel from './ProgressPanel.svelte';

	const { Story } = defineMeta({
		title: 'Learn/ProgressPanel',
		component: ProgressPanel,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import type { Lesson } from '$lib/types/course';

	const idleLessons: Lesson[] = [
		{
			id: 'l-1',
			title: 'Preparation',
			slug: 'preparation',
			description: 'Warm up.',
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
		},
		{
			id: 'l-2',
			title: 'Ideation',
			slug: 'ideation',
			description: 'Generate ideas.',
			icon: 'mdi:lightbulb',
			estimatedMinutes: 15,
			modules: [
				{
					type: 'exercise',
					id: 'm-5',
					title: 'E',
					componentId: 'DivergentThinking',
					estimatedMinutes: 5,
					config: {}
				},
				{
					type: 'exercise',
					id: 'm-6',
					title: 'F',
					componentId: 'DivergentThinking',
					estimatedMinutes: 5,
					config: {}
				},
				{
					type: 'exercise',
					id: 'm-7',
					title: 'G',
					componentId: 'DivergentThinking',
					estimatedMinutes: 5,
					config: {}
				},
				{
					type: 'exercise',
					id: 'm-8',
					title: 'H',
					componentId: 'DivergentThinking',
					estimatedMinutes: 5,
					config: {}
				},
				{
					type: 'exercise',
					id: 'm-9',
					title: 'I',
					componentId: 'DivergentThinking',
					estimatedMinutes: 5,
					config: {}
				}
			]
		}
	];
</script>

<Story name="Empty">
	{#snippet template()}
		<ProgressPanel lessons={idleLessons} lessonProgress={{}} courseId="creativity" />
	{/snippet}
</Story>

<Story name="In progress">
	{#snippet template()}
		<ProgressPanel
			lessons={idleLessons}
			courseId="creativity"
			lessonProgress={{
				preparation: { completed: 2, total: 4, started: true },
				ideation: { completed: 1, total: 5, started: true }
			}}
		/>
	{/snippet}
</Story>

<Story name="Complete">
	{#snippet template()}
		<ProgressPanel
			lessons={idleLessons}
			courseId="creativity"
			lessonProgress={{
				preparation: { completed: 4, total: 4, started: true },
				ideation: { completed: 5, total: 5, started: true }
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
