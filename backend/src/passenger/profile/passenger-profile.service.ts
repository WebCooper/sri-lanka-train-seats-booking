import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { prisma } from '../../../lib/prisma';
import { auth } from '../../auth/auth';
import { UpdatePassengerProfileDto } from './dto/update-passenger-profile.dto';

@Injectable()
export class PassengerProfileService {
  async getProfile(userId?: string) {
    if (!userId) {
      throw new UnauthorizedException('Sign in to view your profile.');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Passenger profile not found.');
    }

    return this.formatProfileResponse(user);
  }

  async updateProfile(
    userId: string | undefined,
    dto: UpdatePassengerProfileDto,
    request: Request,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Sign in to update your profile.');
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('Passenger profile not found.');
    }

    if (dto.new_password && !dto.current_password) {
      throw new BadRequestException('Current password is required to set a new password.');
    }

    const normalizedNic = dto.nic_number?.trim().toUpperCase();
    if (normalizedNic && normalizedNic !== existingUser.nicNumber) {
      const nicTaken = await prisma.user.findUnique({
        where: { nicNumber: normalizedNic },
      });
      if (nicTaken) {
        throw new ConflictException(`NIC number "${normalizedNic}" is already registered`);
      }
    }

    const authHeaders = this.getAuthHeaders(request);
    const updateBody: Record<string, string | null> = {};

    if (dto.name !== undefined) {
      updateBody.name = dto.name.trim();
    }
    if (dto.nic_number !== undefined) {
      updateBody.nicNumber = normalizedNic || null;
    }
    if (dto.mobile_number !== undefined) {
      updateBody.mobileNumber = dto.mobile_number.trim() || null;
    }

    if (Object.keys(updateBody).length > 0) {
      try {
        await auth.api.updateUser({
          body: updateBody,
          headers: authHeaders,
        });
      } catch (error) {
        throw this.toHttpException(error, 'Could not update profile.');
      }
    }

    if (dto.new_password) {
      try {
        await auth.api.changePassword({
          body: {
            currentPassword: dto.current_password!,
            newPassword: dto.new_password,
            revokeOtherSessions: false,
          },
          headers: authHeaders,
        });
      } catch (error) {
        throw this.toHttpException(error, 'Could not change password.');
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!updatedUser) {
      throw new NotFoundException('Passenger profile not found.');
    }

    return this.formatProfileResponse(updatedUser);
  }

  private getAuthHeaders(request: Request): HeadersInit {
    const headers = new Headers();

    const authorization = request.headers.authorization;
    if (typeof authorization === 'string') {
      headers.set('authorization', authorization);
    }

    const cookie = request.headers.cookie;
    if (typeof cookie === 'string') {
      headers.set('cookie', cookie);
    }

    return headers;
  }

  private toHttpException(error: unknown, fallbackMessage: string): Error {
    if (error && typeof error === 'object') {
      const message =
        'message' in error && typeof error.message === 'string'
          ? error.message
          : 'body' in error &&
              error.body &&
              typeof error.body === 'object' &&
              'message' in error.body &&
              typeof error.body.message === 'string'
            ? error.body.message
            : null;

      if (message) {
        if (/incorrect|invalid|wrong/i.test(message)) {
          return new BadRequestException(message);
        }
        return new BadRequestException(message);
      }
    }

    return new BadRequestException(fallbackMessage);
  }

  private formatProfileResponse(user: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    nicNumber: string | null;
    mobileNumber: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ?? 'passenger',
      nic_number: user.nicNumber ?? null,
      mobile_number: user.mobileNumber ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
