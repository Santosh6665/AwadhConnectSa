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
  BookOpenCheck,
  CalendarDays,
  Settings,
  Presentation,
  Book,
  FileText,
  HelpCircle,
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
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'parent', 'student'] },
  { href: '/dashboard/admin/students', label: 'Manage Students', icon: Users, roles: ['admin'] },
  { href: '/dashboard/admin/teachers', label: 'Manage Teachers', icon: BookUser, roles: ['admin'] },
  { href: '/dashboard/admin/fees', label: 'Fee Management', icon: Banknote, roles: ['admin'] },
  { href: '/dashboard/admin/attendance', label: 'Attendance', icon: UserCheck, roles: ['admin'] },
  { href: '/dashboard/teacher/attendance', label: 'Student Attendance', icon: UserCheck, roles: ['teacher'] },
  { href: '/dashboard/teacher/results', label: 'Upload Results', icon: BookOpenCheck, roles: ['teacher'] },
  { href: '/dashboard/teacher/materials', label: 'Study Materials', icon: Book, roles: ['teacher'] },
  { href: '/dashboard/student/results', label: 'My Results', icon: BookOpenCheck, roles: ['student', 'parent'] },
  { href: '/dashboard/student/attendance', label: 'My Attendance', icon: UserCheck, roles: ['student', 'parent'] },
  { href: '/dashboard/student/fees', label: 'My Fees', icon: Banknote, roles: ['student', 'parent'] },
  { href: '/dashboard/student/materials', label: 'Study Materials', icon: Book, roles: ['student'] },
  { href: '/dashboard/common/events', label: 'Events & Notices', icon: CalendarDays, roles: ['admin', 'teacher', 'parent', 'student'] },
  { href: '/dashboard/admin/reports', label: 'Reports', icon: Presentation, roles: ['admin'] },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export default function SidebarNav({ role }: { role: UserRole }) {
  const getHref = (href: string) => {
    if (href === '/dashboard') return `/dashboard/${role}`;
    if (href.startsWith('/dashboard/common')) return href.replace('/common', `/${role}`);
    if (href.startsWith('/dashboard/student')) return href.replace('/student', `/${role}`);
    return href;
  }

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <GraduationCap className="size-8 text-sidebar-primary" />
            <div className="flex flex-col">
                <h3 className="text-lg font-headline font-semibold text-sidebar-primary">AwadhConnect</h3>
                <p className="text-xs text-sidebar-foreground/70">School Management</p>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild tooltip={item.label}>
                <Link href={getHref(item.href)}>
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
