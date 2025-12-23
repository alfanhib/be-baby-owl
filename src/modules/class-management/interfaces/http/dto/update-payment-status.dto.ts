import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdatePaymentStatusDto {
  @ApiProperty({
    example: 'verified',
    enum: ['pending', 'verified', 'refunded'],
  })
  @IsString()
  @IsIn(['pending', 'verified', 'refunded'])
  paymentStatus: string;

  @ApiPropertyOptional({ example: 'Bank transfer confirmed' })
  @IsString()
  @IsOptional()
  verificationNotes?: string;
}
