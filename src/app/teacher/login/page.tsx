
import LoginForm from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthProvider } from '@/contexts/auth-context';
import Image from 'next/image';

export default function TeacherLoginPage() {
  return (
    <AuthProvider>
      <main className="flex min-h-screen items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <Image src="/logo.png" alt="School Logo" width={40} height={40} className="h-10 w-10" />
            </div>
            <CardTitle className="font-headline text-3xl">Awadh Inter College Teacher Portal</CardTitle>
            <CardDescription>Please sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm role="teacher" />
          </CardContent>
        </Card>
      </main>
    </AuthProvider>
  );
}
