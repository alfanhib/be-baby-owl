import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  MaxLength,
  IsObject,
} from 'class-validator';

export class UpdateExerciseDto {
  @ApiPropertyOptional({
    description: 'Exercise title',
    example: 'Introduction Video',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Exercise content (structure depends on type)',
    example: { youtubeId: 'dQw4w9WgXcQ', duration: 300 },
  })
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Estimated duration in minutes',
    example: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;
}
