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
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { QueryAdminDto } from './dto/query-admin.dto';
import { AdminOnly, CurrentUser, RolesGuard } from '../auth';

@Controller('api/v1/admin')
@AdminOnly()
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  /**
   * GET /api/v1/admin/admins
   * List all system administrators
   */
  @Get('admins')
  async findAll(@Query() query: QueryAdminDto) {
    return this.adminService.findAll(query);
  }

  /**
   * POST /api/v1/admin/admins
   * Create a new system administrator
   */
  @Post('admins')
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  /**
   * GET /api/v1/admin/admins/:id
   * Retrieve a specific admin's details
   */
  @Get('admins/:id')
  async findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  /**
   * PUT /api/v1/admin/admins/:id
   * Update admin credentials or active status
   */
  @Put('admins/:id')
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
  async removeAdmin(
    @Param('id') id: string,
    @CurrentUser('id') currentAdminId: string,
  ) {
    return this.adminService.removeAdmin(id, currentAdminId);
  }
}
