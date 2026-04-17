export interface BubbleData {
	id: string;
	text: string;
	color: string;
}

export interface ExerciseResult {
	ideas: string[];
	timeSpentSeconds: number;
	reflections: {
		surprisingIdea: string;
		patterns: string;
	};
}

export interface GuilfordEvaluation {
	fluency: number;
	flexibility: number;
	originality: number;
	elaboration: number;
	feedback: string;
	suggestions: string[];
}

export interface SubmissionResponse {
	evaluation: GuilfordEvaluation;
	communityIdeas: string[];
}

export interface ScamperLensConfig {
	key: string;
	letter: string;
	label: string;
	question: string;
}

export interface ScamperEvaluation {
	breadth: number;
	depth: number;
	originality: number;
	practicality: number;
	lensAgility: number;
	feedback: string;
	lensHighlights: Record<string, string>;
	suggestions: string[];
}

export interface ScamperSubmissionResponse {
	evaluation: ScamperEvaluation;
	communityIdeas: string[];
}

export interface StoryBuilderEvaluation {
	originality: number;
	detail: number;
	coherence: number;
	feedback: string;
	suggestions: string[];
}

export interface StoryBuilderSubmissionResponse {
	evaluation: StoryBuilderEvaluation;
}

export interface ConstraintEvaluation {
	adaptability: number;
	originality: number;
	feasibility: number;
	feedback: string;
	suggestions: string[];
}

export interface ConstraintSubmissionResponse {
	evaluation: ConstraintEvaluation;
}

export interface AnalogyEvaluation {
	breadth: number;
	depth: number;
	surprise: number;
	feedback: string;
	domainHighlights: Record<string, string>;
	suggestions: string[];
}

export interface AnalogySubmissionResponse {
	evaluation: AnalogyEvaluation;
}

/**
 * Feedback returned by the journey-module LLM endpoints (reflection,
 * real-life-task, photo). Unlike exercises these aren't scored — just a
 * warm, SDT-aligned note back to the user about what they wrote.
 */
export interface JourneyFeedbackResponse {
	evaluation: { feedback: string };
}

export type AnySubmissionResponse =
	| SubmissionResponse
	| ScamperSubmissionResponse
	| StoryBuilderSubmissionResponse
	| ConstraintSubmissionResponse
	| AnalogySubmissionResponse
	| JourneyFeedbackResponse;

export interface PendingEvaluation {
	promise: Promise<AnySubmissionResponse>;
	result?: AnySubmissionResponse;
	error?: string;
	userIdeas: string[] | Record<string, string[]>;
	prompt: string;
}

/** Shared evaluation store — plain object, no proxy, no context */
export const pendingEvaluations: Record<string, PendingEvaluation> = {};
