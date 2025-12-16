import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John Doe Updated',
    description: 'Full name',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({ example: 'A brief bio', description: 'User bio' })
  @IsOptional()
  @IsString()
  bio?: string;
}
