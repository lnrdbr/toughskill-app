import type { Course } from '$lib/types/course';

/**
 * Work Ethic — placeholder stub so the /courses selector can surface it
 * as "Coming soon". No lessons yet; content design pending.
 */
export const workEthic: Course = {
	id: 'work-ethic',
	title: 'Work Ethic',
	slug: 'work-ethic',
	description:
		'Show up when it matters, even when it doesn\'t feel like it. Small, consistent reps over willpower.',
	icon: 'mdi:hammer-wrench',
	color: 'primary',
	lessons: []
};
