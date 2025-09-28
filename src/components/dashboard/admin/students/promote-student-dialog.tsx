
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
import type { Student } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const promotionSchema = z.object({
  newSession: z.string().min(1, 'New session is required'),
  newClassName: z.string().min(1, 'New class is required'),
  newSectionName: z.string().min(1, 'New section is required'),
  carryForwardDues: z.boolean().default(true),
});

type PromotionFormData = z.infer<typeof promotionSchema>;

interface PromoteStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  student: Student;
  onSave: (
    admissionNumber: string,
    newSession: string,
    newClassName: string,
    newSectionName: string,
    carryForwardDues: boolean
  ) => void;
  isSaving: boolean;
}

const classOptions = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
const sectionOptions = ["A", "B", "C"];

const generateNextSessions = (currentSession: string) => {
    const [startYear] = currentSession.split('-').map(Number);
    return Array.from({ length: 3 }, (_, i) => `${startYear + i + 1}-${startYear + i + 2}`);
};

export default function PromoteStudentDialog({ isOpen, onOpenChange, student, onSave, isSaving }: PromoteStudentDialogProps) {
  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      carryForwardDues: true,
    },
  });

  const sessionOptions = React.useMemo(() => generateNextSessions(student?.session || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`), [student?.session]);

  React.useEffect(() => {
    if (student) {
        const nextSession = sessionOptions[0];
        form.reset({
            newSession: nextSession,
            newClassName: student.className,
            newSectionName: student.sectionName,
            carryForwardDues: true,
        });
    }
  }, [student, form, sessionOptions]);
  
  const onSubmit = (data: PromotionFormData) => {
    onSave(student.admissionNumber, data.newSession, data.newClassName, data.newSectionName, data.carryForwardDues);
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Promote Student: {student.firstName}</DialogTitle>
          <DialogDescription>
            Move the student to the next academic session.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <p className="text-sm font-medium">Current Details</p>
                <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                    Session: {student.session} | Class: {student.className}-{student.sectionName}
                </div>
            </div>

            <FormField name="newSession" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>New Session</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Session" /></SelectTrigger></FormControl><SelectContent>{sessionOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )}/>

            <div className="grid grid-cols-2 gap-4">
                <FormField name="newClassName" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>New Class</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl><SelectContent>{classOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField name="newSectionName" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>New Section</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger></FormControl><SelectContent>{sectionOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )}/>
            </div>

            <FormField name="carryForwardDues" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>Carry forward previous year's due fees</FormLabel>
                        <FormMessage />
                    </div>
                </FormItem>
            )}/>
            
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
