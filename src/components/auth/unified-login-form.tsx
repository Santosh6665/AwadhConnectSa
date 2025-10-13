'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, LogIn, Info, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function UnifiedLoginForm() {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithRoleDetection } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginWithRoleDetection(credential, password, rememberMe);
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please check your details and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="credential">User ID</Label>
          <Input
            id="credential"
            type="text"
            placeholder="Enter Your User ID"
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
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:text-blue-500"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">
                {showPassword ? 'Hide password' : 'Show password'}
              </span>
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={() => setRememberMe(!rememberMe)} />
          <Label htmlFor="remember-me">Remember me</Label>
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
      <div className="mt-4 text-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link">
              <Info className="mr-2 h-4 w-4" />
              Read Login Instructions
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                🏫 Login Instructions
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h3 className="font-bold text-foreground">👩‍🎓 Students:</h3>
                <p><strong>ID:</strong> User + Admission No. (e.g., User AMD-78455)</p>
                <p><strong>Password:</strong> FirstName@YYYY (e.g., Rahul@2008)</p>
              </div>
              <div>
                <h3 className="font-bold text-foreground">👨‍👩‍👧 Parents:</h3>
                <p><strong>ID:</strong> Registered Mobile No.</p>
                <p><strong>Password:</strong> ParentName@First4Digits (e.g., Suman@9876)</p>
              </div>
              <div>
                <h3 className="font-bold text-foreground">👨‍🏫 Teachers:</h3>
                <p><strong>ID:</strong> Teacher ID (e.g., T4451)</p>
                <p><strong>Password:</strong> FirstName#YYYY (e.g., Amit#1990)</p>
              </div>
              <div>
                <h3 className="font-bold text-foreground">🔒 Note:</h3>
                <p>First letter of name must be capital.</p>
                <p>Passwords are case-sensitive.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
