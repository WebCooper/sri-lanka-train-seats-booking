import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { QueryAdminDto } from './dto/query-admin.dto';
import { AdminOnly, CurrentUser, RolesGuard } from '../auth';

@ApiTags('Admin - Management')
@ApiBearerAuth('bearer')
@ApiCookieAuth('better-auth.session_token')
@Controller('admin')
@AdminOnly()
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /api/v1/admin/admins
   * List all system administrators
   */
  @Get('admins')
  @ApiOperation({ summary: 'List all system administrators', description: 'Returns a paginated list of admin users.' })
  @ApiResponse({ status: 200, description: 'Paginated list of administrators.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing session.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions.' })
  async findAll(@Query() query: QueryAdminDto) {
    return this.adminService.findAll(query);
  }

  /**
   * POST /api/v1/admin/admins
   * Create a new system administrator
   */
  @Post('admins')
  @ApiOperation({ summary: 'Create a new administrator', description: 'Creates a user with admin role and credentials.' })
  @ApiResponse({ status: 201, description: 'Admin user created successfully.' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already in use.' })
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  /**
   * GET /api/v1/admin/admins/:id
   * Retrieve a specific admin's details
   */
  @Get('admins/:id')
  @ApiOperation({ summary: 'Retrieve admin details by ID' })
  @ApiResponse({ status: 200, description: 'Admin details returned successfully.' })
  @ApiResponse({ status: 404, description: 'Not Found - Admin user not found.' })
  async findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  /**
   * PUT /api/v1/admin/admins/:id
   * Update admin credentials or active status
   */
  @Put('admins/:id')
  @ApiOperation({ summary: 'Update admin credentials or active status' })
  @ApiResponse({ status: 200, description: 'Admin user updated successfully.' })
  @ApiResponse({ status: 404, description: 'Not Found - Admin user not found.' })
  async updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
  ) {
    return this.adminService.updateAdmin(id, dto);
  }

  /**
   * DELETE /api/v1/admin/admins/:id
   * Remove or deactivate an administrator
   */
  @Delete('admins/:id')
  @ApiOperation({ summary: 'Delete an administrator' })
  @ApiResponse({ status: 200, description: 'Admin user deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Cannot delete self.' })
  @ApiResponse({ status: 404, description: 'Not Found - Admin user not found.' })
  async removeAdmin(
    @Param('id') id: string,
    @CurrentUser('id') currentAdminId: string,
  ) {
    return this.adminService.removeAdmin(id, currentAdminId);
  }
}
