import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException } from '@nestjs/common';
import { DeleteCourseCommand } from './delete-course.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import { CourseId } from '@learning/domain/value-objects/course-id.vo';
import { CourseNotFoundError } from '@learning/domain/errors/course-not-found.error';

@CommandHandler(DeleteCourseCommand)
export class DeleteCourseHandler implements ICommandHandler<DeleteCourseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: DeleteCourseCommand): Promise<void> {
    const courseId = CourseId.create(command.courseId);
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new CourseNotFoundError(command.courseId);
    }

    // Only draft courses can be deleted
    if (!course.isDraft()) {
      throw new ForbiddenException(
        'Only draft courses can be deleted. Archive published courses instead.',
      );
    }

    // Check ownership
    if (course.createdById !== command.deletedById) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.courseRepository.delete(courseId);
  }
}
