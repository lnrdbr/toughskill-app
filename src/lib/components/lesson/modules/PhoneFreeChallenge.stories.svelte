<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PhoneFreeChallenge from './PhoneFreeChallenge.svelte';

	const { Story } = defineMeta({
		title: 'Lesson/Modules/PhoneFreeChallenge',
		component: PhoneFreeChallenge,
		tags: ['autodocs']
	});
</script>

<Story name="One minute">
	{#snippet template()}
		<PhoneFreeChallenge
			moduleId="story-phone-free-1"
			durationSeconds={60}
			oncomplete={(data) => console.log('Phone-free done:', data)}
		/>
	{/snippet}
</Story>

<Story name="Two minutes (boredom)">
	{#snippet template()}
		<PhoneFreeChallenge
			moduleId="story-phone-free-2"
			durationSeconds={120}
			oncomplete={(data) => console.log('Phone-free done:', data)}
		/>
	{/snippet}
</Story>

<Story name="Short (15s)">
	{#snippet template()}
		<PhoneFreeChallenge
			moduleId="story-phone-free-3"
			durationSeconds={15}
			oncomplete={(data) => console.log('Phone-free done:', data)}
		/>
	{/snippet}
</Story>
