import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AddExerciseCommand } from './add-exercise.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import {
  CourseNotFoundError,
  SectionNotFoundError,
  LessonNotFoundError,
} from '@learning/domain/errors';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';
import { ExerciseAddedEvent } from '@learning/domain/events';
import { CourseId } from '@learning/domain/value-objects';
import { ExerciseTypeEnum } from '@learning/domain/value-objects/exercise-type.vo';

@CommandHandler(AddExerciseCommand)
export class AddExerciseHandler implements ICommandHandler<AddExerciseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: AddExerciseCommand): Promise<{ exerciseId: string }> {
    const {
      courseId,
      sectionId,
      lessonId,
      title,
      type,
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
      throw new Error('Only course creator can add exercises');
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

    // Add exercise to lesson
    const exercise = lesson.addExercise({
      title,
      type: type as ExerciseTypeEnum,
      content,
      estimatedDuration,
    });

    // Save course
    await this.courseRepository.save(course);

    // Publish event
    void this.eventBus.publish(
      new ExerciseAddedEvent(lessonId, exercise.id.value, title, type),
    );

    return { exerciseId: exercise.id.value };
  }
}
