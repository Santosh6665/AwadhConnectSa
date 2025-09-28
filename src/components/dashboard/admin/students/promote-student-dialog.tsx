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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, Class, Section } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const promotionSchema = z.object({
  newClassId: z.string().min(1, 'New Class is required'),
  newSectionId: z.string().min(1, 'New Section is required'),
  newSession: z.string().min(1, 'New Session is required'),
  carryOverDues: z.boolean().default(false),
});

type PromotionFormData = z.infer<typeof promotionSchema>;

interface PromoteStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  student: Student | null;
  onSave: (data: PromotionFormData) => void;
  isSaving: boolean;
  classes: Class[];
  sections: Section[];
}

export default function PromoteStudentDialog({ isOpen, onOpenChange, student, onSave, isSaving, classes, sections }: PromoteStudentDialogProps) {
  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
        carryOverDues: false,
    }
  });

  const { watch, setValue } = form;
  const watchedClassId = watch('newClassId');

  const filteredSections = React.useMemo(() => {
    return sections.filter(s => s.classId === watchedClassId);
  }, [sections, watchedClassId]);

  React.useEffect(() => {
    if (student) {
      const currentSessionYear = parseInt(student.session.split('-')[0]);
      const newSession = `${currentSessionYear + 1}-${currentSessionYear + 2}`;
      form.setValue('newSession', newSession);
    }
  }, [student, form]);
  
  if (!student) return null;

  const currentClass = classes.find(c => c.id === student.classId)?.name;
  const currentSection = sections.find(s => s.id === student.sectionId)?.name;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote Student: {student.firstName} {student.lastName}</DialogTitle>
          <DialogDescription>
            Promote this student to the next class for the new academic session.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            <div className='space-y-2'>
                <Label>Current Status</Label>
                <div className="text-sm p-3 bg-muted rounded-md">
                    <p><strong>Student:</strong> {student.firstName} {student.lastName}</p>
                    <p><strong>Current Class:</strong> {currentClass}-{currentSection}</p>
                    <p><strong>Current Session:</strong> {student.session}</p>
                </div>
            </div>

            <FormField name="newSession" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>New Session</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
            )}/>

            <div className="grid grid-cols-2 gap-4">
                 <FormField name="newClassId" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>New Class</FormLabel><Select onValueChange={(value) => { field.onChange(value); setValue('newSectionId', ''); }}><FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl><SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField name="newSectionId" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>New Section</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger></FormControl><SelectContent>{filteredSections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )}/>
            </div>
            
            <FormField
                control={form.control}
                name="carryOverDues"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>Carry Over Due Fees</FormLabel>
                        <p className="text-sm text-muted-foreground">
                         If checked, any outstanding fee balance from the current session will be added to the new session's fees.
                        </p>
                    </div>
                    </FormItem>
                )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Promotion
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
