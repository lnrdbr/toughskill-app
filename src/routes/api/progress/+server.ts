import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { moduleCompletion } from '$lib/server/db/schema';
import { getModule } from '$lib/config/courses';

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = await request.json();
	const { moduleId, courseId, lessonSlug, timeSpentSeconds, data } = body as {
		moduleId: string;
		courseId: string;
		lessonSlug: string;
		timeSpentSeconds: number;
		data?: Record<string, unknown>;
	};

	if (!moduleId || !courseId || !lessonSlug || timeSpentSeconds == null) {
		error(400, 'Missing required fields');
	}

	const userId = locals.user?.id;
	if (!userId) {
		error(401, 'Not authenticated');
	}

	const mod = getModule(courseId, lessonSlug, moduleId);
	if (!mod) {
		error(404, 'Module not found');
	}

	const [{ id }] = await db
		.insert(moduleCompletion)
		.values({
			userId,
			moduleId,
			courseId,
			lessonSlug,
			timeSpentSeconds,
			data: data ?? null
		})
		.returning({ id: moduleCompletion.id });

	return json({ id });
};
