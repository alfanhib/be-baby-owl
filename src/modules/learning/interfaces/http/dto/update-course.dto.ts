import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateCourseDto {
  @ApiPropertyOptional({
    example: 'Python for Beginners - Updated',
    description: 'Course title',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated course description',
    description: 'Course description',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/new-cover.jpg',
    description: 'Cover image URL',
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({
    example: 'Programming',
    description: 'Course category',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'intermediate',
    enum: ['beginner', 'intermediate', 'advanced'],
    description: 'Course difficulty level',
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  level?: string;

  @ApiPropertyOptional({
    example: 'english',
    description: 'Course language',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Estimated duration in hours',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;
}
