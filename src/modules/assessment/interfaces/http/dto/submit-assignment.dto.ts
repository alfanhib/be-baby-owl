import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUrl,
  Min,
} from 'class-validator';

export class SubmitAssignmentDto {
  @ApiProperty({ enum: ['file', 'text', 'link'] })
  @IsEnum(['file', 'text', 'link'])
  type: string;

  @ApiPropertyOptional({ description: 'URL of uploaded file (for file type)' })
  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Name of the file' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ description: 'Size of the file in bytes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Text content (for text type)' })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiPropertyOptional({ description: 'Link URL (for link type)' })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiPropertyOptional({ description: 'Optional comment' })
  @IsOptional()
  @IsString()
  comment?: string;
}
