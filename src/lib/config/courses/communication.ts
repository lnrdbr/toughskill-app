import type { Course } from '$lib/types/course';

/**
 * Communication — placeholder stub so the /courses selector can surface
 * it as "Coming soon". No lessons yet; content design pending.
 */
export const communication: Course = {
	id: 'communication',
	title: 'Communication',
	slug: 'communication',
	description:
		'Say the true thing, kindly. Build the habit of being clear, direct, and generous in what you mean.',
	icon: 'mdi:message-text-outline',
	color: 'primary',
	lessons: []
};
