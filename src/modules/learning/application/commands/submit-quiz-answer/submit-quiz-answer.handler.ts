import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SubmitQuizAnswerCommand } from './submit-quiz-answer.command';
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
import { Exercise } from '@learning/domain/entities/exercise.entity';

export interface QuizSubmissionResult {
  passed: boolean;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  exerciseCompleted: boolean;
  lessonCompleted: boolean;
}

@CommandHandler(SubmitQuizAnswerCommand)
export class SubmitQuizAnswerHandler implements ICommandHandler<SubmitQuizAnswerCommand> {
  constructor(
    @Inject(PROGRESS_REPOSITORY)
    private readonly progressRepository: IProgressRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(
    command: SubmitQuizAnswerCommand,
  ): Promise<QuizSubmissionResult> {
    const { userId, courseId, lessonId, exerciseId, answers } = command;

    // Get course and exercise
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      throw new Error('Course not found');
    }

    // Find exercise
    let targetExercise: Exercise | undefined = undefined;
    let totalExercisesInLesson = 0;

    for (const section of course.sections) {
      const lesson = section.getLessonById(lessonId);
      if (lesson) {
        totalExercisesInLesson = lesson.exercises.length;
        targetExercise = lesson.getExerciseById(exerciseId);
        break;
      }
    }

    if (!targetExercise) {
      throw new Error('Exercise not found');
    }

    // Get quiz content and validate answers
    const quizContent = targetExercise.content as unknown as {
      questions?: Array<{
        id: string;
        correctAnswer: string | string[];
      }>;
      passingScore?: number;
    };

    const questions = quizContent.questions || [];
    const passingScore = quizContent.passingScore || 70;

    let correctAnswers = 0;
    const totalQuestions = questions.length;

    for (const question of questions) {
      const userAnswer = answers[question.id];
      const correctAnswer = question.correctAnswer;

      if (Array.isArray(correctAnswer)) {
        // Multiple correct answers
        if (
          Array.isArray(userAnswer) &&
          correctAnswer.length === userAnswer.length &&
          correctAnswer.every((a) => userAnswer.includes(a))
        ) {
          correctAnswers++;
        }
      } else {
        // Single correct answer
        if (userAnswer === correctAnswer) {
          correctAnswers++;
        }
      }
    }

    const score =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    const passed = score >= passingScore;

    const result: QuizSubmissionResult = {
      passed,
      score,
      correctAnswers,
      totalQuestions,
      exerciseCompleted: false,
      lessonCompleted: false,
    };

    // If passed, mark exercise as complete
    if (passed) {
      let progress = await this.progressRepository.findByUserAndCourse(
        userId,
        courseId,
      );

      if (!progress) {
        progress = StudentProgress.create({ userId, courseId });
      }

      const completionResult = progress.completeExercise(
        exerciseId,
        lessonId,
        totalExercisesInLesson,
      );

      result.exerciseCompleted = completionResult.exerciseCompleted;
      result.lessonCompleted = completionResult.lessonCompleted;

      await this.progressRepository.save(progress);

      // Publish domain events
      for (const event of progress.domainEvents) {
        void this.eventBus.publish(event);
      }
      progress.clearEvents();
    }

    return result;
  }
}
