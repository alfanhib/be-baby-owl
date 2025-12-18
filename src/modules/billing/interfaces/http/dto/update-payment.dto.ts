import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsDateString,
  IsIn,
} from 'class-validator';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ description: 'Student full name' })
  @IsOptional()
  @IsString()
  studentName?: string;

  @ApiPropertyOptional({ description: 'Student email' })
  @IsOptional()
  @IsEmail()
  studentEmail?: string;

  @ApiPropertyOptional({ description: 'Student phone number' })
  @IsOptional()
  @IsString()
  studentPhone?: string;

  @ApiPropertyOptional({ description: 'Course ID' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Package type' })
  @IsOptional()
  @IsString()
  packageType?: string;

  @ApiPropertyOptional({ description: 'Payment amount in IDR' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Payment method',
    enum: ['bank_transfer', 'e_wallet', 'credit_card', 'cash', 'other'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['bank_transfer', 'e_wallet', 'credit_card', 'cash', 'other'])
  method?: string;

  @ApiPropertyOptional({ description: 'Payment reference number' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: 'Date when payment was made' })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
