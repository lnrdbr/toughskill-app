import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { exerciseSubmission } from '$lib/server/db/schema';
import { mistral } from '$lib/server/llm';
import { eq } from 'drizzle-orm';
import type { AnalogyEvaluation } from '$lib/components/exercises/types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = await request.json();
	const { analogies, reflections, timeSpentSeconds, concept } = body as {
		analogies: Record<string, { like: string; because: string }>;
		reflections: { surprising: string };
		timeSpentSeconds: number;
		concept: string;
	};

	if (!analogies || typeof analogies !== 'object' || !concept) {
		throw error(400, 'Missing required fields');
	}

	const userId = locals.user?.id;
	if (!userId) {
		throw error(401, 'Not authenticated');
	}

	// Transform to Record<string, string[]> to fit DB column type
	const ideasByDomain: Record<string, string[]> = {};
	for (const [domain, { like, because }] of Object.entries(analogies)) {
		if (like.trim() || because.trim()) {
			ideasByDomain[domain] = [`${like} because ${because}`];
		}
	}

	const [{ id: submissionId }] = await db
		.insert(exerciseSubmission)
		.values({
			userId,
			exerciseType: 'analogy_sprint',
			prompt: concept,
			ideas: ideasByDomain,
			reflections,
			timeSpentSeconds
		})
		.returning({ id: exerciseSubmission.id });

	const evaluation = await evaluateWithLLM(concept, analogies);

	await db
		.update(exerciseSubmission)
		.set({ evaluation: evaluation as unknown as Record<string, unknown> })
		.where(eq(exerciseSubmission.id, submissionId));

	return json({ evaluation });
};

async function evaluateWithLLM(
	concept: string,
	analogies: Record<string, { like: string; because: string }>
): Promise<AnalogyEvaluation> {
	const filledDomains = Object.entries(analogies).filter(
		([, a]) => a.like.trim() || a.because.trim()
	);

	const analogyText = filledDomains
		.map(([domain, { like, because }]) => `${domain}: "${concept} is like ${like} because ${because}"`)
		.join('\n');

	const response = await mistral.chat.complete({
		model: 'mistral-small-latest',
		maxTokens: 768,
		messages: [
			{
				role: 'system',
				content: `You evaluate analogy-based creativity exercises. The user created analogies for a concept from different domains. Score on three dimensions (1-10 each):
- breadth: How varied are the analogies across domains? Do they explore genuinely different angles?
- depth: How well-explained are the connections? Are the "because" explanations insightful?
- surprise: How unexpected or non-obvious are the comparisons?
Also provide:
- domainHighlights: For each domain that has an analogy, one brief encouraging sentence about what worked well.
- feedback: 2-3 sentences of overall constructive, encouraging feedback.
- suggestions: 3-5 example analogies the user didn't think of, from any domain. Format each as a short sentence.
Respond in JSON only: {"breadth": number, "depth": number, "surprise": number, "domainHighlights": {"domain": "..."}, "feedback": "string", "suggestions": ["analogy1", ...]}`
			},
			{
				role: 'user',
				content: `Concept: "${concept}"\n\nAnalogies (${filledDomains.length} domains):\n${analogyText}`
			}
		],
		responseFormat: { type: 'json_object' }
	});

	const content = response.choices?.[0]?.message?.content;
	const raw = typeof content === 'string' ? content : '';
	const text = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

	let parsed: AnalogyEvaluation;
	try {
		parsed = JSON.parse(text);
	} catch {
		return {
			breadth: 5,
			depth: 5,
			surprise: 5,
			feedback:
				'Nice work creating analogies across domains! Cross-domain thinking is a powerful creative skill — keep practising.',
			domainHighlights: {},
			suggestions: []
		};
	}

	return {
		breadth: clamp(parsed.breadth, 1, 10),
		depth: clamp(parsed.depth, 1, 10),
		surprise: clamp(parsed.surprise, 1, 10),
		feedback: parsed.feedback,
		domainHighlights: parsed.domainHighlights ?? {},
		suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : []
	};
}

function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}
