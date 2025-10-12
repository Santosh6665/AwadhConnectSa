'use client';

import { AuthProvider } from "@/contexts/auth-context";
import UnifiedLoginForm from "@/components/auth/unified-login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function UnifiedLoginPage() {
  return (
    <AuthProvider>
      <main className="relative flex min-h-screen items-center justify-center p-4 bg-background">
        <Button asChild variant="outline" className="absolute top-4 left-4">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <Image src="/logo.png" alt="School Logo" width={40} height={40} className="h-10 w-10" />
            </div>
            <CardTitle className="font-headline text-3xl">Awadh Inter College</CardTitle>
            <CardDescription>Please sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <UnifiedLoginForm />
          </CardContent>
        </Card>
      </main>
    </AuthProvider>
  );
}
