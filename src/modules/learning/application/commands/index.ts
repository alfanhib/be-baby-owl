export * from './create-course/create-course.command';
export * from './create-course/create-course.handler';
export * from './update-course/update-course.command';
export * from './update-course/update-course.handler';
export * from './publish-course/publish-course.command';
export * from './publish-course/publish-course.handler';
export * from './archive-course/archive-course.command';
export * from './archive-course/archive-course.handler';
export * from './delete-course/delete-course.command';
export * from './delete-course/delete-course.handler';

import { CreateCourseHandler } from './create-course/create-course.handler';
import { UpdateCourseHandler } from './update-course/update-course.handler';
import { PublishCourseHandler } from './publish-course/publish-course.handler';
import { ArchiveCourseHandler } from './archive-course/archive-course.handler';
import { DeleteCourseHandler } from './delete-course/delete-course.handler';

export const CommandHandlers = [
  CreateCourseHandler,
  UpdateCourseHandler,
  PublishCourseHandler,
  ArchiveCourseHandler,
  DeleteCourseHandler,
];
