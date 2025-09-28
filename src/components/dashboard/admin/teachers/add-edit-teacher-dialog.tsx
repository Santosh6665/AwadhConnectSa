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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, parse } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Teacher } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const teacherSchema = z.object({
  id: z.string().min(1, 'Teacher ID is required'),
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  dob: z.date({ required_error: 'Date of birth is required' }),
  gender: z.enum(['Male', 'Female', 'Other']),
  hireDate: z.date({ required_error: 'Hire date is required' }),
  designation: z.string().min(1, 'Designation is required'),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  classes: z.array(z.string()).min(1, 'At least one class is required'),
  status: z.enum(['Active', 'Archived']),
  salary: z.coerce.number().optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface AddEditTeacherDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  teacher: Teacher | null;
  onSave: (data: Teacher) => void;
  isSaving: boolean;
}

// Dummy data for multi-select, replace with actual data from Firestore later
const allSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science'];
const allclasses = ['6A', '6B', '7A', '7B', '8A', '8B', '9A', '9B', '10A', '10B', '11A', '12A'];

export default function AddEditTeacherDialog({ isOpen, onOpenChange, teacher, onSave, isSaving }: AddEditTeacherDialogProps) {
  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      id: '',
      name: '',
      email: '',
      phone: '',
      gender: 'Male',
      designation: '',
      subjects: [],
      classes: [],
      status: 'Active',
      salary: 0,
      dob: undefined,
      hireDate: undefined,
    },
  });

  const onSubmit = (data: TeacherFormData) => {
    onSave(data as any);
  };
  
  // Reset form when dialog opens with new data
  React.useEffect(() => {
    if (isOpen) {
      if (teacher) {
        form.reset({
          ...teacher,
          dob: typeof teacher.dob === 'string' ? parse(teacher.dob, 'dd/MM/yyyy', new Date()) : teacher.dob,
          hireDate: typeof teacher.hireDate === 'string' ? parse(teacher.hireDate, 'dd/MM/yyyy', new Date()) : teacher.hireDate,
          subjects: teacher.subjects || [],
          classes: teacher.classes || [],
        });
      } else {
        form.reset({
            id: '',
            name: '',
            email: '',
            phone: '',
            gender: 'Male',
            designation: '',
            subjects: [],
            classes: [],
            status: 'Active',
            dob: undefined,
            hireDate: undefined,
            salary: 0,
        });
      }
    }
  }, [isOpen, teacher, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{teacher ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
          <DialogDescription>
            {teacher ? "Update the teacher's profile." : 'Fill in the details to add a new teacher.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. T05" {...field} disabled={!!teacher} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 12345 67890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown-nav"
                          fromYear={1950}
                          toYear={new Date().getFullYear() - 18}
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1930-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Hire Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown-nav"
                          fromYear={2000}
                          toYear={new Date().getFullYear()}
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Math Teacher" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 75000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
              />
               <FormField
                control={form.control}
                name="subjects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjects</FormLabel>
                     <Controller
                        control={form.control}
                        name="subjects"
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start font-normal">
                                        {field.value?.length > 0 ? field.value.join(', ') : 'Select subjects'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto max-h-60 overflow-y-auto">
                                    <div className="flex flex-col gap-2 p-2">
                                    {allSubjects.map(subject => (
                                        <div key={subject} className="flex items-center gap-2">
                                            <Input
                                                type="checkbox"
                                                id={`subject-${subject}`}
                                                checked={field.value?.includes(subject)}
                                                onChange={() => {
                                                    const newValues = field.value?.includes(subject)
                                                        ? field.value.filter(v => v !== subject)
                                                        : [...(field.value || []), subject];
                                                    field.onChange(newValues);
                                                }}
                                                className="h-4 w-4"
                                            />
                                            <Label htmlFor={`subject-${subject}`} className="font-normal">{subject}</Label>
                                        </div>
                                    ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="classes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classes</FormLabel>
                     <Controller
                        control={form.control}
                        name="classes"
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start font-normal">
                                        {field.value?.length > 0 ? field.value.join(', ') : 'Select classes'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto max-h-60 overflow-y-auto">
                                    <div className="flex flex-col gap-2 p-2">
                                    {allclasses.map(cls => (
                                        <div key={cls} className="flex items-center gap-2">
                                            <Input
                                                type="checkbox"
                                                id={`class-${cls}`}
                                                checked={field.value?.includes(cls)}
                                                onChange={() => {
                                                    const newValues = field.value?.includes(cls)
                                                        ? field.value.filter(v => v !== cls)
                                                        : [...(field.value || []), cls];
                                                    field.onChange(newValues);
                                                }}
                                                className="h-4 w-4"
                                            />
                                            <Label htmlFor={`class-${cls}`} className="font-normal">{cls}</Label>
                                        </div>
                                    ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Archived">Archived</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Teacher
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
