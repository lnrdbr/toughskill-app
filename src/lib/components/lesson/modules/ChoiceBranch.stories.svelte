<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ChoiceBranch from './ChoiceBranch.svelte';

	const { Story } = defineMeta({
		title: 'Lesson/Modules/ChoiceBranch',
		component: ChoiceBranch,
		tags: ['autodocs']
	});
</script>

<Story name="Myth of the creative (single)">
	{#snippet template()}
		<ChoiceBranch
			moduleId="story-choice-1"
			prompt="Creativity is…"
			options={[
				{ id: 'artists', label: 'For artists only', body: 'A common myth — we\'re about to bust it.' },
				{ id: 'everyone', label: 'For everyone', body: 'This is the premise of the course.' },
				{ id: 'kids', label: 'Only for kids', body: 'Nope — though kids are unreasonably good at it.' }
			]}
			oncomplete={(data) => console.log('Choice:', data)}
		/>
	{/snippet}
</Story>

<Story name="How far you've come (multi)">
	{#snippet template()}
		<ChoiceBranch
			moduleId="story-choice-2"
			prompt="Which have you tried?"
			options={[
				{ id: 'paperclip', label: 'The paperclip test' },
				{ id: 'one-rule', label: 'Writing with one rule' },
				{ id: 'new-path', label: 'Taking a new path' },
				{ id: 'analogy', label: 'An analogy sprint' }
			]}
			allowMultiple={true}
			oncomplete={(data) => console.log('Choice:', data)}
		/>
	{/snippet}
</Story>

<Story name="Sharing framing (single)">
	{#snippet template()}
		<ChoiceBranch
			moduleId="story-choice-3"
			prompt="If you shared something you made, how would you rather frame it?"
			options={[
				{ id: 'in-progress', label: 'As a work in progress' },
				{ id: 'finished', label: 'As a finished piece' },
				{ id: 'question', label: 'As a question to others' }
			]}
			oncomplete={(data) => console.log('Choice:', data)}
		/>
	{/snippet}
</Story>
