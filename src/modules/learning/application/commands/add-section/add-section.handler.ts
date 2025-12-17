import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AddSectionCommand } from './add-section.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import { CourseNotFoundError } from '@learning/domain/errors';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';
import { SectionAddedEvent } from '@learning/domain/events';
import { CourseId } from '@learning/domain/value-objects';

@CommandHandler(AddSectionCommand)
export class AddSectionHandler implements ICommandHandler<AddSectionCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: AddSectionCommand): Promise<{ sectionId: string }> {
    const { courseId, title, description, userId } = command;

    // Find course
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      throw new CourseNotFoundError(courseId);
    }

    // Verify user is course creator (or admin - simplified for now)
    if (course.createdById !== userId) {
      throw new Error('Only course creator can add sections');
    }

    // Add section to course
    const section = course.addSection({ title, description });

    // Save course with new section
    await this.courseRepository.save(course);

    // Publish events
    void this.eventBus.publish(
      new SectionAddedEvent(courseId, section.id.value, title, userId),
    );

    return { sectionId: section.id.value };
  }
}
