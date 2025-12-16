import { Identifier } from '@shared/domain/identifier.base';

export class UserId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): UserId {
    if (value) {
      if (!Identifier.isValidUUID(value)) {
        throw new Error('Invalid UserId format');
      }
      return new UserId(value);
    }
    return new UserId(Identifier.generateUUID());
  }

  static fromString(value: string): UserId {
    return UserId.create(value);
  }
}
