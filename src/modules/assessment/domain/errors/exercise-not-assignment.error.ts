import { DomainError } from '@shared/domain/domain-error.base';

export class ExerciseNotAssignmentError extends DomainError {
  constructor(exerciseId: string) {
    super(`Exercise ${exerciseId} is not an assignment type`);
  }
}

