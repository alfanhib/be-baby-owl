import { ValueObject } from '@shared/domain/value-object.base';

export enum AttendanceStatusEnum {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
}

interface AttendanceStatusProps {
  value: AttendanceStatusEnum;
}

export class AttendanceStatus extends ValueObject<AttendanceStatusProps> {
  private constructor(props: AttendanceStatusProps) {
    super(props);
  }

  get value(): AttendanceStatusEnum {
    return this.props.value;
  }

  static create(value: string): AttendanceStatus {
    const normalized = value.toLowerCase() as AttendanceStatusEnum;
    if (!Object.values(AttendanceStatusEnum).includes(normalized)) {
      throw new Error(`Invalid attendance status: ${value}`);
    }
    return new AttendanceStatus({ value: normalized });
  }

  static present(): AttendanceStatus {
    return new AttendanceStatus({ value: AttendanceStatusEnum.PRESENT });
  }

  static absent(): AttendanceStatus {
    return new AttendanceStatus({ value: AttendanceStatusEnum.ABSENT });
  }

  static late(): AttendanceStatus {
    return new AttendanceStatus({ value: AttendanceStatusEnum.LATE });
  }

  /**
   * Returns true if this attendance status should consume a credit
   * Present and Late consume credits, Absent does not
   */
  consumesCredit(): boolean {
    return (
      this.props.value === AttendanceStatusEnum.PRESENT ||
      this.props.value === AttendanceStatusEnum.LATE
    );
  }

  isPresent(): boolean {
    return this.props.value === AttendanceStatusEnum.PRESENT;
  }

  isAbsent(): boolean {
    return this.props.value === AttendanceStatusEnum.ABSENT;
  }

  isLate(): boolean {
    return this.props.value === AttendanceStatusEnum.LATE;
  }
}
