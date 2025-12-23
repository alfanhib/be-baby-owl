import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmissionQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exerciseId?: string;

  @ApiPropertyOptional({ enum: ['pending', 'graded', 'returned'] })
  @IsOptional()
  @IsEnum(['pending', 'graded', 'returned'])
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
