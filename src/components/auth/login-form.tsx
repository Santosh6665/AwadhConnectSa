'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/lib/types';
import { getTeacherById } from '@/lib/firebase/firestore';

export default function LoginForm({ role }: { role: UserRole }) {
  const [credential, setCredential] = useState(''); // Can be email or teacher ID
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const phone = teacher.phone || '';
      
      if (phone.length < 2) {
          throw new Error('Invalid phone number for password generation.');
      }

      const firstTwoDigitsOfPhone = phone.substring(0, 2);
      const defaultPassword = `${firstName.charAt(0).toUpperCase()}${firstName.slice(1).toLowerCase()}@${firstTwoDigitsOfPhone}`;

      if (password !== defaultPassword) {
        throw new Error('Invalid credentials.');
      }
      
      // For now, we are just verifying the credentials and not logging in via Firebase Auth for teachers.
      // This is because we don't have a user record in Firebase Auth for each teacher with the default password.
      // We are just routing to the dashboard which is protected by a general auth guard.
      // A more robust solution would involve a custom auth system or creating teacher users in Firebase Auth.
      
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
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
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
