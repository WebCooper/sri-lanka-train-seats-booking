import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import {
  Roles as BetterAuthRoles,
  AllowAnonymous,
  OptionalAuth,
  Session,
} from '@thallesp/nestjs-better-auth';
import type { UserRole } from '../types';

export const ROLES_KEY = 'roles';

/**
 * Specifies user roles allowed to access a controller or route handler.
 * Compatible with both `@thallesp/nestjs-better-auth`'s AuthGuard and custom `RolesGuard`.
 * 
 * @example
 * ```ts
 * @Roles('admin')
 * @Roles('admin', 'passenger')
 * ```
 */
export const Roles = (...roles: UserRole[]) => BetterAuthRoles(roles);

/**
 * Restricts access to Admin users only (`user.role === 'admin'`).
 * 
 * @example
 * ```ts
 * @Get('admin/dashboard')
 * @AdminOnly()
 * getDashboard() {}
 * ```
 */
export const AdminOnly = () => Roles('admin');

/**
 * Restricts access to Passengers only (`user.role === 'passenger'`).
 * 
 * @example
 * ```ts
 * @Get('passenger/bookings')
 * @PassengerOnly()
 * getBookings() {}
 * ```
 */
export const PassengerOnly = () => Roles('passenger');

/**
 * Custom parameter decorator to inject the authenticated `user` object (or a specific field).
 * 
 * @example
 * ```ts
 * @Get('me')
 * getProfile(@CurrentUser() user: AuthUser) {}
 * 
 * @Get('id')
 * getUserId(@CurrentUser('id') userId: string) {}
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user ?? request.session?.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);

/**
 * Custom parameter decorator to inject the active `session` object.
 * 
 * @example
 * ```ts
 * @Get('session-info')
 * getSessionInfo(@CurrentSession() session: UserSession) {}
 * ```
 */
export const CurrentSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.session ?? null;
  },
);

// Re-export common authentication decorators from @thallesp/nestjs-better-auth
export { AllowAnonymous, OptionalAuth, Session };
