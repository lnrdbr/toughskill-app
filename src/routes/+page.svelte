<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { resolve } from '$app/paths';
	import cloudy from '$lib/assets/cloudy.png';
</script>

<section class="hero">
	<img src={cloudy} alt="Cloudy, the TOUGHSKILL mascot" class="hero-image" />

	<h1 class="headline">Build soft skills that stick</h1>
	<p class="subtitle">
		Short, playful lessons in communication, creativity, and work ethic — grounded in
		self-determination theory, not streaks and leaderboards.
	</p>

	<a href={resolve('/courses')} class="cta">
		<Button variant="primary">Start Course</Button>
	</a>

	<p class="footnote">
		A dissertation project exploring ethical gamification in soft-skill learning.
	</p>
</section>

<style>
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1.5rem;
		padding: 3rem 1.5rem 4rem;
		max-width: 44rem;
		margin: 0 auto;
	}

	.hero-image {
		width: min(100%, 28rem);
		height: auto;
		margin-bottom: 0.5rem;
	}

	.headline {
		font-family: var(--font-display), serif;
		font-size: clamp(2rem, 6vw, 3.25rem);
		line-height: 1.1;
		color: var(--color-foreground);
		margin: 0;
	}

	.subtitle {
		font-size: 1.125rem;
		color: var(--color-muted-foreground);
		max-width: 32rem;
		margin: 0;
		line-height: 1.5;
	}

	.cta {
		display: inline-flex;
		text-decoration: none;
		margin-top: 0.5rem;
	}

	.footnote {
		font-size: 0.8125rem;
		color: var(--color-muted-foreground);
		margin-top: 2rem;
		font-style: italic;
	}
</style>
