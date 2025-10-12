
'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><Link href="/">Home</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/login">Admin Portal</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/teacher/login">Teacher Portal</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/student/login">Student Portal</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/parent/login">Parent Portal</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <User className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link href="/">Home</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/login">Admin Portal</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/teacher/login">Teacher Portal</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/student/login">Student Portal</Link></DropdownMenuItem>
                   <DropdownMenuItem asChild><Link href="/parent/login">Parent Portal</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </div>
      </div>
    </header>
  );
}
