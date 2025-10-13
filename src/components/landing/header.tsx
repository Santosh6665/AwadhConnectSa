
'use client';

import Link from 'next/link';
import { Menu, User, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '#about' },
  { label: 'Academics', href: '#academics' },
  { label: 'Admissions', href: '#admissions' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Notices', href: '#notices' },
  { label: 'Contact Us', href: '#contact' },
];

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user && user.name) {
      setUserName(user.name);
    }
  }, [user]);

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/dashboard';
      case 'parent':
        return '/parent/dashboard';
      default:
        return '/';
    }
  };

  const getUserInitial = () => {
    if (!userName) return '';
    return userName.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Mobile Header */}
        <div className="flex w-full items-center justify-between md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open main menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                  <SheetTitle className="sr-only">Main Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                      Main navigation links for Awadh Inter College.
                  </SheetDescription>
                  <div className="flex items-center justify-between p-4 border-b">
                      <Link href="/" className="flex items-center space-x-2">
                          <Image src="/logo.png" alt="School Logo" width={32} height={32} className="h-8 w-8" />
                          <span className="font-bold font-headline text-lg">Awadh Inter College</span>
                      </Link>
                  </div>
              </SheetHeader>
              <nav className="flex flex-col p-4 space-y-4">
                  {navItems.map((item) => (
                      <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-lg font-medium transition-colors hover:text-primary"
                      >
                          {item.label}
                      </Link>
                  ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="School Logo" width={32} height={32} className="h-8 w-8" />
            <span className="font-bold font-headline text-lg">Awadh Inter College</span>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer h-9 w-9">
                  <AvatarFallback>{getUserInitial()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{userName || 'My Account'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()} className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Login</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link href="/unified-login">Login</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden w-full items-center md:flex">
            <div className="flex-1 flex justify-start">
                <Link href="/" className="flex items-center space-x-2">
                    <Image src="/logo.png" alt="School Logo" width={32} height={32} className="h-8 w-8" />
                    <span className="font-bold font-headline text-lg">Awadh Inter College</span>
                </Link>
            </div>

            <nav className="flex justify-center items-center space-x-6 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-primary hover-gradient-underline pb-1"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            <div className="flex-1 flex items-center justify-end space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarFallback>{getUserInitial()}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{userName || 'My Account'}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()} className="flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/unified-login">
                    <User className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
              )}
            </div>
        </div>
      </div>
    </header>
  );
}
