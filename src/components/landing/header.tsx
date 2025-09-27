'use client';

import Link from 'next/link';
import { GraduationCap, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Notices', href: '#notices' },
  { label: 'Events', href: '#events' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">AwadhConnect</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <User className="mr-2 h-4 w-4" />
                Login
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Select Your Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login">Admin Login</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/teacher/login">Teacher Login</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                     <Link href="/" className="flex items-center space-x-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline text-lg">AwadhConnect</span>
                      </Link>
                  </div>
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
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="w-full justify-start text-lg">Login</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Admin Login</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/teacher/login" onClick={() => setMobileMenuOpen(false)}>Teacher Login</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
