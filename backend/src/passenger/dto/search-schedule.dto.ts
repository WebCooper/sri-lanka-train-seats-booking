import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class SearchScheduleDto {
  @ApiProperty({
    example: '2026-08-05',
    description: 'Travel date in YYYY-MM-DD format or ISO date string',
  })
  @IsDateString({}, { message: 'date must be a valid date string (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'date is required' })
  date: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'Origin station UUID',
  })
  @IsUUID('all', { message: 'origin_id must be a valid UUID' })
  @IsNotEmpty({ message: 'origin_id is required' })
  origin_id: string;

  @ApiProperty({
    example: 'f1e2d3c4-b5a6-7890-1234-56789abcdef0',
    description: 'Destination station UUID',
  })
  @IsUUID('all', { message: 'destination_id must be a valid UUID' })
  @IsNotEmpty({ message: 'destination_id is required' })
  destination_id: string;
}
