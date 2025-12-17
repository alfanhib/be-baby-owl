import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AddLessonCommand } from './add-lesson.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import {
  CourseNotFoundError,
  SectionNotFoundError,
} from '@learning/domain/errors';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';
import { LessonAddedEvent } from '@learning/domain/events';
import { CourseId } from '@learning/domain/value-objects';

@CommandHandler(AddLessonCommand)
export class AddLessonHandler implements ICommandHandler<AddLessonCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: AddLessonCommand): Promise<{ lessonId: string }> {
    const {
      courseId,
      sectionId,
      title,
      description,
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
      throw new Error('Only course creator can add lessons');
    }

    // Find section
    const section = course.getSectionById(sectionId);
    if (!section) {
      throw new SectionNotFoundError(sectionId);
    }

    // Add lesson to section
    const lesson = section.addLesson({ title, description, estimatedDuration });

    // Save course
    await this.courseRepository.save(course);

    // Publish event
    void this.eventBus.publish(
      new LessonAddedEvent(courseId, sectionId, lesson.id.value, title),
    );

    return { lessonId: lesson.id.value };
  }
}
