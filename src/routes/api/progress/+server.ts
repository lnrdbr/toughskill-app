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
		!lessonSlug
	) {
		error(400, 'Missing required fields: moduleId, courseId, and lessonSlug must be non-empty strings');
	}

	if (!Number.isInteger(timeSpentSeconds) || timeSpentSeconds < 0 || timeSpentSeconds > 86400) {
		error(400, 'timeSpentSeconds must be an integer between 0 and 86400');
	}

	if (data != null && (typeof data !== 'object' || Array.isArray(data))) {
		error(400, 'data must be a plain object or null');
	}

	const userId = locals.user?.id;
	if (!userId) {
		error(401, 'Not authenticated');
	}

	const mod = getModule(courseId, lessonSlug, moduleId);
	if (!mod) {
		error(404, 'Module not found');
	}

	let id: string;
	try {
		const [row] = await db
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
		id = row.id;
	} catch {
		error(500, 'Failed to record completion');
	}

	return json({ id });
};
