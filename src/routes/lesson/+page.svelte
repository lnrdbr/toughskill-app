<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import ModuleRunner from '$lib/components/lesson/ModuleRunner.svelte';
	import type { ModuleCompletionResult, Module } from '$lib/types/course';
	import { isComponentModule } from '$lib/types/course';
	import type { AnySubmissionResponse } from '$lib/components/exercises/types';
	import { pendingEvaluations } from '$lib/components/exercises/types';
	import { resolve } from '$app/paths';
	import { getModuleComponent } from '$lib/config/module-registry';
	import lessonFinisherSrc from '$lib/assets/lesson Finisher.wav';
	import Button from '$lib/components/Button.svelte';
	import LessonComplete from './LessonComplete.svelte';
	import { readDraft, writeDraft, clearDraft } from '$lib/client/draft';
	import {
		saveEvaluationResult,
		saveEvaluationError,
		loadEvaluation,
		listCachedEvaluationIds
	} from '$lib/client/evaluation-cache';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Snapshot the session on mount/form change so load re-runs cannot reset mid-lesson
	let session = $state(resolveSession());

	function resolveSession() {
		return form && !('error' in form) ? form : data;
	}

	function lessonIndexKey(cid: string, slug: string): string {
		return `ts:lesson-index:${cid}:${slug}`;
	}

	const initialCourseId = (session as { courseId?: string }).courseId ?? '';
	const initialLessonSlug = (session as { lessonSlug?: string }).lessonSlug ?? '';
	const initialModuleCount =
		((session as { modules?: Module[] }).modules ?? []).length;
	const savedIndex =
		initialCourseId && initialLessonSlug
			? readDraft<number>(lessonIndexKey(initialCourseId, initialLessonSlug), 0)
			: 0;

	let currentIndex = $state(
		Math.min(Math.max(savedIndex, 0), Math.max(initialModuleCount - 1, 0))
	);
	let completionResults: ModuleCompletionResult[] = $state([]);

	// Only update session when form actually changes (new POST), not on load re-runs
	$effect(() => {
		if (form && !('error' in form)) {
			session = form;
		}
	});

	let modules: Module[] = $derived((session as { modules: Module[] }).modules ?? []);
	let sessionType = $derived((session as { sessionType: string }).sessionType ?? 'empty');
	let courseId = $derived((session as { courseId?: string }).courseId ?? '');
	let lessonSlug = $derived((session as { lessonSlug?: string }).lessonSlug ?? '');
	let lessonTitle = $derived((session as { lessonTitle?: string }).lessonTitle ?? '');
	let courseTitle = $derived((session as { courseTitle?: string }).courseTitle ?? '');
	let allCompleted = $derived((session as { allCompleted?: boolean }).allCompleted ?? false);

	let pendingResult: ModuleCompletionResult | null = $state(null);
	let sessionDone = $derived(modules.length > 0 && currentIndex >= modules.length);
	let sessionKey = $derived(`${sessionType}-${courseId}-${lessonSlug}`);

	function registerEvaluation(
		exerciseModuleId: string,
		promise: Promise<AnySubmissionResponse>,
		userIdeas: string[] | Record<string, string[]>,
		prompt: string
	) {
		const entry = {
			promise,
			userIdeas,
			prompt
		} as import('$lib/components/exercises/types').PendingEvaluation;
		promise
			.then((data) => {
				entry.result = data;
				saveEvaluationResult(exerciseModuleId, data, userIdeas, prompt);
			})
			.catch((err) => {
				const message = String(err);
				entry.error = message;
				saveEvaluationError(exerciseModuleId, message, userIdeas, prompt);
			});
		pendingEvaluations[exerciseModuleId] = entry;
	}

	// Seed pendingEvaluations from any evaluations cached on a previous visit
	// so a reload mid-results (or at the results module) still shows feedback.
	for (const id of listCachedEvaluationIds()) {
		if (pendingEvaluations[id]) continue;
		const cached = loadEvaluation(id);
		if (!cached) continue;
		const entry = {
			userIdeas: cached.userIdeas as string[] | Record<string, string[]>,
			prompt: cached.prompt
		} as import('$lib/components/exercises/types').PendingEvaluation;
		if (cached.kind === 'result') {
			entry.result = cached.result;
			entry.promise = Promise.resolve(cached.result);
		} else {
			entry.error = cached.error;
			entry.promise = Promise.reject(new Error(cached.error));
			// swallow the unhandled-rejection warning; ExerciseResults attaches .catch
			entry.promise.catch(() => {});
		}
		pendingEvaluations[id] = entry;
	}

	// Preload the next module's component while the user is on the current one
	$effect(() => {
		const next = modules[currentIndex + 1];
		if (next && isComponentModule(next)) {
			getModuleComponent(next.componentId)?.();
		}
	});

	// Register that the user opened this module. The endpoint is idempotent
	// per (user, module) so firing on every index change is safe — re-views
	// are silent no-ops. Non-blocking; a failed view write never blocks the UI.
	$effect(() => {
		const current = modules[currentIndex];
		if (!current || !courseId || !lessonSlug) return;
		fetch('/api/views', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			keepalive: true,
			body: JSON.stringify({ moduleId: current.id, courseId, lessonSlug })
		}).catch((err) => {
			console.error('[lesson] Failed to record view:', err);
		});
	});

	$effect(() => {
		if (sessionDone) {
			new Audio(lessonFinisherSrc).play();
		}
	});

	// Persist (or clear) the in-session module index so a reload restores position
	$effect(() => {
		if (!courseId || !lessonSlug) return;
		const key = lessonIndexKey(courseId, lessonSlug);
		if (sessionDone) {
			clearDraft(key);
			return;
		}
		writeDraft<number>(key, currentIndex);
	});

	function handleModuleComplete(result: ModuleCompletionResult) {
		pendingResult = result;

		// Extract background evaluation promise before saving
		if (result.data?._evaluationPromise) {
			registerEvaluation(
				result.moduleId,
				result.data._evaluationPromise as Promise<AnySubmissionResponse>,
				(result.data._userBubbles as string[]) ?? [],
				(result.data._prompt as string) ?? ''
			);
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured to exclude from savableData
		const { _evaluationPromise, _userBubbles, _prompt, ...savableData } = result.data ?? {};

		const timeRaw = savableData?.timeSpentSeconds;
		const timeSpentSeconds = typeof timeRaw === 'number' ? Math.round(Math.max(0, timeRaw)) : 0;

		// Non-blocking progress POST. keepalive ensures the request completes even
		// if the user closes the tab immediately after submitting — critical for
		// single-module lessons where the submit click is the user's only action.
		fetch('/api/progress', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			keepalive: true,
			body: JSON.stringify({
				moduleId: result.moduleId,
				courseId,
				lessonSlug,
				timeSpentSeconds,
				data: savableData
			})
		})
			.then((res) => {
				if (!res.ok) {
					console.error('[lesson] Failed to save progress:', res.status, res.statusText);
				}
			})
			.catch((err) => {
				console.error('[lesson] Failed to save progress:', err);
			});
	}

	function advanceModule() {
		if (!pendingResult) return;
		completionResults = [...completionResults, pendingResult];
		pendingResult = null;
		currentIndex++;
	}
