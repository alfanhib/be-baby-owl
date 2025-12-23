import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEmail,
  ValidateNested,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NewStudentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+6281234567890' })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class CreateEnrollmentDto {
  @ApiPropertyOptional({ description: 'Existing student ID' })
  @ValidateIf((o: CreateEnrollmentDto) => !o.student)
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({ description: 'New student data' })
  @ValidateIf((o: CreateEnrollmentDto) => !o.studentId)
  @ValidateNested()
  @Type(() => NewStudentDto)
  student?: NewStudentDto;

  @ApiProperty({ example: 'class-uuid' })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ example: 3000000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'pending', enum: ['pending', 'verified'] })
  @IsString()
  paymentStatus: string;

  @ApiPropertyOptional({ example: 'Enrolled via WhatsApp' })
  @IsString()
  @IsOptional()
  notes?: string;
}
