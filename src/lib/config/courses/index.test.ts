import { describe, it, expect } from 'vitest';
import { getCourse, getLessonBySlug, getModule, getAllCourses } from './index';

describe('getCourse', () => {
	it('returns the Creativity course by id', () => {
		const course = getCourse('creativity');
		expect(course).toBeDefined();
		expect(course!.title).toBe('Creativity');
		expect(course!.lessons.length).toBeGreaterThan(0);
	});

	it('returns undefined for an unknown id', () => {
		expect(getCourse('nonexistent')).toBeUndefined();
	});
});

describe('getLessonBySlug', () => {
	it('returns the first lesson of the 30-lesson journey', () => {
		const lesson = getLessonBySlug('creativity', 'what-is-creativity');
		expect(lesson).toBeDefined();
		expect(lesson!.title).toBe('What is creativity?');
		expect(lesson!.modules.length).toBe(1);
		expect(lesson!.modules[0].type).toBe('intro');
	});

	it('returns the paperclip exercise lesson configured in compact mode', () => {
		const lesson = getLessonBySlug('creativity', 'paperclip-test');
		expect(lesson).toBeDefined();
		const module = lesson!.modules.find((m) => m.type === 'exercise');
		expect(module).toBeDefined();
		if (module && module.type === 'exercise') {
			expect(module.componentId).toBe('DivergentThinking');
			expect(module.config.compact).toBe(true);
		}
	});

	it('returns undefined for an unknown lesson slug', () => {
		expect(getLessonBySlug('creativity', 'nonexistent')).toBeUndefined();
	});

	it('returns undefined for an unknown course id', () => {
		expect(getLessonBySlug('nonexistent', 'what-is-creativity')).toBeUndefined();
	});
});

describe('getModule', () => {
	it('returns a module by courseId, lessonSlug and moduleId', () => {
		const mod = getModule('creativity', 'paperclip-test', 'mod-07-paperclip');
		expect(mod).toBeDefined();
		expect(mod!.id).toBe('mod-07-paperclip');
		expect(mod!.title).toBe('The paperclip test');
	});

	it('returns undefined for an unknown moduleId', () => {
		expect(getModule('creativity', 'paperclip-test', 'nonexistent')).toBeUndefined();
	});

	it('returns undefined for an unknown lessonSlug', () => {
		expect(getModule('creativity', 'nonexistent', 'mod-07-paperclip')).toBeUndefined();
	});

	it('returns undefined for an unknown courseId', () => {
		expect(getModule('nonexistent', 'paperclip-test', 'mod-07-paperclip')).toBeUndefined();
	});
});

describe('30-lesson structure', () => {
	it('has exactly 30 lessons', () => {
		const course = getCourse('creativity')!;
		expect(course.lessons.length).toBe(30);
	});

	it('every lesson has a unique slug', () => {
		const course = getCourse('creativity')!;
		const slugs = course.lessons.map((l) => l.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('every module has a unique id across the course', () => {
		const course = getCourse('creativity')!;
		const ids = course.lessons.flatMap((l) => l.modules.map((m) => m.id));
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('every exercise module uses compact mode', () => {
		const course = getCourse('creativity')!;
		const exercises = course.lessons.flatMap((l) => l.modules).filter((m) => m.type === 'exercise');
		expect(exercises.length).toBeGreaterThan(0);
		for (const ex of exercises) {
			if (ex.type === 'exercise') {
				expect(ex.config.compact).toBe(true);
			}
		}
	});

	it('every recall module that references a prior lesson points at an existing slug', () => {
		const course = getCourse('creativity')!;
		const slugs = new Set(course.lessons.map((l) => l.slug));
		const recalls = course.lessons.flatMap((l) => l.modules).filter((m) => m.type === 'recall');
		for (const r of recalls) {
			if (r.type === 'recall' && r.referenceLessonSlug) {
				expect(slugs.has(r.referenceLessonSlug)).toBe(true);
			}
		}
	});
});

describe('getAllCourses', () => {
	it('returns an array containing the Creativity course', () => {
		const courses = getAllCourses();
		expect(courses).toBeInstanceOf(Array);
		expect(courses.length).toBeGreaterThanOrEqual(1);
		expect(courses.some((c) => c.id === 'creativity')).toBe(true);
	});
});
