import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SetupPasswordDto {
  @ApiProperty({
    example: 'abc123...',
    description: 'Invite token received from admin',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'SecureP@ss123',
    description:
      'New password (min 8 chars, must contain uppercase, lowercase, number, special char)',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
