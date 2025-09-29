
'use client';
import { useState, useEffect, useTransition } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { Event, Notice } from '@/lib/types';
import { getEvents, getNotices, addEvent, updateEvent, deleteEvent, addNotice, updateNotice, deleteNotice } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventNoticeList from '@/components/dashboard/admin/events/event-notice-list';
import AddEditEventNoticeDialog from '@/components/dashboard/admin/events/add-edit-event-notice-dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EventNoticeManagementPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Event | Notice | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'notices'>('events');

  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [eventData, noticeData] = await Promise.all([getEvents(), getNotices()]);
        setEvents(eventData);
        setNotices(noticeData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ title: "Error", description: "Could not fetch events and notices.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Event | Notice) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Event | Notice) => {
    const confirmation = window.confirm(`Are you sure you want to delete "${item.title}"?`);
    if (!confirmation) return;

    startTransition(async () => {
      try {
        if (activeTab === 'events') {
          await deleteEvent(item.id);
          setEvents(prev => prev.filter(e => e.id !== item.id));
        } else {
          await deleteNotice(item.id);
          setNotices(prev => prev.filter(n => n.id !== item.id));
        }
        toast({ title: "Success", description: "Item deleted successfully." });
      } catch (error) {
        console.error("Failed to delete item:", error);
        toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" });
      }
    });
  };

  const handleSave = async (data: Partial<Event> | Partial<Notice>) => {
    if (!user?.email) {
        toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
        return;
    }

    startTransition(async () => {
        try {
            if (selectedItem) { // Editing
                const updatedItem = { ...selectedItem, ...data, updatedAt: new Date().toISOString() };
                if (activeTab === 'events') {
                    await updateEvent(updatedItem.id, updatedItem as Partial<Event>);
                    setEvents(prev => prev.map(e => e.id === updatedItem.id ? updatedItem as Event : e));
                } else {
                    await updateNotice(updatedItem.id, updatedItem as Partial<Notice>);
                    setNotices(prev => prev.map(n => n.id === updatedItem.id ? updatedItem as Notice : n));
                }
                toast({ title: "Success", description: "Item updated successfully." });
            } else { // Adding new
                const newItem = { 
                    ...data, 
                    createdBy: user.email, 
                    createdAt: new Date().toISOString(), 
                    updatedAt: new Date().toISOString() 
                };

                if (activeTab === 'events') {
                    const id = await addEvent(newItem as Omit<Event, 'id'>);
                    setEvents(prev => [{ id, ...newItem } as Event, ...prev]);
                } else {
                    const id = await addNotice(newItem as Omit<Notice, 'id'>);
                    setNotices(prev => [{ id, ...newItem } as Notice, ...prev]);
                }
                toast({ title: "Success", description: "Item added successfully." });
            }
            setIsDialogOpen(false);
            setSelectedItem(null);
        } catch (error) {
            console.error("Failed to save item:", error);
            toast({ title: "Error", description: "Failed to save item.", variant: "destructive" });
        }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Event & Notice Management</h1>
        <p className="text-muted-foreground">Create, edit, and manage all school communications.</p>
      </div>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'events' | 'notices')}>
        <div className="flex justify-between items-center mb-4">
            <TabsList>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="notices">Notices</TabsTrigger>
            </TabsList>
            <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New {activeTab === 'events' ? 'Event' : 'Notice'}
            </Button>
        </div>
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Manage Events</CardTitle>
              <CardDescription>Schedule and manage all school events.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <EventNoticeList type="event" data={events} onEdit={handleEdit} onDelete={handleDelete} />}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notices">
          <Card>
            <CardHeader>
              <CardTitle>Manage Notices</CardTitle>
              <CardDescription>Post and manage school-wide announcements.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <EventNoticeList type="notice" data={notices} onEdit={handleEdit} onDelete={handleDelete} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AddEditEventNoticeDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={selectedItem}
        type={activeTab}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
