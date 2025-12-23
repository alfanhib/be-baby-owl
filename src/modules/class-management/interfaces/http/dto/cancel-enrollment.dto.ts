import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CancelEnrollmentDto {
  @ApiProperty({ example: 'Student request' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 1500000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  refundAmount?: number;
}
