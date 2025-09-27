'use client';

import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SidebarNav from '@/components/dashboard/sidebar-nav';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/lib/types";
import { getTeacherById } from "@/lib/firebase/firestore";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mustChangePassword, setMustChangePassword] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/teacher/login');
    } else if (!loading && user) {
      const checkPasswordStatus = async () => {
        // Firebase user objects don't have custom fields. We need to fetch from our DB.
        // We'll assume the email is unique and can be used to find the teacher doc.
        const teacher = await getTeacherById(user.email!);
        if (teacher?.mustChangePassword) {
          setMustChangePassword(true);
          router.push('/teacher/change-password');
        } else {
          setMustChangePassword(false);
        }
      };
      checkPasswordStatus();
    }
  }, [user, loading, router]);
  
  if (loading || user === null || mustChangePassword === null) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (mustChangePassword) {
    // This state should be brief as the redirect is triggered in useEffect
    return null; 
  }

  const role: UserRole = 'teacher';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav role={role} />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader role={role} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}
