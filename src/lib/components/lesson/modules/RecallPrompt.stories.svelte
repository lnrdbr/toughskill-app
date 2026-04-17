<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RecallPrompt from './RecallPrompt.svelte';

	const { Story } = defineMeta({
		title: 'Lesson/Modules/RecallPrompt',
		component: RecallPrompt,
		tags: ['autodocs']
	});
</script>

<Story name="Finish the quote">
	{#snippet template()}
		<RecallPrompt
			moduleId="story-recall-1"
			prompt="Creativity is…"
			mode="finish-quote"
			expected="for everyone"
			oncomplete={(data) => console.log('Recall:', data)}
		/>
	{/snippet}
</Story>

<Story name="Open recall with hint">
	{#snippet template()}
		<RecallPrompt
			moduleId="story-recall-2"
			prompt="What do you remember about the paperclip test?"
			mode="open-recall"
			expected="It was about finding many uses for one ordinary object."
			oncomplete={(data) => console.log('Recall:', data)}
		/>
	{/snippet}
</Story>

<Story name="Multi-check callback">
	{#snippet template()}
		<RecallPrompt
			moduleId="story-recall-3"
			prompt="Which of these have you tried so far?"
			mode="multi-check"
			options={[
				'The paperclip test',
				'Writing with one rule',
				'Taking a new path',
				'An analogy sprint',
				'A 2-minute pause'
			]}
			oncomplete={(data) => console.log('Recall:', data)}
		/>
	{/snippet}
</Story>
