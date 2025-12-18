import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectPaymentDto {
  @ApiProperty({ description: 'Rejection reason', example: 'Amount mismatch' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}
