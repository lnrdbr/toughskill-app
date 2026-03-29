import type { Course } from '$lib/types/course';

export const creativity: Course = {
	id: 'creativity',
	title: 'Creativity',
	slug: 'creativity',
	description:
		'Develop your creative thinking through divergent thinking exercises and real-world challenges.',
	icon: 'mdi:lightbulb',
	color: 'primary',
	lessons: [
		{
			id: 'creativity-preparation',
			title: 'Preparation',
			slug: 'preparation',
			description: 'Warm up your creative muscles with classic divergent thinking challenges.',
			modules: [
				{
					type: 'learning',
					id: 'intro-reading',
					title: 'Before You Begin',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'Try this first challenge with no preparation. There are no wrong answers — just generate as many ideas as you can, as quickly as you can.'
					}
				},
				{
					type: 'exercise',
					id: 'paperclip-challenge',
					title: 'Paperclip Challenge',
					componentId: 'DivergentThinking',
					estimatedMinutes: 5,
					config: {
						prompt: 'Paperclip',
						instruction: 'How many uses can you think of for a paperclip?',
						timerDuration: null
					}
				},
				{
					type: 'learning',
					id: 'divergent-thinking-reading',
					title: 'What is Divergent Thinking?',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							'What you just did is called **divergent thinking** — generating many possible solutions to an open-ended problem. Researchers measure it across three dimensions: **fluency** (how many ideas), **flexibility** (how many different categories), and **originality** (how unusual each idea is).\n\nThe key to improving is to push past your first obvious answers. Most people stop after the easy ideas. Try to think across categories — what if the object were a different size? A different material? Used by someone in a completely different context?\n\nApply these strategies in the next challenge and see how your results compare.'
					}
				},
				{
					type: 'results',
					id: 'paperclip-results',
					title: 'Paperclip Challenge Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'paperclip-challenge',
					config: {}
				},
				{
					type: 'exercise',
					id: 'brick-challenge',
					title: 'Brick Challenge',
					componentId: 'DivergentThinking',
					estimatedMinutes: 5,
					config: {
						prompt: 'Brick',
						instruction: 'How many uses can you think of for a brick?',
						timerDuration: 0
					}
				},
				{
					type: 'learning',
					id: 'brick-reading',
					title: 'Nice Work!',
					componentId: 'ReadingBlock',
					estimatedMinutes: 1,
					config: {
						content:
							"Well done completing both challenges! Take a moment to reflect on how your approach changed between the two exercises. Did you find yourself thinking more broadly the second time around? That shift — from obvious answers to unexpected ones — is exactly what divergent thinking practice builds over time."
					}
				},
				{
					type: 'results',
					id: 'brick-results',
					title: 'Brick Challenge Results',
					componentId: 'ExerciseResults',
					estimatedMinutes: 1,
					sourceExerciseId: 'brick-challenge',
					config: {}
				}
			],
			estimatedMinutes: 15
		}
	]
};
