
'use client';

import type { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/use-notifications';

interface NoticeBoardProps {
  role: UserRole;
}

export default function NoticeBoard({ role }: NoticeBoardProps) {
  const { notices, events, loading } = useNotifications(role);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="notices">
      <TabsList className="mb-4">
        <TabsTrigger value="notices">Notices</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
      </TabsList>
      <TabsContent value="notices">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {notices.length > 0 ? notices.map((notice) => (
            <Card key={notice.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg"><Bell className="w-6 h-6 text-primary" /></div>
                        <div>
                            <CardTitle className="text-lg font-headline">{notice.title}</CardTitle>
                            <p className="text-xs text-muted-foreground">{format(new Date(notice.date), 'dd MMM yyyy')}</p>
                        </div>
                    </div>
                    <Badge variant="secondary">{notice.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{notice.description}</CardDescription>
              </CardContent>
            </Card>
          )) : <p className="text-muted-foreground col-span-full text-center">No notices available.</p>}
        </div>
      </TabsContent>
      <TabsContent value="events">
         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.length > 0 ? events.map((event) => (
            <Card key={event.id} className="flex flex-col">
              <CardHeader>
                 <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg"><Calendar className="w-6 h-6 text-primary" /></div>
                        <div>
                            <CardTitle className="text-lg font-headline">{event.title}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {format(new Date(event.startDate), 'dd MMM')} - {format(new Date(event.endDate), 'dd MMM yyyy')}
                            </p>
                        </div>
                    </div>
                    <Badge variant="secondary">{event.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{event.description}</CardDescription>
              </CardContent>
            </Card>
          )) : <p className="text-muted-foreground col-span-full text-center">No events scheduled.</p>}
        </div>
      </TabsContent>
    </Tabs>
  );
}
