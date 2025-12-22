import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  Matches,
} from 'class-validator';

export enum CreateUserRoleEnum {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  STAFF = 'staff',
}

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    example: 'johndoe',
    description: 'Username (optional, alphanumeric and underscore only)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username?: string;

  @ApiProperty({
    example: 'SecureP@ss123',
    description:
      'Password (min 8 chars, must contain uppercase, lowercase, number, special char)',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    enum: CreateUserRoleEnum,
    example: 'student',
    description: 'User role (staff can only create students)',
  })
  @IsEnum(CreateUserRoleEnum)
  role: CreateUserRoleEnum;
}
