import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsNumber,
  Min,
  IsIn,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

class StudentDto {
  @ApiPropertyOptional({ description: 'Existing student ID' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({ description: 'New student name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'New student email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'New student phone' })
  @IsOptional()
  @IsString()
  phone?: string;
}

class PackageDto {
  @ApiProperty({ description: 'Number of meetings', example: 20 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  meetings: number;

  @ApiProperty({ description: 'Package price', example: 3000000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;
}

export class QuickEnrollDto {
  @ApiProperty({ description: 'Student information' })
  @ValidateNested()
  @Type(() => StudentDto)
  student: StudentDto;

  @ApiProperty({ description: 'Class ID', example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  classId: string;

  @ApiProperty({ description: 'Package details' })
  @ValidateNested()
  @Type(() => PackageDto)
  package: PackageDto;

  @ApiProperty({
    description: 'Payment status',
    enum: ['pending', 'verified'],
    example: 'pending',
  })
  @IsNotEmpty()
  @IsIn(['pending', 'verified'])
  paymentStatus: 'pending' | 'verified';

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
