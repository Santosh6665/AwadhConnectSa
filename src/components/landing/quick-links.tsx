import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GraduationCap, Image as ImageIcon, Newspaper, User } from 'lucide-react';

const links = [
  {
    title: 'Admissions',
    description: 'Learn about our admission process and criteria.',
    href: '#',
    icon: GraduationCap,
    cta: 'Learn More',
  },
  {
    title: 'Gallery',
    description: 'Explore moments and events from our campus life.',
    href: '#',
    icon: ImageIcon,
    cta: 'View Gallery',
  },
  {
    title: 'Notices',
    description: 'Stay updated with the latest school announcements.',
    href: '#',
    icon: Newspaper,
    cta: 'Check Notices',
  },
  {
    title: 'Student Portal',
    description: 'Access your dashboard, check grades, and view attendance.',
    href: '#',
    icon: User,
    cta: 'Login',
  },
];

export default function QuickLinks() {
  return (
    <section id="gallery" className="container mx-auto px-4">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((link) => (
          <Card key={link.title} className="flex flex-col">
            <CardHeader className="flex-row items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                    <link.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-xl font-headline">{link.title}</CardTitle>
                    <p className="text-muted-foreground text-sm mt-1">{link.description}</p>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Button variant="secondary" className="w-full" asChild>
                <Link href={link.href}>{link.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
