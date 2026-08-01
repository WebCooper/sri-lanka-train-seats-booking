import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

    const data = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'admin',
      is_active: !u.banned,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

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
   * Password hashing (scrypt), account creation, and role assignment are handled by Better Auth internally
   */
  async createAdmin(dto: CreateAdminDto) {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const createdUser = await auth.api.createUser({
      body: {
        email: dto.email.toLowerCase(),
        password: dto.password,
        name: dto.name,
        role: 'admin',
      },
    });

    return {
      id: createdUser.user.id,
      name: createdUser.user.name,
      email: createdUser.user.email,
      role: createdUser.user.role || 'admin',
      is_active: true,
      createdAt: createdUser.user.createdAt,
      updatedAt: createdUser.user.updatedAt,
    };
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

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'admin',
      is_active: !user.banned,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update an administrator's details, credentials, or status via Better Auth API
   */
  async updateAdmin(id: string, dto: UpdateAdminDto) {
    const existingAdmin = await this.findOne(id);

    if (dto.email && dto.email.toLowerCase() !== existingAdmin.email.toLowerCase()) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (emailTaken) {
        throw new ConflictException('Email is already taken by another user');
      }
    }

    // Update password via Better Auth API if provided
    if (dto.password) {
      await auth.api.setUserPassword({
        body: {
          userId: id,
          newPassword: dto.password,
        },
      });
    }

    // Manage active/banned status via Better Auth admin API
    if (dto.is_active !== undefined) {
      if (dto.is_active === false) {
        await auth.api.banUser({
          body: {
            userId: id,
            banReason: 'Deactivated by administrator',
          },
        });
      } else {
        await auth.api.unbanUser({
          body: {
            userId: id,
          },
        });
      }
    }

    // Update name or email if provided
    if (dto.name || dto.email) {
      await prisma.user.update({
        where: { id },
        data: {
          ...(dto.name ? { name: dto.name } : {}),
          ...(dto.email ? { email: dto.email.toLowerCase() } : {}),
        },
      });

      if (dto.email) {
        await prisma.account.updateMany({
          where: { userId: id, providerId: 'credential' },
          data: { accountId: dto.email.toLowerCase() },
        });
      }
    }

    return this.findOne(id);
  }

  /**
   * Remove an administrator account using Better Auth removeUser API
   */
  async removeAdmin(id: string, currentAdminId?: string) {
    if (currentAdminId && id === currentAdminId) {
      throw new BadRequestException('You cannot delete your own admin account');
    }

    await this.findOne(id);

    await auth.api.removeUser({
      body: {
        userId: id,
      },
    });

    return {
      message: 'Admin deleted successfully',
      id,
    };
  }
}
