import { DomainError } from '@shared/domain/domain-error.base';

export class ExerciseNotFoundError extends DomainError {
  constructor(exerciseId: string) {
    super(`Exercise not found: ${exerciseId}`, 'EXERCISE_NOT_FOUND');
  }
}
