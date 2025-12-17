import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateVideoProgressCommand } from './update-video-progress.command';
import {
  IProgressRepository,
  PROGRESS_REPOSITORY,
} from '@learning/domain/repositories/progress.repository.interface';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';
import { StudentProgress } from '@learning/domain/aggregates/student-progress.aggregate';
import { CourseId } from '@learning/domain/value-objects/course-id.vo';

@CommandHandler(UpdateVideoProgressCommand)
export class UpdateVideoProgressHandler implements ICommandHandler<UpdateVideoProgressCommand> {
  constructor(
    @Inject(PROGRESS_REPOSITORY)
    private readonly progressRepository: IProgressRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(
    command: UpdateVideoProgressCommand,
  ): Promise<{ exerciseCompleted: boolean; lessonCompleted: boolean }> {
    const {
      userId,
      courseId,
      lessonId,
      exerciseId,
      watchedSeconds,
      totalSeconds,
    } = command;

    // Get or create progress
    let progress = await this.progressRepository.findByUserAndCourse(
      userId,
      courseId,
    );

    if (!progress) {
      progress = StudentProgress.create({ userId, courseId });
    }

    // Get total exercises in lesson
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      throw new Error('Course not found');
    }

    let totalExercisesInLesson = 0;
    for (const section of course.sections) {
      const lesson = section.getLessonById(lessonId);
      if (lesson) {
        totalExercisesInLesson = lesson.exercises.length;
        break;
      }
    }

    // Update video progress
    const result = progress.updateVideoProgress(
      exerciseId,
      lessonId,
      watchedSeconds,
      totalSeconds,
      totalExercisesInLesson,
    );

    // Save progress
    await this.progressRepository.save(progress);

    // Publish domain events
    for (const event of progress.domainEvents) {
      void this.eventBus.publish(event);
    }
    progress.clearEvents();

    return result;
  }
}
