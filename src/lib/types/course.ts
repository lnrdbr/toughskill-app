export interface ExerciseModule {
	type: 'exercise';
	id: string;
	title: string;
	componentId: string;
	estimatedMinutes: number;
	config: Record<string, unknown>;
}

export interface LearningModule {
	type: 'learning';
	id: string;
	title: string;
	componentId: string;
	estimatedMinutes: number;
	config: Record<string, unknown>;
}

export type Module = ExerciseModule | LearningModule;

export interface Lesson {
	id: string;
	title: string;
	slug: string;
	description: string;
	modules: Module[];
	estimatedMinutes: number;
}

export interface Course {
	id: string;
	title: string;
	slug: string;
	description: string;
	icon: string;
	color: string;
	lessons: Lesson[];
}

export interface ModuleCompletionResult {
	moduleId: string;
	completedAt: string;
	data: Record<string, unknown>;
}
