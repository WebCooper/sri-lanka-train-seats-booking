import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth Client Instance for React Admin Application
 * Configured with backend base URL from environment variables.
 */
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

export const { useSession, signIn, signOut, signUp } = authClient;
