import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStationDto {
  @ApiProperty({ example: 'Colombo Fort', description: 'Name of the station' })
  @IsString()
  @IsNotEmpty({ message: 'Station name is required' })
  name: string;

  @ApiProperty({ example: 'FOT', description: 'Unique station code' })
  @IsString()
  @IsNotEmpty({ message: 'Station code is required' })
  code: string;

  @ApiPropertyOptional({ example: 'Colombo, Western Province', description: 'Physical location or city' })
  @IsOptional()
  @IsString()
  location?: string;
}
