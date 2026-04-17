import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { moduleCompletion } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCourse } from '$lib/config/courses';

export interface JourneyStats {
	completedLessons: number;
	totalLessons: number;
	totalPracticeSeconds: number;
	realLifeTasksCompleted: number;
	allDone: boolean;
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, '/auth/login');
	}

	const course = getCourse('creativity');
	if (!course) {
		return {
			course: null,
			lessonProgress: {} as Record<string, { completed: number; total: number }>,
			journeyStats: null as JourneyStats | null
		};
	}

	const completions = await db
		.select({
			lessonSlug: moduleCompletion.lessonSlug,
			moduleId: moduleCompletion.moduleId,
			timeSpentSeconds: moduleCompletion.timeSpentSeconds
		})
		.from(moduleCompletion)
		.where(
			and(eq(moduleCompletion.userId, locals.user.id), eq(moduleCompletion.courseId, 'creativity'))
		);

	const lessonProgress: Record<string, { completed: number; total: number }> = {};
	let completedLessons = 0;

	for (const lesson of course.lessons) {
		const completedModuleIds = new Set(
			completions.filter((c) => c.lessonSlug === lesson.slug).map((c) => c.moduleId)
		);
		lessonProgress[lesson.slug] = {
			completed: completedModuleIds.size,
			total: lesson.modules.length
		};
		if (completedModuleIds.size >= lesson.modules.length && lesson.modules.length > 0) {
			completedLessons += 1;
		}
	}

	// Flatten modules so we can match completions against their declared type.
	const moduleTypeById = new Map<string, string>();
	for (const lesson of course.lessons) {
		for (const m of lesson.modules) moduleTypeById.set(m.id, m.type);
	}

	const totalPracticeSeconds = completions.reduce(
		(sum, c) => sum + Math.max(0, c.timeSpentSeconds ?? 0),
		0
	);
	const realLifeTasksCompleted = completions.filter(
		(c) => moduleTypeById.get(c.moduleId) === 'real_life_task'
	).length;

	const totalLessons = course.lessons.length;
	const journeyStats: JourneyStats = {
		completedLessons,
		totalLessons,
		totalPracticeSeconds,
		realLifeTasksCompleted,
		allDone: completedLessons === totalLessons && totalLessons > 0
	};

	return { course, lessonProgress, journeyStats };
};
