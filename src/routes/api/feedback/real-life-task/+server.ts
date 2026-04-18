import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateJourneyFeedback } from '$lib/server/journey-feedback';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Not authenticated');
	}

	const body = (await request.json()) as {
		instruction?: string;
		feedbackPrompt?: string;
		feedbackText?: string;
	};
	const instruction = body.instruction?.trim() ?? '';
	const feedbackPrompt = body.feedbackPrompt?.trim() ?? '';
	const feedbackText = body.feedbackText?.trim() ?? '';

	if (!instruction || !feedbackText) {
		throw error(400, 'Missing instruction or feedback');
	}

	const feedback = await generateJourneyFeedback({
		systemRole: `You respond to real-world creative tasks the user carried out offline. The user was given an instruction, did the task in their actual life, then came back and wrote what happened. Acknowledge that they actually went and did it, reflect one concrete detail from their account, and connect it briefly to the wider practice of creativity.`,
		userContent: `Task they were given: "${instruction}"${feedbackPrompt ? `\nQuestion back: "${feedbackPrompt}"` : ''}\n\nWhat they report:\n${feedbackText}`,
		fallback:
			"You actually went and did it — that's the part most people skip. The detail you brought back is more valuable than any answer you could give sitting still."
	});

	return json({ evaluation: { feedback } });
};
