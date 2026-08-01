import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStationDto {
  @ApiPropertyOptional({ example: 'Colombo Fort Station', description: 'Updated station name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'FOT', description: 'Updated station code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Fort, Colombo 01', description: 'Updated location details' })
  @IsOptional()
  @IsString()
  location?: string;
}
