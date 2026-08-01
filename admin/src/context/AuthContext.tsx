import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient, useSession } from '../lib/auth-client';
import type { UserProfile, SignInPayload } from '../api/auth';
import { getApiErrorMessage } from '../api/axiosInstance';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: UserProfile | null;
  isPending: boolean;
  isAdmin: boolean;
  login: (credentials: SignInPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, isPending: sessionPending } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);

  // Helper to check if role is ADMIN (case-insensitive)
  const isRoleAdmin = (role?: string | null): boolean => {
    if (!role) return false;
    const cleanRole = role.trim().toLowerCase();
    return cleanRole === 'admin' || cleanRole === 'administrator';
  };

  useEffect(() => {
    if (!sessionPending) {
      if (session?.user) {
        const currentUser = session.user as UserProfile;
        const token = session.session?.token;
        if (token) {
          localStorage.setItem('admin_token', token);
        }

        if (isRoleAdmin(currentUser.role)) {
          setUser(currentUser);
        } else {
          // If a non-admin session is active, revoke & sign out
          setUser(null);
          localStorage.removeItem('admin_token');
          authClient.signOut();
          toast.error('Unauthorized access. Only admin accounts are permitted.');
        }
      } else {
        setUser(null);
      }
    }
  }, [session, sessionPending]);

  const login = async (credentials: SignInPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await authClient.signIn.email({
        email: credentials.email.trim(),
        password: credentials.password.trim(),
      });

      if (error) {
        const errorMsg = error.message || 'Invalid email or password.';
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const loggedInUser = data?.user as UserProfile | undefined;
      const sessionToken = data?.token || (data as any)?.session?.token;

      if (sessionToken) {
        localStorage.setItem('admin_token', sessionToken);
      }

      if (!loggedInUser || !isRoleAdmin(loggedInUser.role)) {
        await authClient.signOut();
        setUser(null);
        localStorage.removeItem('admin_token');
        const unauthMsg = 'Unauthorized access. Only admin accounts are permitted.';
        toast.error(unauthMsg);
        return { success: false, error: unauthMsg };
      }

      setUser(loggedInUser);
      toast.success('Successfully authenticated as Admin!');
      return { success: true };
    } catch (err: unknown) {
      const errMsg = getApiErrorMessage(err, 'An unexpected error occurred during login.');
      toast.error(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      toast.success('Signed out successfully.');
    } catch {
      // Ignore
    } finally {
      setUser(null);
      localStorage.removeItem('admin_token');
    }
  };

  const isAdmin = isRoleAdmin(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        isPending: sessionPending,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
