// Course Queries
export * from './get-course/get-course.query';
export * from './get-course/get-course.handler';
export * from './get-courses/get-courses.query';
export * from './get-courses/get-courses.handler';

// Progress Queries
export * from './get-student-progress/get-student-progress.query';
export * from './get-student-progress/get-student-progress.handler';
export * from './get-course-stats/get-course-stats.query';
export * from './get-course-stats/get-course-stats.handler';

// Lesson & Exercise Queries
export * from './get-lesson-detail/get-lesson-detail.query';
export * from './get-lesson-detail/get-lesson-detail.handler';
export * from './get-exercise-detail/get-exercise-detail.query';
export * from './get-exercise-detail/get-exercise-detail.handler';

// Student Courses Query
export * from './get-student-courses/get-student-courses.query';
export * from './get-student-courses/get-student-courses.handler';

import {
  GetCourseHandler,
  GetCourseBySlugHandler,
} from './get-course/get-course.handler';
import {
  GetCoursesHandler,
  GetPublishedCoursesHandler,
} from './get-courses/get-courses.handler';
import { GetStudentProgressHandler } from './get-student-progress/get-student-progress.handler';
import { GetCourseStatsHandler } from './get-course-stats/get-course-stats.handler';
import { GetLessonDetailHandler } from './get-lesson-detail/get-lesson-detail.handler';
import { GetExerciseDetailHandler } from './get-exercise-detail/get-exercise-detail.handler';
import { GetStudentCoursesHandler } from './get-student-courses/get-student-courses.handler';

export const QueryHandlers = [
  // Course
  GetCourseHandler,
  GetCourseBySlugHandler,
  GetCoursesHandler,
  GetPublishedCoursesHandler,
  // Progress
  GetStudentProgressHandler,
  GetCourseStatsHandler,
  // Lesson & Exercise
  GetLessonDetailHandler,
  GetExerciseDetailHandler,
  // Student Courses
  GetStudentCoursesHandler,
];
