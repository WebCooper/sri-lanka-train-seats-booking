import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Jane Admin', description: 'Full display name of the administrator' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

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

  @ApiProperty({ example: 'jane.admin@railway.lk', description: 'Unique email address for admin' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiPropertyOptional({ example: '199012345678', description: 'Unique National Identity Card (NIC) number' })
  @IsOptional()
  @IsString()
  nicNumber?: string;

  @ApiPropertyOptional({ example: '+94771234567', description: 'Mobile contact number' })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({ example: 'Station Master', description: 'Admin job position or role title' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Password (min 6 characters)', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
