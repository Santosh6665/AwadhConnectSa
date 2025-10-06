
'use client';
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, CalendarIcon } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Event, Notice, EventNoticeCategory, NoticeAudience } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format } from 'date-fns';

const categories: EventNoticeCategory[] = ['Academic', 'Sports', 'Cultural', 'Holiday', 'General'];
const audiences: NoticeAudience[] = ['all', 'student', 'teacher', 'parent'];

const eventNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(categories),
  targetAudience: z.array(z.string()).min(1, 'At least one audience must be selected'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  date: z.date().optional(),
});

type FormData = z.infer<typeof eventNoticeSchema>;

interface AddEditDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: Event | Notice | null;
  type: 'event' | 'notice';
  onSave: (data: Partial<Event> | Partial<Notice>) => void;
  isSaving: boolean;
}

export default function AddEditEventNoticeDialog({ isOpen, onOpenChange, item, type, onSave, isSaving }: AddEditDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(eventNoticeSchema),
  });

  React.useEffect(() => {
    if (isOpen) {
      if (item) {
        form.reset({
          title: item.title,
          description: item.description,
          category: item.category,
          targetAudience: item.targetAudience,
          startDate: type === 'event' && (item as Event).startDate ? new Date((item as Event).startDate) : undefined,
          endDate: type === 'event' && (item as Event).endDate ? new Date((item as Event).endDate) : undefined,
          date: type === 'notice' && (item as Notice).date ? new Date((item as Notice).date) : undefined,
        });
      } else {
        form.reset({
          title: '',
          description: '',
          category: 'General',
          targetAudience: ['all'],
          startDate: new Date(),
          endDate: new Date(),
          date: new Date(),
        });
      }
    }
  }, [isOpen, item, type, form]);
  
  const onSubmit = (data: FormData) => {
    const finalData = {
        ...data,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        date: data.date?.toISOString(),
    };
    onSave(finalData as Partial<Event> | Partial<Notice>);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit' : 'Add'} {type === 'event' ? 'Event' : 'Notice'}</DialogTitle>
          <DialogDescription>
            Fill in the details for the {type}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <FormField name="title" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Annual Sports Day" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Detailed information..." {...field} rows={5} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="category" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField name="targetAudience" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Target Audience</FormLabel>
                        <div className="flex flex-wrap gap-4 pt-2">
                        {audiences.map((audience) => (
                            <div key={audience} className="flex items-center space-x-2">
                            <Checkbox
                                id={audience}
                                checked={field.value?.includes(audience)}
                                onCheckedChange={(checked) => {
                                let newAudiences = [...(field.value || [])];
                                if (audience === 'all') {
                                    newAudiences = checked ? ['all'] : [];
                                } else {
                                    newAudiences = newAudiences.filter(a => a !== 'all');
                                    if(checked) {
                                        newAudiences.push(audience);
                                    } else {
                                        newAudiences = newAudiences.filter(a => a !== audience);
                                    }
                                }
                                field.onChange(newAudiences);
                                }}
                            />
                            <Label htmlFor={audience}>{audience.charAt(0).toUpperCase() + audience.slice(1)}</Label>
                            </div>
                        ))}
                        </div>
                    <FormMessage />
                    </FormItem>
                )}/>
            </div>
            
            {type === 'event' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="startDate" control={form.control} render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className="font-normal w-full"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : 'Pick a date'}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                    )}/>
                    <FormField name="endDate" control={form.control} render={({ field }) => (
                       <FormItem className="flex flex-col"><FormLabel>End Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className="font-normal w-full"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : 'Pick a date'}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                    )}/>
                </div>
            ) : (
                 <FormField name="date" control={form.control} render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className="font-normal w-full md:w-1/2"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : 'Pick a date'}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                )}/>
            )}

            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
