import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCoachDto {
  @ApiProperty({ example: 'CH-A1', description: 'Unique coach identifier or carriage code' })
  @IsString()
  @IsNotEmpty({ message: 'Coach identifier is required' })
  identifier: string;

  @ApiProperty({ example: 54, description: 'Total number of seats in this coach', minimum: 1 })
  @IsInt()
  @Min(1, { message: 'Seat count must be at least 1' })
  seat_count: number;

  @ApiPropertyOptional({ example: false, default: false, description: 'Whether this coach is reserved/class-restricted' })
  @IsOptional()
  @IsBoolean()
  is_reserved?: boolean = false;
}
