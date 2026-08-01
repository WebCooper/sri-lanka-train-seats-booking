import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class SearchScheduleDto {
  @ApiPropertyOptional({
    example: '2026-08-05',
    description: 'Single travel date (YYYY-MM-DD). Used when date_from/date_to are omitted.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'date must be a valid date string (YYYY-MM-DD)' })
  date?: string;

  @ApiPropertyOptional({
    example: '2026-08-05',
    description: 'Start of travel date range (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'date_from must be a valid date string (YYYY-MM-DD)' })
  date_from?: string;

  @ApiPropertyOptional({
    example: '2026-08-10',
    description: 'End of travel date range (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'date_to must be a valid date string (YYYY-MM-DD)' })
  date_to?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'Origin station UUID',
  })
  @IsOptional()
  @IsUUID('all', { message: 'origin_id must be a valid UUID' })
  origin_id?: string;

  @ApiPropertyOptional({
    example: 'f1e2d3c4-b5a6-7890-1234-56789abcdef0',
    description: 'Destination station UUID',
  })
  @ValidateIf((dto: SearchScheduleDto) => Boolean(dto.origin_id))
  @IsUUID('all', { message: 'destination_id must be a valid UUID' })
  destination_id?: string;

  @ApiPropertyOptional({
    example: 'b2c3d4e5-f6a7-8901-bcde-234567890abc',
    description: 'Filter by train line UUID',
  })
  @IsOptional()
  @IsUUID('all', { message: 'line_id must be a valid UUID' })
  line_id?: string;

  @ApiPropertyOptional({
    example: 'c3d4e5f6-a7b8-9012-cdef-345678901bcd',
    description: 'Filter by train UUID',
  })
  @IsOptional()
  @IsUUID('all', { message: 'train_id must be a valid UUID' })
  train_id?: string;

  @ApiPropertyOptional({
    example: 'Udarata Menike',
    description: 'Filter by train name (partial match)',
  })
  @IsOptional()
  @IsString()
  train_name?: string;
}
