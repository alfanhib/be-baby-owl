import { IsString, IsNumber, IsOptional, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { XpReasonEnum } from '../../../domain/value-objects/xp-reason.vo';

export class AwardXpDto {
  @ApiProperty({ description: 'User ID to award XP to' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Amount of XP to award', minimum: 1 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Reason for awarding XP',
    enum: XpReasonEnum,
  })
  @IsEnum(XpReasonEnum)
  reason: XpReasonEnum;

  @ApiPropertyOptional({
    description: 'Reference ID (e.g., lesson ID, quiz ID)',
  })
  @IsString()
  @IsOptional()
  referenceId?: string;
}
