import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum AssignableRoleEnum {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  STAFF = 'staff',
}

export class ChangeUserRoleDto {
  @ApiProperty({
    enum: AssignableRoleEnum,
    example: 'instructor',
    description: 'New role to assign (cannot assign super_admin)',
  })
  @IsEnum(AssignableRoleEnum)
  role: AssignableRoleEnum;
}
