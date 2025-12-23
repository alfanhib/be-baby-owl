import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class AddMeetingsDto {
  @ApiProperty({
    description: 'Number of meetings to add to the private class package',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  meetingsToAdd: number;
}
