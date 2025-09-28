
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/lib/types';

const roleConfig = {
    admin: { credentialLabel: 'Email', credentialType: 'email', placeholder: 'admin@example.com'},
    teacher: { credentialLabel: 'Teacher ID', credentialType: 'text', placeholder: 'T01'},
    student: { credentialLabel: 'Admission Number', credentialType: 'text', placeholder: 'ADM-123456'},
    parent: { credentialLabel: 'Parent ID', credentialType: 'text', placeholder: 'P01' },
}


export default function LoginForm({ role }: { role: UserRole }) {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(credential, password, role);
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.message.includes('not found') || error.message.includes('Invalid')) {
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
  
  const { credentialLabel, credentialType, placeholder } = roleConfig[role];

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="credential">{credentialLabel}</Label>
        <Input
          id="credential"
          type={credentialType}
          placeholder={placeholder}
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
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
