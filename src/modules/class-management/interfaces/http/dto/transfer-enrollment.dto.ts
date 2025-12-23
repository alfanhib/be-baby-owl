import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TransferEnrollmentDto {
  @ApiProperty({ example: 'target-class-uuid' })
  @IsString()
  @IsNotEmpty()
  toClassId: string;

  @ApiProperty({ example: 'Schedule conflict' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
