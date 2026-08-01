import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTrainDto {
  @ApiProperty({ example: 'Udarata Menike', description: 'Display name of the train' })
  @IsString()
  @IsNotEmpty({ message: 'Train name is required' })
  name: string;

  @ApiProperty({ example: '1001', description: 'Unique train number/code' })
  @IsString()
  @IsNotEmpty({ message: 'Train number is required' })
  train_number: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', description: 'Line ID to assign train to' })
  @IsOptional()
  @IsUUID('all', { message: 'line_id must be a valid UUID' })
  line_id?: string;

  @ApiPropertyOptional({
    example: ['f1e2d3c4-b5a6-7890-1234-56789abcdef0'],
    description: 'Ordered array of coach UUIDs attached to this train',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true, message: 'Each coach ID must be a valid UUID' })
  coach_ids?: string[];
}
