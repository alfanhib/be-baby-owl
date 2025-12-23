import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsIn, Min } from 'class-validator';

export class UpgradePackageDto {
  @ApiProperty({ example: 10, description: 'Number of meetings to add' })
  @IsNumber()
  @Min(1)
  additionalMeetings: number;

  @ApiProperty({ example: 1500000, description: 'Additional payment amount' })
  @IsNumber()
  @Min(0)
  additionalAmount: number;

  @ApiProperty({ example: 'pending', enum: ['pending', 'verified'] })
  @IsString()
  @IsIn(['pending', 'verified'])
  paymentStatus: string;
}
