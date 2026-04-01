<script lang="ts">
import Button from "$lib/components/Button.svelte";
	let {
		title,
		description,
		completed,
		total,
		courseId,
		lessonSlug,
		status
	}: {
		title: string;
		description: string;
		completed: number;
		total: number;
		courseId: string;
		lessonSlug: string;
		status: 'completed' | 'in-progress' | 'not-started';
	} = $props();
</script>

<div class="detail-card border-2 rounded-xl p-5">
	<h2 class="text-lg font-semibold mb-2">{title}</h2>
	<p class="detail-description text-sm mb-3">{description}</p>
	<p class="detail-progress text-sm font-medium mb-4">
		{completed} / {total} modules completed
	</p>
	<form method="POST" action="/lesson">
		<input type="hidden" name="courseId" value={courseId} />
		<input type="hidden" name="lessonSlug" value={lessonSlug} />
		<Button type="submit" variant="primary">
			{#if status === 'completed'}
				Revise Lesson
			{:else if status === 'in-progress'}
				Continue Lesson
			{:else}
				Start Lesson
			{/if}
		</Button>
	</form>
</div>

<style>
	.detail-card {
		border-color: var(--color-border);
		box-shadow: var(--main-drop-shadow);
		background: var(--color-background);
	}

	.detail-card h2 {
		color: var(--color-foreground);
	}

	.detail-description {
		color: var(--color-muted-foreground);
	}

	.detail-progress {
		color: var(--color-muted-foreground);
	}
</style>
