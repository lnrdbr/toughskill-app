import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { moduleCompletion } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCourse, getLessonBySlug } from '$lib/config/courses';
import { anthropic } from '$lib/server/llm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, '/demo/better-auth/login');
	}

	const [latest] = await db
		.select({
			courseId: moduleCompletion.courseId,
			lessonSlug: moduleCompletion.lessonSlug
		})
		.from(moduleCompletion)
		.where(eq(moduleCompletion.userId, locals.user.id))
		.orderBy(desc(moduleCompletion.completedAt))
		.limit(1);

	if (!latest) {
		return { sessionType: 'empty' as const, modules: [] };
	}

	const lesson = getLessonBySlug(latest.courseId, latest.lessonSlug);
	const course = getCourse(latest.courseId);

	if (!lesson || !course) {
		return { sessionType: 'empty' as const, modules: [] };
	}

	const completions = await db
		.select({ moduleId: moduleCompletion.moduleId })
		.from(moduleCompletion)
		.where(
			and(
				eq(moduleCompletion.userId, locals.user.id),
				eq(moduleCompletion.courseId, latest.courseId),
				eq(moduleCompletion.lessonSlug, latest.lessonSlug)
			)
		);

	const completedIds = new Set(completions.map((c) => c.moduleId));
	const completedModules = lesson.modules.filter((m) => completedIds.has(m.id));

	if (completedModules.length === 0) {
		return { sessionType: 'empty' as const, modules: [] };
	}

	return {
		sessionType: 'revision' as const,
		courseId: latest.courseId,
		lessonSlug: latest.lessonSlug,
		lessonTitle: lesson.title,
		courseTitle: course.title,
		modules: completedModules
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return redirect(302, '/demo/better-auth/login');
		}

		const formData = await request.formData();
		const courseId = formData.get('courseId');
		const lessonSlug = formData.get('lessonSlug');

		if (typeof courseId !== 'string' || !courseId || typeof lessonSlug !== 'string' || !lessonSlug) {
			return fail(400, { error: 'Missing courseId or lessonSlug' });
		}

		const lesson = getLessonBySlug(courseId, lessonSlug);
		if (!lesson) {
			return fail(404, { error: 'Lesson not found' });
		}

		const course = getCourse(courseId);

		const completions = await db
			.select({ moduleId: moduleCompletion.moduleId })
			.from(moduleCompletion)
			.where(
				and(
					eq(moduleCompletion.userId, locals.user.id),
					eq(moduleCompletion.courseId, courseId),
					eq(moduleCompletion.lessonSlug, lessonSlug)
				)
			);

		const completedIds = new Set(completions.map((c) => c.moduleId));
		const remaining = lesson.modules.filter((m) => !completedIds.has(m.id));
		const allCompleted = remaining.length === 0;

		// Warm the Anthropic connection so the first LLM call is fast
		anthropic.messages
			.create({
				model: 'claude-haiku-4-5-20251001',
				max_tokens: 1,
				messages: [{ role: 'user', content: '.' }]
			})
			.catch(() => {});

		return {
			sessionType: 'new' as const,
			courseId,
			lessonSlug,
			lessonTitle: lesson.title,
			courseTitle: course?.title ?? '',
			modules: allCompleted ? lesson.modules : remaining,
			allCompleted
		};
	}
};
