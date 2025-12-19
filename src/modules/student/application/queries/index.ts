export * from './get-student-dashboard';
export * from './get-my-courses';
export * from './get-course-detail';
export * from './check-lesson-access';

import { GetStudentDashboardHandler } from './get-student-dashboard';
import { GetMyCoursesHandler } from './get-my-courses';
import { GetCourseDetailHandler } from './get-course-detail';
import { CheckLessonAccessHandler } from './check-lesson-access';

export const QueryHandlers = [
  GetStudentDashboardHandler,
  GetMyCoursesHandler,
  GetCourseDetailHandler,
  CheckLessonAccessHandler,
];
