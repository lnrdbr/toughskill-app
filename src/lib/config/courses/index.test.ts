import { describe, it, expect } from 'vitest';
import { getCourse, getLessonBySlug, getAllCourses } from './index';

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
	it('returns the Preparation lesson', () => {
		const lesson = getLessonBySlug('creativity', 'preparation');
		expect(lesson).toBeDefined();
		expect(lesson!.title).toBe('Preparation');
		expect(lesson!.modules.length).toBe(2);
	});

	it('returns undefined for an unknown lesson slug', () => {
		expect(getLessonBySlug('creativity', 'nonexistent')).toBeUndefined();
	});

	it('returns undefined for an unknown course id', () => {
		expect(getLessonBySlug('nonexistent', 'preparation')).toBeUndefined();
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
