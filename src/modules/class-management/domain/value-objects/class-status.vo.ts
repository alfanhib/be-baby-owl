import { ValueObject } from '@shared/domain/value-object.base';

export enum ClassStatusEnum {
  DRAFT = 'draft',
  ENROLLMENT_OPEN = 'enrollment_open',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

interface ClassStatusProps {
  value: ClassStatusEnum;
}

export class ClassStatus extends ValueObject<ClassStatusProps> {
  private constructor(props: ClassStatusProps) {
    super(props);
  }

  get value(): ClassStatusEnum {
    return this.props.value;
  }

  static create(value: string): ClassStatus {
    const normalized = value.toLowerCase() as ClassStatusEnum;
    if (!Object.values(ClassStatusEnum).includes(normalized)) {
      throw new Error(`Invalid class status: ${value}`);
    }
    return new ClassStatus({ value: normalized });
  }

  static draft(): ClassStatus {
    return new ClassStatus({ value: ClassStatusEnum.DRAFT });
  }

  static enrollmentOpen(): ClassStatus {
    return new ClassStatus({ value: ClassStatusEnum.ENROLLMENT_OPEN });
  }

  static active(): ClassStatus {
    return new ClassStatus({ value: ClassStatusEnum.ACTIVE });
  }

  static completed(): ClassStatus {
    return new ClassStatus({ value: ClassStatusEnum.COMPLETED });
  }

  static cancelled(): ClassStatus {
    return new ClassStatus({ value: ClassStatusEnum.CANCELLED });
  }

  isDraft(): boolean {
    return this.props.value === ClassStatusEnum.DRAFT;
  }

  isEnrollmentOpen(): boolean {
    return this.props.value === ClassStatusEnum.ENROLLMENT_OPEN;
  }

  isActive(): boolean {
    return this.props.value === ClassStatusEnum.ACTIVE;
  }

  isCompleted(): boolean {
    return this.props.value === ClassStatusEnum.COMPLETED;
  }

  isCancelled(): boolean {
    return this.props.value === ClassStatusEnum.CANCELLED;
  }

  canEnroll(): boolean {
    return this.props.value === ClassStatusEnum.ENROLLMENT_OPEN;
  }

  canActivate(): boolean {
    return this.props.value === ClassStatusEnum.ENROLLMENT_OPEN;
  }

  canComplete(): boolean {
    return this.props.value === ClassStatusEnum.ACTIVE;
  }
}
