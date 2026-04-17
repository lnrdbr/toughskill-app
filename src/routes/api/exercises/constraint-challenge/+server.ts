import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { exerciseSubmission } from '$lib/server/db/schema';
import { mistral } from '$lib/server/llm';
import { eq } from 'drizzle-orm';
import type { ConstraintEvaluation } from '$lib/components/exercises/types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = await request.json();
	const { responses, constraints, reflections, timeSpentSeconds, prompt } = body as {
		responses: string[];
		constraints: string[];
		reflections: { constraintImpact: string };
		timeSpentSeconds: number;
		prompt: string;
	};

	if (!responses?.length || !constraints?.length || !prompt) {
		throw error(400, 'Missing required fields');
	}

	const userId = locals.user?.id;
	if (!userId) {
		throw error(401, 'Not authenticated');
	}

	const [{ id: submissionId }] = await db
		.insert(exerciseSubmission)
		.values({
			userId,
			exerciseType: 'constraint_challenge',
			prompt,
			ideas: responses,
			reflections,
			timeSpentSeconds
		})
		.returning({ id: exerciseSubmission.id });

	const evaluation = await evaluateWithLLM(prompt, responses, constraints);

	await db
		.update(exerciseSubmission)
		.set({ evaluation: evaluation as unknown as Record<string, unknown> })
		.where(eq(exerciseSubmission.id, submissionId));

	return json({ evaluation });
};

async function evaluateWithLLM(
	prompt: string,
	responses: string[],
	constraints: string[]
): Promise<ConstraintEvaluation> {
	const roundsText = responses
		.map(
			(response, i) =>
				`Round ${i + 1} (constraint: "${constraints[i] ?? 'none'}"):\n${response}`
		)
		.join('\n\n');

	const response = await mistral.chat.complete({
		model: 'mistral-small-latest',
		maxTokens: 512,
		messages: [
			{
				role: 'system',
				content: `You evaluate constraint-based creativity exercises. The user solved the same problem across multiple rounds with increasing constraints. Score on three dimensions (1-10 each):
- adaptability: How well did solutions evolve across constraints? Did new constraints produce genuinely different approaches?
- originality: How creative and unexpected are the constrained solutions?
- feasibility: Could these solutions actually work in practice?
Also provide 2-3 sentences of constructive, encouraging feedback highlighting how constraints shaped their thinking. Also provide 3-5 "suggestions" — alternative solutions or approaches the user didn't consider.
Respond in JSON only: {"adaptability": number, "originality": number, "feasibility": number, "feedback": "string", "suggestions": ["idea1", ...]}`
			},
			{
				role: 'user',
				content: `Problem: "${prompt}"\n\n${roundsText}`
			}
		],
		responseFormat: { type: 'json_object' }
	});

	const content = response.choices?.[0]?.message?.content;
	const raw = typeof content === 'string' ? content : '';
	const text = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

	let parsed: ConstraintEvaluation;
	try {
		parsed = JSON.parse(text);
	} catch {
		return {
			adaptability: 5,
			originality: 5,
			feasibility: 5,
			feedback:
				'Good work thinking through constraints! Each limitation forced you in a new direction — keep practising this skill.',
			suggestions: []
		};
	}

	return {
		adaptability: clamp(parsed.adaptability, 1, 10),
		originality: clamp(parsed.originality, 1, 10),
		feasibility: clamp(parsed.feasibility, 1, 10),
		feedback: parsed.feedback,
		suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : []
	};
}

function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}
