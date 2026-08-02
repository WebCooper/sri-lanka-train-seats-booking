import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { COACH_CLASSES } from '../../common/coach.util';

export class FareQuoteRequestDto {
  @ApiProperty({ example: 'schedule-uuid' })
  @IsString()
  @IsNotEmpty()
  schedule_id: string;

  @ApiProperty({ example: 'origin-station-uuid' })
  @IsString()
  @IsNotEmpty()
  origin_station_id: string;

  @ApiProperty({ example: 'destination-station-uuid' })
  @IsString()
  @IsNotEmpty()
  destination_station_id: string;

  @ApiProperty({ example: 'FIRST', enum: COACH_CLASSES })
  @IsString()
  @IsIn(COACH_CLASSES)
  coach_class: string;
}
