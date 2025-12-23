import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkEnrollStudentDto {
  @ApiProperty({ description: 'Student email', example: 'student@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Student name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Student phone', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Package meetings', example: 20 })
  @IsNumber()
  @Min(1)
  packageMeetings: number;

  @ApiProperty({ description: 'Package price', example: 3000000 })
  @IsNumber()
  @Min(0)
  packagePrice: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class BulkEnrollDto {
  @ApiProperty({ description: 'Class ID' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({
    description: 'Students to enroll',
    type: [BulkEnrollStudentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkEnrollStudentDto)
  students: BulkEnrollStudentDto[];

  @ApiProperty({
    description: 'Payment status for all enrollments',
    enum: ['pending', 'verified'],
    example: 'pending',
  })
  @IsEnum(['pending', 'verified'])
  paymentStatus: 'pending' | 'verified';
}
