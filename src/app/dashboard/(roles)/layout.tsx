'use client'

import { usePathname } from 'next/navigation';
import { Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { UserRole } from '@/lib/types';
import SidebarNav from '@/components/dashboard/sidebar-nav';
import DashboardHeader from '@/components/dashboard/dashboard-header';

export default function RolesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const role = segments.find(seg => ['admin', 'teacher', 'parent', 'student'].includes(seg)) as UserRole | undefined;
  
  if (!role) {
    // Fallback for pages not under a specific role
    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    );
  }
  
  return (
    <>
      <Sidebar>
        <SidebarNav role={role} />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader role={role} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
      <SidebarRail />
    </>
  );
}
