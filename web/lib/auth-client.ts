import { createAuthClient } from 'better-auth/react';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const authClient = createAuthClient({
  baseURL,
});

export const { useSession, signIn, signUp, signOut } = authClient;
