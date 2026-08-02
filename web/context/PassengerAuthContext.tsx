'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient, useSession } from '../lib/auth-client';
import { getApiErrorMessage } from '../lib/axiosInstance';
import toast from 'react-hot-toast';

export interface PassengerUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  nic_number?: string;
  mobile_number?: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  title?: string;
  first_name?: string;
  last_name?: string;
  nic_number?: string;
  mobile_number?: string;
}

interface PassengerAuthContextType {
  user: PassengerUser | null;
  isPending: boolean;
  login: (credentials: SignInPayload) => Promise<{ success: boolean; error?: string }>;
  register: (payload: SignUpPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const PassengerAuthContext = createContext<PassengerAuthContextType | undefined>(undefined);

export const PassengerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, isPending: sessionPending } = useSession();
  const [user, setUser] = useState<PassengerUser | null>(null);

  useEffect(() => {
    if (!sessionPending) {
      if (session?.user) {
        const currentUser = session.user as PassengerUser;
        const token = session.session?.token;
        if (token) {
          localStorage.setItem('passenger_token', token);
        }
        setUser(currentUser);
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

      const loggedInUser = data?.user as PassengerUser | undefined;
      const sessionToken = data?.token || (data as any)?.session?.token;

      if (sessionToken) {
        localStorage.setItem('passenger_token', sessionToken);
      }

      setUser(loggedInUser || null);
      toast.success('Signed in successfully!');
      return { success: true };
    } catch (err: unknown) {
      const errMsg = getApiErrorMessage(err, 'An unexpected error occurred during sign-in.');
      toast.error(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const register = async (payload: SignUpPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await authClient.signUp.email({
        email: payload.email.trim(),
        password: payload.password.trim(),
        name: payload.name.trim(),
        title: payload.title,
        firstName: payload.first_name?.trim(),
        lastName: payload.last_name?.trim(),
        nicNumber: payload.nic_number?.trim().toUpperCase() || undefined,
        mobileNumber: payload.mobile_number?.trim() || undefined,
      } as Parameters<typeof authClient.signUp.email>[0]);

      if (error) {
        const errorMsg = error.message || 'Failed to create account.';
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      const sessionToken = data?.token || (data as any)?.session?.token;
      if (sessionToken) {
        localStorage.setItem('passenger_token', sessionToken);
      }

      if (data?.user) {
        setUser(data.user as PassengerUser);
      }

      toast.success('Account created successfully! Welcome to Sri Lanka Railways.');
      return { success: true };
    } catch (err: unknown) {
      const errMsg = getApiErrorMessage(err, 'Failed to create passenger account.');
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
      localStorage.removeItem('passenger_token');
    }
  };

  return (
    <PassengerAuthContext.Provider
      value={{
        user,
        isPending: sessionPending,
        login,
        register,
        logout,
      }}
    >
      {children}
    </PassengerAuthContext.Provider>
  );
};

export const usePassengerAuth = (): PassengerAuthContextType => {
  const context = useContext(PassengerAuthContext);
  if (!context) {
    throw new Error('usePassengerAuth must be used within a PassengerAuthProvider');
  }
  return context;
};
