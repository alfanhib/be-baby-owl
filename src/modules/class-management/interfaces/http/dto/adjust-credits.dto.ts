import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';

export class AdjustCreditsDto {
  @ApiProperty({ example: 'uuid-of-enrollment' })
  @IsString()
  @IsNotEmpty()
  enrollmentId: string;

  @ApiProperty({ example: 5, description: 'Positive = add, Negative = deduct' })
  @IsNumber()
  amount: number;

  @ApiProperty({
    enum: ['addition', 'deduction', 'refund', 'correction'],
    example: 'addition',
  })
  @IsEnum(['addition', 'deduction', 'refund', 'correction'])
  type: string;

  @ApiProperty({ example: 'Additional package purchased' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
