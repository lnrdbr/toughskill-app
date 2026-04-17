<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ReflectionPrompt from './ReflectionPrompt.svelte';

	const { Story } = defineMeta({
		title: 'Lesson/Modules/ReflectionPrompt',
		component: ReflectionPrompt,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		<ReflectionPrompt
			moduleId="story-reflection-1"
			prompt="What does creativity mean to you?"
			oncomplete={(data) => console.log('Reflection submitted:', data)}
		/>
	{/snippet}
</Story>

<Story name="With minimum length">
	{#snippet template()}
		<ReflectionPrompt
			moduleId="story-reflection-2"
			prompt="Describe a moment when you felt most creative."
			minLength={80}
			oncomplete={(data) => console.log('Reflection submitted:', data)}
		/>
	{/snippet}
</Story>

<Story name="Short prompt">
	{#snippet template()}
		<ReflectionPrompt
			moduleId="story-reflection-3"
			prompt="One word for how you feel right now."
			minLength={2}
			oncomplete={(data) => console.log('Reflection submitted:', data)}
		/>
	{/snippet}
</Story>
