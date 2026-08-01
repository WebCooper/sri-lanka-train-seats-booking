import type { auth } from './auth';
import type { UserSession as BetterAuthUserSession } from '@thallesp/nestjs-better-auth';

export type UserRole = 'admin' | 'passenger' | (string & {});

export type AppAuth = typeof auth;
export type UserSession = BetterAuthUserSession<AppAuth>;
export type AuthUser = UserSession['user'];
