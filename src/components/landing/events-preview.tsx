import { getEvents } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

export default async function EventsPreview() {
  const events = await getEvents();
  const upcomingEvents = events
    .filter(event => event.startDate.getTime() >= new Date().getTime())
    .slice(0, 3);

  return (
    <section id="events" className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold">Upcoming Events</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Join our vibrant school community. Here's a look at what's happening soon.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {upcomingEvents.map((event) => (
          <Card key={event.id} className="bg-white/50 dark:bg-black/50 backdrop-blur-sm overflow-hidden">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-lg p-3 w-20 h-20">
                        <span className="text-3xl font-bold">{format(event.startDate, 'dd')}</span>
                        <span className="text-sm font-medium uppercase">{format(event.startDate, 'MMM')}</span>
                    </div>
                    <div>
                        <CardTitle className="font-headline text-xl">{event.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {format(event.startDate, 'eeee, h:mm a')}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{event.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
