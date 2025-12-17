import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class EnrollStudentDto {
  @ApiProperty({ example: 'uuid-of-student' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
