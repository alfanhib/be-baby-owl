import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class UpdateAttendanceDto {
  @ApiProperty({
    description: 'New attendance status',
    enum: ['present', 'absent', 'late'],
    example: 'present',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['present', 'absent', 'late'])
  status: string;

  @ApiPropertyOptional({
    description: 'Notes about the update',
    example:
      'Changed from absent to present - student arrived late due to traffic',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
