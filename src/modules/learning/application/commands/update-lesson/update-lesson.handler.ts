import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateLessonCommand } from './update-lesson.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import {
  CourseNotFoundError,
  SectionNotFoundError,
  LessonNotFoundError,
} from '@learning/domain/errors';
import { CourseId } from '@learning/domain/value-objects';

@CommandHandler(UpdateLessonCommand)
export class UpdateLessonHandler implements ICommandHandler<UpdateLessonCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: UpdateLessonCommand): Promise<void> {
    const {
      lessonId,
      courseId,
      sectionId,
      title,
      description,
      // estimatedDuration - TODO: implement when Lesson entity supports it
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
      throw new Error('Only course creator can update lessons');
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

    // Update lesson
    if (title !== undefined) {
      lesson.updateTitle(title);
    }
    if (description !== undefined) {
      lesson.updateDescription(description);
    }

    // Save course
    await this.courseRepository.save(course);
  }
}
