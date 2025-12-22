import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({ example: 85, description: 'Score achieved' })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({ example: 100, description: 'Maximum possible score' })
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxScore: number;

  @ApiPropertyOptional({ description: 'Feedback for the student' })
  @IsOptional()
  @IsString()
  feedback?: string;
}

