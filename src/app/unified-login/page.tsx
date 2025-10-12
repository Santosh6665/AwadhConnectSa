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
      <main className="relative flex min-h-screen items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]"></div></div>
        <Button asChild variant="outline" className="absolute top-4 left-4">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Card className="w-full max-w-md shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-fit mb-4">
              <Image src="/logo.png" alt="School Logo" width={80} height={80} className="h-20 w-20" />
            </div>
            <CardTitle className="font-headline text-2xl sm:text-3xl">Awadh Inter College</CardTitle>
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
