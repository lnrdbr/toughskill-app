import type { Course, Lesson } from '$lib/types/course';
import { creativity } from './creativity';

const courses: Course[] = [creativity];

export function getCourse(courseId: string): Course | undefined {
	return courses.find((c) => c.id === courseId);
}

export function getLessonBySlug(courseId: string, lessonSlug: string): Lesson | undefined {
	const course = getCourse(courseId);
	if (!course) return undefined;
	return course.lessons.find((l) => l.slug === lessonSlug);
}

export function getAllCourses(): Course[] {
	return [...courses];
}
