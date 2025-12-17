import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class MarkAttendanceDto {
  @ApiProperty({ example: 'uuid-of-enrollment' })
  @IsString()
  @IsNotEmpty()
  enrollmentId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  meetingNumber: number;

  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  meetingDate: string;

  @ApiProperty({ enum: ['present', 'absent', 'late'], example: 'present' })
  @IsEnum(['present', 'absent', 'late'])
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkMarkAttendanceDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  meetingNumber: number;

  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  meetingDate: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        enrollmentId: { type: 'string' },
        status: { type: 'string', enum: ['present', 'absent', 'late'] },
        notes: { type: 'string' },
      },
    },
  })
  attendances: Array<{
    enrollmentId: string;
    status: string;
    notes?: string;
  }>;
}
