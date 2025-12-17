import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteExerciseCommand } from './delete-exercise.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import {
  CourseNotFoundError,
  SectionNotFoundError,
  LessonNotFoundError,
  ExerciseNotFoundError,
} from '@learning/domain/errors';
import { CourseId } from '@learning/domain/value-objects';

@CommandHandler(DeleteExerciseCommand)
export class DeleteExerciseHandler implements ICommandHandler<DeleteExerciseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: DeleteExerciseCommand): Promise<void> {
    const { exerciseId, courseId, sectionId, lessonId, userId } = command;

    // Find course
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      throw new CourseNotFoundError(courseId);
    }

    // Verify user is course creator
    if (course.createdById !== userId) {
      throw new Error('Only course creator can delete exercises');
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

    // Verify exercise exists
    const exercise = lesson.getExerciseById(exerciseId);
    if (!exercise) {
      throw new ExerciseNotFoundError(exerciseId);
    }

    // Remove exercise
    lesson.removeExercise(exerciseId);

    // Save course
    await this.courseRepository.save(course);
  }
}
