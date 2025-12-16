import { Identifier } from '@shared/domain/identifier.base';
import { randomUUID } from 'crypto';

export class ExerciseId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(id?: string): ExerciseId {
    return new ExerciseId(id ?? randomUUID());
  }
}
