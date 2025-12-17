import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class AddLessonDto {
  @ApiProperty({
    description: 'Lesson title',
    example: 'Introduction to Variables',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Lesson description',
    example: 'Learn about variables and data types in Python',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Estimated duration in minutes',
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;
}
