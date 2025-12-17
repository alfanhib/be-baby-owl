import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteSectionCommand } from './delete-section.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import {
  CourseNotFoundError,
  SectionNotFoundError,
} from '@learning/domain/errors';
import { CourseId } from '@learning/domain/value-objects';

@CommandHandler(DeleteSectionCommand)
export class DeleteSectionHandler implements ICommandHandler<DeleteSectionCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: DeleteSectionCommand): Promise<void> {
    const { sectionId, courseId, userId } = command;

    // Find course
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      throw new CourseNotFoundError(courseId);
    }

    // Verify user is course creator
    if (course.createdById !== userId) {
      throw new Error('Only course creator can delete sections');
    }

    // Verify section exists
    const section = course.getSectionById(sectionId);
    if (!section) {
      throw new SectionNotFoundError(sectionId);
    }

    // Remove section from course
    course.removeSection(sectionId);

    // Save course
    await this.courseRepository.save(course);
  }
}
