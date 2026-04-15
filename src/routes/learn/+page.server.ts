import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { moduleCompletion } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCourse } from '$lib/config/courses';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, '/demo/better-auth/login');
	}

	const course = getCourse('creativity');
	if (!course) {
		return {
			course: null,
			lessonProgress: {} as Record<string, { completed: number; total: number }>
		};
	}

	const completions = await db
		.select({
			lessonSlug: moduleCompletion.lessonSlug,
			moduleId: moduleCompletion.moduleId
		})
		.from(moduleCompletion)
		.where(
			and(eq(moduleCompletion.userId, locals.user.id), eq(moduleCompletion.courseId, 'creativity'))
		);

	const lessonProgress: Record<string, { completed: number; total: number }> = {};

	for (const lesson of course.lessons) {
		const completedModuleIds = new Set(
			completions.filter((c) => c.lessonSlug === lesson.slug).map((c) => c.moduleId)
		);
		lessonProgress[lesson.slug] = {
			completed: completedModuleIds.size,
			total: lesson.modules.length
		};
	}

	return { course, lessonProgress };
};
