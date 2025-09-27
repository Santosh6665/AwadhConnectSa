import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <GraduationCap className="h-5 w-5 text-muted-foreground" />
          <span className="font-bold font-headline text-md text-muted-foreground">AwadhConnect</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} AwadhConnect. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
