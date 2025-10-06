
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
  login: (credential: string, pass: string, role: 'admin' | 'teacher' | 'student' | 'parent') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
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
          };

          // Check if user data has actually changed to avoid unnecessary updates
          if (JSON.stringify(user) !== JSON.stringify(updatedUser)) {
            setUser(updatedUser);
            sessionStorage.setItem('app-user', JSON.stringify(updatedUser));
          }
        }
      });

      // Cleanup listener on unmount
      return () => unsub();
    }
  }, [user]);


  const login = async (credential: string, pass: string, role: 'admin' | 'teacher' | 'student' | 'parent') => {
    setLoading(true);
    try {
      let appUser: AppUser | null = null;
      if (role === 'admin') {
        const admin = await getAdminByEmail(credential);
        if (!admin) throw new Error('Admin not found');

        const passwordHash = sha256(pass);
        if (admin.password !== passwordHash) throw new Error('Invalid password');

        appUser = { email: credential, role: 'admin' };
        router.push('/dashboard');
      } else if (role === 'teacher') {
        const teacher = await getTeacherById(credential);
        if (!teacher) throw new Error('Teacher not found');
        if (teacher.password !== pass) throw new Error('Invalid password');
        
        appUser = { 
          id: credential, 
          name: teacher.name, 
          role: 'teacher', 
          canMarkAttendance: teacher.canMarkAttendance, 
          canEditResults: teacher.canEditResults 
        };
        router.push('/teacher/dashboard');
      } else if (role === 'student') {
        const student = await getStudentByAdmissionNumber(credential);
        if (!student) throw new Error('Student not found');
        if (student.password !== pass) throw new Error('Invalid password');
        
        appUser = { id: credential, name: `${student.firstName} ${student.lastName}`, role: 'student' };
        router.push('/student/dashboard');
      } else if (role === 'parent') {
        const parent = await getParentByMobile(credential);
        if (!parent) throw new Error('Parent not found');
        if (parent.password !== pass) throw new Error('Invalid password');
        
        appUser = { id: credential, name: parent.name, role: 'parent' };
        router.push('/parent/dashboard');
      }

      if (appUser) {
        sessionStorage.setItem('app-user', JSON.stringify(appUser));
        setUser(appUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    const role = user?.role;
    setUser(null);
    sessionStorage.removeItem('app-user');
    if (role === 'admin') router.push('/login');
    else if (role === 'teacher') router.push('/teacher/login');
    else if (role === 'student') router.push('/student/login');
    else if (role === 'parent') router.push('/parent/login');
    else router.push('/');
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
