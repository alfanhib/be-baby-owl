import { ValueObject } from '@shared/domain/value-object.base';

export enum UserRoleEnum {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  STAFF = 'staff',
  SUPER_ADMIN = 'super_admin',
}

interface UserRoleProps {
  value: UserRoleEnum;
}

export class UserRole extends ValueObject<UserRoleProps> {
  private constructor(props: UserRoleProps) {
    super(props);
  }

  get value(): UserRoleEnum {
    return this.props.value;
  }

  static create(role: UserRoleEnum | string): UserRole {
    const roleValue = this.parseRole(role);
    return new UserRole({ value: roleValue });
  }

  static student(): UserRole {
    return new UserRole({ value: UserRoleEnum.STUDENT });
  }

  static instructor(): UserRole {
    return new UserRole({ value: UserRoleEnum.INSTRUCTOR });
  }

  static staff(): UserRole {
    return new UserRole({ value: UserRoleEnum.STAFF });
  }

  static superAdmin(): UserRole {
    return new UserRole({ value: UserRoleEnum.SUPER_ADMIN });
  }

  private static parseRole(role: UserRoleEnum | string): UserRoleEnum {
    if (Object.values(UserRoleEnum).includes(role as UserRoleEnum)) {
      return role as UserRoleEnum;
    }
    throw new Error(`Invalid user role: ${role}`);
  }

  isStudent(): boolean {
    return this.props.value === UserRoleEnum.STUDENT;
  }

  isInstructor(): boolean {
    return this.props.value === UserRoleEnum.INSTRUCTOR;
  }

  isStaff(): boolean {
    return this.props.value === UserRoleEnum.STAFF;
  }

  isSuperAdmin(): boolean {
    return this.props.value === UserRoleEnum.SUPER_ADMIN;
  }

  hasAdminAccess(): boolean {
    return (
      this.props.value === UserRoleEnum.STAFF ||
      this.props.value === UserRoleEnum.SUPER_ADMIN
    );
  }

  toString(): string {
    return this.props.value;
  }
}
