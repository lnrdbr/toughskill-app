<script lang="ts">
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
	let submitted = $state(false);
	let submitError: string | null = $state(null);
	let startedAt = $state(Date.now());

	async function handleContinue() {
		if (submitting) return;
		submitting = true;
		submitError = null;
		const timeSpentSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
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
							acknowledged: true,
							timeSpentSeconds
						}
					})
				});
				if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
			}
			submitted = true;
			oncomplete?.({
				acknowledged: true,
				timeSpentSeconds
			});
		} catch (err) {
			submitError = err instanceof Error ? err.message : 'Something went wrong.';
		} finally {
			submitting = false;
		}
	}
</script>

<section class="intro" aria-labelledby="intro-body">
	<p id="intro-body" class="body" data-testid="intro-body">{body}</p>

	{#if submitError}
		<p class="error" role="alert">{submitError}</p>
	{/if}

	{#if !submitted}
		<div class="actions">
			<Button
				variant="primary"
				rounded="default"
				disabled={submitting}
				onclick={handleContinue}
				data-testid="intro-continue"
			>
				{submitting ? 'Saving…' : 'Continue'}
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
		max-width: 32rem;
		margin: 0 auto;
		text-align: center;
	}

	.body {
		font-family: var(--font-display);
		font-size: 1.6rem;
		line-height: 1.3;
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
