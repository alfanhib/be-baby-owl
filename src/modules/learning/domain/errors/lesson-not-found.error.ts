import { DomainError } from '@shared/domain/domain-error.base';

export class LessonNotFoundError extends DomainError {
  constructor(lessonId: string) {
    super(`Lesson not found: ${lessonId}`, 'LESSON_NOT_FOUND');
  }
}