</script>

{#if form && 'error' in form}
	<div class="session-empty">
		<p class="error-text">{form.error}</p>
		<a href={resolve('/learn')} class="back-link">Back to courses</a>
	</div>
{:else if sessionType === 'empty'}
	<div class="session-empty">
		<h2>No lesson selected</h2>
		<p>Pick a lesson to get started.</p>
		<a href={resolve('/learn')} class="back-link">Browse courses</a>
	</div>
{:else}
	{#key sessionKey}
		{#if sessionDone}
			{@const nextLesson = (session as { nextLesson?: { slug: string; title: string } })
				.nextLesson}
			<div class="lesson-container lesson-container--complete">
				<div class="module-area module-area--complete">
					<LessonComplete {completionResults} {courseTitle} {lessonTitle} />
				</div>

				{#if nextLesson}
					<div class="next-bar">
						<Button
							variant="primary"
							onclick={() => {
								window.location.assign(
									`/lesson?course=${encodeURIComponent(courseId)}&slug=${encodeURIComponent(nextLesson.slug)}`
								);
							}}
						>
							Next lesson
						</Button>
					</div>
				{/if}
			</div>
		{:else if modules.length > 0}
			<div class="lesson-container">
				<header class="lesson-header">
					<div class="lesson-context">
						<span class="course-label">{courseTitle}</span>
						<span class="separator">/</span>
						<span class="lesson-label">{lessonTitle}</span>
					</div>
					<div class="progress-indicator">
						{currentIndex + 1} / {modules.length}
					</div>
					{#if allCompleted}
						<p class="revision-note">
							You've completed this lesson before — reviewing all modules.
						</p>
					{:else if sessionType === 'revision'}
						<p class="revision-note">Revision session — practising your most recent lesson.</p>
					{/if}
				</header>

				<div class="module-area">
					{#key modules[currentIndex].id}
						<ModuleRunner
						module={modules[currentIndex]}
						{courseId}
						{lessonSlug}
						oncomplete={handleModuleComplete}
					/>
					{/key}
				</div>

				{#if pendingResult}
					<div class="next-bar">
						<Button variant="primary" onclick={advanceModule}>
							{currentIndex + 1 < modules.length ? 'Next module' : 'Finish session'}
						</Button>
					</div>
				{/if}
			</div>
		{/if}
	{/key}
{/if}

<style>
	.session-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 64px 24px;
		text-align: center;
	}

	.session-empty h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-foreground);
	}

	.session-empty p {
		color: var(--color-muted-foreground);
	}

	.error-text {
		color: var(--color-error);
		font-weight: 600;
	}

	.back-link {
		margin-top: 8px;
		color: var(--color-primary-600);
		font-weight: 600;
		text-decoration: underline;
	}

	.lesson-container {
		height: 100%;
		display: grid;
		grid-template-rows: auto 1fr auto;
	}

	.lesson-container--complete {
		grid-template-rows: 1fr auto;
	}

	.lesson-header {
		padding: 16px 24px;
		border-bottom: 1px solid var(--color-border);
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
		background: var(--color-background);
	}

	.module-area {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		overflow-y: auto;
	}

	.module-area--complete {
		align-items: center;
	}

	.lesson-context {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.9rem;
	}

	.course-label {
		color: var(--color-muted-foreground);
	}

	.separator {
		color: var(--color-border);
	}

	.lesson-label {
		font-weight: 600;
		color: var(--color-foreground);
	}

	.progress-indicator {
		margin-left: auto;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-primary-600);
		background: var(--color-primary-50);
		padding: 4px 12px;
		border-radius: 12px;
	}

	.revision-note {
		width: 100%;
		font-size: 0.8rem;
		color: var(--color-muted-foreground);
		font-style: italic;
	}

	.next-bar {
		display: flex;
		justify-content: center;
		padding: 24px;
		border-top: 1px solid var(--color-border);
		background: var(--color-background);
	}
</style>
