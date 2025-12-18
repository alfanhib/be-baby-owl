import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AwardBadgeDto {
  @ApiProperty({ description: 'User ID to award badge to' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Badge ID to award' })
  @IsString()
  badgeId: string;
}
