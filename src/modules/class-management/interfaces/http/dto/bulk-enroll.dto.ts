import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  ArrayMinSize,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkEnrollStudentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+6281234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class BulkEnrollDto {
  @ApiProperty({ example: 'class-uuid' })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ type: [BulkEnrollStudentDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkEnrollStudentDto)
  students: BulkEnrollStudentDto[];

  @ApiProperty({ example: 3000000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'pending', enum: ['pending', 'verified'] })
  @IsString()
  @IsIn(['pending', 'verified'])
  paymentStatus: string;
}
