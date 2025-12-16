export * from './get-course/get-course.query';
export * from './get-course/get-course.handler';
export * from './get-courses/get-courses.query';
export * from './get-courses/get-courses.handler';

import {
  GetCourseHandler,
  GetCourseBySlugHandler,
} from './get-course/get-course.handler';
import {
  GetCoursesHandler,
  GetPublishedCoursesHandler,
} from './get-courses/get-courses.handler';

export const QueryHandlers = [
  GetCourseHandler,
  GetCourseBySlugHandler,
  GetCoursesHandler,
  GetPublishedCoursesHandler,
];
