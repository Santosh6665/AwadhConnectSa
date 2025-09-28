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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student, Class, Section, Parent } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format, parse } from 'date-fns';

const studentSchema = z.object({
  rollNo: z.string().min(1, 'Roll No is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.date({ required_error: 'Date of birth is required' }),
  gender: z.enum(['Male', 'Female', 'Other']),
  admissionNumber: z.string().min(1, 'Admission number is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  parentId: z.string().min(1, 'Parent is required'),
  feeStatus: z.enum(['Paid', 'Due', 'Partial']),
  status: z.enum(['Active', 'Archived']),
  session: z.string().min(1, 'Session is required'),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface AddEditStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  student: Student | null;
  onSave: (data: Student) => void;
  isSaving: boolean;
  classes: Class[];
  sections: Section[];
  parents: Parent[];
}


function DateDropdowns({ value, onChange, fromYear, toYear }: { value?: Date; onChange: (date: Date) => void; fromYear: number; toYear: number; }) {
  const day = value ? value.getDate().toString() : '';
  const month = value ? value.getMonth().toString() : '';
  const year = value ? value.getFullYear().toString() : '';

  const handleDateChange = (part: 'day' | 'month' | 'year', newValue: string) => {
    const newDay = part === 'day' ? Number(newValue) : Number(day) || 1;
    const newMonth = part === 'month' ? Number(newValue) : Number(month) || 0;
    const newYear = part === 'year' ? Number(newValue) : Number(year) || fromYear;

    const daysInNewMonth = new Date(newYear, newMonth + 1, 0).getDate();
    const finalDay = Math.min(newDay, daysInNewMonth);

    onChange(new Date(newYear, newMonth, finalDay));
  };


  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i.toString(), label: format(new Date(0, i), 'MMMM') }));
  const daysInMonth = (year && month !== '') ? new Date(Number(year), Number(month) + 1, 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

  return (
    <div className="flex gap-2">
      <Select value={day} onValueChange={(v) => handleDateChange('day', v)}><SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger><SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
      <Select value={month} onValueChange={(v) => handleDateChange('month', v)}><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger><SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select>
      <Select value={year} onValueChange={(v) => handleDateChange('year', v)}><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent></Select>
    </div>
  );
}


export default function AddEditStudentDialog({ isOpen, onOpenChange, student, onSave, isSaving, classes, sections, parents }: AddEditStudentDialogProps) {
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const { watch, setValue } = form;
  const watchedClassId = watch('classId');

  const filteredSections = React.useMemo(() => {
    return sections.filter(s => s.classId === watchedClassId);
  }, [sections, watchedClassId]);

  React.useEffect(() => {
    if (isOpen) {
      if (student) {
        form.reset({
          ...student,
          dob: parse(student.dob, 'dd/MM/yyyy', new Date()),
        });
      } else {
        const currentYear = new Date().getFullYear();
        form.reset({
          rollNo: '',
          firstName: '',
          lastName: '',
          dob: undefined,
          gender: 'Male',
          admissionNumber: `ADM-${Date.now()}`.slice(0,10),
          classId: '',
          sectionId: '',
          parentId: '',
          feeStatus: 'Due',
          status: 'Active',
          session: `${currentYear}-${currentYear + 1}`
        });
      }
    }
  }, [isOpen, student, form, classes, sections, parents]);
  
  const onSubmit = (data: StudentFormData) => {
    const finalData: Student = {
        ...(student || { id: '' }), // Keep existing id if editing
        ...data,
        dob: format(data.dob, 'dd/MM/yyyy'),
    };
    if (!student) {
        // For new students, create a password
        const birthYear = data.dob.getFullYear();
        finalData.password = `${data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1)}@${birthYear}`;
    }
    onSave(finalData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student Record' : 'New Admission'}</DialogTitle>
          <DialogDescription>
            {student ? "Update the student's information." : 'Fill in the details for the new student.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="admissionNumber" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Admission Number</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="rollNo" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Roll No.</FormLabel><FormControl><Input placeholder="e.g., 10A01" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="session" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Session</FormLabel><FormControl><Input placeholder="e.g., 2024-25" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="firstName" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="lastName" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField name="gender" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )}/>
              <FormField name="dob" control={form.control} render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel><DateDropdowns value={field.value} onChange={field.onChange} fromYear={1990} toYear={new Date().getFullYear() - 3} /><FormMessage /></FormItem>
              )}/>
              <FormField name="classId" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Class</FormLabel><Select onValueChange={(value) => { field.onChange(value); setValue('sectionId', ''); }} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl><SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )}/>
              <FormField name="sectionId" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Section</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger></FormControl><SelectContent>{filteredSections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )}/>
              <FormField name="parentId" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Parent</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Parent" /></SelectTrigger></FormControl><SelectContent>{parents.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )}/>
               <FormField name="feeStatus" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Fee Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Due">Due</SelectItem><SelectItem value="Partial">Partial</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )}/>
               <FormField name="status" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Archived">Archived</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )}/>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {student ? 'Save Changes' : 'Admit Student'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
