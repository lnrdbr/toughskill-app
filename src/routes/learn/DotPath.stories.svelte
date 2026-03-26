<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DotPath from './DotPath.svelte';

	const { Story } = defineMeta({
		title: 'Components/Learn/DotPath',
		component: DotPath,
		tags: ['autodocs']
	});

	const lessons = [
		{
			id: 'creativity-preparation',
			title: 'Preparation',
			slug: 'preparation',
			description: 'Warm up your creative muscles with classic divergent thinking challenges.',
			modules: [
				{ type: 'exercise', id: 'mod-1', title: 'Paperclip', componentId: 'DivergentThinking', estimatedMinutes: 5, config: {} },
				{ type: 'exercise', id: 'mod-2', title: 'Brick', componentId: 'DivergentThinking', estimatedMinutes: 5, config: {} }
			],
			estimatedMinutes: 10
		},
		{
			id: 'creativity-exploration',
			title: 'Exploration',
			slug: 'exploration',
			description: 'Explore creative techniques through guided exercises.',
			modules: [
				{ type: 'exercise', id: 'mod-3', title: 'Brainstorm', componentId: 'DivergentThinking', estimatedMinutes: 5, config: {} }
			],
			estimatedMinutes: 5
		},
		{
			id: 'creativity-application',
			title: 'Application',
			slug: 'application',
			description: 'Apply what you learned to real-world scenarios.',
			modules: [
				{ type: 'exercise', id: 'mod-4', title: 'Scenario', componentId: 'DivergentThinking', estimatedMinutes: 10, config: {} },
				{ type: 'exercise', id: 'mod-5', title: 'Reflection', componentId: 'DivergentThinking', estimatedMinutes: 5, config: {} }
			],
			estimatedMinutes: 15
		}
	];
</script>

<Story name="Mixed Progress" args={{
	courseId: 'creativity',
	lessons,
	lessonProgress: {
		preparation: { completed: 2, total: 2 },
		exploration: { completed: 1, total: 1 },
		application: { completed: 0, total: 2 }
	}
}} />

<Story name="All Not Started" args={{
	courseId: 'creativity',
	lessons,
	lessonProgress: {
		preparation: { completed: 0, total: 2 },
		exploration: { completed: 0, total: 1 },
		application: { completed: 0, total: 2 }
	}
}} />

<Story name="All Completed" args={{
	courseId: 'creativity',
	lessons,
	lessonProgress: {
		preparation: { completed: 2, total: 2 },
		exploration: { completed: 1, total: 1 },
		application: { completed: 2, total: 2 }
	}
}} />
