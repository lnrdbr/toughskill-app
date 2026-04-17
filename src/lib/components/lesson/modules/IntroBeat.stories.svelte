<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import IntroBeat from './IntroBeat.svelte';

	const { Story } = defineMeta({
		title: 'Lesson/Modules/IntroBeat',
		component: IntroBeat,
		tags: ['autodocs']
	});
</script>

<Story name="Act 1 — Awakening">
	{#snippet template()}
		<IntroBeat
			moduleId="story-intro-1"
			body="Creativity isn't a talent. It's a way of noticing."
			oncomplete={(data) => console.log('Intro ack:', data)}
		/>
	{/snippet}
</Story>

<Story name="Act 2 — Unblocking">
	{#snippet template()}
		<IntroBeat
			moduleId="story-intro-2"
			body="Limits don't cage creativity. They shape it."
			oncomplete={(data) => console.log('Intro ack:', data)}
		/>
	{/snippet}
</Story>

<Story name="Closing beat">
	{#snippet template()}
		<IntroBeat
			moduleId="story-intro-3"
			body="The journey continues — not here, but in how you look at everything from now on."
			oncomplete={(data) => console.log('Intro ack:', data)}
		/>
	{/snippet}
</Story>
