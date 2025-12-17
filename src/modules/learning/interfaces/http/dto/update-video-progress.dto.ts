import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class UpdateVideoProgressDto {
  @ApiProperty({ description: 'Course ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'Lesson ID' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ description: 'Seconds watched' })
  @IsNumber()
  @Min(0)
  watchedSeconds: number;

  @ApiProperty({ description: 'Total video duration in seconds' })
  @IsNumber()
  @Min(1)
  totalSeconds: number;
}
