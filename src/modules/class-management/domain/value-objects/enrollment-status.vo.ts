import { ValueObject } from '@shared/domain/value-object.base';

export enum EnrollmentStatusEnum {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  WITHDRAWN = 'withdrawn',
}

interface EnrollmentStatusProps {
  value: EnrollmentStatusEnum;
}

export class EnrollmentStatus extends ValueObject<EnrollmentStatusProps> {
  private constructor(props: EnrollmentStatusProps) {
    super(props);
  }

  get value(): EnrollmentStatusEnum {
    return this.props.value;
  }

  static create(value: string): EnrollmentStatus {
    const normalized = value.toLowerCase() as EnrollmentStatusEnum;
    if (!Object.values(EnrollmentStatusEnum).includes(normalized)) {
      throw new Error(`Invalid enrollment status: ${value}`);
    }
    return new EnrollmentStatus({ value: normalized });
  }

  static active(): EnrollmentStatus {
    return new EnrollmentStatus({ value: EnrollmentStatusEnum.ACTIVE });
  }

  static completed(): EnrollmentStatus {
    return new EnrollmentStatus({ value: EnrollmentStatusEnum.COMPLETED });
  }

  static withdrawn(): EnrollmentStatus {
    return new EnrollmentStatus({ value: EnrollmentStatusEnum.WITHDRAWN });
  }

  isActive(): boolean {
    return this.props.value === EnrollmentStatusEnum.ACTIVE;
  }

  isCompleted(): boolean {
    return this.props.value === EnrollmentStatusEnum.COMPLETED;
  }
}
