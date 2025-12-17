import { Identifier } from '@shared/domain/identifier.base';

export class ProgressId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(id?: string): ProgressId {
    return new ProgressId(id ?? Identifier.generateUUID());
  }
}

export class LessonProgressId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(id?: string): LessonProgressId {
    return new LessonProgressId(id ?? Identifier.generateUUID());
  }
}

export class ExerciseProgressId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(id?: string): ExerciseProgressId {
    return new ExerciseProgressId(id ?? Identifier.generateUUID());
  }
}
