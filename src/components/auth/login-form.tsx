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
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === 'admin') {
        await login(credential, password);
        router.push('/dashboard');
      } else if (role === 'teacher') {
        const teacherId = credential;
        const teacher = await getTeacherById(teacherId);

        if (!teacher) {
          throw new Error('Invalid Teacher ID');
        }
        
        // When dob is serialized from server, it becomes a string
        const dob = new Date(teacher.dob);
        const firstName = teacher.name.split(' ')[0];
        const defaultPassword = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)}@${dob.getFullYear()}`;
        
        let isPasswordCorrect = password === defaultPassword;

        // If it's not the default password, it means user has changed it. Try firebase auth.
        if(!isPasswordCorrect) {
          try {
            await login(teacher.email, password);
            isPasswordCorrect = true;
          } catch (e) {
            // It is okay for this to fail.
          }
        }

        if (isPasswordCorrect) {
          // We need to sign in the user to set the session
          await login(teacher.email, password);
          if (teacher.mustChangePassword) {
            router.push('/teacher/change-password');
          } else {
            router.push('/teacher/dashboard');
          }
        } else {
          throw new Error('Invalid password');
        }
      }
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.message.includes('Invalid')) {
          errorMessage = 'Invalid credentials. Please check your details and try again.';
      }
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="credential">{role === 'teacher' ? 'Teacher ID' : 'Email'}</Label>
        <Input
          id="credential"
          type={role === 'teacher' ? 'text' : 'email'}
          placeholder={role === 'teacher' ? 'e.g., T01' : 'admin@example.com'}
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
