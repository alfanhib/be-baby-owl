import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsArray,
  ValidateNested,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class BulkUnlockItemDto {
  @ApiProperty({ description: 'Lesson ID to unlock' })
  @IsUUID()
  lessonId: string;

  @ApiPropertyOptional({ description: 'Associated meeting number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  meetingNumber?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkUnlockLessonsDto {
  @ApiProperty({
    description: 'Array of lessons to unlock',
    type: [BulkUnlockItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUnlockItemDto)
  lessons: BulkUnlockItemDto[];
}


