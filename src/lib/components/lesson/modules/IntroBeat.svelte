<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';

	let {
		moduleId,
		body,
		courseId = '',
		lessonSlug = '',
		oncomplete
	}: {
		moduleId: string;
		body: string;
		courseId?: string;
		lessonSlug?: string;
		oncomplete?: (data: Record<string, unknown>) => void;
	} = $props();

	let submitting = $state(false);
	let submitError: string | null = $state(null);
	let submitted = $state(false);

	async function submit() {
		if (submitting || submitted) return;
		submitting = true;
		submitError = null;
		try {
			if (courseId && lessonSlug) {
				const res = await fetch('/api/submissions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						moduleId,
						moduleType: 'intro',
						courseId,
						lessonSlug,
						payload: {
							acknowledged: true
						}
					})
				});
				if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
			}
			submitted = true;
			oncomplete?.({
				acknowledged: true
			});
		} catch (err) {
			submitError = err instanceof Error ? err.message : 'Something went wrong.';
		} finally {
			submitting = false;
		}
	}

	// Auto-acknowledge on mount so the parent lesson shell can show its own
	// "Next module" button — no duplicate Continue here.
	onMount(() => {
		submit();
	});
</script>

<section class="intro" aria-labelledby="intro-body">
	<p id="intro-body" class="body" data-testid="intro-body">{body}</p>

	{#if submitError}
		<p class="error" role="alert">{submitError}</p>
		<div class="actions">
			<Button
				variant="primary"
				rounded="default"
				disabled={submitting}
				onclick={submit}
				data-testid="intro-retry"
			>
				{submitting ? 'Retrying…' : 'Retry'}
			</Button>
		</div>
	{/if}
</section>

<style>
	.intro {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.75rem;
		max-width: 40rem;
		margin: 0 auto;
		text-align: center;
	}

	.body {
		font-family: var(--font-display);
		font-size: clamp(1.9rem, 3.2vw, 2.4rem);
		line-height: 1.25;
		color: var(--color-foreground);
		margin: 0;
		padding: 1.5rem 1rem;
	}

	.actions {
		display: flex;
		justify-content: center;
	}

	.error {
		color: var(--color-error);
		font-weight: 600;
		margin: 0;
	}
</style>
