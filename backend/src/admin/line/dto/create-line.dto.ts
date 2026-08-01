import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class IntermediateStationDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', description: 'Station UUID' })
  @IsUUID('all', { message: 'station_id must be a valid UUID' })
  @IsNotEmpty()
  station_id: string;

  @ApiPropertyOptional({ example: 45.5, description: 'Distance from start station in km', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance_from_start?: number;
}

export class CreateLineDto {
  @ApiProperty({ example: 'Main Line (Colombo - Badulla)', description: 'Name of the train route/line' })
  @IsString()
  @IsNotEmpty({ message: 'Line name is required' })
  name: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', description: 'Start station UUID' })
  @IsUUID('all', { message: 'start_station_id must be a valid UUID' })
  @IsNotEmpty()
  start_station_id: string;

  @ApiProperty({ example: 'f1e2d3c4-b5a6-7890-1234-56789abcdef0', description: 'End station UUID' })
  @IsUUID('all', { message: 'end_station_id must be a valid UUID' })
  @IsNotEmpty()
  end_station_id: string;

  @ApiPropertyOptional({
    type: [IntermediateStationDto],
    description: 'Ordered array of intermediate stations along the route',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IntermediateStationDto)
  stations?: IntermediateStationDto[];
}
