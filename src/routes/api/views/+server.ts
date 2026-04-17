import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { moduleView } from '$lib/server/db/schema';
import { getModule } from '$lib/config/courses';

/**
 * Marks a module as "viewed" by the current user.
 *
 * Idempotent: the unique (user_id, module_id) index means re-sending the
 * same payload is a silent no-op. The client can safely fire this on every
 * module-change without worrying about duplicates.
 */
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

	const { moduleId, courseId, lessonSlug } = body as {
		moduleId: string;
		courseId: string;
		lessonSlug: string;
	};

	if (
		typeof moduleId !== 'string' ||
		typeof courseId !== 'string' ||
		typeof lessonSlug !== 'string' ||
		!moduleId ||
		!courseId ||
		!lessonSlug
	) {
		error(400, 'Missing required fields: moduleId, courseId, lessonSlug must be non-empty strings');
	}

	const userId = locals.user?.id;
	if (!userId) {
		error(401, 'Not authenticated');
	}

	const mod = getModule(courseId, lessonSlug, moduleId);
	if (!mod) {
		error(404, 'Module not found');
	}

	try {
		await db
			.insert(moduleView)
			.values({ userId, moduleId, courseId, lessonSlug })
			.onConflictDoNothing();
	} catch {
		error(500, 'Failed to record view');
	}

	return json({ ok: true });
};
