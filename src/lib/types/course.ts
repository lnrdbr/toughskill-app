export interface BaseModule {
	id: string;
	title: string;
	componentId: string;
	estimatedMinutes: number;
	config: Record<string, unknown>;
}

export interface ExerciseModule extends BaseModule {
	type: 'exercise';
}

export interface LearningModule extends BaseModule {
	type: 'learning';
}

export interface ResultsModule extends BaseModule {
	type: 'results';
	sourceExerciseId: string;
}

export type Module = ExerciseModule | LearningModule | ResultsModule;

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
