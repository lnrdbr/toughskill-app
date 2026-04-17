import { mistral } from './llm';

/**
 * Ask the LLM for a short, warm, SDT-aligned note back to the user about
 * something they wrote in a journey module (reflection, real-life task
 * feedback, photo caption). The response is informational — celebrating
 * what they actually said — not a score, rank, or critique.
 *
 * Returns a safe fallback string if the model fails or returns garbage,
 * so the caller never has to handle an error path.
 */
export async function generateJourneyFeedback(params: {
	systemRole: string;
	userContent: string;
	fallback: string;
}): Promise<string> {
	const { systemRole, userContent, fallback } = params;

	try {
		const response = await mistral.chat.complete({
			model: 'mistral-small-latest',
			maxTokens: 220,
			messages: [
				{
					role: 'system',
					content: `${systemRole}

Write 2-3 sentences, warm and specific. Reference something concrete the user actually wrote — a word, an image, a detail — so the response feels seen rather than generic. Do not score, rank, or judge. Do not use bullet points. Do not add a greeting or sign-off. Avoid saying "great job"-style generic praise.

Respond in JSON only: {"feedback": "string"}`
				},
				{
					role: 'user',
					content: userContent
				}
			],
			responseFormat: { type: 'json_object' }
		});

		const raw = response.choices?.[0]?.message?.content ?? '';
		const text = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
		const parsed = JSON.parse(text) as { feedback?: unknown };
		const feedback = typeof parsed.feedback === 'string' ? parsed.feedback.trim() : '';
		return feedback || fallback;
	} catch {
		return fallback;
	}
}
