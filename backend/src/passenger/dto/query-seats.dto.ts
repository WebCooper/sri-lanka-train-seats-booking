import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class QuerySeatsDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'Origin station UUID',
  })
  @IsUUID('all', { message: 'origin_id must be a valid UUID' })
  @IsNotEmpty({ message: 'origin_id is required' })
  origin_id: string;

  @ApiProperty({
    example: 'f1e2d3c4-b5a6-7890-1234-56789abcdef0',
    description: 'Destination station UUID',
  })
  @IsUUID('all', { message: 'destination_id must be a valid UUID' })
  @IsNotEmpty({ message: 'destination_id is required' })
  destination_id: string;
}
