import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CourseQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 'draft',
    enum: ['draft', 'published', 'archived'],
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string;

  @ApiPropertyOptional({ example: 'Programming' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  level?: string;

  @ApiPropertyOptional({ example: 'python' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class PublishedCourseQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'Programming' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  level?: string;

  @ApiPropertyOptional({ example: 'python' })
  @IsOptional()
  @IsString()
  search?: string;
}
