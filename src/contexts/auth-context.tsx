'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AppUser } from '@/lib/types';
import { getAdminByEmail } from '@/lib/firebase/firestore';
import { sha256 } from 'js-sha256';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('app-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      sessionStorage.removeItem('app-user');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const admin = await getAdminByEmail(email);
      if (!admin) {
        throw new Error('Admin not found');
      }

      const passwordHash = sha256(pass);
      if (admin.password !== passwordHash) {
        throw new Error('Invalid password');
      }

      const appUser: AppUser = {
        email: email,
        role: 'admin',
      };
      sessionStorage.setItem('app-user', JSON.stringify(appUser));
      setUser(appUser);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('app-user');
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
