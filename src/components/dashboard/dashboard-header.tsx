'use client';
import {
  Bell,
  Home,
  LogOut,
  PanelLeft,
  Settings,
  User,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useAuth } from '@/contexts/auth-context';

function capitalize(str: string) {
    if(!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function DashboardHeader({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Redirect to the main login page after logout
    window.location.href = '/login';
  };

  const getRoleName = (role: UserRole) => {
    if (user?.email) return user.email;
    switch(role) {
      case 'admin': return 'Admin';
      case 'teacher': return 'Teacher';
      case 'parent': return 'Parent';
      case 'student': return 'Student';
      default: return 'User';
    }
  }

  const getAvatarFallback = (name: string) => {
    if (name.includes('@')) {
        return name.substring(0, 2).toUpperCase();
    }
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    }
    return parts[0].substring(0, 2);
  }

  const userName = getRoleName(role);
  const userAvatarFallback = getAvatarFallback(userName);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.map((segment, index) => (
             <React.Fragment key={segment}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    {index === segments.length - 1 ? (
                        <BreadcrumbPage>{capitalize(segment)}</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink asChild>
                            <Link href={`/${segments.slice(0, index + 1).join('/')}`}>
                                {capitalize(segment)}
                            </Link>
                        </BreadcrumbLink>
                    )}
                </BreadcrumbItem>
             </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="relative ml-auto flex-1 md:grow-0">
         {/* Optional Search bar can go here */}
      </div>
      <Button variant="outline" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0">3</Badge>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            <Avatar>
                <AvatarImage src={`https://picsum.photos/seed/${role}/100/100`} alt={userName} />
                <AvatarFallback>{userAvatarFallback}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{userName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4"/>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4"/>
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4"/>Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
