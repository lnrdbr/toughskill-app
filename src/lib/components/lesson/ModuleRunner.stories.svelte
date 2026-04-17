<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ModuleRunner from './ModuleRunner.svelte';

	const { Story } = defineMeta({
		title: 'Lesson/ModuleRunner',
		component: ModuleRunner,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<ModuleRunner
			module={{
				id: 'mod-divergent-1',
				type: 'exercise',
				title: 'Paperclip Challenge',
				componentId: 'DivergentThinking',
				estimatedMinutes: 5,
				config: {
					prompt: 'Paperclip',
					instruction: 'How many uses can you think of for a paperclip?'
				}
			}}
			oncomplete={(result) => console.log('Module completed:', result)}
		/>
	{/snippet}
</Story>

<Story name="Unknown Module">
	{#snippet template()}
		<ModuleRunner
			module={{
				id: 'mod-unknown-1',
				type: 'exercise',
				title: 'Missing Exercise',
				componentId: 'NonExistentModule',
				estimatedMinutes: 5,
				config: {}
			}}
		/>
	{/snippet}
</Story>
