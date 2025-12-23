import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class DuplicateClassDto {
  @ApiProperty({ description: 'Name for the new duplicated class' })
  @IsString()
  newName: string;

  @ApiPropertyOptional({
    description: 'New instructor ID (optional, defaults to source)',
  })
  @IsOptional()
  @IsUUID()
  newInstructorId?: string;

  @ApiPropertyOptional({ description: 'New start date' })
  @IsOptional()
  @IsDateString()
  newStartDate?: string;

  @ApiPropertyOptional({ description: 'New end date' })
  @IsOptional()
  @IsDateString()
  newEndDate?: string;

  @ApiPropertyOptional({ description: 'New enrollment deadline' })
  @IsOptional()
  @IsDateString()
  newEnrollmentDeadline?: string;
}
