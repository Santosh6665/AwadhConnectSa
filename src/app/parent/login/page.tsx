
import LoginForm from '@/components/auth/login-form';
import { GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthProvider } from '@/contexts/auth-context';

export default function ParentLoginPage() {
  return (
    <AuthProvider>
      <main className="flex min-h-screen items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">AwadhConnect Parent Portal</CardTitle>
            <CardDescription>Please sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm role="parent" />
          </CardContent>
        </Card>
      </main>
    </AuthProvider>
  );
}
