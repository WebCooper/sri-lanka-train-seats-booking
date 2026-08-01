import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '../../lib/prisma';

const trustedOrigins = (
  process.env.BETTER_AUTH_TRUSTED_ORIGINS ??
  'http://localhost:3000,http://localhost:5173'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: { 
    enabled: true, 
  }, 
});
