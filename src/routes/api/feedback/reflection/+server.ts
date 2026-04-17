import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateJourneyFeedback } from '$lib/server/journey-feedback';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Not authenticated');
	}

	const body = (await request.json()) as { prompt?: string; response?: string };
	const prompt = body.prompt?.trim() ?? '';
	const response = body.response?.trim() ?? '';

	if (!prompt || !response) {
		throw error(400, 'Missing prompt or response');
	}

	const feedback = await generateJourneyFeedback({
		systemRole: `You read short personal reflections written inside a creativity-learning app. The user was asked a reflective prompt and wrote a response — your job is to reflect it back to them in a way that makes them feel their own insight was noticed.`,
		userContent: `Prompt: "${prompt}"\n\nUser's reflection:\n${response}`,
		fallback:
			'You showed up and wrote something real. That counts — the habit of noticing out loud is exactly what this course is training.'
	});

	return json({ evaluation: { feedback } });
};
