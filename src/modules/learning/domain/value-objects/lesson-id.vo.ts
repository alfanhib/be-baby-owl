import { Identifier } from '@shared/domain/identifier.base';
import { randomUUID } from 'crypto';

export class LessonId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(id?: string): LessonId {
    return new LessonId(id ?? randomUUID());
  }
}
