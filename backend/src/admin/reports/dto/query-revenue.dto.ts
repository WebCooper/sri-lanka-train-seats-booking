import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class QueryRevenueDto {
  @ApiPropertyOptional({
    example: '2026-08-01T00:00:00.000Z',
    description: 'Include allocations created on or after this ISO date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'date_from must be a valid ISO 8601 date string' })
  date_from?: string;

  @ApiPropertyOptional({
    example: '2026-08-31T23:59:59.000Z',
    description: 'Include allocations created on or before this ISO date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'date_to must be a valid ISO 8601 date string' })
  date_to?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'Filter by line ID',
  })
  @IsOptional()
  @IsUUID('all', { message: 'line_id must be a valid UUID' })
  line_id?: string;

  @ApiPropertyOptional({
    example: 'b2c3d4e5-f6a7-8901-bcde-234567890abc',
    description: 'Filter by schedule ID',
  })
  @IsOptional()
  @IsUUID('all', { message: 'schedule_id must be a valid UUID' })
  schedule_id?: string;

  @ApiPropertyOptional({
    example: 'c1d2e3f4-a5b6-7890-1234-56789abcdef0',
    description: 'Filter by train ID',
  })
  @IsOptional()
  @IsUUID('all', { message: 'train_id must be a valid UUID' })
  train_id?: string;
}
