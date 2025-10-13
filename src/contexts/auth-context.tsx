
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AppUser, Teacher } from '@/lib/types';
import { getAdminByEmail, getTeacherById, getStudentByAdmissionNumber, getParentByMobile } from '@/lib/firebase/firestore';
import { sha256 } from 'js-sha256';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (credential: string, pass: string, role: 'admin' | 'teacher' | 'student' | 'parent', rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  loginWithRoleDetection: (credential: string, pass: string, rememberMe?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('app-user') || sessionStorage.getItem('app-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from storage", error);
      localStorage.removeItem('app-user');
      sessionStorage.removeItem('app-user');
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'teacher' && user.id) {
      const unsub = onSnapshot(doc(db, "teachers", user.id), (doc) => {
        if (doc.exists()) {
          const teacherData = doc.data() as Teacher;
          const updatedUser: AppUser = {
            ...user,
            name: teacherData.name,
            canMarkAttendance: teacherData.canMarkAttendance,
            canEditResults: teacherData.canEditResults,
            classes: teacherData.classes,
          };

          if (JSON.stringify(user) !== JSON.stringify(updatedUser)) {
            setUser(updatedUser);
            const storage = localStorage.getItem('app-user') ? localStorage : sessionStorage;
            storage.setItem('app-user', JSON.stringify(updatedUser));
          }
        }
      });

      return () => unsub();
    }
  }, [user]);


  const login = async (credential: string, pass: string, role: 'admin' | 'teacher' | 'student' | 'parent', rememberMe = false) => {
    setLoading(true);
    try {
      let appUser: AppUser | null = null;
      let dashboardUrl = '/';

      if (role === 'admin') {
        const admin = await getAdminByEmail(credential);
        if (!admin) throw new Error('Admin not found');

        const passwordHash = sha256(pass);
        if (admin.password !== passwordHash) throw new Error('Invalid password');

        appUser = { email: credential, role: 'admin', name: 'Admin' };
        dashboardUrl = '/dashboard';
      } else if (role === 'teacher') {
        const teacher = await getTeacherById(credential);
        if (!teacher) throw new Error('Teacher not found');
        if (teacher.password !== pass) throw new Error('Invalid password');
        
        appUser = { 
          id: credential, 
          name: teacher.name, 
          role: 'teacher', 
          canMarkAttendance: teacher.canMarkAttendance, 
          canEditResults: teacher.canEditResults,
          classes: teacher.classes
        };
        dashboardUrl = '/teacher/dashboard';
      } else if (role === 'student') {
        const student = await getStudentByAdmissionNumber(credential);
        if (!student) throw new Error('Student not found');
        if (student.password !== pass) throw new Error('Invalid password');
        
        appUser = { id: credential, name: `${student.firstName} ${student.lastName}`, role: 'student' };
        dashboardUrl = '/student/dashboard';
      } else if (role === 'parent') {
        const parent = await getParentByMobile(credential);
        if (!parent) throw new Error('Parent not found');
        if (parent.password !== pass) throw new Error('Invalid password');
        
        appUser = { id: credential, name: parent.name, role: 'parent' };
        dashboardUrl = '/parent/dashboard';
      }

      if (appUser) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('app-user', JSON.stringify(appUser));
        setUser(appUser);
        window.location.href = dashboardUrl;
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithRoleDetection = async (credential: string, pass: string, rememberMe = false) => {
    setLoading(true);
    try {
      // Try admin login
      try {
        const admin = await getAdminByEmail(credential);
        if (admin && admin.password === sha256(pass)) {
          await login(credential, pass, 'admin', rememberMe);
          return;
        }
      } catch (error) {}

      // Try teacher login
      try {
        const teacher = await getTeacherById(credential);
        if (teacher && teacher.password === pass) {
          await login(credential, pass, 'teacher', rememberMe);
          return;
        }
      } catch (error) {}

      // Try student login
      try {
        const student = await getStudentByAdmissionNumber(credential);
        if (student && student.password === pass) {
          await login(credential, pass, 'student', rememberMe);
          return;
        }
      } catch (error) {}

      // Try parent login
      try {
        const parent = await getParentByMobile(credential);
        if (parent && parent.password === pass) {
          await login(credential, pass, 'parent', rememberMe);
          return;
        }
      } catch (error) {}

      throw new Error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('app-user');
    sessionStorage.removeItem('app-user');
    window.location.href = '/';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    loginWithRoleDetection,
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
