
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Notice, Event, UserRole } from '@/lib/types';
import { getNotices, getEvents } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface NoticeBoardProps {
  role: UserRole;
}

export default function NoticeBoard({ role }: NoticeBoardProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [noticeData, eventData] = await Promise.all([getNotices(), getEvents()]);
        setNotices(noticeData);
        setEvents(eventData);
      } catch (error) {
        console.error("Failed to fetch notices and events:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredNotices = useMemo(() => {
    return notices.filter(notice => notice.targetAudience.includes('all') || notice.targetAudience.includes(role));
  }, [notices, role]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => event.targetAudience.includes('all') || event.targetAudience.includes(role));
  }, [events, role]);

  if (isLoading) {
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
          {filteredNotices.length > 0 ? filteredNotices.map((notice) => (
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
          {filteredEvents.length > 0 ? filteredEvents.map((event) => (
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
