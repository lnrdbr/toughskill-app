import type { Course, Lesson, Module } from '$lib/types/course';
import { creativity } from './creativity';
import { communication } from './communication';
import { workEthic } from './work-ethic';

const courses: Course[] = [creativity, communication, workEthic];

export function getCourse(courseId: string): Course | undefined {
	return courses.find((c) => c.id === courseId);
}

export function getLessonBySlug(courseId: string, lessonSlug: string): Lesson | undefined {
	const course = getCourse(courseId);
	if (!course) return undefined;
	return course.lessons.find((l) => l.slug === lessonSlug);
}

export function getModule(
	courseId: string,
	lessonSlug: string,
	moduleId: string
): Module | undefined {
	const lesson = getLessonBySlug(courseId, lessonSlug);
	if (!lesson) return undefined;
	return lesson.modules.find((m) => m.id === moduleId);
}

export function getAllCourses(): Course[] {
	return [...courses];
}
