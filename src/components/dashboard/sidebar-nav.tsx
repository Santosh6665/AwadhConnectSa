

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  BookUser,
  Banknote,
  CalendarDays,
  Settings,
  Presentation,
  HelpCircle,
  BookCopy,
  PenSquare,
} from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@/lib/types';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
};

const navItems: NavItem[] = [
  // Admin Links
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { href: '/dashboard/students', label: 'Manage Students', icon: Users, roles: ['admin'] },
  { href: '/dashboard/teachers', label: 'Manage Teachers', icon: BookUser, roles: ['admin'] },
  { href: '/dashboard/fees', label: 'Fee Management', icon: Banknote, roles: ['admin'] },
  { href: '/dashboard/attendance', label: 'Attendance', icon: UserCheck, roles: ['admin'] },
  { href: '/dashboard/events', label: 'Events & Notices', icon: CalendarDays, roles: ['admin'] },
  { href: '/dashboard/reports', label: 'Reports', icon: Presentation, roles: ['admin'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  
  // Teacher Links
  { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['teacher'] },
  { href: '/teacher/students', label: 'My Students', icon: Users, roles: ['teacher'] },
  { href: '/teacher/attendance', label: 'Mark Attendance', icon: UserCheck, roles: ['teacher'] },
  { href: '/teacher/results', label: 'Enter Results', icon: PenSquare, roles: ['teacher'] },
  { href: '/teacher/materials', label: 'Study Materials', icon: BookCopy, roles: ['teacher'] },
  { href: '/teacher/notices', label: 'View Notices', icon: CalendarDays, roles: ['teacher'] },
  
  // Student Links
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student'] },
  { href: '/student/results', label: 'My Results', icon: Presentation, roles: ['student'] },
  { href: '/student/attendance', label: 'My Attendance', icon: UserCheck, roles: ['student'] },
  { href: '/student/fees', label: 'Fee Payment', icon: Banknote, roles: ['student'] },
  { href: '/student/materials', label: 'Study Materials', icon: BookCopy, roles: ['student'] },
  { href: '/student/notices', label: 'Notices & Events', icon: CalendarDays, roles: ['student'] },
];

export default function SidebarNav({ role }: { role: UserRole }) {
  
  const filteredNavItems = navItems.filter(item => item.roles.includes(role));
  const portalName = `${role.charAt(0).toUpperCase() + role.slice(1)} Portal`;

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <GraduationCap className="size-8 text-sidebar-primary" />
            <div className="flex flex-col">
                <h3 className="text-lg font-headline font-semibold text-sidebar-primary">AwadhConnect</h3>
                <p className="text-xs text-sidebar-foreground/70">{portalName}</p>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Help & Support">
                    <Link href="#">
                        <HelpCircle />
                        <span>Help & Support</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
