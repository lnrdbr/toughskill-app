import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { moduleSubmission } from '$lib/server/db/schema';
import { getModule } from '$lib/config/courses';

/**
 * Append-only POST endpoint for user-generated content from journey modules
 * (reflections, photo captions, choice answers, real-life task feedback,
 * recall answers, etc). Progress / completion is tracked separately via
 * `/api/progress`.
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

	const { moduleId, moduleType, courseId, lessonSlug, payload } = body as {
		moduleId: string;
		moduleType: string;
		courseId: string;
		lessonSlug: string;
		payload: Record<string, unknown>;
	};

	if (
		typeof moduleId !== 'string' ||
		typeof moduleType !== 'string' ||
		typeof courseId !== 'string' ||
		typeof lessonSlug !== 'string' ||
		!moduleId ||
		!moduleType ||
		!courseId ||
		!lessonSlug
	) {
		error(400, 'moduleId, moduleType, courseId, and lessonSlug must be non-empty strings');
	}

	if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
		error(400, 'payload must be a plain object');
	}

	const userId = locals.user?.id;
	if (!userId) {
		error(401, 'Not authenticated');
	}

	const mod = getModule(courseId, lessonSlug, moduleId);
	if (!mod) {
		error(404, 'Module not found');
	}

	if (mod.type !== moduleType) {
		error(400, `moduleType mismatch: expected "${mod.type}", got "${moduleType}"`);
	}

	let id: string;
	try {
		const [row] = await db
			.insert(moduleSubmission)
			.values({
				userId,
				moduleId,
				moduleType,
				courseId,
				lessonSlug,
				payload
			})
			.returning({ id: moduleSubmission.id });
		id = row.id;
	} catch {
		error(500, 'Failed to record submission');
	}

	return json({ id });
};
