import { ValueObject } from '@shared/domain/value-object.base';

export enum UserStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

interface UserStatusProps {
  value: UserStatusEnum;
}

export class UserStatus extends ValueObject<UserStatusProps> {
  private constructor(props: UserStatusProps) {
    super(props);
  }

  get value(): UserStatusEnum {
    return this.props.value;
  }

  static create(status: UserStatusEnum | string): UserStatus {
    const statusValue = this.parseStatus(status);
    return new UserStatus({ value: statusValue });
  }

  static active(): UserStatus {
    return new UserStatus({ value: UserStatusEnum.ACTIVE });
  }

  static inactive(): UserStatus {
    return new UserStatus({ value: UserStatusEnum.INACTIVE });
  }

  static suspended(): UserStatus {
    return new UserStatus({ value: UserStatusEnum.SUSPENDED });
  }

  private static parseStatus(status: UserStatusEnum | string): UserStatusEnum {
    if (Object.values(UserStatusEnum).includes(status as UserStatusEnum)) {
      return status as UserStatusEnum;
    }
    throw new Error(`Invalid user status: ${status}`);
  }

  isActive(): boolean {
    return this.props.value === UserStatusEnum.ACTIVE;
  }

  isInactive(): boolean {
    return this.props.value === UserStatusEnum.INACTIVE;
  }

  isSuspended(): boolean {
    return this.props.value === UserStatusEnum.SUSPENDED;
  }

  canLogin(): boolean {
    return this.props.value === UserStatusEnum.ACTIVE;
  }

  toString(): string {
    return this.props.value;
  }
}
