import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class ScheduleDto {
  @ApiProperty({ example: 'monday' })
  @IsString()
  dayOfWeek: string;

  @ApiProperty({ example: '19:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '21:00' })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ example: 'Asia/Jakarta' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class CreateClassDto {
  @ApiProperty({ example: 'Python Batch 1 - Group Class' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'uuid-of-course' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ example: 'uuid-of-instructor' })
  @IsString()
  @IsNotEmpty()
  instructorId: string;

  @ApiProperty({ enum: ['group', 'private'], example: 'group' })
  @IsEnum(['group', 'private'])
  type: string;

  @ApiProperty({ example: 12, description: 'Total number of meetings' })
  @IsNumber()
  @Min(1)
  totalMeetings: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Max students for group class',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxStudents?: number;

  @ApiPropertyOptional({ type: [ScheduleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  schedules?: ScheduleDto[];

  @ApiPropertyOptional({ example: '2025-01-15T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-04-15T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: '2025-01-10T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  enrollmentDeadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
