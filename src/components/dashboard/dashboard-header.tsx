'use client';
import {
  Bell,
  Home,
  LogOut,
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

  const userAvatarFallback = user?.email ? user.email.charAt(0).toUpperCase() : "A";

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
                <AvatarImage src={`https://picsum.photos/seed/admin/100/100`} alt={user?.email || 'Admin'} />
                <AvatarFallback>{userAvatarFallback}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
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
           <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4"/>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
