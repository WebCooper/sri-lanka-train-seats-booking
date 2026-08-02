import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { COACH_CLASSES } from '../../../common/coach.util';

export class CoachClassMultiplierDto {
  @ApiProperty({ example: 'FIRST', enum: COACH_CLASSES })
  @IsString()
  @IsIn(COACH_CLASSES)
  coach_class: string;

  @ApiProperty({ example: 2, description: 'Multiplier applied to the base fare for this coach class' })
  @IsNumber()
  @Min(0.01)
  @Max(100)
  multiplier: number;
}

export class UpdateFareModelDto {
  @ApiProperty({ example: 50, description: 'Flat booking fee in LKR added to every ticket' })
  @IsNumber()
  @Min(0)
  flat_booking_fee: number;

  @ApiProperty({ example: 10, description: 'Rate per kilometer in LKR' })
  @IsNumber()
  @Min(0)
  rate_per_km: number;

  @ApiProperty({
    example: 1,
    description: 'Multiplier applied when departure is outside configured peak windows',
  })
  @IsNumber()
  @Min(0.01)
  @Max(100)
  off_peak_multiplier: number;

  @ApiProperty({ type: [CoachClassMultiplierDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoachClassMultiplierDto)
  coach_class_multipliers: CoachClassMultiplierDto[];
}

export class CreatePeakHourRuleDto {
  @ApiProperty({ example: 'Morning Peak' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '07:00', description: 'Inclusive start time (HH:mm)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  start_time: string;

  @ApiProperty({ example: '09:30', description: 'Exclusive end time (HH:mm)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  end_time: string;

  @ApiProperty({ example: 1.25 })
  @IsNumber()
  @Min(0.01)
  @Max(100)
  multiplier: number;

  @ApiPropertyOptional({
    example: [1, 2, 3, 4, 5],
    description: 'Days of week (0=Sunday through 6=Saturday)',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  days_of_week?: number[];
}

export class UpdatePeakHourRuleDto {
  @ApiPropertyOptional({ example: 'Evening Peak' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: '17:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  start_time?: string;

  @ApiPropertyOptional({ example: '19:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  end_time?: string;

  @ApiPropertyOptional({ example: 1.3 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  multiplier?: number;

  @ApiPropertyOptional({ example: [1, 2, 3, 4, 5] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  days_of_week?: number[];
}

export class FareQuoteDto {
  @ApiProperty({ example: 'line-uuid' })
  @IsString()
  @IsNotEmpty()
  line_id: string;

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

  @ApiProperty({
    example: '2026-08-15T08:30:00.000Z',
    description: 'Schedule departure time used for peak/off-peak multiplier',
  })
  @IsString()
  @IsNotEmpty()
  departure_time: string;
}
