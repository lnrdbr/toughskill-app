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
	ideas: text('ideas', { mode: 'json' }).notNull().$type<string[] | Record<string, string[]>>(),
	reflections: text('reflections', { mode: 'json' }).$type<Record<string, unknown>>(),
	evaluation: text('evaluation', { mode: 'json' }).$type<Record<string, unknown>>(),
	timeSpentSeconds: integer('time_spent_seconds').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date())
});

export const moduleCompletion = sqliteTable('module_completion', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	moduleId: text('module_id').notNull(),
	courseId: text('course_id').notNull(),
	lessonSlug: text('lesson_slug').notNull(),
	timeSpentSeconds: integer('time_spent_seconds').notNull(),
	data: text('data', { mode: 'json' }).$type<Record<string, unknown>>(),
	completedAt: integer('completed_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date())
});

/**
 * Append-only record of user-generated content from any non-exercise module
 * (reflections, choice answers, photo captions, real-life task feedback, recall
 * answers, etc). "Latest wins" for display — derive via `createdAt DESC`.
 */
export const moduleSubmission = sqliteTable('module_submission', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	courseId: text('course_id').notNull(),
	lessonSlug: text('lesson_slug').notNull(),
	moduleId: text('module_id').notNull(),
	moduleType: text('module_type').notNull(),
	payload: text('payload', { mode: 'json' }).notNull().$type<Record<string, unknown>>(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date())
});

export * from './auth.schema';
