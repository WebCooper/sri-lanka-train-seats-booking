import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '../../lib/prisma';
import { admin } from "better-auth/plugins";
import { bearer } from 'better-auth/plugins/bearer';

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
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "passenger",
        input: false,
      },
      title: {
        type: "string",
        required: false,
      },
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
      nicNumber: {
        type: "string",
        required: false,
      },
      mobileNumber: {
        type: "string",
        required: false,
      },
      position: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "passenger",
      adminRole: "admin",
      impersonation: true, // allows admins to impersonate passengers for support (optional)
    }),
    bearer(),
  ],
});
