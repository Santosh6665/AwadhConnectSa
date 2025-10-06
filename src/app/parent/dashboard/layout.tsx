'use client';

import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SidebarNav from '@/components/dashboard/sidebar-nav';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function ParentDashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'parent')) {
      router.push('/parent/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav role="parent" />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader role="parent" />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function ParentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ParentDashboardContent>{children}</ParentDashboardContent>
    </AuthProvider>
  );
}
