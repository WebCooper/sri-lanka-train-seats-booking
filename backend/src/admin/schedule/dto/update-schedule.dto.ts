import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class UpdateScheduleDto {
  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'Updated line ID assignment',
  })
  @IsOptional()
  @IsUUID('all', { message: 'line_id must be a valid UUID' })
  line_id?: string;

  @ApiPropertyOptional({
    example: 'c1d2e3f4-a5b6-7890-1234-56789abcdef0',
    description: 'Updated train ID assignment',
  })
  @IsOptional()
  @IsUUID('all', { message: 'train_id must be a valid UUID' })
  train_id?: string;

  @ApiPropertyOptional({
    example: '2026-08-05T06:30:00.000Z',
    description: 'Updated departure timestamp (ISO 8601 format)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'departure_time must be a valid ISO 8601 date string' })
  departure_time?: string;

  @ApiPropertyOptional({
    example: '2026-08-05T16:00:00.000Z',
    description: 'Updated arrival timestamp (ISO 8601 format)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'arrival_time must be a valid ISO 8601 date string' })
  arrival_time?: string;
}
