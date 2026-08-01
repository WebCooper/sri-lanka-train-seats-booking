import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateAdminDto {
  @ApiPropertyOptional({ example: 'Jane Senior Admin', description: 'Updated display name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Mrs', description: 'Title (Mr, Mrs, Miss, Dr, etc.)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Jane', description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Perera', description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'jane.senior@railway.lk', description: 'Updated email' })
  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email address' })
  email?: string;

  @ApiPropertyOptional({ example: '199012345678', description: 'Unique National Identity Card (NIC) number' })
  @IsOptional()
  @IsString()
  nicNumber?: string;

  @ApiPropertyOptional({ example: '+94771234567', description: 'Mobile contact number' })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({ example: 'Operations Manager', description: 'Admin job position or role title' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ example: 'NewPassword123!', description: 'Updated password' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @ApiPropertyOptional({ example: true, description: 'Toggle active status (false bans/deactivates admin)' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
