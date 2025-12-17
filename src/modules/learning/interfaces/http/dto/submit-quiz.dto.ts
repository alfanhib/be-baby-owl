import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class SubmitQuizDto {
  @ApiProperty({ description: 'Course ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'Lesson ID' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({
    description: 'Quiz answers as key-value pairs (questionId -> answer)',
    example: { q1: 'a', q2: ['b', 'c'] },
  })
  @IsObject()
  answers: Record<string, unknown>;
}
