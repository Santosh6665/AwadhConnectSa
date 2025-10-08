
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addAdmissionApplication } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const admissionFormSchema = z.object({
  studentFullName: z.string().min(1, 'Full name is required'),
  dob: z.date({ required_error: 'Date of birth is required' }),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
  classForAdmission: z.string().min(1, 'Class for admission is required'),
  previousSchoolName: z.string().optional(),
  parentName: z.string().min(1, 'Parent/Guardian name is required'),
  relationshipWithStudent: z.string().optional(),
  contactNumber: z.string().min(10, 'Must be a valid 10-digit number').max(10, 'Must be a valid 10-digit number'),
  alternateContactNumber: z.string().optional(),
  emailAddress: z.string().email('Invalid email address').optional().or(z.literal('')), 
  residentialAddress: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pinCode: z.string().min(6, 'Must be a valid 6-digit PIN code').max(6, 'Must be a valid 6-digit PIN code'),
});

type AdmissionFormValues = z.infer<typeof admissionFormSchema>;

const classes = ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'];

export default function AdmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionFormSchema),
    defaultValues: {
        studentFullName: '',
        gender: undefined,
        classForAdmission: undefined,
        previousSchoolName: '',
        parentName: '',
        relationshipWithStudent: '',
        contactNumber: '',
        alternateContactNumber: '',
        emailAddress: '',
        residentialAddress: '',
        city: '',
        state: '',
        pinCode: '',
    },
  });

  const onSubmit = async (data: AdmissionFormValues) => {
    setIsSubmitting(true);
    setSubmissionStatus(null);
    try {
        const applicationData = {
            ...data,
            dob: data.dob.toISOString(),
        };
      await addAdmissionApplication(applicationData);
      setSubmissionStatus('success');
      form.reset();
    } catch (error) {
      console.error("Admission form submission failed:", error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionStatus === 'success') {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <Check className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Application Submitted!</h3>
            <p className="text-muted-foreground">Your admission form has been successfully submitted. Our team will review it and get back to you shortly.</p>
            <Link href="/">
                <Button className="mt-6">Go to Home</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
                <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-medium text-primary">Student Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="studentFullName" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Full Name <span className="text-red-500">*</span></FormLabel><FormControl><Input placeholder="Enter student's full name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="dob" control={form.control} render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                            <Popover><PopoverTrigger asChild>
                            <FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button></FormControl></PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover>
                            <FormMessage /></FormItem>
                        )} />
                         <FormField name="gender" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Gender <span className="text-red-500">*</span></FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        <FormField name="classForAdmission" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Class for Admission <span className="text-red-500">*</span></FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger></FormControl>
                            <SelectContent><div className="max-h-60 overflow-y-auto">{classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</div></SelectContent></Select><FormMessage /></FormItem>
                        )} />
                         <FormField name="previousSchoolName" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Previous School Name</FormLabel><FormControl><Input placeholder="Optional" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-medium text-primary">Parent/Guardian Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField name="parentName" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Parent/Guardian Name <span className="text-red-500">*</span></FormLabel><FormControl><Input placeholder="Enter parent/guardian's name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="relationshipWithStudent" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Relationship with Student</FormLabel><FormControl><Input placeholder="e.g., Father, Mother, Guardian" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="contactNumber" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Contact Number <span className="text-red-500">*</span></FormLabel><FormControl><Input type="tel" placeholder="Enter 10-digit mobile number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="alternateContactNumber" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Alternate Contact Number</FormLabel><FormControl><Input type="tel" placeholder="Optional" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField name="emailAddress" control={form.control} render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="Optional, for communication" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                 <div className="space-y-4">
                    <h3 className="text-lg font-medium text-primary">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="residentialAddress" control={form.control} render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Residential Address <span className="text-red-500">*</span></FormLabel><FormControl><Textarea placeholder="Enter full residential address" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField name="city" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>City <span className="text-red-500">*</span></FormLabel><FormControl><Input placeholder="Enter city" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="state" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>State <span className="text-red-500">*</span></FormLabel><FormControl><Input placeholder="Enter state" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="pinCode" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Pin Code <span className="text-red-500">*</span></FormLabel><FormControl><Input type="tel" placeholder="Enter 6-digit PIN code" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>
                
                {submissionStatus === 'error' && (
                    <p className="text-sm text-red-500 text-center">Failed to submit the form. Please check your connection and try again.</p>
                )}
                
                <div className="pt-6 flex justify-end gap-4">
                    <Link href="/">
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Application
                    </Button>
                </div>
            </form>
        </Form>
    </div>
  );
}
