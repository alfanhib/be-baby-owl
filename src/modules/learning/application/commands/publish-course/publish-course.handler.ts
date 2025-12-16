import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException } from '@nestjs/common';
import { PublishCourseCommand } from './publish-course.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import { CourseId } from '@learning/domain/value-objects/course-id.vo';
import { CourseNotFoundError } from '@learning/domain/errors/course-not-found.error';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

export interface PublishCourseResult {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: Date;
}

@CommandHandler(PublishCourseCommand)
export class PublishCourseHandler implements ICommandHandler<PublishCourseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: PublishCourseCommand): Promise<PublishCourseResult> {
    const courseId = CourseId.create(command.courseId);
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new CourseNotFoundError(command.courseId);
    }

    // Check ownership
    if (course.createdById !== command.publishedById) {
      throw new ForbiddenException('You can only publish your own courses');
    }

    // Publish course
    course.publish();

    await this.courseRepository.save(course);

    // Publish domain events
    for (const event of course.domainEvents) {
      this.eventBus.publish(event);
    }
    course.clearEvents();

    return {
      id: course.id.value,
      title: course.title,
      slug: course.slug.value,
      status: course.status.value,
      publishedAt: course.publishedAt!,
    };
  }
}
