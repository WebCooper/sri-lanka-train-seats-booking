import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCoachDto {
  @ApiPropertyOptional({ example: 'CH-A1-EX', description: 'Updated coach identifier' })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiPropertyOptional({ example: 60, description: 'Updated seat count' })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Seat count must be at least 1' })
  seat_count?: number;

  @ApiPropertyOptional({ example: true, description: 'Updated reservation status' })
  @IsOptional()
  @IsBoolean()
  is_reserved?: boolean;
}
