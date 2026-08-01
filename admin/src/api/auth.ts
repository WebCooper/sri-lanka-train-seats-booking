import { authClient } from '../lib/auth-client';

export interface SignInPayload {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Sign in admin user using Better Auth React client.
 * Calls authClient.signIn.email({ email, password })
 */
export const signInWithEmail = async (payload: SignInPayload) => {
  const response = await authClient.signIn.email({
    email: payload.email,
    password: payload.password,
  });
  return response;
};

/**
 * Sign out admin user using Better Auth React client.
 */
export const signOutUser = async () => {
  return await authClient.signOut();
};
