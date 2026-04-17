<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PhotoCapture from './PhotoCapture.svelte';

	const { Story } = defineMeta({
		title: 'Lesson/Modules/PhotoCapture',
		component: PhotoCapture,
		tags: ['autodocs']
	});
</script>

<Story name="The hidden detail">
	{#snippet template()}
		<PhotoCapture
			moduleId="story-photo-1"
			prompt="Photograph one ordinary thing you've never really looked at."
			oncomplete={(data) => console.log('Photo saved:', data)}
		/>
	{/snippet}
</Story>

<Story name="With custom caption prompt">
	{#snippet template()}
		<PhotoCapture
			moduleId="story-photo-2"
			prompt="Find something that feels alive."
			captionPrompt="In one line, why this?"
			oncomplete={(data) => console.log('Photo saved:', data)}
		/>
	{/snippet}
</Story>
