import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  MaxLength,
  IsEnum,
  IsObject,
} from 'class-validator';

export class AddExerciseDto {
  @ApiProperty({
    description: 'Exercise title',
    example: 'Introduction Video',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Exercise type',
    enum: ['video', 'quiz', 'material', 'assignment', 'coding'],
    example: 'video',
  })
  @IsNotEmpty()
  @IsEnum(['video', 'quiz', 'material', 'assignment', 'coding'])
  type: string;

  @ApiProperty({
    description: 'Exercise content (structure depends on type)',
    example: { youtubeId: 'dQw4w9WgXcQ', duration: 300 },
  })
  @IsNotEmpty()
  @IsObject()
  content: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Estimated duration in minutes',
    example: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;
}
