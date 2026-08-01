import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class QueryScheduleDto {
  @ApiPropertyOptional({ example: 1, default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: '2026-08-01T00:00:00.000Z',
    description: 'Filter schedules departing on or after this ISO date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'date_from must be a valid ISO 8601 date string' })
  date_from?: string;

  @ApiPropertyOptional({
    example: '2026-08-31T23:59:59.000Z',
    description: 'Filter schedules departing on or before this ISO date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'date_to must be a valid ISO 8601 date string' })
  date_to?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'Filter schedules for a specific line ID',
  })
  @IsOptional()
  @IsUUID('all', { message: 'line_id must be a valid UUID' })
  line_id?: string;

  @ApiPropertyOptional({
    example: 'c1d2e3f4-a5b6-7890-1234-56789abcdef0',
    description: 'Filter schedules for a specific train ID',
  })
  @IsOptional()
  @IsUUID('all', { message: 'train_id must be a valid UUID' })
  train_id?: string;
}
