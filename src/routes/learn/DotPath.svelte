<script lang="ts">
	import type { Lesson } from '$lib/types/course';
	import DotPathNode from './DotPathNode.svelte';
	import LessonDetailCard from './LessonDetailCard.svelte';

	let {
		lessons,
		lessonProgress,
		courseId
	}: {
		lessons: Lesson[];
		lessonProgress: Record<string, { completed: number; total: number }>;
		courseId: string;
	} = $props();

	let selectedIndex: number | null = $state(null);

	function getStatus(lessonSlug: string): 'completed' | 'in-progress' | 'not-started' {
		const progress = lessonProgress[lessonSlug];
		if (!progress || progress.completed === 0) return 'not-started';
		if (progress.completed >= progress.total) return 'completed';
		return 'in-progress';
	}

	/** Snake pattern: dots weave left→center→right→center→left... */
	const offsets = [0, -1, -1, 0, 1, 1];
	function getDotOffset(index: number): number {
		return offsets[index % offsets.length];
	}
</script>

<div class="dot-path flex flex-col items-center gap-7">
	{#each lessons as lesson, i (lesson.slug)}
		{@const status = getStatus(lesson.slug)}
		{@const isSelected = selectedIndex === i}
		{@const progress = lessonProgress[lesson.slug]}
		{@const offset = getDotOffset(i)}

		<div class="dot-step flex flex-col items-center gap-2" style="--offset: {offset}">
			<DotPathNode
				{status}
				icon={lesson.icon}
				completed={progress?.completed ?? 0}
				total={progress?.total ?? lesson.modules.length}
				selected={isSelected}
				onclick={() => (selectedIndex = selectedIndex === i ? null : i)}
			/>

			<span class="dot-label text-sm font-semibold">{lesson.title}</span>
		</div>

		{#if isSelected}
			<LessonDetailCard
				title={lesson.title}
				description={lesson.description}
				completed={progress?.completed ?? 0}
				total={progress?.total ?? lesson.modules.length}
				{courseId}
				lessonSlug={lesson.slug}
				{status}
			/>
		{/if}
	{/each}
</div>

<style>
	.dot-step {
		transform: translateX(calc(var(--offset) * 60px));
		transition: transform 0.3s ease;
	}

	.dot-label {
		color: var(--color-foreground);
		text-align: center;
		white-space: nowrap;
	}
</style>
