import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ReturnForRevisionDto {
  @ApiProperty({ description: 'Feedback explaining why revision is needed' })
  @IsString()
  @IsNotEmpty()
  feedback: string;
}

