<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LessonDetailCard from './LessonDetailCard.svelte';

	const { Story } = defineMeta({
		title: 'Components/Learn/LessonDetailCard',
		component: LessonDetailCard,
		tags: ['autodocs']
	});
</script>

<Story
	name="Not Started"
	args={{
		title: 'Preparation',
		description: 'Warm up your creative muscles with classic divergent thinking challenges.',
		completed: 0,
		total: 2,
		courseId: 'creativity',
		lessonSlug: 'preparation',
		status: 'not-started'
	}}
/>

<Story
	name="In Progress"
	args={{
		title: 'Preparation',
		description: 'Warm up your creative muscles with classic divergent thinking challenges.',
		completed: 1,
		total: 2,
		courseId: 'creativity',
		lessonSlug: 'preparation',
		status: 'in-progress'
	}}
/>

<Story
	name="Completed"
	args={{
		title: 'Preparation',
		description: 'Warm up your creative muscles with classic divergent thinking challenges.',
		completed: 2,
		total: 2,
		courseId: 'creativity',
		lessonSlug: 'preparation',
		status: 'completed'
	}}
/>
