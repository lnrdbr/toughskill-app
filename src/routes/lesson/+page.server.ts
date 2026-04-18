import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { moduleCompletion, moduleSubmission } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCourse, getLessonBySlug } from '$lib/config/courses';
import type { Module } from '$lib/types/course';
import { resolveLessonSession } from './session';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return redirect(302, '/auth/login');
	}

	// Prefer the lesson named in the URL (set by the form action on entry from
	// /learn). Falls back to "most recently completed" only when no URL hint
	// is present — otherwise a reload of a just-started lesson would show the
	// previous lesson in revision mode.
	const paramCourseId = url.searchParams.get('course');
	const paramSlug = url.searchParams.get('slug');

	let courseId = '';
	let lessonSlug = '';

	if (paramCourseId && paramSlug && getLessonBySlug(paramCourseId, paramSlug)) {
		courseId = paramCourseId;
		lessonSlug = paramSlug;
	} else {
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
		courseId = latest.courseId;
		lessonSlug = latest.lessonSlug;
	}

	const lesson = getLessonBySlug(courseId, lessonSlug);
	const course = getCourse(courseId);

	if (!lesson || !course) {
		return { sessionType: 'empty' as const, modules: [] };
	}

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

	// Lesson 22's StoryBuilder is seeded with the photo the user took in lesson
	// 10. At render time, pull the most recent `mod-10-photo` submission and
	// inject its dataUrl into the StoryBuilder config so the story prompt shows
	// the user's own image above the input.
	const modulesForSession = await injectStoryBuilderPhoto(
		lesson.modules,
		lessonSlug,
		locals.user.id
	);

	const session = resolveLessonSession(modulesForSession, completedIds, {
		courseId,
		lessonSlug,
		lessonTitle: lesson.title,
		courseTitle: course.title
	});

	const lessonIdx = course.lessons.findIndex((l) => l.slug === lessonSlug);
	const next =
		lessonIdx >= 0 && lessonIdx < course.lessons.length - 1 ? course.lessons[lessonIdx + 1] : null;

	return {
		...session,
		nextLesson: next ? { slug: next.slug, title: next.title } : undefined
	};
};

async function injectStoryBuilderPhoto(
	modules: Module[],
	lessonSlug: string,
	userId: string
): Promise<Module[]> {
	if (lessonSlug !== 'photo-story') return modules;

	const [photo] = await db
		.select({ payload: moduleSubmission.payload })
		.from(moduleSubmission)
		.where(and(eq(moduleSubmission.userId, userId), eq(moduleSubmission.moduleId, 'mod-10-photo')))
		.orderBy(desc(moduleSubmission.createdAt))
		.limit(1);

	const dataUrl = photo?.payload?.photoDataUrl;
	if (typeof dataUrl !== 'string' || !dataUrl) return modules;

	return modules.map((m) =>
		m.type === 'exercise' && m.id === 'mod-22-story'
			? { ...m, config: { ...m.config, photoDataUrl: dataUrl } }
			: m
	);
}

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const courseId = formData.get('courseId');
		const lessonSlug = formData.get('lessonSlug');

		if (
			typeof courseId !== 'string' ||
			!courseId ||
			typeof lessonSlug !== 'string' ||
			!lessonSlug
		) {
			return fail(400, { error: 'Missing courseId or lessonSlug' });
		}

		const lesson = getLessonBySlug(courseId, lessonSlug);
		if (!lesson) {
			return fail(404, { error: 'Lesson not found' });
		}

		// Redirect with the lesson in the URL so reloads land on the same lesson
		// rather than whatever the user most recently completed a module in.
		const target = `/lesson?course=${encodeURIComponent(courseId)}&slug=${encodeURIComponent(lessonSlug)}`;
		return redirect(303, target);
	}
};
