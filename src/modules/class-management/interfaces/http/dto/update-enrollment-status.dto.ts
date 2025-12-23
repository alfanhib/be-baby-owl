import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class UpdateEnrollmentStatusDto {
  @ApiProperty({
    example: 'active',
    enum: ['active', 'completed', 'withdrawn'],
  })
  @IsString()
  @IsIn(['active', 'completed', 'withdrawn'])
  status: string;
}
