<script lang="ts">
	import type { Lesson, Module } from '$lib/types/course';
	import DotPathNode from './DotPathNode.svelte';

	const TYPE_ICONS: Record<Module['type'], string> = {
		intro: 'mdi:book-open-page-variant-outline',
		reflection: 'mdi:pencil-outline',
		real_life_task: 'mdi:walk',
		meditation: 'mdi:meditation',
		phone_free: 'mdi:cellphone-off',
		photo: 'mdi:camera-outline',
		choice: 'mdi:arrow-decision-outline',
		recall: 'mdi:history',
		exercise: 'mdi:dumbbell',
		learning: 'mdi:school-outline',
		results: 'mdi:chart-box-outline'
	};

	function getTypeIcon(lesson: Lesson): string | null {
		const first = lesson.modules[0];
		return first ? (TYPE_ICONS[first.type] ?? null) : null;
	}

	let {
		lessons,
		lessonProgress,
		selectedSlug = null,
		onSelect,
		onStart
	}: {
		lessons: Lesson[];
		lessonProgress: Record<string, { completed: number; total: number }>;
		selectedSlug?: string | null;
		onSelect?: (lesson: Lesson) => void;
		onStart?: (lesson: Lesson) => void;
	} = $props();

	function getStatus(lessonSlug: string): 'completed' | 'in-progress' | 'not-started' {
		const progress = lessonProgress[lessonSlug];
		if (!progress || progress.completed === 0) return 'not-started';
		if (progress.completed >= progress.total) return 'completed';
		return 'in-progress';
	}

	function handleClick(lesson: Lesson) {
		// Clicking the already-selected dot is a no-op (deselect happens via outside click).
		if (selectedSlug === lesson.slug) return;
		onSelect?.(lesson);
	}

	function handleDblClick(lesson: Lesson) {
		onStart?.(lesson);
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
		{@const isSelected = selectedSlug === lesson.slug}
		{@const progress = lessonProgress[lesson.slug]}
		{@const offset = getDotOffset(i)}

		<div
			class="dot-step flex flex-col items-center gap-2"
			style="--offset: {offset}"
			ondblclick={() => handleDblClick(lesson)}
			role="presentation"
		>
			<DotPathNode
				{status}
				icon={lesson.icon}
				typeIcon={getTypeIcon(lesson)}
				completed={progress?.completed ?? 0}
				total={progress?.total ?? lesson.modules.length}
				selected={isSelected}
				onclick={() => handleClick(lesson)}
			/>

			<span class="dot-label text-sm font-semibold">{lesson.title}</span>
		</div>
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
		user-select: none;
	}
</style>
