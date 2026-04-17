<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MeditationTimer from './MeditationTimer.svelte';

	const { Story } = defineMeta({
		title: 'Lesson/Modules/MeditationTimer',
		component: MeditationTimer,
		tags: ['autodocs']
	});
</script>

<Story name="Breathing (2 min)">
	{#snippet template()}
		<MeditationTimer
			moduleId="story-meditation-1"
			durationSeconds={120}
			style="breathing"
			oncomplete={(data) => console.log('Meditation done:', data)}
		/>
	{/snippet}
</Story>

<Story name="Silence (2 min)">
	{#snippet template()}
		<MeditationTimer
			moduleId="story-meditation-2"
			durationSeconds={120}
			style="silence"
			oncomplete={(data) => console.log('Meditation done:', data)}
		/>
	{/snippet}
</Story>

<Story name="Short breathing (20s)">
	{#snippet template()}
		<MeditationTimer
			moduleId="story-meditation-3"
			durationSeconds={20}
			style="breathing"
			oncomplete={(data) => console.log('Meditation done:', data)}
		/>
	{/snippet}
</Story>
