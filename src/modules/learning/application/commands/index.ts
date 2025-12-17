// Course Commands
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

// Section Commands
export * from './add-section/add-section.command';
export * from './add-section/add-section.handler';
export * from './update-section/update-section.command';
export * from './update-section/update-section.handler';
export * from './delete-section/delete-section.command';
export * from './delete-section/delete-section.handler';
export * from './reorder-sections/reorder-sections.command';
export * from './reorder-sections/reorder-sections.handler';

// Lesson Commands
export * from './add-lesson/add-lesson.command';
export * from './add-lesson/add-lesson.handler';
export * from './update-lesson/update-lesson.command';
export * from './update-lesson/update-lesson.handler';
export * from './delete-lesson/delete-lesson.command';
export * from './delete-lesson/delete-lesson.handler';
export * from './reorder-lessons/reorder-lessons.command';
export * from './reorder-lessons/reorder-lessons.handler';

// Exercise Commands
export * from './add-exercise/add-exercise.command';
export * from './add-exercise/add-exercise.handler';
export * from './update-exercise/update-exercise.command';
export * from './update-exercise/update-exercise.handler';
export * from './delete-exercise/delete-exercise.command';
export * from './delete-exercise/delete-exercise.handler';
export * from './reorder-exercises/reorder-exercises.command';
export * from './reorder-exercises/reorder-exercises.handler';

// Progress Commands
export * from './complete-exercise/complete-exercise.command';
export * from './complete-exercise/complete-exercise.handler';
export * from './update-video-progress/update-video-progress.command';
export * from './update-video-progress/update-video-progress.handler';
export * from './update-material-progress/update-material-progress.command';
export * from './update-material-progress/update-material-progress.handler';
export * from './submit-quiz-answer/submit-quiz-answer.command';
export * from './submit-quiz-answer/submit-quiz-answer.handler';

import { CreateCourseHandler } from './create-course/create-course.handler';
import { UpdateCourseHandler } from './update-course/update-course.handler';
import { PublishCourseHandler } from './publish-course/publish-course.handler';
import { ArchiveCourseHandler } from './archive-course/archive-course.handler';
import { DeleteCourseHandler } from './delete-course/delete-course.handler';
import { AddSectionHandler } from './add-section/add-section.handler';
import { UpdateSectionHandler } from './update-section/update-section.handler';
import { DeleteSectionHandler } from './delete-section/delete-section.handler';
import { ReorderSectionsHandler } from './reorder-sections/reorder-sections.handler';
import { AddLessonHandler } from './add-lesson/add-lesson.handler';
import { UpdateLessonHandler } from './update-lesson/update-lesson.handler';
import { DeleteLessonHandler } from './delete-lesson/delete-lesson.handler';
import { ReorderLessonsHandler } from './reorder-lessons/reorder-lessons.handler';
import { AddExerciseHandler } from './add-exercise/add-exercise.handler';
import { UpdateExerciseHandler } from './update-exercise/update-exercise.handler';
import { DeleteExerciseHandler } from './delete-exercise/delete-exercise.handler';
import { ReorderExercisesHandler } from './reorder-exercises/reorder-exercises.handler';
import { CompleteExerciseHandler } from './complete-exercise/complete-exercise.handler';
import { UpdateVideoProgressHandler } from './update-video-progress/update-video-progress.handler';
import { UpdateMaterialProgressHandler } from './update-material-progress/update-material-progress.handler';
import { SubmitQuizAnswerHandler } from './submit-quiz-answer/submit-quiz-answer.handler';

export const CommandHandlers = [
  // Course
  CreateCourseHandler,
  UpdateCourseHandler,
  PublishCourseHandler,
  ArchiveCourseHandler,
  DeleteCourseHandler,
  // Section
  AddSectionHandler,
  UpdateSectionHandler,
  DeleteSectionHandler,
  ReorderSectionsHandler,
  // Lesson
  AddLessonHandler,
  UpdateLessonHandler,
  DeleteLessonHandler,
  ReorderLessonsHandler,
  // Exercise
  AddExerciseHandler,
  UpdateExerciseHandler,
  DeleteExerciseHandler,
  ReorderExercisesHandler,
  // Progress
  CompleteExerciseHandler,
  UpdateVideoProgressHandler,
  UpdateMaterialProgressHandler,
  SubmitQuizAnswerHandler,
];
