import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateExerciseCommand } from './update-exercise.command';
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

@CommandHandler(UpdateExerciseCommand)
export class UpdateExerciseHandler implements ICommandHandler<UpdateExerciseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: UpdateExerciseCommand): Promise<void> {
    const {
      exerciseId,
      courseId,
      sectionId,
      lessonId,
      title,
      content,
      estimatedDuration,
      userId,
    } = command;

    // Find course
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      throw new CourseNotFoundError(courseId);
    }

    // Verify user is course creator
    if (course.createdById !== userId) {
      throw new Error('Only course creator can update exercises');
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

    // Find exercise
    const exercise = lesson.getExerciseById(exerciseId);
    if (!exercise) {
      throw new ExerciseNotFoundError(exerciseId);
    }

    // Update exercise
    if (title !== undefined) {
      exercise.updateTitle(title);
    }
    if (content !== undefined) {
      exercise.updateContent(content);
    }
    if (estimatedDuration !== undefined) {
      exercise.updateEstimatedDuration(estimatedDuration);
    }

    // Save course
    await this.courseRepository.save(course);
  }
}
