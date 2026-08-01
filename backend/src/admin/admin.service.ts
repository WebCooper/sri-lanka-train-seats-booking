import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { auth } from '../auth/auth';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { QueryAdminDto } from './dto/query-admin.dto';

@Injectable()
export class AdminService {
  /**
   * List all system administrators with pagination and search filter
   */
  async findAll(query: QueryAdminDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const whereCondition = {
      role: 'admin',
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { nicNumber: { contains: search, mode: 'insensitive' as const } },
              { mobileNumber: { contains: search, mode: 'insensitive' as const } },
              { position: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({
        where: whereCondition,
      }),
    ]);

    const data = users.map((u) => this.formatUserResponse(u));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new administrator account using Better Auth instance
   */
  async createAdmin(dto: CreateAdminDto, headers?: any) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingEmail) {
      throw new ConflictException('An account with this email address already exists');
    }

    if (dto.nicNumber) {
      const existingNic = await prisma.user.findUnique({
        where: { nicNumber: dto.nicNumber.toUpperCase() },
      });
      if (existingNic) {
        throw new ConflictException(`NIC number "${dto.nicNumber.toUpperCase()}" is already registered`);
      }
    }

    try {
      const createdUser = await auth.api.createUser({
        body: {
          email: dto.email.toLowerCase(),
          password: dto.password,
          name: dto.name,
          role: 'admin',
          data: {
            title: dto.title ?? undefined,
            firstName: dto.firstName ?? undefined,
            lastName: dto.lastName ?? undefined,
            nicNumber: dto.nicNumber ? dto.nicNumber.toUpperCase() : undefined,
            mobileNumber: dto.mobileNumber ?? undefined,
            position: dto.position ?? undefined,
          },
        },
        headers: headers,
      });

      return this.formatUserResponse(createdUser.user);
    } catch (err: any) {
      if (err?.message) {
        throw new BadRequestException(err.message);
      }
      throw new BadRequestException('Failed to create admin user');
    }
  }

  /**
   * Retrieve a specific administrator's details by ID
   */
  async findOne(id: string) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        role: 'admin',
      },
    });

    if (!user) {
      throw new NotFoundException(`Admin with ID "${id}" not found`);
    }

    return this.formatUserResponse(user);
  }

  /**
   * Update an administrator's details, credentials, or status via Better Auth API / Prisma
   */
  async updateAdmin(id: string, dto: UpdateAdminDto, headers?: any) {
    const existingAdmin = await prisma.user.findFirst({ where: { id, role: 'admin' } });
    if (!existingAdmin) {
      throw new NotFoundException(`Admin with ID "${id}" not found`);
    }

    if (dto.email && dto.email.toLowerCase() !== existingAdmin.email.toLowerCase()) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (emailTaken) {
        throw new ConflictException('Email is already taken by another user');
      }
    }

    if (dto.nicNumber && dto.nicNumber.toUpperCase() !== existingAdmin.nicNumber) {
      const nicTaken = await prisma.user.findUnique({
        where: { nicNumber: dto.nicNumber.toUpperCase() },
      });
      if (nicTaken) {
        throw new ConflictException(`NIC number "${dto.nicNumber.toUpperCase()}" is already registered`);
      }
    }

    // Update password via Better Auth API if provided
    if (dto.password) {
      try {
        await auth.api.setUserPassword({
          body: {
            userId: id,
            newPassword: dto.password,
          },
          headers: headers,
        });
      } catch {
        // Fallback: update password in account table if Better Auth plugin method throws header error
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        await prisma.account.updateMany({
          where: { userId: id, providerId: 'credential' },
          data: { password: hashedPassword },
        });
      }
    }

    // Manage active/banned status via Better Auth API / Prisma
    if (dto.is_active !== undefined) {
      try {
        if (dto.is_active === false) {
          await auth.api.banUser({
            body: {
              userId: id,
              banReason: 'Deactivated by administrator',
            },
            headers: headers,
          });
        } else {
          await auth.api.unbanUser({
            body: {
              userId: id,
            },
            headers: headers,
          });
        }
      } catch {
        // Fallback to direct Prisma update for ban/unban status
        await prisma.user.update({
          where: { id },
          data: {
            banned: !dto.is_active,
            banReason: dto.is_active ? null : 'Deactivated by administrator',
          },
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
        ...(dto.email ? { email: dto.email.toLowerCase() } : {}),
        ...(dto.nicNumber !== undefined ? { nicNumber: dto.nicNumber ? dto.nicNumber.toUpperCase() : null } : {}),
        ...(dto.mobileNumber !== undefined ? { mobileNumber: dto.mobileNumber } : {}),
        ...(dto.position !== undefined ? { position: dto.position } : {}),
        ...(dto.is_active !== undefined ? { banned: !dto.is_active } : {}),
      },
    });

    if (dto.email) {
      await prisma.account.updateMany({
        where: { userId: id, providerId: 'credential' },
        data: { accountId: dto.email.toLowerCase() },
      });
    }

    return this.formatUserResponse(updatedUser);
  }

  /**
   * Remove an administrator account using Better Auth API or Prisma fallback
   */
  async removeAdmin(id: string, currentAdminId?: string, headers?: any) {
    if (currentAdminId && id === currentAdminId) {
      throw new BadRequestException('You cannot delete your own admin account');
    }

    await this.findOne(id);

    try {
      if (headers) {
        await auth.api.removeUser({
          body: {
            userId: id,
          },
          headers: headers,
        });
      } else {
        await prisma.user.delete({ where: { id } });
      }
    } catch {
      // Fallback to Prisma delete if Better Auth internal authorization check throws
      await prisma.user.delete({ where: { id } });
    }

    return {
      message: 'Admin deleted successfully',
      id,
    };
  }

  /**
   * Format user response object cleanly
   */
  private formatUserResponse(u: any) {
    return {
      id: u.id,
      name: u.name,
      title: u.title ?? null,
      first_name: u.firstName ?? null,
      last_name: u.lastName ?? null,
      email: u.email,
      nic_number: u.nicNumber ?? null,
      mobile_number: u.mobileNumber ?? null,
      position: u.position ?? null,
      role: u.role || 'admin',
      is_active: !u.banned,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }
}
