import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AddSectionDto {
  @ApiProperty({
    description: 'Section title',
    example: 'Getting Started with Python',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Section description',
    example: 'Learn the basics of Python programming',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
