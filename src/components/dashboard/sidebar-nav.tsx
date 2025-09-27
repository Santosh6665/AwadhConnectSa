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
  { href: '/dashboard/parent/results', label: 'My Results', icon: BookOpenCheck, roles: [ 'parent'] },
  { href: '/dashboard/parent/attendance', label: 'My Attendance', icon: UserCheck, roles: ['parent'] },
  { href: '/dashboard/parent/fees', label: 'My Fees', icon: Banknote, roles: ['parent'] },
  { href: '/dashboard/student/results', label: 'My Results', icon: BookOpenCheck, roles: ['student'] },
  { href: '/dashboard/student/attendance', label: 'My Attendance', icon: UserCheck, roles: ['student'] },
  { href: '/dashboard/student/fees', label: 'My Fees', icon: Banknote, roles: ['student'] },
  { href: '/dashboard/student/materials', label: 'Study Materials', icon: Book, roles: ['student'] },
  { href: '/dashboard/common/events', label: 'Events & Notices', icon: CalendarDays, roles: ['admin', 'teacher', 'parent', 'student'] },
  { href: '/dashboard/admin/reports', label: 'Reports', icon: Presentation, roles: ['admin'] },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export default function SidebarNav({ role }: { role: UserRole }) {
  const getHref = (href: string) => {
    if (href === '/dashboard') return `/dashboard/${role}`;
    // No replacement needed for admin and teacher as their links are specific
    if (role === 'admin' || role === 'teacher') return href;

    // For parent and student, some links might be shared.
    // This logic ensures they point to the correct role-specific URL.
    if (href.startsWith('/dashboard/common')) return href.replace('/common', `/${role}`);
    
    return href;
  }

  const filteredNavItems = navItems.filter(item => {
    if (item.roles.includes(role)) {
      // Special case for parent role to not show student-only links
      if (role === 'parent' && item.href.startsWith('/dashboard/student')) {
          return false;
      }
      return true;
    }
    return false;
  });

  // Unique items by href to avoid duplicates for parent role
  const uniqueNavItems = filteredNavItems.reduce((acc, current) => {
    if (!acc.find((item) => item.href === current.href)) {
      acc.push(current);
    }
    return acc;
  }, [] as NavItem[]);


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
          {uniqueNavItems.map((item) => (
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
