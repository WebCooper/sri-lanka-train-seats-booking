import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ScheduleSessionDto {
  @ApiProperty({
    example: '2026-08-05T06:00:00.000Z',
    description: 'Scheduled departure timestamp (ISO 8601 format)',
  })
  @IsDateString({}, { message: 'departure_time must be a valid ISO 8601 date string' })
  @IsNotEmpty({ message: 'departure_time is required' })
  departure_time: string;

  @ApiProperty({
    example: '2026-08-05T15:30:00.000Z',
    description: 'Scheduled arrival timestamp (ISO 8601 format)',
  })
  @IsDateString({}, { message: 'arrival_time must be a valid ISO 8601 date string' })
  @IsNotEmpty({ message: 'arrival_time is required' })
  arrival_time: string;
}

export class BulkCreateScheduleDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'Line ID assigned to these schedule sessions',
  })
  @IsUUID('all', { message: 'line_id must be a valid UUID' })
  @IsNotEmpty({ message: 'line_id is required' })
  line_id: string;

  @ApiProperty({
    example: 'c1d2e3f4-a5b6-7890-1234-56789abcdef0',
    description: 'Train ID assigned to these schedule sessions',
  })
  @IsUUID('all', { message: 'train_id must be a valid UUID' })
  @IsNotEmpty({ message: 'train_id is required' })
  train_id: string;

  @ApiProperty({
    type: [ScheduleSessionDto],
    description: 'List of departure/arrival pairs to schedule',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one session is required' })
  @ArrayMaxSize(366, { message: 'Cannot schedule more than 366 sessions at once' })
  @ValidateNested({ each: true })
  @Type(() => ScheduleSessionDto)
  sessions: ScheduleSessionDto[];
}
