
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Column 1: About */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline text-lg">Awadh Inter College</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A center for academic excellence and holistic development since 2012.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-headline font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="#about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#academics" className="text-sm text-muted-foreground hover:text-primary">Academics</Link></li>
              <li><Link href="#admissions" className="text-sm text-muted-foreground hover:text-primary">Admissions</Link></li>
              <li><Link href="#gallery" className="text-sm text-muted-foreground hover:text-primary">Gallery</Link></li>
              <li><Link href="#notices" className="text-sm text-muted-foreground hover:text-primary">Notices</Link></li>
              <li><Link href="#contact" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Portals */}
          <div>
            <h4 className="font-headline font-semibold mb-4">Portals</h4>
            <ul className="space-y-2">
              <li><Link href="/student/login" className="text-sm text-muted-foreground hover:text-primary">Student Portal</Link></li>
              <li><Link href="/teacher/login" className="text-sm text-muted-foreground hover:text-primary">Teacher Portal</Link></li>
              <li><Link href="/parent/login" className="text-sm text-muted-foreground hover:text-primary">Parent Portal</Link></li>
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 className="font-headline font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mt-1 mr-2 h-4 w-4 text-primary">📍</span>
                <span>Ghosiyari bazar, bansi, Siddharth Nagar, 272148</span>
              </li>
              <li className="flex items-center">
                 <span className="mr-2 h-4 w-4 text-primary">📞</span>
                <a href="tel:+916393071946" className="hover:text-primary">+91 6393071946</a>
              </li>
              <li className="flex items-center">
                 <span className="mr-2 h-4 w-4 text-primary">✉️</span>
                <a href="mailto:info@awadhcollege.edu" className="hover:text-primary">info@awadhcollege.edu</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Awadh Inter College. All rights reserved.</p>
          <p className="mt-1">
            For technical support, contact our IT Team at <a href="mailto:santoshx.dev@gmail.com" className="text-primary hover:underline">santoshx.dev@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
