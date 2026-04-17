import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { moduleCompletion } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAllCourses } from '$lib/config/courses';

const AVAILABLE_COURSE_IDS = new Set(['creativity']);

export interface CourseCardData {
	id: string;
	title: string;
	description: string;
	icon: string;
	totalModules: number;
	completedModules: number;
	available: boolean;
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, '/auth/login');
	}

	const courses = getAllCourses();
	const userId = locals.user.id;

	const cards: CourseCardData[] = await Promise.all(
		courses.map(async (course) => {
			const totalModules = course.lessons.reduce((sum, l) => sum + l.modules.length, 0);

			const rows = await db
				.select({ moduleId: moduleCompletion.moduleId })
				.from(moduleCompletion)
				.where(
					and(eq(moduleCompletion.userId, userId), eq(moduleCompletion.courseId, course.id))
				);

			return {
				id: course.id,
				title: course.title,
				description: course.description,
				icon: course.icon,
				totalModules,
				completedModules: new Set(rows.map((r) => r.moduleId)).size,
				available: AVAILABLE_COURSE_IDS.has(course.id)
			};
		})
	);

	return { cards };
};
