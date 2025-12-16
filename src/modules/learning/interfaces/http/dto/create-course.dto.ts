import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'Python for Beginners', description: 'Course title' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Learn Python programming from scratch',
    description: 'Course description',
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional({
    example: 'python-for-beginners',
    description: 'URL-friendly slug (auto-generated if not provided)',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  slug?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/cover.jpg',
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
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
    description: 'Course difficulty level',
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  level?: string;

  @ApiPropertyOptional({
    example: 'indonesian',
    description: 'Course language',
    default: 'indonesian',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    example: 20,
    description: 'Estimated duration in hours',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;
}
