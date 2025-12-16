import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException } from '@nestjs/common';
import { ArchiveCourseCommand } from './archive-course.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import { CourseId } from '@learning/domain/value-objects/course-id.vo';
import { CourseNotFoundError } from '@learning/domain/errors/course-not-found.error';

export interface ArchiveCourseResult {
  id: string;
  title: string;
  status: string;
}

@CommandHandler(ArchiveCourseCommand)
export class ArchiveCourseHandler implements ICommandHandler<ArchiveCourseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: ArchiveCourseCommand): Promise<ArchiveCourseResult> {
    const courseId = CourseId.create(command.courseId);
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new CourseNotFoundError(command.courseId);
    }

    // Check ownership
    if (course.createdById !== command.archivedById) {
      throw new ForbiddenException('You can only archive your own courses');
    }

    // Archive course
    course.archive();

    await this.courseRepository.save(course);

    return {
      id: course.id.value,
      title: course.title,
      status: course.status.value,
    };
  }
}
