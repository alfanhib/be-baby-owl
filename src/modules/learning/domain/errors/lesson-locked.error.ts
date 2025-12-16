import { DomainError } from '@shared/domain/domain-error.base';

export class LessonLockedError extends DomainError {
  constructor(lessonId: string) {
    super(`Lesson is locked: ${lessonId}`, 'LESSON_LOCKED');
  }
}
