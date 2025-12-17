import { Identifier } from '@shared/domain/identifier.base';

export class EnrollmentId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): EnrollmentId {
    return new EnrollmentId(value ?? Identifier.generateUUID());
  }
}

export class AttendanceId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): AttendanceId {
    return new AttendanceId(value ?? Identifier.generateUUID());
  }
}

export class CreditAdjustmentId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): CreditAdjustmentId {
    return new CreditAdjustmentId(value ?? Identifier.generateUUID());
  }
}

export class LessonUnlockId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): LessonUnlockId {
    return new LessonUnlockId(value ?? Identifier.generateUUID());
  }
}
