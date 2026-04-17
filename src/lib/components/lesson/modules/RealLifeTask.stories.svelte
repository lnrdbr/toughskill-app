<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RealLifeTask from './RealLifeTask.svelte';

	const { Story } = defineMeta({
		title: 'Lesson/Modules/RealLifeTask',
		component: RealLifeTask,
		tags: ['autodocs']
	});
</script>

<Story name="Notice one creative thing">
	{#snippet template()}
		<RealLifeTask
			moduleId="story-task-1"
			instruction="Today, notice one creative thing someone else did. Could be a sign, a lunch box, a way of speaking."
			feedbackPrompt="What did you notice, and why did it stand out?"
			oncomplete={(data) => console.log('Task complete:', data)}
		/>
	{/snippet}
</Story>

<Story name="Take a new path">
	{#snippet template()}
		<RealLifeTask
			moduleId="story-task-2"
			instruction="On your next walk, take a route you've never taken before."
			feedbackPrompt="What did the new path feel like?"
			returnAfterMinutes={20}
			oncomplete={(data) => console.log('Task complete:', data)}
		/>
	{/snippet}
</Story>

<Story name="Creative act for someone">
	{#snippet template()}
		<RealLifeTask
			moduleId="story-task-3"
			instruction="Do something small and creative for another person today. No budget, no pressure."
			feedbackPrompt="What did you do? How did it land?"
			oncomplete={(data) => console.log('Task complete:', data)}
		/>
	{/snippet}
</Story>
