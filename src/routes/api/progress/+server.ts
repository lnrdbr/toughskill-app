import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { moduleCompletion } from '$lib/server/db/schema';
import { getModule } from '$lib/config/courses';

export const POST: RequestHandler = async ({ request, locals }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}

	if (typeof body !== 'object' || body === null) {
		error(400, 'Invalid JSON body');
	}

	const { moduleId, courseId, lessonSlug, timeSpentSeconds, data } = body as {
		moduleId: string;
		courseId: string;
		lessonSlug: string;
		timeSpentSeconds: number;
		data?: Record<string, unknown>;
	};

	if (
		typeof moduleId !== 'string' ||
		typeof courseId !== 'string' ||
		typeof lessonSlug !== 'string' ||
		!moduleId ||
		!courseId ||
		!lessonSlug ||
		!Number.isInteger(timeSpentSeconds) ||
		timeSpentSeconds < 0
	) {
		error(400, 'Missing required fields');
	}

	if (data != null && (typeof data !== 'object' || Array.isArray(data))) {
		error(400, 'Invalid data field');
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
		.onConflictDoUpdate({
			target: [
				moduleCompletion.userId,
				moduleCompletion.courseId,
				moduleCompletion.lessonSlug,
				moduleCompletion.moduleId
			],
			set: {
				timeSpentSeconds,
				data: data ?? null,
				completedAt: new Date()
			}
		})
		.returning({ id: moduleCompletion.id });

	return json({ id });
};
