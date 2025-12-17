import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Username or email address',
    example: 'johndoe or user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
