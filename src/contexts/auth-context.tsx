
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AppUser, Teacher } from '@/lib/types';
import { getAdminByEmail, getTeacherById } from '@/lib/firebase/firestore';
import { sha256 } from 'js-sha256';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (credential: string, pass: string, role: 'admin' | 'teacher') => Promise<void>;
  logout: (role: 'admin' | 'teacher') => void;
  teacherDetails?: Teacher | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [teacherDetails, setTeacherDetails] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('app-user');
      if (storedUser) {
        const parsedUser: AppUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if(parsedUser.role === 'teacher' && parsedUser.id) {
          getTeacherById(parsedUser.id).then(setTeacherDetails);
        }
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      sessionStorage.removeItem('app-user');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (credential: string, pass: string, role: 'admin' | 'teacher') => {
    setLoading(true);
    if (role === 'admin') {
      try {
        const admin = await getAdminByEmail(credential);
        if (!admin) {
          throw new Error('Admin not found');
        }

        const passwordHash = sha256(pass);
        if (admin.password !== passwordHash) {
          throw new Error('Invalid password');
        }

        const appUser: AppUser = {
          email: credential,
          role: 'admin',
        };
        sessionStorage.setItem('app-user', JSON.stringify(appUser));
        setUser(appUser);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    } else if (role === 'teacher') {
        try {
            const teacher = await getTeacherById(credential);
            if (!teacher) {
                throw new Error('Teacher not found');
            }

            if (teacher.password !== pass) {
                throw new Error('Invalid password');
            }
            
            const appUser: AppUser = {
                id: teacher.id,
                role: 'teacher',
            };
            sessionStorage.setItem('app-user', JSON.stringify(appUser));
            setUser(appUser);
            setTeacherDetails(teacher);
            router.push('/teacher/dashboard');

        } finally {
            setLoading(false);
        }
    }
  };

  const logout = (role: 'admin' | 'teacher') => {
    setUser(null);
    setTeacherDetails(null);
    sessionStorage.removeItem('app-user');
    if (role === 'admin') {
        router.push('/login');
    } else {
        router.push('/teacher/login');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    teacherDetails
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
