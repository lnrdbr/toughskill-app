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
}

export interface SubmissionResponse {
	evaluation: GuilfordEvaluation;
	communityIdeas: string[];
}

export interface PendingEvaluation {
	promise: Promise<SubmissionResponse>;
	status: 'pending' | 'resolved' | 'error';
	result?: SubmissionResponse;
	error?: string;
	userIdeas: string[];
	prompt: string;
}
