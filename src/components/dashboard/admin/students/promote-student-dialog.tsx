

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
import type { Student, FeeStructure } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getFeeStructure } from '@/lib/firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

const calculateCurrentDues = (student: Student, defaultFeeStructure: { [key: string]: FeeStructure } | null) => {
    const studentFeeData = student.fees?.[student.className];
    if (!studentFeeData) return 0;
    
    const structureToUse = studentFeeData.structure || defaultFeeStructure?.[student.className];
    if (!structureToUse) return 0;

    const annualFee = Object.values(structureToUse).reduce((sum, head) => sum + (head.amount * head.months), 0);
    const totalPaid = (studentFeeData.transactions || []).reduce((sum, tx) => sum + tx.amount, 0);
    const concession = studentFeeData.concession || 0;
    
    return Math.max(0, annualFee - concession - totalPaid);
};

export default function PromoteStudentDialog({ isOpen, onOpenChange, student, onSave, isSaving }: PromoteStudentDialogProps) {
  const [defaultFeeStructure, setDefaultFeeStructure] = React.useState<{[key: string]: FeeStructure} | null>(null);
  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      carryForwardDues: true,
    },
  });

  React.useEffect(() => {
    getFeeStructure().then(setDefaultFeeStructure);
  }, []);

  const sessionOptions = React.useMemo(() => generateNextSessions(student?.session || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`), [student?.session]);
  
  const currentDues = React.useMemo(() => {
    if (!student || !defaultFeeStructure) return 0;
    return calculateCurrentDues(student, defaultFeeStructure);
  }, [student, defaultFeeStructure]);

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

  const totalDuesToCarry = currentDues + (student.previousDue || 0);

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
            
            <Alert variant="destructive">
                <AlertDescription className="grid grid-cols-2 gap-x-4">
                    <div className="font-semibold">Current Class Dues:</div>
                    <div className="font-mono text-right">₹{currentDues.toLocaleString()}</div>
                    <div className="font-semibold">Previous Dues:</div>
                    <div className="font-mono text-right">₹{(student.previousDue || 0).toLocaleString()}</div>
                </AlertDescription>
            </Alert>

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
                        <FormLabel>Carry forward total dues of ₹{totalDuesToCarry.toLocaleString()} to the new session</FormLabel>
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
