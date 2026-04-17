<script lang="ts">
	import type { Act, Lesson, Module } from '$lib/types/course';
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
		acts = [],
		selectedSlug = null,
		onSelect,
		onStart
	}: {
		lessons: Lesson[];
		lessonProgress: Record<string, { completed: number; total: number; started?: boolean }>;
		acts?: Act[];
		selectedSlug?: string | null;
		onSelect?: (lesson: Lesson) => void;
		onStart?: (lesson: Lesson) => void;
	} = $props();

	// Map of lessonSlug → act title, so we can render a header row above that lesson.
	let actHeadingBySlug = $derived(
		new Map(acts.map((a) => [a.startLessonSlug, a.title]))
	);

	function getStatus(lessonSlug: string): 'completed' | 'in-progress' | 'not-started' {
		const progress = lessonProgress[lessonSlug];
		if (!progress) return 'not-started';
		if (progress.total > 0 && progress.completed >= progress.total) return 'completed';
		if (progress.completed > 0 || progress.started) return 'in-progress';
		return 'not-started';
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
		{@const actTitle = actHeadingBySlug.get(lesson.slug)}

		{#if actTitle}
			<div class="act-divider" data-testid="act-divider" role="separator" aria-label={actTitle}>
				<span class="act-line" aria-hidden="true"></span>
				<span class="act-title">{actTitle}</span>
				<span class="act-line" aria-hidden="true"></span>
			</div>
		{/if}

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

	.act-divider {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		/* Pull the divider outside the snake offset so it always spans the path. */
		transform: translateX(0);
	}

	.act-line {
		flex: 1;
		height: 1px;
		background: color-mix(in srgb, var(--color-foreground) 20%, transparent);
	}

	.act-title {
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: color-mix(in srgb, var(--color-foreground) 55%, transparent);
		text-transform: uppercase;
		white-space: nowrap;
	}
</style>
