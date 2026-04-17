import type { Module } from '$lib/types/course';

export interface LessonSession {
	sessionType: 'new' | 'revision' | 'empty';
	courseId?: string;
	lessonSlug?: string;
	lessonTitle?: string;
	courseTitle?: string;
	modules: Module[];
	allCompleted?: boolean;
}

/**
 * Decide whether a user should resume a lesson (with remaining modules) or
 * enter revision mode (reviewing all modules of a fully-completed lesson).
 *
 * Resume is chosen when at least one module is still uncompleted — this keeps
 * a page reload mid-lesson from kicking the user back to module 0 or into
 * revision.
 */
export function resolveLessonSession(
	lessonModules: Module[],
	completedIds: Set<string>,
	context: { courseId: string; lessonSlug: string; lessonTitle: string; courseTitle: string }
): LessonSession {
	const remaining = lessonModules.filter((m) => !completedIds.has(m.id));
	const allCompleted = remaining.length === 0;

	if (!allCompleted) {
		return {
			sessionType: 'new',
			...context,
			modules: remaining,
			allCompleted: false
		};
	}

	return {
		sessionType: 'revision',
		...context,
		modules: lessonModules,
		allCompleted: true
	};
}
