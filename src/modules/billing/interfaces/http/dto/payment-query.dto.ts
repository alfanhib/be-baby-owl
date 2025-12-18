import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsDateString,
  IsIn,
} from 'class-validator';

export class PaymentQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['pending', 'verified', 'rejected', 'refunded'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'verified', 'rejected', 'refunded'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by payment method',
    enum: ['bank_transfer', 'e_wallet', 'credit_card', 'cash', 'other'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['bank_transfer', 'e_wallet', 'credit_card', 'cash', 'other'])
  method?: string;

  @ApiPropertyOptional({ description: 'Filter by course ID' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Search by student name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Start date filter (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date filter (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
