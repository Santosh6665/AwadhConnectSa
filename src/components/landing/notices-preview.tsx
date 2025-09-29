import { getNotices } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function NoticesPreview() {
  const notices = await getNotices(4);

  return (
    <section id="notices" className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold">Latest Notices</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Stay updated with the latest announcements and information from the school administration.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {notices.map((notice) => (
          <Card key={notice.id} className="flex flex-col bg-white/50 dark:bg-black/50 backdrop-blur-sm">
            <CardHeader className="flex-row gap-4 items-center">
                <div className="bg-primary/10 p-3 rounded-full">
                    <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-lg font-headline">{notice.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{format(new Date(notice.date), 'dd MMM yyyy')}</p>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{notice.description.substring(0, 100)}...</CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="p-0">Read More</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {notices.length > 3 && (
        <div className="text-center mt-8">
            <Button asChild variant="outline">
                <Link href="/dashboard/student/notices">View All Notices</Link>
            </Button>
        </div>
      )}
    </section>
  );
}
