import type { Course } from '$lib/types/course';

export const creativity: Course = {
	id: 'creativity',
	title: 'Creativity',
	slug: 'creativity',
	description:
		'Develop your creative thinking through divergent thinking exercises and real-world challenges.',
	icon: '💡',
	color: 'primary',
	lessons: [
		{
			id: 'creativity-preparation',
			title: 'Preparation',
			slug: 'preparation',
			description: 'Warm up your creative muscles with classic divergent thinking challenges.',
			modules: [
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
				}
			],
			estimatedMinutes: 10
		}
	]
};
