import { describe, it, expect } from 'vitest';
import { resolveLessonSession } from './session';
import type { Module } from '$lib/types/course';

function mod(id: string): Module {
	return {
		type: 'learning',
		id,
		title: id,
		componentId: 'ReadingBlock',
		estimatedMinutes: 1,
		config: {}
	};
}

const context = {
	courseId: 'creativity',
	lessonSlug: 'preparation',
	lessonTitle: 'Preparation',
	courseTitle: 'Creativity'
};

describe('resolveLessonSession', () => {
	it('returns a resume session with only remaining modules when the lesson is mid-progress', () => {
		const modules = [mod('m1'), mod('m2'), mod('m3'), mod('m4')];
		const completed = new Set(['m1', 'm2']);

		const session = resolveLessonSession(modules, completed, context);

		expect(session.sessionType).toBe('new');
		expect(session.allCompleted).toBe(false);
		expect(session.modules.map((m) => m.id)).toEqual(['m3', 'm4']);
	});

	it('does not lose progress when the user has completed only the first module', () => {
		// This is the reload-mid-lesson case: one module done, page refreshed —
		// the next module to show must be the second, not the first.
		const modules = [mod('m1'), mod('m2'), mod('m3')];
		const completed = new Set(['m1']);

		const session = resolveLessonSession(modules, completed, context);

		expect(session.modules[0].id).toBe('m2');
	});

	it('returns a revision session with all modules when every module is completed', () => {
		const modules = [mod('m1'), mod('m2')];
		const completed = new Set(['m1', 'm2']);

		const session = resolveLessonSession(modules, completed, context);

		expect(session.sessionType).toBe('revision');
		expect(session.allCompleted).toBe(true);
		expect(session.modules.map((m) => m.id)).toEqual(['m1', 'm2']);
	});

	it('returns all remaining modules when nothing has been completed', () => {
		const modules = [mod('m1'), mod('m2')];

		const session = resolveLessonSession(modules, new Set(), context);

		expect(session.sessionType).toBe('new');
		expect(session.modules.map((m) => m.id)).toEqual(['m1', 'm2']);
	});
});
