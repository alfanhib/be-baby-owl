import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReorderExercisesCommand } from './reorder-exercises.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import {
  CourseNotFoundError,
  SectionNotFoundError,
  LessonNotFoundError,
} from '@learning/domain/errors';
import { CourseId } from '@learning/domain/value-objects';

@CommandHandler(ReorderExercisesCommand)
export class ReorderExercisesHandler implements ICommandHandler<ReorderExercisesCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: ReorderExercisesCommand): Promise<void> {
    const { courseId, sectionId, lessonId, exerciseIds, userId } = command;

    // Find course
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      throw new CourseNotFoundError(courseId);
    }

    // Verify user is course creator
    if (course.createdById !== userId) {
      throw new Error('Only course creator can reorder exercises');
    }

    // Find section
    const section = course.getSectionById(sectionId);
    if (!section) {
      throw new SectionNotFoundError(sectionId);
    }

    // Find lesson
    const lesson = section.getLessonById(lessonId);
    if (!lesson) {
      throw new LessonNotFoundError(lessonId);
    }

    // Verify exercise count matches
    if (exerciseIds.length !== lesson.exerciseCount) {
      throw new Error(
        'Exercise IDs count must match the number of exercises in lesson',
      );
    }

    // Reorder exercises
    lesson.reorderExercises(exerciseIds);

    // Save course
    await this.courseRepository.save(course);
  }
}
