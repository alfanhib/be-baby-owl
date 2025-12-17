import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReorderLessonsCommand } from './reorder-lessons.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import {
  CourseNotFoundError,
  SectionNotFoundError,
} from '@learning/domain/errors';
import { CourseId } from '@learning/domain/value-objects';

@CommandHandler(ReorderLessonsCommand)
export class ReorderLessonsHandler implements ICommandHandler<ReorderLessonsCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: ReorderLessonsCommand): Promise<void> {
    const { courseId, sectionId, lessonIds, userId } = command;

    // Find course
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      throw new CourseNotFoundError(courseId);
    }

    // Verify user is course creator
    if (course.createdById !== userId) {
      throw new Error('Only course creator can reorder lessons');
    }

    // Find section
    const section = course.getSectionById(sectionId);
    if (!section) {
      throw new SectionNotFoundError(sectionId);
    }

    // Verify lesson count matches
    if (lessonIds.length !== section.lessonCount) {
      throw new Error(
        'Lesson IDs count must match the number of lessons in section',
      );
    }

    // Reorder lessons
    section.reorderLessons(lessonIds);

    // Save course
    await this.courseRepository.save(course);
  }
}
