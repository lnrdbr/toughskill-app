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
		stickyTop = '0',
		onSelect,
		onStart
	}: {
		lessons: Lesson[];
		lessonProgress: Record<string, { completed: number; total: number; started?: boolean }>;
		acts?: Act[];
		selectedSlug?: string | null;
		/** Offset from the scroll container top at which act headers should pin. */
		stickyTop?: string;
		onSelect?: (lesson: Lesson) => void;
		onStart?: (lesson: Lesson) => void;
	} = $props();

	// Group lessons into sections, one per act. A leading "no-act" section holds any
	// lessons that appear before the first act's start lesson (if the course uses acts).
	type Section = { actTitle: string | null; startIndex: number; lessons: Lesson[] };
	let sections = $derived.by<Section[]>(() => {
		if (acts.length === 0) {
			return [{ actTitle: null, startIndex: 0, lessons }];
		}
		const startSlugs = new Map(acts.map((a) => [a.startLessonSlug, a.title]));
		const result: Section[] = [];
		let current: Section = { actTitle: null, startIndex: 0, lessons: [] };
		lessons.forEach((lesson, idx) => {
			const actTitle = startSlugs.get(lesson.slug);
			if (actTitle !== undefined) {
				if (current.lessons.length > 0) result.push(current);
				current = { actTitle, startIndex: idx, lessons: [lesson] };
			} else {
				current.lessons.push(lesson);
			}
		});
		if (current.lessons.length > 0) result.push(current);
		return result;
	});

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

<div class="dot-path flex flex-col items-stretch">
	{#each sections as section, sIdx (section.actTitle ?? `no-act-${sIdx}`)}
		<section class="act-section" data-testid="act-section">
			{#if section.actTitle}
				<h2
					class="act-heading"
					data-testid="act-heading"
					style="top: {stickyTop};"
				>
					{section.actTitle}
				</h2>
			{/if}
			<div class="act-lessons flex flex-col items-center gap-7">
				{#each section.lessons as lesson, li (lesson.slug)}
					{@const globalIdx = section.startIndex + li}
					{@const status = getStatus(lesson.slug)}
					{@const isSelected = selectedSlug === lesson.slug}
					{@const progress = lessonProgress[lesson.slug]}
					{@const offset = getDotOffset(globalIdx)}

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
		</section>
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

	.act-section {
		display: flex;
		flex-direction: column;
		/* Section is its own sticky container: when it scrolls out, the sticky header
		   unsticks with it and the next section's header takes over at the top. */
	}

	.act-section + .act-section {
		margin-top: 1.75rem;
	}

	.act-heading {
		position: sticky;
		top: 0;
		z-index: 5;
		margin: 0 0 1.25rem;
		padding: 0.75rem 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-foreground);
		background: var(--color-background);
		text-align: left;
	}
</style>
