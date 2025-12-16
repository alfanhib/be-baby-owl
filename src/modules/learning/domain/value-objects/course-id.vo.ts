import { Identifier } from '@shared/domain/identifier.base';
import { randomUUID } from 'crypto';

export class CourseId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(id?: string): CourseId {
    return new CourseId(id ?? randomUUID());
  }
}
