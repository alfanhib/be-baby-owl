import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class BulkGradeEntryDto {
  @ApiProperty()
  @IsString()
  submissionId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxScore: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class BulkGradeDto {
  @ApiProperty({ type: [BulkGradeEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkGradeEntryDto)
  entries: BulkGradeEntryDto[];
}

