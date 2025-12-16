import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCourseCommand } from './create-course.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import { Course } from '@learning/domain/aggregates/course.aggregate';
import { CourseLevelEnum } from '@learning/domain/value-objects/course-level.vo';
import { DuplicateSlugError } from '@learning/domain/errors/duplicate-slug.error';
import { Slug } from '@learning/domain/value-objects/slug.vo';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

export interface CreateCourseResult {
  id: string;
  title: string;
  slug: string;
  status: string;
}

@CommandHandler(CreateCourseCommand)
export class CreateCourseHandler implements ICommandHandler<CreateCourseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: CreateCourseCommand): Promise<CreateCourseResult> {
    // Check slug uniqueness
    const slug = command.slug
      ? Slug.create(command.slug)
      : Slug.fromTitle(command.title);

    const slugExists = await this.courseRepository.slugExists(slug.value);
    if (slugExists) {
      throw new DuplicateSlugError(slug.value);
    }

    // Create course
    const course = Course.create({
      title: command.title,
      description: command.description,
      createdById: command.createdById,
      slug: slug.value,
      coverImage: command.coverImage,
      category: command.category,
      level: command.level as CourseLevelEnum | undefined,
      language: command.language,
      estimatedDuration: command.estimatedDuration,
    });

    // Save
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
    };
  }
}
