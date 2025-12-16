import { Identifier } from '@shared/domain/identifier.base';
import { randomUUID } from 'crypto';

export class SectionId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(id?: string): SectionId {
    return new SectionId(id ?? randomUUID());
  }
}
