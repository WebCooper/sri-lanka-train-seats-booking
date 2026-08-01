import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as BetterAuthGuard } from '@thallesp/nestjs-better-auth';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserRole } from '../types';

/**
 * Custom NestJS Guard for explicit Role-Based Access Control (RBAC).
 * Evaluates roles set via `@Roles()`, `@AdminOnly()`, or `@PassengerOnly()`.
 * 
 * Can be used explicitly with `@UseGuards(AuthGuard, RolesGuard)` or registered globally.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are specified on the route or controller, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user ?? request.session?.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const userRole: string = user.role || 'passenger';

    const hasRole = requiredRoles.includes(userRole as UserRole);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Requires one of the following roles: [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}

// Re-export standard AuthGuard from nestjs-better-auth for convenience
export { BetterAuthGuard as AuthGuard };
