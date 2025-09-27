'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/lib/types';
import { getTeacherById } from '@/lib/firebase/firestore';

export default function LoginForm({ role }: { role: UserRole }) {
  const [credential, setCredential] = useState(''); // Can be email or teacher ID
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleAdminLogin = async () => {
    try {
      await login(credential, password);
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      }
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleTeacherLogin = async () => {
    try {
      const teacher = await getTeacherById(credential);
      
      if (!teacher) {
        throw new Error('Teacher not found.');
      }

      const firstName = teacher.name.split(' ')[0];
      const birthYear = new Date(teacher.dob).getFullYear();
      const defaultPassword = `${firstName.charAt(0).toUpperCase()}${firstName.slice(1).toLowerCase()}@${birthYear}`;

      if (password !== defaultPassword) {
        throw new Error('Invalid credentials.');
      }
      
      await login(teacher.email, password);
      router.push('/teacher/dashboard');

    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: 'Invalid Teacher ID or password. Please try again.',
        variant: 'destructive',
      });
    }
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (role === 'admin') {
      await handleAdminLogin();
    } else if (role === 'teacher') {
      await handleTeacherLogin();
    }
    
    setLoading(false);
  };

  const isTeacherLogin = role === 'teacher';

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="credential">{isTeacherLogin ? 'Teacher ID' : 'Email'}</Label>
        <Input
          id="credential"
          type="text"
          placeholder={isTeacherLogin ? 'e.g. T01' : 'admin@example.com'}
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing In...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </>
        )}
      </Button>
    </form>
  );
}
