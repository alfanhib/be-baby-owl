import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReorderSectionsCommand } from './reorder-sections.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import { CourseNotFoundError } from '@learning/domain/errors';
import { CourseId } from '@learning/domain/value-objects';

@CommandHandler(ReorderSectionsCommand)
export class ReorderSectionsHandler implements ICommandHandler<ReorderSectionsCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: ReorderSectionsCommand): Promise<void> {
    const { courseId, sectionIds, userId } = command;

    // Find course
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      throw new CourseNotFoundError(courseId);
    }

    // Verify user is course creator
    if (course.createdById !== userId) {
      throw new Error('Only course creator can reorder sections');
    }

    // Verify all section IDs are valid
    if (sectionIds.length !== course.sectionCount) {
      throw new Error(
        'Section IDs count must match the number of sections in course',
      );
    }

    // Reorder sections
    course.reorderSections(sectionIds);

    // Save course
    await this.courseRepository.save(course);
  }
}
