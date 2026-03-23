<script lang="ts">
	import { getAllCourses } from '$lib/config/courses';

	const courses = getAllCourses();
</script>

<div class="learn-page">
	<h1>Courses</h1>

	{#each courses as course}
		<section class="course-section">
			<h2>{course.icon} {course.title}</h2>
			<p>{course.description}</p>

			{#each course.lessons as lesson}
				<div class="lesson-card">
					<h3>{lesson.title}</h3>
					<p>{lesson.description}</p>
					<p class="meta">{lesson.modules.length} module{lesson.modules.length === 1 ? '' : 's'} &middot; ~{lesson.estimatedMinutes} min</p>
					<form method="POST" action="/lesson">
						<input type="hidden" name="courseId" value={course.id} />
						<input type="hidden" name="lessonSlug" value={lesson.slug} />
						<button type="submit">Start lesson</button>
					</form>
				</div>
			{/each}
		</section>
	{/each}
</div>

<style>
	.learn-page {
		max-width: 640px;
		margin: 0 auto;
		padding: 48px 24px;
	}

	h1 {
		font-size: 1.8rem;
		font-weight: 700;
		color: var(--color-foreground);
		margin-bottom: 32px;
	}

	.course-section {
		margin-bottom: 32px;
	}

	.course-section h2 {
		font-size: 1.3rem;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.course-section > p {
		color: var(--color-muted-foreground);
		margin-bottom: 16px;
	}

	.lesson-card {
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 12px;
		box-shadow: var(--main-drop-shadow);
	}

	.lesson-card h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 4px;
	}

	.lesson-card p {
		color: var(--color-muted-foreground);
		font-size: 0.9rem;
	}

	.meta {
		margin-top: 8px;
		font-size: 0.8rem !important;
	}

	button {
		margin-top: 12px;
		background: var(--color-primary-500);
		color: white;
		border: none;
		padding: 8px 20px;
		border-radius: var(--radius-button);
		font-weight: 600;
		cursor: pointer;
		box-shadow: var(--main-drop-shadow);
	}

	button:hover {
		background: var(--color-primary-600);
	}
</style>
