import { Identifier } from '@shared/domain/identifier.base';

export class ClassId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): ClassId {
    return new ClassId(value ?? Identifier.generateUUID());
  }
}
