import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum UserStatusActionEnum {
  DEACTIVATE = 'deactivate',
  SUSPEND = 'suspend',
  REACTIVATE = 'reactivate',
}

export class DeactivateUserDto {
  @ApiProperty({
    enum: UserStatusActionEnum,
    example: 'deactivate',
    description: 'Action to perform on user status',
  })
  @IsEnum(UserStatusActionEnum)
  action: UserStatusActionEnum;

  @ApiPropertyOptional({
    example: 'Violation of terms of service',
    description: 'Reason for deactivation/suspension',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
