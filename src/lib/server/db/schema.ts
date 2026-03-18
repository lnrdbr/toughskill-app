import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const exerciseSubmission = sqliteTable('exercise_submission', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	exerciseType: text('exercise_type').notNull(),
	prompt: text('prompt').notNull(),
	ideas: text('ideas', { mode: 'json' }).notNull().$type<string[]>(),
	reflections: text('reflections', { mode: 'json' }).$type<{
		surprisingIdea: string;
		patterns: string;
	}>(),
	evaluation: text('evaluation', { mode: 'json' }).$type<{
		fluency: number;
		flexibility: number;
		originality: number;
		elaboration: number;
		feedback: string;
	}>(),
	timeSpentSeconds: integer('time_spent_seconds').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date())
});

export * from './auth.schema';
