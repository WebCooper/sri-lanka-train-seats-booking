import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateTrainDto {
  @ApiPropertyOptional({ example: 'Udarata Express', description: 'Updated train name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '1001-EX', description: 'Updated train number' })
  @IsOptional()
  @IsString()
  train_number?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', description: 'Updated line ID assignment' })
  @IsOptional()
  @IsUUID('all', { message: 'line_id must be a valid UUID' })
  line_id?: string | null;

  @ApiPropertyOptional({
    example: ['f1e2d3c4-b5a6-7890-1234-56789abcdef0'],
    description: 'Updated ordered array of coach UUIDs attached to this train',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true, message: 'Each coach ID must be a valid UUID' })
  coach_ids?: string[];
}
