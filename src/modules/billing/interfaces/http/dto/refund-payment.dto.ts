import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class RefundPaymentDto {
  @ApiProperty({ description: 'Refund amount', example: 3000000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Refund reason',
    example: 'Student requested cancellation',
  })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
