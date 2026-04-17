<script lang="ts">
	import Cloudy from '$lib/assets/cloudy.png';
	import Button from '$lib/components/Button.svelte';
	import type { Lesson } from '$lib/types/course';

	type Progress = { completed: number; total: number };

	let {
		lessonProgress = {},
		praise = "I'm proud of you! Keep doing what you do :) 🎉",
		selectedLesson = null,
		courseId
	}: {
		lessonProgress?: Record<string, Progress>;
		praise?: string;
		selectedLesson?: Lesson | null;
		courseId?: string;
	} = $props();

	let totals = $derived(
		Object.values(lessonProgress).reduce(
			(acc, p) => ({
				completed: acc.completed + p.completed,
				total: acc.total + p.total
			}),
			{ completed: 0, total: 0 }
		)
	);

	let percent = $derived(
		totals.total === 0 ? 0 : Math.round((totals.completed / totals.total) * 100)
	);

	// Animate the progress-ring from empty (dashOffset 100) to the target on mount.
	let animatedPercent = $state(0);
	$effect(() => {
		const target = percent;
		animatedPercent = 0;
		const id = requestAnimationFrame(() => {
			animatedPercent = target;
		});
		return () => cancelAnimationFrame(id);
	});
	let dashOffset = $derived(100 - animatedPercent);

	// Selected-lesson progress
	let lessonProgressEntry = $derived(
		selectedLesson ? lessonProgress[selectedLesson.slug] : undefined
	);
	let lessonCompleted = $derived(lessonProgressEntry?.completed ?? 0);
	let lessonTotal = $derived(
		lessonProgressEntry?.total ?? selectedLesson?.modules.length ?? 0
	);
	let lessonPercent = $derived(
		lessonTotal === 0 ? 0 : Math.round((lessonCompleted / lessonTotal) * 100)
	);
	let lessonStatus = $derived<'completed' | 'in-progress' | 'not-started'>(
		lessonCompleted === 0
			? 'not-started'
			: lessonCompleted >= lessonTotal
				? 'completed'
				: 'in-progress'
	);

	// Animate the lesson progress bar from 0 on mount / lesson change.
	let animatedLessonPercent = $state(0);
	$effect(() => {
		if (!selectedLesson) {
			animatedLessonPercent = 0;
			return;
		}
		const target = lessonPercent;
		animatedLessonPercent = 0;
		const id = requestAnimationFrame(() => {
			animatedLessonPercent = target;
		});
		return () => cancelAnimationFrame(id);
	});

	// Scroll-driven rotation of the cloud.
	let scrollRotation = $state(0);
	$effect(() => {
		const handler = (e: Event) => {
			const t = e.target;
			if (t instanceof Element && t.classList.contains('content')) {
				scrollRotation = t.scrollTop * 0.4;
			}
		};
		document.addEventListener('scroll', handler, true);
		return () => document.removeEventListener('scroll', handler, true);
	});
</script>

<aside class="panel" aria-label="Progress">
	{#if selectedLesson}
		<div class="lesson-view" data-testid="lesson-view">
			<h2 class="lesson-title">{selectedLesson.title}</h2>

			<div
				class="progress-bar"
				role="progressbar"
				aria-valuenow={lessonPercent}
				aria-valuemin="0"
				aria-valuemax="100"
				aria-label="Lesson progress"
			>
				<div class="progress-fill" style="width: {animatedLessonPercent}%"></div>
			</div>
			<div class="progress-meta">
				{lessonCompleted} / {lessonTotal} modules · {lessonPercent}%
			</div>

			<p class="lesson-description">{selectedLesson.description}</p>

			{#if courseId}
				<form method="POST" action="/lesson" class="start-form">
					<input type="hidden" name="courseId" value={courseId} />
					<input type="hidden" name="lessonSlug" value={selectedLesson.slug} />
					<Button type="submit" variant="primary" rounded="default">
						{#if lessonStatus === 'completed'}
							Revise lesson
						{:else if lessonStatus === 'in-progress'}
							Continue lesson
						{:else}
							Start lesson
						{/if}
					</Button>
				</form>
			{/if}
		</div>
	{:else}
		<div class="idle-view" data-testid="idle-view">
			<div class="progress-ring-wrap">
				<div class="progress-ring">
					<svg class="progress-ring-svg" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
						<circle cx="18" cy="18" r="16" fill="none" class="track" stroke-width="2"></circle>
						<circle
							cx="18"
							cy="18"
							r="16"
							fill="none"
							class="progress"
							stroke-width="2"
							stroke-dasharray="100"
							stroke-dashoffset={dashOffset}
							stroke-linecap="round"
						></circle>
					</svg>
					<div class="percent" aria-label="{percent} percent complete">{percent}%</div>
				</div>

				<img
					src={Cloudy}
					alt=""
					class="cloud"
					style="transform: rotate({scrollRotation}deg);"
					data-testid="cloud"
				/>
			</div>

			<div class="quote" data-testid="praise">{praise}</div>
		</div>
	{/if}
</aside>

<style>
	.panel {
		position: sticky;
		top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		/* No background / no border-radius / no inner padding — panel is transparent. */
	}

	/* Idle view (default) */
	.idle-view {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.progress-ring-wrap {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.progress-ring {
		position: relative;
		width: 9rem;
		height: 9rem;
		flex-shrink: 0;
	}

	.progress-ring-svg {
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.track {
		stroke: currentColor;
		color: color-mix(in srgb, var(--color-foreground) 10%, transparent);
	}

	.progress {
		stroke: var(--color-primary-500);
		transition: stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.percent {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-primary-700);
	}

	.cloud {
		width: 7rem;
		height: auto;
		object-fit: contain;
		filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.18));
		animation: cloud-bob 3.2s ease-in-out infinite;
		transform-origin: 50% 50%;
		transition: transform 0.12s ease-out;
	}

	.quote {
		font-style: italic;
		font-weight: 300;
		line-height: 1.35;
		color: var(--color-foreground);
		animation: quote-bob 2.6s ease-in-out infinite;
		transform-origin: 50% 100%;
	}

	/* Lesson view */
	.lesson-view {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.lesson-title {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-foreground);
	}

	.progress-bar {
		width: 100%;
		height: 0.75rem;
		background: color-mix(in srgb, var(--color-foreground) 8%, transparent);
		border: none;
		outline: none;
		border-radius: 999px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-primary-500);
		border-radius: 999px;
		transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.progress-meta {
		font-size: 0.85rem;
		color: var(--color-muted-foreground);
	}

	.lesson-description {
		margin: 0.25rem 0 0;
		color: var(--color-foreground);
		line-height: 1.5;
	}

	.start-form {
		margin-top: 0.5rem;
	}

	@keyframes cloud-bob {
		0%,
		100% {
			translate: 0 -3px;
		}
		50% {
			translate: 0 3px;
		}
	}

	@keyframes quote-bob {
		0%,
		100% {
			translate: 0 -2px;
		}
		50% {
			translate: 0 2px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cloud,
		.quote {
			animation: none;
		}
	}
</style>
