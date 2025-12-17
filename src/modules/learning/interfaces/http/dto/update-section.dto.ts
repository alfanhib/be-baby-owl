import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSectionDto {
  @ApiPropertyOptional({
    description: 'Section title',
    example: 'Getting Started with Python',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Section description',
    example: 'Learn the basics of Python programming',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
