
'use client';
import {
  Bell,
  Home,
  LogOut,
  Settings,
  User,
  Calendar,
  GraduationCap,
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
  DropdownMenuGroup,
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
import type { UserRole } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/hooks/use-notifications';

function capitalize(str: string) {
    if(!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function DashboardHeader({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications(user?.role);
  
  const userAvatarFallback = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "U");
  const userDisplayName = user?.name || user?.email;
  const avatarSeed = user?.id || user?.email || 'default';
  const noticePath = `/${role}/dashboard/notices`;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      
      <div className="flex-1 items-center justify-center text-center sm:hidden">
          <Link href="/" className="flex items-center justify-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">Awadh Inter College</span>
          </Link>
      </div>

      <Breadcrumb className="hidden sm:flex">
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

      <div className="relative ml-auto hidden flex-1 grow-0 sm:flex">
         {/* Optional Search bar can go here */}
      </div>
      <DropdownMenu onOpenChange={(open) => { if (open) markAllAsRead(); }}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative hidden sm:inline-flex">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0">{unreadCount}</Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(item => {
                        const isEvent = 'startDate' in item;
                        return (
                            <DropdownMenuItem key={item.id} asChild>
                                <Link href={noticePath} className="flex items-start gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full mt-1">
                                        {isEvent ? <Calendar className="w-4 h-4 text-primary" /> : <Bell className="w-4 h-4 text-primary" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm whitespace-normal">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        )
                    })
                ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
                )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href={noticePath} className="justify-center">View All Notifications</Link>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            <Avatar>
                <AvatarImage src={`https://picsum.photos/seed/${avatarSeed}/100/100`} alt={userDisplayName || 'User'} />
                <AvatarFallback>{userAvatarFallback}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{userDisplayName}</DropdownMenuLabel>
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
