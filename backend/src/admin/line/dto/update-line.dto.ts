import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { IntermediateStationDto } from './create-line.dto';

export class UpdateLineDto {
  @ApiPropertyOptional({ example: 'Updated Main Line', description: 'Updated line name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', description: 'Updated start station UUID' })
  @IsOptional()
  @IsUUID('all', { message: 'start_station_id must be a valid UUID' })
  start_station_id?: string;

  @ApiPropertyOptional({ example: 'f1e2d3c4-b5a6-7890-1234-56789abcdef0', description: 'Updated end station UUID' })
  @IsOptional()
  @IsUUID('all', { message: 'end_station_id must be a valid UUID' })
  end_station_id?: string;

  @ApiPropertyOptional({
    type: [IntermediateStationDto],
    description: 'Updated ordered array of intermediate stations along the route',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IntermediateStationDto)
  stations?: IntermediateStationDto[];
}
