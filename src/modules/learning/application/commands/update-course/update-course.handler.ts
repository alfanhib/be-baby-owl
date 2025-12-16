import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException } from '@nestjs/common';
import { UpdateCourseCommand } from './update-course.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import { CourseId } from '@learning/domain/value-objects/course-id.vo';
import { CourseLevelEnum } from '@learning/domain/value-objects/course-level.vo';
import { CourseNotFoundError } from '@learning/domain/errors/course-not-found.error';

export interface UpdateCourseResult {
  id: string;
  title: string;
  slug: string;
  status: string;
}

@CommandHandler(UpdateCourseCommand)
export class UpdateCourseHandler implements ICommandHandler<UpdateCourseCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(command: UpdateCourseCommand): Promise<UpdateCourseResult> {
    const courseId = CourseId.create(command.courseId);
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new CourseNotFoundError(command.courseId);
    }

    // Check ownership (creator or admin can update)
    if (course.createdById !== command.updatedById) {
      throw new ForbiddenException('You can only update your own courses');
    }

    // Update course
    course.updateBasicInfo({
      title: command.title,
      description: command.description,
      coverImage: command.coverImage,
      category: command.category,
      level: command.level as CourseLevelEnum | undefined,
      language: command.language,
      estimatedDuration: command.estimatedDuration,
    });

    await this.courseRepository.save(course);

    return {
      id: course.id.value,
      title: course.title,
      slug: course.slug.value,
      status: course.status.value,
    };
  }
}
