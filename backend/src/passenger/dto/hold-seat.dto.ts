import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class HoldSeatDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'Schedule session UUID',
  })
  @IsUUID('all', { message: 'schedule_id must be a valid UUID' })
  @IsNotEmpty({ message: 'schedule_id is required' })
  schedule_id: string;

  @ApiProperty({
    example: 'c1d2e3f4-a5b6-7890-1234-56789abcdef0',
    description: 'Coach UUID',
  })
  @IsUUID('all', { message: 'coach_id must be a valid UUID' })
  @IsNotEmpty({ message: 'coach_id is required' })
  coach_id: string;

  @ApiProperty({ example: 12, description: 'Seat number to lock', minimum: 1 })
  @IsInt()
  @Min(1, { message: 'seat_number must be at least 1' })
  @IsNotEmpty({ message: 'seat_number is required' })
  seat_number: number;

  @ApiProperty({
    example: 'b1c2d3e4-f5a6-7890-1234-56789abcdef1',
    description: 'Origin station UUID',
  })
  @IsUUID('all', { message: 'origin_id must be a valid UUID' })
  @IsNotEmpty({ message: 'origin_id is required' })
  origin_id: string;

  @ApiProperty({
    example: 'e1f2a3b4-c5d6-7890-1234-56789abcdef2',
    description: 'Destination station UUID',
  })
  @IsUUID('all', { message: 'destination_id must be a valid UUID' })
  @IsNotEmpty({ message: 'destination_id is required' })
  destination_id: string;
}
